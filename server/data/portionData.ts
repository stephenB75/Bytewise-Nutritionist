/**
 * USDA Food Portion Weight Database
 * Provides accurate portion-to-gram conversions for calorie calculations
 */

interface PortionData {
  fdc_id: string;
  portion_description: string;
  gram_weight: number;
  amount: number;
}

// Sample of most common portion weights from USDA data
export const PORTION_WEIGHTS: Record<string, PortionData[]> = {
  // Fruits
  "apple": [
    { fdc_id: "171688", portion_description: "medium", gram_weight: 182, amount: 1 },
    { fdc_id: "171688", portion_description: "large", gram_weight: 223, amount: 1 },
    { fdc_id: "171688", portion_description: "small", gram_weight: 149, amount: 1 },
    { fdc_id: "171688", portion_description: "cup sliced", gram_weight: 109, amount: 1 }
  ],
  "banana": [
    { fdc_id: "173944", portion_description: "medium", gram_weight: 118, amount: 1 },
    { fdc_id: "173944", portion_description: "large", gram_weight: 136, amount: 1 },
    { fdc_id: "173944", portion_description: "small", gram_weight: 101, amount: 1 },
    { fdc_id: "173944", portion_description: "cup sliced", gram_weight: 150, amount: 1 }
  ],
  "orange": [
    { fdc_id: "169097", portion_description: "medium", gram_weight: 154, amount: 1 },
    { fdc_id: "169097", portion_description: "large", gram_weight: 184, amount: 1 },
    { fdc_id: "169097", portion_description: "small", gram_weight: 96, amount: 1 },
    { fdc_id: "169097", portion_description: "cup sections", gram_weight: 180, amount: 1 }
  ],
  "cherry": [
    { fdc_id: "2708231", portion_description: "cup", gram_weight: 154, amount: 1 },
    { fdc_id: "2708231", portion_description: "piece", gram_weight: 8, amount: 1 }
  ],
  
  // Proteins
  "chicken breast": [
    { fdc_id: "171477", portion_description: "breast", gram_weight: 172, amount: 1 },
    { fdc_id: "171477", portion_description: "piece", gram_weight: 85, amount: 1 },
    { fdc_id: "171477", portion_description: "cup diced", gram_weight: 140, amount: 1 }
  ],
  "egg": [
    { fdc_id: "171287", portion_description: "large", gram_weight: 50, amount: 1 },
    { fdc_id: "171287", portion_description: "medium", gram_weight: 44, amount: 1 },
    { fdc_id: "171287", portion_description: "small", gram_weight: 38, amount: 1 }
  ],
  
  // Grains & Carbs
  "rice": [
    { fdc_id: "168878", portion_description: "cup cooked", gram_weight: 158, amount: 1 },
    { fdc_id: "168878", portion_description: "cup uncooked", gram_weight: 185, amount: 1 }
  ],
  "bread": [
    { fdc_id: "172687", portion_description: "slice", gram_weight: 28, amount: 1 },
    { fdc_id: "172687", portion_description: "piece", gram_weight: 25, amount: 1 }
  ],
  "pasta": [
    { fdc_id: "168277", portion_description: "cup cooked", gram_weight: 124, amount: 1 },
    { fdc_id: "168277", portion_description: "cup uncooked", gram_weight: 100, amount: 1 }
  ],
  
  // Vegetables
  "broccoli": [
    { fdc_id: "170379", portion_description: "cup chopped", gram_weight: 91, amount: 1 },
    { fdc_id: "170379", portion_description: "spear", gram_weight: 31, amount: 1 }
  ],
  "carrot": [
    { fdc_id: "170393", portion_description: "medium", gram_weight: 61, amount: 1 },
    { fdc_id: "170393", portion_description: "cup chopped", gram_weight: 128, amount: 1 }
  ],
  
  // Dairy
  "milk": [
    { fdc_id: "171265", portion_description: "cup", gram_weight: 244, amount: 1 },
    { fdc_id: "171265", portion_description: "glass", gram_weight: 244, amount: 1 }
  ],
  "cheese": [
    { fdc_id: "173441", portion_description: "slice", gram_weight: 28, amount: 1 },
    { fdc_id: "173441", portion_description: "cup shredded", gram_weight: 113, amount: 1 }
  ]
};

