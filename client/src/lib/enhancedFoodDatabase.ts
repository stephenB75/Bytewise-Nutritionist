/**
 * Enhanced Food Database with Categories and Unit Conversions
 * Integrates structured food data with USDA API for comprehensive nutrition tracking
 */

export interface FoodItem {
  displayName: string;
  aliases: string[];
  usdaQuery: string;
  units: Record<string, number>; // unit -> grams conversion
  tags: {
    isCommon: boolean;
    densityType: 'dry' | 'liquid' | 'solid';
    dietType: string[];
    categoryColor: string;
  };
}

export interface FoodCategory {
  [key: string]: FoodItem;
}

export interface FoodDatabase {
  categories: Record<string, FoodCategory>;
}

export const ENHANCED_FOOD_DATABASE: FoodDatabase = {
  categories: {
    "Flours": {
      "all_purpose_flour": {
        "displayName": "All-Purpose Flour",
        "aliases": ["AP flour", "plain flour", "all purpose"],
        "usdaQuery": "all purpose flour",
        "units": {
          "cup": 120,
          "tbsp": 7.5,
          "tsp": 2.5,
          "oz": 28,
          "g": 120
        },
        "tags": {
          "isCommon": true,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#F4E1A1"
        }
      },
      "pizza_flour_00": {
        "displayName": "00 Pizza Flour",
        "aliases": ["pizza flour", "type 00 flour"],
        "usdaQuery": "pizza flour",
        "units": {
          "cup": 116,
          "tbsp": 7.25,
          "oz": 28,
          "g": 116
        },
        "tags": {
          "isCommon": false,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#F4E1A1"
        }
      },
      "bread_flour": {
        "displayName": "Bread Flour",
        "aliases": ["high protein flour", "strong flour"],
        "usdaQuery": "bread flour",
        "units": {
          "cup": 127,
          "tbsp": 8,
          "tsp": 2.7,
          "oz": 28,
          "g": 127
        },
        "tags": {
          "isCommon": true,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#F4E1A1"
        }
      },
      "cake_flour": {
        "displayName": "Cake Flour",
        "aliases": ["soft flour", "pastry flour"],
        "usdaQuery": "cake flour",
        "units": {
          "cup": 114,
          "tbsp": 7.1,
          "tsp": 2.4,
          "oz": 28,
          "g": 114
        },
        "tags": {
          "isCommon": false,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#F4E1A1"
        }
      }
    },
    "Oils": {
      "olive_oil": {
        "displayName": "Olive Oil",
        "aliases": ["extra virgin olive oil", "EVOO"],
        "usdaQuery": "olive oil",
        "units": {
          "cup": 216,
          "tbsp": 14,
          "tsp": 5,
          "oz": 28,
          "ml": 216
        },
        "tags": {
          "isCommon": true,
          "densityType": "liquid",
          "dietType": ["vegetarian", "vegan", "keto"],
          "categoryColor": "#FFD580"
        }
      },
      "vegetable_oil": {
        "displayName": "Vegetable Oil",
        "aliases": ["canola oil", "sunflower oil"],
        "usdaQuery": "vegetable oil",
        "units": {
          "cup": 218,
          "tbsp": 14,
          "tsp": 5,
          "oz": 28,
          "ml": 218
        },
        "tags": {
          "isCommon": true,
          "densityType": "liquid",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#FFD580"
        }
      },
      "coconut_oil": {
        "displayName": "Coconut Oil",
        "aliases": ["virgin coconut oil"],
        "usdaQuery": "coconut oil",
        "units": {
          "cup": 218,
          "tbsp": 14,
          "tsp": 5,
          "oz": 28
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian", "vegan", "keto", "paleo"],
          "categoryColor": "#FFD580"
        }
      }
    },
    "Dairy & Eggs": {
      "egg_large": {
        "displayName": "Egg (Large)",
        "aliases": ["large egg", "whole egg"],
        "usdaQuery": "egg large",
        "units": {
          "piece": 55,
          "cup": 275,
          "yolk_tbsp": 20,
          "white_tbsp": 35
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian"],
          "categoryColor": "#FDD692"
        }
      },
      "milk_whole": {
        "displayName": "Whole Milk",
        "aliases": ["full fat milk", "3.25% milk"],
        "usdaQuery": "milk whole",
        "units": {
          "cup": 244,
          "tbsp": 15,
          "tsp": 5,
          "oz": 30,
          "ml": 244
        },
        "tags": {
          "isCommon": true,
          "densityType": "liquid",
          "dietType": ["vegetarian"],
          "categoryColor": "#FDD692"
        }
      },
      "butter": {
        "displayName": "Butter",
        "aliases": ["unsalted butter", "salted butter"],
        "usdaQuery": "butter",
        "units": {
          "cup": 227,
          "tbsp": 14,
          "tsp": 5,
          "oz": 28,
          "stick": 113
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian"],
          "categoryColor": "#FDD692"
        }
      },
      "cheese_cheddar": {
        "displayName": "Cheddar Cheese",
        "aliases": ["sharp cheddar", "mild cheddar"],
        "usdaQuery": "cheddar cheese",
        "units": {
          "cup": 113,
          "oz": 28,
          "slice": 28,
          "g": 113
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian"],
          "categoryColor": "#FDD692"
        }
      }
    },
    "Sugars & Sweeteners": {
      "sugar_white": {
        "displayName": "White Sugar",
        "aliases": ["granulated sugar", "table sugar"],
        "usdaQuery": "white sugar",
        "units": {
          "cup": 200,
          "tbsp": 12.5,
          "tsp": 4,
          "oz": 28,
          "g": 200
        },
        "tags": {
          "isCommon": true,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#F8E6FF"
        }
      },
      "brown_sugar": {
        "displayName": "Brown Sugar",
        "aliases": ["light brown sugar", "dark brown sugar"],
        "usdaQuery": "brown sugar",
        "units": {
          "cup": 213,
          "tbsp": 13,
          "tsp": 4.3,
          "oz": 28,
          "g": 213
        },
        "tags": {
          "isCommon": true,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#F8E6FF"
        }
      },
      "honey": {
        "displayName": "Honey",
        "aliases": ["raw honey", "clover honey"],
        "usdaQuery": "honey",
        "units": {
          "cup": 340,
          "tbsp": 21,
          "tsp": 7,
          "oz": 28,
          "g": 340
        },
        "tags": {
          "isCommon": true,
          "densityType": "liquid",
          "dietType": ["vegetarian"],
          "categoryColor": "#F8E6FF"
        }
      }
    },
    "Vegetables": {
      "onion": {
        "displayName": "Onion",
        "aliases": ["yellow onion", "white onion", "sweet onion"],
        "usdaQuery": "onion",
        "units": {
          "cup": 160,
          "medium": 110,
          "large": 150,
          "slice": 14,
          "g": 160
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian", "vegan", "keto", "paleo"],
          "categoryColor": "#C8E6C9"
        }
      },
      "tomato": {
        "displayName": "Tomato",
        "aliases": ["roma tomato", "beefsteak tomato"],
        "usdaQuery": "tomato",
        "units": {
          "cup": 180,
          "medium": 123,
          "large": 182,
          "slice": 20,
          "g": 180
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian", "vegan", "keto", "paleo"],
          "categoryColor": "#C8E6C9"
        }
      },
      "garlic": {
        "displayName": "Garlic",
        "aliases": ["garlic clove", "fresh garlic"],
        "usdaQuery": "garlic",
        "units": {
          "clove": 3,
          "tbsp": 8,
          "tsp": 2.8,
          "bulb": 40,
          "g": 3
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["vegetarian", "vegan", "keto", "paleo"],
          "categoryColor": "#C8E6C9"
        }
      }
    },
    "Proteins": {
      "chicken_breast": {
        "displayName": "Chicken Breast",
        "aliases": ["boneless chicken breast", "skinless chicken breast"],
        "usdaQuery": "chicken breast",
        "units": {
          "oz": 28,
          "lb": 454,
          "piece": 174,
          "g": 28
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["keto", "paleo"],
          "categoryColor": "#FFCDD2"
        }
      },
      "ground_beef": {
        "displayName": "Ground Beef",
        "aliases": ["hamburger", "minced beef"],
        "usdaQuery": "ground beef",
        "units": {
          "oz": 28,
          "lb": 454,
          "patty": 113,
          "g": 28
        },
        "tags": {
          "isCommon": true,
          "densityType": "solid",
          "dietType": ["keto", "paleo"],
          "categoryColor": "#FFCDD2"
        }
      }
    },
    "Grains": {
      "white_rice": {
        "displayName": "White Rice",
        "aliases": ["long grain rice", "jasmine rice", "basmati rice"],
        "usdaQuery": "white rice",
        "units": {
          "cup": 195,
          "tbsp": 12,
          "oz": 28,
          "g": 195
        },
        "tags": {
          "isCommon": true,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#FFF3E0"
        }
      },
      "pasta": {
        "displayName": "Pasta",
        "aliases": ["spaghetti", "penne", "fusilli"],
        "usdaQuery": "pasta",
        "units": {
          "cup": 100,
          "oz": 28,
          "serving": 56,
          "g": 100
        },
        "tags": {
          "isCommon": true,
          "densityType": "dry",
          "dietType": ["vegetarian", "vegan"],
          "categoryColor": "#FFF3E0"
        }
      }
    }
  }
};

