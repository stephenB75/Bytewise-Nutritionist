/**
 * Enhanced Food Database for Complex and Ethnic Foods
 * Provides accurate nutritional data for foods not well-covered by USDA fallbacks
 */

export interface EnhancedFoodEntry {
  name: string;
  aliases: string[];
  category: string;
  portionWeight: number; // grams for standard portion
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    // Micronutrients
    iron?: number;
    calcium?: number;
    zinc?: number;
    magnesium?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminB12?: number;
    folate?: number;
    vitaminA?: number;
    vitaminE?: number;
    potassium?: number;
    phosphorus?: number;
  };
  note?: string;
}

// Enhanced database of complex and ethnic foods
export const ENHANCED_FOOD_DATABASE: Record<string, EnhancedFoodEntry> = {
  // Caribbean & West Indian Foods
  "jamaican_beef_patty": {
    name: "Jamaican Beef Patty",
    aliases: ["jamaican beef patty", "beef patty jamaican", "beef patty", "jamaican patty", "caribbean beef patty"],
    category: "caribbean_pastry",
    portionWeight: 142, // typical medium patty
    nutritionPer100g: {
      calories: 320,
      protein: 12.5,
      carbs: 28.0,
      fat: 18.5,
      fiber: 2.1,
      sugar: 2.5,
      sodium: 0.65,
      iron: 2.8,
      calcium: 45,
      zinc: 2.1,
      magnesium: 18,
      vitaminC: 1.2,
      vitaminD: 0.1,
      vitaminB12: 0.8,
      folate: 25,
      vitaminA: 12,
      vitaminE: 1.8,
      potassium: 185,
      phosphorus: 125
    },
    note: "Spiced ground beef in turmeric pastry - composite food with meat filling and flour pastry"
  },

  "chicken_patty_jamaican": {
    name: "Jamaican Chicken Patty",
    aliases: ["jamaican chicken patty", "chicken patty jamaican", "chicken patty", "caribbean chicken patty"],
    category: "caribbean_pastry",
    portionWeight: 135,
    nutritionPer100g: {
      calories: 298,
      protein: 14.2,
      carbs: 26.8,
      fat: 16.2,
      fiber: 2.0,
      sugar: 2.2,
      sodium: 0.58,
      iron: 1.9,
      calcium: 42,
      zinc: 1.8,
      magnesium: 16,
      vitaminC: 0.8,
      vitaminD: 0.2,
      vitaminB12: 0.6,
      folate: 23,
      vitaminA: 15,
      vitaminE: 1.6,
      potassium: 195,
      phosphorus: 145
    }
  },

  "curry_goat": {
    name: "Curry Goat",
    aliases: ["curry goat", "goat curry", "jamaican curry goat", "caribbean curry goat"],
    category: "caribbean_meat",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 265,
      protein: 28.5,
      carbs: 3.2,
      fat: 15.8,
      fiber: 0.8,
      sodium: 0.45,
      iron: 4.2,
      calcium: 22,
      zinc: 3.8,
      magnesium: 24,
      vitaminC: 2.5,
      vitaminD: 0.3,
      vitaminB12: 1.2,
      folate: 8,
      vitaminA: 0,
      vitaminE: 0.8,
      potassium: 385,
      phosphorus: 210
    }
  },

  "jerk_chicken": {
    name: "Jerk Chicken",
    aliases: ["jerk chicken", "jamaican jerk chicken", "caribbean jerk chicken"],
    category: "caribbean_meat",
    portionWeight: 180,
    nutritionPer100g: {
      calories: 242,
      protein: 26.8,
      carbs: 4.5,
      fat: 12.8,
      fiber: 0.5,
      sugar: 3.2,
      sodium: 0.58,
      iron: 1.8,
      calcium: 18,
      zinc: 2.1,
      magnesium: 28,
      vitaminC: 8.5,
      vitaminD: 0.2,
      vitaminB12: 0.4,
      folate: 12,
      vitaminA: 25,
      vitaminE: 1.2,
      potassium: 285,
      phosphorus: 195
    }
  },

  // Middle Eastern Foods
  "falafel": {
    name: "Falafel",
    aliases: ["falafel", "falafels", "chickpea fritters"],
    category: "middle_eastern",
    portionWeight: 17, // per piece
    nutritionPer100g: {
      calories: 333,
      protein: 13.3,
      carbs: 31.8,
      fat: 17.8,
      fiber: 4.9,
      sugar: 2.3,
      sodium: 0.58,
      iron: 3.4,
      calcium: 54,
      zinc: 1.5,
      magnesium: 82,
      vitaminC: 1.2,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 96,
      vitaminA: 8,
      vitaminE: 1.9,
      potassium: 585,
      phosphorus: 192
    }
  },

  "shawarma": {
    name: "Shawarma",
    aliases: ["shawarma", "shawerma", "chicken shawarma", "lamb shawarma"],
    category: "middle_eastern",
    portionWeight: 250,
    nutritionPer100g: {
      calories: 285,
      protein: 22.8,
      carbs: 18.5,
      fat: 14.2,
      fiber: 2.1,
      sugar: 2.8,
      sodium: 0.68,
      iron: 2.5,
      calcium: 85,
      zinc: 2.8,
      magnesium: 32,
      vitaminC: 5.2,
      vitaminD: 0.1,
      vitaminB12: 0.8,
      folate: 42,
      vitaminA: 18,
      vitaminE: 1.5,
      potassium: 295,
      phosphorus: 185
    }
  },

  // Asian Foods
  "chicken_teriyaki": {
    name: "Chicken Teriyaki",
    aliases: ["chicken teriyaki", "teriyaki chicken", "japanese chicken teriyaki"],
    category: "asian",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 195,
      protein: 23.2,
      carbs: 8.5,
      fat: 7.8,
      fiber: 0.2,
      sugar: 7.2,
      sodium: 0.85,
      iron: 1.2,
      calcium: 15,
      zinc: 1.8,
      magnesium: 25,
      vitaminC: 0.5,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 8,
      vitaminA: 12,
      vitaminE: 0.8,
      potassium: 285,
      phosphorus: 185
    }
  },

  // Mexican Foods
  "chicken_burrito": {
    name: "Chicken Burrito",
    aliases: ["chicken burrito", "burrito chicken", "burrito", "mexican burrito"],
    category: "mexican",
    portionWeight: 250,
    nutritionPer100g: {
      calories: 215,
      protein: 12.8,
      carbs: 22.5,
      fat: 8.8,
      fiber: 3.2,
      sugar: 2.1,
      sodium: 0.52,
      iron: 2.1,
      calcium: 95,
      zinc: 1.9,
      magnesium: 28,
      vitaminC: 3.8,
      vitaminD: 0.1,
      vitaminB12: 0.4,
      folate: 35,
      vitaminA: 22,
      vitaminE: 1.2,
      potassium: 245,
      phosphorus: 155
    }
  },

  // American/Fast Food Items
  "chicken_sandwich": {
    name: "Chicken Sandwich",
    aliases: ["chicken sandwich", "fried chicken sandwich", "chicken burger"],
    category: "american_fast_food",
    portionWeight: 195,
    nutritionPer100g: {
      calories: 265,
      protein: 16.8,
      carbs: 22.5,
      fat: 12.5,
      fiber: 2.8,
      sugar: 3.2,
      sodium: 0.65,
      iron: 2.2,
      calcium: 58,
      zinc: 1.8,
      magnesium: 22,
      vitaminC: 1.2,
      vitaminD: 0.1,
      vitaminB12: 0.4,
      folate: 28,
      vitaminA: 15,
      vitaminE: 1.5,
      potassium: 225,
      phosphorus: 165
    }
  },

  "fish_and_chips": {
    name: "Fish and Chips",
    aliases: ["fish and chips", "fish & chips", "battered fish chips", "fried fish chips"],
    category: "british",
    portionWeight: 320,
    nutritionPer100g: {
      calories: 232,
      protein: 15.8,
      carbs: 18.2,
      fat: 11.5,
      fiber: 1.8,
      sugar: 0.8,
      sodium: 0.42,
      iron: 1.5,
      calcium: 28,
      zinc: 1.2,
      magnesium: 35,
      vitaminC: 8.5,
      vitaminD: 2.8,
      vitaminB12: 1.8,
      folate: 18,
      vitaminA: 12,
      vitaminE: 2.2,
      potassium: 485,
      phosphorus: 195
    }
  },

  // Indian Foods
  "chicken_tikka_masala": {
    name: "Chicken Tikka Masala",
    aliases: ["chicken tikka masala", "tikka masala", "indian chicken curry"],
    category: "indian",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 185,
      protein: 18.5,
      carbs: 6.8,
      fat: 9.5,
      fiber: 1.2,
      sugar: 4.2,
      sodium: 0.58,
      iron: 2.8,
      calcium: 65,
      zinc: 2.2,
      magnesium: 25,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.5,
      folate: 15,
      vitaminA: 85,
      vitaminE: 1.8,
      potassium: 285,
      phosphorus: 175
    }
  },

  "butter_chicken": {
    name: "Butter Chicken",
    aliases: ["butter chicken", "murgh makhani", "indian butter chicken"],
    category: "indian",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 195,
      protein: 19.2,
      carbs: 7.5,
      fat: 11.8,
      fiber: 1.0,
      sugar: 5.8,
      sodium: 0.62,
      iron: 2.2,
      calcium: 58,
      zinc: 2.0,
      magnesium: 22,
      vitaminC: 6.2,
      vitaminD: 0.1,
      vitaminB12: 0.4,
      folate: 12,
      vitaminA: 95,
      vitaminE: 2.1,
      potassium: 295,
      phosphorus: 185
    }
  },

  "biryani": {
    name: "Chicken Biryani",
    aliases: ["biryani", "chicken biryani", "indian biryani", "basmati biryani"],
    category: "indian",
    portionWeight: 250,
    nutritionPer100g: {
      calories: 205,
      protein: 11.5,
      carbs: 28.5,
      fat: 6.8,
      fiber: 1.8,
      sugar: 2.1,
      sodium: 0.48,
      iron: 1.8,
      calcium: 35,
      zinc: 1.5,
      magnesium: 28,
      vitaminC: 2.5,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 18,
      vitaminA: 25,
      vitaminE: 1.2,
      potassium: 185,
      phosphorus: 145
    }
  },

  "samosa": {
    name: "Samosa",
    aliases: ["samosa", "samosas", "indian samosa", "vegetable samosa"],
    category: "indian",
    portionWeight: 45, // per piece
    nutritionPer100g: {
      calories: 308,
      protein: 6.8,
      carbs: 32.5,
      fat: 17.2,
      fiber: 3.2,
      sugar: 2.8,
      sodium: 0.55,
      iron: 2.8,
      calcium: 45,
      zinc: 1.2,
      magnesium: 35,
      vitaminC: 8.5,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 45,
      vitaminA: 85,
      vitaminE: 2.8,
      potassium: 285,
      phosphorus: 95
    }
  },

  // Thai Foods 
  "pad_thai": {
    name: "Pad Thai",
    aliases: ["pad thai", "thai noodles", "thai stir fry noodles", "pad thai noodles"],
    category: "thai",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 154,
      protein: 8.1,
      carbs: 14.4,
      fat: 2.1,
      fiber: 1.2,
      sugar: 4.1,
      sodium: 0.38,
      iron: 1.8,
      calcium: 32,
      zinc: 1.2,
      magnesium: 25,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.2,
      folate: 28,
      vitaminA: 45,
      vitaminE: 1.2,
      potassium: 185,
      phosphorus: 125
    },
    note: "Traditional Thai stir-fried rice noodles with tamarind sauce"
  },

  "green_curry": {
    name: "Thai Green Curry",
    aliases: ["green curry", "thai green curry", "gaeng keow wan", "green curry chicken"],
    category: "thai",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 165,
      protein: 14.8,
      carbs: 8.5,
      fat: 9.2,
      fiber: 2.1,
      sugar: 4.8,
      sodium: 0.68,
      iron: 2.5,
      calcium: 45,
      zinc: 1.8,
      magnesium: 32,
      vitaminC: 15.2,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 22,
      vitaminA: 125,
      vitaminE: 1.8,
      potassium: 385,
      phosphorus: 165
    }
  },

  "tom_yum": {
    name: "Tom Yum Soup",
    aliases: ["tom yum", "tom yum soup", "thai soup", "tom yum goong"],
    category: "thai",
    portionWeight: 300,
    nutritionPer100g: {
      calories: 85,
      protein: 8.5,
      carbs: 6.2,
      fat: 3.8,
      fiber: 1.2,
      sugar: 3.5,
      sodium: 0.85,
      iron: 1.2,
      calcium: 28,
      zinc: 1.1,
      magnesium: 18,
      vitaminC: 12.5,
      vitaminD: 0.2,
      vitaminB12: 0.8,
      folate: 15,
      vitaminA: 35,
      vitaminE: 0.8,
      potassium: 285,
      phosphorus: 125
    }
  },

  // Chinese Foods
  "fried_rice": {
    name: "Fried Rice",
    aliases: ["fried rice", "chinese fried rice", "chicken fried rice", "beef fried rice", "vegetable fried rice"],
    category: "chinese",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 175,
      protein: 5.8,
      carbs: 28.5,
      fat: 4.2,
      fiber: 1.8,
      sugar: 2.1,
      sodium: 0.45,
      iron: 1.5,
      calcium: 25,
      zinc: 1.1,
      magnesium: 22,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.1,
      folate: 18,
      vitaminA: 85,
      vitaminE: 1.2,
      potassium: 185,
      phosphorus: 95
    }
  },

  "general_tso_chicken": {
    name: "General Tso's Chicken",
    aliases: ["general tso chicken", "general tso's chicken", "chinese fried chicken"],
    category: "chinese",
    portionWeight: 180,
    nutritionPer100g: {
      calories: 295,
      protein: 18.5,
      carbs: 22.8,
      fat: 16.2,
      fiber: 1.5,
      sugar: 18.5,
      sodium: 0.78,
      iron: 1.8,
      calcium: 25,
      zinc: 1.9,
      magnesium: 22,
      vitaminC: 2.5,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 12,
      vitaminA: 15,
      vitaminE: 1.5,
      potassium: 245,
      phosphorus: 175
    }
  },

  "orange_chicken": {
    name: "Orange Chicken",
    aliases: ["orange chicken", "chinese orange chicken", "sweet orange chicken"],
    category: "chinese",
    portionWeight: 170,
    nutritionPer100g: {
      calories: 285,
      protein: 17.2,
      carbs: 24.5,
      fat: 14.8,
      fiber: 1.2,
      sugar: 20.5,
      sodium: 0.68,
      iron: 1.5,
      calcium: 22,
      zinc: 1.7,
      magnesium: 18,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 10,
      vitaminA: 25,
      vitaminE: 1.8,
      potassium: 225,
      phosphorus: 165
    }
  },

  "lo_mein": {
    name: "Lo Mein",
    aliases: ["lo mein", "chinese lo mein", "chicken lo mein", "beef lo mein"],
    category: "chinese",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 185,
      protein: 9.5,
      carbs: 28.5,
      fat: 4.8,
      fiber: 2.2,
      sugar: 3.8,
      sodium: 0.58,
      iron: 1.8,
      calcium: 32,
      zinc: 1.2,
      magnesium: 25,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.2,
      folate: 28,
      vitaminA: 45,
      vitaminE: 1.2,
      potassium: 185,
      phosphorus: 125
    }
  },

  "egg_roll": {
    name: "Egg Roll",
    aliases: ["egg roll", "egg rolls", "chinese egg roll", "spring roll"],
    category: "chinese",
    portionWeight: 85, // per piece
    nutritionPer100g: {
      calories: 245,
      protein: 8.2,
      carbs: 24.5,
      fat: 13.8,
      fiber: 2.8,
      sugar: 2.5,
      sodium: 0.65,
      iron: 1.8,
      calcium: 42,
      zinc: 1.2,
      magnesium: 18,
      vitaminC: 12.5,
      vitaminD: 0.1,
      vitaminB12: 0.1,
      folate: 25,
      vitaminA: 85,
      vitaminE: 2.1,
      potassium: 185,
      phosphorus: 95
    }
  },

  // Greek Foods
  "gyro": {
    name: "Gyro",
    aliases: ["gyro", "greek gyro", "lamb gyro", "chicken gyro"],
    category: "greek",
    portionWeight: 280,
    nutritionPer100g: {
      calories: 215,
      protein: 16.8,
      carbs: 15.2,
      fat: 11.5,
      fiber: 1.8,
      sugar: 2.5,
      sodium: 0.58,
      iron: 2.5,
      calcium: 125,
      zinc: 2.8,
      magnesium: 28,
      vitaminC: 5.2,
      vitaminD: 0.1,
      vitaminB12: 1.2,
      folate: 25,
      vitaminA: 18,
      vitaminE: 1.8,
      potassium: 285,
      phosphorus: 185
    }
  },

  "moussaka": {
    name: "Moussaka",
    aliases: ["moussaka", "greek moussaka", "eggplant moussaka"],
    category: "greek",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 195,
      protein: 12.5,
      carbs: 8.5,
      fat: 13.8,
      fiber: 2.8,
      sugar: 5.2,
      sodium: 0.48,
      iron: 2.2,
      calcium: 185,
      zinc: 2.1,
      magnesium: 32,
      vitaminC: 8.5,
      vitaminD: 0.2,
      vitaminB12: 0.8,
      folate: 28,
      vitaminA: 125,
      vitaminE: 2.8,
      potassium: 385,
      phosphorus: 165
    }
  },

  // Italian Foods
  "lasagna": {
    name: "Lasagna",
    aliases: ["lasagna", "lasagne", "meat lasagna", "cheese lasagna"],
    category: "italian",
    portionWeight: 220,
    nutritionPer100g: {
      calories: 185,
      protein: 12.8,
      carbs: 18.5,
      fat: 8.2,
      fiber: 2.1,
      sugar: 4.8,
      sodium: 0.58,
      iron: 2.1,
      calcium: 185,
      zinc: 1.8,
      magnesium: 22,
      vitaminC: 5.2,
      vitaminD: 0.1,
      vitaminB12: 0.8,
      folate: 25,
      vitaminA: 85,
      vitaminE: 1.5,
      potassium: 285,
      phosphorus: 185
    }
  },

  "chicken_parmigiana": {
    name: "Chicken Parmigiana",
    aliases: ["chicken parmigiana", "chicken parmesan", "chicken parm"],
    category: "italian",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 235,
      protein: 22.5,
      carbs: 12.8,
      fat: 12.2,
      fiber: 1.8,
      sugar: 4.2,
      sodium: 0.68,
      iron: 1.8,
      calcium: 185,
      zinc: 2.1,
      magnesium: 25,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.8,
      folate: 18,
      vitaminA: 95,
      vitaminE: 1.8,
      potassium: 345,
      phosphorus: 225
    }
  },

  "risotto": {
    name: "Risotto",
    aliases: ["risotto", "mushroom risotto", "seafood risotto"],
    category: "italian",
    portionWeight: 180,
    nutritionPer100g: {
      calories: 165,
      protein: 5.8,
      carbs: 28.5,
      fat: 3.8,
      fiber: 1.2,
      sugar: 2.1,
      sodium: 0.45,
      iron: 1.2,
      calcium: 85,
      zinc: 1.1,
      magnesium: 22,
      vitaminC: 2.5,
      vitaminD: 0.1,
      vitaminB12: 0.2,
      folate: 18,
      vitaminA: 25,
      vitaminE: 0.8,
      potassium: 185,
      phosphorus: 125
    }
  },

  // Korean Foods
  "bulgogi": {
    name: "Bulgogi",
    aliases: ["bulgogi", "korean bbq", "korean beef", "marinated beef"],
    category: "korean",
    portionWeight: 150,
    nutritionPer100g: {
      calories: 195,
      protein: 22.8,
      carbs: 8.5,
      fat: 8.2,
      fiber: 0.5,
      sugar: 6.8,
      sodium: 0.78,
      iron: 2.8,
      calcium: 18,
      zinc: 3.2,
      magnesium: 22,
      vitaminC: 2.5,
      vitaminD: 0.1,
      vitaminB12: 1.2,
      folate: 8,
      vitaminA: 5,
      vitaminE: 0.8,
      potassium: 285,
      phosphorus: 195
    }
  },

  "bibimbap": {
    name: "Bibimbap",
    aliases: ["bibimbap", "korean mixed rice", "korean bowl"],
    category: "korean",
    portionWeight: 300,
    nutritionPer100g: {
      calories: 155,
      protein: 8.5,
      carbs: 22.5,
      fat: 4.8,
      fiber: 3.2,
      sugar: 4.2,
      sodium: 0.58,
      iron: 2.1,
      calcium: 65,
      zinc: 1.5,
      magnesium: 28,
      vitaminC: 18.5,
      vitaminD: 0.2,
      vitaminB12: 0.3,
      folate: 85,
      vitaminA: 185,
      vitaminE: 2.8,
      potassium: 385,
      phosphorus: 125
    }
  },

  // Vietnamese Foods
  "pho": {
    name: "Pho",
    aliases: ["pho", "vietnamese pho", "pho bo", "beef pho"],
    category: "vietnamese",
    portionWeight: 400,
    nutritionPer100g: {
      calories: 85,
      protein: 6.8,
      carbs: 12.5,
      fat: 1.5,
      fiber: 0.8,
      sugar: 2.1,
      sodium: 0.68,
      iron: 1.2,
      calcium: 18,
      zinc: 1.1,
      magnesium: 15,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.3,
      folate: 15,
      vitaminA: 25,
      vitaminE: 0.5,
      potassium: 185,
      phosphorus: 95
    }
  },

  "banh_mi": {
    name: "Banh Mi",
    aliases: ["banh mi", "vietnamese sandwich", "pork banh mi"],
    category: "vietnamese",
    portionWeight: 220,
    nutritionPer100g: {
      calories: 225,
      protein: 12.8,
      carbs: 28.5,
      fat: 8.2,
      fiber: 2.8,
      sugar: 3.5,
      sodium: 0.68,
      iron: 2.1,
      calcium: 58,
      zinc: 1.8,
      magnesium: 22,
      vitaminC: 15.2,
      vitaminD: 0.1,
      vitaminB12: 0.4,
      folate: 28,
      vitaminA: 85,
      vitaminE: 1.5,
      potassium: 245,
      phosphorus: 145
    }
  },

  // IKEA and Swedish Foods
  "ikea_swedish_meatballs_with_mash": {
    name: "IKEA Swedish Meatballs with Mash",
    aliases: ["ikea swedish meatballs with mash", "swedish meatballs with mash", "ikea meatballs with mashed potatoes", "ikea meatballs mash", "swedish meatballs mashed potatoes"],
    category: "swedish",
    portionWeight: 300, // typical plate serving
    nutritionPer100g: {
      calories: 180,
      protein: 12.5,
      carbs: 15.2, // Significant carbs from mashed potatoes
      fat: 8.5,
      fiber: 1.2,
      sugar: 2.8,
      sodium: 0.65,
      iron: 1.8,
      calcium: 45,
      zinc: 1.6,
      magnesium: 22,
      vitaminC: 8.5,
      vitaminD: 0.1,
      vitaminB12: 0.5,
      folate: 18,
      vitaminA: 12,
      vitaminE: 1.2,
      potassium: 285,
      phosphorus: 125
    },
    note: "Swedish meatballs served with mashed potatoes - composite dish with meat and potato carbohydrates"
  },

  // Breakfast Foods
  "pancakes": {
    name: "Pancakes",
    aliases: ["pancakes", "pancake", "buttermilk pancakes", "stack of pancakes"],
    category: "breakfast",
    portionWeight: 150, // 3 medium pancakes
    nutritionPer100g: {
      calories: 225,
      protein: 6.2,
      carbs: 28.5,
      fat: 9.8,
      fiber: 1.2,
      sugar: 6.8,
      sodium: 0.58,
      iron: 1.8,
      calcium: 125,
      zinc: 0.8,
      magnesium: 18,
      vitaminC: 0.5,
      vitaminD: 0.2,
      vitaminB12: 0.3,
      folate: 28,
      vitaminA: 95,
      vitaminE: 1.2,
      potassium: 185,
      phosphorus: 185
    }
  },

  "french_toast": {
    name: "French Toast",
    aliases: ["french toast", "french toast sticks", "cinnamon french toast"],
    category: "breakfast",
    portionWeight: 120, // 2 slices
    nutritionPer100g: {
      calories: 255,
      protein: 8.5,
      carbs: 32.5,
      fat: 11.2,
      fiber: 1.8,
      sugar: 8.5,
      sodium: 0.48,
      iron: 2.1,
      calcium: 85,
      zinc: 1.1,
      magnesium: 18,
      vitaminC: 0.5,
      vitaminD: 0.8,
      vitaminB12: 0.8,
      folate: 35,
      vitaminA: 125,
      vitaminE: 1.8,
      potassium: 185,
      phosphorus: 165
    }
  },

  "omelet": {
    name: "Omelet",
    aliases: ["omelet", "omelette", "cheese omelet", "veggie omelet"],
    category: "breakfast",
    portionWeight: 150,
    nutritionPer100g: {
      calories: 185,
      protein: 12.8,
      carbs: 2.1,
      fat: 14.2,
      fiber: 0.5,
      sugar: 1.8,
      sodium: 0.48,
      iron: 1.8,
      calcium: 125,
      zinc: 1.5,
      magnesium: 12,
      vitaminC: 2.5,
      vitaminD: 1.2,
      vitaminB12: 1.8,
      folate: 45,
      vitaminA: 185,
      vitaminE: 1.8,
      potassium: 185,
      phosphorus: 195
    }
  },

  "breakfast_burrito": {
    name: "Breakfast Burrito",
    aliases: ["breakfast burrito", "morning burrito", "egg burrito"],
    category: "breakfast",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 195,
      protein: 11.5,
      carbs: 18.5,
      fat: 9.8,
      fiber: 2.8,
      sugar: 2.1,
      sodium: 0.58,
      iron: 2.1,
      calcium: 85,
      zinc: 1.5,
      magnesium: 22,
      vitaminC: 5.2,
      vitaminD: 0.8,
      vitaminB12: 0.8,
      folate: 35,
      vitaminA: 125,
      vitaminE: 1.5,
      potassium: 245,
      phosphorus: 165
    }
  },

  // Vegetarian/Vegan Foods
  "buddha_bowl": {
    name: "Buddha Bowl",
    aliases: ["buddha bowl", "grain bowl", "veggie bowl", "quinoa bowl"],
    category: "vegetarian",
    portionWeight: 300,
    nutritionPer100g: {
      calories: 135,
      protein: 5.8,
      carbs: 22.5,
      fat: 3.8,
      fiber: 5.2,
      sugar: 4.8,
      sodium: 0.25,
      iron: 2.8,
      calcium: 85,
      zinc: 1.5,
      magnesium: 85,
      vitaminC: 25.5,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 125,
      vitaminA: 285,
      vitaminE: 3.2,
      potassium: 485,
      phosphorus: 185
    }
  },

  "veggie_burger": {
    name: "Veggie Burger",
    aliases: ["veggie burger", "vegetarian burger", "plant burger", "black bean burger"],
    category: "vegetarian",
    portionWeight: 120,
    nutritionPer100g: {
      calories: 185,
      protein: 12.5,
      carbs: 18.5,
      fat: 8.2,
      fiber: 6.8,
      sugar: 2.8,
      sodium: 0.68,
      iron: 3.2,
      calcium: 85,
      zinc: 2.1,
      magnesium: 65,
      vitaminC: 5.2,
      vitaminD: 0,
      vitaminB12: 0.8,
      folate: 85,
      vitaminA: 25,
      vitaminE: 2.8,
      potassium: 385,
      phosphorus: 185
    }
  },

  // African Foods
  "jollof_rice": {
    name: "Jollof Rice",
    aliases: ["jollof rice", "west african rice", "nigerian jollof"],
    category: "african",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 165,
      protein: 4.8,
      carbs: 32.5,
      fat: 2.8,
      fiber: 1.8,
      sugar: 3.2,
      sodium: 0.45,
      iron: 1.8,
      calcium: 25,
      zinc: 1.1,
      magnesium: 28,
      vitaminC: 18.5,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 18,
      vitaminA: 125,
      vitaminE: 1.2,
      potassium: 185,
      phosphorus: 95
    }
  },

  // Mixed Protein/Carb/Fat Dishes
  "beef_broccoli_stir_fry": {
    name: "Beef and Broccoli Stir Fry",
    aliases: [
      "beef and broccoli", "beef broccoli stir fry", "beef with broccoli",
      "chinese beef and broccoli", "stir fried beef and broccoli"
    ],
    category: "chinese",
    portionWeight: 300,
    nutritionPer100g: {
      calories: 155,
      protein: 18.5, // from beef
      carbs: 8.2,    // from broccoli + sauce
      fat: 6.8,      // from cooking oil + beef fat
      fiber: 2.8,
      sugar: 3.1,
      sodium: 0.65,
      iron: 2.5,
      calcium: 42,
      zinc: 2.8,
      magnesium: 25,
      vitaminC: 65,  // from broccoli
      vitaminD: 0.1,
      vitaminB12: 1.2, // from beef
      folate: 28,
      vitaminA: 85,
      vitaminE: 1.8,
      potassium: 385,
      phosphorus: 185
    },
    note: "Beef strips with broccoli in savory sauce - balanced protein and vegetables"
  },

  "chicken_alfredo_pasta": {
    name: "Chicken Alfredo Pasta",
    aliases: [
      "chicken alfredo", "fettuccine alfredo with chicken", "chicken pasta alfredo",
      "alfredo chicken", "creamy chicken pasta"
    ],
    category: "italian",
    portionWeight: 280,
    nutritionPer100g: {
      calories: 285,
      protein: 18.2, // from chicken
      carbs: 22.5,   // from pasta
      fat: 15.8,     // from cream sauce and cheese
      fiber: 1.5,
      sugar: 2.8,
      sodium: 0.68,
      iron: 1.2,
      calcium: 185,  // from parmesan and cream
      zinc: 1.8,
      magnesium: 22,
      vitaminC: 1.2,
      vitaminD: 0.8, // from cream
      vitaminB12: 0.6,
      folate: 25,
      vitaminA: 125, // from cream and cheese
      vitaminE: 1.5,
      potassium: 225,
      phosphorus: 195
    },
    note: "Pasta with grilled chicken in rich cream sauce - high protein, carbs, and dairy fats"
  },

  "tuna_sandwich": {
    name: "Tuna Sandwich",
    aliases: [
      "tuna sandwich", "tuna salad sandwich", "tuna sub", "tuna on bread"
    ],
    category: "american",
    portionWeight: 180,
    nutritionPer100g: {
      calories: 225,
      protein: 18.5, // from tuna
      carbs: 22.8,   // from bread
      fat: 8.2,      // from mayo/dressing
      fiber: 2.8,
      sugar: 3.1,
      sodium: 0.58,
      iron: 1.8,
      calcium: 85,   // from bread fortification
      zinc: 1.2,
      magnesium: 22,
      vitaminC: 2.5,
      vitaminD: 1.8, // from tuna
      vitaminB12: 2.8, // from tuna
      folate: 45,    // from fortified bread
      vitaminA: 15,
      vitaminE: 2.2,
      potassium: 285,
      phosphorus: 185
    },
    note: "Tuna salad on bread - complete protein with complex carbohydrates"
  },

  "chicken_quesadilla": {
    name: "Chicken Quesadilla",
    aliases: [
      "chicken quesadilla", "quesadilla with chicken", "grilled chicken quesadilla"
    ],
    category: "mexican",
    portionWeight: 200,
    nutritionPer100g: {
      calories: 268,
      protein: 19.8, // from chicken and cheese
      carbs: 18.5,   // from tortilla
      fat: 13.5,     // from cheese and cooking oil
      fiber: 2.2,
      sugar: 1.8,
      sodium: 0.62,
      iron: 1.5,
      calcium: 285,  // from cheese
      zinc: 2.2,
      magnesium: 18,
      vitaminC: 1.5,
      vitaminD: 0.3,
      vitaminB12: 0.8,
      folate: 22,
      vitaminA: 95,  // from cheese
      vitaminE: 1.2,
      potassium: 225,
      phosphorus: 285
    },
    note: "Grilled chicken and cheese in flour tortilla - balanced protein, carbs, and dairy fats"
  },

  "beef_tacos": {
    name: "Beef Tacos",
    aliases: [
      "beef tacos", "ground beef tacos", "hard shell tacos", "soft tacos beef"
    ],
    category: "mexican",
    portionWeight: 85, // per taco
    nutritionPer100g: {
      calories: 245,
      protein: 15.8, // from ground beef
      carbs: 18.2,   // from tortilla/taco shell
      fat: 12.5,     // from beef and cheese
      fiber: 2.8,
      sugar: 2.1,
      sodium: 0.48,
      iron: 2.2,
      calcium: 125,  // from cheese and fortified tortilla
      zinc: 2.8,
      magnesium: 25,
      vitaminC: 8.5, // from lettuce/tomato
      vitaminD: 0.1,
      vitaminB12: 1.1, // from beef
      folate: 28,
      vitaminA: 85,  // from vegetables
      vitaminE: 1.8,
      potassium: 285,
      phosphorus: 165
    },
    note: "Ground beef in corn/flour shell with toppings - complete balanced meal"
  },

  "protein_quinoa_bowl": {
    name: "Protein Quinoa Bowl",
    aliases: [
      "quinoa bowl", "protein bowl", "quinoa power bowl", "chicken quinoa bowl"
    ],
    category: "healthy",
    portionWeight: 350,
    nutritionPer100g: {
      calories: 185,
      protein: 16.5, // from quinoa + chicken/protein
      carbs: 22.8,   // from quinoa
      fat: 5.8,      // from quinoa + dressing
      fiber: 4.2,
      sugar: 3.5,
      sodium: 0.25,
      iron: 2.8,
      calcium: 45,
      zinc: 1.8,
      magnesium: 85, // from quinoa
      vitaminC: 25,  // from vegetables
      vitaminD: 0.2,
      vitaminB12: 0.6,
      folate: 45,    // from quinoa
      vitaminA: 185, // from mixed vegetables
      vitaminE: 2.2,
      potassium: 385,
      phosphorus: 225
    },
    note: "Complete protein quinoa with vegetables - all essential amino acids"
  },

  "caesar_salad_chicken": {
    name: "Caesar Salad with Chicken",
    aliases: [
      "chicken caesar salad", "caesar salad with chicken", "grilled chicken caesar"
    ],
    category: "american",
    portionWeight: 250,
    nutritionPer100g: {
      calories: 195,
      protein: 18.5, // from chicken
      carbs: 6.8,    // from croutons + minimal from lettuce
      fat: 12.5,     // from dressing and parmesan
      fiber: 2.2,
      sugar: 2.8,
      sodium: 0.68,
      iron: 1.5,
      calcium: 185,  // from parmesan
      zinc: 1.8,
      magnesium: 18,
      vitaminC: 15,  // from romaine
      vitaminD: 0.2,
      vitaminB12: 0.8,
      folate: 35,    // from romaine
      vitaminA: 285, // from romaine
      vitaminE: 2.8,
      potassium: 285,
      phosphorus: 195
    },
    note: "Grilled chicken on romaine with creamy dressing - high protein, moderate fats"
  },

  "fried_fish_vegetables": {
    name: "Fried Fish with Vegetables",
    aliases: [
      "fried fish with vegetables", "fish and vegetables", "fried fish and veggies",
      "battered fish with vegetables", "fish vegetable combo"
    ],
    category: "seafood",
    portionWeight: 280,
    nutritionPer100g: {
      calories: 185,
      protein: 17.2, // from fish
      carbs: 9.8,    // from mixed vegetables
      fat: 9.5,      // from frying oil
      fiber: 3.2,
      sugar: 4.8,
      sodium: 0.38,
      iron: 1.8,
      calcium: 45,
      zinc: 1.4,
      magnesium: 42,
      vitaminC: 35,  // from mixed vegetables
      vitaminD: 3.2, // from fish
      vitaminB12: 2.1, // from fish
      folate: 28,
      vitaminA: 185, // from vegetables
      vitaminE: 2.8,
      potassium: 445,
      phosphorus: 225
    },
    note: "Battered fish with mixed vegetables - high protein from fish, vitamins from vegetables"
  },

  "salmon_garlic_butter_vegetables": {
    name: "Salmon in Garlic Butter Sauce with Vegetables",
    aliases: [
      "salmon in garlic butter sauce with vegetables", "salmon garlic butter vegetables",
      "garlic butter salmon with vegetables", "salmon with garlic butter and vegetables",
      "butter salmon vegetables", "garlic salmon vegetables"
    ],
    category: "seafood",
    portionWeight: 320,
    nutritionPer100g: {
      calories: 215,
      protein: 22.8, // from salmon - high quality protein
      carbs: 8.5,    // from vegetables
      fat: 11.2,     // from salmon omega-3s + butter sauce
      fiber: 2.8,
      sugar: 4.2,
      sodium: 0.45,
      iron: 1.2,
      calcium: 38,
      zinc: 1.8,
      magnesium: 35,
      vitaminC: 28,  // from vegetables
      vitaminD: 8.5, // very high from salmon
      vitaminB12: 3.8, // very high from salmon
      folate: 32,
      vitaminA: 145, // from vegetables + salmon
      vitaminE: 4.2, // from salmon oils
      potassium: 485,
      phosphorus: 285
    },
    note: "Premium salmon with garlic butter and vegetables - rich in omega-3s and vitamin D"
  },

  "roast_snapper_vegetables": {
    name: "Roast Snapper with Vegetables",
    aliases: [
      "roast snapper with vegetables", "roasted snapper vegetables", "snapper with vegetables",
      "baked snapper vegetables", "grilled snapper with vegetables", "snapper and vegetables"
    ],
    category: "seafood",
    portionWeight: 300,
    nutritionPer100g: {
      calories: 165,
      protein: 20.5, // from snapper - lean white fish
      carbs: 7.8,    // from roasted vegetables
      fat: 5.2,      // from fish + light roasting oils
      fiber: 3.5,
      sugar: 4.8,
      sodium: 0.28,
      iron: 1.5,
      calcium: 45,
      zinc: 1.6,
      magnesium: 38,
      vitaminC: 25,  // from roasted vegetables
      vitaminD: 2.8, // from snapper
      vitaminB12: 2.5, // from snapper
      folate: 35,
      vitaminA: 165, // from colorful vegetables
      vitaminE: 2.5,
      potassium: 425,
      phosphorus: 245
    },
    note: "Lean white fish with roasted vegetables - high protein, low fat, vitamin-rich"
  },

  "grilled_fish_mediterranean": {
    name: "Grilled Fish Mediterranean Style",
    aliases: [
      "grilled fish mediterranean", "mediterranean fish", "fish with tomatoes and olives",
      "mediterranean grilled fish", "fish mediterranean vegetables"
    ],
    category: "seafood",
    portionWeight: 280,
    nutritionPer100g: {
      calories: 195,
      protein: 19.5, // from fish
      carbs: 8.8,    // from tomatoes, vegetables
      fat: 8.5,      // from olive oil + fish
      fiber: 2.8,
      sugar: 5.2,
      sodium: 0.35,
      iron: 1.8,
      calcium: 55,
      zinc: 1.4,
      magnesium: 42,
      vitaminC: 18,  // from tomatoes
      vitaminD: 3.5, // from fish
      vitaminB12: 2.8, // from fish
      folate: 25,
      vitaminA: 125, // from vegetables
      vitaminE: 3.8, // from olive oil
      potassium: 385,
      phosphorus: 225
    },
    note: "Mediterranean-style grilled fish with tomatoes and olive oil - heart-healthy"
  },

  "fish_curry_vegetables": {
    name: "Fish Curry with Vegetables",
    aliases: [
      "fish curry with vegetables", "curry fish vegetables", "fish curry and vegetables",
      "vegetable fish curry", "fish vegetable curry"
    ],
    category: "seafood",
    portionWeight: 350,
    nutritionPer100g: {
      calories: 145,
      protein: 16.8, // from fish
      carbs: 9.2,    // from vegetables + curry spices
      fat: 5.8,      // from coconut milk/oil in curry
      fiber: 2.5,
      sugar: 4.5,
      sodium: 0.48,
      iron: 2.2,
      calcium: 65,
      zinc: 1.6,
      magnesium: 35,
      vitaminC: 22,  // from vegetables
      vitaminD: 2.8, // from fish
      vitaminB12: 2.2, // from fish
      folate: 28,
      vitaminA: 185, // from curry spices + vegetables
      vitaminE: 2.2,
      potassium: 395,
      phosphorus: 195
    },
    note: "Spiced fish curry with mixed vegetables - anti-inflammatory spices with lean protein"
  },

  // Snack Foods
  "utz_potato_chips": {
    name: "Utz Potato Chips",
    aliases: [
      "utz potato chips", "utz chips", "utz regular chips", "utz original chips"
    ],
    category: "snacks",
    portionWeight: 28, // 1 oz serving
    nutritionPer100g: {
      calories: 536,
      protein: 7.0,   // from potatoes
      carbs: 53.0,    // from potatoes (starch)
      fat: 32.0,      // from frying oil
      fiber: 4.8,
      sugar: 0.5,
      sodium: 1.07,   // added salt
      iron: 1.7,
      calcium: 34,
      zinc: 0.9,
      magnesium: 37,
      vitaminC: 16,   // from potatoes
      vitaminD: 0,
      vitaminB12: 0,
      folate: 47,
      vitaminA: 16,
      vitaminE: 3.2,  // from frying oil
      potassium: 804, // from potatoes
      phosphorus: 106
    },
    note: "Classic salted potato chips - high carbs and fats from potatoes and oil"
  },

  "doritos_nacho_cheese": {
    name: "Doritos Nacho Cheese",
    aliases: [
      "doritos nacho cheese", "doritos", "nacho cheese doritos", "doritos chips"
    ],
    category: "snacks",
    portionWeight: 28, // 1 oz serving
    nutritionPer100g: {
      calories: 500,
      protein: 7.5,   // from corn + cheese powder
      carbs: 58.0,    // from corn
      fat: 26.0,      // from oils + cheese
      fiber: 3.6,
      sugar: 1.8,
      sodium: 1.34,   // high sodium from seasoning
      iron: 1.3,
      calcium: 89,    // from cheese powder
      zinc: 0.7,
      magnesium: 54,
      vitaminC: 0,
      vitaminD: 0,
      vitaminB12: 0.1,
      folate: 36,
      vitaminA: 54,   // from cheese powder
      vitaminE: 2.8,
      potassium: 350,
      phosphorus: 168
    },
    note: "Corn tortilla chips with nacho cheese seasoning - high sodium and artificial flavors"
  },

  "cheetos_crunchy": {
    name: "Cheetos Crunchy",
    aliases: [
      "cheetos crunchy", "cheetos", "crunchy cheetos", "cheese puffs"
    ],
    category: "snacks",
    portionWeight: 28, // 1 oz serving  
    nutritionPer100g: {
      calories: 571,
      protein: 8.9,   // from corn + cheese
      carbs: 57.0,    // from corn meal
      fat: 35.7,      // from oils + cheese
      fiber: 3.6,
      sugar: 3.6,
      sodium: 1.25,   // high sodium
      iron: 1.8,
      calcium: 71,    // from cheese powder
      zinc: 1.1,
      magnesium: 36,
      vitaminC: 0,
      vitaminD: 0,
      vitaminB12: 0.1,
      folate: 25,
      vitaminA: 89,   // from cheese powder coloring
      vitaminE: 3.6,
      potassium: 286,
      phosphorus: 143
    },
    note: "Extruded corn snack with cheese coating - very high fat and sodium content"
  },

  "pretzels_salted": {
    name: "Salted Pretzels",
    aliases: [
      "pretzels", "salted pretzels", "pretzel sticks", "twisted pretzels"
    ],
    category: "snacks",
    portionWeight: 30, // ~1 oz serving
    nutritionPer100g: {
      calories: 380,
      protein: 10.4,  // from wheat flour
      carbs: 79.2,    // from wheat flour (high carb snack)
      fat: 3.1,       // minimal fat
      fiber: 2.9,
      sugar: 1.7,
      sodium: 1.63,   // very high sodium from salt coating
      iron: 3.6,
      calcium: 26,
      zinc: 0.9,
      magnesium: 22,
      vitaminC: 0,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 88,     // from fortified flour
      vitaminA: 0,
      vitaminE: 0.4,
      potassium: 130,
      phosphorus: 87
    },
    note: "Baked wheat snack with salt coating - lower fat but very high sodium"
  }
};

