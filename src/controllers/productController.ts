import { Request, Response } from "express";
import { Product } from "../models/Product";

export async function getProducts(req: Request, res: Response) {
  try {
    const {
      search, category, minPrice, maxPrice, minEcoScore,
      sort = "newest", page = "1", limit = "12",
    } = req.query as Record<string, string>;

    const filter: Record<string, any> = {};
    if (search) filter.$text = { $search: search };
    if (category && category !== "all") filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minEcoScore) filter.ecoScore = { $gte: Number(minEcoScore) };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { rating: -1 },
    };

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Number(limit) || 12, 50);

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] ?? sortMap.newest)
        .skip((pageNum - 1) * pageLimit)
        .limit(pageLimit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: { page: pageNum, limit: pageLimit, total, hasMore: pageNum * pageLimit < total },
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}

export async function getRelatedProducts(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.status(200).json({ success: true, data: related });
  } catch (error) {
    console.error("getRelatedProducts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch related products" });
  }
}