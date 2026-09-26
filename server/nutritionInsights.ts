import type { Express, Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isAuthenticated } from './supabaseAuth';
import { storage } from './storage';

type Tone = 'suggestion' | 'positive' | 'info';
export type Observation = { tone: Tone; title: string; detail: string };
export type InsightsResult = {
  range: 'today' | 'week';
  daysLogged: number;
  mealsCount: number;
  averages: { calories: number; protein: number; carbs: number; fat: number };
  goals: { calories: number; protein: number; carbs: number; fat: number };
  summary: string;
  observations: Observation[];
  source: 'ai' | 'rules';
  generatedAt: string;
};

const MICROS = [
  { key: 'vitaminC', label: 'vitamin C', goal: 90, foods: 'citrus, berries, peppers or broccoli' },
  { key: 'vitaminD', label: 'vitamin D', goal: 20, foods: 'salmon, eggs or fortified milk' },
  { key: 'vitaminB12', label: 'vitamin B12', goal: 2.4, foods: 'fish, eggs, dairy or fortified cereal' },
  { key: 'folate', label: 'folate', goal: 400, foods: 'leafy greens, beans or lentils' },
  { key: 'iron', label: 'iron', goal: 18, foods: 'lean red meat, beans, spinach or fortified cereal' },
  { key: 'calcium', label: 'calcium', goal: 1000, foods: 'yogurt, milk, cheese or fortified plant milk' },
  { key: 'zinc', label: 'zinc', goal: 11, foods: 'meat, pumpkin seeds, chickpeas or cashews' },
  { key: 'magnesium', label: 'magnesium', goal: 400, foods: 'nuts, seeds, whole grains or dark chocolate' },
] as const;

const requestSchema = z.object({
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  range: z.enum(['today', 'week']).default('today'),
});

const AI_CALLS_PER_USER_PER_DAY = 6;
const GEMINI_MODELS = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-flash-latest']
  .filter((m, i, all): m is string => !!m && all.indexOf(m) === i);

