import { Schema, model, Document } from "mongoose";

export interface IAIHistory extends Document {
  clerkId: string;
  type: "search" | "analysis";
  query: string;
  response: unknown;
}

const aiHistorySchema = new Schema<IAIHistory>(
  {
    clerkId: { type: String, required: true, index: true },
    type: { type: String, enum: ["search", "analysis"], required: true },
    query: { type: String, required: true },
    response: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const AIHistory = model<IAIHistory>("AIHistory", aiHistorySchema);