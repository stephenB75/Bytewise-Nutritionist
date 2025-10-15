import { sql } from 'drizzle-orm';
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
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (legacy - was used for Replit Auth, now using Supabase)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (used with Supabase Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  emailVerified: boolean("email_verified").default(false),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  profileIcon: integer("profile_icon").default(1), // 1-2 corresponding to avatar types (1=male, 2=female)
  // Enhanced profile information
  personalInfo: jsonb("personal_info"), // age, height, weight, activity level, etc.
  privacySettings: jsonb("privacy_settings"), // profile visibility, data sharing preferences
  notificationSettings: jsonb("notification_settings"), // meal reminders, achievement alerts
  displaySettings: jsonb("display_settings"), // theme, units (metric/imperial), language
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Nutrition goals
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
  dailyProteinGoal: integer("daily_protein_goal").default(150),
  dailyCarbGoal: integer("daily_carb_goal").default(200),
  dailyFatGoal: integer("daily_fat_goal").default(70),
  dailyWaterGoal: integer("daily_water_goal").default(8), // glasses
});

// User uploaded photos - Track for deletion functionality (App Store privacy compliance)
export const userPhotos = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: varchar("file_name").notNull(), // Original filename
  storagePath: varchar("storage_path").notNull(), // Path in storage (uploads/uuid)
  storageUrl: varchar("storage_url").notNull(), // Full Supabase storage URL
  mimeType: varchar("mime_type").notNull(), // image/jpeg, image/png, etc.
  fileSize: integer("file_size"), // File size in bytes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  // Optional: track if photo was used for AI analysis
  analysisId: varchar("analysis_id"), // Link to AI analysis session if applicable
  // Metadata for better photo management
  photoMetadata: jsonb("photo_metadata"), // EXIF data, dimensions, etc.
}, (table) => ({
  userIdIdx: index("user_photos_user_id_idx").on(table.userId),
  uploadedAtIdx: index("user_photos_uploaded_at_idx").on(table.uploadedAt),
  storagePathIdx: index("user_photos_storage_path_idx").on(table.storagePath),
}));

// Food database - Enhanced with USDA integration
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  // USDA FoodData Central integration
  fdcId: integer("fdc_id"), // USDA FDC ID for API reference
  usdaDataType: varchar("usda_data_type", { length: 50 }), // Branded, Foundation, Survey, etc.
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  category: varchar("category", { length: 100 }),
  servingSize: varchar("serving_size", { length: 100 }).notNull(),
  servingSizeGrams: decimal("serving_size_grams", { precision: 8, scale: 2 }),
  calories: decimal("calories", { precision: 8, scale: 2 }).notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).default('0'),
  carbs: decimal("carbs", { precision: 8, scale: 2 }).default('0'),
  fat: decimal("fat", { precision: 8, scale: 2 }).default('0'),
  fiber: decimal("fiber", { precision: 8, scale: 2 }).default('0'),
  sugar: decimal("sugar", { precision: 8, scale: 2 }).default('0'),
  sodium: decimal("sodium", { precision: 8, scale: 2 }).default('0'), // in mg
  // Additional USDA nutrients
  allNutrients: jsonb("all_nutrients"), // Complete USDA nutrient data
  verified: boolean("verified").default(false),
  isFromUsda: boolean("is_from_usda").default(false),
  lastUsdaSync: timestamp("last_usda_sync"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  fdcIdIdx: index("foods_fdc_id_idx").on(table.fdcId),
  nameIdx: index("foods_name_idx").on(table.name),
  categoryIdx: index("foods_category_idx").on(table.category),
}));

// User recipes
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  servings: integer("servings").notNull().default(1),
  prepTime: integer("prep_time"), // in minutes
  cookTime: integer("cook_time"), // in minutes
  instructions: text("instructions"),
  totalCalories: decimal("total_calories", { precision: 10, scale: 2 }),
  totalProtein: decimal("total_protein", { precision: 8, scale: 2 }),
  totalCarbs: decimal("total_carbs", { precision: 8, scale: 2 }),
  totalFat: decimal("total_fat", { precision: 8, scale: 2 }),
  totalFiber: decimal("total_fiber", { precision: 8, scale: 2 }),
  totalSugar: decimal("total_sugar", { precision: 8, scale: 2 }),
  totalSodium: decimal("total_sodium", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipe ingredients
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  foodId: integer("food_id").notNull().references(() => foods.id),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  order: integer("order").default(0),
});

