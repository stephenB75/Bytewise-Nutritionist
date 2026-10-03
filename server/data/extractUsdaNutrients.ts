/**
 * Pulls kcal and macros from a USDA FoodData Central nutrient list.
 * Energy can appear as kcal (1008 / 2047 / 2048) or kJ (1062); fat as total lipid
 * or as individual fatty acids. Last-write-wins on name matches used to overwrite
 * kcal with kJ and total fat with trans fat, which threw calorie counts off.
 */

export type ExtractedNutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  iron: number;
  calcium: number;
  zinc: number;
  magnesium: number;
  vitaminC: number;
  vitaminD: number;
  vitaminB12: number;
  folate: number;
  vitaminA: number;
  vitaminE: number;
  potassium: number;
  phosphorus: number;
};

const ENERGY_KCAL_IDS = new Set([1008, 2047, 2048]);
const ENERGY_KJ_IDS = new Set([1062]);
const KJ_PER_KCAL = 4.184;

function nutrientAmount(nutrient: any): number {
  const value = nutrient?.value ?? nutrient?.amount;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function nutrientId(nutrient: any): number {
  return nutrient?.nutrientId ?? nutrient?.nutrient?.id ?? 0;
}

function nutrientName(nutrient: any): string {
  return String(nutrient?.nutrientName || nutrient?.nutrient?.name || '').toLowerCase();
}

function nutrientUnit(nutrient: any): string {
  return String(nutrient?.unitName || nutrient?.nutrient?.unitName || '').toLowerCase();
}

function nutrientNumber(nutrient: any): string {
  return String(nutrient?.nutrientNumber || nutrient?.nutrient?.number || '');
}

function isTotalFat(name: string, id: number): boolean {
  if (id === 1004) return true;
  if (name.includes('fatty acid') || name.includes('saturated') || name.includes('trans')) return false;
  return name.includes('total lipid') || name === 'fat' || name === 'total fat' || name === 'fat, total';
}

function isEnergyKj(name: string, id: number, unit: string, number: string): boolean {
  return ENERGY_KJ_IDS.has(id) || number === '268' || ((name.includes('energy') || name.includes('calorie')) && unit === 'kj');
}

function isEnergyKcal(name: string, id: number, unit: string, number: string): boolean {
  if (ENERGY_KCAL_IDS.has(id) || number === '208') return true;
  if (isEnergyKj(name, id, unit, number)) return false;
  return (name.includes('energy') || name.includes('calorie')) && (unit === 'kcal' || unit === '' || unit === 'kcalorie');
}

export function extractUsdaNutrients(foodNutrients: any[] | null | undefined): ExtractedNutrients {
  const nutrients: ExtractedNutrients = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    iron: 0,
    calcium: 0,
    zinc: 0,
    magnesium: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminB12: 0,
    folate: 0,
    vitaminA: 0,
    vitaminE: 0,
    potassium: 0,
    phosphorus: 0,
  };

  if (!foodNutrients || !Array.isArray(foodNutrients)) {
    return nutrients;
  }

  let kcal: number | null = null;
  let kcalFallback: number | null = null;
  let kj: number | null = null;

  for (const nutrient of foodNutrients) {
    if (!nutrient || (!nutrient.nutrientName && !nutrient.nutrient?.name)) continue;

    const name = nutrientName(nutrient);
    const amount = nutrientAmount(nutrient);
    const id = nutrientId(nutrient);
    const unit = nutrientUnit(nutrient);
    const number = nutrientNumber(nutrient);

    if (isEnergyKcal(name, id, unit, number)) {
      if (id === 1008 || number === '208') kcal = amount;
      else if (kcalFallback == null) kcalFallback = amount;
    } else if (isEnergyKj(name, id, unit, number)) {
      if (kj == null && amount > 0) kj = amount;
    } else if (id === 1003 || name === 'protein' || name.startsWith('protein,')) {
      nutrients.protein = amount;
    } else if (id === 1005 || (name.includes('carbohydrate') && !name.includes('fiber'))) {
      nutrients.carbs = amount;
    } else if (isTotalFat(name, id)) {
      nutrients.fat = amount;
    } else if (name.includes('fiber') || id === 1079) {
      nutrients.fiber = amount;
    } else if ((name.includes('sugar') && !name.includes('alcohol')) || id === 2000) {
      nutrients.sugar = amount;
    } else if (name.includes('sodium') || id === 1093) {
      nutrients.sodium = amount > 100 ? amount / 1000 : amount;
    } else if (name.includes('iron') || id === 1089) {
      nutrients.iron = amount;
    } else if (name.includes('calcium') || id === 1087) {
      nutrients.calcium = amount;
    } else if (name.includes('zinc') || id === 1095) {
      nutrients.zinc = amount;
    } else if (name.includes('magnesium') || id === 1090) {
      nutrients.magnesium = amount;
    } else if (name.includes('vitamin c') || name.includes('ascorbic') || id === 1162) {
      nutrients.vitaminC = amount;
    } else if (name.includes('vitamin d') || id === 1110 || id === 1114) {
      nutrients.vitaminD += amount;
    } else if (name.includes('vitamin b-12') || name.includes('cobalamin') || id === 1178) {
      nutrients.vitaminB12 = amount;
    } else if (name.includes('folate') || id === 1177) {
      nutrients.folate = amount;
    } else if (name.includes('vitamin a') || id === 1106 || id === 1107) {
      nutrients.vitaminA += amount;
    } else if (name.includes('vitamin e') || id === 1109) {
      nutrients.vitaminE = amount;
    } else if (name.includes('potassium') || id === 1092) {
      nutrients.potassium = amount;
    } else if (name.includes('phosphorus') || id === 1091) {
      nutrients.phosphorus = amount;
    }
  }

  if (kcal != null) nutrients.calories = kcal;
  else if (kcalFallback != null) nutrients.calories = kcalFallback;
  else if (kj != null) nutrients.calories = kj / KJ_PER_KCAL;

  const atwater = 4 * nutrients.protein + 4 * nutrients.carbs + 9 * nutrients.fat;
  if (nutrients.calories === 0 && atwater > 0) {
    nutrients.calories = Math.round(atwater);
  } else if (atwater > 20 && nutrients.calories > 0) {
    const ratio = nutrients.calories / atwater;
    if (ratio > 3.5 && ratio < 5) {
      nutrients.calories = nutrients.calories / KJ_PER_KCAL;
    }
  }

  return nutrients;
}
