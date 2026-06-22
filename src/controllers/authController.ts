import { Request, Response } from "express";
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function createDemoSignInToken(req: Request, res: Response) {
  try {
    const { role } = req.body as { role?: "user" | "admin" };

    const userId = role === "admin" ? process.env.DEMO_ADMIN_CLERK_ID : process.env.DEMO_USER_CLERK_ID;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Demo account not configured" });
    }

    const signInToken = await clerk.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 60 * 5, // single-use, expires in 5 minutes
    });

    res.status(200).json({ success: true, data: { token: signInToken.token } });
  } catch (error) {
    console.error("createDemoSignInToken error:", error);
    res.status(500).json({ success: false, message: "Failed to create demo sign-in token" });
  }
}