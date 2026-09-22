import { supabaseAdmin } from './supabaseAuth';

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }
  const parsed = value ? new Date(String(value)) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function upsertUserViaSupabase(user: {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified?: boolean | null;
  profileIcon?: number | null;
}) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      email_verified: user.emailVerified ?? true,
      profile_icon: user.profileIcon || 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    emailVerified: data.email_verified,
    profileIcon: data.profile_icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getUserViaSupabase(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return undefined;
  }

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    emailVerified: data.email_verified,
    profileIcon: data.profile_icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dailyCalorieGoal: data.daily_calorie_goal,
    dailyProteinGoal: data.daily_protein_goal,
    dailyCarbGoal: data.daily_carb_goal,
    dailyFatGoal: data.daily_fat_goal,
    dailyWaterGoal: data.daily_water_goal,
  };
}

export async function createMealViaSupabase(meal: Record<string, any>) {
  const date = toIsoDate(meal.date);
  const { data, error } = await supabaseAdmin
    .from('meals')
    .insert({
      user_id: meal.userId,
      name: meal.name,
      meal_type: meal.mealType || 'meal',
      date: date.toISOString(),
      total_calories: toNumber(meal.totalCalories),
      total_protein: toNumber(meal.totalProtein),
      total_carbs: toNumber(meal.totalCarbs),
      total_fat: toNumber(meal.totalFat),
      iron: toNumber(meal.iron),
      calcium: toNumber(meal.calcium),
      zinc: toNumber(meal.zinc),
      magnesium: toNumber(meal.magnesium),
      vitamin_c: toNumber(meal.vitaminC),
      vitamin_d: toNumber(meal.vitaminD),
      vitamin_b12: toNumber(meal.vitaminB12),
      folate: toNumber(meal.folate),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    mealType: data.meal_type,
    date: new Date(data.date),
    totalCalories: String(data.total_calories ?? 0),
    totalProtein: String(data.total_protein ?? 0),
    totalCarbs: String(data.total_carbs ?? 0),
    totalFat: String(data.total_fat ?? 0),
    iron: String(data.iron ?? 0),
    calcium: String(data.calcium ?? 0),
    zinc: String(data.zinc ?? 0),
    magnesium: String(data.magnesium ?? 0),
    vitaminC: String(data.vitamin_c ?? 0),
    vitaminD: String(data.vitamin_d ?? 0),
    vitaminB12: String(data.vitamin_b12 ?? 0),
    folate: String(data.folate ?? 0),
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
  };
}

export async function getUserMealsViaSupabase(userId: string, startDate?: Date, endDate?: Date) {
  let query = supabaseAdmin
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('date', endDate.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    mealType: row.meal_type,
    date: row.date ? new Date(row.date) : new Date(),
    totalCalories: String(row.total_calories ?? 0),
    totalProtein: String(row.total_protein ?? 0),
    totalCarbs: String(row.total_carbs ?? 0),
    totalFat: String(row.total_fat ?? 0),
    iron: String(row.iron ?? 0),
    calcium: String(row.calcium ?? 0),
    zinc: String(row.zinc ?? 0),
    magnesium: String(row.magnesium ?? 0),
    vitaminC: String(row.vitamin_c ?? 0),
    vitaminD: String(row.vitamin_d ?? 0),
    vitaminB12: String(row.vitamin_b12 ?? 0),
    folate: String(row.folate ?? 0),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    foods: [],
  }));
}
