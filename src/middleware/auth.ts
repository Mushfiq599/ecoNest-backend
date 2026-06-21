import { Request, Response, NextFunction } from "express";
import { clerkMiddleware, getAuth } from "@clerk/express";

export const withClerk = clerkMiddleware();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { sessionClaims } = getAuth(req);
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

export { getAuth };

export function verifyInternalRequest(req: Request, res: Response, next: NextFunction) {
  if (req.headers["x-internal-secret"] !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}