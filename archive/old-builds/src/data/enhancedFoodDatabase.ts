/**
 * Enhanced Food Database with USDA Integration
 * Professional-grade food database combining custom ingredients with USDA portion data
 */

import { usdaPortionDatabase, commonPortionMappings, getDataReliability } from './usdaPortionData';

export interface EnhancedFoodItem {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;  
  fat_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g: number;
  sodium_per_100g: number;
  portions: FoodPortion[];
  usda_fdc_id?: string;
  data_reliability: 'high' | 'medium' | 'low';
  allergens?: string[];
  diet_types?: string[];
}

export interface FoodPortion {
  name: string;
  grams: number;
  common_serving: boolean;
  description?: string;
  usda_verified?: boolean;
}

// Enhanced food database with USDA-verified portions
export const enhancedFoodDatabase: EnhancedFoodItem[] = [
  // Grains & Starches with USDA portions
  {
    id: 'bread_white',
    name: 'White Bread',
    category: 'Grains',
    calories_per_100g: 265,
    protein_per_100g: 9.0,
    carbs_per_100g: 49.0,
    fat_per_100g: 3.2,
    fiber_per_100g: 2.7,
    sugar_per_100g: 5.0,
    sodium_per_100g: 491,
    usda_fdc_id: '167512',
    data_reliability: 'high',
    portions: [
      { name: 'slice', grams: 28, common_serving: true, usda_verified: true },
      { name: 'serving', grams: 34, common_serving: true, usda_verified: true },
      { name: '2 slices', grams: 56, common_serving: true }
    ],
    allergens: ['gluten', 'wheat'],
    diet_types: ['vegetarian']
  },

  {
    id: 'bagel_plain',
    name: 'Plain Bagel',
    category: 'Grains',
    calories_per_100g: 257,
    protein_per_100g: 10.1,
    carbs_per_100g: 50.9,
    fat_per_100g: 1.7,
    fiber_per_100g: 2.1,
    sugar_per_100g: 5.1,
    sodium_per_100g: 430,
    usda_fdc_id: '167534',
    data_reliability: 'high',
    portions: [
      { name: 'whole bagel', grams: 98, common_serving: true, usda_verified: true },
      { name: 'half bagel', grams: 49, common_serving: true },
      { name: 'mini bagel', grams: 45, common_serving: true }
    ],
    allergens: ['gluten', 'wheat'],
    diet_types: ['vegetarian']
  },

  {
    id: 'waffle_frozen',
    name: 'Frozen Waffle',
    category: 'Grains',
    calories_per_100g: 273,
    protein_per_100g: 6.4,
    carbs_per_100g: 42.0,
    fat_per_100g: 9.0,
    fiber_per_100g: 1.5,
    sugar_per_100g: 4.2,
    sodium_per_100g: 456,
    usda_fdc_id: '167516',
    data_reliability: 'high',
    portions: [
      { name: 'waffle, square', grams: 39, common_serving: true, usda_verified: true },
      { name: 'waffle, round', grams: 38, common_serving: true, usda_verified: true },
      { name: '2 waffles', grams: 78, common_serving: true }
    ],
    allergens: ['gluten', 'wheat', 'eggs', 'milk'],
    diet_types: ['vegetarian']
  },

  // Snacks with USDA portions
  {
    id: 'crackers_saltine',
    name: 'Saltine Crackers',
    category: 'Snacks',
    calories_per_100g: 421,
    protein_per_100g: 9.1,
    carbs_per_100g: 73.3,
    fat_per_100g: 9.6,
    fiber_per_100g: 2.8,
    sugar_per_100g: 1.3,
    sodium_per_100g: 1092,
    usda_fdc_id: '167529',
    data_reliability: 'high',
    portions: [
      { name: 'serving (4 crackers)', grams: 30, common_serving: true, usda_verified: true },
      { name: '1 cracker', grams: 12.7, common_serving: true, usda_verified: true },
      { name: '6 crackers', grams: 76, common_serving: true },
      { name: '1 sleeve', grams: 120, common_serving: false }
    ],
    allergens: ['gluten', 'wheat'],
    diet_types: ['vegetarian']
  },

  // Candy with USDA portions
  {
    id: 'candy_bar_chocolate',
    name: 'Chocolate Candy Bar',
    category: 'Sweets',
    calories_per_100g: 535,
    protein_per_100g: 4.9,
    carbs_per_100g: 57.0,
    fat_per_100g: 31.3,
    fiber_per_100g: 3.4,
    sugar_per_100g: 47.9,
    sodium_per_100g: 24,
    usda_fdc_id: '167565',
    data_reliability: 'high',
    portions: [
      { name: 'fun size (0.65 oz)', grams: 18, common_serving: true, usda_verified: true },
      { name: 'regular bar (1.55 oz)', grams: 44, common_serving: true, usda_verified: true },
      { name: 'large bar (2.1 oz)', grams: 60, common_serving: true, usda_verified: true },
      { name: 'king size', grams: 108, common_serving: false, usda_verified: true },
      { name: 'bite size', grams: 7, common_serving: true, usda_verified: true }
    ],
    allergens: ['milk', 'soy'],
    diet_types: ['vegetarian']
  },

  // Restaurant Foods with USDA portions
  {
    id: 'taco_beef',
    name: 'Beef Taco',
    category: 'Restaurant Foods',
    calories_per_100g: 226,
    protein_per_100g: 12.1,
    carbs_per_100g: 18.0,
    fat_per_100g: 12.2,
    fiber_per_100g: 2.8,
    sugar_per_100g: 2.1,
    sodium_per_100g: 367,
    usda_fdc_id: '167658',
    data_reliability: 'high',
    portions: [
      { name: 'single taco', grams: 134, common_serving: true, usda_verified: true },
      { name: '2 tacos', grams: 279, common_serving: true, usda_verified: true },
      { name: '3 tacos', grams: 389, common_serving: true, usda_verified: true },
      { name: 'serving (1-3 tacos)', grams: 281, common_serving: true, usda_verified: true }
    ],
    allergens: ['gluten', 'wheat'],
    diet_types: []
  },

  {
    id: 'steak_beef',
    name: 'Beef Steak',
    category: 'Meat',
    calories_per_100g: 271,
    protein_per_100g: 26.1,
    carbs_per_100g: 0.0,
    fat_per_100g: 18.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 0.0,
    sodium_per_100g: 54,
    usda_fdc_id: '167670',
    data_reliability: 'high',
    portions: [
      { name: 'steak (5.3 oz)', grams: 151, common_serving: true, usda_verified: true },
      { name: '3 oz serving', grams: 85, common_serving: true },
      { name: '6 oz serving', grams: 170, common_serving: true },
      { name: '8 oz serving', grams: 227, common_serving: true }
    ],
    allergens: [],
    diet_types: []
  },

  // Desserts with USDA portions
  {
    id: 'pie_apple',
    name: 'Apple Pie',
    category: 'Desserts',
    calories_per_100g: 237,
    protein_per_100g: 2.4,
    carbs_per_100g: 34.0,
    fat_per_100g: 11.0,
    fiber_per_100g: 1.6,
    sugar_per_100g: 16.4,
    sodium_per_100g: 327,
    usda_fdc_id: '167522',
    data_reliability: 'high',
    portions: [
      { name: 'slice (1/8 of 9" pie)', grams: 131, common_serving: true, usda_verified: true },
      { name: 'slice', grams: 137, common_serving: true, usda_verified: true },
      { name: 'whole pie', grams: 1137, common_serving: false, usda_verified: true },
      { name: 'small slice', grams: 100, common_serving: true }
    ],
    allergens: ['gluten', 'wheat', 'eggs'],
    diet_types: ['vegetarian']
  },

  // Professional Kitchen Ingredients with precise conversions
  {
    id: 'flour_all_purpose',
    name: 'All-Purpose Flour',
    category: 'Baking',
    calories_per_100g: 364,
    protein_per_100g: 10.3,
    carbs_per_100g: 76.3,
    fat_per_100g: 0.9,
    fiber_per_100g: 2.7,
    sugar_per_100g: 0.3,
    sodium_per_100g: 2,
    data_reliability: 'high',
    portions: [
      { name: '1 cup', grams: 120, common_serving: true, description: 'sifted' },
      { name: '1 cup', grams: 125, common_serving: true, description: 'unsifted' },
      { name: '3/4 cup', grams: 94, common_serving: true },
      { name: '2/3 cup', grams: 83, common_serving: true },
      { name: '1/2 cup', grams: 63, common_serving: true },
      { name: '1/3 cup', grams: 42, common_serving: true },
      { name: '1/4 cup', grams: 31, common_serving: true },
      { name: '1 tablespoon', grams: 8, common_serving: true },
      { name: '1 pound', grams: 454, common_serving: false }
    ],
    allergens: ['gluten', 'wheat'],
    diet_types: ['vegetarian', 'vegan']
  },

  {
    id: 'sugar_white',
    name: 'White Sugar',
    category: 'Baking',
    calories_per_100g: 387,
    protein_per_100g: 0.0,
    carbs_per_100g: 100.0,
    fat_per_100g: 0.0,
    fiber_per_100g: 0.0,
    sugar_per_100g: 99.8,
    sodium_per_100g: 1,
    data_reliability: 'high',
    portions: [
      { name: '1 cup', grams: 200, common_serving: true },
      { name: '3/4 cup', grams: 150, common_serving: true },
      { name: '2/3 cup', grams: 133, common_serving: true },
      { name: '1/2 cup', grams: 100, common_serving: true },
      { name: '1/3 cup', grams: 67, common_serving: true },
      { name: '1/4 cup', grams: 50, common_serving: true },
      { name: '1 tablespoon', grams: 12.5, common_serving: true },
      { name: '1 teaspoon', grams: 4, common_serving: true },
      { name: '1 packet', grams: 4, common_serving: true }
    ],
    allergens: [],
    diet_types: ['vegetarian', 'vegan']
  }
];

