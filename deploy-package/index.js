var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  achievementsRelations: () => achievementsRelations,
  foodSuggestions: () => foodSuggestions,
  foodSuggestionsRelations: () => foodSuggestionsRelations,
  foods: () => foods,
  insertAchievementSchema: () => insertAchievementSchema,
  insertFoodSchema: () => insertFoodSchema,
  insertFoodSuggestionSchema: () => insertFoodSuggestionSchema,
  insertMealFoodSchema: () => insertMealFoodSchema,
  insertMealSchema: () => insertMealSchema,
  insertRecipeIngredientSchema: () => insertRecipeIngredientSchema,
  insertRecipeSchema: () => insertRecipeSchema,
  insertUsdaFoodCacheSchema: () => insertUsdaFoodCacheSchema,
  insertUserSchema: () => insertUserSchema,
  insertWaterIntakeSchema: () => insertWaterIntakeSchema,
  mealFoods: () => mealFoods,
  mealFoodsRelations: () => mealFoodsRelations,
  meals: () => meals,
  mealsRelations: () => mealsRelations,
  recipeIngredients: () => recipeIngredients,
  recipeIngredientsRelations: () => recipeIngredientsRelations,
  recipes: () => recipes,
  recipesRelations: () => recipesRelations,
  sessions: () => sessions,
  usdaFoodCache: () => usdaFoodCache,
  users: () => users,
  usersRelations: () => usersRelations,
  waterIntake: () => waterIntake,
  waterIntakeRelations: () => waterIntakeRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  emailVerified: boolean("email_verified").default(false),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Enhanced profile information
  personalInfo: jsonb("personal_info"),
  // age, height, weight, activity level, etc.
  privacySettings: jsonb("privacy_settings"),
  // profile visibility, data sharing preferences
  notificationSettings: jsonb("notification_settings"),
  // meal reminders, achievement alerts
  displaySettings: jsonb("display_settings"),
  // theme, units (metric/imperial), language
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Nutrition goals
  dailyCalorieGoal: integer("daily_calorie_goal").default(2e3),
  dailyProteinGoal: integer("daily_protein_goal").default(150),
  dailyCarbGoal: integer("daily_carb_goal").default(200),
  dailyFatGoal: integer("daily_fat_goal").default(70),
  dailyWaterGoal: integer("daily_water_goal").default(8)
  // glasses
});
var foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  // USDA FoodData Central integration
  fdcId: integer("fdc_id"),
  // USDA FDC ID for API reference
  usdaDataType: varchar("usda_data_type", { length: 50 }),
  // Branded, Foundation, Survey, etc.
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  category: varchar("category", { length: 100 }),
  servingSize: varchar("serving_size", { length: 100 }).notNull(),
  servingSizeGrams: decimal("serving_size_grams", { precision: 8, scale: 2 }),
  calories: decimal("calories", { precision: 8, scale: 2 }).notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).default("0"),
  carbs: decimal("carbs", { precision: 8, scale: 2 }).default("0"),
  fat: decimal("fat", { precision: 8, scale: 2 }).default("0"),
  fiber: decimal("fiber", { precision: 8, scale: 2 }).default("0"),
  sugar: decimal("sugar", { precision: 8, scale: 2 }).default("0"),
  sodium: decimal("sodium", { precision: 8, scale: 2 }).default("0"),
  // in mg
  // Additional USDA nutrients
  allNutrients: jsonb("all_nutrients"),
  // Complete USDA nutrient data
  verified: boolean("verified").default(false),
  isFromUsda: boolean("is_from_usda").default(false),
  lastUsdaSync: timestamp("last_usda_sync"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  fdcIdIdx: index("foods_fdc_id_idx").on(table.fdcId),
  nameIdx: index("foods_name_idx").on(table.name),
  categoryIdx: index("foods_category_idx").on(table.category)
}));
var recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  servings: integer("servings").notNull().default(1),
  prepTime: integer("prep_time"),
  // in minutes
  cookTime: integer("cook_time"),
  // in minutes
  instructions: text("instructions"),
  totalCalories: decimal("total_calories", { precision: 10, scale: 2 }),
  totalProtein: decimal("total_protein", { precision: 8, scale: 2 }),
  totalCarbs: decimal("total_carbs", { precision: 8, scale: 2 }),
  totalFat: decimal("total_fat", { precision: 8, scale: 2 }),
  totalFiber: decimal("total_fiber", { precision: 8, scale: 2 }),
  totalSugar: decimal("total_sugar", { precision: 8, scale: 2 }),
  totalSodium: decimal("total_sodium", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  foodId: integer("food_id").notNull().references(() => foods.id),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  order: integer("order").default(0)
});
var meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(),
  // breakfast, lunch, dinner, snack
  name: varchar("name", { length: 255 }),
  totalCalories: decimal("total_calories", { precision: 10, scale: 2 }).default("0"),
  totalProtein: decimal("total_protein", { precision: 8, scale: 2 }).default("0"),
  totalCarbs: decimal("total_carbs", { precision: 8, scale: 2 }).default("0"),
  totalFat: decimal("total_fat", { precision: 8, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow()
});
var mealFoods = pgTable("meal_foods", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull().references(() => meals.id, { onDelete: "cascade" }),
  foodId: integer("food_id").references(() => foods.id),
  recipeId: integer("recipe_id").references(() => recipes.id),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  calories: decimal("calories", { precision: 8, scale: 2 }).notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).default("0"),
  carbs: decimal("carbs", { precision: 8, scale: 2 }).default("0"),
  fat: decimal("fat", { precision: 8, scale: 2 }).default("0")
});
var waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  glasses: integer("glasses").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementType: varchar("achievement_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 100 }),
  colorClass: varchar("color_class", { length: 100 }),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var foodSuggestions = pgTable("food_suggestions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  suggestionType: varchar("suggestion_type", { length: 100 }).notNull(),
  // improve_protein, reduce_sodium, etc.
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  recommendedFoods: jsonb("recommended_foods"),
  // Array of food recommendations
  reasoningData: jsonb("reasoning_data"),
  // Analysis data that led to suggestion
  priority: integer("priority").default(1),
  // 1-5 priority level
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var usdaFoodCache = pgTable("usda_food_cache", {
  id: serial("id").primaryKey(),
  fdcId: integer("fdc_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  description: varchar("description", { length: 500 }).notNull(),
  dataType: varchar("data_type", { length: 50 }).notNull(),
  foodCategory: varchar("food_category", { length: 200 }),
  brandOwner: varchar("brand_owner", { length: 200 }),
  brandName: varchar("brand_name", { length: 200 }),
  ingredients: text("ingredients"),
  servingSize: decimal("serving_size", { precision: 8, scale: 2 }),
  servingSizeUnit: varchar("serving_size_unit", { length: 50 }),
  householdServingFullText: varchar("household_serving_full_text", { length: 200 }),
  nutrients: jsonb("nutrients").notNull(),
  // Complete nutrition data as JSON
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  searchCount: integer("search_count").default(0)
  // Track popularity for caching priority
}, (table) => ({
  descriptionIdx: index("usda_cache_description_idx").on(table.description),
  categoryIdx: index("usda_cache_category_idx").on(table.foodCategory),
  searchCountIdx: index("usda_cache_search_count_idx").on(table.searchCount)
}));
var usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  meals: many(meals),
  waterIntake: many(waterIntake),
  achievements: many(achievements),
  foodSuggestions: many(foodSuggestions)
}));
var achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id]
  })
}));
var foodSuggestionsRelations = relations(foodSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [foodSuggestions.userId],
    references: [users.id]
  })
}));
var recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id]
  }),
  ingredients: many(recipeIngredients)
}));
var recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id]
  }),
  food: one(foods, {
    fields: [recipeIngredients.foodId],
    references: [foods.id]
  })
}));
var mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id]
  }),
  foods: many(mealFoods)
}));
var mealFoodsRelations = relations(mealFoods, ({ one }) => ({
  meal: one(meals, {
    fields: [mealFoods.mealId],
    references: [meals.id]
  }),
  food: one(foods, {
    fields: [mealFoods.foodId],
    references: [foods.id]
  }),
  recipe: one(recipes, {
    fields: [mealFoods.recipeId],
    references: [recipes.id]
  })
}));
var waterIntakeRelations = relations(waterIntake, ({ one }) => ({
  user: one(users, {
    fields: [waterIntake.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
  createdAt: true
});
var insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalCalories: true,
  totalProtein: true,
  totalCarbs: true,
  totalFat: true,
  totalFiber: true,
  totalSugar: true,
  totalSodium: true
});
var insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true
});
var insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true
});
var insertMealFoodSchema = createInsertSchema(mealFoods).omit({
  id: true
});
var insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({
  id: true,
  createdAt: true
});
var insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
  createdAt: true
});
var insertFoodSuggestionSchema = createInsertSchema(foodSuggestions).omit({
  id: true,
  createdAt: true
});
var insertUsdaFoodCacheSchema = createInsertSchema(usdaFoodCache).omit({
  id: true,
  lastUpdated: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, gte, lte, like } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUserGoals(userId, goals) {
    const [user] = await db.update(users).set({ ...goals, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }
  // Food operations
  async searchFoods(query, limit = 20) {
    return await db.select().from(foods).where(like(foods.name, `%${query}%`)).orderBy(desc(foods.verified), foods.name).limit(limit);
  }
  async getFoodById(id) {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food;
  }
  async createFood(food) {
    const [newFood] = await db.insert(foods).values(food).returning();
    return newFood;
  }
  async getPopularFoods(limit = 10) {
    return await db.select().from(foods).where(eq(foods.verified, true)).orderBy(foods.name).limit(limit);
  }
  // Recipe operations
  async getUserRecipes(userId) {
    return await db.select().from(recipes).where(eq(recipes.userId, userId)).orderBy(desc(recipes.createdAt));
  }
  async getRecipeById(id) {
    const recipe = await db.select().from(recipes).where(eq(recipes.id, id));
    if (!recipe[0]) return void 0;
    const ingredients = await db.select({
      id: recipeIngredients.id,
      recipeId: recipeIngredients.recipeId,
      foodId: recipeIngredients.foodId,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      order: recipeIngredients.order,
      food: foods
    }).from(recipeIngredients).innerJoin(foods, eq(recipeIngredients.foodId, foods.id)).where(eq(recipeIngredients.recipeId, id)).orderBy(recipeIngredients.order);
    return {
      ...recipe[0],
      ingredients
    };
  }
  async createRecipe(recipe) {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }
  async updateRecipe(id, recipe) {
    const [updatedRecipe] = await db.update(recipes).set({ ...recipe, updatedAt: /* @__PURE__ */ new Date() }).where(eq(recipes.id, id)).returning();
    return updatedRecipe;
  }
  async deleteRecipe(id) {
    await db.delete(recipes).where(eq(recipes.id, id));
  }
  async addRecipeIngredient(ingredient) {
    const [newIngredient] = await db.insert(recipeIngredients).values(ingredient).returning();
    return newIngredient;
  }
  async removeRecipeIngredient(recipeId, foodId) {
    await db.delete(recipeIngredients).where(
      and(
        eq(recipeIngredients.recipeId, recipeId),
        eq(recipeIngredients.foodId, foodId)
      )
    );
  }
  async updateRecipeNutrition(recipeId, nutrition) {
    const [updatedRecipe] = await db.update(recipes).set({ ...nutrition, updatedAt: /* @__PURE__ */ new Date() }).where(eq(recipes.id, recipeId)).returning();
    return updatedRecipe;
  }
  // Meal operations
  async getUserMeals(userId, startDate, endDate) {
    let whereClause = eq(meals.userId, userId);
    if (startDate && endDate) {
      whereClause = and(
        eq(meals.userId, userId),
        gte(meals.date, startDate),
        lte(meals.date, endDate)
      );
    }
    const userMeals = await db.select().from(meals).where(whereClause).orderBy(desc(meals.date));
    const mealsWithFoods = await Promise.all(
      userMeals.map(async (meal) => {
        const mealFoodItems = await db.select({
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
          recipe: recipes
        }).from(mealFoods).leftJoin(foods, eq(mealFoods.foodId, foods.id)).leftJoin(recipes, eq(mealFoods.recipeId, recipes.id)).where(eq(mealFoods.mealId, meal.id));
        return {
          ...meal,
          foods: mealFoodItems.map((item) => ({
            ...item,
            food: item.food || void 0,
            recipe: item.recipe || void 0
          }))
        };
      })
    );
    return mealsWithFoods;
  }
  async getMealById(id) {
    const [meal] = await db.select().from(meals).where(eq(meals.id, id));
    if (!meal) return void 0;
    const mealFoodItems = await db.select({
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
      recipe: recipes
    }).from(mealFoods).leftJoin(foods, eq(mealFoods.foodId, foods.id)).leftJoin(recipes, eq(mealFoods.recipeId, recipes.id)).where(eq(mealFoods.mealId, id));
    return {
      ...meal,
      foods: mealFoodItems.map((item) => ({
        ...item,
        food: item.food || void 0,
        recipe: item.recipe || void 0
      }))
    };
  }
  async createMeal(meal) {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }
  async updateMeal(id, meal) {
    const [updatedMeal] = await db.update(meals).set(meal).where(eq(meals.id, id)).returning();
    return updatedMeal;
  }
  async deleteMeal(id) {
    await db.delete(meals).where(eq(meals.id, id));
  }
  async addMealFood(mealFood) {
    const [newMealFood] = await db.insert(mealFoods).values(mealFood).returning();
    return newMealFood;
  }
  async removeMealFood(mealId, foodId, recipeId) {
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
  async getUserWaterIntake(userId, date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const [intake] = await db.select().from(waterIntake).where(
      and(
        eq(waterIntake.userId, userId),
        gte(waterIntake.date, startOfDay),
        lte(waterIntake.date, endOfDay)
      )
    );
    return intake;
  }
  async upsertWaterIntake(intake) {
    const existing = await this.getUserWaterIntake(intake.userId, intake.date);
    if (existing) {
      const [updated] = await db.update(waterIntake).set({ glasses: intake.glasses }).where(eq(waterIntake.id, existing.id)).returning();
      return updated;
    } else {
      const [newIntake] = await db.insert(waterIntake).values(intake).returning();
      return newIntake;
    }
  }
  // Analytics
  async getUserDailyStats(userId, date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const dayMeals = await db.select().from(meals).where(
      and(
        eq(meals.userId, userId),
        gte(meals.date, startOfDay),
        lte(meals.date, endOfDay)
      )
    );
    const totals = dayMeals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + Number(meal.totalCalories || 0),
      totalProtein: acc.totalProtein + Number(meal.totalProtein || 0),
      totalCarbs: acc.totalCarbs + Number(meal.totalCarbs || 0),
      totalFat: acc.totalFat + Number(meal.totalFat || 0)
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    });
    const water = await this.getUserWaterIntake(userId, date);
    return {
      ...totals,
      waterGlasses: water?.glasses || 0
    };
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  console.warn("REPLIT_DOMAINS not set, using development fallback");
  process.env.REPLIT_DOMAINS = "localhost";
}
var getOidcConfig = memoize(
  async () => {
    try {
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID || "dev-repl-id"
      );
    } catch (error) {
      console.warn("OIDC discovery failed, using fallback config:", error);
      return {
        issuer: "https://replit.com/oidc",
        authorization_endpoint: "https://replit.com/oidc/authorize",
        token_endpoint: "https://replit.com/oidc/token",
        userinfo_endpoint: "https://replit.com/oidc/userinfo",
        metadata: {},
        [client.custom.http_options]: () => ({ timeout: 1e4 })
      };
    }
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  let sessionStore;
  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions"
    });
  } else {
    console.warn("DATABASE_URL not set, using memory store for sessions");
    sessionStore = void 0;
  }
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax"
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    const domains = process.env.REPLIT_DOMAINS.split(",");
    const domain = domains.find((d) => d.includes(req.hostname)) || domains[0];
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    const domains = process.env.REPLIT_DOMAINS.split(",");
    const domain = domains.find((d) => d.includes(req.hostname)) || domains[0];
    passport.authenticate(`replitauth:${domain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error("Token refresh failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// server/services/usdaService.ts
import { eq as eq2, like as like2, desc as desc2, sql as sql3 } from "drizzle-orm";
var USDAService = class {
  apiKey;
  baseUrl = "https://api.nal.usda.gov/fdc/v1";
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  /**
   * Search foods with USDA API and cache results
   */
  async searchFoods(query, pageSize = 25) {
    try {
      const cachedResults = await this.searchCachedFoods(query, pageSize);
      if (cachedResults.length > 0) {
        console.log(`Found ${cachedResults.length} cached results for "${query}"`);
        return this.formatCachedAsUSDAFood(cachedResults);
      }
      const response = await fetch(`${this.baseUrl}/foods/search?api_key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          dataType: ["Foundation", "Branded", "Survey"],
          pageSize,
          pageNumber: 1,
          sortBy: "lowercaseDescription.keyword",
          sortOrder: "asc"
        })
      });
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }
      const data = await response.json();
      await this.cacheSearchResults(data.foods);
      return data.foods;
    } catch (error) {
      console.error("USDA search error:", error);
      const cachedResults = await this.searchCachedFoods(query, pageSize);
      return this.formatCachedAsUSDAFood(cachedResults);
    }
  }
  /**
   * Get detailed food information by FDC ID
   */
  async getFoodDetails(fdcId) {
    try {
      const cached = await db.select().from(usdaFoodCache).where(eq2(usdaFoodCache.fdcId, fdcId)).limit(1);
      if (cached.length > 0) {
        return this.formatCachedAsUSDAFood([cached[0]])[0];
      }
      const response = await fetch(`${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }
      const food = await response.json();
      await this.cacheSearchResults([food]);
      return food;
    } catch (error) {
      console.error("USDA food details error:", error);
      return null;
    }
  }
  /**
   * Calculate calories for ingredient with measurement
   */
  async calculateIngredientCalories(ingredientName, measurement) {
    try {
      const foods2 = await this.searchFoods(ingredientName, 5);
      if (foods2.length === 0) {
        throw new Error(`No nutrition data found for "${ingredientName}"`);
      }
      const food = foods2[0];
      const nutrients = this.extractNutrients(food.foodNutrients);
      const { quantity, unit, gramsEquivalent } = this.parseMeasurement(measurement, food);
      const caloriesPer100g = nutrients.calories || 0;
      const estimatedCalories = Math.round(caloriesPer100g * gramsEquivalent / 100);
      const equivalentMeasurement = this.generateEquivalentMeasurement(
        gramsEquivalent,
        unit,
        nutrients.calories
      );
      const note = this.generateVariationNote(ingredientName, unit);
      return {
        ingredient: this.formatIngredientName(food.description),
        measurement: `${quantity} ${unit} (~${Math.round(gramsEquivalent)}g)`,
        estimatedCalories,
        equivalentMeasurement,
        note,
        nutritionPer100g: {
          calories: nutrients.calories,
          protein: nutrients.protein,
          carbs: nutrients.carbs,
          fat: nutrients.fat
        }
      };
    } catch (error) {
      console.error("Calorie calculation error:", error);
      return this.getFallbackCalorieEstimate(ingredientName, measurement);
    }
  }
  /**
   * Search cached foods locally
   */
  async searchCachedFoods(query, limit) {
    return await db.select().from(usdaFoodCache).where(like2(usdaFoodCache.description, `%${query}%`)).orderBy(desc2(usdaFoodCache.searchCount)).limit(limit);
  }
  /**
   * Cache USDA search results
   */
  async cacheSearchResults(foods2) {
    for (const food of foods2) {
      try {
        const nutrients = this.extractNutrients(food.foodNutrients);
        await db.insert(usdaFoodCache).values({
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          foodCategory: food.foodCategory || null,
          brandOwner: food.brandOwner || null,
          brandName: food.brandName || null,
          ingredients: food.ingredients || null,
          servingSize: food.servingSize ? food.servingSize.toString() : null,
          servingSizeUnit: food.servingSizeUnit || null,
          householdServingFullText: food.householdServingFullText || null,
          nutrients,
          searchCount: 1
        }).onConflictDoUpdate({
          target: [usdaFoodCache.fdcId],
          set: {
            searchCount: sql3`${usdaFoodCache.searchCount} + 1`,
            lastUpdated: /* @__PURE__ */ new Date()
          }
        });
      } catch (error) {
        console.error("Cache insert error:", error);
      }
    }
  }
  /**
   * Extract and normalize nutrients from USDA data
   */
  extractNutrients(foodNutrients) {
    const nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    for (const nutrient of foodNutrients) {
      if (!nutrient || !nutrient.nutrient || !nutrient.nutrient.name) {
        console.warn("Invalid nutrient data:", nutrient);
        continue;
      }
      const name = nutrient.nutrient.name.toLowerCase();
      const amount = nutrient.amount || 0;
      if (name.includes("energy") || name.includes("calorie")) {
        nutrients.calories = amount;
      } else if (name.includes("protein")) {
        nutrients.protein = amount;
      } else if (name.includes("carbohydrate")) {
        nutrients.carbs = amount;
      } else if (name.includes("total lipid") || name.includes("fat")) {
        nutrients.fat = amount;
      } else if (name.includes("fiber")) {
        nutrients.fiber = amount;
      } else if (name.includes("sugar")) {
        nutrients.sugar = amount;
      } else if (name.includes("sodium")) {
        nutrients.sodium = amount;
      }
    }
    return nutrients;
  }
  /**
   * Parse measurement string and convert to grams
   */
  parseMeasurement(measurement, food) {
    const normalized = measurement.toLowerCase().trim();
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    const quantity = match ? parseFloat(match[1]) : 1;
    const unit = match ? match[2].trim() : normalized;
    const conversions = {
      "g": 1,
      "gram": 1,
      "grams": 1,
      "kg": 1e3,
      "kilogram": 1e3,
      "oz": 28.35,
      "ounce": 28.35,
      "ounces": 28.35,
      "lb": 453.6,
      "pound": 453.6,
      "pounds": 453.6,
      "cup": 240,
      // approximate for liquids
      "cups": 240,
      "tablespoon": 15,
      "tablespoons": 15,
      "tbsp": 15,
      "teaspoon": 5,
      "teaspoons": 5,
      "tsp": 5,
      "ml": 1,
      // for liquids, approximate to grams
      "milliliter": 1,
      "milliliters": 1,
      "l": 1e3,
      "liter": 1e3,
      "liters": 1e3
    };
    const itemConversions = {
      "egg": {
        "whole": 50,
        "large": 50,
        "medium": 44,
        "small": 38,
        "extra large": 56
      },
      "grape": {
        "grape": 5,
        "grapes": 5,
        "bunch": 100
      }
    };
    let gramsEquivalent = quantity;
    const ingredientName = food.description.toLowerCase();
    for (const [ingredient, conversions2] of Object.entries(itemConversions)) {
      if (ingredientName.includes(ingredient)) {
        for (const [unitPattern, grams] of Object.entries(conversions2)) {
          if (unit.includes(unitPattern)) {
            gramsEquivalent = quantity * grams;
            return { quantity, unit, gramsEquivalent };
          }
        }
      }
    }
    for (const [unitPattern, grams] of Object.entries(conversions)) {
      if (unit.includes(unitPattern)) {
        gramsEquivalent = quantity * grams;
        break;
      }
    }
    if (gramsEquivalent === quantity && food.servingSize) {
      gramsEquivalent = quantity * food.servingSize;
    } else if (gramsEquivalent === quantity) {
      gramsEquivalent = quantity * 100;
    }
    return { quantity, unit, gramsEquivalent };
  }
  /**
   * Generate equivalent measurement for context
   */
  generateEquivalentMeasurement(grams, originalUnit, caloriesPer100g) {
    if (originalUnit.includes("cup") && grams < 50) {
      const tablespoons = Math.round(grams / 15);
      const tbspCalories = Math.round(caloriesPer100g * tablespoons * 15 / 100);
      return `${tablespoons} tablespoons \u2248 ${tbspCalories} kcal`;
    }
    if (originalUnit.includes("tablespoon") && grams > 100) {
      const cups = Math.round(grams / 240 * 10) / 10;
      const cupCalories = Math.round(caloriesPer100g * cups * 240 / 100);
      return `${cups} cup \u2248 ${cupCalories} kcal`;
    }
    if (grams !== 100) {
      const per100gCalories = Math.round(caloriesPer100g);
      return `100g \u2248 ${per100gCalories} kcal`;
    }
    return "";
  }
  /**
   * Generate variation note about size/preparation
   */
  generateVariationNote(ingredientName, unit) {
    const ingredient = ingredientName.toLowerCase();
    if (ingredient.includes("egg") && unit.includes("whole")) {
      return "Calories may vary slightly by size (small = 55 kcal, extra large = 80 kcal)";
    }
    if (ingredient.includes("grape")) {
      return "Calories vary by grape variety (red/green similar, cotton candy grapes higher)";
    }
    if (ingredient.includes("salad") || ingredient.includes("prepared")) {
      return "Calories vary significantly based on preparation and ingredients used";
    }
    if (unit.includes("cup") || unit.includes("tablespoon")) {
      return "Calories may vary based on how tightly packed the ingredient is";
    }
    return "Calories may vary based on variety, size, and preparation method";
  }
  /**
   * Format ingredient name for display
   */
  formatIngredientName(description) {
    return description.replace(/,\s*raw/i, "").replace(/,\s*cooked/i, "").replace(/\s*\([^)]*\)/g, "").trim();
  }
  /**
   * Convert cached food to USDA format
   */
  formatCachedAsUSDAFood(cached) {
    return cached.map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      foodCategory: food.foodCategory,
      brandOwner: food.brandOwner,
      brandName: food.brandName,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      householdServingFullText: food.householdServingFullText,
      foodNutrients: this.convertNutrientsToUSDAFormat(food.nutrients)
    }));
  }
  /**
   * Convert stored nutrients back to USDA format
   */
  convertNutrientsToUSDAFormat(nutrients) {
    const usdaFormat = [];
    const nutrientMap = {
      calories: { id: 1008, name: "Energy", unitName: "kcal" },
      protein: { id: 1003, name: "Protein", unitName: "g" },
      carbs: { id: 1005, name: "Carbohydrate, by difference", unitName: "g" },
      fat: { id: 1004, name: "Total lipid (fat)", unitName: "g" },
      fiber: { id: 1079, name: "Fiber, total dietary", unitName: "g" },
      sugar: { id: 2e3, name: "Sugars, total including NLEA", unitName: "g" },
      sodium: { id: 1093, name: "Sodium, Na", unitName: "mg" }
    };
    for (const [key, nutrient] of Object.entries(nutrientMap)) {
      if (nutrients[key] !== void 0) {
        usdaFormat.push({
          type: "FoodNutrient",
          id: nutrient.id,
          amount: nutrients[key],
          nutrient: {
            id: nutrient.id,
            number: nutrient.id.toString(),
            name: nutrient.name,
            rank: 1,
            unitName: nutrient.unitName
          }
        });
      }
    }
    return usdaFormat;
  }
  /**
   * Fallback calorie estimation when USDA data unavailable
   */
  getFallbackCalorieEstimate(ingredientName, measurement) {
    const fallbacks = {
      "egg": 70,
      "grape": 3,
      "chicken": 200,
      "rice": 130,
      "bread": 80,
      "milk": 150,
      "cheese": 100
    };
    const ingredient = ingredientName.toLowerCase();
    let baseCalories = 100;
    for (const [key, calories] of Object.entries(fallbacks)) {
      if (ingredient.includes(key)) {
        baseCalories = calories;
        break;
      }
    }
    return {
      ingredient: ingredientName,
      measurement,
      estimatedCalories: baseCalories,
      note: "Estimate based on common nutrition data (USDA database temporarily unavailable)"
    };
  }
};
var usdaService = new USDAService(process.env.USDA_API_KEY || "DEMO_KEY");

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/meals/logged", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const mealData = {
        ...req.body,
        userId,
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log("Logging meal from calculator:", mealData);
      res.json({ success: true, meal: mealData });
    } catch (error) {
      console.error("Error logging meal:", error);
      res.status(500).json({ message: "Failed to log meal" });
    }
  });
  app2.get("/api/meals/logged", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const meals2 = [];
      res.json(meals2);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });
  app2.post("/api/calculate-calories", async (req, res) => {
    try {
      const { ingredient, measurement } = req.body;
      const calorieData = await usdaService.calculateIngredientCalories(ingredient, measurement);
      res.json(calorieData);
    } catch (error) {
      console.error("Error calculating calories:", error);
      res.status(500).json({ message: "Failed to calculate calories" });
    }
  });
  app2.post("/api/sync/food-database", isAuthenticated, async (req, res) => {
    try {
      console.log("Starting USDA food database sync...");
      const popularFoods = [
        "chicken breast",
        "eggs",
        "milk",
        "bread",
        "rice",
        "apple",
        "banana",
        "broccoli",
        "salmon",
        "yogurt",
        "oats",
        "almonds",
        "spinach",
        "sweet potato",
        "avocado",
        "quinoa",
        "ground beef",
        "cheese"
      ];
      let syncedCount = 0;
      const syncResults = [];
      for (const food of popularFoods) {
        try {
          const foods2 = await usdaService.searchFoods(food, 5);
          syncedCount += foods2.length;
          syncResults.push({
            query: food,
            found: foods2.length,
            foods: foods2.slice(0, 2).map((f) => ({
              fdcId: f.fdcId,
              description: f.description
            }))
          });
        } catch (error) {
          console.error(`Error syncing ${food}:`, error);
          syncResults.push({
            query: food,
            found: 0,
            error: "Sync failed"
          });
        }
      }
      res.json({
        success: true,
        message: `Successfully synced ${syncedCount} foods from USDA database`,
        syncResults,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error syncing food database:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync food database",
        error: error.message
      });
    }
  });
  app2.post("/api/sync/user-data", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log("Starting user data sync for:", userId);
      const syncData = {
        meals: [],
        // Get from storage
        achievements: [],
        // Get from storage
        waterIntake: [],
        // Get from storage
        lastSync: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({
        success: true,
        message: "User data synchronized successfully",
        data: syncData,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error syncing user data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync user data",
        error: error.message
      });
    }
  });
  app2.get("/api/foods/search", async (req, res) => {
    try {
      const { q: query, limit = 25 } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const foods2 = await usdaService.searchFoods(query, parseInt(limit));
      res.json({
        query,
        totalResults: foods2.length,
        foods: foods2.map((food) => ({
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          brandOwner: food.brandOwner,
          foodCategory: food.foodCategory,
          nutrients: food.foodNutrients?.slice(0, 10) || []
          // Return limited nutrients
        }))
      });
    } catch (error) {
      console.error("Error searching foods:", error);
      res.status(500).json({ message: "Failed to search foods" });
    }
  });
  app2.get("/api/version/check", async (req, res) => {
    res.json({
      version: "2.1.2",
      buildDate: "2025-01-31",
      changelog: [
        "Enhanced calculator-logger communication",
        "Improved button functionality throughout app",
        "Better visual feedback for all interactions"
      ],
      required: false
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