// Meal logging
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  name: varchar("name", { length: 255 }),
  totalCalories: decimal("total_calories", { precision: 10, scale: 2 }).default('0'),
  totalProtein: decimal("total_protein", { precision: 8, scale: 2 }).default('0'),
  totalCarbs: decimal("total_carbs", { precision: 8, scale: 2 }).default('0'),
  totalFat: decimal("total_fat", { precision: 8, scale: 2 }).default('0'),
  // Micronutrients from USDA database
  iron: decimal("iron", { precision: 8, scale: 2 }).default('0'),
  calcium: decimal("calcium", { precision: 8, scale: 2 }).default('0'),
  zinc: decimal("zinc", { precision: 8, scale: 2 }).default('0'),
  magnesium: decimal("magnesium", { precision: 8, scale: 2 }).default('0'),
  vitaminC: decimal("vitamin_c", { precision: 8, scale: 2 }).default('0'),
  vitaminD: decimal("vitamin_d", { precision: 8, scale: 2 }).default('0'),
  vitaminB12: decimal("vitamin_b12", { precision: 8, scale: 2 }).default('0'),
  folate: decimal("folate", { precision: 8, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meal ingredients/foods
export const mealFoods = pgTable("meal_foods", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull().references(() => meals.id, { onDelete: 'cascade' }),
  foodId: integer("food_id").references(() => foods.id),
  recipeId: integer("recipe_id").references(() => recipes.id),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  calories: decimal("calories", { precision: 8, scale: 2 }).notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).default('0'),
  carbs: decimal("carbs", { precision: 8, scale: 2 }).default('0'),
  fat: decimal("fat", { precision: 8, scale: 2 }).default('0'),
});

// Water intake tracking
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  glasses: integer("glasses").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements system
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementType: varchar("achievement_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 100 }),
  colorClass: varchar("color_class", { length: 100 }),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fasting sessions table for intermittent fasting tracking
export const fastingSessions = pgTable('fasting_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull(), // References fasting plan (16:8, 18:6, etc.)
  planName: text('plan_name').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  targetDuration: integer('target_duration').notNull(), // in milliseconds
  actualDuration: integer('actual_duration'), // in milliseconds  
  status: text('status').notNull().default('active'), // 'active', 'completed', 'paused'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at')
});

// User subscriptions table for Apple subscription tracking
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // RevenueCat / Apple subscription data
  revenueCatUserId: varchar("revenue_cat_user_id"),
  originalTransactionId: varchar("original_transaction_id"), // Apple's original transaction ID
  productId: varchar("product_id").notNull(), // Apple product ID (e.g., premium_monthly, premium_yearly)
  entitlementId: varchar("entitlement_id").notNull(), // RevenueCat entitlement ID
  
  // Subscription status
  status: varchar("status", { length: 50 }).notNull().default('inactive'), // active, expired, cancelled, grace_period, billing_retry
  tier: varchar("tier", { length: 50 }).notNull().default('free'), // free, premium, pro
  
  // Subscription timing
  purchasedAt: timestamp("purchased_at"),
  expiresAt: timestamp("expires_at"),
  renewsAt: timestamp("renews_at"),
  cancelledAt: timestamp("cancelled_at"),
  
  // Apple/RevenueCat specific fields
  environment: varchar("environment", { length: 20 }).default('production'), // sandbox, production
  willRenew: boolean("will_renew").default(true),
  gracePeriodExpiresAt: timestamp("grace_period_expires_at"),
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription transactions for purchase history and webhook events
export const subscriptionTransactions = pgTable("subscription_transactions", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Apple/RevenueCat transaction data
  transactionId: varchar("transaction_id").notNull(), // Apple transaction ID
  originalTransactionId: varchar("original_transaction_id"), // Apple original transaction ID
  webOrderLineItemId: varchar("web_order_line_item_id"), // Apple web order line item ID
  productId: varchar("product_id").notNull(),
  
  // Transaction details
  eventType: varchar("event_type", { length: 100 }).notNull(), // INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
  revenueInUsd: decimal("revenue_in_usd", { precision: 10, scale: 2 }),
  priceInPurchasedCurrency: decimal("price_in_purchased_currency", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default('USD'),
  
  // RevenueCat webhook data
  webhookEventId: varchar("webhook_event_id"), // RevenueCat event ID for deduplication
  rawWebhookData: jsonb("raw_webhook_data"), // Complete webhook payload for debugging
  
  // Timing
  purchasedAt: timestamp("purchased_at").notNull(),
  expiresAt: timestamp("expires_at"),
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  transactionIdIdx: index("subscription_transactions_transaction_id_idx").on(table.transactionId),
  userIdIdx: index("subscription_transactions_user_id_idx").on(table.userId),
  webhookEventIdIdx: index("subscription_transactions_webhook_event_id_idx").on(table.webhookEventId),
}));

