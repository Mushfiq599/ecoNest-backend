import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getAdminStats, getUserGrowth, getCategoryBreakdown } from "../controllers/adminController";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/user-growth", getUserGrowth);
router.get("/category-breakdown", getCategoryBreakdown);

export default router;