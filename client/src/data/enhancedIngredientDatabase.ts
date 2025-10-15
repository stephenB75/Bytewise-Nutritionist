/**
 * Enhanced Ingredient Database
 * 
 * Professional cooking measurements based on Kitchen to Table and Shamrock Foods conversion charts
 * Includes precise weight conversions, fractional measurements, and industry-standard ratios
 */

export interface IngredientUnit {
  [unitName: string]: number; // grams per unit
}

export interface IngredientTags {
  isCommon: boolean;
  densityType: 'dry' | 'liquid' | 'solid';
  dietType: string[];
  categoryColor: string;
}

export interface IngredientData {
  displayName: string;
  aliases: string[];
  usdaQuery: string;
  units: IngredientUnit;
  tags: IngredientTags;
}

export interface CategoryData {
  [ingredientKey: string]: IngredientData;
}

export interface IngredientDatabase {
  categories: {
    [categoryName: string]: CategoryData;
  };
}

export const enhancedIngredientDatabase: IngredientDatabase = {
  categories: {
    "Flours": {
      "all_purpose_flour": {
        displayName: "All-Purpose Flour",
        aliases: ["AP flour", "plain flour", "all purpose"],
        usdaQuery: "all purpose flour",
        units: {
          cup: 120,
          "3/4_cup": 105,
          "2/3_cup": 93,
          "1/2_cup": 70,
          "1/3_cup": 47,
          "1/4_cup": 35,
          "1/8_cup": 18,
          tbsp: 9,
          tsp: 3,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E1A1"
        }
      },
      "bread_flour": {
        displayName: "Bread Flour",
        aliases: ["high protein flour", "strong flour"],
        usdaQuery: "bread flour",
        units: {
          cup: 127,
          "3/4_cup": 95,
          "1/2_cup": 64,
          "1/3_cup": 42,
          "1/4_cup": 32,
          tbsp: 8,
          tsp: 2.7,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E1A1"
        }
      },
      "cake_flour": {
        displayName: "Cake Flour",
        aliases: ["pastry flour", "soft flour"],
        usdaQuery: "cake flour",
        units: {
          cup: 114,
          "3/4_cup": 86,
          "1/2_cup": 57,
          "1/3_cup": 38,
          "1/4_cup": 29,
          tbsp: 7,
          tsp: 2.4,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E1A1"
        }
      },
      "whole_wheat_flour": {
        displayName: "Whole Wheat Flour",
        aliases: ["whole grain flour", "wholemeal flour"],
        usdaQuery: "whole wheat flour",
        units: {
          cup: 113,
          "3/4_cup": 85,
          "1/2_cup": 57,
          "1/3_cup": 38,
          "1/4_cup": 28,
          tbsp: 7,
          tsp: 2.3,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E1A1"
        }
      }
    },
    "Oils & Fats": {
      "olive_oil": {
        displayName: "Olive Oil",
        aliases: ["extra virgin olive oil", "EVOO"],
        usdaQuery: "olive oil",
        units: {
          cup: 216,
          "3/4_cup": 162,
          "2/3_cup": 144,
          "1/2_cup": 108,
          "1/3_cup": 72,
          "1/4_cup": 54,
          tbsp: 14,
          tsp: 5,
          fl_oz: 30,
          ml: 0.92,
          l: 920,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "vegan", "keto"],
          categoryColor: "#FFD580"
        }
      },
      "butter": {
        displayName: "Butter",
        aliases: ["unsalted butter", "salted butter"],
        usdaQuery: "butter",
        units: {
          cup: 227,
          "3/4_cup": 170,
          "2/3_cup": 151,
          "1/2_cup": 113,
          "1/3_cup": 76,
          "1/4_cup": 57,
          tbsp: 14,
          tsp: 5,
          stick: 113,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian"],
          categoryColor: "#FFD580"
        }
      },
      "coconut_oil": {
        displayName: "Coconut Oil",
        aliases: ["virgin coconut oil", "refined coconut oil"],
        usdaQuery: "coconut oil",
        units: {
          cup: 218,
          "3/4_cup": 164,
          "1/2_cup": 109,
          "1/3_cup": 73,
          "1/4_cup": 55,
          tbsp: 14,
          tsp: 5,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "keto"],
          categoryColor: "#FFD580"
        }
      }
    },
    "Dairy & Eggs": {
      "egg_large": {
        displayName: "Egg (Large)",
        aliases: ["large egg", "whole egg"],
        usdaQuery: "egg large",
        units: {
          piece: 55,
          cup: 275,
          "1/2_cup": 138,
          "1/4_cup": 69,
          yolk: 20,
          white: 35,
          dozen: 660,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian"],
          categoryColor: "#FDD692"
        }
      },
      "milk_whole": {
        displayName: "Milk (Whole)",
        aliases: ["whole milk", "3.25% milk"],
        usdaQuery: "milk whole",
        units: {
          cup: 244,
          "3/4_cup": 183,
          "2/3_cup": 163,
          "1/2_cup": 122,
          "1/3_cup": 81,
          "1/4_cup": 61,
          "1/8_cup": 30,
          tbsp: 15,
          tsp: 5,
          fl_oz: 30,
          pt: 488,
          qt: 976,
          gal: 3904,
          ml: 1.03,
          l: 1030,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian"],
          categoryColor: "#FDD692"
        }
      },
      "heavy_cream": {
        displayName: "Heavy Cream",
        aliases: ["heavy whipping cream", "double cream"],
        usdaQuery: "heavy cream",
        units: {
          cup: 240,
          "3/4_cup": 180,
          "1/2_cup": 120,
          "1/3_cup": 80,
          "1/4_cup": 60,
          tbsp: 15,
          tsp: 5,
          fl_oz: 30,
          ml: 0.98,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "keto"],
          categoryColor: "#FDD692"
        }
      },
      "cheddar_cheese": {
        displayName: "Cheddar Cheese",
        aliases: ["sharp cheddar", "mild cheddar"],
        usdaQuery: "cheddar cheese",
        units: {
          cup_shredded: 113,
          "1/2_cup_shredded": 57,
          "1/4_cup_shredded": 28,
          oz: 28,
          slice: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian"],
          categoryColor: "#FDD692"
        }
      }
    },
    "Sugars & Sweeteners": {
      "granulated_sugar": {
        displayName: "Granulated Sugar",
        aliases: ["white sugar", "table sugar", "refined sugar"],
        usdaQuery: "sugar granulated",
        units: {
          cup: 198,
          "3/4_cup": 150,
          "2/3_cup": 133,
          "1/2_cup": 100,
          "1/3_cup": 67,
          "1/4_cup": 50,
          "1/8_cup": 25,
          tbsp: 13,
          tsp: 4,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F8E8FF"
        }
      },
      "brown_sugar": {
        displayName: "Brown Sugar (Packed)",
        aliases: ["light brown sugar", "dark brown sugar"],
        usdaQuery: "brown sugar",
        units: {
          cup_packed: 213,
          "3/4_cup_packed": 165,
          "2/3_cup_packed": 145,
          "1/2_cup_packed": 110,
          "1/3_cup_packed": 75,
          "1/4_cup_packed": 55,
          tbsp: 15,
          tsp: 5,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F8E8FF"
        }
      },
      "honey": {
        displayName: "Honey",
        aliases: ["pure honey", "raw honey"],
        usdaQuery: "honey",
        units: {
          cup: 320,
          "3/4_cup": 240,
          "2/3_cup": 213,
          "1/2_cup": 160,
          "1/3_cup": 107,
          "1/4_cup": 80,
          tbsp: 20,
          tsp: 7,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian"],
          categoryColor: "#F8E8FF"
        }
      },
      "powdered_sugar": {
        displayName: "Powdered Sugar",
        aliases: ["confectioners sugar", "icing sugar"],
        usdaQuery: "powdered sugar",
        units: {
          cup: 160,
          "3/4_cup": 120,
          "2/3_cup": 107,
          "1/2_cup": 80,
          "1/3_cup": 53,
          "1/4_cup": 40,
          tbsp: 10,
          tsp: 3.3,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F8E8FF"
        }
      },
      "maple_syrup": {
        displayName: "Maple Syrup",
        aliases: ["pure maple syrup", "real maple syrup"],
        usdaQuery: "maple syrup",
        units: {
          cup: 312,
          "3/4_cup": 234,
          "2/3_cup": 208,
          "1/2_cup": 156,
          "1/3_cup": 104,
          "1/4_cup": 78,
          tbsp: 20,
          tsp: 7,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F8E8FF"
        }
      }
    },
    "Grains": {
      "white_rice": {
        displayName: "White Rice",
        aliases: ["long grain rice", "jasmine rice"],
        usdaQuery: "white rice cooked",
        units: {
          cup_cooked: 158,
          cup_dry: 185,
          "3/4_cup_cooked": 119,
          "1/2_cup_cooked": 79,
          "1/3_cup_cooked": 53,
          "1/4_cup_cooked": 40,
          tbsp: 10,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E4BC"
        }
      },
      "quinoa": {
        displayName: "Quinoa",
        aliases: ["cooked quinoa", "quinoa grain"],
        usdaQuery: "quinoa cooked",
        units: {
          cup_cooked: 185,
          cup_dry: 170,
          "1/2_cup_cooked": 93,
          "1/3_cup_cooked": 62,
          "1/4_cup_cooked": 46,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "gluten-free"],
          categoryColor: "#F4E4BC"
        }
      },
      "oats": {
        displayName: "Rolled Oats",
        aliases: ["old fashioned oats", "oatmeal", "quick oats"],
        usdaQuery: "oats rolled dry",
        units: {
          cup: 81,
          "3/4_cup": 61,
          "1/2_cup": 41,
          "1/3_cup": 27,
          "1/4_cup": 20,
          tbsp: 5,
          tsp: 1.7,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan", "gluten-free"],
          categoryColor: "#F4E4BC"
        }
      }
    },
    "Nuts & Seeds": {
      "almonds": {
        displayName: "Almonds",
        aliases: ["raw almonds", "whole almonds"],
        usdaQuery: "almonds raw",
        units: {
          cup_whole: 142,
          cup_sliced: 100,
          cup_slivered: 108,
          "1/2_cup_whole": 71,
          "1/4_cup_whole": 36,
          tbsp: 9,
          oz: 28.35,
          "23_almonds": 28,
          handful: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "keto", "gluten-free"],
          categoryColor: "#D4A574"
        }
      },
      "walnuts": {
        displayName: "Walnuts",
        aliases: ["english walnuts", "walnut halves"],
        usdaQuery: "walnuts english",
        units: {
          cup_halves: 90,
          cup_chopped: 113,
          "3/4_cup_halves": 68,
          "2/3_cup_halves": 60,
          "1/2_cup_halves": 45,
          "1/3_cup_halves": 30,
          "1/4_cup_halves": 23,
          tbsp: 7,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "keto", "gluten-free"],
          categoryColor: "#D4A574"
        }
      },
      "peanut_butter": {
        displayName: "Peanut Butter",
        aliases: ["smooth peanut butter", "creamy peanut butter"],
        usdaQuery: "peanut butter",
        units: {
          cup: 270,
          "3/4_cup": 203,
          "1/2_cup": 135,
          "1/3_cup": 90,
          "1/4_cup": 68,
          tbsp: 17,
          tsp: 6,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#D4A574"
        }
      },
      "sesame_seeds": {
        displayName: "Sesame Seeds",
        aliases: ["white sesame seeds", "hulled sesame seeds"],
        usdaQuery: "sesame seeds",
        units: {
          cup: 144,
          "1/2_cup": 71,
          "1/4_cup": 36,
          tbsp: 9,
          tsp: 3,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "keto"],
          categoryColor: "#D4A574"
        }
      }
    },
    "Baking Ingredients": {
      "cocoa_powder": {
        displayName: "Cocoa Powder (Unsweetened)",
        aliases: ["unsweetened cocoa", "cocoa powder"],
        usdaQuery: "cocoa powder unsweetened",
        units: {
          cup: 100,
          "3/4_cup": 75,
          "2/3_cup": 67,
          "1/2_cup": 50,
          "1/3_cup": 33,
          "1/4_cup": 25,
          tbsp: 6,
          tsp: 2,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#8B4513"
        }
      },
      "baking_powder": {
        displayName: "Baking Powder",
        aliases: ["double acting baking powder"],
        usdaQuery: "baking powder",
        units: {
          tbsp: 12,
          "2.5_tsp": 10,
          "2_tsp": 8,
          "1.75_tsp": 7,
          "1.5_tsp": 6,
          "1.25_tsp": 5,
          tsp: 4,
          "0.75_tsp": 3,
          "0.5_tsp": 2,
          "0.25_tsp": 1,
          oz: 28.35,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFF8DC"
        }
      },
      "baking_soda": {
        displayName: "Baking Soda",
        aliases: ["sodium bicarbonate"],
        usdaQuery: "baking soda",
        units: {
          tbsp: 20,
          "2_tsp": 14,
          "1.75_tsp": 12,
          "1.5_tsp": 10,
          "1.25_tsp": 9,
          tsp: 7,
          "0.75_tsp": 5,
          "0.5_tsp": 3,
          "0.25_tsp": 2,
          oz: 28.35,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFF8DC"
        }
      },
      "vanilla_extract": {
        displayName: "Vanilla Extract",
        aliases: ["pure vanilla extract"],
        usdaQuery: "vanilla extract",
        units: {
          tbsp: 14,
          tsp: 5,
          "0.5_tsp": 2.5,
          fl_oz: 30,
          ml: 1,
          oz: 28.35,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#8B4513"
        }
      },
      "salt": {
        displayName: "Salt (Table Salt)",
        aliases: ["fine salt", "table salt", "iodized salt"],
        usdaQuery: "salt table",
        units: {
          tbsp: 18,
          tsp: 6,
          "0.5_tsp": 3,
          "0.25_tsp": 1.5,
          oz: 28.35,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFFFFF"
        }
      }
    },
    "Canned Goods": {
      "canned_tomatoes": {
        displayName: "Canned Diced Tomatoes",
        aliases: ["diced tomatoes", "canned tomatoes"],
        usdaQuery: "tomatoes canned diced",
        units: {
          "can_14.5oz": 411,
          "can_28oz": 794,
          "#10_can": 3000,
          cup: 244,
          "1/2_cup": 122,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFB3B3"
        }
      },
      "canned_beans": {
        displayName: "Canned Black Beans",
        aliases: ["black beans", "canned black beans"],
        usdaQuery: "black beans canned",
        units: {
          "can_15oz": 425,
          "can_15oz_drained": 255,
          "#10_can": 3000,
          "#10_can_drained": 1936,
          cup: 240,
          "1/2_cup": 120,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "gluten-free"],
          categoryColor: "#C8A882"
        }
      }
    }
  }
};

