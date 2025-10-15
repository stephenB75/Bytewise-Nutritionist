/**
 * Enhanced Calorie Calculation Factors
 * Based on USDA food_calorie_conversion_factor data for precise calculations
 */

interface CalorieFactors {
  protein: number;
  fat: number;
  carbohydrate: number;
}

// Food-specific calorie conversion factors from USDA database
export const FOOD_SPECIFIC_FACTORS: Record<string, CalorieFactors> = {
  // Fruits (lower protein factors)
  "apple": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "banana": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "orange": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "cherry": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "grapes": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "strawberry": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "blueberry": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  
  // Vegetables (similar to fruits)
  "broccoli": { protein: 2.78, fat: 8.37, carbohydrate: 3.84 },
  "carrot": { protein: 2.78, fat: 8.37, carbohydrate: 3.84 },
  "spinach": { protein: 2.78, fat: 8.37, carbohydrate: 3.84 },
  "tomato": { protein: 2.78, fat: 8.37, carbohydrate: 3.84 },
  "lettuce": { protein: 2.78, fat: 8.37, carbohydrate: 3.84 },
  
  // Grains and Cereals
  "rice": { protein: 3.41, fat: 8.37, carbohydrate: 4.12 },
  "wheat": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  "oats": { protein: 3.46, fat: 8.37, carbohydrate: 4.16 },
  "bread": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  "pasta": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  "cereal": { protein: 3.46, fat: 8.37, carbohydrate: 4.16 },
  
  // Dairy Products
  "milk": { protein: 4.05, fat: 8.37, carbohydrate: 4.12 },
  "cheese": { protein: 4.05, fat: 8.37, carbohydrate: 4.12 },
  "yogurt": { protein: 4.05, fat: 8.37, carbohydrate: 4.12 },
  "butter": { protein: 4.05, fat: 8.37, carbohydrate: 4.12 },
  
  // Meat and Poultry (highest protein factors)
  "chicken": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  "beef": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  "pork": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  "turkey": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  "fish": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  "salmon": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  "tuna": { protein: 4.27, fat: 9.02, carbohydrate: 3.87 },
  
  // Eggs
  "egg": { protein: 4.27, fat: 8.79, carbohydrate: 3.87 },
  
  // Nuts and Seeds
  "almond": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "walnut": { protein: 2.44, fat: 8.37, carbohydrate: 3.57 },
  "peanut": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  
  // Legumes
  "bean": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  "lentil": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  "chickpea": { protein: 3.47, fat: 8.37, carbohydrate: 4.07 },
  
  // Oils and Fats
  "oil": { protein: 0.0, fat: 8.37, carbohydrate: 0.0 },
  "olive oil": { protein: 0.0, fat: 8.37, carbohydrate: 0.0 }
};

// Default factors for unknown foods (USDA general factors)
export const DEFAULT_FACTORS: CalorieFactors = {
  protein: 4.0,
  fat: 9.0,
  carbohydrate: 4.0
};

/**
 * Get appropriate calorie conversion factors for a food
 */
export function getCalorieFactors(foodName: string): CalorieFactors {
  const normalized = foodName.toLowerCase().trim();
  
  // Check for exact match
  if (FOOD_SPECIFIC_FACTORS[normalized]) {
    return FOOD_SPECIFIC_FACTORS[normalized];
  }
  
  // Check for partial matches
  for (const [key, factors] of Object.entries(FOOD_SPECIFIC_FACTORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return factors;
    }
  }
  
  // Return default factors
  return DEFAULT_FACTORS;
}

/**
 * Calculate calories from macronutrients using appropriate factors
 */
export function calculateCaloriesFromMacros(
  foodName: string,
  protein: number,
  fat: number,
  carbs: number
): number {
  const factors = getCalorieFactors(foodName);
  
  return Math.round(
    (protein * factors.protein) +
    (fat * factors.fat) +
    (carbs * factors.carbohydrate)
  );
}