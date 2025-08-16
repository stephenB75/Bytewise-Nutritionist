/**
 * Enhanced Food Database for Complex and Ethnic Foods
 * Provides accurate nutritional data for foods not well-covered by USDA fallbacks
 */

export interface EnhancedFoodEntry {
  name: string;
  aliases: string[];
  category: string;
  portionWeight: number; // grams for standard portion
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    // Micronutrients
    iron?: number;
    calcium?: number;
    zinc?: number;
    magnesium?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminB12?: number;
    folate?: number;
    vitaminA?: number;
    vitaminE?: number;
    potassium?: number;
    phosphorus?: number;
  };
  note?: string;
}

// Enhanced database of complex and ethnic foods
export const ENHANCED_FOOD_DATABASE: Record<string, EnhancedFoodEntry> = {
  // Caribbean & West Indian Foods
  "jamaican_beef_patty": {
    name: "Jamaican Beef Patty",
    aliases: ["jamaican beef patty", "beef patty jamaican", "beef patty", "jamaican patty", "caribbean beef patty"],
    category: "caribbean_pastry",
    portionWeight: 142, // typical medium patty
    nutritionPer100g: {
      calories: 320,
      protein: 12.5,
      carbs: 28.0,
      fat: 18.5,
      fiber: 2.1,
      sugar: 2.5,
      sodium: 0.65,
      iron: 2.8,
      calcium: 45,
      zinc: 2.1,
      magnesium: 18,
      vitaminC: 1.2,
      vitaminD: 0.1,
      vitaminB12: 0.8,
      folate: 25,
      vitaminA: 12,
      vitaminE: 1.8,
      potassium: 185,
      phosphorus: 125
    },
    note: "Spiced ground beef in turmeric pastry - composite food with meat filling and flour pastry"
  },

  "chicken_patty_jamaican": {
    name: "Jamaican Chicken Patty",
    aliases: ["jamaican chicken patty", "chicken patty jamaican", "chicken patty", "caribbean chicken patty"],
    category: "caribbean_pastry",
    portionWeight: 135,
    nutritionPer100g: {
      calories: 298,
      protein: 14.2,
      carbs: 26.8,
      fat: 16.2,
      fiber: 2.0,
      sugar: 2.2,
      sodium: 0.58,
      iron: 1.9,
      calcium: 42,
      zinc: 1.8,
      magnesium: 16,
      vitaminC: 0.8,
      vitaminD: 0.2,
      vitaminB12: 0.6,
      folate: 23,
      vitaminA: 15,
      vitaminE: 1.6,
      potassium: 195,
      phosphorus: 145
    }
  },

  "curry_goat": {
    name: "Curry Goat",
    aliases: ["curry goat", "goat curry", "jamaican curry goat", "caribbean curry goat"],
    category: "caribbean_meat",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 265,
      protein: 28.5,
      carbs: 3.2,
      fat: 15.8,
      fiber: 0.8,
      sodium: 0.45,
      iron: 4.2,
      calcium: 22,
      zinc: 3.8,
      magnesium: 24,
      vitaminC: 2.5,
      vitaminD: 0.3,
      vitaminB12: 1.2,
      folate: 8,
      vitaminA: 0,
      vitaminE: 0.8,
      potassium: 385,
      phosphorus: 210
    }
  },

  "jerk_chicken": {
    name: "Jerk Chicken",
    aliases: ["jerk chicken", "jamaican jerk chicken", "caribbean jerk chicken"],
    category: "caribbean_meat",
    portionWeight: 180,
    nutritionPer100g: {
      calories: 242,
      protein: 26.8,
      carbs: 4.5,
      fat: 12.8,
      fiber: 0.5,
      sugar: 3.2,
      sodium: 0.58,
      iron: 1.8,
      calcium: 18,
      zinc: 2.1,
      magnesium: 28,
      vitaminC: 8.5,
      vitaminD: 0.2,
      vitaminB12: 0.4,
      folate: 12,
      vitaminA: 25,
      vitaminE: 1.2,
      potassium: 285,
      phosphorus: 195
    }
  },

  // Middle Eastern Foods
  "falafel": {
    name: "Falafel",
    aliases: ["falafel", "falafels", "chickpea fritters"],
    category: "middle_eastern",
    portionWeight: 17, // per piece
    nutritionPer100g: {
      calories: 333,
      protein: 13.3,
      carbs: 31.8,
      fat: 17.8,
      fiber: 4.9,
      sugar: 2.3,
      sodium: 0.58,
      iron: 3.4,
      calcium: 54,
      zinc: 1.5,
      magnesium: 82,
      vitaminC: 1.2,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 96,
      vitaminA: 8,
      vitaminE: 1.9,
      potassium: 585,
      phosphorus: 192
    }
  },

  "shawarma": {
    name: "Shawarma",
    aliases: ["shawarma", "shawerma", "chicken shawarma", "lamb shawarma"],
    category: "middle_eastern",
    portionWeight: 250,
    nutritionPer100g: {
      calories: 285,
      protein: 22.8,
      carbs: 18.5,
      fat: 14.2,
      fiber: 2.1,
      sugar: 2.8,
      sodium: 0.68,
      iron: 2.5,
      calcium: 85,
      zinc: 2.8,
      magnesium: 32,
      vitaminC: 5.2,
      vitaminD: 0.1,
      vitaminB12: 0.8,
      folate: 42,
      vitaminA: 18,
      vitaminE: 1.5,
      potassium: 295,
      phosphorus: 185
    }
  },

  // Asian Foods
  "chicken_teriyaki": {
    name: "Chicken Teriyaki",
    aliases: ["chicken teriyaki", "teriyaki chicken", "japanese chicken teriyaki"],
    category: "asian",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 195,
      protein: 23.2,
      carbs: 8.5,
      fat: 7.8,
      fiber: 0.2,
      sugar: 7.2,
      sodium: 0.85,
      iron: 1.2,
      calcium: 15,
      zinc: 1.8,
      magnesium: 25,
      vitaminC: 0.5,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 8,
      vitaminA: 12,
      vitaminE: 0.8,
      potassium: 285,
      phosphorus: 185
    }
  },

  // Mexican Foods
  "chicken_burrito": {
    name: "Chicken Burrito",
    aliases: ["chicken burrito", "burrito chicken", "burrito", "mexican burrito"],
    category: "mexican",
    portionWeight: 250,
    nutritionPer100g: {
      calories: 215,
      protein: 12.8,
      carbs: 22.5,
      fat: 8.8,
      fiber: 3.2,
      sugar: 2.1,
      sodium: 0.52,
      iron: 2.1,
      calcium: 95,
      zinc: 1.9,
      magnesium: 28,
      vitaminC: 3.8,
      vitaminD: 0.1,
      vitaminB12: 0.4,
      folate: 35,
      vitaminA: 22,
      vitaminE: 1.2,
      potassium: 245,
      phosphorus: 155
    }
  },

  // American/Fast Food Items
  "chicken_sandwich": {
    name: "Chicken Sandwich",
    aliases: ["chicken sandwich", "fried chicken sandwich", "chicken burger"],
    category: "american_fast_food",
    portionWeight: 195,
    nutritionPer100g: {
      calories: 265,
      protein: 16.8,
      carbs: 22.5,
      fat: 12.5,
      fiber: 2.8,
      sugar: 3.2,
      sodium: 0.65,
      iron: 2.2,
      calcium: 58,
      zinc: 1.8,
      magnesium: 22,
      vitaminC: 1.2,
      vitaminD: 0.1,
      vitaminB12: 0.4,
      folate: 28,
      vitaminA: 15,
      vitaminE: 1.5,
      potassium: 225,
      phosphorus: 165
    }
  },

  "fish_and_chips": {
    name: "Fish and Chips",
    aliases: ["fish and chips", "fish & chips", "battered fish", "fried fish"],
    category: "british",
    portionWeight: 320,
    nutritionPer100g: {
      calories: 232,
      protein: 15.8,
      carbs: 18.2,
      fat: 11.5,
      fiber: 1.8,
      sugar: 0.8,
      sodium: 0.42,
      iron: 1.5,
      calcium: 28,
      zinc: 1.2,
      magnesium: 35,
      vitaminC: 8.5,
      vitaminD: 2.8,
      vitaminB12: 1.8,
      folate: 18,
      vitaminA: 12,
      vitaminE: 2.2,
      potassium: 485,
      phosphorus: 195
    }
  },

  // Indian Foods
  "chicken_tikka_masala": {
    name: "Chicken Tikka Masala",
    aliases: ["chicken tikka masala", "tikka masala", "indian chicken curry"],
    category: "indian",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 185,
      protein: 18.5,
      carbs: 6.8,
      fat: 9.5,
      fiber: 1.2,
      sugar: 4.2,
      sodium: 0.58,
      iron: 2.8,
      calcium: 65,
      zinc: 2.2,
      magnesium: 25,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.5,
      folate: 15,
      vitaminA: 85,
      vitaminE: 1.8,
      potassium: 285,
      phosphorus: 175
    }
  }
};

