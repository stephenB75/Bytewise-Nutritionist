/**
 * Enhanced Candy Nutrition Database
 * Combines USDA data with FoodStruct.com detailed nutritional information
 * for comprehensive candy nutrition tracking
 */

export interface CandyNutrition {
  name: string;
  category: 'hard' | 'chocolate' | 'gummy' | 'caramel' | 'lollipop' | 'general';
  per100g: {
    calories: number;
    protein: number;      // grams
    fat: number;         // grams
    carbs: number;       // grams
    sugar: number;       // grams
    fiber: number;       // grams
    water: number;       // grams
    
    // Minerals (mg except where noted)
    calcium: number;
    iron: number;
    magnesium: number;
    phosphorus: number;
    potassium: number;
    sodium: number;
    zinc: number;
    copper: number;
    manganese: number;
    selenium: number;    // µg (micrograms)
    
    // Vitamins
    vitaminA: number;    // µg
    vitaminC: number;    // mg
    vitaminD: number;    // µg
    vitaminE: number;    // mg
    vitaminB1: number;   // mg (thiamine)
    vitaminB2: number;   // mg (riboflavin)
    vitaminB3: number;   // mg (niacin)
    vitaminB5: number;   // mg (pantothenic acid)
    vitaminB6: number;   // mg
    vitaminB12: number;  // µg
    folate: number;      // µg
    vitaminK: number;    // µg
    choline: number;     // mg
    
    // Additional properties
    caffeine?: number;   // mg
    theobromine?: number; // mg
  };
  servingSizes: {
    name: string;
    grams: number;
  }[];
  source: 'USDA' | 'FoodStruct' | 'Combined';
}

/**
 * Comprehensive candy nutrition database combining USDA and FoodStruct data
 */
