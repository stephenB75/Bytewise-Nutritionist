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
  if (term.includes('chocolate') || term.includes('cocoa')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'chocolate') || null;
  }
  
  if (term.includes('gummy') || term.includes('bears') || term.includes('worms')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'gummy') || null;
  }
  
  if (term.includes('lollipop') || term.includes('sucker') || term.includes('pop')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'lollipop') || null;
  }
  
  if (term.includes('hard') || term.includes('mint') || term.includes('drops')) {
    return CANDY_NUTRITION_DATABASE.find(c => c.category === 'hard') || null;
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