// Food suggestions based on user habits
export const foodSuggestions = pgTable("food_suggestions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  suggestionType: varchar("suggestion_type", { length: 100 }).notNull(), // improve_protein, reduce_sodium, etc.
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  recommendedFoods: jsonb("recommended_foods"), // Array of food recommendations
  reasoningData: jsonb("reasoning_data"), // Analysis data that led to suggestion
  priority: integer("priority").default(1), // 1-5 priority level
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// USDA food cache for offline access
export const usdaFoodCache = pgTable("usda_food_cache", {
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
  nutrients: jsonb("nutrients").notNull(), // Complete nutrition data as JSON
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  searchCount: integer("search_count").default(0), // Track popularity for caching priority
  isBulkDownloaded: boolean("is_bulk_downloaded").default(false), // Track if food was bulk downloaded
}, (table) => ({
  descriptionIdx: index("usda_cache_description_idx").on(table.description),
  categoryIdx: index("usda_cache_category_idx").on(table.foodCategory),
  searchCountIdx: index("usda_cache_search_count_idx").on(table.searchCount),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  meals: many(meals),
  waterIntake: many(waterIntake),
  achievements: many(achievements),
  foodSuggestions: many(foodSuggestions),
  subscriptions: many(subscriptions),
  subscriptionTransactions: many(subscriptionTransactions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  transactions: many(subscriptionTransactions),
}));

export const subscriptionTransactionsRelations = relations(subscriptionTransactions, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionTransactions.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [subscriptionTransactions.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const foodSuggestionsRelations = relations(foodSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [foodSuggestions.userId],
    references: [users.id],
  }),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  food: one(foods, {
    fields: [recipeIngredients.foodId],
    references: [foods.id],
  }),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
  foods: many(mealFoods),
}));

export const mealFoodsRelations = relations(mealFoods, ({ one }) => ({
  meal: one(meals, {
    fields: [mealFoods.mealId],
    references: [meals.id],
  }),
  food: one(foods, {
    fields: [mealFoods.foodId],
    references: [foods.id],
  }),
  recipe: one(recipes, {
    fields: [mealFoods.recipeId],
    references: [recipes.id],
  }),
}));

export const waterIntakeRelations = relations(waterIntake, ({ one }) => ({
  user: one(users, {
    fields: [waterIntake.userId],
    references: [users.id],
  }),
}));

export const userPhotosRelations = relations(userPhotos, ({ one }) => ({
  user: one(users, {
    fields: [userPhotos.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalCalories: true,
  totalProtein: true,
  totalCarbs: true,
  totalFat: true,
  totalFiber: true,
  totalSugar: true,
  totalSodium: true,
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true,
});

export const insertMealFoodSchema = createInsertSchema(mealFoods).omit({
  id: true,
});

export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
  createdAt: true,
});

export const insertFoodSuggestionSchema = createInsertSchema(foodSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertUsdaFoodCacheSchema = createInsertSchema(usdaFoodCache).omit({
  id: true,
  lastUpdated: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionTransactionSchema = createInsertSchema(subscriptionTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPhotoSchema = createInsertSchema(userPhotos).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type MealFood = typeof mealFoods.$inferSelect;
export type InsertMealFood = z.infer<typeof insertMealFoodSchema>;
export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type FoodSuggestion = typeof foodSuggestions.$inferSelect;
export type InsertFoodSuggestion = z.infer<typeof insertFoodSuggestionSchema>;
export type UsdaFoodCache = typeof usdaFoodCache.$inferSelect;
export type InsertUsdaFoodCache = z.infer<typeof insertUsdaFoodCacheSchema>;
export type FastingSession = typeof fastingSessions.$inferSelect;
export type InsertFastingSession = typeof fastingSessions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SubscriptionTransaction = typeof subscriptionTransactions.$inferSelect;
export type InsertSubscriptionTransaction = z.infer<typeof insertSubscriptionTransactionSchema>;
export type UserPhoto = typeof userPhotos.$inferSelect;
export type InsertUserPhoto = z.infer<typeof insertUserPhotoSchema>;

// Extended types for API responses
export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { food: Food })[];
};

export type MealWithFoods = Meal & {
  foods: (MealFood & { food?: Food; recipe?: Recipe })[];
};