// Calorie conversion factors from USDA data
export const CALORIE_CONVERSION_FACTORS = {
  protein: 4.27,  // kcal per gram
  fat: 9.02,      // kcal per gram  
  carbs: 3.87     // kcal per gram
};

/**
 * Get portion weight for a food item and measurement
 */
export function getPortionWeight(foodName: string, measurement: string): number | null {
  const normalizedFood = foodName.toLowerCase().trim();
  const normalizedMeasurement = measurement.toLowerCase().trim();
  
  // Find exact food match
  const portions = PORTION_WEIGHTS[normalizedFood];
  if (!portions) {
    // Try partial matches
    const foodKey = Object.keys(PORTION_WEIGHTS).find(key => 
      normalizedFood.includes(key) || key.includes(normalizedFood)
    );
    if (foodKey) {
      return getPortionWeight(foodKey, measurement);
    }
    return null;
  }
  
  // Find best portion match
  const portion = portions.find(p => {
    const desc = p.portion_description.toLowerCase();
    return desc.includes(normalizedMeasurement) || 
           normalizedMeasurement.includes(desc) ||
           (normalizedMeasurement.includes('medium') && desc === 'medium') ||
           (normalizedMeasurement.includes('large') && desc === 'large') ||
           (normalizedMeasurement.includes('small') && desc === 'small') ||
           (normalizedMeasurement.includes('cup') && desc.includes('cup')) ||
           (normalizedMeasurement.includes('piece') && desc.includes('piece')) ||
           (normalizedMeasurement.includes('slice') && desc.includes('slice'));
  });
  
  if (portion) {
    return portion.gram_weight * portion.amount;
  }
  
  // Default to medium portion if available
  const defaultPortion = portions.find(p => p.portion_description.includes('medium')) || portions[0];
  return defaultPortion ? defaultPortion.gram_weight * defaultPortion.amount : null;
}

/**
 * Parse measurement text to extract quantity and unit
 */
export function parseMeasurement(measurement: string): { quantity: number; unit: string } {
  const normalized = measurement.toLowerCase().trim();
  
  // Handle parenthetical notes like "1 cup (140g)" - prioritize main measurement
  const parentheticalMatch = normalized.match(/^(.+?)\s*\((.+?)\)(.*)$/);
  if (parentheticalMatch) {
    const beforeParen = parentheticalMatch[1].trim();
    // Always use the measurement before parentheses as the primary
    const match = beforeParen.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    if (match) {
      return {
        quantity: parseFloat(match[1]),
        unit: match[2].trim()
      };
    }
    // Fallback if no number before parentheses
    return {
      quantity: 1,
      unit: beforeParen
    };
  }
  
  // Extract numbers from the beginning
  const numberMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (numberMatch) {
    return {
      quantity: parseFloat(numberMatch[1]),
      unit: numberMatch[2].trim()
    };
  }
  
  // Handle fractions
  const fractionMatch = normalized.match(/^(1\/2|1\/4|3\/4|1\/3|2\/3)\s*(.*)$/);
  if (fractionMatch) {
    const fractionValue = {
      '1/2': 0.5,
      '1/4': 0.25,
      '3/4': 0.75,
      '1/3': 0.33,
      '2/3': 0.67
    }[fractionMatch[1]] || 1;
    
    return {
      quantity: fractionValue,
      unit: fractionMatch[2].trim()
    };
  }
  
  // Default to 1 if no number found
  return {
    quantity: 1,
    unit: normalized
  };
}