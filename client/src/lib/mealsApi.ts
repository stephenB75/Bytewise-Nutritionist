import { supabase } from '@/lib/supabase';
import { apiRequest } from '@/lib/queryClient';

export type LogMealInput = {
  name: string;
  date?: string;
  mealType?: string;
  totalCalories?: number | string;
  totalProtein?: number | string;
  totalCarbs?: number | string;
  totalFat?: number | string;
  iron?: number | string;
  calcium?: number | string;
  zinc?: number | string;
  magnesium?: number | string;
  vitaminC?: number | string;
  vitaminD?: number | string;
  vitaminB12?: number | string;
  folate?: number | string;
};

export type LoggedMeal = {
  id: number;
  userId: string;
  name: string;
  date: string;
  mealType: string;
  calories: number;
  totalCalories: number;
  protein: number;
  totalProtein: number;
  carbs: number;
  totalCarbs: number;
  fat: number;
  totalFat: number;
  iron: number;
  calcium: number;
  zinc: number;
  magnesium: number;
  vitaminC: number;
  vitaminD: number;
  vitaminB12: number;
  folate: number;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (typeof value === 'string' && value.includes('T')) {
    return value.split('T')[0];
  }
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

function mapMeal(row: Record<string, unknown>): LoggedMeal {
  const calories = toNumber(row.total_calories ?? row.totalCalories ?? row.calories);
  const protein = toNumber(row.total_protein ?? row.totalProtein ?? row.protein);
  const carbs = toNumber(row.total_carbs ?? row.totalCarbs ?? row.carbs);
  const fat = toNumber(row.total_fat ?? row.totalFat ?? row.fat);
  const date = toDateKey(row.date);

  return {
    id: toNumber(row.id),
    userId: String(row.user_id ?? row.userId ?? ''),
    name: String(row.name ?? 'Meal'),
    date,
    mealType: String(row.meal_type ?? row.mealType ?? 'meal'),
    calories,
    totalCalories: calories,
    protein,
    totalProtein: protein,
    carbs,
    totalCarbs: carbs,
    fat,
    totalFat: fat,
    iron: toNumber(row.iron),
    calcium: toNumber(row.calcium),
    zinc: toNumber(row.zinc),
    magnesium: toNumber(row.magnesium),
    vitaminC: toNumber(row.vitamin_c ?? row.vitaminC),
    vitaminD: toNumber(row.vitamin_d ?? row.vitaminD),
    vitaminB12: toNumber(row.vitamin_b12 ?? row.vitaminB12),
    folate: toNumber(row.folate),
  };
}

async function getSessionUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Sign in to log food');
  }
  return session.user;
}

export async function ensureUserProfile(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user?.id) {
    return null;
  }

  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    email_verified: !!user.email_confirmed_at,
    first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || null,
    last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (error) {
    console.warn('Failed to ensure user profile:', error.message);
  }

  return user.id;
}

export async function listLoggedMeals(): Promise<LoggedMeal[]> {
  const response = await apiRequest('GET', '/api/meals/logged');
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) => mapMeal(row as Record<string, unknown>));
}

export async function logMeal(input: LogMealInput): Promise<LoggedMeal> {
  await getSessionUser();
  await ensureUserProfile();

  const response = await apiRequest('POST', '/api/meals/logged', {
    name: input.name,
    date: toDateKey(input.date),
    mealType: input.mealType || 'meal',
    totalCalories: toNumber(input.totalCalories),
    totalProtein: toNumber(input.totalProtein),
    totalCarbs: toNumber(input.totalCarbs),
    totalFat: toNumber(input.totalFat),
    iron: toNumber(input.iron),
    calcium: toNumber(input.calcium),
    zinc: toNumber(input.zinc),
    magnesium: toNumber(input.magnesium),
    vitaminC: toNumber(input.vitaminC),
    vitaminD: toNumber(input.vitaminD),
    vitaminB12: toNumber(input.vitaminB12),
    folate: toNumber(input.folate),
  });
  const result = await response.json();
  const meal = mapMeal((result?.meal || result) as Record<string, unknown>);
  window.dispatchEvent(new CustomEvent('reload-meal-data', { detail: meal }));
  window.dispatchEvent(new CustomEvent('calories-logged', { detail: meal }));
  return meal;
}

export async function calculateFood(body: {
  fdcId?: number;
  grams?: number;
  ingredients?: string;
  ingredient?: string;
  query?: string;
  serving?: string;
  measurement?: string;
}) {
  const response = await fetch('/api/foods/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to calculate food');
  }
  return data;
}
