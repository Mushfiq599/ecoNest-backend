import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { getAuth } from "./auth";

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const { userId } = getAuth(req);
    return userId ?? ipKeyGenerator(req.ip ?? "");
  },
  message: { success: false, message: "Too many AI requests. Please wait a moment and try again." },
});