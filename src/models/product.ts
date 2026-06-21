import { Schema, model, Document } from "mongoose";

export type ProductCategory = "home" | "fashion" | "food" | "transport";

export interface IProduct extends Document {
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: ProductCategory;
  ecoScore: number;
  images: string[];
  rating: number;
  ratingCount: number;
  stock: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
        longDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ["home", "fashion", "food", "transport"], required: true, index: true },
    ecoScore: { type: Number, required: true, min: 0, max: 100 },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

export const Product = model<IProduct>("Product", productSchema);