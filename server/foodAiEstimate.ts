import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Last resort for foods missing from the curated database, the fast food menus and USDA
// (common for regional and home-style dishes). The calculator route needs no sign-in, so
// calls are capped per device and overall to protect the Gemini quota.
const GEMINI_MODELS = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-flash-latest']
  .filter((m, i, all): m is string => !!m && all.indexOf(m) === i);
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 3000;
const CALLS_PER_CLIENT_PER_DAY = 40;
const CALLS_PER_DAY = 1500;

const per100gSchema = z.object({
  calories: z.number().min(0).max(900),
  protein: z.number().min(0).max(100),
  carbs: z.number().min(0).max(100),
  fat: z.number().min(0).max(100),
  fiber: z.number().min(0).max(100).optional(),
  sugar: z.number().min(0).max(100).optional(),
  iron: z.number().min(0).max(100).optional(),
  calcium: z.number().min(0).max(2000).optional(),
  zinc: z.number().min(0).max(100).optional(),
  magnesium: z.number().min(0).max(1000).optional(),
  vitaminC: z.number().min(0).max(1000).optional(),
  vitaminD: z.number().min(0).max(100).optional(),
  vitaminB12: z.number().min(0).max(100).optional(),
  folate: z.number().min(0).max(2000).optional(),
});

const aiFoodSchema = z.object({
  recognized: z.boolean(),
  name: z.string().min(1).max(120),
  cuisine: z.string().max(60).optional(),
  grams: z.number().min(1).max(3000),
  per100g: per100gSchema,
});

export type AiFoodEstimate = z.infer<typeof aiFoodSchema>;

const cache = new Map<string, { value: AiFoodEstimate | null; at: number }>();
const usage = { day: '', total: 0, byClient: new Map<string, number>() };

function allowCall(clientKey: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (usage.day !== today) {
    usage.day = today;
    usage.total = 0;
    usage.byClient.clear();
  }
  const clientCalls = usage.byClient.get(clientKey) || 0;
  if (usage.total >= CALLS_PER_DAY || clientCalls >= CALLS_PER_CLIENT_PER_DAY) return false;
  usage.total++;
  usage.byClient.set(clientKey, clientCalls + 1);
  return true;
}

function remember(key: string, value: AiFoodEstimate | null) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { value, at: Date.now() });
}

/**
 * Asks Gemini for per-100g nutrition and the weight of the given portion. Returns null when AI is
 * unavailable, over its limits, or doesn't recognise the food.
 */
export async function estimateFoodWithAI(food: string, measurement: string, clientKey = 'server'): Promise<AiFoodEstimate | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const key = `${food.trim().toLowerCase()}|${measurement.trim().toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  if (!allowCall(clientKey)) return null;

  const prompt = `You are a nutrition database for a food-tracking app used by people of every culture. Identify the food and estimate its nutrition from typical recipes and reference data (USDA, national food composition tables, standard recipes).

Food: ${JSON.stringify(food.slice(0, 120))}
Portion: ${JSON.stringify(measurement.slice(0, 60) || '1 serving')}

Reply with JSON only, no markdown:
{"recognized": true, "name": "common English name, with the local name in brackets if different", "cuisine": "e.g. Nigerian", "grams": weight in grams of the portion above, "per100g": {"calories": n, "protein": g, "carbs": g, "fat": g, "fiber": g, "sugar": g, "iron": mg, "calcium": mg, "zinc": mg, "magnesium": mg, "vitaminC": mg, "vitaminD": mcg, "vitaminB12": mcg, "folate": mcg}}
All nutrient values are per 100 g of the food as eaten. If the text is not a food or drink, reply {"recognized": false, "name": "unknown", "grams": 1, "per100g": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}}.`;

  const genAI = new GoogleGenerativeAI(apiKey);
  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODELS[i],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 4096 },
      });
      const text = (await model.generateContent(prompt)).response.text();
      const parsed = aiFoodSchema.safeParse(JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)));
      const value = parsed.success && parsed.data.recognized ? parsed.data : null;
      remember(key, value);
      return value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const modelMissing = /404|not found|is not supported/i.test(message);
      if (!modelMissing || i === GEMINI_MODELS.length - 1) {
        console.warn('⚠️ AI food estimate unavailable:', message.slice(0, 200));
        return null;
      }
    }
  }
  return null;
}