export const CANDY_NUTRITION_DATABASE: CandyNutrition[] = [
  {
    name: "Hard Candy",
    category: "hard",
    per100g: {
      calories: 394,
      protein: 0,
      fat: 0.2,
      carbs: 98,
      sugar: 63,
      fiber: 0,
      water: 1.3,
      
      // Minerals from FoodStruct
      calcium: 3,
      iron: 0.3,
      magnesium: 3,
      phosphorus: 3,
      potassium: 5,
      sodium: 38,
      zinc: 0.01,
      copper: 0.03,
      manganese: 0.01,
      selenium: 0.6,
      
      // Vitamins (mostly trace amounts)
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminB1: 0.003,
      vitaminB2: 0.003,
      vitaminB3: 0.01,
      vitaminB5: 0.01,
      vitaminB6: 0.003,
      vitaminB12: 0,
      folate: 0,
      vitaminK: 0,
      choline: 0
    },
    servingSizes: [
      { name: "1 piece, small", grams: 3 },
      { name: "1 piece", grams: 6 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "FoodStruct"
  },
  
  {
    name: "Chocolate Candy",
    category: "chocolate",
    per100g: {
      calories: 535,
      protein: 7.65,
      fat: 29.66,
      carbs: 59.4,
      sugar: 51.5,
      fiber: 3.4,
      water: 1.5,
      
      // Estimated minerals based on chocolate content
      calcium: 50,
      iron: 2.3,
      magnesium: 63,
      phosphorus: 130,
      potassium: 372,
      sodium: 24,
      zinc: 1.0,
      copper: 0.5,
      manganese: 0.5,
      selenium: 2.4,
      
      // Vitamins
      vitaminA: 15,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0.4,
      vitaminB1: 0.02,
      vitaminB2: 0.08,
      vitaminB3: 0.4,
      vitaminB5: 0.25,
      vitaminB6: 0.02,
      vitaminB12: 0.25,
      folate: 8,
      vitaminK: 2.3,
      choline: 20,
      
      // Chocolate-specific compounds
      caffeine: 20,
      theobromine: 205
    },
    servingSizes: [
      { name: "1 piece", grams: 10 },
      { name: "1 small bar", grams: 25 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "USDA"
  },
  
  {
    name: "Gummy Candy",
    category: "gummy",
    per100g: {
      calories: 396,
      protein: 0,
      fat: 0,
      carbs: 98.9,
      sugar: 58.97,
      fiber: 0.1,
      water: 1,
      
      // Minimal mineral content
      calcium: 2,
      iron: 0.1,
      magnesium: 1,
      phosphorus: 2,
      potassium: 3,
      sodium: 20,
      zinc: 0.01,
      copper: 0.01,
      manganese: 0.01,
      selenium: 0.3,
      
      // Essentially no vitamins
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB5: 0,
      vitaminB6: 0,
      vitaminB12: 0,
      folate: 0,
      vitaminK: 0,
      choline: 0
    },
    servingSizes: [
      { name: "1 piece", grams: 2 },
      { name: "10 pieces", grams: 20 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "USDA"
  },
  
  {
    name: "Lollipop",
    category: "lollipop",
    per100g: {
      calories: 394,
      protein: 0,
      fat: 0.2,
      carbs: 98,
      sugar: 62.9,
      fiber: 0,
      water: 1.3,
      
      // Similar to hard candy
      calcium: 3,
      iron: 0.3,
      magnesium: 3,
      phosphorus: 3,
      potassium: 5,
      sodium: 38,
      zinc: 0.01,
      copper: 0.03,
      manganese: 0.01,
      selenium: 0.6,
      
      // Vitamins
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminB1: 0.003,
      vitaminB2: 0.003,
      vitaminB3: 0.01,
      vitaminB5: 0.01,
      vitaminB6: 0.003,
      vitaminB12: 0,
      folate: 0,
      vitaminK: 0,
      choline: 0
    },
    servingSizes: [
      { name: "1 small lollipop", grams: 6 },
      { name: "1 large lollipop", grams: 12 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "Combined"
  },

  {
    name: "Caramel Candy",
    category: "caramel",
    per100g: {
      calories: 382,
      protein: 4.6,
      fat: 8.1,
      carbs: 76.2,
      sugar: 65.5,
      fiber: 0.3,
      water: 8.5,
      
      // Minerals from dairy content
      calcium: 118,
      iron: 1.4,
      magnesium: 22,
      phosphorus: 74,
      potassium: 192,
      sodium: 211,
      zinc: 0.64,
      copper: 0.09,
      manganese: 0.22,
      selenium: 2.8,
      
      // Vitamins
      vitaminA: 28,
      vitaminC: 0.4,
      vitaminD: 0.7,
      vitaminE: 0.26,
      vitaminB1: 0.022,
      vitaminB2: 0.162,
      vitaminB3: 0.15,
      vitaminB5: 0.42,
      vitaminB6: 0.024,
      vitaminB12: 0.21,
      folate: 4,
      vitaminK: 1.3,
      choline: 23
    },
    servingSizes: [
      { name: "1 piece", grams: 8 },
      { name: "5 pieces", grams: 40 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "FoodStruct"
  },

  {
    name: "Jelly Beans",
    category: "gummy",
    per100g: {
      calories: 375,
      protein: 0,
      fat: 0.1,
      carbs: 93.8,
      sugar: 78.3,
      fiber: 0,
      water: 6.0,
      
      // Minimal minerals
      calcium: 1,
      iron: 0.2,
      magnesium: 1,
      phosphorus: 1,
      potassium: 2,
      sodium: 16,
      zinc: 0.01,
      copper: 0.01,
      manganese: 0.01,
      selenium: 0.2,
      
      // No significant vitamins
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB5: 0,
      vitaminB6: 0,
      vitaminB12: 0,
      folate: 0,
      vitaminK: 0,
      choline: 0
    },
    servingSizes: [
      { name: "1 bean", grams: 1 },
      { name: "10 beans", grams: 10 },
      { name: "1 small handful", grams: 14 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "FoodStruct"
  },

  {
    name: "Taffy",
    category: "caramel",
    per100g: {
      calories: 395,
      protein: 1.2,
      fat: 2.0,
      carbs: 92.8,
      sugar: 68.2,
      fiber: 0,
      water: 3.8,
      
      // Minimal minerals
      calcium: 14,
      iron: 0.5,
      magnesium: 2,
      phosphorus: 12,
      potassium: 15,
      sodium: 57,
      zinc: 0.05,
      copper: 0.02,
      manganese: 0.02,
      selenium: 0.8,
      
      // Trace vitamins
      vitaminA: 2,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0.05,
      vitaminB1: 0.005,
      vitaminB2: 0.012,
      vitaminB3: 0.02,
      vitaminB5: 0.05,
      vitaminB6: 0.003,
      vitaminB12: 0.02,
      folate: 1,
      vitaminK: 0.2,
      choline: 2
    },
    servingSizes: [
      { name: "1 piece", grams: 5 },
      { name: "1 large piece", grams: 10 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "FoodStruct"
  },

  {
    name: "Mint Candy",
    category: "hard",
    per100g: {
      calories: 390,
      protein: 0,
      fat: 0.9,
      carbs: 96.8,
      sugar: 96.2,
      fiber: 0,
      water: 2.2,
      
      // Similar to hard candy with slight variations
      calcium: 5,
      iron: 0.4,
      magnesium: 4,
      phosphorus: 4,
      potassium: 6,
      sodium: 12,
      zinc: 0.02,
      copper: 0.04,
      manganese: 0.02,
      selenium: 0.8,
      
      // Vitamins
      vitaminA: 0,
      vitaminC: 0.5,
      vitaminD: 0,
      vitaminE: 0,
      vitaminB1: 0.002,
      vitaminB2: 0.002,
      vitaminB3: 0.008,
      vitaminB5: 0.008,
      vitaminB6: 0.002,
      vitaminB12: 0,
      folate: 0,
      vitaminK: 0,
      choline: 0
    },
    servingSizes: [
      { name: "1 mint", grams: 2 },
      { name: "5 mints", grams: 10 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "FoodStruct"
  },

  {
    name: "Fudge",
    category: "chocolate",
    per100g: {
      calories: 411,
      protein: 2.9,
      fat: 10.5,
      carbs: 81.4,
      sugar: 74.2,
      fiber: 1.2,
      water: 4.6,
      
      // Rich in minerals from chocolate and dairy
      calcium: 54,
      iron: 1.8,
      magnesium: 30,
      phosphorus: 66,
      potassium: 162,
      sodium: 95,
      zinc: 0.58,
      copper: 0.24,
      manganese: 0.35,
      selenium: 3.2,
      
      // Vitamins from dairy and chocolate
      vitaminA: 22,
      vitaminC: 0.2,
      vitaminD: 0.4,
      vitaminE: 0.32,
      vitaminB1: 0.018,
      vitaminB2: 0.104,
      vitaminB3: 0.28,
      vitaminB5: 0.31,
      vitaminB6: 0.018,
      vitaminB12: 0.15,
      folate: 6,
      vitaminK: 1.8,
      choline: 18,
      
      // Chocolate compounds
      caffeine: 12,
      theobromine: 95
    },
    servingSizes: [
      { name: "1 small piece", grams: 17 },
      { name: "1 piece", grams: 25 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "Combined"
  },

  {
    name: "Marshmallow",
    category: "general",
    per100g: {
      calories: 318,
      protein: 1.8,
      fat: 0.2,
      carbs: 80.5,
      sugar: 57.6,
      fiber: 0.1,
      water: 17.0,
      
      // Minimal minerals
      calcium: 3,
      iron: 0.2,
      magnesium: 2,
      phosphorus: 6,
      potassium: 5,
      sodium: 80,
      zinc: 0.04,
      copper: 0.02,
      manganese: 0.01,
      selenium: 1.2,
      
      // Minimal vitamins
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminB1: 0.005,
      vitaminB2: 0.036,
      vitaminB3: 0.084,
      vitaminB5: 0.04,
      vitaminB6: 0.002,
      vitaminB12: 0,
      folate: 2,
      vitaminK: 0,
      choline: 1.4
    },
    servingSizes: [
      { name: "1 regular marshmallow", grams: 7 },
      { name: "1 large marshmallow", grams: 15 },
      { name: "10 mini marshmallows", grams: 10 },
      { name: "1 oz", grams: 28.35 }
    ],
    source: "FoodStruct"
  }
];

/**
 * Find candy nutrition data by name or category
 */
export function findCandyNutrition(searchTerm: string): CandyNutrition | null {
  const term = searchTerm.toLowerCase();
  
  // Exact name match first
  let match = CANDY_NUTRITION_DATABASE.find(candy => 
    candy.name.toLowerCase() === term
  );
  
  if (match) return match;
  
  // Partial name match
  match = CANDY_NUTRITION_DATABASE.find(candy => 
    candy.name.toLowerCase().includes(term) || 
    term.includes(candy.name.toLowerCase())
  );
  
  if (match) return match;
  
  // Category-based matching
  if (term.includes('chocolate') || term.includes('cocoa') || term.includes('fudge')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'chocolate') || null;
  }
  
  if (term.includes('gummy') || term.includes('bears') || term.includes('worms') || 
      term.includes('jelly bean') || term.includes('gummies')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'gummy') || null;
  }
  
  if (term.includes('lollipop') || term.includes('sucker') || term.includes('pop')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'lollipop') || null;
  }
  
  if (term.includes('caramel') || term.includes('taffy') || term.includes('toffee')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'caramel') || null;
  }
  
  if (term.includes('hard') || term.includes('mint') || term.includes('drops')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'hard') || null;
  }
  
  if (term.includes('marshmallow') || term.includes('marshmallows')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.name === 'Marshmallow') || null;
  }
  
  return null;
}

/**
 * Calculate nutrition for specific serving size
 */
export function calculateCandyNutrition(
  candy: CandyNutrition, 
  servingGrams: number
): Partial<CandyNutrition['per100g']> {
  const ratio = servingGrams / 100;
  
  return {
    calories: Math.round(candy.per100g.calories * ratio),
    protein: Math.round(candy.per100g.protein * ratio * 10) / 10,
    fat: Math.round(candy.per100g.fat * ratio * 10) / 10,
    carbs: Math.round(candy.per100g.carbs * ratio * 10) / 10,
    sugar: Math.round(candy.per100g.sugar * ratio * 10) / 10,
    fiber: Math.round(candy.per100g.fiber * ratio * 10) / 10,
    
    // Key minerals
    calcium: Math.round(candy.per100g.calcium * ratio * 10) / 10,
    iron: Math.round(candy.per100g.iron * ratio * 100) / 100,
    sodium: Math.round(candy.per100g.sodium * ratio * 10) / 10,
    potassium: Math.round(candy.per100g.potassium * ratio * 10) / 10,
    
    // Chocolate-specific
    caffeine: candy.per100g.caffeine ? Math.round(candy.per100g.caffeine * ratio * 10) / 10 : undefined,
    theobromine: candy.per100g.theobromine ? Math.round(candy.per100g.theobromine * ratio * 10) / 10 : undefined
  };
}

/**
 * Get candy recommendations based on nutritional goals
 */
export function getCandyRecommendations(
  maxCalories?: number,
  preferLowSugar?: boolean,
  avoidChocolate?: boolean
): CandyNutrition[] {
  let filtered = [...CANDY_NUTRITION_DATABASE];
  
  if (avoidChocolate) {
    filtered = filtered.filter(candy => candy.category !== 'chocolate');
  }
  
  if (maxCalories) {
    filtered = filtered.filter(candy => candy.per100g.calories <= maxCalories);
  }
  
  if (preferLowSugar) {
    filtered.sort((a, b) => a.per100g.sugar - b.per100g.sugar);
  }
  
  return filtered;
}