// Helper functions for working with the enhanced database
export class EnhancedFoodDatabaseService {
  
  /**
   * Search for foods across all categories and aliases
   */
  static searchFoods(query: string): Array<{
    key: string;
    category: string;
    food: FoodItem;
    matchType: 'exact' | 'alias' | 'partial';
  }> {
    const results: Array<{
      key: string;
      category: string;
      food: FoodItem;
      matchType: 'exact' | 'alias' | 'partial';
    }> = [];
    
    const lowerQuery = query.toLowerCase().trim();
    
    Object.entries(ENHANCED_FOOD_DATABASE.categories).forEach(([categoryName, category]) => {
      Object.entries(category).forEach(([foodKey, food]) => {
        // Check exact name match
        if (food.displayName.toLowerCase() === lowerQuery) {
          results.push({
            key: foodKey,
            category: categoryName,
            food,
            matchType: 'exact'
          });
          return;
        }
        
        // Check alias matches
        const aliasMatch = food.aliases.some(alias => 
          alias.toLowerCase() === lowerQuery
        );
        if (aliasMatch) {
          results.push({
            key: foodKey,
            category: categoryName,
            food,
            matchType: 'alias'
          });
          return;
        }
        
        // Check partial matches
        if (food.displayName.toLowerCase().includes(lowerQuery) ||
            food.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) {
          results.push({
            key: foodKey,
            category: categoryName,
            food,
            matchType: 'partial'
          });
        }
      });
    });
    
    // Sort by match type priority
    return results.sort((a, b) => {
      const priority = { exact: 0, alias: 1, partial: 2 };
      return priority[a.matchType] - priority[b.matchType];
    });
  }
  
