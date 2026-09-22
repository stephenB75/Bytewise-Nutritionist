import { supabase } from '@/lib/supabase';
import { apiRequest } from '@/lib/queryClient';
import { clearGuestNutritionStorage } from '@/lib/guestStorage';
import { apiFetch } from '@/lib/apiUrl';

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

const GUEST_MEALS_KEY = 'guestMeals';

async function getSessionUserOrNull() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

async function getSessionUser() {
  const user = await getSessionUserOrNull();
  if (!user?.id) {
    throw new Error('Sign in to save food to your account');
  }
  return user;
}

function readGuestMeals(): LoggedMeal[] {
  try {
    const raw = localStorage.getItem(GUEST_MEALS_KEY) || '[]';
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed : []).map((row) => mapMeal(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

function writeGuestMeals(meals: LoggedMeal[]) {
  localStorage.setItem(GUEST_MEALS_KEY, JSON.stringify(meals));
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

export async function saveUserProfile(profile: {
  firstName: string;
  lastName: string;
  profileIcon?: number;
}) {
  const user = await getSessionUser();

  await supabase.auth.updateUser({
    data: {
      first_name: profile.firstName,
      last_name: profile.lastName,
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
  });

  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    first_name: profile.firstName,
    last_name: profile.lastName,
    profile_icon: profile.profileIcon || 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (error) {
    throw new Error(error.message || 'Failed to save profile');
  }

  try {
    await apiRequest('PUT', '/api/user/profile', profile);
  } catch {
    // Express is optional; Supabase already has the name.
  }

  return { id: user.id, ...profile };
}

export async function listLoggedMeals(): Promise<LoggedMeal[]> {
  const user = await getSessionUserOrNull();
  if (!user) {
    clearGuestNutritionStorage();
    return [];
  }

  try {
    const response = await apiRequest('GET', '/api/meals/logged');
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map((row) => mapMeal(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function logMeal(input: LogMealInput): Promise<LoggedMeal> {
  const user = await getSessionUserOrNull();
  const localMeal: LoggedMeal = {
    id: Date.now(),
    userId: user?.id || 'guest',
    name: input.name,
    date: toDateKey(input.date),
    mealType: input.mealType || 'meal',
    calories: toNumber(input.totalCalories),
    totalCalories: toNumber(input.totalCalories),
    protein: toNumber(input.totalProtein),
    totalProtein: toNumber(input.totalProtein),
    carbs: toNumber(input.totalCarbs),
    totalCarbs: toNumber(input.totalCarbs),
    fat: toNumber(input.totalFat),
    totalFat: toNumber(input.totalFat),
    iron: toNumber(input.iron),
    calcium: toNumber(input.calcium),
    zinc: toNumber(input.zinc),
    magnesium: toNumber(input.magnesium),
    vitaminC: toNumber(input.vitaminC),
    vitaminD: toNumber(input.vitaminD),
    vitaminB12: toNumber(input.vitaminB12),
    folate: toNumber(input.folate),
  };

  if (!user) {
    clearGuestNutritionStorage();
    window.dispatchEvent(new CustomEvent('guest-save-prompt'));
    throw new Error('Sign in to save food to your account');
  }

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

export async function syncGuestMeals(): Promise<number> {
  const user = await getSessionUserOrNull();
  const guestMeals = readGuestMeals();
  if (!user || guestMeals.length === 0) {
    return 0;
  }

  let saved = 0;
  const remaining: LoggedMeal[] = [];
  for (const meal of guestMeals) {
    try {
      await apiRequest('POST', '/api/meals/logged', {
        name: meal.name,
        date: meal.date,
        mealType: meal.mealType,
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbs: meal.totalCarbs,
        totalFat: meal.totalFat,
        iron: meal.iron,
        calcium: meal.calcium,
        zinc: meal.zinc,
        magnesium: meal.magnesium,
        vitaminC: meal.vitaminC,
        vitaminD: meal.vitaminD,
        vitaminB12: meal.vitaminB12,
        folate: meal.folate,
      });
      saved += 1;
    } catch {
      remaining.push(meal);
    }
  }

  writeGuestMeals(remaining);
  if (remaining.length === 0) {
    localStorage.removeItem(GUEST_MEALS_KEY);
  }
  window.dispatchEvent(new CustomEvent('reload-meal-data'));
  return saved;
}

export async function deleteLoggedMeal(mealId: number): Promise<void> {
  const user = await getSessionUserOrNull();
  if (!user) {
    writeGuestMeals(readGuestMeals().filter((meal) => meal.id !== mealId));
    window.dispatchEvent(new CustomEvent('reload-meal-data'));
    return;
  }

  const response = await apiRequest('DELETE', `/api/meals/${mealId}`);
  if (!response.ok) {
    throw new Error('Failed to delete meal');
  }
  window.dispatchEvent(new CustomEvent('reload-meal-data'));
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
  const response = await apiFetch('/api/foods/calculate', {
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
