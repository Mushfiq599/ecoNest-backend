import { Schema, model, Document } from "mongoose";

export interface IImpactLog extends Document {
  clerkId: string;
  overallScore: number;
  categoryScores: { home: number; fashion: number; food: number; transport: number };
  carbonFootprint: string;
  suggestions: string[];
  highlights: string[];
}

const impactLogSchema = new Schema<IImpactLog>(
  {
    clerkId: { type: String, required: true, index: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    categoryScores: {
      home: { type: Number, default: 0 },
      fashion: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
    },
    carbonFootprint: { type: String, default: "0 kg CO2e" },
    suggestions: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ImpactLog = model<IImpactLog>("ImpactLog", impactLogSchema);