import { Request, Response, NextFunction } from "express";
import { requireAuth as clerkRequireAuth, clerkMiddleware, getAuth } from "@clerk/express";

export const withClerk = clerkMiddleware();
export const requireAuth = clerkRequireAuth();
export { getAuth };

// Lets only our own Next.js webhook call internal sync endpoints.
// Not meant as auth for user-facing routes — that's requireAuth above.
export function verifyInternalRequest(req: Request, res: Response, next: NextFunction) {
  if (req.headers["x-internal-secret"] !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}