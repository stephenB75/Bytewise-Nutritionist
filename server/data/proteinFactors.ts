/**
 * USDA Protein Conversion Factors Database
 * Food-specific protein conversion factors for accurate protein calculations
 */

interface ProteinConversionFactor {
  foodNutrientConversionFactorId: string;
  value: number;
  foodCategory?: string;
}

// Protein conversion factors from USDA database
export const PROTEIN_CONVERSION_FACTORS: Record<string, number> = {
  // Dairy and milk products (6.38 factor)
  "dairy": 6.38,
  "milk": 6.38,
  "cheese": 6.38,
  "yogurt": 6.38,
  "cream": 6.38,
  
  // General proteins (6.25 factor - most common)
  "meat": 6.25,
  "poultry": 6.25,
  "fish": 6.25,
  "seafood": 6.25,
  "eggs": 6.25,
  "beef": 6.25,
  "pork": 6.25,
  "chicken": 6.25,
  "turkey": 6.25,
  
  // Nuts and seeds (varies)
  "nuts": 5.46,
  "almonds": 5.46,
  "walnuts": 5.46,
  "peanuts": 5.46,
  "seeds": 5.30,
  
  // Legumes and beans
  "legumes": 5.30,
  "beans": 5.30,
  "lentils": 5.30,
  "chickpeas": 5.30,
  "soy": 5.30,
  "tofu": 5.30,
  
  // Grains and cereals
  "wheat": 5.83,
  "rice": 5.95,
  "oats": 5.83,
  "barley": 5.83,
  "corn": 6.25,
  "quinoa": 5.85,
  
  // Default fallback
  "default": 6.25
};

/**
 * Get protein conversion factor for specific food
 */
export function getProteinConversionFactor(foodName: string, foodCategory?: string): number {
  const name = foodName.toLowerCase();
  const category = foodCategory?.toLowerCase() || "";
  
  // Check for specific food matches first
  for (const [key, factor] of Object.entries(PROTEIN_CONVERSION_FACTORS)) {
    if (name.includes(key) || category.includes(key)) {
      return factor;
    }
  }
  
  // Food-specific overrides
  if (name.includes('milk') || name.includes('dairy') || name.includes('cheese')) {
    return 6.38;
  }
  
  if (name.includes('almond') || name.includes('walnut') || name.includes('nut')) {
    return 5.46;
  }
  
  if (name.includes('bean') || name.includes('lentil') || name.includes('soy')) {
    return 5.30;
  }
  
  if (name.includes('wheat') || name.includes('oat') || name.includes('barley')) {
    return 5.83;
  }
  
  if (name.includes('rice')) {
    return 5.95;
  }
  
  if (name.includes('quinoa')) {
    return 5.85;
  }
  
  // Default protein conversion factor
  return PROTEIN_CONVERSION_FACTORS.default;
}

/**
 * Calculate accurate protein content using food-specific conversion factors
 */
export function calculateProteinFromNitrogen(
  nitrogenGrams: number,
  foodName: string,
  foodCategory?: string
): number {
  const conversionFactor = getProteinConversionFactor(foodName, foodCategory);
  return nitrogenGrams * conversionFactor;
}

/**
 * Get protein calculation method for transparency
 */
export function getProteinCalculationMethod(foodName: string): string {
  const factor = getProteinConversionFactor(foodName);
  
  switch (factor) {
    case 6.38:
      return "Dairy-specific conversion factor (6.38)";
    case 5.46:
      return "Nuts/seeds conversion factor (5.46)";
    case 5.30:
      return "Legumes conversion factor (5.30)";
    case 5.83:
      return "Cereal grains conversion factor (5.83)";
    case 5.95:
      return "Rice-specific conversion factor (5.95)";
    case 5.85:
      return "Quinoa-specific conversion factor (5.85)";
    default:
      return "Standard protein conversion factor (6.25)";
  }
}