// Enhanced database manager with professional conversion utilities
export class EnhancedIngredientDatabaseManager {
  
  /**
   * Search for ingredients across all categories
   */
  static searchIngredients(query: string): Array<{
    category: string;
    key: string;
    data: IngredientData;
  }> {
    const results: Array<{category: string; key: string; data: IngredientData}> = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(enhancedIngredientDatabase.categories).forEach(([categoryName, category]) => {
      Object.entries(category).forEach(([ingredientKey, ingredientData]) => {
        // Search in display name
        if (ingredientData.displayName.toLowerCase().includes(searchTerm)) {
          results.push({ category: categoryName, key: ingredientKey, data: ingredientData });
          return;
        }
        
        // Search in aliases
        if (ingredientData.aliases.some(alias => alias.toLowerCase().includes(searchTerm))) {
          results.push({ category: categoryName, key: ingredientKey, data: ingredientData });
          return;
        }
      });
    });
    
    return results.sort((a, b) => {
      // Prioritize common ingredients
      if (a.data.tags.isCommon && !b.data.tags.isCommon) return -1;
      if (!a.data.tags.isCommon && b.data.tags.isCommon) return 1;
      
      // Then by display name
      return a.data.displayName.localeCompare(b.data.displayName);
    });
  }
  
  /**
   * Get ingredient by category and key
   */
  static getIngredient(category: string, key: string): IngredientData | null {
    return enhancedIngredientDatabase.categories[category]?.[key] || null;
  }
  
