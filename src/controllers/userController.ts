import { Request, Response } from "express";
import { User } from "../models/User";
import { getAuth } from "../middleware/auth";
import { AIHistory } from "../models/AIHistory";
import { ImpactLog } from "../models/ImpactLog";
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search, role, page = "1", limit = "10" } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "all") filter.role = role;

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Number(limit) || 10, 50);

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * pageLimit).limit(pageLimit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: { page: pageNum, limit: pageLimit, total, hasMore: pageNum * pageLimit < total },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await clerk.users.updateUserMetadata(user.clerkId, { publicMetadata: { role } });
    user.role = role;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await clerk.users.deleteUser(user.clerkId);
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
}

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