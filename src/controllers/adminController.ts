import { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { AIHistory } from "../models/AIHistory";
import { Settings } from "../models/Settings";

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

export async function getAllAIHistoryAdmin(req: Request, res: Response) {
  try {
    const { type, page = "1", limit = "15" } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};
    if (type && type !== "all") filter.type = type;

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Number(limit) || 15, 100);

    const [items, total] = await Promise.all([
      AIHistory.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * pageLimit).limit(pageLimit),
      AIHistory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: { page: pageNum, limit: pageLimit, total, hasMore: pageNum * pageLimit < total },
    });
  } catch (error) {
    console.error("getAllAIHistoryAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch AI logs" });
  }
}

export async function getEcoScoreDistribution(req: Request, res: Response) {
  try {
    const buckets = [
      { range: "0-20", min: 0, max: 20 },
      { range: "21-40", min: 21, max: 40 },
      { range: "41-60", min: 41, max: 60 },
      { range: "61-80", min: 61, max: 80 },
      { range: "81-100", min: 81, max: 100 },
    ];

    const counts = await Promise.all(
      buckets.map((b) => Product.countDocuments({ ecoScore: { $gte: b.min, $lte: b.max } }))
    );

    res.status(200).json({ success: true, data: buckets.map((b, i) => ({ range: b.range, count: counts[i] })) });
  } catch (error) {
    console.error("getEcoScoreDistribution error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch distribution" });
  }
}
export async function getSettings(req: Request, res: Response) {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});
    Object.assign(settings, req.body);
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("updateSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
}