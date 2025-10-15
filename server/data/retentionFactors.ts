/**
 * USDA Nutrient Retention Factors Database
 * Accounts for nutrient loss during cooking and preparation
 */

interface RetentionFactor {
  code: string;
  description: string;
  foodGroupId: string;
  factors: {
    protein?: number;
    fat?: number;
    carbohydrate?: number;
    vitamins?: number;
    minerals?: number;
  };
}

// Key retention factors from USDA database for common cooking methods
export const RETENTION_FACTORS: Record<string, RetentionFactor> = {
  // Baking/Roasting
  "baked": {
    code: "BAKED",
    description: "Baked or roasted",
    foodGroupId: "general",
    factors: {
      protein: 0.95,
      fat: 0.90,
      carbohydrate: 0.98,
      vitamins: 0.80,
      minerals: 0.85
    }
  },

  // Boiling/Steaming
  "boiled": {
    code: "BOILED",
    description: "Boiled, drained",
    foodGroupId: "general",
    factors: {
      protein: 0.90,
      fat: 0.85,
      carbohydrate: 0.95,
      vitamins: 0.65, // Water-soluble vitamins lost
      minerals: 0.70
    }
  },

  "steamed": {
    code: "STEAMED",
    description: "Steamed",
    foodGroupId: "general",
    factors: {
      protein: 0.95,
      fat: 0.95,
      carbohydrate: 0.98,
      vitamins: 0.85,
      minerals: 0.90
    }
  },

  // Frying
  "fried": {
    code: "FRIED",
    description: "Fried",
    foodGroupId: "general",
    factors: {
      protein: 0.85,
      fat: 1.20, // Fat content increases
      carbohydrate: 0.90,
      vitamins: 0.70,
      minerals: 0.80
    }
  },

  // Grilling/Broiling
  "grilled": {
    code: "GRILLED",
    description: "Grilled or broiled",
    foodGroupId: "general",
    factors: {
      protein: 0.90,
      fat: 0.80, // Fat drips away
      carbohydrate: 0.95,
      vitamins: 0.75,
      minerals: 0.85
    }
  },

  // Meat-specific factors
  "beef_roasted": {
    code: "601",
    description: "Beef, roasted",
    foodGroupId: "13",
    factors: {
      protein: 0.95,
      fat: 0.85,
      carbohydrate: 1.0,
      vitamins: 0.80,
      minerals: 0.90
    }
  },

  "chicken_roasted": {
    code: "805",
    description: "Chicken, roasted",
    foodGroupId: "5",
    factors: {
      protein: 0.95,
      fat: 0.80,
      carbohydrate: 1.0,
      vitamins: 0.85,
      minerals: 0.90
    }
  },

  // Vegetable-specific factors
  "vegetables_boiled": {
    code: "3004",
    description: "Vegetables, greens, boiled, little water, drained",
    foodGroupId: "11",
    factors: {
      protein: 0.85,
      fat: 0.90,
      carbohydrate: 0.95,
      vitamins: 0.60, // Significant vitamin loss
      minerals: 0.65
    }
  },

  "vegetables_steamed": {
    code: "3464",
    description: "Vegetables, roots, steamed",
    foodGroupId: "11",
    factors: {
      protein: 0.90,
      fat: 0.95,
      carbohydrate: 0.98,
      vitamins: 0.85,
      minerals: 0.90
    }
  }
};

/**
 * Get retention factors based on cooking method and food type
 */
export function getRetentionFactors(
  cookingMethod: string,
  foodType: string = "general"
): RetentionFactor["factors"] {
  const method = cookingMethod.toLowerCase().trim();
  
  // Check for specific food + cooking method combinations
  const specificKey = `${foodType}_${method}`;
  if (RETENTION_FACTORS[specificKey]) {
    return RETENTION_FACTORS[specificKey].factors;
  }
  
  // Check for general cooking method
  if (RETENTION_FACTORS[method]) {
    return RETENTION_FACTORS[method].factors;
  }
  
  // Determine cooking method from description
  if (method.includes('bak') || method.includes('roast')) {
    return RETENTION_FACTORS.baked.factors;
  } else if (method.includes('boil') || method.includes('simmer')) {
    return RETENTION_FACTORS.boiled.factors;
  } else if (method.includes('steam')) {
    return RETENTION_FACTORS.steamed.factors;
  } else if (method.includes('fry') || method.includes('fried')) {
    return RETENTION_FACTORS.fried.factors;
  } else if (method.includes('grill') || method.includes('broil')) {
    return RETENTION_FACTORS.grilled.factors;
  }
  
  // Default - assume minimal processing
  return {
    protein: 0.98,
    fat: 0.98,
    carbohydrate: 0.99,
    vitamins: 0.95,
    minerals: 0.95
  };
}

/**
 * Apply retention factors to nutrient values
 */
export function applyRetentionFactors(
  nutrients: {
    protein: number;
    fat: number;
    carbs: number;
    [key: string]: number;
  },
  cookingMethod: string,
  foodType: string = "general"
): typeof nutrients {
  const factors = getRetentionFactors(cookingMethod, foodType);
  
  return {
    ...nutrients,
    protein: nutrients.protein * (factors.protein || 1),
    fat: nutrients.fat * (factors.fat || 1),
    carbs: nutrients.carbs * (factors.carbohydrate || 1)
  };
}

/**
 * Detect cooking method from food description
 */
export function detectCookingMethod(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('raw') || desc.includes('fresh')) return 'raw';
  if (desc.includes('baked') || desc.includes('roasted')) return 'baked';
  if (desc.includes('boiled') || desc.includes('cooked')) return 'boiled';
  if (desc.includes('steamed')) return 'steamed';
  if (desc.includes('fried')) return 'fried';
  if (desc.includes('grilled') || desc.includes('broiled')) return 'grilled';
  if (desc.includes('sauteed') || desc.includes('sautéed')) return 'fried';
  
  return 'raw'; // Default to raw if no cooking method detected
}