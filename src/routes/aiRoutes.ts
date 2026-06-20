import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getAIHistoryList } from "../controllers/aiController";

const router = Router();
router.use(requireAuth);
router.get("/history", getAIHistoryList);

export default router;