const resultCache = new Map<string, InsightsResult>();
const aiCallCounts = new Map<string, number>();

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateKey(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function shiftKey(key: string, days: number): string {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

type Totals = { calories: number; protein: number; carbs: number; fat: number } & Record<(typeof MICROS)[number]['key'], number>;

function emptyTotals(): Totals {
  return {
    calories: 0, protein: 0, carbs: 0, fat: 0,
    vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0, iron: 0, calcium: 0, zinc: 0, magnesium: 0,
  };
}

/** Plain, rule-based observations. Always computed, and used as-is when the AI is unavailable. */
function ruleObservations(avg: Totals, goals: InsightsResult['goals'], range: 'today' | 'week', mealsCount: number, daysLogged: number): Observation[] {
  const scope = range === 'today' ? 'today' : 'on an average day this week';
  const out: Observation[] = [];
  const kcalFromMacros = avg.protein * 4 + avg.carbs * 4 + avg.fat * 9 || 1;
  const carbShare = Math.round((avg.carbs * 4 / kcalFromMacros) * 100);
  const fatShare = Math.round((avg.fat * 9 / kcalFromMacros) * 100);
  const proteinShare = Math.round((avg.protein * 4 / kcalFromMacros) * 100);

  if (avg.protein < goals.protein * 0.8) {
    const gap = Math.round(goals.protein - avg.protein);
    out.push({
      tone: 'suggestion',
      title: 'Add more protein',
      detail: `You had about ${Math.round(avg.protein)}g of protein ${scope}, roughly ${gap}g under your ${goals.protein}g goal. Try adding eggs, Greek yogurt, chicken, fish, tofu or beans to a meal.`,
    });
  } else {
    out.push({
      tone: 'positive',
      title: 'Protein is on track',
      detail: `About ${Math.round(avg.protein)}g of protein ${scope} (${proteinShare}% of your calories). Nice work.`,
    });
  }

  if (carbShare > 55 || avg.carbs > goals.carbs * 1.2) {
    out.push({
      tone: 'suggestion',
      title: 'Ease up on carbs',
      detail: `Carbs made up about ${carbShare}% of your calories ${scope} (${Math.round(avg.carbs)}g vs a ${goals.carbs}g goal). Swapping some bread, pasta, rice or sugary drinks for vegetables or protein would balance things out.`,
    });
  }

  if (fatShare > 38) {
    out.push({
      tone: 'suggestion',
      title: 'Fat is on the high side',
      detail: `Fat was about ${fatShare}% of your calories ${scope}. Grilled instead of fried foods and lighter sauces can bring that down.`,
    });
  }

  if (avg.calories > goals.calories * 1.1) {
    out.push({
      tone: 'info',
      title: 'Above your calorie goal',
      detail: `About ${Math.round(avg.calories)} kcal ${scope} against a ${goals.calories} kcal goal.`,
    });
  } else if (avg.calories < goals.calories * 0.6 && (range === 'week' || mealsCount >= 2)) {
    out.push({
      tone: 'info',
      title: 'Well under your calorie goal',
      detail: `About ${Math.round(avg.calories)} kcal ${scope} against a ${goals.calories} kcal goal. If that's not everything you ate, logging all meals makes these tips more accurate.`,
    });
  }

  const lowMicros = MICROS
    .map(m => ({ ...m, percent: (avg[m.key] / m.goal) * 100 }))
    .filter(m => m.percent < 50)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 2);
  for (const micro of lowMicros) {
    out.push({
      tone: 'suggestion',
      title: `Low on ${micro.label}`,
      detail: `Only about ${Math.round(micro.percent)}% of the daily value ${scope}. Good sources: ${micro.foods}.`,
    });
  }

  if (range === 'today' && mealsCount === 1) {
    out.push({ tone: 'info', title: 'Only one meal logged', detail: 'These observations will get more useful as you log the rest of today.' });
  }
  if (range === 'week' && daysLogged < 4) {
    out.push({ tone: 'info', title: `${daysLogged} of 7 days logged`, detail: 'Logging more days gives a truer picture of your week.' });
  }

  return out.slice(0, 5);
}

function ruleSummary(observations: Observation[]): string {
  const suggestions = observations.filter(o => o.tone === 'suggestion').length;
  if (suggestions === 0) return 'Your meals look well balanced. Keep it up!';
  if (suggestions === 1) return 'Mostly balanced, with one thing worth adjusting.';
  return `A few easy tweaks could balance your meals better.`;
}

const aiResponseSchema = z.object({
  summary: z.string().min(1).max(300),
  observations: z.array(z.object({
    tone: z.enum(['suggestion', 'positive', 'info']),
    title: z.string().min(1).max(60),
    detail: z.string().min(1).max(320),
  })).min(1).max(5),
});

async function aiObservations(input: {
  range: 'today' | 'week';
  averages: Totals;
  goals: InsightsResult['goals'];
  mealNames: string[];
  facts: Observation[];
}): Promise<{ summary: string; observations: Observation[] } | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const r = (n: number) => Math.round(n * 10) / 10;
  const prompt = `You are a friendly nutrition coach inside a food-tracking app. Give simple, practical observations about the user's logged meals.
Rules: plain everyday language, no medical advice or diagnoses, no judgement, each detail at most 2 short sentences, suggest specific foods where helpful. Base everything ONLY on the numbers below; do not invent foods they ate.

Period: ${input.range === 'today' ? "today's meals" : 'daily average over the last 7 days'}
Meals logged: ${input.mealNames.slice(0, 25).join('; ') || 'none'}
Calories: ${r(input.averages.calories)} kcal (goal ${input.goals.calories})
Protein: ${r(input.averages.protein)} g (goal ${input.goals.protein})
Carbs: ${r(input.averages.carbs)} g (goal ${input.goals.carbs})
Fat: ${r(input.averages.fat)} g (goal ${input.goals.fat})
Micronutrients (% of daily value): ${MICROS.map(m => `${m.label} ${Math.round((input.averages[m.key] / m.goal) * 100)}%`).join(', ')}
Checks already computed by the app (keep these conclusions, you may reword them): ${input.facts.map(f => `${f.title}: ${f.detail}`).join(' | ')}

Reply with JSON only, no markdown:
{"summary": "one short sentence", "observations": [{"tone": "suggestion" | "positive" | "info", "title": "max 6 words", "detail": "..."}]}
Give 2 to 4 observations, most important first. Use "suggestion" for things to change (like more protein or fewer carbs).`;

  const genAI = new GoogleGenerativeAI(apiKey);
  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODELS[i],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 800 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = aiResponseSchema.safeParse(JSON.parse(json));
      return parsed.success ? parsed.data : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const modelMissing = /404|not found|is not supported/i.test(message);
      if (!modelMissing || i === GEMINI_MODELS.length - 1) {
        console.warn('⚠️ Nutrition insights AI unavailable, using rule-based observations:', message.slice(0, 200));
        return null;
      }
    }
  }
  return null;
}

