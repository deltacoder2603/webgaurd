import jwt from "jsonwebtoken"; // Importing the default export
import type { JwtPayload } from "jsonwebtoken"; // Importing types

import type { NextFunction, Request, Response } from "express";
import { JWT_PUBLIC_KEY } from "./config";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_PUBLIC_KEY) as JwtPayload; // Explicitly cast to JwtPayload

        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        (req as any).userId = decoded.sub; // Ensure req.userId is assigned safely

        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
