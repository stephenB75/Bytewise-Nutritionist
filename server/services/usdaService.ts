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
        return cachedResults.map(food => ({
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          foodNutrients: JSON.parse(food.nutrients || '[]'),
          foodCategory: food.foodCategory || undefined
        }));
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
      return cachedResults.map(food => ({
        fdcId: food.fdcId,
        description: food.description,
        dataType: food.dataType,
        foodNutrients: JSON.parse(food.nutrients || '[]'),
        foodCategory: food.foodCategory || undefined
      }));
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
        const cachedFood = cached[0];
        return {
          fdcId: cachedFood.fdcId,
          description: cachedFood.description,
          dataType: cachedFood.dataType || 'Foundation',
          foodNutrients: JSON.parse(cachedFood.nutrients || '[]') as USDAFoodNutrient[],
          foodCategory: cachedFood.foodCategory || undefined
        };
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
      // First try liquid fallbacks and enhanced fallback data
      try {
        const fallbackResult = this.getEnhancedFallbackEstimate(ingredientName, measurement);
        if (fallbackResult) {
          return fallbackResult;
        }
      } catch (error) {
        // Continue to USDA search if no fallback available
      }

      // Enhanced search with preprocessing
      const enhancedQuery = this.preprocessIngredientQuery(ingredientName);
      const foods = await this.searchFoods(enhancedQuery, 8);
      
      if (foods.length === 0) {
        throw new Error(`No nutrition data found for "${ingredientName}"`);
      }

      // Advanced filtering with ingredient vs dish classification
      const filteredFoods = this.filterAndPrioritizeFoods(foods, ingredientName, measurement.toLowerCase());
      if (filteredFoods.length === 0) {
        throw new Error('No suitable foods found');
      }
      
      // Use the most relevant result (first one after filtering)
      const food = filteredFoods[0];
      

      
      // Validate food match quality before proceeding
      if (this.isIncorrectFoodMatch(ingredientName, food.description)) {
        throw new Error('Incorrect food match detected, using fallback');
      }

      // Extract and validate nutrients
      let nutrients = this.extractNutrients(food.foodNutrients);
      
      // Simple validation - skip complex unreasonable calorie check for now
      if (nutrients.calories < 0 || nutrients.calories > 900) {
        throw new Error('Invalid calorie data from USDA, using fallback');
      }
      
      // Apply cooking adjustments if needed
      const cookingMethod = detectCookingMethod(food.description);
      if (cookingMethod !== 'raw') {
        const foodGroup = classifyFood(food.description);
        nutrients = applyRetentionFactors(nutrients, cookingMethod, foodGroup);
      }
      
      // Parse measurement and convert to grams
      const { quantity, unit, gramsEquivalent } = this.parseMeasurement(measurement, food);
      
      // Calculate calories based on grams
      const estimatedCalories = Math.round((nutrients.calories * gramsEquivalent) / 100);
      
      return {
        ingredient: food.description,
        measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
        estimatedCalories,
        equivalentMeasurement: `100g ≈ ${nutrients.calories} kcal`,
        note: `From USDA database (${food.dataType})`,
        nutritionPer100g: nutrients
      };
    } catch (error) {
      
      // Fallback to enhanced estimation with proper nutrition data
      return this.getEnhancedFallbackEstimate(ingredientName, measurement);
    }
  }

  // Constants for food preprocessing
  private static readonly FOOD_SYNONYMS: Record<string, string> = {
    // Corn variations
    'corn on the cob': 'corn sweet yellow ear',
    'corn on cob': 'corn sweet yellow ear',
    'can of corn': 'corn sweet yellow canned',
    'frozen corn': 'corn sweet kernel frozen',
    'fresh corn': 'corn sweet yellow kernel',
    'corn kernels': 'corn sweet yellow kernel',
    
    // Chicken preparations
    'grilled chicken breast': 'chicken breast grilled',
    'fried chicken breast': 'chicken breast fried',
    'baked chicken breast': 'chicken breast baked',
    'roasted chicken breast': 'chicken breast roasted',
    
    // Common dishes
    'pasta with marinara': 'pasta cooked marinara sauce',
    'beef stew': 'beef stew cooked',
    'baked potato': 'potato baked',
    'raw potato': 'potato raw',
    'mashed potatoes': 'potato mashed',
    'french fries': 'potato french fried',
    'scrambled eggs': 'egg scrambled',
    'boiled eggs': 'egg hard boiled',
    'fried eggs': 'egg fried',
    
    // International cuisine
    'sushi roll': 'sushi california roll',
    'pad thai': 'pad thai noodles chicken',
    'tikka masala': 'chicken tikka masala',
    'biryani': 'rice pilaf biryani',
    'ramen noodles': 'soup ramen noodles',
    'tacos': 'taco beef',
    'enchiladas': 'enchilada beef',
    'gyoza': 'dumpling pork gyoza',
    'pierogi': 'dumpling potato pierogi',
    'falafel': 'chickpea falafel',
    'baklava': 'pastry baklava honey',
    
    // Caribbean cuisine
    'jerk chicken': 'chicken breast jerk seasoned',
    'rice and beans': 'rice kidney beans cooked',
    'plantains': 'plantain cooked',
    'fried plantains': 'plantain fried sweet',
    'sweet plantains': 'plantain sweet fried',
    'green plantains': 'plantain green boiled',
    'curry goat': 'goat meat stewed caribbean curry',
    'curry chicken': 'chicken curry caribbean',
    'oxtail': 'beef oxtail braised',
    'ackee and saltfish': 'ackee canned saltfish',
    'callaloo': 'callaloo cooked',
    'roti': 'tortilla flour wheat caribbean',
    'doubles': 'bread bara chickpea curry',
    'patties': 'pastry meat jamaican',
    'beef patty': 'pastry beef jamaican',
    'chicken patty': 'pastry chicken jamaican',
    'festival': 'cornbread fried sweet caribbean',
    'johnny cakes': 'cornbread fried caribbean bread',
    'bammy': 'cassava bread fried caribbean',
    'cassava': 'cassava root boiled',
    'yuca': 'cassava root boiled',
    'breadfruit': 'breadfruit boiled',
    'saltfish': 'cod salt dried',
    'conch': 'conch meat cooked',
    'escovitch fish': 'fish fried pickled',
    'brown stew chicken': 'chicken stewed brown sauce',
    'peas and rice': 'rice pigeon peas coconut',
    'macaroni pie': 'macaroni cheese baked caribbean'
  };

  private static readonly COOKING_METHODS = ['grilled', 'fried', 'baked', 'roasted', 'boiled', 'steamed', 'raw', 'fresh', 'cooked'];
  private static readonly PREPARATION_FORMS = ['canned', 'frozen', 'dried', 'fresh', 'pickled', 'smoked'];
  private static readonly FALLBACK_FOODS = ['apple', 'chicken', 'chicken breast', 'hotdog', 'hot dog', 'egg', 'rice', 'bread', 'pasta', 'corn', 'sweet corn', 'corn on cob', 'corn on the cob', 'potato', 'baked potato'];

  // Comprehensive fallback nutrition data per 100g
  private static readonly FALLBACK_NUTRITION: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
    // Fruits
    'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
    'grape': { calories: 62, protein: 0.6, carbs: 16, fat: 0.2 },
    'cherry': { calories: 63, protein: 1.1, carbs: 16, fat: 0.2 },
    'cantaloupe': { calories: 34, protein: 0.8, carbs: 8, fat: 0.2 },
    'watermelon': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
    'honeydew': { calories: 36, protein: 0.5, carbs: 9, fat: 0.1 },
    
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
    'corn': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4 },
    'sweet corn': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4 },
    'corn on cob': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4 },
    'corn on the cob': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4 },
    'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    'baked potato': { calories: 93, protein: 2.5, carbs: 21, fat: 0.1 },
    
    // Processed Foods
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
    
    // Caribbean foods
    'plantains': { calories: 122, protein: 1.3, carbs: 32, fat: 0.4 },
    'fried plantains': { calories: 148, protein: 1.1, carbs: 38, fat: 0.1 },
    'jerk chicken': { calories: 190, protein: 29, carbs: 2, fat: 7 },
    'rice and beans': { calories: 205, protein: 8, carbs: 38, fat: 3 },
    'beef patty': { calories: 350, protein: 15, carbs: 30, fat: 20 },
    'chicken patty': { calories: 320, protein: 16, carbs: 28, fat: 18 },
    'roti': { calories: 230, protein: 6, carbs: 45, fat: 4 },
    'festival': { calories: 180, protein: 3, carbs: 35, fat: 4 },
    'johnny cakes': { calories: 165, protein: 3, carbs: 32, fat: 3 },
    'cassava': { calories: 160, protein: 1.4, carbs: 38, fat: 0.3 },
    'breadfruit': { calories: 103, protein: 1.1, carbs: 27, fat: 0.2 },
    'callaloo': { calories: 22, protein: 2.1, carbs: 3.7, fat: 0.3 },
    'curry goat': { calories: 250, protein: 22, carbs: 5, fat: 16 },
    'oxtail': { calories: 330, protein: 19, carbs: 0, fat: 28 },
    'saltfish': { calories: 290, protein: 62, carbs: 0, fat: 2.4 },
    'ackee': { calories: 151, protein: 2.9, carbs: 0.8, fat: 15 }
  };

  /**
   * Preprocess ingredient queries for better matching
   */
  private preprocessIngredientQuery(ingredientName: string): string {
    const query = ingredientName.toLowerCase().trim();
    
    // Handle singular to plural conversions for better USDA matching
    const singularToPlural: Record<string, string> = {
      'carrot': 'carrots',
      'tomato': 'tomatoes', 
      'potato': 'potatoes',
      'onion': 'onions',
      'pepper': 'peppers',
      'mushroom': 'mushrooms',
      'cucumber': 'cucumbers',
      'celery': 'celery', // already correct
      'lettuce': 'lettuce', // already correct
      'spinach': 'spinach', // already correct
      'broccoli': 'broccoli' // already correct
    };
    
    // Convert singular basic vegetables to plural for better USDA matching
    if (singularToPlural[query]) {
      return singularToPlural[query];
    }
    
    // Check for direct synonym matches
    if (USDAService.FOOD_SYNONYMS[query]) {
      return USDAService.FOOD_SYNONYMS[query];
    }

    // Extract cooking methods and preparation forms
    let cookingMethod = '';
    let preparationForm = '';
    let cleanQuery = query;

    // Find cooking method
    for (const method of USDAService.COOKING_METHODS) {
      if (query.includes(method)) {
        cookingMethod = method;
        cleanQuery = query.replace(method, '').trim();
        break;
      }
    }

    // Find preparation form
    for (const form of USDAService.PREPARATION_FORMS) {
      if (cleanQuery.includes(form)) {
        preparationForm = form;
        cleanQuery = cleanQuery.replace(form, '').trim();
        break;
      }
    }

    // Rebuild query for better USDA matching
    let enhancedQuery = cleanQuery;
    if (preparationForm) enhancedQuery += ` ${preparationForm}`;
    if (cookingMethod && cookingMethod !== 'fresh') enhancedQuery += ` ${cookingMethod}`;

    return enhancedQuery.trim() || query;
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
      'piece': 30, // average piece ≈ 30g (adjusted for dumplings/small items)
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
      'falafel': {
        'piece': 17,
        'ball': 17,
        'pieces': 17,
      },
      'pierogi': {
        'piece': 28,
        'dumpling': 28,
        'pieces': 28,
      },
      'gyoza': {
        'piece': 15,
        'dumpling': 15,
        'pieces': 15,
      },
      'baklava': {
        'piece': 60,
        'square': 60,
        'pieces': 60,
      },
      'sushi': {
        'piece': 30,
        'roll': 180,
        'pieces': 30,
      },
      'taco': {
        'piece': 85,
        'taco': 85,
        'pieces': 85,
      },
      'plantain': {
        'medium': 179,
        'large': 218,
        'small': 148,
        'piece': 179,
        'slice': 20,
      },
      'patty': {
        'patty': 142,
        'piece': 142,
        'jamaican': 142,
      },
      'roti': {
        'piece': 85,
        'roti': 85,
      },
      'festival': {
        'piece': 65,
        'festival': 65,
      },
      'cassava': {
        'medium': 400,
        'cup': 103,
        'serving': 150,
      },
      'breadfruit': {
        'medium': 350,
        'cup': 220,
        'slice': 60,
      },
    };

    let gramsEquivalent = quantity;

    // Check for item-specific conversions first - prioritize ingredient name over food description
    const ingredientName = (food.description?.toLowerCase() || '').replace(/[^\w\s]/g, ' ');
    
    for (const [ingredient, conversions] of Object.entries(itemConversions)) {
      // Check the food description for ingredient matches
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
      if (unit.match(/^g$|^grams?$|^\d+g$/) || unit.includes('gram')) {
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

  // Text conversion constants
  private static readonly WORD_NUMBERS: Record<string, string> = {
    'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
    'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
  };
  
  private static readonly FRACTION_WORDS: Record<string, string> = {
    'three quarters': '3/4', 'two thirds': '2/3', 'one quarter': '1/4',
    'one third': '1/3', 'one half': '1/2', 'a quarter': '1/4',
    'a third': '1/3', 'a half': '1/2', 'quarter': '1/4',
    'third': '1/3', 'half': '1/2'
  };

  /**
   * Convert text-based numbers and fractions to numeric equivalents
   */
  private convertTextToNumbers(text: string): string {
    let converted = text;
    
    // Convert fraction words first (longer phrases first to avoid conflicts)
    const sortedFractionWords = Object.entries(USDAService.FRACTION_WORDS)
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [phrase, fraction] of sortedFractionWords) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      converted = converted.replace(regex, fraction);
    }
    
    // Convert word numbers
    for (const [word, number] of Object.entries(USDAService.WORD_NUMBERS)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      converted = converted.replace(regex, number);
    }
    
    return converted;
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
      
      // PRIORITIZE SIMPLE, BASIC INGREDIENTS
      // Strong penalty for composite/mixed dishes
      if (description.includes(' and ') || description.includes(', ')) score -= 200;
      if (description.includes('with ') || description.includes('mixed')) score -= 150;
      if (description.includes('salad') || description.includes('dish') || description.includes('recipe')) score -= 300;
      
      // Strong preference for basic ingredient names
      const basicTerms = ['raw', 'fresh', 'plain', 'unsweetened', 'unflavored'];
      for (const term of basicTerms) {
        if (description.includes(term)) score += 200;
      }
      
      // Higher score for exact matches
      if (description.includes(searchLower)) score += 100;
      if (description === searchLower) score += 300;
      if (description.startsWith(searchLower + ',')) score += 250; // "broccoli, raw"
      
      // Strongly prefer Foundation and Survey data over Branded
      if (food.dataType === 'Foundation') score += 150;
      else if (food.dataType === 'Survey (FNDDS)') score += 120;
      else if (food.dataType === 'Branded') score += 30;
      
      // Check for actual energy data
      const hasEnergy = food.foodNutrients.some(n => 
        (n.nutrientId === 1008) && (n.value || 0) > 0);
      if (hasEnergy) score += 100;
      
      // Apply food-specific scoring logic
      score += this.calculateFoodSpecificScore(searchLower, description, measurementContext);
      
      // Additional penalties for composite foods
      const complexTerms = ['stir fry', 'casserole', 'prepared', 'seasoned', 'breaded', 'battered'];
      for (const term of complexTerms) {
        if (description.includes(term)) score -= 100;
      }
      
      return { food, score };
    });
    
    // Sort by score and return top results
    return scoredFoods
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.food);
  }

  /**
   * Calculate food-specific scoring logic
   */
  private calculateFoodSpecificScore(searchTerm: string, description: string, measurementContext: string): number {
    let score = 0;

    // BROCCOLI scoring - prioritize plain broccoli
    if (searchTerm.includes('broccoli')) {
      if (description === 'broccoli, raw') score += 500;
      if (description.startsWith('broccoli,') && description.includes('raw')) score += 400;
      if (description.includes('beef and broccoli') || description.includes('tofu')) score -= 800;
      if (description.includes('chinese') || description.includes('raab')) score -= 200;
    }

    // CARROT scoring - prioritize plain carrots
    if (searchTerm.includes('carrot')) {
      if (description.includes('carrots, raw') || description === 'carrots, mature, raw') score += 500;
      if (description.includes('carrot') && description.includes('raw')) score += 400;
      if (description.includes('muffin') || description.includes('cake') || description.includes('salad')) score -= 800;
      if (description.includes('baby') && description.includes('raw')) score += 300; // baby carrots are good too
    }

    // TOMATO scoring - prioritize fresh tomatoes
    if (searchTerm.includes('tomato')) {
      if (description.includes('tomato, roma') || description.includes('tomatoes, red, ripe')) score += 500;
      if (description.includes('tomato') && description.includes('raw')) score += 400;
      if (description.includes('paste') || description.includes('sauce') || description.includes('puree')) score -= 300;
      if (description.includes('canned') || description.includes('processed')) score -= 200;
      if (description.includes('taco') || description.includes('filling')) score -= 800;
    }

    // LETTUCE scoring - prioritize fresh lettuce
    if (searchTerm.includes('lettuce')) {
      if (description.includes('lettuce') && description.includes('raw')) score += 500;
      if (description.includes('romaine') || description.includes('iceberg')) score += 400;
      if (description.includes('salad') && description.includes('mixed')) score -= 300;
    }

    return score;
  }

  /**
   * Check if the search term is for a liquid
   */
  private isLiquidQuery(searchTerm: string): boolean {
    const liquidKeywords = [
      'milk', 'water', 'juice', 'coffee', 'tea', 'soda', 'cola', 'pepsi', 'coke',
      'beer', 'wine', 'smoothie', 'shake', 'drink', 'beverage', 'liquid',
      'latte', 'cappuccino', 'espresso', 'moccha', 'frappuccino',
      'sprite', 'fanta', 'mountain dew', 'gatorade', 'powerade',
      'coconut water', 'almond milk', 'soy milk', 'oat milk',
      'energy drink', 'sports drink', 'protein shake', 'iced tea',
      'hot chocolate', 'cocoa', 'lemonade', 'punch'
    ];
    
    return liquidKeywords.some(keyword => searchTerm.toLowerCase().includes(keyword));
  }

  /**
   * Calculate liquid-specific scoring logic
   */
  private calculateLiquidScore(searchTerm: string, description: string): number {
    let score = 0;

    // MILK scoring
    if (searchTerm.includes('milk')) {
      if (description.includes('milk, whole') || description.includes('milk, reduced fat, 2%') || description.includes('milk, lowfat, 1%')) score += 600;
      if (description.includes('milk, nonfat') || description.includes('milk, skim')) score += 550;
      if (description.includes('milk') && !description.includes('chocolate') && !description.includes('strawberry')) score += 500;
      if (description.includes('chocolate milk') || description.includes('flavored')) score -= 200;
      if (description.includes('condensed') || description.includes('evaporated')) score -= 400;
      if (description.includes('buttermilk') || description.includes('goat')) score -= 100;
    }

    // WATER scoring (should be zero calories) - Very specific matching
    if (searchTerm.includes('water')) {
      if (description.toLowerCase() === 'water, tap') score += 800;
      if (description.toLowerCase() === 'water, bottled, generic') score += 750;
      if (description.includes('water') && !description.includes('tuna') && !description.includes('fish') && !description.includes('coconut') && !description.includes('flavored')) score += 600;
      if (description.includes('tuna') || description.includes('fish') || description.includes('canned')) score -= 1000; // Heavy penalty for non-water items
      if (description.includes('coconut water')) score -= 200; // different drink
      if (description.includes('vitamin water') || description.includes('flavored')) score -= 400;
    }

    // JUICE scoring
    if (searchTerm.includes('juice')) {
      if (description.includes('juice, orange') || description.includes('orange juice')) score += 600;
      if (description.includes('juice, apple') || description.includes('apple juice')) score += 600;
      if (description.includes('juice') && description.includes('100%')) score += 500;
      if (description.includes('juice') && !description.includes('cocktail') && !description.includes('drink')) score += 400;
      if (description.includes('cocktail') || description.includes('punch') || description.includes('drink')) score -= 300;
      if (description.includes('concentrate')) score -= 400;
    }

    // SODA/SOFT DRINK scoring
    if (searchTerm.includes('soda') || searchTerm.includes('cola') || searchTerm.includes('pepsi') || searchTerm.includes('coke')) {
      if (description.includes('cola') || description.includes('carbonated')) score += 500;
      if (description.includes('diet') || description.includes('zero')) score += 300; // diet versions
      if (description.includes('energy drink') || description.includes('sports')) score -= 200;
    }

    // COFFEE scoring
    if (searchTerm.includes('coffee')) {
      if (description.includes('coffee, brewed') || description.includes('coffee, black')) score += 600;
      if (description.includes('coffee') && !description.includes('with cream') && !description.includes('latte')) score += 500;
      if (description.includes('espresso')) score += 400;
      if (description.includes('cappuccino') || description.includes('latte') || description.includes('mocha')) score -= 200;
      if (description.includes('frappuccino') || description.includes('iced coffee drink')) score -= 400;
    }

    // TEA scoring
    if (searchTerm.includes('tea')) {
      if (description.includes('tea, brewed') || description.includes('tea, black') || description.includes('tea, green')) score += 600;
      if (description.includes('tea') && !description.includes('iced') && !description.includes('sweetened')) score += 500;
      if (description.includes('herbal tea') || description.includes('chamomile')) score += 400;
      if (description.includes('iced tea') && description.includes('sweetened')) score -= 200;
      if (description.includes('bubble tea') || description.includes('chai latte')) score -= 300;
    }

    // BEER/WINE scoring
    if (searchTerm.includes('beer') || searchTerm.includes('wine')) {
      if (description.includes('beer, regular') || description.includes('wine, table')) score += 500;
      if (description.includes('light beer') || description.includes('wine, dessert')) score += 300;
      if (description.includes('craft beer') || description.includes('wine, fortified')) score -= 100;
    }

    // SMOOTHIE/PROTEIN DRINK scoring
    if (searchTerm.includes('smoothie') || searchTerm.includes('protein shake')) {
      if (description.includes('smoothie') && description.includes('fruit')) score += 500;
      if (description.includes('protein') && description.includes('powder')) score += 400;
      if (description.includes('meal replacement')) score += 300;
    }

    return score;
  }

  /**
   * Enhanced liquid-specific scoring system  
   */
  private applyLiquidScoring(searchTerm: string, description: string): number {
    if (this.isLiquidQuery(searchTerm)) {
      return this.calculateLiquidScore(searchTerm, description);
    }
    return 0;
  }

  /**
   * Update food-specific scoring to use new liquid system
   */
  private calculateComprehensiveFoodScore(searchTerm: string, description: string, measurementContext: string): number {
    let score = 0;

    // First apply liquid-specific scoring if applicable  
    if (this.isLiquidQuery(searchTerm)) {
      score += this.calculateLiquidScore(searchTerm, description);
    } else {
      // Apply regular food scoring for non-liquids
      score += this.calculateFoodSpecificScore(searchTerm, description, measurementContext);
    }
    
    return score;
  }



  /**
   * Check if food match is likely incorrect based on context
   */
  private isIncorrectFoodMatch(searchTerm: string, foundDescription: string): boolean {
    return false; // Simplified for now
  }

  /**
   * Enhanced fallback estimation with better nutrition data
   */
  private getEnhancedFallbackEstimate(ingredientName: string, measurement: string) {
    const normalized = ingredientName.toLowerCase().trim();

    // Handle common liquids that may not be in USDA database or fallback data
    const liquidFallbacks = {
      // Water varieties
      'water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'drinking water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'tap water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'bottled water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'sparkling water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'mineral water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'seltzer water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      
      // Tea varieties
      'tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
      'black tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
      'green tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
      'white tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
      'herbal tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
      'iced tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
      
      // Coffee varieties  
      'coffee': { calories: 1, protein: 0.1, carbs: 0, fat: 0 },
      'black coffee': { calories: 1, protein: 0.1, carbs: 0, fat: 0 },
      'espresso': { calories: 1, protein: 0.1, carbs: 0, fat: 0 },
      'americano': { calories: 1, protein: 0.1, carbs: 0, fat: 0 },
      'cold brew': { calories: 1, protein: 0.1, carbs: 0, fat: 0 },
      
      // Alcoholic beverages
      'beer': { calories: 43, protein: 0.5, carbs: 3.6, fat: 0 },
      'light beer': { calories: 29, protein: 0.2, carbs: 1.9, fat: 0 },
      'wine': { calories: 83, protein: 0.1, carbs: 2.6, fat: 0 },
      'red wine': { calories: 85, protein: 0.1, carbs: 2.6, fat: 0 },
      'white wine': { calories: 82, protein: 0.1, carbs: 2.6, fat: 0 },
      'champagne': { calories: 80, protein: 0.2, carbs: 1.2, fat: 0 },
      'vodka': { calories: 231, protein: 0, carbs: 0, fat: 0 },
      'whiskey': { calories: 250, protein: 0, carbs: 0, fat: 0 },
      'rum': { calories: 231, protein: 0, carbs: 0, fat: 0 },
      'gin': { calories: 231, protein: 0, carbs: 0, fat: 0 },
      'tequila': { calories: 231, protein: 0, carbs: 0, fat: 0 },
      'brandy': { calories: 231, protein: 0, carbs: 0, fat: 0 },
      
      // Soft drinks and juices
      'lemonade': { calories: 40, protein: 0, carbs: 10.6, fat: 0 },
      'lemon juice': { calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2 },
      'lime juice': { calories: 25, protein: 0.4, carbs: 8.4, fat: 0.1 },
      'orange juice': { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2 },
      'apple juice': { calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1 },
      'grape juice': { calories: 60, protein: 0.4, carbs: 14.8, fat: 0.2 },
      'cranberry juice': { calories: 46, protein: 0.4, carbs: 12.2, fat: 0.1 },
      'tomato juice': { calories: 17, protein: 0.8, carbs: 4.2, fat: 0.1 },
      'coconut water': { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
      
      // Tropical and exotic fruit juices
      'pineapple juice': { calories: 53, protein: 0.5, carbs: 12.9, fat: 0.1 },
      'mango juice': { calories: 54, protein: 0.4, carbs: 13.7, fat: 0.2 },
      'guava juice': { calories: 56, protein: 0.3, carbs: 14.8, fat: 0.1 },
      'papaya juice': { calories: 43, protein: 0.5, carbs: 11.0, fat: 0.1 },
      'passion fruit juice': { calories: 51, protein: 1.4, carbs: 11.2, fat: 0.4 },
      'pomegranate juice': { calories: 54, protein: 0.2, carbs: 13.7, fat: 0.3 },
      'kiwi juice': { calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5 },
      'dragon fruit juice': { calories: 60, protein: 1.2, carbs: 13.0, fat: 0.4 },
      
      // Berry juices
      'blueberry juice': { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
      'strawberry juice': { calories: 33, protein: 0.7, carbs: 7.9, fat: 0.3 },
      'raspberry juice': { calories: 53, protein: 1.2, carbs: 12.0, fat: 0.7 },
      'blackberry juice': { calories: 43, protein: 1.4, carbs: 9.6, fat: 0.5 },
      'acai juice': { calories: 70, protein: 1.0, carbs: 4.0, fat: 5.0 },
      'goji juice': { calories: 349, protein: 14.3, carbs: 77.1, fat: 0.4 },
      
      // Green and vegetable juices
      'green juice': { calories: 23, protein: 2.2, carbs: 4.8, fat: 0.4 },
      'celery juice': { calories: 14, protein: 0.7, carbs: 3.0, fat: 0.2 },
      'kale juice': { calories: 49, protein: 4.3, carbs: 9.0, fat: 0.9 },
      'spinach juice': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      'cucumber juice': { calories: 16, protein: 0.7, carbs: 4.0, fat: 0.1 },
      'wheatgrass juice': { calories: 15, protein: 2.2, carbs: 3.4, fat: 0.1 },
      'carrot juice': { calories: 40, protein: 0.9, carbs: 9.3, fat: 0.1 },
      'beet juice': { calories: 58, protein: 2.1, carbs: 13.0, fat: 0.2 },
      
      // Milk shakes and blended drinks
      'vanilla milkshake': { calories: 112, protein: 3.8, carbs: 16.0, fat: 4.3 },
      'chocolate milkshake': { calories: 119, protein: 3.2, carbs: 18.6, fat: 4.1 },
      'strawberry milkshake': { calories: 108, protein: 3.5, carbs: 17.2, fat: 3.8 },
      'banana milkshake': { calories: 105, protein: 3.9, carbs: 16.8, fat: 3.2 },
      'oreo milkshake': { calories: 142, protein: 3.1, carbs: 22.4, fat: 5.2 },
      'peanut butter milkshake': { calories: 156, protein: 5.8, carbs: 15.2, fat: 8.9 },
      'caramel milkshake': { calories: 125, protein: 3.4, carbs: 19.8, fat: 4.6 },
      'mint chocolate chip milkshake': { calories: 134, protein: 3.6, carbs: 20.1, fat: 5.1 },
      
      // Smoothies and protein shakes
      'protein shake': { calories: 103, protein: 20.1, carbs: 3.4, fat: 1.2 },
      'berry smoothie': { calories: 65, protein: 1.8, carbs: 15.2, fat: 0.6 },
      'green smoothie': { calories: 42, protein: 2.1, carbs: 9.8, fat: 0.4 },
      'mango smoothie': { calories: 71, protein: 1.2, carbs: 17.6, fat: 0.3 },
      'banana smoothie': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
      
      // Sorbet and frozen treats (liquid equivalent)
      'lemon sorbet': { calories: 134, protein: 0.2, carbs: 34.1, fat: 0.2 },
      'orange sorbet': { calories: 138, protein: 0.6, carbs: 35.2, fat: 0.1 },
      'strawberry sorbet': { calories: 130, protein: 0.4, carbs: 33.8, fat: 0.1 },
      'mango sorbet': { calories: 142, protein: 0.3, carbs: 36.4, fat: 0.2 },
      'raspberry sorbet': { calories: 132, protein: 0.7, carbs: 33.1, fat: 0.3 },
      'coconut sorbet': { calories: 159, protein: 1.8, carbs: 25.4, fat: 6.2 },
      'lime sorbet': { calories: 128, protein: 0.1, carbs: 33.2, fat: 0.1 },
      'watermelon sorbet': { calories: 118, protein: 0.6, carbs: 30.2, fat: 0.2 },
      
      // Yogurt drinks and kefir
      'plain yogurt drink': { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3 },
      'strawberry yogurt drink': { calories: 79, protein: 2.9, carbs: 13.1, fat: 1.5 },
      'vanilla yogurt drink': { calories: 77, protein: 3.1, carbs: 12.8, fat: 1.7 },
      'blueberry yogurt drink': { calories: 81, protein: 2.8, carbs: 14.2, fat: 1.6 },
      'peach yogurt drink': { calories: 76, protein: 2.7, carbs: 13.4, fat: 1.4 },
      'greek yogurt drink': { calories: 97, protein: 10.0, carbs: 3.6, fat: 5.0 },
      'kefir': { calories: 66, protein: 3.8, carbs: 4.8, fat: 3.5 },
      'lassi': { calories: 89, protein: 2.4, carbs: 17.2, fat: 1.5 },
      'ayran': { calories: 38, protein: 1.7, carbs: 2.9, fat: 2.3 },
      
      // Breakfast cereals (dry, per 100g)
      'cheerios': { calories: 367, protein: 10.6, carbs: 73.3, fat: 6.7 },
      'cornflakes': { calories: 357, protein: 7.5, carbs: 84.1, fat: 0.9 },
      'frosted flakes': { calories: 375, protein: 4.5, carbs: 91.0, fat: 0.5 },
      'rice krispies': { calories: 382, protein: 6.0, carbs: 87.0, fat: 1.0 },
      'froot loops': { calories: 385, protein: 7.0, carbs: 87.0, fat: 2.5 },
      'lucky charms': { calories: 375, protein: 6.3, carbs: 83.8, fat: 3.8 },
      'cinnamon toast crunch': { calories: 420, protein: 6.7, carbs: 80.0, fat: 10.0 },
      'honey nut cheerios': { calories: 379, protein: 9.1, carbs: 78.8, fat: 4.5 },
      'cocoa puffs': { calories: 387, protein: 5.3, carbs: 86.7, fat: 4.0 },
      'trix': { calories: 387, protein: 4.0, carbs: 93.3, fat: 1.3 },
      
      // Healthier cereals
      'oatmeal': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
      'granola': { calories: 471, protein: 13.0, carbs: 64.0, fat: 20.0 },
      'muesli': { calories: 362, protein: 9.7, carbs: 72.2, fat: 5.9 },
      'bran flakes': { calories: 321, protein: 10.7, carbs: 67.9, fat: 1.8 },
      'shredded wheat': { calories: 336, protein: 11.4, carbs: 75.9, fat: 1.8 },
      'raisin bran': { calories: 321, protein: 7.5, carbs: 80.5, fat: 1.8 },
      'special k': { calories: 378, protein: 13.0, carbs: 78.0, fat: 1.5 },
      'all bran': { calories: 333, protein: 14.0, carbs: 80.0, fat: 3.3 },
      'fiber one': { calories: 267, protein: 13.3, carbs: 86.7, fat: 3.3 },
      'wheaties': { calories: 352, protein: 10.6, carbs: 78.8, fat: 2.4 },
      
      // Hot cereals
      'cream of wheat': { calories: 371, protein: 10.7, carbs: 76.1, fat: 1.1 },
      'grits': { calories: 371, protein: 8.9, carbs: 79.6, fat: 1.2 },
      'quinoa cereal': { calories: 368, protein: 14.1, carbs: 64.2, fat: 6.1 },
      'steel cut oats': { calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5 },
      
      // Sandwiches and composite meals (per 100g)
      'chicken sandwich': { calories: 250, protein: 15.2, carbs: 25.8, fat: 10.4 },
      'chicken parm sandwich': { calories: 285, protein: 18.5, carbs: 28.2, fat: 12.8 },
      'chicken parmesan sandwich': { calories: 285, protein: 18.5, carbs: 28.2, fat: 12.8 },
      'grilled chicken sandwich': { calories: 235, protein: 17.8, carbs: 24.1, fat: 8.2 },
      'fried chicken sandwich': { calories: 310, protein: 16.4, carbs: 26.5, fat: 16.8 },
      'buffalo chicken sandwich': { calories: 268, protein: 16.2, carbs: 25.4, fat: 11.9 },
      
      // Deli sandwiches
      'turkey sandwich': { calories: 220, protein: 12.8, carbs: 28.5, fat: 6.4 },
      'ham sandwich': { calories: 245, protein: 14.2, carbs: 27.8, fat: 8.9 },
      'roast beef sandwich': { calories: 258, protein: 16.4, carbs: 26.2, fat: 10.1 },
      'tuna sandwich': { calories: 275, protein: 15.8, carbs: 24.6, fat: 12.8 },
      'club sandwich': { calories: 295, protein: 18.2, carbs: 28.4, fat: 13.5 },
      'blt sandwich': { calories: 320, protein: 12.4, carbs: 26.8, fat: 18.6 },
      
      // Italian sandwiches
      'italian sub': { calories: 315, protein: 16.8, carbs: 32.4, fat: 14.2 },
      'meatball sub': { calories: 345, protein: 19.2, carbs: 35.8, fat: 16.4 },
      'philly cheesesteak': { calories: 298, protein: 17.5, carbs: 24.8, fat: 14.8 },
      'chicken parmigiana sub': { calories: 320, protein: 20.1, carbs: 30.2, fat: 15.6 },
      
      // Burgers
      'hamburger': { calories: 295, protein: 17.2, carbs: 22.9, fat: 15.5 },
      'cheeseburger': { calories: 315, protein: 18.8, carbs: 23.2, fat: 17.9 },
      'bacon cheeseburger': { calories: 345, protein: 20.4, carbs: 23.5, fat: 21.2 },
      'turkey burger': { calories: 265, protein: 16.8, carbs: 22.4, fat: 12.8 },
      'veggie burger': { calories: 195, protein: 8.4, carbs: 28.5, fat: 6.2 },
      
      // Specialty sandwiches
      'reuben sandwich': { calories: 335, protein: 18.6, carbs: 28.4, fat: 17.8 },
      'french dip': { calories: 285, protein: 19.2, carbs: 26.8, fat: 12.4 },
      'monte cristo': { calories: 385, protein: 21.4, carbs: 32.6, fat: 20.8 },
      'cuban sandwich': { calories: 308, protein: 18.8, carbs: 28.5, fat: 14.2 },
      'pastrami sandwich': { calories: 298, protein: 17.6, carbs: 26.4, fat: 14.1 },
      
      // Breakfast sandwiches
      'egg sandwich': { calories: 285, protein: 14.2, carbs: 28.6, fat: 13.4 },
      'bacon egg sandwich': { calories: 325, protein: 16.8, carbs: 28.2, fat: 17.5 },
      'sausage egg sandwich': { calories: 342, protein: 17.4, carbs: 28.8, fat: 19.6 },
      'breakfast sandwich': { calories: 310, protein: 15.8, carbs: 28.4, fat: 16.2 },
      
      // Sodas and carbonated drinks
      'soda': { calories: 41, protein: 0, carbs: 10.6, fat: 0 },
      'cola': { calories: 41, protein: 0, carbs: 10.6, fat: 0 },
      'pepsi': { calories: 41, protein: 0, carbs: 10.6, fat: 0 },
      'coca cola': { calories: 41, protein: 0, carbs: 10.6, fat: 0 },
      'sprite': { calories: 38, protein: 0, carbs: 10, fat: 0 },
      'ginger ale': { calories: 34, protein: 0, carbs: 8.8, fat: 0 },
      'root beer': { calories: 41, protein: 0, carbs: 10.6, fat: 0 },
      'diet soda': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'diet coke': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      'diet pepsi': { calories: 0, protein: 0, carbs: 0, fat: 0 },
      
      // Energy and sports drinks
      'energy drink': { calories: 45, protein: 0, carbs: 11, fat: 0 },
      'red bull': { calories: 45, protein: 0, carbs: 11, fat: 0 },
      'monster': { calories: 50, protein: 0, carbs: 13, fat: 0 },
      'gatorade': { calories: 25, protein: 0, carbs: 6, fat: 0 },
      'powerade': { calories: 25, protein: 0, carbs: 6, fat: 0 },
      
      // Milk and alternatives
      'almond milk': { calories: 17, protein: 0.6, carbs: 1.5, fat: 1.1 },
      'soy milk': { calories: 33, protein: 2.9, carbs: 1.8, fat: 1.8 },
      'oat milk': { calories: 47, protein: 1.0, carbs: 7.0, fat: 1.5 },
      'coconut milk': { calories: 230, protein: 2.3, carbs: 5.5, fat: 23.8 },
      'rice milk': { calories: 47, protein: 0.3, carbs: 9.2, fat: 1.0 },
      
      // Other beverages
      'kombucha': { calories: 30, protein: 0, carbs: 7, fat: 0 },
      'smoothie': { calories: 66, protein: 1.8, carbs: 16, fat: 0.2 },
      'milkshake': { calories: 112, protein: 3.2, carbs: 17.9, fat: 3.2 },
      'hot chocolate': { calories: 77, protein: 3.2, carbs: 13.4, fat: 2.3 },
      'iced coffee': { calories: 5, protein: 0.3, carbs: 1.0, fat: 0.0 },
    };

    const liquidFallback = liquidFallbacks[normalized as keyof typeof liquidFallbacks];
    if (liquidFallback) {
      const nutrition = liquidFallback;
      const mockFood: USDAFood = {
        fdcId: 0,
        description: normalized,
        dataType: 'Liquid Fallback',
        foodNutrients: []
      };
      const { quantity, unit, gramsEquivalent } = this.parseMeasurement(measurement, mockFood);
      const estimatedCalories = Math.round((nutrition.calories * gramsEquivalent) / 100);
      
      return {
        ingredient: normalized.toUpperCase(),
        measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
        estimatedCalories,
        equivalentMeasurement: `100g ≈ ${nutrition.calories} kcal`,
        note: estimatedCalories === 0 ? 'Contains no calories' : 'Low-calorie beverage',
        nutritionPer100g: nutrition
      };
    }

    // Use enhanced fallback data if available
    if (USDAService.FALLBACK_NUTRITION[normalized]) {
      const nutrition = USDAService.FALLBACK_NUTRITION[normalized];
      const mockFood: USDAFood = {
        fdcId: 0,
        description: normalized,
        dataType: 'Enhanced Fallback',
        foodNutrients: []
      };
      const { quantity, unit, gramsEquivalent } = this.parseMeasurement(measurement, mockFood);
      const estimatedCalories = Math.round((nutrition.calories * gramsEquivalent) / 100);

      return {
        ingredient: normalized.toUpperCase(),
        measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
        estimatedCalories,
        equivalentMeasurement: `100g ≈ ${nutrition.calories} kcal`,
        note: 'Estimate based on USDA nutrition averages with enhanced conversion factors',
        nutritionPer100g: nutrition,
        usdaPortionUsed: false
      };
    }

    throw new Error(`No nutrition data available for "${ingredientName}"`);
  }

}

export const usdaService = new USDAService(process.env.USDA_API_KEY || 'DEMO_KEY');