export function registerNutritionInsightsRoutes(app: Express) {
  app.post('/api/ai/nutrition-insights', isAuthenticated, async (req: any, res: Response) => {
    const userId: string | undefined = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Sign in to analyze your meals.' });

    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid request' });
    const { today, range } = parsed.data;

    try {
      const firstDay = range === 'today' ? today : shiftKey(today, -6);
      const allMeals: any[] = await storage.getUserMeals(userId);
      const meals = allMeals.filter(meal => {
        const key = dateKey(meal.date);
        return key >= firstDay && key <= today;
      });

      const byDay = new Map<string, Totals>();
      for (const meal of meals) {
        const key = dateKey(meal.date);
        const totals = byDay.get(key) || emptyTotals();
        totals.calories += num(meal.totalCalories ?? meal.calories);
        totals.protein += num(meal.totalProtein ?? meal.protein);
        totals.carbs += num(meal.totalCarbs ?? meal.carbs);
        totals.fat += num(meal.totalFat ?? meal.fat);
        for (const micro of MICROS) totals[micro.key] += num(meal[micro.key]);
        byDay.set(key, totals);
      }

      const daysLogged = byDay.size;
      const averages = emptyTotals();
      for (const totals of Array.from(byDay.values())) {
        for (const k of Object.keys(averages) as (keyof Totals)[]) averages[k] += totals[k] / Math.max(daysLogged, 1);
      }

      const user: any = await storage.getUser(userId).catch(() => undefined);
      const goals = {
        calories: num(user?.dailyCalorieGoal) || 2000,
        protein: num(user?.dailyProteinGoal) || 150,
        carbs: num(user?.dailyCarbGoal) || 200,
        fat: num(user?.dailyFatGoal) || 70,
      };

      const base = {
        range,
        daysLogged,
        mealsCount: meals.length,
        averages: {
          calories: Math.round(averages.calories),
          protein: Math.round(averages.protein),
          carbs: Math.round(averages.carbs),
          fat: Math.round(averages.fat),
        },
        goals,
      };

      if (meals.length === 0) {
        return res.json({
          ...base,
          summary: range === 'today' ? 'No meals logged today yet.' : 'No meals logged in the last 7 days.',
          observations: [],
          source: 'rules',
          generatedAt: new Date().toISOString(),
        } satisfies InsightsResult);
      }

      const fingerprint = meals
        .map(m => `${m.id}:${num(m.totalCalories)}`)
        .sort()
        .join(',');
      const cacheKey = `${userId}:${today}:${range}:${fingerprint}:${goals.calories}:${goals.protein}`;
      const cached = resultCache.get(cacheKey);
      if (cached) return res.json(cached);

      const facts = ruleObservations(averages, goals, range, meals.length, daysLogged);
      const countKey = `${userId}:${today}`;
      const callsToday = aiCallCounts.get(countKey) || 0;

      let ai: Awaited<ReturnType<typeof aiObservations>> = null;
      if (callsToday < AI_CALLS_PER_USER_PER_DAY) {
        aiCallCounts.set(countKey, callsToday + 1);
        ai = await aiObservations({
          range,
          averages,
          goals,
          mealNames: meals.map(m => String(m.name || m.mealType || 'meal')),
          facts,
        });
      }

      const result: InsightsResult = {
        ...base,
        summary: ai?.summary || ruleSummary(facts),
        observations: ai?.observations || facts,
        source: ai ? 'ai' : 'rules',
        generatedAt: new Date().toISOString(),
      };

      if (resultCache.size > 500) resultCache.clear();
      if (aiCallCounts.size > 2000) aiCallCounts.clear();
      resultCache.set(cacheKey, result);
      res.json(result);
    } catch (error: any) {
      console.error('❌ Nutrition insights failed:', error?.message || error);
      res.status(500).json({ message: 'Could not analyze your meals right now. Please try again.' });
    }
  });
}
