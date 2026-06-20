import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getImpactLogList } from "../controllers/impactController";

const router = Router();
router.use(requireAuth);
router.get("/logs", getImpactLogList);

export default router;