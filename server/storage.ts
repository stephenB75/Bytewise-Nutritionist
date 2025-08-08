import {
  users,
  foods,
  recipes,
  recipeIngredients,
  meals,
  mealFoods,
  waterIntake,
  achievements,
  fastingSessions,
  type User,
  type UpsertUser,
  type Food,
  type InsertFood,
  type Recipe,
  type InsertRecipe,
  type RecipeIngredient,
  type InsertRecipeIngredient,
  type Meal,
  type InsertMeal,
  type MealFood,
  type InsertMealFood,
  type WaterIntake,
  type InsertWaterIntake,
  type FastingSession,
  type InsertFastingSession,
  type Achievement,
  type InsertAchievement,
  type RecipeWithIngredients,
  type MealWithFoods,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserGoals(userId: string, goals: Partial<Pick<User, 'dailyCalorieGoal' | 'dailyProteinGoal' | 'dailyCarbGoal' | 'dailyFatGoal' | 'dailyWaterGoal'>>): Promise<User>;
  updateUserProfile(userId: string, profileData: {
    firstName?: string;
    lastName?: string;
    personalInfo?: any;
    notificationSettings?: any;
    privacySettings?: any;
  }): Promise<User>;

  // Food operations
  searchFoods(query: string, limit?: number): Promise<Food[]>;
  getFoodById(id: number): Promise<Food | undefined>;
  createFood(food: InsertFood): Promise<Food>;
  getPopularFoods(limit?: number): Promise<Food[]>;

  // Recipe operations
  getUserRecipes(userId: string): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<RecipeWithIngredients | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe>;
  deleteRecipe(id: number): Promise<void>;
  addRecipeIngredient(ingredient: InsertRecipeIngredient): Promise<RecipeIngredient>;
  removeRecipeIngredient(recipeId: number, foodId: number): Promise<void>;
  updateRecipeNutrition(recipeId: number, nutrition: {
    totalCalories: string;
    totalProtein: string;
    totalCarbs: string;
    totalFat: string;
    totalFiber: string;
    totalSugar: string;
    totalSodium: string;
  }): Promise<Recipe>;

  // Meal operations
  getUserMeals(userId: string, startDate?: Date, endDate?: Date): Promise<MealWithFoods[]>;
  getMealById(id: number): Promise<MealWithFoods | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal>;
  deleteMeal(id: number): Promise<void>;
  addMealFood(mealFood: InsertMealFood): Promise<MealFood>;
  removeMealFood(mealId: number, foodId?: number, recipeId?: number): Promise<void>;

  // Water intake operations
  getUserWaterIntake(userId: string, date: Date): Promise<WaterIntake | undefined>;
  upsertWaterIntake(waterIntake: InsertWaterIntake): Promise<WaterIntake>;

  // Achievement operations
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  checkAndCreateAchievements(userId: string): Promise<Achievement[]>;

  // Analytics
  getUserDailyStats(userId: string, date: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    waterGlasses: number;
    fastingStatus?: {
      isActive: boolean;
      timeRemaining?: number;
      planName?: string;
    };
  }>;
  
  // Fasting sessions
  createFastingSession(session: InsertFastingSession): Promise<FastingSession>;
  getUserFastingSessions(userId: string): Promise<FastingSession[]>;
  getFastingSession(id: string): Promise<FastingSession | null>;
  updateFastingSession(id: string, updates: Partial<FastingSession>): Promise<FastingSession>;
  completeFastingSession(id: string): Promise<FastingSession>;
  getUserActiveFastingSession(userId: string): Promise<FastingSession | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Try to insert first, then update if conflict occurs
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error: any) {
      // If there's an email conflict, try to update by email
      if (error.code === '23505' && error.constraint === 'users_email_unique') {

        const [existingUser] = await db
          .update(users)
          .set({
            id: userData.id, // Update with Supabase ID
            firstName: userData.firstName,
            lastName: userData.lastName,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email!))
          .returning();
        
        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }

  async updateUserGoals(userId: string, goals: Partial<Pick<User, 'dailyCalorieGoal' | 'dailyProteinGoal' | 'dailyCarbGoal' | 'dailyFatGoal' | 'dailyWaterGoal'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...goals, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: {
    firstName?: string;
    lastName?: string;
    personalInfo?: any;
    notificationSettings?: any;
    privacySettings?: any;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Food operations
  async searchFoods(query: string, limit = 20): Promise<Food[]> {
    return await db
      .select()
      .from(foods)
      .where(like(foods.name, `%${query}%`))
      .orderBy(desc(foods.verified), foods.name)
      .limit(limit);
  }

  async getFoodById(id: number): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food;
  }

  async createFood(food: InsertFood): Promise<Food> {
    const [newFood] = await db.insert(foods).values(food).returning();
    return newFood;
  }

  async getPopularFoods(limit = 10): Promise<Food[]> {
    return await db
      .select()
      .from(foods)
      .where(eq(foods.verified, true))
      .orderBy(foods.name)
      .limit(limit);
  }

  // Recipe operations
  async getUserRecipes(userId: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt));
  }

  async getRecipeById(id: number): Promise<RecipeWithIngredients | undefined> {
    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id));

    if (!recipe[0]) return undefined;

    const ingredients = await db
      .select({
        id: recipeIngredients.id,
        recipeId: recipeIngredients.recipeId,
        foodId: recipeIngredients.foodId,
        quantity: recipeIngredients.quantity,
        unit: recipeIngredients.unit,
        order: recipeIngredients.order,
        food: foods,
      })
      .from(recipeIngredients)
      .innerJoin(foods, eq(recipeIngredients.foodId, foods.id))
      .where(eq(recipeIngredients.recipeId, id))
      .orderBy(recipeIngredients.order);

    return {
      ...recipe[0],
      ingredients,
    };
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  async updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe> {
    const [updatedRecipe] = await db
      .update(recipes)
      .set({ ...recipe, updatedAt: new Date() })
      .where(eq(recipes.id, id))
      .returning();
    return updatedRecipe;
  }

  async deleteRecipe(id: number): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  async addRecipeIngredient(ingredient: InsertRecipeIngredient): Promise<RecipeIngredient> {
    const [newIngredient] = await db
      .insert(recipeIngredients)
      .values(ingredient)
      .returning();
    return newIngredient;
  }

  async removeRecipeIngredient(recipeId: number, foodId: number): Promise<void> {
    await db
      .delete(recipeIngredients)
      .where(
        and(
          eq(recipeIngredients.recipeId, recipeId),
          eq(recipeIngredients.foodId, foodId)
        )
      );
  }

  async updateRecipeNutrition(recipeId: number, nutrition: {
    totalCalories: string;
    totalProtein: string;
    totalCarbs: string;
    totalFat: string;
    totalFiber: string;
    totalSugar: string;
    totalSodium: string;
  }): Promise<Recipe> {
    const [updatedRecipe] = await db
      .update(recipes)
      .set({ ...nutrition, updatedAt: new Date() })
      .where(eq(recipes.id, recipeId))
      .returning();
    return updatedRecipe;
  }

  // Meal operations
  async getUserMeals(userId: string, startDate?: Date, endDate?: Date): Promise<MealWithFoods[]> {
    let whereClause = eq(meals.userId, userId);

    if (startDate && endDate) {
      whereClause = and(
        eq(meals.userId, userId),
        gte(meals.date, startDate),
        lte(meals.date, endDate)
      )!;
    }

    const userMeals = await db
      .select()
      .from(meals)
      .where(whereClause)
      .orderBy(desc(meals.date));

    const mealsWithFoods = await Promise.all(
      userMeals.map(async (meal) => {
        const mealFoodItems = await db
          .select({
            id: mealFoods.id,
            mealId: mealFoods.mealId,
            foodId: mealFoods.foodId,
            recipeId: mealFoods.recipeId,
            quantity: mealFoods.quantity,
            unit: mealFoods.unit,
            calories: mealFoods.calories,
            protein: mealFoods.protein,
            carbs: mealFoods.carbs,
            fat: mealFoods.fat,
            food: foods,
            recipe: recipes,
          })
          .from(mealFoods)
          .leftJoin(foods, eq(mealFoods.foodId, foods.id))
          .leftJoin(recipes, eq(mealFoods.recipeId, recipes.id))
          .where(eq(mealFoods.mealId, meal.id));

        return {
          ...meal,
          foods: mealFoodItems.map(item => ({
            ...item,
            food: item.food || undefined,
            recipe: item.recipe || undefined,
          })),
        };
      })
    );

    return mealsWithFoods;
  }

  async getMealById(id: number): Promise<MealWithFoods | undefined> {
    const [meal] = await db.select().from(meals).where(eq(meals.id, id));
    if (!meal) return undefined;

    const mealFoodItems = await db
      .select({
        id: mealFoods.id,
        mealId: mealFoods.mealId,
        foodId: mealFoods.foodId,
        recipeId: mealFoods.recipeId,
        quantity: mealFoods.quantity,
        unit: mealFoods.unit,
        calories: mealFoods.calories,
        protein: mealFoods.protein,
        carbs: mealFoods.carbs,
        fat: mealFoods.fat,
        food: foods,
        recipe: recipes,
      })
      .from(mealFoods)
      .leftJoin(foods, eq(mealFoods.foodId, foods.id))
      .leftJoin(recipes, eq(mealFoods.recipeId, recipes.id))
      .where(eq(mealFoods.mealId, id));

    return {
      ...meal,
      foods: mealFoodItems.map(item => ({
        ...item,
        food: item.food || undefined,
        recipe: item.recipe || undefined,
      })),
    };
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal> {
    const [updatedMeal] = await db
      .update(meals)
      .set(meal)
      .where(eq(meals.id, id))
      .returning();
    return updatedMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  async addMealFood(mealFood: InsertMealFood): Promise<MealFood> {
    const [newMealFood] = await db.insert(mealFoods).values(mealFood).returning();
    return newMealFood;
  }

  async removeMealFood(mealId: number, foodId?: number, recipeId?: number): Promise<void> {
    const conditions = [eq(mealFoods.mealId, mealId)];
    
    if (foodId) {
      conditions.push(eq(mealFoods.foodId, foodId));
    }
    
    if (recipeId) {
      conditions.push(eq(mealFoods.recipeId, recipeId));
    }

    await db.delete(mealFoods).where(and(...conditions));
  }

  // Water intake operations
  async getUserWaterIntake(userId: string, date: Date): Promise<WaterIntake | undefined> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const [intake] = await db
      .select()
      .from(waterIntake)
      .where(
        and(
          eq(waterIntake.userId, userId),
          gte(waterIntake.date, startOfDay),
          lte(waterIntake.date, endOfDay)
        )
      );

    return intake;
  }

  async upsertWaterIntake(intake: InsertWaterIntake): Promise<WaterIntake> {
    const existing = await this.getUserWaterIntake(intake.userId, intake.date);
    
    if (existing) {
      const [updated] = await db
        .update(waterIntake)
        .set({ glasses: intake.glasses })
        .where(eq(waterIntake.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newIntake] = await db.insert(waterIntake).values(intake).returning();
      return newIntake;
    }
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async checkAndCreateAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get user's daily stats
    const dailyStats = await this.getUserDailyStats(userId, today);
    const user = await this.getUser(userId);
    
    if (!user) return newAchievements;

    // Get existing achievements to avoid duplicates
    const existingAchievements = await this.getUserAchievements(userId);
    const achievementTypes = existingAchievements.map(a => a.achievementType);



    // Check First Day Achievement
    if (!achievementTypes.includes('first_day_complete') && dailyStats.totalCalories >= 500) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'first_day_complete',
        title: 'First Day Complete',
        description: 'Successfully logged your first day of nutrition tracking',
        iconName: 'target',
        colorClass: 'bg-green-500/20 border-green-500/30'
      });
      newAchievements.push(achievement);
    }

    // Check Calorie Goal Achievement
    const calorieGoalMin = (user.dailyCalorieGoal || 2000) * 0.9;
    const calorieGoalMax = (user.dailyCalorieGoal || 2000) * 1.1;
    const calorieGoalMet = dailyStats.totalCalories >= calorieGoalMin && dailyStats.totalCalories <= calorieGoalMax;
    
    if (!achievementTypes.includes('calorie_goal_met') && calorieGoalMet) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'calorie_goal_met',
        title: 'Calorie Goal Achieved',
        description: 'Hit your daily calorie target within 10%',
        iconName: 'flame',
        colorClass: 'bg-orange-500/20 border-orange-500/30'
      });
      newAchievements.push(achievement);
    }

    // Check Protein Goal Achievement
    const proteinGoalTarget = (user.dailyProteinGoal || 150) * 0.9;
    const proteinGoalMet = dailyStats.totalProtein >= proteinGoalTarget;
    
    if (!achievementTypes.includes('protein_goal_met') && proteinGoalMet) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'protein_goal_met',
        title: 'Protein Champion',
        description: 'Met your daily protein goal',
        iconName: 'zap',
        colorClass: 'bg-purple-500/20 border-purple-500/30'
      });
      newAchievements.push(achievement);
    }

    // Check Three Meals Achievement
    const todayMeals = await db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.date, startOfToday),
          lte(meals.date, new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000))
        )
      );

    if (!achievementTypes.includes('three_meals_logged') && todayMeals.length >= 3) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'three_meals_logged',
        title: 'Meal Tracker',
        description: 'Logged 3 or more meals in a day',
        iconName: 'utensils',
        colorClass: 'bg-blue-500/20 border-blue-500/30'
      });
      newAchievements.push(achievement);
    }

    // Check Weekly Streak (simplified - check if user has meals for 5 of last 7 days)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekMeals = await db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.date, sevenDaysAgo)
        )
      );

    const daysWithMeals = new Set(
      weekMeals.map(meal => meal.date.toISOString().split('T')[0])
    ).size;

    if (!achievementTypes.includes('five_day_streak') && daysWithMeals >= 5) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'five_day_streak',
        title: '5 Day Streak',
        description: 'Tracked nutrition for 5 days this week',
        iconName: 'calendar',
        colorClass: 'bg-yellow-500/20 border-yellow-500/30'
      });
      newAchievements.push(achievement);
    }

    // Check Fasting Achievements
    const userFastingSessions = await db
      .select()
      .from(fastingSessions)
      .where(
        and(
          eq(fastingSessions.userId, userId),
          eq(fastingSessions.status, 'completed')
        )
      );

    const completedFasts = userFastingSessions.length;

    // First Fast Achievement
    if (!achievementTypes.includes('first_fast_completed') && completedFasts >= 1) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'first_fast_completed',
        title: 'Fasting Beginner',
        description: 'Completed your first intermittent fast',
        iconName: 'clock',
        colorClass: 'bg-blue-500/20 border-blue-500/30'
      });
      newAchievements.push(achievement);
    }

    // 5 Fasts Achievement
    if (!achievementTypes.includes('five_fasts_completed') && completedFasts >= 5) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'five_fasts_completed',
        title: 'Fasting Streak',
        description: 'Completed 5 intermittent fasting sessions',
        iconName: 'flame',
        colorClass: 'bg-orange-500/20 border-orange-500/30'
      });
      newAchievements.push(achievement);
    }

    // 20 Fasts Achievement
    if (!achievementTypes.includes('twenty_fasts_completed') && completedFasts >= 20) {
      const achievement = await this.createAchievement({
        userId,
        achievementType: 'twenty_fasts_completed',
        title: 'Fasting Master',
        description: 'Completed 20 intermittent fasting sessions',
        iconName: 'trophy',
        colorClass: 'bg-purple-500/20 border-purple-500/30'
      });
      newAchievements.push(achievement);
    }

    return newAchievements;
  }

  // Analytics
  async getUserDailyStats(userId: string, date: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    waterGlasses: number;
  }> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    // Get meals for the day
    const dayMeals = await db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.date, startOfDay),
          lte(meals.date, endOfDay)
        )
      );

    // Sum up nutrition from all meals
    const totals = dayMeals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + Number(meal.totalCalories || 0),
      totalProtein: acc.totalProtein + Number(meal.totalProtein || 0),
      totalCarbs: acc.totalCarbs + Number(meal.totalCarbs || 0),
      totalFat: acc.totalFat + Number(meal.totalFat || 0),
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    });

    // Get water intake
    const water = await this.getUserWaterIntake(userId, date);

    // Get active fasting session
    const activeFasting = await this.getUserActiveFastingSession(userId);
    let fastingStatus = undefined;
    
    if (activeFasting) {
      const now = new Date().getTime();
      const startTime = new Date(activeFasting.startTime).getTime();
      const elapsed = now - startTime;
      const remaining = Math.max(0, activeFasting.targetDuration - elapsed);
      
      fastingStatus = {
        isActive: activeFasting.status === 'active' && remaining > 0,
        timeRemaining: remaining,
        planName: activeFasting.planName
      };
    }

    return {
      ...totals,
      waterGlasses: water?.glasses || 0,
      fastingStatus
    };
  }

  // Fasting session operations
  async createFastingSession(session: InsertFastingSession): Promise<FastingSession> {
    const [newSession] = await db.insert(fastingSessions).values(session).returning();
    return newSession;
  }

  async getUserFastingSessions(userId: string): Promise<FastingSession[]> {
    return db
      .select()
      .from(fastingSessions)
      .where(eq(fastingSessions.userId, userId))
      .orderBy(desc(fastingSessions.createdAt));
  }

  async getFastingSession(id: string): Promise<FastingSession | null> {
    const [session] = await db
      .select()
      .from(fastingSessions)
      .where(eq(fastingSessions.id, id));
    return session || null;
  }

  async updateFastingSession(id: string, updates: Partial<FastingSession>): Promise<FastingSession> {
    const [updated] = await db
      .update(fastingSessions)
      .set(updates)
      .where(eq(fastingSessions.id, id))
      .returning();
    return updated;
  }

  async completeFastingSession(id: string): Promise<FastingSession> {
    const completedAt = new Date();
    const [completed] = await db
      .update(fastingSessions)
      .set({ 
        status: 'completed',
        endTime: completedAt,
        completedAt,
        actualDuration: sql`${fastingSessions.targetDuration}`
      })
      .where(eq(fastingSessions.id, id))
      .returning();
    
    // Check for fasting achievements
    if (completed) {
      await this.checkAndCreateAchievements(completed.userId);
    }
    
    return completed;
  }

  async getUserActiveFastingSession(userId: string): Promise<FastingSession | null> {
    const [session] = await db
      .select()
      .from(fastingSessions)
      .where(and(
        eq(fastingSessions.userId, userId),
        eq(fastingSessions.status, 'active')
      ))
      .orderBy(desc(fastingSessions.createdAt))
      .limit(1);
    return session || null;
  }
}

export const storage = new DatabaseStorage();
