/**
 * Complete USDA Nutrient Database
 * Comprehensive nutrient definitions and rankings for accurate nutrition analysis
 */

interface NutrientDefinition {
  id: string;
  name: string;
  unitName: string;
  nutrientNumber: string;
  rank: number;
  category: string;
  description?: string;
}

// Essential nutrients for nutrition tracking
export const ESSENTIAL_NUTRIENTS: Record<string, NutrientDefinition> = {
  // Energy and macronutrients
  "1008": {
    id: "1008",
    name: "Energy",
    unitName: "KCAL",
    nutrientNumber: "208",
    rank: 300,
    category: "energy"
  },
  "2047": {
    id: "2047",
    name: "Energy (Atwater General Factors)",
    unitName: "KCAL",
    nutrientNumber: "957",
    rank: 280,
    category: "energy"
  },
  "2048": {
    id: "2048",
    name: "Energy (Atwater Specific Factors)",
    unitName: "KCAL",
    nutrientNumber: "958",
    rank: 290,
    category: "energy"
  },
  "1003": {
    id: "1003",
    name: "Protein",
    unitName: "G",
    nutrientNumber: "203",
    rank: 600,
    category: "macronutrient"
  },
  "1004": {
    id: "1004",
    name: "Total lipid (fat)",
    unitName: "G",
    nutrientNumber: "204",
    rank: 800,
    category: "macronutrient"
  },
  "1005": {
    id: "1005",
    name: "Carbohydrate, by difference",
    unitName: "G",
    nutrientNumber: "205",
    rank: 1110,
    category: "macronutrient"
  },
  "1050": {
    id: "1050",
    name: "Carbohydrate, by summation",
    unitName: "G",
    nutrientNumber: "205.2",
    rank: 1120,
    category: "macronutrient"
  },
  
  // Fiber and sugars
  "1079": {
    id: "1079",
    name: "Fiber, total dietary",
    unitName: "G",
    nutrientNumber: "291",
    rank: 1200,
    category: "fiber"
  },
  "1063": {
    id: "1063",
    name: "Sugars, Total",
    unitName: "G",
    nutrientNumber: "269.3",
    rank: 1500,
    category: "sugar"
  },
  
  // Major minerals
  "1087": {
    id: "1087",
    name: "Calcium, Ca",
    unitName: "MG",
    nutrientNumber: "301",
    rank: 5300,
    category: "mineral"
  },
  "1089": {
    id: "1089",
    name: "Iron, Fe",
    unitName: "MG",
    nutrientNumber: "303",
    rank: 5400,
    category: "mineral"
  },
  "1090": {
    id: "1090",
    name: "Magnesium, Mg",
    unitName: "MG",
    nutrientNumber: "304",
    rank: 5500,
    category: "mineral"
  },
  "1091": {
    id: "1091",
    name: "Phosphorus, P",
    unitName: "MG",
    nutrientNumber: "305",
    rank: 5600,
    category: "mineral"
  },
  "1092": {
    id: "1092",
    name: "Potassium, K",
    unitName: "MG",
    nutrientNumber: "306",
    rank: 5700,
    category: "mineral"
  },
  "1093": {
    id: "1093",
    name: "Sodium, Na",
    unitName: "MG",
    nutrientNumber: "307",
    rank: 5800,
    category: "mineral"
  },
  "1095": {
    id: "1095",
    name: "Zinc, Zn",
    unitName: "MG",
    nutrientNumber: "309",
    rank: 5900,
    category: "mineral"
  },
  
  // Vitamins
  "1106": {
    id: "1106",
    name: "Vitamin A, RAE",
    unitName: "UG",
    nutrientNumber: "320",
    rank: 7420,
    category: "vitamin"
  },
  "1162": {
    id: "1162",
    name: "Vitamin C, total ascorbic acid",
    unitName: "MG",
    nutrientNumber: "401",
    rank: 6300,
    category: "vitamin"
  },
  "1165": {
    id: "1165",
    name: "Thiamin",
    unitName: "MG",
    nutrientNumber: "404",
    rank: 6400,
    category: "vitamin"
  },
  "1166": {
    id: "1166",
    name: "Riboflavin",
    unitName: "MG",
    nutrientNumber: "405",
    rank: 6500,
    category: "vitamin"
  },
  "1167": {
    id: "1167",
    name: "Niacin",
    unitName: "MG",
    nutrientNumber: "406",
    rank: 6600,
    category: "vitamin"
  },
  "1175": {
    id: "1175",
    name: "Vitamin B-6",
    unitName: "MG",
    nutrientNumber: "415",
    rank: 6800,
    category: "vitamin"
  },
  "1177": {
    id: "1177",
    name: "Folate, total",
    unitName: "UG",
    nutrientNumber: "417",
    rank: 6900,
    category: "vitamin"
  },
  "1178": {
    id: "1178",
    name: "Vitamin B-12",
    unitName: "UG",
    nutrientNumber: "418",
    rank: 7000,
    category: "vitamin"
  },
  "1114": {
    id: "1114",
    name: "Vitamin D (D2 + D3)",
    unitName: "UG",
    nutrientNumber: "328",
    rank: 8700,
    category: "vitamin"
  },
  "1109": {
    id: "1109",
    name: "Vitamin E (alpha-tocopherol)",
    unitName: "MG",
    nutrientNumber: "323",
    rank: 7905,
    category: "vitamin"
  }
};

