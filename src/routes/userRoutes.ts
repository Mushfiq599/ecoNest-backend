import { Router } from "express";
import { syncUserFromClerk, getMyStats, getAllUsers, updateUserRole, deleteUser } from "../controllers/userController";
import { verifyInternalRequest, requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
router.post("/sync", verifyInternalRequest, syncUserFromClerk);
router.get("/me/stats", requireAuth, getMyStats);

router.get("/", requireAuth, requireAdmin, getAllUsers);
router.patch("/:id/role", requireAuth, requireAdmin, updateUserRole);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default router;