/**
 * Professional Cooking Conversion Utilities
 * Based on industry-standard measurement charts from Kitchen to Table and Shamrock Foods
 */

// Standard liquid conversions (in milliliters) - Based on professional conversion charts
export const LIQUID_CONVERSIONS = {
  // Teaspoon and tablespoon
  tsp: 5,
  tbsp: 15,
  
  // Cup measurements (professional standards)
  cup: 240,           // 1 cup = 240ml (16 tbsp = 48 tsp)
  "3/4_cup": 180,     // 3/4 cup = 180ml (12 tbsp = 36 tsp)
  "2/3_cup": 160,     // 2/3 cup = 160ml (11 tbsp = 32 tsp)
  "1/2_cup": 120,     // 1/2 cup = 120ml (8 tbsp = 24 tsp)
  "1/3_cup": 80,      // 1/3 cup = 80ml (5 tbsp = 16 tsp)
  "1/4_cup": 60,      // 1/4 cup = 60ml (4 tbsp = 12 tsp)
  "1/8_cup": 30,      // 1/8 cup = 30ml (2 tbsp = 6 tsp)
  "1/16_cup": 15,     // 1/16 cup = 15ml (1 tbsp = 3 tsp)
  
  // Fluid ounces (precise conversions)
  fl_oz: 30,          // 1 fl oz = 30ml (2 tbsp = 6 tsp)
  "1/2_fl_oz": 15,    // 1/2 fl oz = 15ml (1 tbsp = 3 tsp)
  
  // Larger measurements
  pt: 473,    // pint = 2 cups
  qt: 946,    // quart = 4 cups
  gal: 3785,  // gallon = 16 cups
  
  // Metric
  ml: 1,
  l: 1000
};

// Professional dry ingredient densities (grams per cup) - Based on King Arthur and industry standards
export const DRY_INGREDIENT_DENSITIES = {
  // Flours (scoop-and-sweep method)
  "all_purpose_flour": 120,        // Standard AP flour
  "bread_flour": 120,              // High-protein flour
  "cake_flour": 120,               // Low-protein flour
  "whole_wheat_flour": 113,        // Graham flour
  "pastry_flour": 106,             // Medium-protein flour
  "almond_flour": 100,             // Blanched almond flour
  "00_pizza_flour": 116,           // Italian-style flour
  "coconut_flour": 128,            // High-absorption flour
  
  // Sugars (precise measurements)
  "granulated_sugar": 198,         // White sugar
  "brown_sugar_packed": 213,       // Light/dark brown (packed)
  "brown_sugar_loose": 145,        // Unpacked brown sugar
  "powdered_sugar": 160,           // Confectioners' sugar (unsifted)
  "confectioners_sugar": 160,      // Same as powdered
  
  // Grains and cereals
  "white_rice_dry": 185,
  "white_rice_cooked": 158,
  "brown_rice_dry": 178,
  "quinoa_dry": 170,
  "quinoa_cooked": 185,
  "oats_rolled": 81,
  "oats_steel_cut": 174,
  
  // Nuts (whole)
  "almonds_whole": 143,
  "almonds_sliced": 92,
  "walnuts_halves": 117,
  "pecans_halves": 99,
  "cashews": 137,
  
  // Dried fruits
  "raisins": 165,
  "dried_cranberries": 120,
  "dates_chopped": 147,
  
  // Baking ingredients
  "cocoa_powder": 85,
  "baking_powder": 192,
  "baking_soda": 220,
  "salt": 292,
  "vanilla_extract": 208
};

// Butter to oil conversion ratios for baking
export const BUTTER_TO_OIL_CONVERSION = {
  "1_tsp": 0.75,      // 1 tsp butter = 3/4 tsp oil
  "1_tbsp": 2.25,     // 1 tbsp butter = 2 1/4 tsp oil
  "2_tbsp": 1.5,      // 2 tbsp butter = 1 1/2 tbsp oil
  "1/4_cup": 3,       // 1/4 cup butter = 3 tbsp oil
  "1/3_cup": 4,       // 1/3 cup butter = 1/4 cup oil
  "1/2_cup": 6,       // 1/2 cup butter = 1/4 cup + 2 tbsp oil
  "2/3_cup": 8,       // 2/3 cup butter = 1/2 cup oil
  "3/4_cup": 9,       // 3/4 cup butter = 1/2 cup + 1 tbsp oil
  "1_cup": 12         // 1 cup butter = 3/4 cup oil
};

// Oven temperature conversions
export const OVEN_TEMPERATURES = {
  "very_cool": { fahrenheit: 225, celsius: 110, gas_mark: 0.25 },
  "cool": { fahrenheit: 275, celsius: 140, gas_mark: 1 },
  "very_moderate": { fahrenheit: 325, celsius: 170, gas_mark: 3 },
  "moderate": { fahrenheit: 350, celsius: 180, gas_mark: 4 },
  "moderately_hot": { fahrenheit: 375, celsius: 190, gas_mark: 5 },
  "fairly_hot": { fahrenheit: 400, celsius: 200, gas_mark: 6 },
  "hot": { fahrenheit: 425, celsius: 220, gas_mark: 7 },
  "very_hot": { fahrenheit: 475, celsius: 240, gas_mark: 9 }
};

// Common can sizes and their weights
export const CAN_SIZES = {
  "3_oz": 85,
  "5.5_oz": 156,
  "8_oz": 227,
  "10_oz": 284,
  "12_oz": 340,
  "14_oz": 398,
  "14.5_oz": 411,
  "15_oz": 425,
  "28_oz": 794,
  "#10_can": 3000
};