/**
 * Get nutrient by ID with enhanced metadata
 */
export function getNutrientById(nutrientId: string): NutrientDefinition | null {
  return ESSENTIAL_NUTRIENTS[nutrientId] || null;
}

/**
 * Get nutrient by name (fuzzy matching)
 */
export function getNutrientByName(name: string): NutrientDefinition | null {
  const searchName = name.toLowerCase();
  
  for (const nutrient of Object.values(ESSENTIAL_NUTRIENTS)) {
    if (nutrient.name.toLowerCase().includes(searchName)) {
      return nutrient;
    }
  }
  
  return null;
}

/**
 * Get nutrients by category
 */
export function getNutrientsByCategory(category: string): NutrientDefinition[] {
  return Object.values(ESSENTIAL_NUTRIENTS).filter(
    nutrient => nutrient.category === category
  ).sort((a, b) => a.rank - b.rank);
}

/**
 * Get priority nutrients for nutrition labels
 */
export function getPriorityNutrients(): NutrientDefinition[] {
  const priorityIds = [
    "1008", // Energy
    "1003", // Protein
    "1004", // Fat
    "1005", // Carbohydrate
    "1079", // Fiber
    "1063", // Sugars
    "1093", // Sodium
    "1087", // Calcium
    "1089", // Iron
    "1162", // Vitamin C
    "1106"  // Vitamin A
  ];
  
  return priorityIds
    .map(id => ESSENTIAL_NUTRIENTS[id])
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Validate nutrient value based on typical ranges
 */
export function validateNutrientValue(nutrientId: string, value: number): boolean {
  const nutrient = getNutrientById(nutrientId);
  if (!nutrient) return false;
  
  // Basic validation ranges per 100g
  const validationRanges: Record<string, [number, number]> = {
    "1008": [0, 900],    // Energy (kcal)
    "1003": [0, 100],    // Protein (g)
    "1004": [0, 100],    // Fat (g)
    "1005": [0, 100],    // Carbs (g)
    "1079": [0, 50],     // Fiber (g)
    "1063": [0, 100],    // Sugars (g)
    "1093": [0, 5000],   // Sodium (mg)
    "1087": [0, 2000],   // Calcium (mg)
    "1089": [0, 50],     // Iron (mg)
    "1162": [0, 2000],   // Vitamin C (mg)
    "1106": [0, 3000]    // Vitamin A (μg)
  };
  
  const range = validationRanges[nutrientId];
  if (!range) return true; // No validation range defined
  
  return value >= range[0] && value <= range[1];
}

/**
 * Format nutrient value with appropriate units and precision
 */
export function formatNutrientValue(nutrientId: string, value: number): string {
  const nutrient = getNutrientById(nutrientId);
  if (!nutrient) return value.toString();
  
  const precision = nutrient.unitName === "UG" ? 0 : 
                   nutrient.unitName === "MG" ? 1 : 2;
  
  return `${value.toFixed(precision)}${nutrient.unitName.toLowerCase()}`;
}