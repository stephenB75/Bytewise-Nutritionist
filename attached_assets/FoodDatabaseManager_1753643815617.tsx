import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Enhanced interfaces for comprehensive data management
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    dateEarned: string;
    progress: number;
  }>;
  stats: {
    totalRecipes: number;
    streakDays: number;
    caloriesTracked: number;
    lastLoginDate: string;
    weeklyGoalsMet: number;
  };
  lastUpdated: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  image: string;
  verified: boolean;
  userRating: number;
  description: string;
  source: 'user' | 'external' | 'api';
  customNutrition?: boolean;
  tags: string[];
  barcode?: string;
  lastUpdated: string;
}

export interface UserFoodEntry {
  id: string;
  userId: string;
  type: 'custom_food' | 'recipe' | 'meal_log' | 'favorite';
  name: string;
  ingredients: Array<{
    foodId: string;
    name: string;
    amount: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  servings: number;
  category: string;
  tags: string[];
  image?: string;
  notes?: string;
  isFavorite: boolean;
  createdDate: string;
  lastModified: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedDate?: string;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  meals: {
    breakfast: UserFoodEntry[];
    lunch: UserFoodEntry[];
    dinner: UserFoodEntry[];
    snacks: UserFoodEntry[];
  };
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
  };
  goalProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  lastUpdated: string;
}

export interface DatabaseStats {
  totalFoods: number;
  userFoods: number;
  externalFoods: number;
  totalRecipes: number;
  totalMealLogs: number;
  lastSyncDate: string;
  storageUsed: number;
  cacheStatus: 'fresh' | 'stale' | 'error';
}

interface FoodDatabaseContextType {
  // User Profile Management
  userProfile: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  createUserProfile: (profile: Omit<UserProfile, 'id' | 'lastUpdated'>) => Promise<boolean>;
  
  // Food Database Management
  foods: FoodItem[];
  searchFoods: (query: string, filters?: { category?: string; source?: string }) => FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'lastUpdated'>) => Promise<boolean>;
  updateFood: (id: string, updates: Partial<FoodItem>) => Promise<boolean>;
  deleteFood: (id: string) => Promise<boolean>;
  getFoodById: (id: string) => FoodItem | null;
  
  // User Entries Management
  userEntries: UserFoodEntry[];
  addUserEntry: (entry: Omit<UserFoodEntry, 'id' | 'userId' | 'createdDate' | 'lastModified'>) => Promise<boolean>;
  updateUserEntry: (id: string, updates: Partial<UserFoodEntry>) => Promise<boolean>;
  deleteUserEntry: (id: string) => Promise<boolean>;
  getUserEntriesByType: (type: UserFoodEntry['type']) => UserFoodEntry[];
  
  // Meal Logging
  mealLogs: MealLog[];
  logMeal: (date: string, mealType: string, entry: UserFoodEntry) => Promise<boolean>;
  getMealLog: (date: string) => MealLog | null;
  updateMealLog: (date: string, updates: Partial<MealLog>) => Promise<boolean>;
  
  // Sync and Storage Management
  syncData: () => Promise<boolean>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<boolean>;
  clearAllData: () => Promise<boolean>;
  getDatabaseStats: () => DatabaseStats;
  
  // Loading states
  isLoading: boolean;
  lastSyncDate: string | null;
  error: string | null;
}

const FoodDatabaseContext = createContext<FoodDatabaseContextType | null>(null);

// Enhanced localStorage utilities with error handling and compression
class StorageManager {
  private static compress(data: string): string {
    // Simple compression using JSON.stringify optimizations
    return JSON.stringify(JSON.parse(data));
  }

  private static decompress(data: string): string {
    return data;
  }

  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const compressed = this.compress(serialized);
      localStorage.setItem(`bytewise-db-${key}`, compressed);
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  static async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const stored = localStorage.getItem(`bytewise-db-${key}`);
      if (!stored) return defaultValue;
      
