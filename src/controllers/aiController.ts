import { Request, Response } from "express";
import { getAuth } from "../middleware/auth";
import { AIHistory } from "../models/AIHistory";

export async function getAIHistoryList(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const history = await AIHistory.find({ clerkId: userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("getAIHistoryList error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch AI history" });
  }
}