/**
 * Find enhanced food data by name or alias with improved pattern matching
 */
export function findEnhancedFood(foodName: string): EnhancedFoodEntry | null {
  const normalized = foodName.toLowerCase().trim();
  
  // Phase 1: Direct key match first
  for (const [key, food] of Object.entries(ENHANCED_FOOD_DATABASE)) {
    if (normalized.includes(key.replace(/_/g, ' '))) {
      return food;
    }
  }
  
  // Phase 1: Exact alias matching (highest priority)
  for (const food of Object.values(ENHANCED_FOOD_DATABASE)) {
    for (const alias of food.aliases) {
      if (normalized === alias || normalized.includes(alias)) {
        return food;
      }
    }
  }
  
  // Phase 1: Partial alias matching with word boundaries
  for (const food of Object.values(ENHANCED_FOOD_DATABASE)) {
    for (const alias of food.aliases) {
      const aliasWords = alias.split(' ');
      const normalizedWords = normalized.split(' ');
      
      // Check if all alias words are present in the search term
      if (aliasWords.every(word => normalizedWords.some(nWord => nWord.includes(word)))) {
        return food;
      }
    }
  }
  
  // Phase 1: Common pattern matching for better USDA integration
  const patterns = [
    // Thai patterns
    { pattern: /pad\s*thai/i, key: 'pad_thai' },
    { pattern: /green\s*curry/i, key: 'green_curry' },
    { pattern: /tom\s*yum/i, key: 'tom_yum' },
    
    // Chinese patterns  
    { pattern: /fried\s*rice/i, key: 'fried_rice' },
    { pattern: /general\s*tso/i, key: 'general_tso_chicken' },
    { pattern: /orange\s*chicken/i, key: 'orange_chicken' },
    { pattern: /lo\s*mein/i, key: 'lo_mein' },
    { pattern: /egg\s*roll/i, key: 'egg_roll' },
    
    // Greek patterns
    { pattern: /gyro/i, key: 'gyro' },
    { pattern: /moussaka/i, key: 'moussaka' },
    
    // Breakfast patterns
    { pattern: /pancake/i, key: 'pancakes' },
    { pattern: /french\s*toast/i, key: 'french_toast' },
    { pattern: /omelet|omelette/i, key: 'omelet' },
    
    // Caribbean patterns
    { pattern: /(jamaican|caribbean).*beef.*patty/i, key: 'jamaican_beef_patty' },
    { pattern: /jerk\s*chicken/i, key: 'jerk_chicken' },
    
    // Indian patterns
    { pattern: /butter\s*chicken/i, key: 'butter_chicken' },
    { pattern: /biryani/i, key: 'biryani' },
    { pattern: /samosa/i, key: 'samosa' },
    
    // Korean patterns
    { pattern: /bulgogi/i, key: 'bulgogi' },
    { pattern: /bibimbap/i, key: 'bibimbap' },
    
    // Vietnamese patterns
    { pattern: /pho/i, key: 'pho' },
    { pattern: /banh\s*mi/i, key: 'banh_mi' },
    
    // Italian patterns
    { pattern: /lasagna|lasagne/i, key: 'lasagna' },
    { pattern: /chicken\s*parm/i, key: 'chicken_parmigiana' },
    { pattern: /risotto/i, key: 'risotto' },
    
    // African patterns
    { pattern: /jollof\s*rice/i, key: 'jollof_rice' },
    
    // Mixed Seafood Dishes patterns - most specific first
    { pattern: /salmon.*garlic.*butter.*vegetable|salmon.*butter.*vegetable/i, key: 'salmon_garlic_butter_vegetables' },
    { pattern: /roast.*snapper.*vegetable|snapper.*vegetable/i, key: 'roast_snapper_vegetables' },
    { pattern: /grilled.*fish.*mediterranean|mediterranean.*grilled.*fish/i, key: 'grilled_fish_mediterranean' },
    { pattern: /fish.*curry.*vegetable|curry.*fish.*vegetable/i, key: 'fish_curry_vegetables' },
    { pattern: /fried.*fish.*(vegetable|veggies)|fish.*(vegetable|veggies)/i, key: 'fried_fish_vegetables' },
    
    // Snack Food patterns
    { pattern: /utz.*potato.*chip|utz.*chip/i, key: 'utz_potato_chips' },
    { pattern: /doritos.*nacho|nacho.*doritos/i, key: 'doritos_nacho_cheese' },
    { pattern: /cheetos.*crunchy|crunchy.*cheetos/i, key: 'cheetos_crunchy' },
    { pattern: /salted.*pretzel|pretzel.*salted/i, key: 'pretzels_salted' },
    { pattern: /beef.*broccoli|broccoli.*beef/i, key: 'beef_broccoli_stir_fry' },
    { pattern: /chicken.*alfredo|alfredo.*chicken/i, key: 'chicken_alfredo_pasta' },
    { pattern: /tuna.*sandwich|sandwich.*tuna/i, key: 'tuna_sandwich' },
    { pattern: /chicken.*quesadilla|quesadilla.*chicken/i, key: 'chicken_quesadilla' },
    { pattern: /beef.*taco|taco.*beef/i, key: 'beef_tacos' },
    { pattern: /quinoa.*bowl|protein.*bowl/i, key: 'protein_quinoa_bowl' },
    { pattern: /caesar.*salad.*chicken|chicken.*caesar/i, key: 'caesar_salad_chicken' }
  ];
  
  for (const { pattern, key } of patterns) {
    if (pattern.test(normalized)) {
      return ENHANCED_FOOD_DATABASE[key] || null;
    }
  }
  
  return null;
}

