import { Request, Response } from "express";
import { ContactMessage } from "../models/ContactMessage";

export async function submitContactMessage(req: Request, res: Response) {
  try {
    const { name, email, message } = req.body as { name?: string; email?: string; message?: string };

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }

    await ContactMessage.create({ name, email, message });
    res.status(201).json({ success: true, message: "Message received" });
  } catch (error) {
    console.error("submitContactMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
}