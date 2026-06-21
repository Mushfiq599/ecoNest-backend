import rateLimit from "express-rate-limit";
import { getAuth } from "./auth";

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getAuth(req).userId ?? req.ip ?? "anonymous",
  message: { success: false, message: "Too many AI requests. Please wait a moment and try again." },
});