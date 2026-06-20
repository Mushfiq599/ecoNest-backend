import { Router } from "express";
import { syncUserFromClerk } from "../controllers/userController";
import { verifyInternalRequest } from "../middleware/auth";

const router = Router();
router.post("/sync", verifyInternalRequest, syncUserFromClerk);

export default router;