  /**
   * Get all available units for a food item
   */
  static getAvailableUnits(foodKey: string, categoryName: string): string[] {
    const food = ENHANCED_FOOD_DATABASE.categories[categoryName]?.[foodKey];
    return food ? Object.keys(food.units) : [];
  }
  
  /**
   * Convert between units using the food's unit conversion table
   */
  static convertUnits(
    foodKey: string, 
    categoryName: string, 
    amount: number, 
    fromUnit: string, 
    toUnit: string
  ): number | null {
    const food = ENHANCED_FOOD_DATABASE.categories[categoryName]?.[foodKey];
    if (!food || !food.units[fromUnit] || !food.units[toUnit]) {
      return null;
    }
    
    // Convert to grams first, then to target unit
    const gramsFromSource = (amount * food.units[fromUnit]);
    const targetAmount = gramsFromSource / food.units[toUnit];
    
    return Math.round(targetAmount * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Get foods by category
   */
  static getFoodsByCategory(categoryName: string): Array<{
    key: string;
    food: FoodItem;
  }> {
    const category = ENHANCED_FOOD_DATABASE.categories[categoryName];
    if (!category) return [];
    
    return Object.entries(category).map(([key, food]) => ({
      key,
      food
    }));
  }
  
  /**
   * Get all categories
   */
  static getCategories(): string[] {
    return Object.keys(ENHANCED_FOOD_DATABASE.categories);
  }
  
  /**
   * Get common foods (marked as isCommon: true)
   */
  static getCommonFoods(): Array<{
    key: string;
    category: string;
    food: FoodItem;
  }> {
    const results: Array<{
      key: string;
      category: string;
      food: FoodItem;
    }> = [];
    
    Object.entries(ENHANCED_FOOD_DATABASE.categories).forEach(([categoryName, category]) => {
      Object.entries(category).forEach(([foodKey, food]) => {
        if (food.tags.isCommon) {
          results.push({
            key: foodKey,
            category: categoryName,
            food
          });
        }
      });
    });
    
    return results;
  }
  
  /**
   * Filter foods by diet type
   */
  static getFoodsByDiet(dietType: string): Array<{
    key: string;
    category: string;
    food: FoodItem;
  }> {
    const results: Array<{
      key: string;
      category: string;
      food: FoodItem;
    }> = [];
    
    Object.entries(ENHANCED_FOOD_DATABASE.categories).forEach(([categoryName, category]) => {
      Object.entries(category).forEach(([foodKey, food]) => {
        if (food.tags.dietType.includes(dietType)) {
          results.push({
            key: foodKey,
            category: categoryName,
            food
          });
        }
      });
    });
    
    return results;
  }
  
  /**
   * Parse measurement input and suggest corrections
   */
  static parseMeasurement(input: string, foodKey: string, categoryName: string): {
    isValid: boolean;
    amount?: number;
    unit?: string;
    suggestions?: string[];
    correctedInput?: string;
  } {
    const food = ENHANCED_FOOD_DATABASE.categories[categoryName]?.[foodKey];
    if (!food) {
      return { isValid: false, suggestions: ["Food not found"] };
    }
    
    const availableUnits = Object.keys(food.units);
    const cleanInput = input.toLowerCase().trim();
    
    // Try to extract amount and unit
    const match = cleanInput.match(/^(\d+\.?\d*)\s*(.+)$/);
    if (!match) {
      return {
        isValid: false,
        suggestions: [`Try format like "1 cup", "100 g", or "2 tbsp"`]
      };
    }
    
    const [, amountStr, unitStr] = match;
    const amount = parseFloat(amountStr);
    
    // Check for exact unit match
    if (availableUnits.includes(unitStr)) {
      return {
        isValid: true,
        amount,
        unit: unitStr,
        correctedInput: `${amount} ${unitStr}`
      };
    }
    
    // Check for common unit variations
    const unitMappings: Record<string, string> = {
      'cups': 'cup',
      'tablespoons': 'tbsp',
      'tablespoon': 'tbsp',
      'teaspoons': 'tsp',
      'teaspoon': 'tsp',
      'ounces': 'oz',
      'ounce': 'oz',
      'grams': 'g',
      'gram': 'g',
      'pieces': 'piece',
      'cloves': 'clove',
      'sticks': 'stick',
      'slices': 'slice',
      'medium': 'medium',
      'large': 'large',
      'small': 'small'
    };
    
    const mappedUnit = unitMappings[unitStr];
    if (mappedUnit && availableUnits.includes(mappedUnit)) {
      return {
        isValid: true,
        amount,
        unit: mappedUnit,
        correctedInput: `${amount} ${mappedUnit}`
      };
    }
    
    // Suggest available units
    return {
      isValid: false,
      suggestions: [
        `Available units for ${food.displayName}: ${availableUnits.join(', ')}`,
        `Try: "${amount} ${availableUnits[0]}" or "${amount} ${availableUnits[1] || availableUnits[0]}"`
      ]
    };
  }
}

export default EnhancedFoodDatabaseService;