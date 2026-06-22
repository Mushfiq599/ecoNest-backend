
import { getAuth } from "../middleware/auth";
import { AIHistory } from "../models/AIHistory";
import { Request, Response } from "express";
import crypto from "crypto";
import { ImpactLog } from "../models/ImpactLog";
import { Product } from "../models/Product";
import { getAISearchRecommendations, getImpactAnalysis } from "../services/geminiService";
import { aiSearchCache, aiImpactCache } from "../utils/cache";

const SEARCH_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const IMPACT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function hashKey(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function searchWithAI(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { query } = req.body as { query?: string };
    if (!query || query.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Query must be at least 3 characters" });
    }

    const cacheKey = hashKey(`search:${query.toLowerCase().trim()}`);
    let result = aiSearchCache.get(cacheKey);

    if (!result) {
      const products = await Product.find().limit(50).select("name price category ecoScore");
      result = await getAISearchRecommendations(
        query,
        products.map((p) => ({ name: p.name, price: p.price, category: p.category, ecoScore: p.ecoScore }))
      );
      aiSearchCache.set(cacheKey, result, SEARCH_CACHE_TTL);
    }

    await AIHistory.create({ clerkId: userId, type: "search", query, response: result });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("searchWithAI error:", error);
    res.status(500).json({ success: false, message: "AI search failed. Please try again." });
  }
}

export async function analyzeImpact(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { description } = req.body as { description?: string };
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Please describe your habits in more detail" });
    }

    const cacheKey = hashKey(`impact:${userId}:${description.toLowerCase().trim()}`);
    let result = aiImpactCache.get(cacheKey) as Awaited<ReturnType<typeof getImpactAnalysis>> | undefined;

    if (!result) {
      result = await getImpactAnalysis(description);
      aiImpactCache.set(cacheKey, result, IMPACT_CACHE_TTL);
    }

    await Promise.all([
      AIHistory.create({ clerkId: userId, type: "analysis", query: description, response: result }),
      ImpactLog.create({
        clerkId: userId,
        overallScore: result.overallScore,
        categoryScores: result.categoryScores,
        carbonFootprint: result.carbonFootprint,
        suggestions: result.suggestions,
        highlights: result.highlights,
      }),
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("analyzeImpact error:", error);
    res.status(500).json({ success: false, message: "Impact analysis failed. Please try again." });
  }
}

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