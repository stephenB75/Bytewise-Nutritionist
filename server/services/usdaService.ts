/**
 * USDA Food Database Service
 * 
 * Handles integration with USDA FoodData Central API
 * Provides offline caching and intelligent calorie calculations
 */

import { db } from '../db';
import { usdaFoodCache } from '@shared/schema';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { getPortionWeight, parseMeasurement } from '../data/portionData.js';
import { getCalorieFactors, calculateCaloriesFromMacros } from '../data/calorieFactors.js';
import { getRetentionFactors, applyRetentionFactors, detectCookingMethod } from '../data/retentionFactors.js';
import { classifyFood, getNutritionalPriorities } from '../data/foodCategories.js';
import { getProteinConversionFactor, calculateProteinFromNitrogen, getProteinCalculationMethod } from '../data/proteinFactors.js';
import { getNutrientById, validateNutrientValue, formatNutrientValue, getPriorityNutrients } from '../data/nutrientDatabase.js';

interface USDANutrient {
  id: number;
  number: string;
  name: string;
  rank: number;
  unitName: string;
}

interface USDAFoodNutrient {
  type?: string;
  id?: number;
  nutrient?: USDANutrient;
  foodNutrientDerivation?: {
    code: string;
    description: string;
  };
  median?: number;
  amount?: number;
  // Actual USDA API format
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDAFoodNutrient[];
  publicationDate?: string;
}

interface USDASearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

interface MeasurementConversion {
  measurement: string;
  grams: number;
  commonConversions?: { [key: string]: number };
}

