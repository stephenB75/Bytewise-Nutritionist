import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseAuth';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Find auth.users row by email (admin API has no direct email filter). */
export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const target = normalizeEmail(email);
  let page = 1;
  const perPage = 200;

  while (page <= 15) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.warn('findAuthUserByEmail listUsers failed:', error.message);
      return null;
    }

    const match = data.users.find((u) => u.email && normalizeEmail(u.email) === target);
    if (match) {
      return match;
    }

    if (data.users.length < perPage) {
      break;
    }
    page += 1;
  }

  return null;
}

/**
 * Removes public.users rows that have no matching auth.users account (legacy app-created profiles).
 * Required before signUp when email unique constraint blocked the auth trigger.
 */
export async function removeOrphanPublicProfilesForEmail(email: string): Promise<number> {
  const target = normalizeEmail(email);
  const { data: rows, error } = await supabaseAdmin.from('users').select('id').eq('email', target);

  if (error || !rows?.length) {
    return 0;
  }

  let removed = 0;
  for (const row of rows) {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(row.id);
    if (authData?.user) {
      continue;
    }

    const { error: deleteError } = await supabaseAdmin.from('users').delete().eq('id', row.id);
    if (!deleteError) {
      removed += 1;
    } else {
      console.warn('removeOrphanPublicProfilesForEmail delete failed:', deleteError.message);
    }
  }

  return removed;
}

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

function mapUserRow(data: Record<string, any>) {
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    emailVerified: data.email_verified,
    profileIcon: data.profile_icon,
    profileImageUrl: data.profile_image_url,
    personalInfo: data.personal_info,
    privacySettings: data.privacy_settings,
    notificationSettings: data.notification_settings,
    displaySettings: data.display_settings,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dailyCalorieGoal: data.daily_calorie_goal,
    dailyProteinGoal: data.daily_protein_goal,
    dailyCarbGoal: data.daily_carb_goal,
    dailyFatGoal: data.daily_fat_goal,
    dailyWaterGoal: data.daily_water_goal,
  };
}

/** Update only the provided columns; create the row if the auth user has none yet. */
async function updateUserColumnsViaSupabase(userId: string, columns: Record<string, unknown>) {
  const values = { ...columns, updated_at: new Date().toISOString() };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('users')
    .update(values)
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (updateError) {
    throw updateError;
  }
  if (updated) {
    return mapUserRow(updated);
  }

  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email: authData?.user?.email ?? null,
      email_verified: !!authData?.user?.email_confirmed_at,
      ...values,
    })
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }
  return mapUserRow(inserted);
}

export async function updateUserProfileViaSupabase(userId: string, profile: {
  firstName?: string | null;
  lastName?: string | null;
  profileIcon?: number | null;
  personalInfo?: Record<string, unknown> | null;
  notificationSettings?: Record<string, unknown> | null;
  privacySettings?: Record<string, unknown> | null;
}) {
  const columns: Record<string, unknown> = {};
  if (profile.firstName !== undefined) columns.first_name = profile.firstName;
  if (profile.lastName !== undefined) columns.last_name = profile.lastName;
  if (profile.profileIcon !== undefined && profile.profileIcon !== null) columns.profile_icon = profile.profileIcon;
  if (profile.personalInfo !== undefined) columns.personal_info = profile.personalInfo;
  if (profile.notificationSettings !== undefined) columns.notification_settings = profile.notificationSettings;
  if (profile.privacySettings !== undefined) columns.privacy_settings = profile.privacySettings;

  return updateUserColumnsViaSupabase(userId, columns);
}

export async function updateUserGoalsViaSupabase(userId: string, goals: {
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbGoal?: number;
  dailyFatGoal?: number;
  dailyWaterGoal?: number;
}) {
  const columns: Record<string, unknown> = {};
  if (goals.dailyCalorieGoal !== undefined) columns.daily_calorie_goal = goals.dailyCalorieGoal;
  if (goals.dailyProteinGoal !== undefined) columns.daily_protein_goal = goals.dailyProteinGoal;
  if (goals.dailyCarbGoal !== undefined) columns.daily_carb_goal = goals.dailyCarbGoal;
  if (goals.dailyFatGoal !== undefined) columns.daily_fat_goal = goals.dailyFatGoal;
  if (goals.dailyWaterGoal !== undefined) columns.daily_water_goal = goals.dailyWaterGoal;

  return updateUserColumnsViaSupabase(userId, columns);
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

  return mapUserRow(data);
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

export async function deleteMealViaSupabase(id: number, userId?: string) {
  let query = supabaseAdmin.from('meals').delete().eq('id', id);
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { error } = await query;
  if (error) {
    throw error;
  }
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

function mapWaterIntake(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date ? new Date(row.date) : new Date(),
    glasses: toNumber(row.glasses),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function getUserWaterIntakeViaSupabase(userId: string, date: Date) {
  const start = startOfUtcDay(date);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const { data, error } = await supabaseAdmin
    .from('water_intake')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start.toISOString())
    .lt('date', end.toISOString())
    .order('date', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] ? mapWaterIntake(data[0]) : undefined;
}

export async function getUserWaterHistoryViaSupabase(userId: string, days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from('water_intake')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapWaterIntake);
}

export async function upsertWaterIntakeViaSupabase(userId: string, date: Date, glasses: number) {
  const existing = await getUserWaterIntakeViaSupabase(userId, date);

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('water_intake')
      .update({ glasses })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapWaterIntake(data);
  }

  const { data, error } = await supabaseAdmin
    .from('water_intake')
    .insert({
      user_id: userId,
      date: startOfUtcDay(date).toISOString(),
      glasses,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapWaterIntake(data);
}
