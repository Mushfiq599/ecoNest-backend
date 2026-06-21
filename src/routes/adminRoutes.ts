import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  getAdminStats, getUserGrowth, getCategoryBreakdown,
  getAllAIHistoryAdmin, getEcoScoreDistribution,
  getSettings, updateSettings,
} from "../controllers/adminController";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/user-growth", getUserGrowth);
router.get("/category-breakdown", getCategoryBreakdown);
router.get("/ai-logs", getAllAIHistoryAdmin);
router.get("/eco-score-distribution", getEcoScoreDistribution);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;