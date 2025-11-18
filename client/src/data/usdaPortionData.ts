/**
 * USDA Food Portion Database Integration
 * Authentic portion sizes and measurement conversions from USDA data
 */

export interface USDAPortionData {
  id: string;
  fdc_id: string;
  seq_num: string;
  amount: number;
  measure_unit_id: string;
  portion_description: string;
  modifier: string;
  gram_weight: number;
  data_points: string;
  footnote: string;
}

export interface USDACalorieConversionFactor {
  food_nutrient_conversion_factor_id: string;
  protein_value: number;
  fat_value: number;
  carbohydrate_value: number;
}

export interface USDAFoodComponent {
  id: string;
  fdc_id: string;
  name: string;
  pct_weight: number;
  is_refuse: boolean;
  gram_weight: number;
  data_points: string;
}

// Sample of authentic USDA portion data for common foods
export const usdaPortionDatabase: USDAPortionData[] = [
  // Bread and Grain Products
  {
    id: "81552",
    fdc_id: "167515",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving",
    modifier: "",
    gram_weight: 57.0,
    data_points: "",
    footnote: ""
  },
  {
    id: "81553",
    fdc_id: "167516",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "waffle, square",
    modifier: "",
    gram_weight: 39.0,
    data_points: "10",
    footnote: ""
  },
  {
    id: "81554",
    fdc_id: "167516",
    seq_num: "2",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "waffle, round",
    modifier: "",
    gram_weight: 38.0,
    data_points: "40",
    footnote: ""
  },
  
  // Pastries and Baked Goods
  {
    id: "81562",
    fdc_id: "167522",
    seq_num: "1",
    amount: 0.12,
    measure_unit_id: "9999",
    portion_description: "pie 1 pie (1/8 of 9\" pie)",
    modifier: "",
    gram_weight: 131.0,
    data_points: "2",
    footnote: ""
  },
  {
    id: "81563",
    fdc_id: "167522",
    seq_num: "2",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "slice",
    modifier: "",
    gram_weight: 137.0,
    data_points: "12",
    footnote: ""
  },

  // Crackers and Snacks
  {
    id: "81575",
    fdc_id: "167529",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving (1 NLEA serving - about 4 crackers)",
    modifier: "",
    gram_weight: 30.0,
    data_points: "",
    footnote: ""
  },
  {
    id: "81576",
    fdc_id: "167529",
    seq_num: "2",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "cracker",
    modifier: "",
    gram_weight: 12.7,
    data_points: "2",
    footnote: ""
  },

  // Candy and Chocolate
  {
    id: "81642",
    fdc_id: "167565",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving 2.1 oz bar",
    modifier: "",
    gram_weight: 60.0,
    data_points: "1",
    footnote: ""
  },
  {
    id: "81643",
    fdc_id: "167565",
    seq_num: "2",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving 1 fun size bar 0.65 oz",
    modifier: "",
    gram_weight: 18.0,
    data_points: "1",
    footnote: ""
  },

  // Restaurant Food Portions
  {
    id: "81713",
    fdc_id: "167657",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving varied from 2-3 tacos per serving",
    modifier: "",
    gram_weight: 324.0,
    data_points: "6",
    footnote: ""
  },
  {
    id: "81714",
    fdc_id: "167658",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving varied from 1 to 3 tacos per serving",
    modifier: "",
    gram_weight: 281.0,
    data_points: "21",
    footnote: ""
  },

  // Meat Portions
  {
    id: "81729",
    fdc_id: "167669",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "serving",
    modifier: "",
    gram_weight: 198.0,
    data_points: "10",
    footnote: ""
  },
  {
    id: "81730",
    fdc_id: "167670",
    seq_num: "1",
    amount: 1.0,
    measure_unit_id: "9999",
    portion_description: "steak",
    modifier: "",
    gram_weight: 151.0,
    data_points: "10",
    footnote: ""
  }
];

// USDA Calorie Conversion Factors for accurate nutritional calculations
export const usdaCalorieConversions: USDACalorieConversionFactor[] = [
  // Grain products
  {
    food_nutrient_conversion_factor_id: "12172",
    protein_value: 2.62,
    fat_value: 8.37,
    carbohydrate_value: 3.48
  },
  {
    food_nutrient_conversion_factor_id: "12180",
    protein_value: 2.8,
    fat_value: 8.8,
    carbohydrate_value: 4.0
  },
  
  // Meat products
  {
    food_nutrient_conversion_factor_id: "12341",
    protein_value: 4.27,
    fat_value: 9.02,
    carbohydrate_value: 3.87
  },
  {
    food_nutrient_conversion_factor_id: "12464",
    protein_value: 3.87,
    fat_value: 8.37,
    carbohydrate_value: 4.12
  },
  
  // Mixed dishes and restaurant foods
  {
    food_nutrient_conversion_factor_id: "12572",
    protein_value: 4.0,
    fat_value: 9.0,
    carbohydrate_value: 4.0
  }
];

// Helper functions for portion conversions
export const getPortionsByFdcId = (fdcId: string): USDAPortionData[] => {
  return usdaPortionDatabase.filter(portion => portion.fdc_id === fdcId);
};

export const convertPortionToGrams = (
  fdcId: string, 
  portionDescription: string, 
  amount: number = 1
): number => {
  const portion = usdaPortionDatabase.find(
    p => p.fdc_id === fdcId && p.portion_description.toLowerCase().includes(portionDescription.toLowerCase())
  );
  
  if (portion) {
    return portion.gram_weight * amount;
  }
  
  return 0; // Return 0 if portion not found
};

export const getCalorieConversionFactor = (factorId: string): USDACalorieConversionFactor | null => {
  return usdaCalorieConversions.find(factor => factor.food_nutrient_conversion_factor_id === factorId) || null;
};

// Common portion size mappings with USDA data
export const commonPortionMappings = {
  // Bread and grains
  'slice_bread': { gram_weight: 28, description: 'slice' },
  'bagel': { gram_weight: 98, description: 'bagel' },
  'waffle': { gram_weight: 39, description: 'waffle, square' },
  'pancake': { gram_weight: 48, description: 'pancake' },
  
  // Snacks
  'cracker': { gram_weight: 12.7, description: 'cracker' },
  'pretzel': { gram_weight: 11, description: 'pretzel' },
  
  // Candy
  'candy_bar_small': { gram_weight: 18, description: 'fun size bar' },
  'candy_bar_regular': { gram_weight: 44, description: 'regular bar' },
  'candy_bar_large': { gram_weight: 60, description: '2.1 oz bar' },
  
  // Restaurant portions
  'taco_single': { gram_weight: 134, description: 'taco' },
  'taco_serving': { gram_weight: 281, description: 'taco serving (1-3 tacos)' },
  'steak': { gram_weight: 151, description: 'steak' },
  
  // Desserts
  'pie_slice': { gram_weight: 137, description: 'slice' },
  'cake_piece': { gram_weight: 86, description: 'piece' }
};

// Nutritional accuracy indicators based on USDA data points
export const getDataReliability = (dataPoints: string): 'high' | 'medium' | 'low' => {
  const points = parseInt(dataPoints) || 0;
  
  if (points >= 10) return 'high';
  if (points >= 3) return 'medium';
  return 'low';
};