/**
 * USDA Measure Units Database
 * Comprehensive unit conversion system for precise portion tracking
 */

interface MeasureUnit {
  id: string;
  name: string;
  category: string;
  baseConversion?: number; // conversion to grams when applicable
}

// Complete USDA measure units with enhanced categorization
export const MEASURE_UNITS: Record<string, MeasureUnit> = {
  // Volume measures
  "1000": { id: "1000", name: "cup", category: "volume", baseConversion: 240 },
  "1001": { id: "1001", name: "tablespoon", category: "volume", baseConversion: 15 },
  "1002": { id: "1002", name: "teaspoon", category: "volume", baseConversion: 5 },
  "1003": { id: "1003", name: "liter", category: "volume", baseConversion: 1000 },
  "1004": { id: "1004", name: "milliliter", category: "volume", baseConversion: 1 },
  "1007": { id: "1007", name: "gallon", category: "volume", baseConversion: 3785 },
  "1008": { id: "1008", name: "pint", category: "volume", baseConversion: 473 },
  "1009": { id: "1009", name: "fl oz", category: "volume", baseConversion: 30 },
  "1045": { id: "1045", name: "quart", category: "volume", baseConversion: 946 },
  
  // Weight measures
  "1030": { id: "1030", name: "lb", category: "weight", baseConversion: 453.6 },
  "1038": { id: "1038", name: "oz", category: "weight", baseConversion: 28.35 },
  
  // Count/portion measures - food specific
  "1013": { id: "1013", name: "bar", category: "portion" },
  "1014": { id: "1014", name: "bird", category: "portion" },
  "1015": { id: "1015", name: "biscuit", category: "portion" },
  "1016": { id: "1016", name: "bottle", category: "portion" },
  "1017": { id: "1017", name: "box", category: "portion" },
  "1018": { id: "1018", name: "breast", category: "portion" },
  "1019": { id: "1019", name: "can", category: "portion" },
  "1020": { id: "1020", name: "chicken", category: "portion" },
  "1021": { id: "1021", name: "chop", category: "portion" },
  "1022": { id: "1022", name: "cookie", category: "portion" },
  "1023": { id: "1023", name: "container", category: "portion" },
  "1024": { id: "1024", name: "cracker", category: "portion" },
  "1025": { id: "1025", name: "drink", category: "portion" },
  "1026": { id: "1026", name: "drumstick", category: "portion" },
  "1027": { id: "1027", name: "fillet", category: "portion" },
  "1028": { id: "1028", name: "fruit", category: "portion" },
  
  // Size descriptors
  "1029": { id: "1029", name: "large", category: "size" },
  "1036": { id: "1036", name: "medium", category: "size" },
  "1052": { id: "1052", name: "small", category: "size" },
  
  // Sliced/prepared
  "1050": { id: "1050", name: "slice", category: "portion" },
  "1051": { id: "1051", name: "slices", category: "portion" },
  "1043": { id: "1043", name: "piece", category: "portion" },
  "1044": { id: "1044", name: "pieces", category: "portion" },
  "1059": { id: "1059", name: "unit", category: "portion" },
  "1071": { id: "1071", name: "each", category: "portion" },
  
  // Specialized food units
  "1064": { id: "1064", name: "pie", category: "portion" },
  "1078": { id: "1078", name: "sandwich", category: "portion" },
  "1079": { id: "1079", name: "tortilla", category: "portion" },
  "1080": { id: "1080", name: "burrito", category: "portion" },
  "1081": { id: "1081", name: "taco", category: "portion" },
  "1089": { id: "1089", name: "bagel", category: "portion" },
  "1093": { id: "1093", name: "cake", category: "portion" },
  "1098": { id: "1098", name: "doughnut", category: "portion" },
  "1108": { id: "1108", name: "pizza", category: "portion" },
  "1111": { id: "1111", name: "roll", category: "portion" },
  
  // Special recognition units
  "1119": { id: "1119", name: "Banana", category: "portion" },
  "1120": { id: "1120", name: "Onion", category: "portion" }
};

/**
 * Get unit by name with fuzzy matching
 */
export function findMeasureUnit(unitName: string): MeasureUnit | null {
  const normalized = unitName.toLowerCase().trim();
  
  // Direct match first
  for (const unit of Object.values(MEASURE_UNITS)) {
    if (unit.name.toLowerCase() === normalized) {
      return unit;
    }
  }
  
  // Partial match
  for (const unit of Object.values(MEASURE_UNITS)) {
    if (unit.name.toLowerCase().includes(normalized) || 
        normalized.includes(unit.name.toLowerCase())) {
      return unit;
    }
  }
  
  return null;
}

/**
 * Get units by category
 */
export function getUnitsByCategory(category: string): MeasureUnit[] {
  return Object.values(MEASURE_UNITS).filter(unit => unit.category === category);
}

/**
 * Convert volume to weight (approximate)
 */
export function volumeToWeight(volume: number, unit: string, foodDensity: number = 1): number {
  const measureUnit = findMeasureUnit(unit);
  
  if (!measureUnit || measureUnit.category !== 'volume') {
    return volume; // Return as-is if not a volume unit
  }
  
  const volumeInMl = measureUnit.baseConversion ? volume * measureUnit.baseConversion : volume;
  return volumeInMl * foodDensity; // Convert to grams using density
}

/**
 * Suggest appropriate units for food type
 */
export function suggestUnitsForFood(foodName: string): MeasureUnit[] {
  const name = foodName.toLowerCase();
  const suggestions: MeasureUnit[] = [];
  
  // Liquids
  if (name.includes('milk') || name.includes('juice') || name.includes('oil') || 
      name.includes('water') || name.includes('sauce')) {
    suggestions.push(
      MEASURE_UNITS["1000"], // cup
      MEASURE_UNITS["1001"], // tablespoon
      MEASURE_UNITS["1009"]  // fl oz
    );
  }
  
  // Fruits
  if (name.includes('apple') || name.includes('banana') || name.includes('orange')) {
    suggestions.push(
      MEASURE_UNITS["1028"], // fruit
      MEASURE_UNITS["1029"], // large
      MEASURE_UNITS["1036"]  // medium
    );
  }
  
  // Bread/baked goods
  if (name.includes('bread') || name.includes('toast')) {
    suggestions.push(
      MEASURE_UNITS["1050"], // slice
      MEASURE_UNITS["1043"]  // piece
    );
  }
  
  // Meat/protein
  if (name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
    suggestions.push(
      MEASURE_UNITS["1038"], // oz
      MEASURE_UNITS["1043"], // piece
      MEASURE_UNITS["1027"]  // fillet
    );
  }
  
  // Always suggest common units
  suggestions.push(
    MEASURE_UNITS["1000"], // cup
    MEASURE_UNITS["1038"], // oz
    MEASURE_UNITS["1043"]  // piece
  );
  
  return Array.from(new Set(suggestions)); // Remove duplicates
}

/**
 * Validate unit for food type
 */
export function isValidUnitForFood(unit: string, foodName: string): boolean {
  const measureUnit = findMeasureUnit(unit);
  if (!measureUnit) return false;
  
  const validUnits = suggestUnitsForFood(foodName);
  return validUnits.some(validUnit => validUnit.id === measureUnit.id);
}