// Enhanced search functionality
export const searchEnhancedFoods = (query: string): EnhancedFoodItem[] => {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return enhancedFoodDatabase;
  
  return enhancedFoodDatabase.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.category.toLowerCase().includes(searchTerm) ||
    food.diet_types?.some(diet => diet.toLowerCase().includes(searchTerm)) ||
    food.portions.some(portion => portion.name.toLowerCase().includes(searchTerm))
  );
};

// Get food by ID with enhanced data
export const getFoodById = (id: string): EnhancedFoodItem | undefined => {
  return enhancedFoodDatabase.find(food => food.id === id);
};

// Get foods by category with reliability filtering
export const getFoodsByCategory = (category: string, minReliability: 'low' | 'medium' | 'high' = 'low'): EnhancedFoodItem[] => {
  const reliabilityOrder = { 'low': 0, 'medium': 1, 'high': 2 };
  const minLevel = reliabilityOrder[minReliability];
  
  return enhancedFoodDatabase.filter(food => 
    food.category === category && 
    reliabilityOrder[food.data_reliability] >= minLevel
  );
};

// Calculate nutrition for specific portion
export const calculateNutritionForPortion = (food: EnhancedFoodItem, portionName: string, quantity: number = 1) => {
  const portion = food.portions.find(p => p.name === portionName);
  if (!portion) return null;
  
  const totalGrams = portion.grams * quantity;
  const factor = totalGrams / 100;
  
  return {
    calories: Math.round(food.calories_per_100g * factor),
    protein: Math.round(food.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
    fat: Math.round(food.fat_per_100g * factor * 10) / 10,
    fiber: Math.round(food.fiber_per_100g * factor * 10) / 10,
    sugar: Math.round(food.sugar_per_100g * factor * 10) / 10,
    sodium: Math.round(food.sodium_per_100g * factor),
    totalGrams,
    usda_verified: portion.usda_verified || false,
    data_reliability: food.data_reliability
  };
};

// Get all available categories
export const getFoodCategories = (): string[] => {
  const categories = new Set(enhancedFoodDatabase.map(food => food.category));
  return Array.from(categories).sort();
};

// Filter by dietary preferences
export const filterByDietType = (dietType: string): EnhancedFoodItem[] => {
  return enhancedFoodDatabase.filter(food => 
    food.diet_types?.includes(dietType.toLowerCase())
  );
};

// Get foods with allergen warnings
export const getFoodsWithAllergen = (allergen: string): EnhancedFoodItem[] => {
  return enhancedFoodDatabase.filter(food => 
    food.allergens?.includes(allergen.toLowerCase())
  );
};