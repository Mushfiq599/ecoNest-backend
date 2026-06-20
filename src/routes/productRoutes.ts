import { Router } from "express";
import {
  getProducts, getProductById, getRelatedProducts,
  createProduct, updateProduct, deleteProduct,
} from "../controllers/productController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;