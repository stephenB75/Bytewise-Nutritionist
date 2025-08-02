/**
 * USDA Food Categories and Survey Data Integration
 * Maps FNDDS food codes to categories for enhanced food classification
 */

interface FoodCategory {
  code: string;
  name: string;
  group: string;
  wweiaCategoryCode?: string;
}

// Major food categories from USDA FNDDS survey data
export const FOOD_CATEGORIES: Record<string, FoodCategory> = {
  // Milk and Dairy
  "1002": { code: "1002", name: "Milk, whole", group: "dairy", wweiaCategoryCode: "1002" },
  "1004": { code: "1004", name: "Milk, reduced fat", group: "dairy", wweiaCategoryCode: "1004" },
  "1006": { code: "1006", name: "Milk, lowfat", group: "dairy", wweiaCategoryCode: "1006" },
  "1008": { code: "1008", name: "Milk, nonfat", group: "dairy", wweiaCategoryCode: "1008" },
  
  // Cheese
  "1202": { code: "1202", name: "Cheese", group: "dairy", wweiaCategoryCode: "1202" },
  "1204": { code: "1204", name: "Cheese, reduced fat", group: "dairy", wweiaCategoryCode: "1204" },
  "1206": { code: "1206", name: "Cheese, low fat", group: "dairy", wweiaCategoryCode: "1206" },
  "1208": { code: "1208", name: "Cheese, nonfat", group: "dairy", wweiaCategoryCode: "1208" },
  
  // Yogurt
  "1402": { code: "1402", name: "Yogurt", group: "dairy", wweiaCategoryCode: "1402" },
  
  // Meat and Poultry
  "1820": { code: "1820", name: "Chicken, whole pieces", group: "protein", wweiaCategoryCode: "1820" },
  "1822": { code: "1822", name: "Chicken, patties, nuggets", group: "protein", wweiaCategoryCode: "1822" },
  
  // Seafood
  "1902": { code: "1902", name: "Fish", group: "protein", wweiaCategoryCode: "1902" },
  
  // Nuts and Seeds
  "5802": { code: "5802", name: "Nuts and seeds", group: "protein", wweiaCategoryCode: "5802" },
  
  // Legumes
  "7220": { code: "7220", name: "Legumes", group: "protein", wweiaCategoryCode: "7220" },
  
  // Grains
  "8006": { code: "8006", name: "Grains, whole", group: "grains", wweiaCategoryCode: "8006" },
  "8008": { code: "8008", name: "Grains, refined", group: "grains", wweiaCategoryCode: "8008" },
  "8412": { code: "8412", name: "Breakfast cereals", group: "grains", wweiaCategoryCode: "8412" },
  
  // Beverages
  "9007": { code: "9007", name: "100% fruit juice", group: "beverages", wweiaCategoryCode: "9007" },
  "9010": { code: "9010", name: "Fruit juice drinks", group: "beverages", wweiaCategoryCode: "9010" },
  
  // Alcoholic beverages
  "9402": { code: "9402", name: "Beer", group: "alcohol", wweiaCategoryCode: "9402" },
  "9404": { code: "9404", name: "Wine", group: "alcohol", wweiaCategoryCode: "9404" },
  
  // Other
  "9602": { code: "9602", name: "Water", group: "beverages", wweiaCategoryCode: "9602" },
  "9999": { code: "9999", name: "Other", group: "other", wweiaCategoryCode: "9999" },
};

/**
 * Get food category information by WWEIA category code
 */
export function getFoodCategory(wweiaCategoryCode: string): FoodCategory | null {
  return FOOD_CATEGORIES[wweiaCategoryCode] || null;
}

/**
 * Determine food group from food description
 */
export function classifyFood(description: string): string {
  const desc = description.toLowerCase();
  
  // Dairy products
  if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt') || 
      desc.includes('cream') || desc.includes('butter')) {
    return 'dairy';
  }
  
  // Meat and protein
  if (desc.includes('chicken') || desc.includes('beef') || desc.includes('pork') ||
      desc.includes('fish') || desc.includes('salmon') || desc.includes('tuna') ||
      desc.includes('egg') || desc.includes('turkey')) {
    return 'protein';
  }
  
  // Fruits
  if (desc.includes('apple') || desc.includes('banana') || desc.includes('orange') ||
      desc.includes('berry') || desc.includes('grape') || desc.includes('fruit')) {
    return 'fruit';
  }
  
  // Vegetables
  if (desc.includes('broccoli') || desc.includes('carrot') || desc.includes('spinach') ||
      desc.includes('tomato') || desc.includes('lettuce') || desc.includes('vegetable')) {
    return 'vegetable';
  }
  
  // Grains
  if (desc.includes('bread') || desc.includes('rice') || desc.includes('pasta') ||
      desc.includes('cereal') || desc.includes('wheat') || desc.includes('oat')) {
    return 'grains';
  }
  
  // Nuts and seeds
  if (desc.includes('nut') || desc.includes('almond') || desc.includes('walnut') ||
      desc.includes('seed') || desc.includes('peanut')) {
    return 'nuts';
  }
  
  // Legumes
  if (desc.includes('bean') || desc.includes('lentil') || desc.includes('chickpea') ||
      desc.includes('pea') || desc.includes('legume')) {
    return 'legumes';
  }
  
  return 'other';
}

/**
 * Get enhanced nutritional priorities based on food group
 */
export function getNutritionalPriorities(foodGroup: string): string[] {
  const priorities: Record<string, string[]> = {
    'dairy': ['protein', 'calcium', 'vitamin_d', 'fat'],
    'protein': ['protein', 'iron', 'zinc', 'vitamin_b12'],
    'fruit': ['vitamin_c', 'fiber', 'potassium', 'carbs'],
    'vegetable': ['vitamin_a', 'vitamin_c', 'fiber', 'folate'],
    'grains': ['carbs', 'fiber', 'iron', 'b_vitamins'],
    'nuts': ['fat', 'protein', 'vitamin_e', 'magnesium'],
    'legumes': ['protein', 'fiber', 'iron', 'folate']
  };
  
  return priorities[foodGroup] || ['calories', 'protein', 'carbs', 'fat'];
}