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
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email_verified')
    .eq('id', user.id)
    .maybeSingle();
  if (existingError) {
    throw existingError;
  }

  // Sign-in and auth syncs call this repeatedly; never overwrite what the user saved in Profile.
  const query = existing
    ? supabaseAdmin
        .from('users')
        .update({
          ...(user.email ? { email: user.email } : {}),
          first_name: existing.first_name || user.firstName || null,
          last_name: existing.last_name || user.lastName || null,
          email_verified: existing.email_verified || !!(user.emailVerified ?? true),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    : supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.firstName || null,
          last_name: user.lastName || null,
          email_verified: user.emailVerified ?? true,
          profile_icon: user.profileIcon || 1,
          updated_at: new Date().toISOString(),
        });

  const { data, error } = await query.select('*').single();

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
  const { data, error } = await supabaseAdmin
    .from('water_intake')
    .upsert(
      {
        user_id: userId,
        date: startOfUtcDay(date).toISOString(),
        glasses,
      },
      { onConflict: 'user_id,date' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapWaterIntake(data);
}

// fasting_sessions timestamps are "without time zone" and always hold UTC wall-clock values.
function parseUtcTimestamp(value: unknown): Date | null {
  if (!value) return null;
  const text = String(value);
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(text) ? text : `${text}Z`);
}

function mapFastingRow(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    planName: row.plan_name,
    startTime: parseUtcTimestamp(row.start_time)!,
    endTime: parseUtcTimestamp(row.end_time),
    targetDuration: Number(row.target_duration) || 0,
    actualDuration: row.actual_duration == null ? null : Number(row.actual_duration),
    status: row.status,
    createdAt: parseUtcTimestamp(row.created_at) ?? new Date(),
    completedAt: parseUtcTimestamp(row.completed_at),
  };
}

export async function createFastingSessionViaSupabase(session: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('fasting_sessions')
    .insert({
      id: session.id,
      user_id: session.userId,
      plan_id: session.planId,
      plan_name: session.planName,
      start_time: new Date(session.startTime).toISOString(),
      target_duration: Math.round(Number(session.targetDuration) || 0),
      status: session.status || 'active',
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapFastingRow(data);
}

export async function getUserFastingSessionsViaSupabase(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('fasting_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapFastingRow);
}

export async function getFastingSessionViaSupabase(id: string) {
  const { data, error } = await supabaseAdmin
    .from('fasting_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapFastingRow(data) : null;
}

export async function getUserActiveFastingSessionViaSupabase(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('fasting_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapFastingRow(data) : null;
}

export async function updateFastingSessionViaSupabase(id: string, updates: Record<string, any>) {
  const row: Record<string, unknown> = {};
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.planId !== undefined) row.plan_id = updates.planId;
  if (updates.planName !== undefined) row.plan_name = updates.planName;
  if (updates.startTime !== undefined) row.start_time = new Date(updates.startTime).toISOString();
  if (updates.endTime !== undefined) row.end_time = updates.endTime ? new Date(updates.endTime).toISOString() : null;
  if (updates.targetDuration !== undefined) row.target_duration = Math.round(Number(updates.targetDuration) || 0);
  if (updates.actualDuration !== undefined) row.actual_duration = updates.actualDuration == null ? null : Math.round(Number(updates.actualDuration));
  if (updates.completedAt !== undefined) row.completed_at = updates.completedAt ? new Date(updates.completedAt).toISOString() : null;

  const { data, error } = await supabaseAdmin
    .from('fasting_sessions')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapFastingRow(data);
}

export async function completeFastingSessionViaSupabase(id: string) {
  const existing = await getFastingSessionViaSupabase(id);
  if (!existing) throw new Error('Fasting session not found');
  const completedAt = new Date();
  return updateFastingSessionViaSupabase(id, {
    status: 'completed',
    endTime: completedAt,
    completedAt,
    actualDuration: Math.max(0, completedAt.getTime() - existing.startTime.getTime()),
  });
}

function mapAchievementRow(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    achievementType: row.achievement_type,
    achievementData: row.achievement_data ?? null,
    earnedAt: row.earned_at ? new Date(row.earned_at) : new Date(),
    viewed: !!row.viewed,
    title: row.title,
    description: row.description,
    iconName: row.icon_name,
    colorClass: row.color_class,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

export async function getUserAchievementsViaSupabase(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAchievementRow);
}

export async function createAchievementViaSupabase(achievement: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('achievements')
    .insert({
      user_id: achievement.userId,
      achievement_type: achievement.achievementType,
      achievement_data: achievement.achievementData ?? null,
      title: achievement.title,
      description: achievement.description ?? null,
      icon_name: achievement.iconName ?? null,
      color_class: achievement.colorClass ?? null,
      viewed: achievement.viewed ?? false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapAchievementRow(data);
}

function mapRecipeRow(row: any) {
  const str = (value: unknown) => (value === null || value === undefined ? null : String(value));
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    instructions: row.instructions,
    servings: row.servings,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    difficulty: row.difficulty,
    cuisine: row.cuisine,
    dietaryTags: row.dietary_tags,
    totalCalories: str(row.total_calories),
    totalProtein: str(row.total_protein),
    totalCarbs: str(row.total_carbs),
    totalFat: str(row.total_fat),
    totalFiber: str(row.total_fiber),
    totalSugar: str(row.total_sugar),
    totalSodium: str(row.total_sodium),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

export async function getUserRecipesViaSupabase(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRecipeRow);
}

export async function getRecipeByIdViaSupabase(id: number) {
  const { data, error } = await supabaseAdmin.from('recipes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  // Recipes saved from the app store totals only; ingredient rows need the foods table join.
  return data ? { ...mapRecipeRow(data), ingredients: [] } : undefined;
}

export async function createRecipeViaSupabase(recipe: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .insert({
      user_id: recipe.userId,
      name: recipe.name,
      description: recipe.description ?? null,
      instructions: recipe.instructions ?? null,
      servings: recipe.servings ?? 1,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapRecipeRow(data);
}

export async function updateRecipeNutritionViaSupabase(recipeId: number, nutrition: Record<string, string>) {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .update({
      total_calories: nutrition.totalCalories,
      total_protein: nutrition.totalProtein,
      total_carbs: nutrition.totalCarbs,
      total_fat: nutrition.totalFat,
      total_fiber: nutrition.totalFiber,
      total_sugar: nutrition.totalSugar,
      total_sodium: nutrition.totalSodium,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recipeId)
    .select('*')
    .single();
  if (error) throw error;
  return mapRecipeRow(data);
}

export async function deleteRecipeViaSupabase(id: number) {
  const { error } = await supabaseAdmin.from('recipes').delete().eq('id', id);
  if (error) throw error;
}