/**
 * Find enhanced food data by name or alias
 */
export function findEnhancedFood(foodName: string): EnhancedFoodEntry | null {
  const normalized = foodName.toLowerCase().trim();
  
  // Direct key match first
  for (const [key, food] of Object.entries(ENHANCED_FOOD_DATABASE)) {
    if (normalized.includes(key.replace(/_/g, ' '))) {
      return food;
    }
  }
  
  // Alias matching
  for (const food of Object.values(ENHANCED_FOOD_DATABASE)) {
    for (const alias of food.aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return food;
      }
    }
  }
  
  return null;
}

/**
 * Get category-specific nutrient multipliers for better estimates
 */
export function getCategoryNutrientProfile(category: string): Partial<EnhancedFoodEntry['nutritionPer100g']> {
  const profiles: Record<string, Partial<EnhancedFoodEntry['nutritionPer100g']>> = {
    'caribbean_pastry': {
      calories: 310,
      protein: 12.0,
      carbs: 28.0,
      fat: 17.0,
      iron: 2.5,
      calcium: 45,
      zinc: 2.0
    },
    'middle_eastern': {
      calories: 280,
      protein: 15.0,
      carbs: 25.0,
      fat: 14.0,
      iron: 2.8,
      calcium: 60,
      zinc: 2.2
    },
    'mexican': {
      calories: 220,
      protein: 13.0,
      carbs: 24.0,
      fat: 9.0,
      iron: 2.0,
      calcium: 85,
      zinc: 1.8
    },
    'asian': {
      calories: 200,
      protein: 20.0,
      carbs: 12.0,
      fat: 8.0,
      iron: 1.5,
      calcium: 25,
      zinc: 1.5
    }
  };
  
  return profiles[category] || {};
}