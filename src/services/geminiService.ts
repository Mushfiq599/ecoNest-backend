import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-3.5-flash";

interface ProductRecommendation {
  name: string;
  ecoScore: number;
  reasoning: string;
  price: number;
  category: string;
}

export interface AISearchResult {
  recommendations: ProductRecommendation[];
  followUpQuestions: string[];
  advice: string;
}

const searchResponseSchema = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          ecoScore: { type: "number" },
          reasoning: { type: "string" },
          price: { type: "number" },
          category: { type: "string" },
        },
        required: ["name", "ecoScore", "reasoning", "price", "category"],
      },
    },
    followUpQuestions: { type: "array", items: { type: "string" } },
    advice: { type: "string" },
  },
  required: ["recommendations", "followUpQuestions", "advice"],
};

const SEARCH_SYSTEM_PROMPT = `You are EcoNest's AI Sustainability Advisor. Help users find eco-friendly products.

When responding:
1. Analyze the user's query for sustainability needs.
2. Consider the available products and their eco-ratings provided in context.
3. Provide personalized recommendations with reasoning.
4. Include an eco-score (0-100) for each recommendation.
5. Suggest 2-3 relevant follow-up questions.

Only recommend products that genuinely exist in the provided product list. If none fit well, say so honestly in the advice field rather than inventing products.`;

export async function getAISearchRecommendations(
  query: string,
  availableProducts: { name: string; price: number; category: string; ecoScore: number }[]
): Promise<AISearchResult> {
  const productContext = availableProducts
    .map((p) => `${p.name} | $${p.price} | ${p.category} | eco-score ${p.ecoScore}`)
    .join("\n");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `User query: "${query}"\n\nAvailable products:\n${productContext}`,
    config: {
      systemInstruction: SEARCH_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: searchResponseSchema,
    },
  });

  return JSON.parse(response.text ?? "{}") as AISearchResult;
}

export interface ImpactAnalysisResult {
  overallScore: number;
  categoryScores: { home: number; fashion: number; food: number; transport: number };
  carbonFootprint: string;
  suggestions: string[];
  highlights: string[];
}

const impactResponseSchema = {
  type: "object",
  properties: {
    overallScore: { type: "number" },
    categoryScores: {
      type: "object",
      properties: {
        home: { type: "number" },
        fashion: { type: "number" },
        food: { type: "number" },
        transport: { type: "number" },
      },
      required: ["home", "fashion", "food", "transport"],
    },
    carbonFootprint: { type: "string" },
    suggestions: { type: "array", items: { type: "string" } },
    highlights: { type: "array", items: { type: "string" } },
  },
  required: ["overallScore", "categoryScores", "carbonFootprint", "suggestions", "highlights"],
};

const IMPACT_SYSTEM_PROMPT = `You are EcoNest's Environmental Impact Analyst.

Analyze the user's described purchasing and lifestyle habits and estimate their sustainability impact.
Return realistic scores (0-100) per category, a rough carbon footprint estimate in kg CO2e,
3 actionable improvement suggestions, and 2-3 genuine highlights of what they're already doing well.
Be encouraging but honest — don't inflate scores.`;

export async function getImpactAnalysis(userHistory: string): Promise<ImpactAnalysisResult> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `User's described habits:\n${userHistory}`,
    config: {
      systemInstruction: IMPACT_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: impactResponseSchema,
    },
  });

  return JSON.parse(response.text ?? "{}") as ImpactAnalysisResult;
}