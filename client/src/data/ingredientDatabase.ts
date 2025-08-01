/**
 * Comprehensive Ingredient Database
 * 
 * Hierarchical food database with categories, units, aliases, and USDA queries
 * Supports precise unit conversions and nutritional calculations
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

export const ingredientDatabase: IngredientDatabase = {
  categories: {
    "Flours": {
      "all_purpose_flour": {
        displayName: "All-Purpose Flour",
        aliases: ["AP flour", "plain flour", "all purpose"],
        usdaQuery: "all purpose flour",
        units: {
          cup: 120,
          tbsp: 7.5,
          tsp: 2.5,
          oz: 28,
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
          cup: 125,
          tbsp: 8,
          tsp: 2.6,
          oz: 28,
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
          tbsp: 7,
          tsp: 2.3,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E1A1"
        }
      },
      "pizza_flour_00": {
        displayName: "00 Pizza Flour",
        aliases: ["pizza flour", "type 00 flour"],
        usdaQuery: "pizza flour",
        units: {
          cup: 116,
          tbsp: 7.25,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: false,
          densityType: "dry",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E1A1"
        }
      },
      "almond_flour": {
        displayName: "Almond Flour",
        aliases: ["almond meal", "ground almonds"],
        usdaQuery: "almond flour",
        units: {
          cup: 96,
          tbsp: 6,
          tsp: 2,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "dry",
          dietType: ["vegetarian", "vegan", "keto", "gluten-free"],
          categoryColor: "#F4E1A1"
        }
      }
    },
    "Oils": {
      "olive_oil": {
        displayName: "Olive Oil",
        aliases: ["extra virgin olive oil", "EVOO"],
        usdaQuery: "olive oil",
        units: {
          cup: 216,
          tbsp: 14,
          tsp: 5,
          oz: 30,
          ml: 0.92,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "vegan", "keto"],
          categoryColor: "#FFD580"
        }
      },
      "vegetable_oil": {
        displayName: "Vegetable Oil",
        aliases: ["canola oil", "cooking oil"],
        usdaQuery: "vegetable oil",
        units: {
          cup: 218,
          tbsp: 14,
          tsp: 5,
          oz: 30,
          ml: 0.92,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "liquid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFD580"
        }
      },
      "coconut_oil": {
        displayName: "Coconut Oil",
        aliases: ["virgin coconut oil"],
        usdaQuery: "coconut oil",
        units: {
          cup: 218,
          tbsp: 14,
          tsp: 5,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
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
          tbsp: 14,
          tsp: 5,
          stick: 113,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian"],
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
          yolk_tbsp: 20,
          white_tbsp: 35,
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
          tbsp: 15,
          tsp: 5,
          oz: 30,
          ml: 1.03,
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
          tbsp: 15,
          tsp: 5,
          oz: 30,
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
          oz: 28,
          slice: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian"],
          categoryColor: "#FDD692"
        }
      },
      "greek_yogurt": {
        displayName: "Greek Yogurt",
        aliases: ["strained yogurt", "greek style yogurt"],
        usdaQuery: "greek yogurt",
        units: {
          cup: 227,
          tbsp: 15,
          container_small: 150,
          oz: 30,
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
    "Proteins": {
      "chicken_breast": {
        displayName: "Chicken Breast",
        aliases: ["boneless skinless chicken breast"],
        usdaQuery: "chicken breast",
        units: {
          breast: 174,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: [],
          categoryColor: "#FFB3BA"
        }
      },
      "ground_beef": {
        displayName: "Ground Beef (80/20)",
        aliases: ["ground chuck", "hamburger meat"],
        usdaQuery: "ground beef 80/20",
        units: {
          lb: 454,
          oz: 28,
          patty: 113,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: [],
          categoryColor: "#FFB3BA"
        }
      },
      "salmon": {
        displayName: "Salmon Fillet",
        aliases: ["atlantic salmon", "cooked salmon"],
        usdaQuery: "salmon fillet",
        units: {
          fillet: 150,
          oz: 28,
          lb: 454,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: [],
          categoryColor: "#FFB3BA"
        }
      }
    },
    "Vegetables": {
      "broccoli": {
        displayName: "Broccoli",
        aliases: ["fresh broccoli", "broccoli florets"],
        usdaQuery: "broccoli fresh",
        units: {
          cup_chopped: 91,
          head: 608,
          spear: 31,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#B5EAD7"
        }
      },
      "spinach": {
        displayName: "Spinach",
        aliases: ["fresh spinach", "baby spinach"],
        usdaQuery: "spinach fresh",
        units: {
          cup: 30,
          bunch: 340,
          bag: 142,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#B5EAD7"
        }
      },
      "onion": {
        displayName: "Onion",
        aliases: ["yellow onion", "white onion"],
        usdaQuery: "onion raw",
        units: {
          medium: 110,
          large: 150,
          cup_chopped: 160,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#B5EAD7"
        }
      }
    },
    "Fruits": {
      "apple": {
        displayName: "Apple",
        aliases: ["red apple", "green apple", "gala apple"],
        usdaQuery: "apple fresh",
        units: {
          medium: 182,
          large: 223,
          cup_sliced: 109,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFB3E6"
        }
      },
      "banana": {
        displayName: "Banana",
        aliases: ["fresh banana", "ripe banana"],
        usdaQuery: "banana fresh",
        units: {
          medium: 118,
          large: 136,
          cup_sliced: 150,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFB3E6"
        }
      },
      "blueberries": {
        displayName: "Blueberries",
        aliases: ["fresh blueberries", "wild blueberries"],
        usdaQuery: "blueberries fresh",
        units: {
          cup: 148,
          pint: 290,
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#FFB3E6"
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
          oz: 28,
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
          oz: 28,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan", "gluten-free"],
          categoryColor: "#F4E4BC"
        }
      },
      "pasta": {
        displayName: "Pasta",
        aliases: ["spaghetti", "penne", "macaroni"],
        usdaQuery: "pasta cooked",
        units: {
          cup_cooked: 124,
          oz_dry: 28,
          serving_dry: 56,
          g: 1
        },
        tags: {
          isCommon: true,
          densityType: "solid",
          dietType: ["vegetarian", "vegan"],
          categoryColor: "#F4E4BC"
        }
      }
    }
  }
};

// Utility functions for working with the ingredient database
export class IngredientDatabaseManager {
  
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
    
    Object.entries(ingredientDatabase.categories).forEach(([categoryName, category]) => {
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
    
    return results;
  }
  
  /**
   * Get ingredient by category and key
   */
  static getIngredient(category: string, key: string): IngredientData | null {
    return ingredientDatabase.categories[category]?.[key] || null;
  }
  
  /**
   * Convert between units for an ingredient
   */
  static convertUnits(
    category: string, 
    key: string, 
    fromAmount: number, 
    fromUnit: string, 
    toUnit: string
  ): number | null {
    const ingredient = this.getIngredient(category, key);
    if (!ingredient) return null;
    
    const fromGrams = ingredient.units[fromUnit];
    const toGrams = ingredient.units[toUnit];
    
    if (!fromGrams || !toGrams) return null;
    
    // Convert to grams first, then to target unit
    const gramsAmount = fromAmount * fromGrams;
    return gramsAmount / toGrams;
  }
  
  /**
   * Get all available units for an ingredient
   */
  static getAvailableUnits(category: string, key: string): string[] {
    const ingredient = this.getIngredient(category, key);
    return ingredient ? Object.keys(ingredient.units) : [];
  }
  
  /**
   * Get all categories
   */
  static getCategories(): string[] {
    return Object.keys(ingredientDatabase.categories);
  }
  
  /**
   * Get all ingredients in a category
   */
  static getCategoryIngredients(category: string): {key: string; data: IngredientData}[] {
    const categoryData = ingredientDatabase.categories[category];
    if (!categoryData) return [];
    
    return Object.entries(categoryData).map(([key, data]) => ({ key, data }));
  }
}

export default ingredientDatabase;