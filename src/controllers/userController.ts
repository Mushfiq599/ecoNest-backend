import { Request, Response } from "express";
import { User } from "../models/User";
import { getAuth } from "../middleware/auth";
import { AIHistory } from "../models/AIHistory";
import { ImpactLog } from "../models/ImpactLog";

export async function syncUserFromClerk(req: Request, res: Response) {
  try {
    const { clerkId, email, name, imageUrl, eventType } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ success: false, message: "clerkId and email are required" });
    }

    if (eventType === "user.deleted") {
      await User.findOneAndDelete({ clerkId });
      return res.status(200).json({ success: true, message: "User removed" });
    }

    // Upsert. Role is set with $setOnInsert only — a later profile sync
    // (e.g. user.updated) can never silently reset someone's role to "user".
    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: { email, name: name ?? "", imageUrl: imageUrl ?? "" },
        $setOnInsert: { role: "user" },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("syncUserFromClerk error:", error);
    return res.status(500).json({ success: false, message: "Failed to sync user" });
  }
}
export async function getMyStats(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const [aiSearchCount, latestImpact, user] = await Promise.all([
      AIHistory.countDocuments({ clerkId: userId }),
      ImpactLog.findOne({ clerkId: userId }).sort({ createdAt: -1 }),
      User.findOne({ clerkId: userId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        aiSearchCount,
        latestImpactScore: latestImpact?.overallScore ?? null,
        carbonFootprint: latestImpact?.carbonFootprint ?? null,
        memberSince: user?.createdAt ?? null,
      },
    });
  } catch (error) {
    console.error("getMyStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}