export class USDAService {
  private apiKey: string;
  private baseUrl = 'https://api.nal.usda.gov/fdc/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search foods with USDA API and cache results
   */
  async searchFoods(query: string, pageSize = 25): Promise<USDAFood[]> {
    try {
      // First check local cache
      const cachedResults = await this.searchCachedFoods(query, pageSize);
      if (cachedResults.length > 0) {
        return this.formatCachedAsUSDAFood(cachedResults);
      }

      // Search USDA API
      const response = await fetch(`${this.baseUrl}/foods/search?api_key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          dataType: ['Foundation', 'Survey (FNDDS)'], // Exclude branded foods that often have zero values
          pageSize,
          pageNumber: 1,
          sortBy: 'dataType.keyword',
          sortOrder: 'asc'
        }),
      });

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data: USDASearchResponse = await response.json();
      
      // Cache popular results for offline use
      await this.cacheSearchResults(data.foods);
      
      return data.foods;
    } catch (error) {
      
      // Fallback to cached results only
      const cachedResults = await this.searchCachedFoods(query, pageSize);
      return this.formatCachedAsUSDAFood(cachedResults);
    }
  }

  /**
   * Get detailed food information by FDC ID
   */
  async getFoodDetails(fdcId: number): Promise<USDAFood | null> {
    try {
      // Check cache first
      const cached = await db
        .select()
        .from(usdaFoodCache)
        .where(eq(usdaFoodCache.fdcId, fdcId))
        .limit(1);

      if (cached.length > 0) {
        return this.formatCachedAsUSDAFood([cached[0]])[0];
      }

      // Fetch from USDA API
      const response = await fetch(`${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const food: USDAFood = await response.json();
      
      // Cache the result
      await this.cacheSearchResults([food]);
      
      return food;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate calories for ingredient with measurement
   */
  async calculateIngredientCalories(
    ingredientName: string,
    measurement: string
  ): Promise<{
    ingredient: string;
    measurement: string;
    estimatedCalories: number;
    equivalentMeasurement?: string;
    note?: string;
    nutritionPer100g?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }> {
    try {
      // Search for the ingredient
      const foods = await this.searchFoods(ingredientName, 5);
      
      if (foods.length === 0) {
        throw new Error(`No nutrition data found for "${ingredientName}"`);
      }

      // Filter and prioritize results with measurement context
      const filteredFoods = this.filterAndPrioritizeFoodsWithMeasurement(foods, ingredientName, measurement);
      if (filteredFoods.length === 0) {
        throw new Error('No suitable foods found');
      }
      
      // Use the most relevant result (first one after filtering)
      const food = filteredFoods[0];
      

      
      // Extract key nutrients
      let nutrients = this.extractNutrients(food.foodNutrients);
      
      // Apply cooking retention factors if food is prepared
      const cookingMethod = detectCookingMethod(food.description);
      const foodGroup = classifyFood(food.description);
      
      if (cookingMethod !== 'raw') {
        nutrients = applyRetentionFactors(nutrients, cookingMethod, foodGroup);
      }
      
      // Apply food-specific protein conversion factors if nitrogen data available
      const proteinFactor = getProteinConversionFactor(food.description, foodGroup);
      const proteinMethod = getProteinCalculationMethod(food.description);
      

      
      // Parse measurement and convert to grams
      const { quantity, unit, gramsEquivalent } = this.parseMeasurement(measurement, food);
      
      // Calculate calories based on grams using enhanced conversion factors
      let estimatedCalories: number;
      
      if (nutrients.calories > 0) {
        // Use direct calorie data if available
        estimatedCalories = Math.round((nutrients.calories * gramsEquivalent) / 100);
      } else if (nutrients.protein > 0 || nutrients.carbs > 0 || nutrients.fat > 0) {
        // Calculate using food-specific USDA conversion factors
        estimatedCalories = calculateCaloriesFromMacros(
          food.description,
          (nutrients.protein * gramsEquivalent) / 100,
          (nutrients.fat * gramsEquivalent) / 100,
          (nutrients.carbs * gramsEquivalent) / 100
        );

      } else {
        // Fallback to zero if no nutritional data
        estimatedCalories = 0;
      }
      
      // Generate equivalent measurement
      const caloriesPer100g = nutrients.calories || Math.round((estimatedCalories * 100) / gramsEquivalent);
      const equivalentMeasurement = this.generateEquivalentMeasurement(
        gramsEquivalent,
        unit,
        caloriesPer100g
      );
      
      // Generate size variation note
      const note = this.generateVariationNote(ingredientName, unit);

      return {
        ingredient: this.formatIngredientName(food.description),
        measurement: `${quantity} ${unit} (~${Math.round(gramsEquivalent)}g)`,
        estimatedCalories,
        equivalentMeasurement,
        note,
        nutritionPer100g: {
          calories: nutrients.calories,
          protein: nutrients.protein,
          carbs: nutrients.carbs,
          fat: nutrients.fat,
        },
        // Additional info removed to match interface
      };
    } catch (error) {
      
      // Fallback to enhanced estimation with proper nutrition data
      return this.getEnhancedFallbackEstimate(ingredientName, measurement);
    }
  }

  /**
   * Search cached foods locally
   */
  private async searchCachedFoods(query: string, limit: number) {
    return await db
      .select()
      .from(usdaFoodCache)
      .where(like(usdaFoodCache.description, `%${query}%`))
      .orderBy(desc(usdaFoodCache.searchCount))
      .limit(limit);
  }

  /**
   * Cache USDA search results
   */
  private async cacheSearchResults(foods: USDAFood[]) {
    for (const food of foods) {
      try {
        const nutrients = this.extractNutrients(food.foodNutrients);
        
        await db
          .insert(usdaFoodCache)
          .values({
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            foodCategory: food.foodCategory || null,
            brandOwner: food.brandOwner || null,
            brandName: food.brandName || null,
            ingredients: food.ingredients || null,
            servingSize: food.servingSize ? food.servingSize.toString() : null,
            servingSizeUnit: food.servingSizeUnit || null,
            householdServingFullText: food.householdServingFullText || null,
            nutrients: nutrients,
            searchCount: 1,
          })
          .onConflictDoUpdate({
            target: [usdaFoodCache.fdcId],
            set: {
              searchCount: sql`${usdaFoodCache.searchCount} + 1`,
              lastUpdated: new Date(),
            },
          });
      } catch (error) {
      }
    }
  }

  /**
   * Extract and normalize nutrients from USDA data
   */
  private extractNutrients(foodNutrients: USDAFoodNutrient[]) {
    const nutrients: any = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    if (!foodNutrients || !Array.isArray(foodNutrients)) {
      return nutrients;
    }

    for (const nutrient of foodNutrients) {
      // Handle actual USDA API format
      if (!nutrient || (!nutrient.nutrientName && !nutrient.nutrient?.name)) {
        continue;
      }
      
      // Extract data from actual API response format
      const name = (nutrient.nutrientName || nutrient.nutrient?.name || '').toLowerCase();
      const amount = nutrient.value || nutrient.amount || 0;
      const nutrientId = nutrient.nutrientId || nutrient.nutrient?.id;



      // Map using exact USDA nutrient IDs and names
      if (name.includes('energy') || name.includes('calorie') || nutrientId === 1008) {
        nutrients.calories = amount;
      } else if (name.includes('protein') || nutrientId === 1003) {
        nutrients.protein = amount;
      } else if ((name.includes('carbohydrate') && !name.includes('fiber')) || nutrientId === 1005) {
        nutrients.carbs = amount;
      } else if (name.includes('total lipid') || name.includes('fat') || nutrientId === 1004) {
        nutrients.fat = amount;
      } else if (name.includes('fiber') || nutrientId === 1079) {
        nutrients.fiber = amount;
      } else if (name.includes('sugar') || nutrientId === 2000) {
        nutrients.sugar = amount;
      } else if (name.includes('sodium') || nutrientId === 1093) {
        nutrients.sodium = amount > 100 ? amount / 1000 : amount; // Convert mg to g if needed
      }
    }

    return nutrients;
  }

  /**
   * Parse measurement string and convert to grams
   */
  private parseMeasurement(measurement: string, food: USDAFood): {
    quantity: number;
    unit: string;
    gramsEquivalent: number;
  } {
    // Remove extra whitespace and normalize
    let normalized = measurement.toLowerCase().trim();
    
    // Enhanced text-to-number conversion
    normalized = this.convertTextToNumbers(normalized);
    
    // Extract quantity and unit with comprehensive parsing
    let quantity = 1;
    let unit = normalized;
    
    // Handle Unicode fractions (½, ¼, ¾, ⅓, ⅔)
    const unicodeFractionMatch = normalized.match(/^([½¼¾⅓⅔])\s+(.+)$/);
    if (unicodeFractionMatch) {
      const fractionMap: { [key: string]: number } = {
        '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.666
      };
      quantity = fractionMap[unicodeFractionMatch[1]];
      unit = unicodeFractionMatch[2].trim();
    } else {
      // Handle fractions like "1/2", "3/4" (both with and without units)
      const fractionWithUnitMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)\s+(.+)$/);
      const fractionOnlyMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);
      
      if (fractionWithUnitMatch) {
        const numerator = parseFloat(fractionWithUnitMatch[1]);
        const denominator = parseFloat(fractionWithUnitMatch[2]);
        quantity = numerator / denominator;
        unit = fractionWithUnitMatch[3].trim();
      } else if (fractionOnlyMatch) {
        // Fraction without unit - default to medium/piece
        const numerator = parseFloat(fractionOnlyMatch[1]);
        const denominator = parseFloat(fractionOnlyMatch[2]);
        quantity = numerator / denominator;
        unit = 'medium';
      } else {
        // Handle mixed numbers like "1 1/2"
        const mixedMatch = normalized.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\s*(.+)$/);
        if (mixedMatch) {
          const whole = parseFloat(mixedMatch[1]);
          const numerator = parseFloat(mixedMatch[2]);
          const denominator = parseFloat(mixedMatch[3]);
          quantity = whole + (numerator / denominator);
          unit = mixedMatch[4].trim();
        } else {
          // Handle parenthetical notes like "1 cup (140g)" - prioritize main measurement
          const parentheticalMatch = normalized.match(/^(.+?)\s*\((.+?)\)(.*)$/);
          if (parentheticalMatch) {
            const beforeParen = parentheticalMatch[1].trim();
            // Always use the measurement before parentheses as the primary
            const match = beforeParen.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
            quantity = match ? parseFloat(match[1]) : 1;
            unit = match ? match[2].trim() : beforeParen;
          } else {
            // Handle regular decimal numbers
            const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
            quantity = match ? parseFloat(match[1]) : 1; 
            unit = match ? match[2].trim() : normalized;
          }
        }
      }
    }

    // Enhanced unit recognition with comprehensive variations
    const unitVariations: { [key: string]: string[] } = {
      'cup': ['cup', 'cups', 'c'],
      'tablespoon': ['tablespoon', 'tablespoons', 'tbsp', 'tbs'],
      'teaspoon': ['teaspoon', 'teaspoons', 'tsp', 'ts'],
      'gram': ['gram', 'grams', 'g'],
      'kilogram': ['kilogram', 'kilograms', 'kg'],
      'ounce': ['ounce', 'ounces', 'oz'],
      'pound': ['pound', 'pounds', 'lb', 'lbs'],
      'piece': ['piece', 'pieces', 'unit', 'units', 'item', 'items'],
      'slice': ['slice', 'slices'],
      'bowl': ['bowl', 'bowls'],
      'plate': ['plate', 'plates'],
      'pinch': ['pinch', 'pinches', 'dash', 'sprinkle'],
      'handful': ['handful', 'handfuls']
    };

    // Standard conversions with base unit names
    const conversions: { [key: string]: number } = {
      'gram': 1,
      'kilogram': 1000,
      'ounce': 28.35,
      'pound': 453.6,
      'cup': 240, // standard cup volume ≈ 240ml/g
      'cups': 240, // same as singular for consistency
      'tablespoon': 15,
      'teaspoon': 5,
      'ml': 1, // for liquids, approximate to grams
      'milliliter': 1,
      'milliliters': 1,
      'l': 1000,
      'liter': 1000,
      'liters': 1000,
      // Common user phrases
      'scoop': 30, // protein powder scoop ≈ 30g
      'pinch': 0.5, // pinch of salt/spice ≈ 0.5g
      'splash': 5, // splash of liquid ≈ 5ml
      'dollop': 15, // dollop ≈ 1 tablespoon
      'handful': 40, // handful of nuts/berries ≈ 40g
      'slice': 25, // average slice of bread/fruit ≈ 25g
      'piece': 50, // piece of fruit/food ≈ 50g
      'bowl': 200, // average bowl serving ≈ 200g
      'plate': 300, // average plate serving ≈ 300g
      'wedge': 15, // wedge of lemon/lime ≈ 15g
      'sprig': 1, // sprig of herbs ≈ 1g
      'leaf': 0.5, // single leaf ≈ 0.5g
      'clove': 3, // garlic clove ≈ 3g
      'stick': 113, // butter stick ≈ 113g
      'pat': 5, // pat of butter ≈ 5g
    };

    // Item-specific conversions
    const itemConversions: { [key: string]: { [key: string]: number } } = {
      'egg': {
        'whole': 50,
        'large': 50,
        'medium': 44,
        'small': 38,
        'extra large': 56,
      },
      'grape': {
        'grape': 5,
        'grapes': 5,
        'bunch': 100,
      },
    };

    let gramsEquivalent = quantity;

    // Check for item-specific conversions first
    const ingredientName = food.description.toLowerCase();
    for (const [ingredient, conversions] of Object.entries(itemConversions)) {
      if (ingredientName.includes(ingredient)) {
        for (const [unitPattern, grams] of Object.entries(conversions)) {
          if (unit.includes(unitPattern)) {
            gramsEquivalent = quantity * grams;
            return { quantity, unit, gramsEquivalent };
          }
        }
      }
    }

    // Enhanced unit matching with variations
    let unitMatched = false;
    
    // First, try to match using unit variations
    for (const [baseUnit, variations] of Object.entries(unitVariations)) {
      for (const variation of variations) {
        if (unit.includes(variation)) {
          const conversionFactor = conversions[baseUnit];
          if (conversionFactor) {
            gramsEquivalent = quantity * conversionFactor;
            unitMatched = true;
            break;
          }
        }
      }
      if (unitMatched) break;
    }
    
    // If no variation matched, try direct conversion lookup
    if (!unitMatched) {
      for (const [unitPattern, grams] of Object.entries(conversions)) {
        if (unit.includes(unitPattern)) {
          gramsEquivalent = quantity * grams;
          break;
        }
      }
    }

    // If no conversion found, check if unit suggests grams or use serving size
    if (gramsEquivalent === quantity) {
      if (unit.includes('g') || unit.includes('gram')) {
        // Already in grams, don't multiply
        gramsEquivalent = quantity;
      } else if (food.servingSize) {
        gramsEquivalent = quantity * food.servingSize;
      } else {
        // For items like "medium", "large", use food-specific defaults
        const foodType = food.description.toLowerCase();
        if (foodType.includes('apple')) {
          gramsEquivalent = quantity * 180; // medium apple
        } else if (foodType.includes('banana')) {
          gramsEquivalent = quantity * 120; // medium banana  
        } else if (foodType.includes('lettuce') && unit.includes('cup')) {
          gramsEquivalent = quantity * 47; // 1 cup chopped lettuce
        } else {
          gramsEquivalent = quantity * 100; // fallback
        }
      }
    }

    return { quantity, unit, gramsEquivalent };
  }

