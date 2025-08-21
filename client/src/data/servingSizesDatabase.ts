/**
 * FDA RACC-Compliant Serving Sizes Database
 * 
 * Based on FDA Reference Amounts Customarily Consumed (21 CFR 101.12)
 * and USDA Dietary Guidelines. Updated with 2016 FDA regulations.
 * 
 * All weights in grams, volumes in ml unless specified.
 */

export interface ServingSize {
  category: string;
  fdaRACCgrams: number;
  commonDescription: string;
  alternativeUnits?: string[];
  visualReference?: string;
  warningThreshold?: number; // Above this, show portion warning
}

export const FDA_RACC_DATABASE: Record<string, ServingSize> = {
  // SNACK FOODS & CHIPS
  'potato chips': {
    category: 'snacks',
    fdaRACCgrams: 28,
    commonDescription: '1 oz (about 15 chips)',
    alternativeUnits: ['1 oz', 'handful', 'small bag'],
    visualReference: 'handful',
    warningThreshold: 85
  },
  'tortilla chips': {
    category: 'snacks',
    fdaRACCgrams: 28,
    commonDescription: '1 oz (about 10-12 chips)',
    alternativeUnits: ['1 oz', '10-12 chips'],
    visualReference: 'handful',
    warningThreshold: 85
  },
  'corn chips': {
    category: 'snacks',
    fdaRACCgrams: 28,
    commonDescription: '1 oz',
    alternativeUnits: ['1 oz', 'handful'],
    visualReference: 'handful',
    warningThreshold: 85
  },
  'pretzels': {
    category: 'snacks',
    fdaRACCgrams: 30,
    commonDescription: '1 oz (about 20 mini pretzels)',
    alternativeUnits: ['1 oz', '20 mini pretzels', '2-3 large pretzels'],
    visualReference: 'handful',
    warningThreshold: 90
  },
  'popcorn': {
    category: 'snacks',
    fdaRACCgrams: 28,
    commonDescription: '3 cups popped',
    alternativeUnits: ['3 cups popped', '1 oz'],
    visualReference: 'large handful',
    warningThreshold: 85
  },

  // CRACKERS & COOKIES
  'crackers': {
    category: 'grain',
    fdaRACCgrams: 30,
    commonDescription: '1 oz (about 6-8 crackers)',
    alternativeUnits: ['1 oz', '6-8 crackers'],
    visualReference: 'palm-sized portion',
    warningThreshold: 90
  },
  'cookies': {
    category: 'dessert',
    fdaRACCgrams: 30,
    commonDescription: '1 oz (2-3 medium cookies)',
    alternativeUnits: ['1 oz', '2-3 cookies'],
    visualReference: '2-3 cookies',
    warningThreshold: 90
  },
  'graham crackers': {
    category: 'grain',
    fdaRACCgrams: 30,
    commonDescription: '1 oz (2 full sheets)',
    alternativeUnits: ['1 oz', '2 full sheets'],
    visualReference: '2 full crackers',
    warningThreshold: 90
  },

  // NUTS & SEEDS
  'nuts': {
    category: 'protein',
    fdaRACCgrams: 28,
    commonDescription: '1 oz (about 24 almonds)',
    alternativeUnits: ['1 oz', '24 almonds', '18 cashews', '28 peanuts'],
    visualReference: 'handful',
    warningThreshold: 85
  },
  'almonds': {
    category: 'protein',
    fdaRACCgrams: 28,
    commonDescription: '1 oz (24 almonds)',
    alternativeUnits: ['1 oz', '24 almonds'],
    visualReference: 'handful',
    warningThreshold: 85
  },
  'peanuts': {
    category: 'protein',
    fdaRACCgrams: 28,
    commonDescription: '1 oz (28 peanuts)',
    alternativeUnits: ['1 oz', '28 peanuts'],
    visualReference: 'handful',
    warningThreshold: 85
  },
  'nut butter': {
    category: 'protein',
    fdaRACCgrams: 32,
    commonDescription: '2 tbsp',
    alternativeUnits: ['2 tbsp', '32g'],
    visualReference: 'ping pong ball',
    warningThreshold: 95
  },

  // CANDY & CONFECTIONS
  'hard candy': {
    category: 'candy',
    fdaRACCgrams: 15,
    commonDescription: '0.5 oz (3-4 pieces)',
    alternativeUnits: ['0.5 oz', '3-4 pieces'],
    visualReference: '3-4 pieces',
    warningThreshold: 45
  },
  'soft candy': {
    category: 'candy',
    fdaRACCgrams: 40,
    commonDescription: '1.4 oz',
    alternativeUnits: ['1.4 oz', 'fun-size bar'],
    visualReference: 'fun-size bar',
    warningThreshold: 120
  },
  'chocolate': {
    category: 'candy',
    fdaRACCgrams: 40,
    commonDescription: '1.4 oz (3-4 squares)',
    alternativeUnits: ['1.4 oz', '3-4 squares'],
    visualReference: '3-4 squares',
    warningThreshold: 120
  },
  'gummy candy': {
    category: 'candy',
    fdaRACCgrams: 40,
    commonDescription: '1.4 oz',
    alternativeUnits: ['1.4 oz', '12-15 pieces'],
    visualReference: 'handful',
    warningThreshold: 120
  },

  // ICE CREAM & FROZEN DESSERTS
  'ice cream': {
    category: 'dairy',
    fdaRACCgrams: 66,
    commonDescription: '2/3 cup',
    alternativeUnits: ['2/3 cup', '1 scoop'],
    visualReference: 'tennis ball',
    warningThreshold: 200
  },
  'ice cream bar': {
    category: 'dairy',
    fdaRACCgrams: 60,
    commonDescription: '1 bar',
    alternativeUnits: ['1 bar', '1 piece'],
    visualReference: '1 bar',
    warningThreshold: 180
  },
  'popsicle': {
    category: 'dairy',
    fdaRACCgrams: 50,
    commonDescription: '1 popsicle',
    alternativeUnits: ['1 popsicle', '1 piece'],
    visualReference: '1 popsicle',
    warningThreshold: 150
  },

  // MEAT & JERKY
  'beef jerky': {
    category: 'protein',
    fdaRACCgrams: 30,
    commonDescription: '1 oz',
    alternativeUnits: ['1 oz', '1 piece'],
    visualReference: '1 piece',
    warningThreshold: 90
  },
  'meat': {
    category: 'protein',
    fdaRACCgrams: 85,
    commonDescription: '3 oz cooked',
    alternativeUnits: ['3 oz', 'deck of cards'],
    visualReference: 'deck of cards',
    warningThreshold: 255
  },
  'chicken breast': {
    category: 'protein',
    fdaRACCgrams: 85,
    commonDescription: '3 oz cooked',
    alternativeUnits: ['3 oz', 'palm of hand'],
    visualReference: 'palm of hand',
    warningThreshold: 255
  },

  // GRAINS & STARCHES
  'bread': {
    category: 'grain',
    fdaRACCgrams: 28,
    commonDescription: '1 slice',
    alternativeUnits: ['1 slice', '1 oz'],
    visualReference: '1 slice',
    warningThreshold: 85
  },
  'bagel': {
    category: 'grain',
    fdaRACCgrams: 55,
    commonDescription: '1/2 medium bagel',
    alternativeUnits: ['1/2 bagel', '2 oz'],
    visualReference: '1/2 bagel',
    warningThreshold: 165
  },
  'rice': {
    category: 'grain',
    fdaRACCgrams: 125,
    commonDescription: '1/2 cup cooked',
    alternativeUnits: ['1/2 cup cooked', '4.4 oz'],
    visualReference: 'tennis ball',
    warningThreshold: 375
  },
  'pasta': {
    category: 'grain',
    fdaRACCgrams: 125,
    commonDescription: '1/2 cup cooked',
    alternativeUnits: ['1/2 cup cooked', '4.4 oz'],
    visualReference: 'tennis ball',
    warningThreshold: 375
  },
  'cereal': {
    category: 'grain',
    fdaRACCgrams: 30,
    commonDescription: '1 cup (varies by type)',
    alternativeUnits: ['1 cup', '1 oz'],
    visualReference: '1 cup',
    warningThreshold: 90
  },

  // DAIRY PRODUCTS
  'milk': {
    category: 'dairy',
    fdaRACCgrams: 240,
    commonDescription: '1 cup',
    alternativeUnits: ['1 cup', '8 fl oz'],
    visualReference: '1 cup',
    warningThreshold: 480
  },
  'yogurt': {
    category: 'dairy',
    fdaRACCgrams: 170,
    commonDescription: '6 oz container',
    alternativeUnits: ['6 oz', '3/4 cup'],
    visualReference: '1 container',
    warningThreshold: 340
  },
  'cheese': {
    category: 'dairy',
    fdaRACCgrams: 42,
    commonDescription: '1.5 oz (size of 4 dice)',
    alternativeUnits: ['1.5 oz', '4 dice'],
    visualReference: '4 dice',
    warningThreshold: 125
  },

  // FRUITS
  'apple': {
    category: 'fruit',
    fdaRACCgrams: 154,
    commonDescription: '1 medium apple',
    alternativeUnits: ['1 medium', 'baseball size'],
    visualReference: 'baseball',
    warningThreshold: 460
  },
  'banana': {
    category: 'fruit',
    fdaRACCgrams: 126,
    commonDescription: '1 medium banana',
    alternativeUnits: ['1 medium'],
    visualReference: '1 medium',
    warningThreshold: 380
  },
  'orange': {
    category: 'fruit',
    fdaRACCgrams: 154,
    commonDescription: '1 medium orange',
    alternativeUnits: ['1 medium'],
    visualReference: 'baseball',
    warningThreshold: 460
  },

  // VEGETABLES
  'carrots': {
    category: 'vegetable',
    fdaRACCgrams: 85,
    commonDescription: '1/2 cup cooked or 1 large raw',
    alternativeUnits: ['1/2 cup cooked', '1 large raw'],
    visualReference: 'large carrot',
    warningThreshold: 255
  },
  'broccoli': {
    category: 'vegetable',
    fdaRACCgrams: 85,
    commonDescription: '1/2 cup cooked',
    alternativeUnits: ['1/2 cup cooked', '3 oz'],
    visualReference: 'tennis ball',
    warningThreshold: 255
  },
  'lettuce': {
    category: 'vegetable',
    fdaRACCgrams: 85,
    commonDescription: '3 cups raw',
    alternativeUnits: ['3 cups raw', '3 oz'],
    visualReference: '3 cups',
    warningThreshold: 255
  }
};

