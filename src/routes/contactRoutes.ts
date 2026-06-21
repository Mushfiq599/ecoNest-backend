import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContactMessage } from "../controllers/contactController";

const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again later." },
});

const router = Router();
router.post("/", contactRateLimiter, submitContactMessage);

export default router;