  /**
   * Convert text-based numbers and fractions to numeric equivalents
   */
  private convertTextToNumbers(text: string): string {
    const wordNumbers: { [key: string]: string } = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
    };
    
    const fractionWords: { [key: string]: string } = {
      'half': '1/2', 'quarter': '1/4', 'third': '1/3',
      'three quarters': '3/4', 'two thirds': '2/3',
      'one half': '1/2', 'one quarter': '1/4', 'one third': '1/3',
      'a half': '1/2', 'a quarter': '1/4', 'a third': '1/3'
    };
    
    let converted = text;
    
    // Convert fraction words first (longer phrases first to avoid conflicts)
    const sortedFractionWords = Object.entries(fractionWords).sort((a, b) => b[0].length - a[0].length);
    for (const [phrase, fraction] of sortedFractionWords) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      converted = converted.replace(regex, fraction);
    }
    
    // Convert word numbers
    for (const [word, number] of Object.entries(wordNumbers)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      converted = converted.replace(regex, number);
    }
    
    return converted;
  }

  /**
   * Filter and prioritize food results with measurement context
   */
  private filterAndPrioritizeFoodsWithMeasurement(foods: USDAFood[], searchTerm: string, measurement: string = ''): USDAFood[] {
    const measurementLower = measurement.toLowerCase();
    
    return this.filterAndPrioritizeFoods(foods, searchTerm, measurementLower);
  }

  /**
   * Filter and prioritize food results for better matching
   */
  private filterAndPrioritizeFoods(foods: USDAFood[], searchTerm: string, measurementContext: string = ''): USDAFood[] {
    const searchLower = searchTerm.toLowerCase();
    
    // First filter out foods with insufficient nutrition data
    const validFoods = foods.filter(food => {
      const hasEnergy = food.foodNutrients.some(n => 
        (n.nutrientId === 1008 || (n.nutrientName && n.nutrientName.toLowerCase().includes('energy'))) && 
        (n.value || 0) > 0
      );
      return hasEnergy || food.dataType === 'Foundation'; // Always include Foundation foods
    });
    

    
    // Score foods based on relevance and data quality
    const scoredFoods = validFoods.map(food => {
      let score = 0;
      const description = food.description.toLowerCase();
      
      // Higher score for exact matches
      if (description.includes(searchLower)) score += 100;
      if (description === searchLower) score += 200;
      
      // Strongly prefer Foundation and Survey data over Branded
      if (food.dataType === 'Foundation') score += 150;
      else if (food.dataType === 'Survey (FNDDS)') score += 120;
      else if (food.dataType === 'Branded') score += 30;
      
      // Check for actual energy data
      const hasEnergy = food.foodNutrients.some(n => 
        (n.nutrientId === 1008) && (n.value || 0) > 0);
      if (hasEnergy) score += 100;
      
      // Smart food selection based on ingredient and measurement context
      if (searchLower.includes('banana')) {
        // Strongly prefer fresh raw bananas over overripe
        if (description.includes('raw') && !description.includes('overripe')) score += 300;
        if (description.includes('overripe')) score -= 300; // Heavily penalize overripe
      }
      
      if (searchLower.includes('rice')) {
        // Prefer cooked rice for volume measurements (cup), raw for weight (grams)
        if (measurementContext.includes('cup')) {
          if (description.includes('cooked') || description.includes('steamed')) score += 200;
          if (description.includes('flour') || description.includes('dry') || description.includes('raw')) score -= 200;
        } else if (measurementContext.includes('g')) {
          if (description.includes('raw') && !description.includes('flour')) score += 100;
          if (description.includes('flour')) score -= 100;
        }
      }
      
      // Prefer raw/basic ingredients
      if (description.includes('raw') || description.includes('fresh')) score += 50;
      if (!description.includes('prepared') && !description.includes('seasoned')) score += 30;
      
      return { food, score };
    });
    
    // Sort by score and return top results
    return scoredFoods
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.food);
  }

  /**
   * Generate equivalent measurement for context
   */
  private generateEquivalentMeasurement(
    grams: number,
    originalUnit: string,
    caloriesPer100g: number
  ): string {
    if (originalUnit.includes('cup') && grams < 50) {
      const tablespoons = Math.round(grams / 15);
      const tbspCalories = Math.round((caloriesPer100g * tablespoons * 15) / 100);
      return `${tablespoons} tablespoons ≈ ${tbspCalories} kcal`;
    }
    
    if (originalUnit.includes('tablespoon') && grams > 100) {
      const cups = Math.round((grams / 240) * 10) / 10;
      const cupCalories = Math.round((caloriesPer100g * cups * 240) / 100);
      return `${cups} cup ≈ ${cupCalories} kcal`;
    }
    
    if (grams !== 100) {
      const per100gCalories = Math.round(caloriesPer100g);
      return `100g ≈ ${per100gCalories} kcal`;
    }

    return '';
  }

  /**
   * Generate variation note about size/preparation
   */
  private generateVariationNote(ingredientName: string, unit: string): string {
    const ingredient = ingredientName.toLowerCase();
    
    if (ingredient.includes('egg') && unit.includes('whole')) {
      return 'Calories may vary slightly by size (small = 55 kcal, extra large = 80 kcal)';
    }
    
    if (ingredient.includes('grape')) {
      return 'Calories vary by grape variety (red/green similar, cotton candy grapes higher)';
    }
    
    if (ingredient.includes('salad') || ingredient.includes('prepared')) {
      return 'Calories vary significantly based on preparation and ingredients used';
    }
    
    if (unit.includes('cup') || unit.includes('tablespoon')) {
      return 'Calories may vary based on how tightly packed the ingredient is';
    }
    
    return 'Calories may vary based on variety, size, and preparation method';
  }

  /**
   * Format ingredient name for display
   */
  private formatIngredientName(description: string): string {
    // Clean up USDA description formatting
    return description
      .replace(/,\s*raw/i, '')
      .replace(/,\s*cooked/i, '')
      .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical info
      .trim();
  }

  /**
   * Convert cached food to USDA format
   */
  private formatCachedAsUSDAFood(cached: any[]): USDAFood[] {
    return cached.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      foodCategory: food.foodCategory,
      brandOwner: food.brandOwner,
      brandName: food.brandName,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      householdServingFullText: food.householdServingFullText,
      foodNutrients: this.convertNutrientsToUSDAFormat(food.nutrients),
    }));
  }

  /**
   * Convert stored nutrients back to USDA format
   */
  private convertNutrientsToUSDAFormat(nutrients: any): USDAFoodNutrient[] {
    const usdaFormat: USDAFoodNutrient[] = [];
    
    const nutrientMap = {
      calories: { id: 1008, name: 'Energy', unitName: 'kcal' },
      protein: { id: 1003, name: 'Protein', unitName: 'g' },
      carbs: { id: 1005, name: 'Carbohydrate, by difference', unitName: 'g' },
      fat: { id: 1004, name: 'Total lipid (fat)', unitName: 'g' },
      fiber: { id: 1079, name: 'Fiber, total dietary', unitName: 'g' },
      sugar: { id: 2000, name: 'Sugars, total including NLEA', unitName: 'g' },
      sodium: { id: 1093, name: 'Sodium, Na', unitName: 'mg' },
    };

    for (const [key, nutrient] of Object.entries(nutrientMap)) {
      if (nutrients[key] !== undefined) {
        usdaFormat.push({
          type: 'FoodNutrient',
          id: nutrient.id,
          amount: nutrients[key],
          nutrient: {
            id: nutrient.id,
            number: nutrient.id.toString(),
            name: nutrient.name,
            rank: 1,
            unitName: nutrient.unitName,
          },
          // Add required fields for actual API format
          nutrientId: nutrient.id,
          nutrientName: nutrient.name,
          nutrientNumber: nutrient.id.toString(),
          unitName: nutrient.unitName,
          value: nutrients[key],
        });
      }
    }

    return usdaFormat;
  }

  /**
   * Enhanced calorie estimation using USDA portion data and conversion factors
   */
  private getEnhancedFallbackEstimate(ingredientName: string, measurement: string) {
    // First try to get precise portion weight from USDA data
    const { quantity, unit } = parseMeasurement(measurement);
    const portionWeight = getPortionWeight(ingredientName, unit);
    
    // Detect if food is cooked and apply retention factors
    const cookingMethod = detectCookingMethod(ingredientName);
    const foodGroup = classifyFood(ingredientName);
    
    // Comprehensive fallback estimates per 100g based on USDA averages
    const fallbackData: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
      // Fruits
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
      'grape': { calories: 62, protein: 0.6, carbs: 16, fat: 0.2 },
      'cherry': { calories: 63, protein: 1.1, carbs: 16, fat: 0.2 },
      
      // Proteins  
      'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 12 },
      'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      
      // Grains
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
      
      // Vegetables
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      
      // Processed/Fast Foods
      'hotdog': { calories: 290, protein: 10, carbs: 2, fat: 26 },
      'hot dog': { calories: 290, protein: 10, carbs: 2, fat: 26 },
      'sausage': { calories: 290, protein: 10, carbs: 2, fat: 26 },
      'french fries': { calories: 365, protein: 4, carbs: 63, fat: 17 },
      'fries': { calories: 365, protein: 4, carbs: 63, fat: 17 },
      'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10 },
      'hamburger': { calories: 540, protein: 25, carbs: 40, fat: 31 },
      'cheeseburger': { calories: 540, protein: 25, carbs: 40, fat: 31 },
      'ice cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11 },
      'cookie': { calories: 502, protein: 5.9, carbs: 64, fat: 24 },
      'donut': { calories: 452, protein: 4.9, carbs: 51, fat: 25 },
    };

    const ingredient = ingredientName.toLowerCase();
    let nutritionData = { calories: 100, protein: 2, carbs: 15, fat: 1 }; // default

    for (const [key, data] of Object.entries(fallbackData)) {
      if (ingredient.includes(key)) {
        nutritionData = data;
        break;
      }
    }

    // Calculate gram equivalent - use USDA portion data if available, fallback otherwise
    let gramsEquivalent: number;
    if (portionWeight) {
      gramsEquivalent = portionWeight * quantity;
    } else {
      // Use our internal measurement parsing for consistency
      const { quantity: qty, unit: unt } = parseMeasurement(measurement);
      
      // Apply standard cup conversions for consistency
      if (unt.includes('cup')) {
        gramsEquivalent = qty * 240; // Standard cup volume
      } else if (unt.includes('piece') || unt.includes('item')) {
        gramsEquivalent = qty * 50; // Standard piece weight for hotdog
      } else if (unt.includes('slice')) {
        gramsEquivalent = qty * 25; // Standard slice weight
      } else {
        const fallbackResult = this.parseFallbackMeasurement(measurement);
        gramsEquivalent = fallbackResult.gramsEquivalent;
      }
    }

    // Apply cooking retention factors if needed
    let adjustedNutrition = { ...nutritionData };
    if (cookingMethod !== 'raw') {
      const fullNutrients = applyRetentionFactors(
        { 
          calories: nutritionData.calories,
          protein: nutritionData.protein, 
          fat: nutritionData.fat, 
          carbs: nutritionData.carbs,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        cookingMethod,
        foodGroup
      );
      adjustedNutrition = {
        calories: fullNutrients.calories,
        protein: fullNutrients.protein,
        carbs: fullNutrients.carbs,
        fat: fullNutrients.fat
      };
    }
    
    // Use food-specific calorie conversion factors for more accuracy
    const enhancedCalories = calculateCaloriesFromMacros(
      ingredientName,
      (adjustedNutrition.protein * gramsEquivalent) / 100,
      (adjustedNutrition.fat * gramsEquivalent) / 100,
      (adjustedNutrition.carbs * gramsEquivalent) / 100
    );

    return {
      ingredient: ingredientName.toUpperCase(),
      measurement: `${measurement} (~${Math.round(gramsEquivalent)}g)`,
      estimatedCalories: Math.round(enhancedCalories),
      equivalentMeasurement: `100g ≈ ${nutritionData.calories} kcal`,
      note: portionWeight ? 
        'Enhanced estimate using USDA portion database and food-specific conversion factors' :
        'Estimate based on USDA nutrition averages with enhanced conversion factors',
      nutritionPer100g: nutritionData,
      usdaPortionUsed: !!portionWeight,
    };
  }

  private parseFallbackMeasurement(measurement: string): { gramsEquivalent: number } {
    // Use our internal, corrected parseMeasurement instead of the external one
    const result = this.parseMeasurement(measurement, {} as USDAFood);
    return { gramsEquivalent: result.gramsEquivalent };
  }
}

export const usdaService = new USDAService(process.env.USDA_API_KEY || 'DEMO_KEY');