  /**
   * Convert between units for an ingredient using professional ratios
   */
  static convertUnits(
    category: string, 
    key: string, 
    fromAmount: number, 
    fromUnit: string, 
    toUnit: string
  ): { amount: number; precision: 'exact' | 'approximate' } | null {
    const ingredient = this.getIngredient(category, key);
    if (!ingredient) return null;
    
    const fromGrams = ingredient.units[fromUnit];
    const toGrams = ingredient.units[toUnit];
    
    if (!fromGrams || !toGrams) return null;
    
    // Convert to grams first, then to target unit
    const gramsAmount = fromAmount * fromGrams;
    const result = gramsAmount / toGrams;
    
    // Determine precision based on measurement type
    const precision = this.isPreciseMeasurement(fromUnit, toUnit) ? 'exact' : 'approximate';
    
    return { amount: result, precision };
  }
  
  /**
   * Check if conversion between units is considered precise
   */
  private static isPreciseMeasurement(fromUnit: string, toUnit: string): boolean {
    const preciseUnits = ['g', 'oz', 'lb', 'ml', 'l'];
    const volumeUnits = ['cup', 'tbsp', 'tsp'];
    
    // Gram/ounce conversions are precise
    if (preciseUnits.includes(fromUnit) && preciseUnits.includes(toUnit)) {
      return true;
    }
    
    // Volume to volume within same system is precise
    if (volumeUnits.some(u => fromUnit.includes(u)) && volumeUnits.some(u => toUnit.includes(u))) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all available units for an ingredient
   */
  static getAvailableUnits(category: string, key: string): string[] {
    const ingredient = this.getIngredient(category, key);
    return ingredient ? Object.keys(ingredient.units).sort() : [];
  }
  
  /**
   * Get all categories
   */
  static getCategories(): string[] {
    return Object.keys(enhancedIngredientDatabase.categories);
  }
  
  /**
   * Get all ingredients in a category
   */
  static getCategoryIngredients(category: string): {key: string; data: IngredientData}[] {
    const categoryData = enhancedIngredientDatabase.categories[category];
    if (!categoryData) return [];
    
    return Object.entries(categoryData).map(([key, data]) => ({ key, data }))
      .sort((a, b) => {
        // Common ingredients first
        if (a.data.tags.isCommon && !b.data.tags.isCommon) return -1;
        if (!a.data.tags.isCommon && b.data.tags.isCommon) return 1;
        return a.data.displayName.localeCompare(b.data.displayName);
      });
  }
  
  /**
   * Get conversion suggestions for better measurements
   */
  static getConversionSuggestions(category: string, key: string, unit: string): string[] {
    const ingredient = this.getIngredient(category, key);
    if (!ingredient) return [];
    
    const suggestions: string[] = [];
    const densityType = ingredient.tags.densityType;
    
    // Suggest common alternatives based on density type
    if (densityType === 'dry') {
      if (unit !== 'cup') suggestions.push('cup');
      if (unit !== 'g') suggestions.push('g');
      if (unit !== 'oz') suggestions.push('oz');
    } else if (densityType === 'liquid') {
      if (unit !== 'cup') suggestions.push('cup');
      if (unit !== 'ml') suggestions.push('ml');
      if (unit !== 'fl_oz') suggestions.push('fl_oz');
    }
    
    return suggestions.filter(s => ingredient.units[s]);
  }
}

export default enhancedIngredientDatabase;