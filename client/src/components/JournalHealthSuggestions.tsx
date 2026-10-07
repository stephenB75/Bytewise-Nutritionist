/**
 * Journal health suggestions — up to 3 tips based on what's logged today.
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Apple,
  Droplets,
  Flame,
  Lightbulb,
  Salad,
  Utensils,
  Wheat,
} from 'lucide-react';
import { getLocalDateKey, getMealDateKey } from '@/utils/dateUtils';

type LoggedMeal = {
  date?: string;
  mealType?: string;
  name?: string;
  calories?: number;
  totalCalories?: number;
  protein?: number;
  totalProtein?: number;
  carbs?: number;
  totalCarbs?: number;
  fat?: number;
  totalFat?: number;
  sugar?: number;
  totalSugar?: number;
};

type DailyTotals = {
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  totalSugar?: number;
  waterGlasses?: number;
};

type Suggestion = {
  id: string;
  title: string;
  detail: string;
  Icon: typeof Lightbulb;
};

const MAX_SUGGESTIONS = 3;
const DEFAULT_CALORIE_GOAL = 2000;
const DEFAULT_PROTEIN_GOAL = 150;
const SUGAR_SOFT_LIMIT_G = 50; // ~WHO free-sugar guidance for many adults
const WATER_GOAL_GLASSES = 8;

function mealDayKey(meal: LoggedMeal): string {
  return getMealDateKey(meal.date) || getLocalDateKey();
}

function normalizeMealType(raw: unknown): string {
  const type = String(raw || '').toLowerCase().trim();
  if (type.includes('breakfast') || type === 'brunch') return 'breakfast';
  if (type.includes('lunch')) return 'lunch';
  if (type.includes('dinner') || type.includes('supper')) return 'dinner';
  if (type.includes('snack') || type.includes('dessert')) return 'snack';
  return 'other';
}

function buildSuggestions(input: {
  meals: LoggedMeal[];
  dailyStats?: DailyTotals | null;
  calorieGoal: number;
  proteinGoal: number;
  hour: number;
}): Suggestion[] {
  const todayKey = getLocalDateKey();
  const todayMeals = input.meals.filter((meal) => mealDayKey(meal) === todayKey);
  const mealCount = todayMeals.length;

  const fromMeals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal.totalCalories ?? meal.calories) || 0),
      protein: acc.protein + (Number(meal.totalProtein ?? meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.totalCarbs ?? meal.carbs) || 0),
      fat: acc.fat + (Number(meal.totalFat ?? meal.fat) || 0),
      sugar: acc.sugar + (Number(meal.totalSugar ?? meal.sugar) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
  );

  const calories = Math.round(input.dailyStats?.totalCalories ?? fromMeals.calories);
  const protein = Math.round(input.dailyStats?.totalProtein ?? fromMeals.protein);
  const carbs = Math.round(input.dailyStats?.totalCarbs ?? fromMeals.carbs);
  const fat = Math.round(input.dailyStats?.totalFat ?? fromMeals.fat);
  const sugar = Math.round(input.dailyStats?.totalSugar ?? fromMeals.sugar);
  const waterGlasses = Math.round(input.dailyStats?.waterGlasses ?? 0);

  const calorieGoal = input.calorieGoal > 0 ? input.calorieGoal : DEFAULT_CALORIE_GOAL;
  const proteinGoal = input.proteinGoal > 0 ? input.proteinGoal : DEFAULT_PROTEIN_GOAL;
  const calorieProgress = calories / calorieGoal;
  const proteinProgress = protein / proteinGoal;

  const types = new Set(todayMeals.map((m) => normalizeMealType(m.mealType)));
  const ranked: Array<Suggestion & { priority: number }> = [];

  if (mealCount === 0) {
    ranked.push({
      id: 'log-first',
      priority: 100,
      Icon: Utensils,
      title: 'Log your first meal',
      detail: 'Start with a balanced plate — protein, produce, and a whole-grain or starchy carb — so the journal can guide the rest of your day.',
    });
  } else {
    if (proteinProgress < 0.55 && input.hour >= 12) {
      ranked.push({
        id: 'protein',
        priority: 90,
        Icon: Flame,
        title: 'Boost protein',
        detail: `You’ve logged about ${protein}g of ${proteinGoal}g protein. Add eggs, Greek yogurt, fish, beans, or lean meat to the next meal.`,
      });
    }

    if (sugar >= SUGAR_SOFT_LIMIT_G) {
      ranked.push({
        id: 'sugar',
        priority: 85,
        Icon: Apple,
        title: 'Ease up on sugar',
        detail: `About ${sugar}g of sugar is already logged. Swap sweet drinks or desserts for fruit, plain yogurt, or water with the next snack.`,
      });
    }

    if (calorieProgress >= 1.1) {
      ranked.push({
        id: 'calories-high',
        priority: 80,
        Icon: Salad,
        title: 'Past your calorie goal',
        detail: `You’re at about ${calories} of ${calorieGoal} cal. Favor vegetables, lean protein, and a lighter portion for the rest of the day.`,
      });
    } else if (calorieProgress <= 0.45 && input.hour >= 16 && mealCount >= 1) {
      ranked.push({
        id: 'calories-low',
        priority: 78,
        Icon: Utensils,
        title: 'Fuel the rest of the day',
        detail: `Only about ${calories} of ${calorieGoal} cal so far. A satisfying dinner with protein and produce helps avoid late grazing.`,
      });
    }

    if (!types.has('breakfast') && input.hour >= 11 && mealCount > 0) {
      ranked.push({
        id: 'missed-breakfast',
        priority: 70,
        Icon: Wheat,
        title: 'No breakfast logged',
        detail: 'A protein-forward breakfast tomorrow (eggs, oatmeal with nuts, or yogurt) often steadies energy and afternoon snacking.',
      });
    } else if (types.has('snack') && !types.has('lunch') && !types.has('dinner') && input.hour >= 14) {
      ranked.push({
        id: 'mostly-snacks',
        priority: 68,
        Icon: Salad,
        title: 'Build a real meal',
        detail: 'Today is mostly snacks so far. Sit down for a plate with protein + vegetables instead of grazing through the afternoon.',
      });
    }

    if (waterGlasses < Math.ceil(WATER_GOAL_GLASSES * 0.5) && input.hour >= 13 && mealCount > 0) {
      ranked.push({
        id: 'water',
        priority: 60,
        Icon: Droplets,
        title: 'Drink more water',
        detail: `Only ${waterGlasses} of ${WATER_GOAL_GLASSES} glasses logged. Pair water with your next meal — thirst is easy to mistake for hunger.`,
      });
    }

    const macroSum = protein + carbs + fat;
    if (macroSum > 0 && fat / macroSum > 0.45 && calories >= 400) {
      ranked.push({
        id: 'fat-heavy',
        priority: 55,
        Icon: Salad,
        title: 'Balance the fats',
        detail: 'Fat is making up a large share of today’s macros. Add vegetables, fruit, or lean protein to round out the next meal.',
      });
    }

    if (proteinProgress >= 0.9 && calorieProgress >= 0.7 && calorieProgress <= 1.05 && sugar < SUGAR_SOFT_LIMIT_G) {
      ranked.push({
        id: 'on-track',
        priority: 40,
        Icon: Lightbulb,
        title: 'You’re on a solid track',
        detail: `Calories and protein look balanced so far (${calories} cal, ${protein}g protein). Keep the next meal similar — protein + produce.`,
      });
    }
  }

  // Always fill to at most 3 with a gentle default when little is known.
  if (ranked.length === 0) {
    ranked.push({
      id: 'general',
      priority: 10,
      Icon: Lightbulb,
      title: 'Keep plates simple',
      detail: 'Aim for protein, colorful produce, and a smart carb at each meal — then log it so these tips stay personal.',
    });
  }

  return ranked
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ id, title, detail, Icon }) => ({ id, title, detail, Icon }));
}

export function JournalHealthSuggestions({
  meals = [],
  dailyStats,
  calorieGoal = DEFAULT_CALORIE_GOAL,
  proteinGoal = DEFAULT_PROTEIN_GOAL,
  className = '',
}: {
  meals?: LoggedMeal[];
  dailyStats?: DailyTotals | null;
  calorieGoal?: number;
  proteinGoal?: number;
  className?: string;
}) {
  const suggestions = useMemo(
    () => buildSuggestions({
      meals,
      dailyStats,
      calorieGoal,
      proteinGoal,
      hour: new Date().getHours(),
    }),
    [meals, dailyStats, calorieGoal, proteinGoal],
  );

  return (
    <Card
      className={`p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 shadow-md ${className}`}
      data-testid="journal-health-suggestions"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-lime-100">
          <Lightbulb className="h-5 w-5 text-lime-700" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Health suggestions</h3>
          <p className="text-xs text-gray-700">Based on what you’ve logged today · top 3</p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {suggestions.map(({ id, title, detail, Icon }, index) => (
          <li
            key={id}
            className="rounded-lg bg-white/75 border border-amber-200/50 p-3"
            data-testid={`journal-health-suggestion-${index + 1}`}
          >
            <div className="flex gap-2.5">
              <Icon className="h-4 w-4 shrink-0 text-lime-700 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
