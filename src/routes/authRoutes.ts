import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createDemoSignInToken } from "../controllers/authController";

const demoRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.post("/demo-token", demoRateLimiter, createDemoSignInToken);

export default router;