// Standard drain weights for canned goods (from professional charts)
export const CANNED_FOOD_DRAIN_WEIGHTS = {
  // Fruits (drain weight in oz per #10 can)
  "apples_sliced": 96,
  "apricots_halves": 62,
  "peaches_halves": 68,
  "pears_halves": 66,
  "fruit_cocktail": 71,
  "cherries_pitted": 70,
  
  // Vegetables
  "green_beans_cut": 60,
  "corn_whole_kernel": 72,
  "carrots_diced": 72,
  "carrots_sliced": 68,
  "beets_sliced": 68,
  "asparagus": 60,
  "mushrooms_pieces": 61,
  
  // Legumes
  "kidney_beans": 68,
  "black_beans": 68,
  "garbanzo_beans": 68,
  "lima_beans": 72
};

/**
 * Convert between different measurement units
 */
export class ConversionCalculator {
  
  /**
   * Convert liquid measurements
   */
  static convertLiquid(amount: number, fromUnit: string, toUnit: string): number | null {
    const fromMl = LIQUID_CONVERSIONS[fromUnit as keyof typeof LIQUID_CONVERSIONS];
    const toMl = LIQUID_CONVERSIONS[toUnit as keyof typeof LIQUID_CONVERSIONS];
    
    if (!fromMl || !toMl) return null;
    
    const totalMl = amount * fromMl;
    return totalMl / toMl;
  }
  
  /**
   * Convert dry ingredients using density
   */
  static convertDryIngredient(
    amount: number, 
    fromUnit: string, 
    toUnit: string, 
    ingredient: string
  ): number | null {
    const density = DRY_INGREDIENT_DENSITIES[ingredient as keyof typeof DRY_INGREDIENT_DENSITIES];
    
    if (!density) return null;
    
    // Convert everything to grams first
    let grams: number;
    
    if (fromUnit === 'g') {
      grams = amount;
    } else if (fromUnit === 'cup') {
      grams = amount * density;
    } else if (fromUnit === 'oz') {
      grams = amount * 28.35;
    } else if (fromUnit === 'lb') {
      grams = amount * 453.59;
    } else {
      // Handle fractional cups
      const cupAmount = this.convertFractionalCup(amount, fromUnit);
      if (cupAmount === null) return null;
      grams = cupAmount * density;
    }
    
    // Convert from grams to target unit
    if (toUnit === 'g') {
      return grams;
    } else if (toUnit === 'cup') {
      return grams / density;
    } else if (toUnit === 'oz') {
      return grams / 28.35;
    } else if (toUnit === 'lb') {
      return grams / 453.59;
    } else {
      // Handle fractional cups
      const cupAmount = grams / density;
      return this.convertFromCup(cupAmount, toUnit);
    }
  }
  
  /**
   * Convert fractional cup measurements to decimal cups
   */
  private static convertFractionalCup(amount: number, unit: string): number | null {
    const fractionToCup: Record<string, number> = {
      "3/4_cup": 0.75,
      "2/3_cup": 0.667,
      "1/2_cup": 0.5,
      "1/3_cup": 0.333,
      "1/4_cup": 0.25,
      "1/8_cup": 0.125
    };
    
    const fraction = fractionToCup[unit];
    return fraction ? amount * fraction : null;
  }
  
  /**
   * Convert from decimal cups to fractional measurements
   */
  private static convertFromCup(cupAmount: number, targetUnit: string): number | null {
    const cupToFraction: Record<string, number> = {
      "3/4_cup": 1 / 0.75,
      "2/3_cup": 1 / 0.667,
      "1/2_cup": 1 / 0.5,
      "1/3_cup": 1 / 0.333,
      "1/4_cup": 1 / 0.25,
      "1/8_cup": 1 / 0.125
    };
    
    const multiplier = cupToFraction[targetUnit];
    return multiplier ? cupAmount * multiplier : null;
  }
  
  /**
   * Convert butter to oil for baking
   */
  static convertButterToOil(butterAmount: number, butterUnit: string): { amount: number; unit: string } | null {
    const key = `${butterAmount}_${butterUnit}` as keyof typeof BUTTER_TO_OIL_CONVERSION;
    const oilTbsp = BUTTER_TO_OIL_CONVERSION[key];
    
    if (!oilTbsp) return null;
    
    // Convert tablespoons to appropriate unit
    if (oilTbsp >= 16) {
      return { amount: oilTbsp / 16, unit: 'cup' };
    } else if (oilTbsp >= 3) {
      return { amount: Math.round(oilTbsp), unit: 'tbsp' };
    } else {
      return { amount: oilTbsp * 3, unit: 'tsp' };
    }
  }
  
  /**
   * Get drain weight for canned goods
   */
  static getCannedFoodDrainWeight(food: string, canSize: string = "#10_can"): number | null {
    const drainWeight = CANNED_FOOD_DRAIN_WEIGHTS[food as keyof typeof CANNED_FOOD_DRAIN_WEIGHTS];
    
    if (!drainWeight) return null;
    
    // Scale based on can size (drain weights are for #10 cans)
    const canWeight = CAN_SIZES[canSize as keyof typeof CAN_SIZES];
    const scaleFactor = canWeight ? canWeight / 3000 : 1; // #10 can is ~3000g
    
    return drainWeight * scaleFactor;
  }
  
  /**
   * Convert temperature between Fahrenheit and Celsius
   */
  static convertTemperature(temp: number, fromUnit: 'F' | 'C', toUnit: 'F' | 'C'): number {
    if (fromUnit === toUnit) return temp;
    
    if (fromUnit === 'F' && toUnit === 'C') {
      return (temp - 32) * 5 / 9;
    } else {
      return (temp * 9 / 5) + 32;
    }
  }
}

export default ConversionCalculator;