import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { getAIHistoryList, searchWithAI, analyzeImpact } from "../controllers/aiController";

const router = Router();
router.use(requireAuth);

router.get("/history", getAIHistoryList);
router.post("/search", aiRateLimiter, searchWithAI);
router.post("/analyze", aiRateLimiter, analyzeImpact);

export default router;