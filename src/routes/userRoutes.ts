import { Router } from "express";
import { syncUserFromClerk, getMyStats } from "../controllers/userController";
import { verifyInternalRequest, requireAuth } from "../middleware/auth";

const router = Router();
router.post("/sync", verifyInternalRequest, syncUserFromClerk);
router.get("/me/stats", requireAuth, getMyStats);

export default router;