      const decompressed = this.decompress(stored);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return defaultValue;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(`bytewise-db-${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  static getStorageUsage(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (key.startsWith('bytewise-db-')) {
          total += localStorage[key].length;
        }
      }
      return total;
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return 0;
    }
  }
}

// Default external food database
const DEFAULT_FOODS: FoodItem[] = [
  {
    id: 'ext_001',
    name: 'Grilled Chicken Breast',
    brand: 'Fresh',
    category: 'Protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.5,
    description: 'High-quality lean protein source with essential amino acids.',
    source: 'external',
    tags: ['lean', 'protein', 'versatile'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_002',
    name: 'Brown Rice',
    brand: 'Organic',
    category: 'Grains',
    calories: 123,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 1,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.3,
    description: 'Whole grain rice with complex carbohydrates and fiber.',
    source: 'external',
    tags: ['whole-grain', 'fiber', 'complex-carbs'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_003',
    name: 'Fresh Avocado',
    brand: 'Organic',
    category: 'Fruits',
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    sugar: 0.7,
    sodium: 7,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.8,
    description: 'Rich in healthy monounsaturated fats and fiber.',
    source: 'external',
    tags: ['healthy-fats', 'fiber', 'versatile'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_004',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    category: 'Dairy',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    fiber: 0,
    sugar: 4,
    sodium: 65,
    servingSize: '170g',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.6,
    description: 'High-protein yogurt with probiotics for digestive health.',
    source: 'external',
    tags: ['high-protein', 'probiotics', 'low-fat'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_005',
    name: 'Fresh Spinach',
    brand: 'Organic',
    category: 'Vegetables',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    sodium: 79,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.4,
    description: 'Nutrient-dense leafy green with iron and vitamins.',
    source: 'external',
    tags: ['leafy-green', 'iron', 'vitamins'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_006',
    name: 'Atlantic Salmon',
    brand: 'Wild Caught',
    category: 'Protein',
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.7,
    description: 'Rich in omega-3 fatty acids and high-quality protein.',
    source: 'external',
    tags: ['omega-3', 'protein', 'heart-healthy'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_007',
    name: 'Mixed Berries',
    brand: 'Fresh',
    category: 'Fruits',
    calories: 70,
    protein: 1,
    carbs: 16,
    fat: 0.3,
    fiber: 6,
    sugar: 10,
    sodium: 2,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.5,
    description: 'Antioxidant-rich berries with natural sweetness.',
    source: 'external',
    tags: ['antioxidants', 'low-calorie', 'natural-sugar'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ext_008',
    name: 'Almonds',
    brand: 'Natural',
    category: 'Nuts & Seeds',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12,
    sugar: 4,
    sodium: 1,
    servingSize: '100g',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    verified: true,
    userRating: 4.6,
    description: 'Nutrient-dense nuts with healthy fats and vitamin E.',
    source: 'external',
    tags: ['healthy-fats', 'vitamin-e', 'protein'],
    lastUpdated: new Date().toISOString()
  }
];

export function FoodDatabaseProvider({ children }: { children: ReactNode }) {
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [userEntries, setUserEntries] = useState<UserFoodEntry[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate unique IDs
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // User Profile Management
  const createUserProfile = async (profileData: Omit<UserProfile, 'id' | 'lastUpdated'>): Promise<boolean> => {
    try {
      const newProfile: UserProfile = {
        ...profileData,
        id: generateId(),
        lastUpdated: new Date().toISOString()
      };

      const success = await StorageManager.setItem('user-profile', newProfile);
      if (success) {
        setUserProfile(newProfile);
        console.log('✅ User profile created successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to create user profile:', error);
      setError('Failed to create user profile');
      return false;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      const success = await StorageManager.setItem('user-profile', updatedProfile);
      if (success) {
        setUserProfile(updatedProfile);
        console.log('✅ User profile updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      setError('Failed to update user profile');
      return false;
    }
  };

  // Food Database Management
  const searchFoods = (query: string, filters?: { category?: string; source?: string }): FoodItem[] => {
    const searchTerm = query.toLowerCase().trim();
    
    return foods.filter(food => {
      const matchesSearch = searchTerm === '' || 
        food.name.toLowerCase().includes(searchTerm) ||
        food.brand.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm) ||
        food.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      const matchesCategory = !filters?.category || food.category === filters.category;
      const matchesSource = !filters?.source || food.source === filters.source;

      return matchesSearch && matchesCategory && matchesSource;
    });
  };

  const addFood = async (foodData: Omit<FoodItem, 'id' | 'lastUpdated'>): Promise<boolean> => {
    try {
      const newFood: FoodItem = {
        ...foodData,
        id: generateId(),
        lastUpdated: new Date().toISOString()
      };

      const updatedFoods = [...foods, newFood];
      const success = await StorageManager.setItem('foods', updatedFoods);
      
      if (success) {
        setFoods(updatedFoods);
        console.log('✅ Food added successfully:', newFood.name);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to add food:', error);
      setError('Failed to add food');
      return false;
    }
  };

  const updateFood = async (id: string, updates: Partial<FoodItem>): Promise<boolean> => {
    try {
      const updatedFoods = foods.map(food => 
        food.id === id 
          ? { ...food, ...updates, lastUpdated: new Date().toISOString() }
          : food
      );

      const success = await StorageManager.setItem('foods', updatedFoods);
      if (success) {
        setFoods(updatedFoods);
        console.log('✅ Food updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to update food:', error);
      setError('Failed to update food');
      return false;
    }
  };

  const deleteFood = async (id: string): Promise<boolean> => {
    try {
      const updatedFoods = foods.filter(food => food.id !== id);
      const success = await StorageManager.setItem('foods', updatedFoods);
      
      if (success) {
        setFoods(updatedFoods);
        console.log('✅ Food deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to delete food:', error);
      setError('Failed to delete food');
      return false;
    }
  };

  const getFoodById = (id: string): FoodItem | null => {
    return foods.find(food => food.id === id) || null;
  };

  // User Entries Management
  const addUserEntry = async (entryData: Omit<UserFoodEntry, 'id' | 'userId' | 'createdDate' | 'lastModified'>): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const newEntry: UserFoodEntry = {
        ...entryData,
        id: generateId(),
        userId: userProfile.id,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const updatedEntries = [...userEntries, newEntry];
      const success = await StorageManager.setItem('user-entries', updatedEntries);
      
      if (success) {
        setUserEntries(updatedEntries);
        console.log('✅ User entry added successfully:', newEntry.name);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to add user entry:', error);
      setError('Failed to add user entry');
      return false;
    }
  };

  const updateUserEntry = async (id: string, updates: Partial<UserFoodEntry>): Promise<boolean> => {
    try {
      const updatedEntries = userEntries.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, lastModified: new Date().toISOString() }
          : entry
      );

      const success = await StorageManager.setItem('user-entries', updatedEntries);
      if (success) {
        setUserEntries(updatedEntries);
        console.log('✅ User entry updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to update user entry:', error);
      setError('Failed to update user entry');
      return false;
    }
  };

  const deleteUserEntry = async (id: string): Promise<boolean> => {
    try {
      const updatedEntries = userEntries.filter(entry => entry.id !== id);
      const success = await StorageManager.setItem('user-entries', updatedEntries);
      
      if (success) {
        setUserEntries(updatedEntries);
        console.log('✅ User entry deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to delete user entry:', error);
      setError('Failed to delete user entry');
      return false;
    }
  };

  const getUserEntriesByType = (type: UserFoodEntry['type']): UserFoodEntry[] => {
    return userEntries.filter(entry => entry.type === type);
  };

  // Meal Logging
  const logMeal = async (date: string, mealType: string, entry: UserFoodEntry): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const existingLog = mealLogs.find(log => log.date === date);
      let updatedLog: MealLog;

      if (existingLog) {
        updatedLog = {
          ...existingLog,
          meals: {
            ...existingLog.meals,
            [mealType]: [...existingLog.meals[mealType as keyof typeof existingLog.meals], entry]
          },
          lastUpdated: new Date().toISOString()
        };
      } else {
        updatedLog = {
          id: generateId(),
          userId: userProfile.id,
          date,
          meals: {
            breakfast: mealType === 'breakfast' ? [entry] : [],
            lunch: mealType === 'lunch' ? [entry] : [],
            dinner: mealType === 'dinner' ? [entry] : [],
            snacks: mealType === 'snacks' ? [entry] : []
          },
          dailyTotals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            water: 0
          },
          goalProgress: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          },
          lastUpdated: new Date().toISOString()
        };
      }

      // Recalculate daily totals
      const allMeals = [
        ...updatedLog.meals.breakfast,
        ...updatedLog.meals.lunch,
        ...updatedLog.meals.dinner,
        ...updatedLog.meals.snacks
      ];

      updatedLog.dailyTotals = allMeals.reduce((totals, meal) => ({
        calories: totals.calories + meal.totalNutrition.calories,
        protein: totals.protein + meal.totalNutrition.protein,
        carbs: totals.carbs + meal.totalNutrition.carbs,
        fat: totals.fat + meal.totalNutrition.fat,
        fiber: totals.fiber + meal.totalNutrition.fiber,
        water: totals.water
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });

      // Calculate goal progress
      if (userProfile.nutritionGoals) {
        updatedLog.goalProgress = {
          calories: (updatedLog.dailyTotals.calories / userProfile.nutritionGoals.dailyCalories) * 100,
          protein: (updatedLog.dailyTotals.protein / userProfile.nutritionGoals.protein) * 100,
          carbs: (updatedLog.dailyTotals.carbs / userProfile.nutritionGoals.carbs) * 100,
          fat: (updatedLog.dailyTotals.fat / userProfile.nutritionGoals.fat) * 100
        };
      }

      const updatedLogs = existingLog 
        ? mealLogs.map(log => log.date === date ? updatedLog : log)
        : [...mealLogs, updatedLog];

      const success = await StorageManager.setItem('meal-logs', updatedLogs);
      if (success) {
        setMealLogs(updatedLogs);
        console.log('✅ Meal logged successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to log meal:', error);
      setError('Failed to log meal');
      return false;
    }
  };

  const getMealLog = (date: string): MealLog | null => {
    return mealLogs.find(log => log.date === date) || null;
  };

  const updateMealLog = async (date: string, updates: Partial<MealLog>): Promise<boolean> => {
    try {
      const updatedLogs = mealLogs.map(log => 
        log.date === date 
          ? { ...log, ...updates, lastUpdated: new Date().toISOString() }
          : log
      );

      const success = await StorageManager.setItem('meal-logs', updatedLogs);
      if (success) {
        setMealLogs(updatedLogs);
        console.log('✅ Meal log updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to update meal log:', error);
      setError('Failed to update meal log');
      return false;
    }
  };

  // Sync and Storage Management
  const syncData = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Sync all data to localStorage
      const syncTasks = [
        StorageManager.setItem('user-profile', userProfile),
        StorageManager.setItem('foods', foods),
        StorageManager.setItem('user-entries', userEntries),
        StorageManager.setItem('meal-logs', mealLogs)
      ];

      const results = await Promise.all(syncTasks);
      const allSuccessful = results.every(result => result);

      if (allSuccessful) {
        const now = new Date().toISOString();
        setLastSyncDate(now);
        await StorageManager.setItem('last-sync', now);
        console.log('✅ All data synced successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to sync data:', error);
      setError('Failed to sync data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      const exportData = {
        userProfile,
        foods: foods.filter(food => food.source === 'user'),
        userEntries,
        mealLogs,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  };

  const importData = async (data: string): Promise<boolean> => {
    try {
      const importedData = JSON.parse(data);
      
      if (importedData.userProfile) {
        setUserProfile(importedData.userProfile);
      }
      
      if (importedData.foods) {
        // Merge with existing external foods
        const externalFoods = foods.filter(food => food.source === 'external');
        setFoods([...externalFoods, ...importedData.foods]);
      }
      
      if (importedData.userEntries) {
        setUserEntries(importedData.userEntries);
      }
      
      if (importedData.mealLogs) {
        setMealLogs(importedData.mealLogs);
      }

      await syncData();
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      setError('Failed to import data');
      return false;
    }
  };

  const clearAllData = async (): Promise<boolean> => {
    try {
      const clearTasks = [
        StorageManager.removeItem('user-profile'),
        StorageManager.removeItem('foods'),
        StorageManager.removeItem('user-entries'),
        StorageManager.removeItem('meal-logs'),
        StorageManager.removeItem('last-sync')
      ];

      await Promise.all(clearTasks);
      
      setUserProfile(null);
      setFoods(DEFAULT_FOODS);
      setUserEntries([]);
      setMealLogs([]);
      setLastSyncDate(null);

      console.log('✅ All data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      setError('Failed to clear data');
      return false;
    }
  };

  const getDatabaseStats = (): DatabaseStats => {
    return {
      totalFoods: foods.length,
      userFoods: foods.filter(food => food.source === 'user').length,
      externalFoods: foods.filter(food => food.source === 'external').length,
      totalRecipes: userEntries.filter(entry => entry.type === 'recipe').length,
      totalMealLogs: mealLogs.length,
      lastSyncDate: lastSyncDate || 'Never',
      storageUsed: StorageManager.getStorageUsage(),
      cacheStatus: lastSyncDate ? 'fresh' : 'stale'
    };
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      setIsLoading(true);
      try {
        // Load all data from localStorage
        const [loadedProfile, loadedFoods, loadedEntries, loadedLogs, lastSync] = await Promise.all([
          StorageManager.getItem<UserProfile | null>('user-profile', null),
          StorageManager.getItem<FoodItem[]>('foods', DEFAULT_FOODS),
          StorageManager.getItem<UserFoodEntry[]>('user-entries', []),
          StorageManager.getItem<MealLog[]>('meal-logs', []),
          StorageManager.getItem<string | null>('last-sync', null)
        ]);

        setUserProfile(loadedProfile);
        setFoods(loadedFoods);
        setUserEntries(loadedEntries);
        setMealLogs(loadedLogs);
        setLastSyncDate(lastSync);

        console.log('✅ Food database initialized successfully');
        console.log(`📊 Stats: ${loadedFoods.length} foods, ${loadedEntries.length} entries, ${loadedLogs.length} meal logs`);
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        setError('Failed to initialize database');
        // Use defaults on error
        setFoods(DEFAULT_FOODS);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Auto-sync every 5 minutes
  useEffect(() => {
    const autoSyncInterval = setInterval(() => {
      if (!isLoading) {
        syncData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoSyncInterval);
  }, [isLoading]);

  const contextValue: FoodDatabaseContextType = {
    // User Profile
    userProfile,
    updateUserProfile,
    createUserProfile,
    
    // Food Database
    foods,
    searchFoods,
    addFood,
    updateFood,
    deleteFood,
    getFoodById,
    
    // User Entries
    userEntries,
    addUserEntry,
    updateUserEntry,
    deleteUserEntry,
    getUserEntriesByType,
    
    // Meal Logging
    mealLogs,
    logMeal,
    getMealLog,
    updateMealLog,
    
    // Sync and Storage
    syncData,
    exportData,
    importData,
    clearAllData,
    getDatabaseStats,
    
    // State
    isLoading,
    lastSyncDate,
    error
  };

  return (
    <FoodDatabaseContext.Provider value={contextValue}>
      {children}
    </FoodDatabaseContext.Provider>
  );
}

export function useFoodDatabase() {
  const context = useContext(FoodDatabaseContext);
  if (!context) {
    throw new Error('useFoodDatabase must be used within a FoodDatabaseProvider');
  }
  return context;
}