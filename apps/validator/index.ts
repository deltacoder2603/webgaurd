import "dotenv/config";
import { Keypair } from "@solana/web3.js";
import { randomUUIDv7 } from "bun";
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common/types";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const CALLBACKS: { [callbackId: string]: (data: SignupOutgoingMessage) => void } = {};
let validatorId: string | null = null;

// ✅ Load PRIVATE_KEY from environment and validate format
if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not found in environment variables!");
}

let keypair: Keypair;
try {
    const rawKey = JSON.parse(process.env.PRIVATE_KEY!);
    if (!Array.isArray(rawKey) || rawKey.length !== 64) {
        throw new Error("❌ Invalid secret key format! Expected 64-byte array.");
    }
    keypair = Keypair.fromSecretKey(Uint8Array.from(rawKey));
    console.log("🟢 Keypair loaded successfully!");
    console.log("Public Key:", keypair.publicKey.toBase58());
} catch (error) {
    console.error("❌ Error loading keypair:", error);
    process.exit(1);
}

// ✅ WebSocket connection setup
async function main() {
    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = async (event) => {
        const data: OutgoingMessage = JSON.parse(event.data);

        if (data.type === "signup") {
            CALLBACKS[data.data.callbackId]?.(data.data);
            delete CALLBACKS[data.data.callbackId];
        } else if (data.type === "validate") {
            await validateHandler(ws, data.data, keypair);
        }
    };

    ws.onopen = async () => {
        const callbackId = randomUUIDv7();
        CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
            validatorId = data.validatorId;
        };

        const signedMessage = await signMessage(
            `Signed message for ${callbackId}, ${keypair.publicKey.toBase58()}`,
            keypair
        );

        ws.send(
            JSON.stringify({
                type: "signup",
                data: {
                    callbackId,
                    ip: "127.0.0.1",
                    publicKey: keypair.publicKey.toBase58(),
                    signedMessage,
                },
            })
        );
    };
}

// ✅ Validation handler
async function validateHandler(ws: WebSocket, { url, callbackId, websiteId }: ValidateOutgoingMessage, keypair: Keypair) {
    console.log(`🔍 Validating ${url}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackId}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        console.log(`✅ ${url} responded with status ${status}`);

        ws.send(
            JSON.stringify({
                type: "validate",
                data: {
                    callbackId,
                    status: status === 200 ? "Good" : "Bad",
                    latency,
                    websiteId,
                    validatorId,
                    signedMessage: signature,
                },
            })
        );
    } catch (error) {
        console.error(`❌ Error validating ${url}:`, error);

        ws.send(
            JSON.stringify({
                type: "validate",
                data: {
                    callbackId,
                    status: "Bad",
                    latency: 1000,
                    websiteId,
                    validatorId,
                    signedMessage: signature,
                },
            })
        );
    }
}

// ✅ Message signing
async function signMessage(message: string, keypair: Keypair) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return JSON.stringify(Array.from(signature));
}

// ✅ Start the validator
main();

setInterval(() => {
    console.log("⏳ Validator running...");
}, 10000);
