import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { Product } from "../models/Product";

dotenv.config();

const products = [
  { name: "Bamboo Toothbrush Set (4-Pack)", description: "Biodegradable bamboo handles with BPA-free bristles and compostable packaging.", price: 12.99, category: "home", ecoScore: 88, images: ["https://images.unsplash.com/photo-1607613009820-a29f7bb81c04"], rating: 4.6, ratingCount: 214, stock: 120 },
  { name: "Reusable Silicone Food Bags (6-Pack)", description: "Leak-proof, dishwasher-safe silicone storage replacing single-use plastic bags.", price: 24.5, category: "home", ecoScore: 82, images: ["https://images.unsplash.com/photo-1610348725531-816f4626ec18"], rating: 4.4, ratingCount: 158, stock: 90 },
  { name: "Solar-Powered Phone Charger", description: "10,000mAh power bank with an integrated solar panel for off-grid charging.", price: 39.99, category: "home", ecoScore: 75, images: ["https://images.unsplash.com/photo-1620714223084-86bff43c7e58"], rating: 4.2, ratingCount: 97, stock: 60 },
  { name: "Organic Cotton Bedsheet Set", description: "GOTS-certified organic cotton, undyed with chemical-free finishing.", price: 89.0, category: "home", ecoScore: 91, images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"], rating: 4.8, ratingCount: 132, stock: 45 },
  { name: "Recycled Denim Jacket", description: "Made from 80% post-consumer recycled denim fiber, classic unisex fit.", price: 68.0, category: "fashion", ecoScore: 79, images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5"], rating: 4.3, ratingCount: 76, stock: 35 },
  { name: "Hemp Canvas Tote Bag", description: "Durable hemp-cotton canvas built to replace hundreds of plastic bags over its lifetime.", price: 22.0, category: "fashion", ecoScore: 85, images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e"], rating: 4.7, ratingCount: 203, stock: 150 },
  { name: "Cork Leather Wallet", description: "Vegan leather alternative made from sustainably harvested cork bark.", price: 34.0, category: "fashion", ecoScore: 87, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93"], rating: 4.5, ratingCount: 64, stock: 70 },
  { name: "Recycled Wool Sweater", description: "Knit from 70% reclaimed wool fiber in undyed natural tones.", price: 72.0, category: "fashion", ecoScore: 81, images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531"], rating: 4.4, ratingCount: 58, stock: 40 },
  { name: "Compostable Coffee Pods (24-Pack)", description: "Fully compostable pods compatible with standard single-serve machines.", price: 14.99, category: "food", ecoScore: 78, images: ["https://images.unsplash.com/photo-1497935586351-b67a49e012bf"], rating: 4.1, ratingCount: 189, stock: 200 },
  { name: "Reusable Beeswax Food Wraps", description: "Organic cotton infused with beeswax — a direct replacement for plastic cling wrap.", price: 18.5, category: "food", ecoScore: 89, images: ["https://images.unsplash.com/photo-1610348725531-816f4626ec18"], rating: 4.6, ratingCount: 142, stock: 110 },
  { name: "Stainless Steel Bento Box", description: "Leak-proof three-compartment lunch box made of fully recyclable stainless steel.", price: 29.99, category: "food", ecoScore: 84, images: ["https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7"], rating: 4.5, ratingCount: 97, stock: 80 },
  { name: "Foldable E-Bike", description: "Lightweight aluminum-frame e-bike with 40km range, built to replace short car trips.", price: 899.0, category: "transport", ecoScore: 93, images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e"], rating: 4.7, ratingCount: 41, stock: 12 },
  { name: "Carbon Fiber Commuter Scooter", description: "Lightweight electric scooter purpose-built for daily urban commuting.", price: 549.0, category: "transport", ecoScore: 86, images: ["https://images.unsplash.com/photo-1604868189265-219ba2705e07"], rating: 4.3, ratingCount: 29, stock: 18 },
  { name: "Recycled Bike Helmet", description: "Impact-tested helmet shell made from recycled ABS plastic.", price: 45.0, category: "transport", ecoScore: 80, images: ["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91"], rating: 4.4, ratingCount: 53, stock: 65 },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});