/**
 * Get category-specific nutrient multipliers for better estimates
 */
export function getCategoryNutrientProfile(category: string): Partial<EnhancedFoodEntry['nutritionPer100g']> {
  const profiles: Record<string, Partial<EnhancedFoodEntry['nutritionPer100g']>> = {
    'caribbean_pastry': {
      calories: 310,
      protein: 12.0,
      carbs: 28.0,
      fat: 17.0,
      iron: 2.5,
      calcium: 45,
      zinc: 2.0
    },
    'caribbean_meat': {
      calories: 245,
      protein: 26.0,
      carbs: 4.0,
      fat: 13.0,
      iron: 2.8,
      calcium: 20,
      zinc: 2.5
    },
    'middle_eastern': {
      calories: 280,
      protein: 15.0,
      carbs: 25.0,
      fat: 14.0,
      iron: 2.8,
      calcium: 60,
      zinc: 2.2
    },
    'mexican': {
      calories: 220,
      protein: 13.0,
      carbs: 24.0,
      fat: 9.0,
      iron: 2.0,
      calcium: 85,
      zinc: 1.8
    },
    'asian': {
      calories: 200,
      protein: 20.0,
      carbs: 12.0,
      fat: 8.0,
      iron: 1.5,
      calcium: 25,
      zinc: 1.5
    },
    'thai': {
      calories: 155,
      protein: 12.0,
      carbs: 15.0,
      fat: 6.0,
      iron: 1.8,
      calcium: 35,
      zinc: 1.4
    },
    'chinese': {
      calories: 220,
      protein: 14.0,
      carbs: 22.0,
      fat: 9.0,
      iron: 1.6,
      calcium: 30,
      zinc: 1.5
    },
    'korean': {
      calories: 175,
      protein: 16.0,
      carbs: 15.0,
      fat: 6.5,
      iron: 2.0,
      calcium: 40,
      zinc: 2.0
    },
    'vietnamese': {
      calories: 155,
      protein: 10.0,
      carbs: 20.0,
      fat: 5.0,
      iron: 1.6,
      calcium: 38,
      zinc: 1.3
    },
    'greek': {
      calories: 205,
      protein: 14.5,
      carbs: 12.0,
      fat: 12.5,
      iron: 2.3,
      calcium: 155,
      zinc: 2.4
    },
    'italian': {
      calories: 195,
      protein: 14.0,
      carbs: 20.0,
      fat: 8.0,
      iron: 1.8,
      calcium: 150,
      zinc: 1.6
    },
    'indian': {
      calories: 195,
      protein: 15.0,
      carbs: 15.0,
      fat: 9.0,
      iron: 2.4,
      calcium: 65,
      zinc: 1.8
    },
    'breakfast': {
      calories: 220,
      protein: 9.0,
      carbs: 25.0,
      fat: 10.0,
      iron: 1.8,
      calcium: 105,
      zinc: 1.2
    },
    'vegetarian': {
      calories: 160,
      protein: 9.0,
      carbs: 20.0,
      fat: 6.0,
      iron: 3.0,
      calcium: 85,
      zinc: 1.8
    },
    'african': {
      calories: 165,
      protein: 5.0,
      carbs: 32.0,
      fat: 3.0,
      iron: 1.8,
      calcium: 25,
      zinc: 1.1
    }
  };
  
  return profiles[category] || {};
}

/**
 * Check if a food name should use USDA data instead of enhanced database
 * This helps prevent conflicts where USDA has good data
 */
export function shouldUseUSDAData(foodName: string): boolean {
  const normalized = foodName.toLowerCase().trim();
  
  // Foods where USDA has comprehensive data - don't override
  // NOTE: Removed pad thai and fried rice as our enhanced database has better composite food data
  const usdaPreferred = [
    'pizza', 'sushi', 'yogurt', 'pasta sauce', 'apple juice',
    'orange juice', 'milk', 'cheese', 'bread', 'white rice', 'brown rice'
  ];
  
  // Allow enhanced database for ethnic composite foods even if USDA has basic data
  const enhancedPreferred = [
    'pad thai', 'fried rice', 'chinese fried rice', 'chicken fried rice',
    'general tso', 'orange chicken', 'lo mein', 'gyro', 'butter chicken',
    'biryani', 'green curry', 'pho', 'banh mi', 'bulgogi', 'bibimbap'
  ];
  
  // If it's in enhanced preferred list, always use enhanced database
  if (enhancedPreferred.some(food => normalized.includes(food))) {
    return false;
  }
  
  return usdaPreferred.some(food => normalized.includes(food));
}