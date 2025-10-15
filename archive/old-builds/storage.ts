import {
  users,
  foods,
  recipes,
  recipeIngredients,
  meals,
  mealFoods,
  waterIntake,
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

  // Analytics
  getUserDailyStats(userId: string, date: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    waterGlasses: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserGoals(userId: string, goals: Partial<Pick<User, 'dailyCalorieGoal' | 'dailyProteinGoal' | 'dailyCarbGoal' | 'dailyFatGoal' | 'dailyWaterGoal'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...goals, updatedAt: new Date() })
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

    return {
      ...totals,
      waterGlasses: water?.glasses || 0,
    };
  }
}

export const storage = new DatabaseStorage();
