import express from "express";
import type { Express, Request, Response } from "express"; 
import { prismaClient } from "db/client";
import cors from "cors";
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const app: Express = express(); // ✅ Explicit type definition
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(
  cors({
    origin: ["http://localhost:3000"], // Adjust for production
    credentials: true,
  })
);

app.use(express.json());

// 🔹 Health Check
app.get("/health", async (req: Request, res: Response) => {
  try {
    await prismaClient.$connect();
    res.json({ message: "🟢 API is running", db: "🟢 Connected" });
  } catch (error) {
    console.error("🔴 Database Connection Error:", error);
    res.status(500).json({ error: "Database Connection Error" });
  }
});

// 🔹 API: Create Website
app.post("/api/v1/website", async (req: Request, res: Response) => {
  try {
    const { userId, url } = req.body;

    console.log(`🟢 Creating website for user: ${userId}, URL: ${url}`);

    const data = await prismaClient.website.create({
      data: { userId, url },
    });

    res.json({ id: data.id });
  } catch (error) {
    console.error("🔴 Error creating website:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 API: Get Website Status
app.get("/api/v1/website/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const websiteId = req.query.websiteId as string;

    if (!websiteId) {
      res.status(400).json({ error: "Missing websiteId parameter" });
      return;
    }

    console.log(`🟢 Fetching status for website ID: ${websiteId}`);

    const website = await prismaClient.website.findFirst({
      where: { id: websiteId, disabled: false },
      include: { ticks: true },
    });

    if (!website) {
      console.warn(`🔴 No website found for ID: ${websiteId}`);
      res.status(404).json({ error: "Website not found" });
      return;
    }

    // Calculate uptime percentage
    const uptimeCount = website.ticks.filter((tick) => tick.status.toLowerCase() === "good").length;
    const uptimePercentage = website.ticks.length > 0 ? (uptimeCount / website.ticks.length) * 100 : 0;

    // Format the response
    res.json({
      id: website.id,
      url: website.url,
      status: website.ticks.length > 0 ? website.ticks[0].status.toLowerCase() : "unknown",
      uptimePercentage: uptimePercentage.toFixed(1),
      lastChecked: website.ticks.length > 0 ? website.ticks[0].createdAt : "Never",
      uptimeTicks: website.ticks.map((tick) => tick.status.toLowerCase()),
    });
  } catch (error) {
    console.error("🔴 Error fetching website status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// 🔹 API: Get All Websites
app.get("/api/v1/websites", async (req: Request, res: Response) => {
  try {
    console.log("🟢 Fetching all websites");

    const websites = await prismaClient.website.findMany({
      where: { disabled: false },
      include: { ticks: true },
    });

    res.json({ websites });
  } catch (error) {
    console.error("🔴 Error fetching websites:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 API: Delete Website
app.delete("/api/v1/website/:websiteId", async (req, res) => {
  try {
    const { websiteId } = req.params;

    if (!websiteId) {
      res.status(400).json({ error: "Website ID is required" });
      return;
    }

    const website = await prismaClient.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      res.status(404).json({ error: "Website not found" });
      return;
    }

    await prismaClient.website.update({
      where: { id: websiteId },
      data: { disabled: true },
    });

    res.json({ 
      success: true,
      message: "Website deleted successfully",
    });

  } catch (error) {
    console.error("🔴 Error deleting website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 API: Payout (Placeholder)
app.post("/api/v1/payout/:validatorId", async (req: Request, res: Response) => {
  res.json({ message: "Payout logic to be implemented" });
});

// 🔹 Start the server
const PORT = 8080;
app.listen(PORT, async () => {
  try {
    await prismaClient.$connect();
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (error) {
    console.error("🔴 Failed to connect to the database:", error);
  }
});
