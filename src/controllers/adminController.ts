import { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { AIHistory } from "../models/AIHistory";

export async function getAdminStats(req: Request, res: Response) {
  try {
    const [totalUsers, totalProducts, totalAIQueries, avgEcoScoreAgg] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      AIHistory.countDocuments(),
      Product.aggregate([{ $group: { _id: null, avg: { $avg: "$ecoScore" } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalAIQueries,
        avgEcoScore: avgEcoScoreAgg[0]?.avg ? Math.round(avgEcoScoreAgg[0].avg) : 0,
      },
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
}

export async function getUserGrowth(req: Request, res: Response) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const users = await User.find({ createdAt: { $gte: since } }).select("createdAt");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("getUserGrowth error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch growth data" });
  }
}

export async function getCategoryBreakdown(req: Request, res: Response) {
  try {
    const breakdown = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    console.error("getCategoryBreakdown error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category breakdown" });
  }
}