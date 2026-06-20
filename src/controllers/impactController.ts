import { Request, Response } from "express";
import { getAuth } from "../middleware/auth";
import { ImpactLog } from "../models/ImpactLog";

export async function getImpactLogList(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const logs = await ImpactLog.find({ clerkId: userId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("getImpactLogList error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch impact logs" });
  }
}