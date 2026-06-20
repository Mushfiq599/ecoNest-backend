import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { withClerk } from "./middleware/auth";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import aiRoutes from "./routes/aiRoutes";
import impactRoutes from "./routes/impactRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/admin", adminRoutes);
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));
app.use(withClerk);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/users", userRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});