/**
 * Get FDA RACC serving size information for a food item
 */
export function getFDAServingSize(foodName: string): ServingSize | null {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Direct match
  if (FDA_RACC_DATABASE[normalizedName]) {
    return FDA_RACC_DATABASE[normalizedName];
  }
  
  // Fuzzy matching for common variations
  for (const [key, value] of Object.entries(FDA_RACC_DATABASE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Category-based fallbacks with priority order
  if (normalizedName.includes('ice cream bar') || normalizedName.includes('ice cream sandwich')) return FDA_RACC_DATABASE['ice cream bar'];
  if (normalizedName.includes('popsicle') || normalizedName.includes('ice pop')) return FDA_RACC_DATABASE['popsicle'];
  if (normalizedName.includes('ice cream')) return FDA_RACC_DATABASE['ice cream'];
  if (normalizedName.includes('chip')) return FDA_RACC_DATABASE['potato chips'];
  if (normalizedName.includes('nut') && !normalizedName.includes('butter')) return FDA_RACC_DATABASE['nuts'];
  if (normalizedName.includes('candy')) return FDA_RACC_DATABASE['soft candy'];
  if (normalizedName.includes('cookie')) return FDA_RACC_DATABASE['cookies'];
  if (normalizedName.includes('cracker')) return FDA_RACC_DATABASE['crackers'];
  if (normalizedName.includes('jerky')) return FDA_RACC_DATABASE['beef jerky'];
  
  return null;
}

/**
 * Validate if a portion size is reasonable based on FDA RACC
 */
export function validatePortionSize(foodName: string, gramsAmount: number): {
  isReasonable: boolean;
  warning?: string;
  recommendation?: string;
  fdaServing?: string;
} {
  const serving = getFDAServingSize(foodName);
  
  if (!serving) {
    return { isReasonable: true }; // No data available
  }
  
  const ratio = gramsAmount / serving.fdaRACCgrams;
  
  if (gramsAmount > (serving.warningThreshold || serving.fdaRACCgrams * 3)) {
    return {
      isReasonable: false,
      warning: `Your portion (${gramsAmount}g) vs FDA standard (${serving.fdaRACCgrams}g) - ${Math.round(ratio)}x larger`,
      recommendation: `Try: ${serving.commonDescription} • Or: ${serving.alternativeUnits?.join(' • ') || 'standard serving'}`,
      fdaServing: serving.commonDescription
    };
  }
  
  if (ratio > 2) {
    return {
      isReasonable: false,
      warning: `Your portion (${gramsAmount}g) vs FDA standard (${serving.fdaRACCgrams}g) - ${Math.round(ratio)}x larger`,
      recommendation: `Try: ${serving.commonDescription} • Or: ${serving.alternativeUnits?.join(' • ') || 'standard serving'}`,
      fdaServing: serving.commonDescription
    };
  }
  
  // Check for very small portions that might indicate wrong unit
  if (ratio < 0.3) {
    return {
      isReasonable: false,
      warning: `Your portion (${gramsAmount}g) vs FDA standard (${serving.fdaRACCgrams}g) - seems too small`,
      recommendation: `Try: ${serving.commonDescription} • Or: ${serving.alternativeUnits?.join(' • ') || 'standard serving'}`,
      fdaServing: serving.commonDescription
    };
  }
  
  return { 
    isReasonable: true,
    fdaServing: serving.commonDescription
  };
}

/**
 * Get visual reference for portion size
 */
export function getVisualReference(foodName: string): string | null {
  const serving = getFDAServingSize(foodName);
  return serving?.visualReference || null;
}

/**
 * Convert common measurements to grams for validation
 */
export function convertToGrams(measurement: string, foodName?: string): number {
  const cleanMeasurement = measurement.toLowerCase().trim();
  
  
  // Look for grams first
  const gramMatch = cleanMeasurement.match(/(\d+(?:\.\d+)?)\s*g(?!\w)/);
  if (gramMatch) {
    const result = parseFloat(gramMatch[1]);
    return result;
  }
  
  // Look for ounces
  const ozMatch = cleanMeasurement.match(/(\d+(?:\.\d+)?)\s*oz/);
  if (ozMatch) {
    const result = parseFloat(ozMatch[1]) * 28.35;
    return result;
  }
  
  // Look for cups (food-specific conversions)
  const cupMatch = cleanMeasurement.match(/(\d+(?:\/\d+)?|\d*\.\d+)\s*cups?/);
  if (cupMatch) {
    const cups = parseFloat(cupMatch[1]);
    let result;
    if (foodName?.includes('ice cream')) result = cups * 99; // 2/3 cup = 66g for ice cream
    else if (foodName?.includes('milk')) result = cups * 240;
    else if (foodName?.includes('rice') || foodName?.includes('pasta')) result = cups * 125;
    else result = cups * 120; // Generic average
    return result;
  }
  
  // Look for tablespoons
  const tbspMatch = cleanMeasurement.match(/(\d+(?:\.\d+)?)\s*(?:tbsp|tablespoons?)/);
  if (tbspMatch) {
    const result = parseFloat(tbspMatch[1]) * 15;
    return result;
  }
  
  // Look for teaspoons
  const tspMatch = cleanMeasurement.match(/(\d+(?:\.\d+)?)\s*(?:tsp|teaspoons?)/);
  if (tspMatch) {
    const result = parseFloat(tspMatch[1]) * 5;
    return result;
  }
  
  // Handle common abbreviations BEFORE pieces match - "t" usually means tablespoon
  if (cleanMeasurement.match(/^\d+\s*t$/)) {
    const result = parseInt(cleanMeasurement) * 15; // 1 tablespoon = 15g
    return result;
  }
  
  // Look for pieces/units (food-specific) - AFTER "t" check
  const pieceMatch = cleanMeasurement.match(/(\d+)\s*(?:pieces?|bars?|pops?|whole|medium|large|small)/);
  if (pieceMatch) {
    const pieces = parseInt(pieceMatch[1]);
    const serving = getFDAServingSize(foodName || '');
    if (serving) {
      const result = pieces * serving.fdaRACCgrams;
      return result;
    }
  }
  
  return 0; // Could not convert
}