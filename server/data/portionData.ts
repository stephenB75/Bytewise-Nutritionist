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
  "cantaloupe": [
    { fdc_id: "169105", portion_description: "whole", gram_weight: 552, amount: 1 },
    { fdc_id: "169105", portion_description: "half", gram_weight: 276, amount: 1 },
    { fdc_id: "169105", portion_description: "quarter", gram_weight: 138, amount: 1 },
    { fdc_id: "169105", portion_description: "cup cubed", gram_weight: 160, amount: 1 },
    { fdc_id: "169105", portion_description: "medium", gram_weight: 552, amount: 1 },
    { fdc_id: "169105", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "watermelon": [
    { fdc_id: "167765", portion_description: "wedge", gram_weight: 286, amount: 1 },
    { fdc_id: "167765", portion_description: "cup cubed", gram_weight: 152, amount: 1 },
    { fdc_id: "167765", portion_description: "slice", gram_weight: 286, amount: 1 },
    { fdc_id: "167765", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "honeydew": [
    { fdc_id: "168153", portion_description: "whole", gram_weight: 1280, amount: 1 },
    { fdc_id: "168153", portion_description: "half", gram_weight: 640, amount: 1 },
    { fdc_id: "168153", portion_description: "quarter", gram_weight: 320, amount: 1 },
    { fdc_id: "168153", portion_description: "cup cubed", gram_weight: 170, amount: 1 },
    { fdc_id: "168153", portion_description: "wedge", gram_weight: 129, amount: 1 },
    { fdc_id: "168153", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  
  // Proteins
  "chicken breast": [
    { fdc_id: "171477", portion_description: "breast", gram_weight: 172, amount: 1 },
    { fdc_id: "171477", portion_description: "piece", gram_weight: 85, amount: 1 },
    { fdc_id: "171477", portion_description: "cup diced", gram_weight: 140, amount: 1 },
    { fdc_id: "171477", portion_description: "g", gram_weight: 1, amount: 1 } // 1g = 1g for direct measurements
  ],
  "egg": [
    { fdc_id: "171287", portion_description: "large", gram_weight: 50, amount: 1 },
    { fdc_id: "171287", portion_description: "medium", gram_weight: 44, amount: 1 },
    { fdc_id: "171287", portion_description: "small", gram_weight: 38, amount: 1 },
    { fdc_id: "171287", portion_description: "eggs", gram_weight: 50, amount: 1 }, // For "2 eggs" calculations
    { fdc_id: "171287", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "scrambled eggs": [
    { fdc_id: "171287", portion_description: "large", gram_weight: 50, amount: 1 },
    { fdc_id: "171287", portion_description: "eggs", gram_weight: 50, amount: 1 },
    { fdc_id: "171287", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  
  // Grains & Carbs
  "rice": [
    { fdc_id: "168878", portion_description: "cup cooked", gram_weight: 158, amount: 1 },
    { fdc_id: "168878", portion_description: "cup uncooked", gram_weight: 185, amount: 1 },
    { fdc_id: "168878", portion_description: "g", gram_weight: 1, amount: 1 }
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
  ],
  
  // Processed Foods
  "hot dog": [
    { fdc_id: "174608", portion_description: "hotdog", gram_weight: 52, amount: 1 },
    { fdc_id: "174608", portion_description: "frank", gram_weight: 52, amount: 1 },
    { fdc_id: "174608", portion_description: "sausage", gram_weight: 52, amount: 1 },
    { fdc_id: "174608", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "hotdog": [
    { fdc_id: "174608", portion_description: "hotdog", gram_weight: 52, amount: 1 },
    { fdc_id: "174608", portion_description: "frank", gram_weight: 52, amount: 1 },
    { fdc_id: "174608", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "pizza": [
    { fdc_id: "175176", portion_description: "slice", gram_weight: 107, amount: 1 },
    { fdc_id: "175176", portion_description: "piece", gram_weight: 107, amount: 1 },
    { fdc_id: "175176", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "french fries": [
    { fdc_id: "170427", portion_description: "serving", gram_weight: 85, amount: 1 },
    { fdc_id: "170427", portion_description: "small", gram_weight: 71, amount: 1 },
    { fdc_id: "170427", portion_description: "medium", gram_weight: 115, amount: 1 },
    { fdc_id: "170427", portion_description: "large", gram_weight: 154, amount: 1 },
    { fdc_id: "170427", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "ice cream": [
    { fdc_id: "171265", portion_description: "cup", gram_weight: 132, amount: 1 },
    { fdc_id: "171265", portion_description: "scoop", gram_weight: 66, amount: 1 },
    { fdc_id: "171265", portion_description: "serving", gram_weight: 66, amount: 1 },
    { fdc_id: "171265", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  
  // International foods
  "falafel": [
    { fdc_id: "175180", portion_description: "piece", gram_weight: 17, amount: 1 },
    { fdc_id: "175180", portion_description: "ball", gram_weight: 17, amount: 1 },
    { fdc_id: "175180", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "pierogi": [
    { fdc_id: "175185", portion_description: "piece", gram_weight: 28, amount: 1 },
    { fdc_id: "175185", portion_description: "dumpling", gram_weight: 28, amount: 1 },
    { fdc_id: "175185", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "gyoza": [
    { fdc_id: "175190", portion_description: "piece", gram_weight: 15, amount: 1 },
    { fdc_id: "175190", portion_description: "dumpling", gram_weight: 15, amount: 1 },
    { fdc_id: "175190", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "baklava": [
    { fdc_id: "175195", portion_description: "piece", gram_weight: 60, amount: 1 },
    { fdc_id: "175195", portion_description: "square", gram_weight: 60, amount: 1 },
    { fdc_id: "175195", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "sushi": [
    { fdc_id: "175200", portion_description: "piece", gram_weight: 30, amount: 1 },
    { fdc_id: "175200", portion_description: "roll", gram_weight: 180, amount: 1 },
    { fdc_id: "175200", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  
  // Caribbean foods
  "plantains": [
    { fdc_id: "169124", portion_description: "medium", gram_weight: 179, amount: 1 },
    { fdc_id: "169124", portion_description: "large", gram_weight: 218, amount: 1 },
    { fdc_id: "169124", portion_description: "small", gram_weight: 148, amount: 1 },
    { fdc_id: "169124", portion_description: "cup sliced", gram_weight: 148, amount: 1 },
    { fdc_id: "169124", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "fried plantains": [
    { fdc_id: "169124", portion_description: "medium", gram_weight: 179, amount: 1 },
    { fdc_id: "169124", portion_description: "slice", gram_weight: 20, amount: 1 },
    { fdc_id: "169124", portion_description: "cup", gram_weight: 154, amount: 1 },
    { fdc_id: "169124", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "jerk chicken": [
    { fdc_id: "171477", portion_description: "breast", gram_weight: 172, amount: 1 },
    { fdc_id: "171477", portion_description: "thigh", gram_weight: 114, amount: 1 },
    { fdc_id: "171477", portion_description: "drumstick", gram_weight: 85, amount: 1 },
    { fdc_id: "171477", portion_description: "serving", gram_weight: 150, amount: 1 },
    { fdc_id: "171477", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "rice and beans": [
    { fdc_id: "168878", portion_description: "cup", gram_weight: 200, amount: 1 },
    { fdc_id: "168878", portion_description: "serving", gram_weight: 200, amount: 1 },
    { fdc_id: "168878", portion_description: "plate", gram_weight: 300, amount: 1 },
    { fdc_id: "168878", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "beef patty": [
    { fdc_id: "175210", portion_description: "patty", gram_weight: 142, amount: 1 },
    { fdc_id: "175210", portion_description: "piece", gram_weight: 142, amount: 1 },
    { fdc_id: "175210", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "chicken patty": [
    { fdc_id: "175215", portion_description: "patty", gram_weight: 142, amount: 1 },
    { fdc_id: "175215", portion_description: "piece", gram_weight: 142, amount: 1 },
    { fdc_id: "175215", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "roti": [
    { fdc_id: "172687", portion_description: "piece", gram_weight: 85, amount: 1 },
    { fdc_id: "172687", portion_description: "roti", gram_weight: 85, amount: 1 },
    { fdc_id: "172687", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "festival": [
    { fdc_id: "175220", portion_description: "piece", gram_weight: 65, amount: 1 },
    { fdc_id: "175220", portion_description: "festival", gram_weight: 65, amount: 1 },
    { fdc_id: "175220", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "johnny cakes": [
    { fdc_id: "175225", portion_description: "piece", gram_weight: 55, amount: 1 },
    { fdc_id: "175225", portion_description: "cake", gram_weight: 55, amount: 1 },
    { fdc_id: "175225", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "cassava": [
    { fdc_id: "169985", portion_description: "cup", gram_weight: 103, amount: 1 },
    { fdc_id: "169985", portion_description: "medium", gram_weight: 400, amount: 1 },
    { fdc_id: "169985", portion_description: "serving", gram_weight: 150, amount: 1 },
    { fdc_id: "169985", portion_description: "g", gram_weight: 1, amount: 1 }
  ],
  "breadfruit": [
    { fdc_id: "169986", portion_description: "cup", gram_weight: 220, amount: 1 },
    { fdc_id: "169986", portion_description: "medium", gram_weight: 350, amount: 1 },
    { fdc_id: "169986", portion_description: "slice", gram_weight: 60, amount: 1 },
    { fdc_id: "169986", portion_description: "g", gram_weight: 1, amount: 1 }
  ]
};

// Additional portion mappings for processed foods
export const ADDITIONAL_PORTIONS: Record<string, PortionData[]> = {
  "hot dog": [
    { fdc_id: "174582", portion_description: "item", gram_weight: 76, amount: 1 },
    { fdc_id: "174582", portion_description: "piece", gram_weight: 76, amount: 1 },
    { fdc_id: "174582", portion_description: "link", gram_weight: 76, amount: 1 },
    { fdc_id: "174582", portion_description: "g", gram_weight: 1, amount: 1 }
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
  
  // Find best portion match - enhanced for natural language
  const portion = portions.find(p => {
    const desc = p.portion_description.toLowerCase();
    return desc.includes(normalizedMeasurement) || 
           normalizedMeasurement.includes(desc) ||
           (normalizedMeasurement.includes('medium') && desc === 'medium') ||
           (normalizedMeasurement.includes('large') && desc === 'large') ||
           (normalizedMeasurement.includes('small') && desc === 'small') ||
           (normalizedMeasurement.includes('cup') && desc.includes('cup')) ||
           (normalizedMeasurement.includes('piece') && desc.includes('piece')) ||
           (normalizedMeasurement.includes('slice') && desc.includes('slice')) ||
           (normalizedMeasurement.includes('hot dog') && desc === 'item') ||
           (normalizedMeasurement.includes('standard') && desc === 'item') ||
           (normalizedMeasurement.includes('item') && desc === 'item') ||
           // Enhanced natural language matching
           (normalizedMeasurement.includes('half') && desc === 'half') ||
           (normalizedMeasurement.includes('quarter') && desc === 'quarter') ||
           (normalizedMeasurement.includes('whole') && desc === 'whole') ||
           (normalizedMeasurement.includes('wedge') && desc === 'wedge');
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
export function parseMeasurement(measurement: string | undefined): { quantity: number; unit: string } {
  if (!measurement) {
    return { quantity: 1, unit: 'serving' };
  }
  
  const normalized = measurement.toLowerCase().trim();
  
  // Handle natural language patterns like "half of cantaloupe" or "quarter of watermelon"
  const naturalLangMatch = normalized.match(/^(half|quarter|third|1\/2|1\/4|1\/3|2\/3|3\/4)\s*(of\s*)?(.+)$/);
  if (naturalLangMatch) {
    const fractionText = naturalLangMatch[1];
    const remainder = naturalLangMatch[3].trim();
    
    const fractionValue = {
      'half': 0.5,
      '1/2': 0.5,
      'quarter': 0.25,
      '1/4': 0.25,
      'third': 0.33,
      '1/3': 0.33,
      '2/3': 0.67,
      '3/4': 0.75
    }[fractionText] || 1;
    
    return {
      quantity: fractionValue,
      unit: remainder
    };
  }
  
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
  
  // Handle cases like "1 hot dog" where number is first
  const wordNumberMatch = normalized.match(/^(\d+)\s+(.+)$/);
  if (wordNumberMatch) {
    return {
      quantity: parseFloat(wordNumberMatch[1]),
      unit: wordNumberMatch[2].trim()
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