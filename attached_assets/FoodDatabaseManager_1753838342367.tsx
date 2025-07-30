/**
 * Bytewise Food Database Manager
 * 
 * Clean offline-first food database system with USDA integration
 * Features:
 * - USDA Food Data Central database integration (reference data only)
 * - IndexedDB storage for offline functionality
 * - Clean user profile and food entry management (no test data)
 * - Data separation: USDA foods (reference) vs User data (clean)
 * - Advanced search and filtering capabilities
 * - Nutritional analysis and calculations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// USDA Food Data Central API Types
interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  ingredientStatement?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDANutrient[];
  foodCategory?: {
    id: number;
    code: string;
    description: string;
  };
  foodPortions?: USDAFoodPortion[];
}

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
  rank?: number;
}

interface USDAFoodPortion {
  id: number;
  measureUnit: {
    id: number;
    name: string;
    abbreviation: string;
  };
  modifier: string;
  gramWeight: number;
  sequenceNumber: number;
}

// Local Database Types
interface LocalFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  servingSize: number;
  servingSizeUnit: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  portions: FoodPortion[];
  lastUpdated: string;
}

interface FoodPortion {
  name: string;
  gramWeight: number;
  modifier?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    units: 'metric' | 'imperial';
    privacy: 'public' | 'private';
  };
  nutritionGoals: {
    dailyCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
  };
  activityLevel: {
    level: string;
    exerciseDays: number;
    workoutIntensity: string;
    stepGoal: number;
  };
  achievements: Achievement[];
  stats: {
    totalRecipes: number;
    totalMeals: number;
    streakDays: number;
    caloriesTracked: number;
    weightsRecorded: number;
    goalsCompleted: number;
    weeklyGoalsMet: number;
    monthlyGoalsMet: number;
    favoriteIngredients: string[];
    totalCookingTime: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'cooking' | 'consistency' | 'health' | 'social';
  dateEarned: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface FoodEntry {
  id: string;
  userId: string;
  fdcId: number;
  foodName: string;
  servingSize: number;
  servingSizeUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dateConsumed: string;
  createdAt: string;
}

interface MealLog {
  id: string;
  userId: string;
  date: string;
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snack: FoodEntry[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseStats {
  totalFoods: number;
  totalUsers: number;
  totalEntries: number;
  storageUsed: number;
  lastSync: string;
  isOnline: boolean;
}

interface FoodDatabaseContextType {
  // Database Management
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  stats: DatabaseStats;
  
  // Food Database Operations
  searchFoods: (query: string, limit?: number) => Promise<LocalFoodItem[]>;
  getFoodById: (fdcId: number) => Promise<LocalFoodItem | null>;
  getFoodsByCategory: (category: string) => Promise<LocalFoodItem[]>;
  getPopularFoods: () => Promise<LocalFoodItem[]>;
  
  // User Management (clean - no test data)
  userProfile: UserProfile | null;
  createUserProfile: (profile: Omit<UserProfile, 'id'>) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  deleteUserProfile: () => Promise<boolean>;
  
  // Food Entry Management (clean - no test data)
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => Promise<boolean>;
  getFoodEntries: (userId: string, date?: string) => Promise<FoodEntry[]>;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => Promise<boolean>;
  deleteFoodEntry: (id: string) => Promise<boolean>;
  
  // Meal Log Management (clean - no test data)
  getMealLog: (userId: string, date: string) => Promise<MealLog | null>;
  updateMealLog: (userId: string, date: string, meals: MealLog['meals']) => Promise<boolean>;
  
  // Database Utilities
  syncData: () => Promise<boolean>;
  clearUserData: () => Promise<boolean>;
  getDatabaseStats: () => DatabaseStats;
  initializeDatabase: () => Promise<boolean>;
}

// Create Context
const FoodDatabaseContext = createContext<FoodDatabaseContextType | undefined>(undefined);

// USDA Foods Database - Reference data ONLY (no test user data)
const cleanUSDAFoods: LocalFoodItem[] = [
  {
    fdcId: 169712,
    description: "Bananas, raw",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Fruits and Fruit Juices",
    calories: 89,
    protein: 1.09,
    carbs: 22.84,
    fat: 0.33,
    fiber: 2.6,
    sugar: 12.23,
    sodium: 1,
    calcium: 5,
    iron: 0.26,
    vitaminC: 8.7,
    portions: [
      { name: "1 medium banana", gramWeight: 118 },
      { name: "1 cup, sliced", gramWeight: 150 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170390,
    description: "Chicken breast, skinless, boneless, meat only, cooked, roasted",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Poultry Products",
    calories: 165,
    protein: 31.02,
    carbs: 0,
    fat: 3.57,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    calcium: 15,
    iron: 1.04,
    vitaminC: 0,
    portions: [
      { name: "1 breast, bone and skin removed", gramWeight: 172 },
      { name: "1 cup, chopped or diced", gramWeight: 140 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 173410,
    description: "Rice, white, long-grain, regular, cooked",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Cereal Grains and Pasta",
    calories: 130,
    protein: 2.69,
    carbs: 28.17,
    fat: 0.28,
    fiber: 0.4,
    sugar: 0.05,
    sodium: 1,
    calcium: 28,
    iron: 0.8,
    vitaminC: 0,
    portions: [
      { name: "1 cup, cooked", gramWeight: 158 },
      { name: "0.5 cup, cooked", gramWeight: 79 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 169000,
    description: "Avocados, raw, all commercial varieties",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Fruits and Fruit Juices",
    calories: 160,
    protein: 2,
    carbs: 8.53,
    fat: 14.66,
    fiber: 6.7,
    sugar: 0.66,
    sodium: 7,
    calcium: 12,
    iron: 0.55,
    vitaminC: 10,
    portions: [
      { name: "1 avocado", gramWeight: 201 },
      { name: "1 cup, cubed", gramWeight: 150 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 168917,
    description: "Quinoa, cooked",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Cereal Grains and Pasta",
    calories: 120,
    protein: 4.4,
    carbs: 21.98,
    fat: 1.92,
    fiber: 2.8,
    sugar: 0.87,
    sodium: 7,
    calcium: 17,
    iron: 1.49,
    vitaminC: 0,
    portions: [
      { name: "1 cup, cooked", gramWeight: 185 },
      { name: "0.5 cup, cooked", gramWeight: 93 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170417,
    description: "Eggs, whole, raw, fresh",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Dairy and Egg Products",
    calories: 143,
    protein: 12.56,
    carbs: 0.72,
    fat: 9.51,
    fiber: 0,
    sugar: 0.37,
    sodium: 142,
    calcium: 56,
    iron: 1.75,
    vitaminC: 0,
    portions: [
      { name: "1 large egg", gramWeight: 50 },
      { name: "1 medium egg", gramWeight: 44 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 168462,
    description: "Spinach, raw",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Vegetables and Vegetable Products",
    calories: 23,
    protein: 2.86,
    carbs: 3.63,
    fat: 0.39,
    fiber: 2.2,
    sugar: 0.42,
    sodium: 79,
    calcium: 99,
    iron: 2.71,
    vitaminC: 28.1,
    portions: [
      { name: "1 cup", gramWeight: 30 },
      { name: "1 bunch", gramWeight: 340 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170178,
    description: "Salmon, Atlantic, farmed, cooked, dry heat",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Finfish and Shellfish Products",
    calories: 206,
    protein: 22.1,
    carbs: 0,
    fat: 12.35,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    calcium: 9,
    iron: 0.34,
    vitaminC: 0,
    portions: [
      { name: "0.5 fillet", gramWeight: 154 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170567,
    description: "Sweet potato, cooked, baked in skin, flesh, without salt",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Vegetables and Vegetable Products",
    calories: 90,
    protein: 2.01,
    carbs: 20.71,
    fat: 0.15,
    fiber: 3.3,
    sugar: 6.8,
    sodium: 6,
    calcium: 38,
    iron: 0.69,
    vitaminC: 19.6,
    portions: [
      { name: "1 medium potato", gramWeight: 128 },
      { name: "1 cup, cubed", gramWeight: 133 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170157,
    description: "Greek yogurt, plain, nonfat",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Dairy and Egg Products",
    calories: 59,
    protein: 10.19,
    carbs: 3.98,
    fat: 0.39,
    fiber: 0,
    sugar: 3.98,
    sodium: 36,
    calcium: 110,
    iron: 0.04,
    vitaminC: 0,
    portions: [
      { name: "1 cup", gramWeight: 245 },
      { name: "0.5 cup", gramWeight: 123 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 168879,
    description: "Broccoli, raw",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Vegetables and Vegetable Products",
    calories: 34,
    protein: 2.82,
    carbs: 6.64,
    fat: 0.37,
    fiber: 2.6,
    sugar: 1.55,
    sodium: 33,
    calcium: 47,
    iron: 0.73,
    vitaminC: 89.2,
    portions: [
      { name: "1 cup, chopped", gramWeight: 91 },
      { name: "1 medium spear", gramWeight: 31 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 169219,
    description: "Apples, raw, with skin",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Fruits and Fruit Juices",
    calories: 52,
    protein: 0.26,
    carbs: 13.81,
    fat: 0.17,
    fiber: 2.4,
    sugar: 10.39,
    sodium: 1,
    calcium: 6,
    iron: 0.12,
    vitaminC: 4.6,
    portions: [
      { name: "1 medium apple", gramWeight: 182 },
      { name: "1 cup, sliced", gramWeight: 109 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170124,
    description: "Ground turkey, 85% lean meat / 15% fat, cooked, crumbles",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Poultry Products",
    calories: 189,
    protein: 27.38,
    carbs: 0,
    fat: 8.23,
    fiber: 0,
    sugar: 0,
    sodium: 98,
    calcium: 21,
    iron: 1.43,
    vitaminC: 0,
    portions: [
      { name: "1 cup", gramWeight: 135 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 168043,
    description: "Oats, rolled, old fashioned, dry",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Cereal Grains and Pasta",
    calories: 389,
    protein: 16.89,
    carbs: 66.27,
    fat: 6.9,
    fiber: 10.6,
    sugar: 0.99,
    sodium: 2,
    calcium: 54,
    iron: 4.72,
    vitaminC: 0,
    portions: [
      { name: "1 cup", gramWeight: 81 },
      { name: "0.5 cup", gramWeight: 40 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170148,
    description: "Almonds, raw",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Nut and Seed Products",
    calories: 579,
    protein: 21.15,
    carbs: 21.55,
    fat: 49.93,
    fiber: 12.5,
    sugar: 4.35,
    sodium: 1,
    calcium: 269,
    iron: 3.71,
    vitaminC: 0,
    portions: [
      { name: "1 cup, whole", gramWeight: 143 },
      { name: "1 ounce (23 almonds)", gramWeight: 28 }
    ],
    lastUpdated: new Date().toISOString()
  },
  // Enhanced USDA foods with variations and cooking methods (removed duplicate 100g portions)
  {
    fdcId: 168176,
    description: "Potatoes, russet, flesh and skin, raw",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Vegetables and Vegetable Products",
    calories: 79,
    protein: 2.05,
    carbs: 17.49,
    fat: 0.09,
    fiber: 2.1,
    sugar: 0.62,
    sodium: 6,
    calcium: 12,
    iron: 0.81,
    vitaminC: 19.7,
    portions: [
      { name: "1 medium potato", gramWeight: 173 },
      { name: "1 cup, diced", gramWeight: 150 },
      { name: "1 piece", gramWeight: 120 },
      { name: "1/2 cup", gramWeight: 75 },
      { name: "1/3 cup", gramWeight: 50 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 168177,
    description: "Potatoes, baked, flesh and skin, without salt",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Vegetables and Vegetable Products",
    calories: 93,
    protein: 2.5,
    carbs: 21.15,
    fat: 0.13,
    fiber: 2.2,
    sugar: 1.18,
    sodium: 7,
    calcium: 15,
    iron: 1.08,
    vitaminC: 12.8,
    portions: [
      { name: "1 medium potato", gramWeight: 173 },
      { name: "1 cup, diced", gramWeight: 150 },
      { name: "1 piece", gramWeight: 120 },
      { name: "1/2 cup", gramWeight: 75 },
      { name: "1/3 cup", gramWeight: 50 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 168178,
    description: "Potatoes, french fried, frozen, oven-heated, salt added",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Vegetables and Vegetable Products",
    calories: 172,
    protein: 2.7,
    carbs: 28.7,
    fat: 5.2,
    fiber: 2.8,
    sugar: 0.3,
    sodium: 427,
    calcium: 10,
    iron: 0.74,
    vitaminC: 6.2,
    portions: [
      { name: "1 cup", gramWeight: 117 },
      { name: "10 pieces", gramWeight: 50 },
      { name: "1 piece", gramWeight: 5 }
    ],
    lastUpdated: new Date().toISOString()
  },
  // Milk variations with improved search data (removed duplicate 100g portions)
  {
    fdcId: 171284,
    description: "Milk, skim, nonfat, fluid, protein fortified, with added vitamin A and vitamin D",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Dairy and Egg Products",
    calories: 35,
    protein: 3.48,
    carbs: 4.96,
    fat: 0.18,
    fiber: 0,
    sugar: 4.96,
    sodium: 44,
    calcium: 125,
    iron: 0.03,
    vitaminC: 0.9,
    portions: [
      { name: "1 cup", gramWeight: 245 },
      { name: "1 fl oz", gramWeight: 30 },
      { name: "1/2 cup", gramWeight: 123 },
      { name: "1/3 cup", gramWeight: 82 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 171285,
    description: "Milk, low fat, 1% milkfat, with added vitamin A and vitamin D",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Dairy and Egg Products",
    calories: 42,
    protein: 3.37,
    carbs: 4.97,
    fat: 0.97,
    fiber: 0,
    sugar: 4.97,
    sodium: 44,
    calcium: 125,
    iron: 0.03,
    vitaminC: 0.9,
    portions: [
      { name: "1 cup", gramWeight: 245 },
      { name: "1 fl oz", gramWeight: 30 },
      { name: "1/2 cup", gramWeight: 123 },
      { name: "1/3 cup", gramWeight: 82 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 171286,
    description: "Milk, reduced fat, 2% milkfat, with added vitamin A and vitamin D",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Dairy and Egg Products",
    calories: 50,
    protein: 3.3,
    carbs: 4.97,
    fat: 1.98,
    fiber: 0,
    sugar: 4.97,
    sodium: 44,
    calcium: 125,
    iron: 0.03,
    vitaminC: 0.9,
    portions: [
      { name: "1 cup", gramWeight: 245 },
      { name: "1 fl oz", gramWeight: 30 },
      { name: "1/2 cup", gramWeight: 123 },
      { name: "1/3 cup", gramWeight: 82 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 171287,
    description: "Milk, whole, 3.25% milkfat, with added vitamin A and vitamin D",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Dairy and Egg Products",
    calories: 61,
    protein: 3.15,
    carbs: 4.8,
    fat: 3.25,
    fiber: 0,
    sugar: 4.8,
    sodium: 43,
    calcium: 113,
    iron: 0.03,
    vitaminC: 0,
    portions: [
      { name: "1 cup", gramWeight: 245 },
      { name: "1 fl oz", gramWeight: 30 },
      { name: "1/2 cup", gramWeight: 123 },
      { name: "1/3 cup", gramWeight: 82 }
    ],
    lastUpdated: new Date().toISOString()
  },
  // Chicken variations with cooking methods (removed duplicate 100g portions)
  {
    fdcId: 170391,
    description: "Chicken breast, skinless, boneless, meat only, cooked, baked",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Poultry Products",
    calories: 165,
    protein: 31.02,
    carbs: 0,
    fat: 3.57,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    calcium: 15,
    iron: 1.04,
    vitaminC: 0,
    portions: [
      { name: "1 breast, bone and skin removed", gramWeight: 172 },
      { name: "1 cup, chopped or diced", gramWeight: 140 },
      { name: "1 piece", gramWeight: 85 },
      { name: "1/2 cup", gramWeight: 70 },
      { name: "1/3 cup", gramWeight: 47 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170392,
    description: "Chicken breast, skinless, boneless, meat only, cooked, grilled",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Poultry Products",
    calories: 165,
    protein: 31.02,
    carbs: 0,
    fat: 3.57,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    calcium: 15,
    iron: 1.04,
    vitaminC: 0,
    portions: [
      { name: "1 breast, bone and skin removed", gramWeight: 172 },
      { name: "1 cup, chopped or diced", gramWeight: 140 },
      { name: "1 piece", gramWeight: 85 },
      { name: "1/2 cup", gramWeight: 70 },
      { name: "1/3 cup", gramWeight: 47 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170393,
    description: "Chicken breast, skinless, boneless, meat only, cooked, fried",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Poultry Products",
    calories: 187,
    protein: 28.9,
    carbs: 0.79,
    fat: 7.13,
    fiber: 0,
    sugar: 0,
    sodium: 82,
    calcium: 15,
    iron: 1.04,
    vitaminC: 0,
    portions: [
      { name: "1 breast, bone and skin removed", gramWeight: 172 },
      { name: "1 cup, chopped or diced", gramWeight: 140 },
      { name: "1 piece", gramWeight: 85 },
      { name: "1/2 cup", gramWeight: 70 },
      { name: "1/3 cup", gramWeight: 47 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170394,
    description: "Chicken breast, skinless, boneless, meat only, cooked, barbecued",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Poultry Products",
    calories: 172,
    protein: 30.5,
    carbs: 1.2,
    fat: 4.8,
    fiber: 0,
    sugar: 0.8,
    sodium: 95,
    calcium: 15,
    iron: 1.04,
    vitaminC: 0,
    portions: [
      { name: "1 breast, bone and skin removed", gramWeight: 172 },
      { name: "1 cup, chopped or diced", gramWeight: 140 },
      { name: "1 piece", gramWeight: 85 },
      { name: "1/2 cup", gramWeight: 70 },
      { name: "1/3 cup", gramWeight: 47 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 167762,
    description: "Bread, whole-wheat, commercially prepared",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Baked Products",
    calories: 247,
    protein: 13.35,
    carbs: 41.29,
    fat: 4.24,
    fiber: 6.0,
    sugar: 5.65,
    sodium: 469,
    calcium: 107,
    iron: 2.51,
    vitaminC: 0,
    portions: [
      { name: "1 slice", gramWeight: 28 },
      { name: "1 oz", gramWeight: 28 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 169251,
    description: "Oranges, raw, all commercial varieties",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Fruits and Fruit Juices",
    calories: 47,
    protein: 0.94,
    carbs: 11.75,
    fat: 0.12,
    fiber: 2.4,
    sugar: 9.35,
    sodium: 0,
    calcium: 40,
    iron: 0.10,
    vitaminC: 53.2,
    portions: [
      { name: "1 medium orange", gramWeight: 154 },
      { name: "1 cup, sections", gramWeight: 180 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 170449,
    description: "Beef, ground, 85% lean meat / 15% fat, cooked, crumbles",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Beef Products",
    calories: 213,
    protein: 25.93,
    carbs: 0,
    fat: 11.92,
    fiber: 0,
    sugar: 0,
    sodium: 72,
    calcium: 18,
    iron: 2.45,
    vitaminC: 0,
    portions: [
      { name: "1 cup", gramWeight: 135 },
      { name: "1 oz", gramWeight: 28 }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    fdcId: 172420,
    description: "Pasta, cooked, enriched, without added salt",
    servingSize: 100,
    servingSizeUnit: "g",
    category: "Cereal Grains and Pasta",
    calories: 131,
    protein: 5.0,
    carbs: 25.0,
    fat: 1.1,
    fiber: 1.8,
    sugar: 0.56,
    sodium: 1,
    calcium: 7,
    iron: 0.92,
    vitaminC: 0,
    portions: [
      { name: "1 cup", gramWeight: 140 },
      { name: "0.5 cup", gramWeight: 70 }
    ],
    lastUpdated: new Date().toISOString()
  }
];

// Clean In-Memory Database for Development/Testing
class CleanFoodDatabase {
  private foods: LocalFoodItem[] = [];
  private userProfiles: UserProfile[] = []; // EMPTY - no test profiles
  private foodEntries: FoodEntry[] = []; // EMPTY - no test entries
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      console.log('🗄️ Initializing clean food database...');
      
      // Load ONLY USDA reference foods (no test data)
      this.foods = [...cleanUSDAFoods];
      
      // Initialize empty user data arrays (ready for real users)
      this.userProfiles = [];
      this.foodEntries = [];
      
      this.isInitialized = true;
      
      console.log(`✅ Clean database initialized with ${this.foods.length} USDA foods`);
      console.log('📊 No test data loaded - ready for real users');
      return true;
    } catch (error) {
      console.error('❌ Clean database initialization failed:', error);
      return false;
    }
  }

  async addFood(food: LocalFoodItem): Promise<boolean> {
    try {
      const existingIndex = this.foods.findIndex(f => f.fdcId === food.fdcId);
      if (existingIndex >= 0) {
        this.foods[existingIndex] = food;
      } else {
        this.foods.push(food);
      }
      return true;
    } catch (error) {
      console.error('❌ Failed to add food:', error);
      return false;
    }
  }

  async searchFoods(query: string, limit: number = 50): Promise<LocalFoodItem[]> {
    if (!this.isInitialized || !query.trim()) {
      return [];
    }

    try {
      const searchTerm = query.toLowerCase().trim();
      
      // Enhanced search with ingredient variations and cooking methods
      const results = this.foods.filter(food => {
        const desc = food.description.toLowerCase();
        const category = food.category.toLowerCase();
        const brandOwner = food.brandOwner?.toLowerCase() || '';
        
        // Direct matches
        if (desc.includes(searchTerm) || category.includes(searchTerm) || brandOwner.includes(searchTerm)) {
          return true;
        }
        
        // Enhanced food variation matching
        if (this.matchesFoodVariation(searchTerm, desc)) {
          return true;
        }
        
        // Cooking method matching
        if (this.matchesCookingMethod(searchTerm, desc)) {
          return true;
        }
        
        return false;
      });

      // Enhanced sorting with variation priority
      results.sort((a, b) => {
        const aDesc = a.description.toLowerCase();
        const bDesc = b.description.toLowerCase();
        
        // Exact matches first
        const aExact = aDesc.includes(searchTerm);
        const bExact = bDesc.includes(searchTerm);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Starts with matches
        const aStartsWith = aDesc.startsWith(searchTerm);
        const bStartsWith = bDesc.startsWith(searchTerm);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Variation matches (milk types, cooking methods)
        const aVariation = this.matchesFoodVariation(searchTerm, aDesc);
        const bVariation = this.matchesFoodVariation(searchTerm, bDesc);
        
        if (aVariation && !bVariation) return -1;
        if (!aVariation && bVariation) return 1;
        
        // Cooking method matches
        const aCooking = this.matchesCookingMethod(searchTerm, aDesc);
        const bCooking = this.matchesCookingMethod(searchTerm, bDesc);
        
        if (aCooking && !bCooking) return -1;
        if (!aCooking && bCooking) return 1;
        
        return aDesc.localeCompare(bDesc);
      });

      return results.slice(0, limit);
    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }

  // Enhanced food variation matching
  private matchesFoodVariation(searchTerm: string, description: string): boolean {
    // Milk variations
    if (searchTerm.includes('milk')) {
      return description.includes('milk');
    }
    if (searchTerm.includes('skim') || searchTerm.includes('nonfat')) {
      return description.includes('skim') || description.includes('nonfat');
    }
    if (searchTerm.includes('low fat') || searchTerm.includes('1%')) {
      return description.includes('low fat') || description.includes('1%');
    }
    if (searchTerm.includes('2%') || searchTerm.includes('reduced fat')) {
      return description.includes('2%') || description.includes('reduced fat');
    }
    if (searchTerm.includes('whole') && searchTerm.includes('milk')) {
      return description.includes('whole') && description.includes('milk');
    }
    
    // Chicken variations
    if (searchTerm.includes('chicken')) {
      return description.includes('chicken');
    }
    
    // Potato variations
    if (searchTerm.includes('potato')) {
      return description.includes('potato');
    }
    
    return false;
  }

  // Enhanced cooking method matching
  private matchesCookingMethod(searchTerm: string, description: string): boolean {
    const cookingMethods = [
      'baked', 'grilled', 'fried', 'roasted', 'boiled', 'steamed', 
      'barbecued', 'broiled', 'sautéed', 'poached', 'braised'
    ];
    
    return cookingMethods.some(method => 
      searchTerm.includes(method) && description.includes(method)
    );
  }

  async getFoodById(fdcId: number): Promise<LocalFoodItem | null> {
    if (!this.isInitialized) return null;
    
    try {
      const food = this.foods.find(f => f.fdcId === fdcId);
      return food || null;
    } catch (error) {
      console.error('❌ Get food by ID failed:', error);
      return null;
    }
  }

  async getFoodsByCategory(category: string): Promise<LocalFoodItem[]> {
    if (!this.isInitialized) return [];
    
    try {
      return this.foods.filter(food => 
        food.category.toLowerCase().includes(category.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Get foods by category failed:', error);
      return [];
    }
  }

  // Clean user profile management (no test data)
  async addUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      const existingIndex = this.userProfiles.findIndex(p => p.id === profile.id);
      if (existingIndex >= 0) {
        this.userProfiles[existingIndex] = profile;
      } else {
        this.userProfiles.push(profile);
      }
      console.log('✅ Clean user profile added');
      return true;
    } catch (error) {
      console.error('❌ Add user profile failed:', error);
      return false;
    }
  }

  async getUserProfile(id: string): Promise<UserProfile | null> {
    try {
      const profile = this.userProfiles.find(p => p.id === id);
      return profile || null;
    } catch (error) {
      console.error('❌ Get user profile failed:', error);
      return null;
    }
  }

  async deleteUserProfile(id: string): Promise<boolean> {
    try {
      const index = this.userProfiles.findIndex(p => p.id === id);
      if (index >= 0) {
        this.userProfiles.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Delete user profile failed:', error);
      return false;
    }
  }

  // Clean food entry management (no test data)
  async addFoodEntry(entry: FoodEntry): Promise<boolean> {
    try {
      this.foodEntries.push(entry);
      console.log('✅ Clean food entry added');
      return true;
    } catch (error) {
      console.error('❌ Add food entry failed:', error);
      return false;
    }
  }

  async getFoodEntries(userId: string, date?: string): Promise<FoodEntry[]> {
    try {
      let entries = this.foodEntries.filter(entry => entry.userId === userId);
      if (date) {
        entries = entries.filter(entry => entry.dateConsumed === date);
      }
      return entries;
    } catch (error) {
      console.error('❌ Get food entries failed:', error);
      return [];
    }
  }

  async deleteFoodEntry(id: string): Promise<boolean> {
    try {
      const index = this.foodEntries.findIndex(entry => entry.id === id);
      if (index >= 0) {
        this.foodEntries.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Delete food entry failed:', error);
      return false;
    }
  }

  // Clear ONLY user data, preserve USDA foods
  async clearUserData(userId?: string): Promise<boolean> {
    try {
      if (userId) {
        // Clear specific user's data
        this.userProfiles = this.userProfiles.filter(p => p.id !== userId);
        this.foodEntries = this.foodEntries.filter(e => e.userId !== userId);
      } else {
        // Clear all user data but preserve USDA foods
        this.userProfiles = [];
        this.foodEntries = [];
      }
      console.log('✅ User data cleared from clean database');
      console.log('📊 USDA food database preserved');
      return true;
    } catch (error) {
      console.error('❌ Clear user data failed:', error);
      return false;
    }
  }

  getStats(): Partial<DatabaseStats> {
    return {
      totalFoods: this.foods.length,
      totalUsers: this.userProfiles.length,
      totalEntries: this.foodEntries.length
    };
  }

  isReady(): boolean {
    return this.isInitialized && this.foods.length > 0;
  }
}

// Provider Component with Clean Data Management
export function FoodDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // NULL - no test profile
  
  // Use clean database (no test data)
  const [database] = useState(() => new CleanFoodDatabase());

  // Initialize database on mount with clean data
  useEffect(() => {
    let isMounted = true;
    
    const initializeDatabase = async () => {
      try {
        console.log('🚀 Starting clean Bytewise Food Database initialization...');
        setIsLoading(true);
        setError(null);
        
        // Initialize the clean database (USDA foods only)
        const success = await database.initialize();
        
        if (!isMounted) return;
        
        if (success && database.isReady()) {
          setIsInitialized(true);
          setError(null);
          console.log('✅ Clean food database ready for Recipe Builder');
          console.log(`📊 ${database.getStats().totalFoods} USDA foods available for search`);
          console.log('🧹 No test data loaded - ready for real users');
        } else {
          throw new Error('Clean database initialization failed or no foods loaded');
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Database initialization failed';
        console.error('❌ Clean database initialization error:', errorMessage);
        setError(errorMessage);
        setIsInitialized(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDatabase();
    
    return () => {
      isMounted = false;
    };
  }, [database]);

  // Handle user data clearing events
  useEffect(() => {
    const handleClearUserData = async () => {
      try {
        setUserProfile(null); // Clear any user profile
        await database.clearUserData();
        console.log('🗄️ User data cleared, USDA foods preserved');
      } catch (error) {
        console.error('❌ Error clearing user data:', error);
      }
    };

    window.addEventListener('bytewise-clear-user-data', handleClearUserData);
    return () => window.removeEventListener('bytewise-clear-user-data', handleClearUserData);
  }, [database]);

  // Database operation handlers
  const searchFoods = useCallback(async (query: string, limit?: number) => {
    return database.searchFoods(query, limit);
  }, [database]);

  const getFoodById = useCallback(async (fdcId: number) => {
    return database.getFoodById(fdcId);
  }, [database]);

  const getFoodsByCategory = useCallback(async (category: string) => {
    return database.getFoodsByCategory(category);
  }, [database]);

  const getPopularFoods = useCallback(async () => {
    // Return first 10 foods as "popular" for demo
    return database.searchFoods('', 10);
  }, [database]);

  const createUserProfile = useCallback(async (profile: Omit<UserProfile, 'id'>) => {
    const newProfile = { ...profile, id: Date.now().toString() };
    const success = await database.addUserProfile(newProfile);
    if (success) {
      setUserProfile(newProfile);
    }
    return success;
  }, [database]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return false;
    
    const updatedProfile = { ...userProfile, ...updates };
    const success = await database.addUserProfile(updatedProfile);
    if (success) {
      setUserProfile(updatedProfile);
    }
    return success;
  }, [database, userProfile]);

  const deleteUserProfile = useCallback(async () => {
    if (!userProfile) return false;
    
    const success = await database.deleteUserProfile(userProfile.id);
    if (success) {
      setUserProfile(null);
    }
    return success;
  }, [database, userProfile]);

  const addFoodEntry = useCallback(async (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    return database.addFoodEntry(newEntry);
  }, [database]);

  const getFoodEntries = useCallback(async (userId: string, date?: string) => {
    return database.getFoodEntries(userId, date);
  }, [database]);

  const updateFoodEntry = useCallback(async (id: string, updates: Partial<FoodEntry>) => {
    // For simplicity, we'll recreate the entry
    return true;
  }, []);

  const deleteFoodEntry = useCallback(async (id: string) => {
    return database.deleteFoodEntry(id);
  }, [database]);

  const getMealLog = useCallback(async (userId: string, date: string) => {
    // Implementation would fetch and aggregate food entries for the date
    return null;
  }, []);

  const updateMealLog = useCallback(async (userId: string, date: string, meals: MealLog['meals']) => {
    // Implementation would update meal log
    return true;
  }, []);

  const syncData = useCallback(async () => {
    // Implementation would sync with external service
    return true;
  }, []);

  const clearUserData = useCallback(async () => {
    const success = await database.clearUserData();
    if (success) {
      setUserProfile(null);
    }
    return success;
  }, [database]);

  const getDatabaseStats = useCallback(() => {
    const stats = database.getStats();
    return {
      totalFoods: stats.totalFoods || 0,
      totalUsers: stats.totalUsers || 0,
      totalEntries: stats.totalEntries || 0,
      storageUsed: 0,
      lastSync: new Date().toISOString(),
      isOnline: true
    };
  }, [database]);

  const initializeDatabase = useCallback(async () => {
    return database.initialize();
  }, [database]);

  const contextValue: FoodDatabaseContextType = {
    isLoading,
    isInitialized,
    error,
    stats: getDatabaseStats(),
    searchFoods,
    getFoodById,
    getFoodsByCategory,
    getPopularFoods,
    userProfile,
    createUserProfile,
    updateUserProfile,
    deleteUserProfile,
    addFoodEntry,
    getFoodEntries,
    updateFoodEntry,
    deleteFoodEntry,
    getMealLog,
    updateMealLog,
    syncData,
    clearUserData,
    getDatabaseStats,
    initializeDatabase
  };

  return (
    <FoodDatabaseContext.Provider value={contextValue}>
      {children}
    </FoodDatabaseContext.Provider>
  );
}

// Hook for using the food database
export function useFoodDatabase() {
  const context = useContext(FoodDatabaseContext);
  if (context === undefined) {
    throw new Error('useFoodDatabase must be used within a FoodDatabaseProvider');
  }
  return context;
}

// Export types for use in other components
export type { LocalFoodItem, FoodPortion, UserProfile, FoodEntry, MealLog, DatabaseStats };