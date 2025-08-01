/**
 * USDA Food Database Service
 * 
 * Handles integration with USDA FoodData Central API
 * Provides offline caching and intelligent calorie calculations
 */

import { db } from '../db';
import { usdaFoodCache } from '@shared/schema';
import { eq, like, desc, asc, sql } from 'drizzle-orm';

interface USDANutrient {
  id: number;
  number: string;
  name: string;
  rank: number;
  unitName: string;
}

interface USDAFoodNutrient {
  type: string;
  id: number;
  nutrient: USDANutrient;
  foodNutrientDerivation?: {
    code: string;
    description: string;
  };
  median?: number;
  amount: number;
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
        console.log(`Found ${cachedResults.length} cached results for "${query}"`);
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
          dataType: ['Foundation', 'Branded', 'Survey'],
          pageSize,
          pageNumber: 1,
          sortBy: 'lowercaseDescription.keyword',
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
      console.error('USDA search error:', error);
      
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
      console.error('USDA food details error:', error);
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

      // Use the most relevant result (first one)
      const food = foods[0];
      
      // Extract key nutrients
      const nutrients = this.extractNutrients(food.foodNutrients);
      
      // Parse measurement and convert to grams
      const { quantity, unit, gramsEquivalent } = this.parseMeasurement(measurement, food);
      
      // Calculate calories based on grams
      const caloriesPer100g = nutrients.calories || 0;
      const estimatedCalories = Math.round((caloriesPer100g * gramsEquivalent) / 100);
      
      // Generate equivalent measurement
      const equivalentMeasurement = this.generateEquivalentMeasurement(
        gramsEquivalent,
        unit,
        nutrients.calories
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
      };
    } catch (error) {
      console.error('Calorie calculation error:', error);
      
      // Fallback to basic estimation
      return this.getFallbackCalorieEstimate(ingredientName, measurement);
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
        console.error('Cache insert error:', error);
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

    for (const nutrient of foodNutrients) {
      // Safely access nutrient properties with null checks
      if (!nutrient || !nutrient.nutrient || !nutrient.nutrient.name) {
        console.warn('Invalid nutrient data:', nutrient);
        continue;
      }
      
      const name = nutrient.nutrient.name.toLowerCase();
      const amount = nutrient.amount || 0;

      if (name.includes('energy') || name.includes('calorie')) {
        nutrients.calories = amount;
      } else if (name.includes('protein')) {
        nutrients.protein = amount;
      } else if (name.includes('carbohydrate')) {
        nutrients.carbs = amount;
      } else if (name.includes('total lipid') || name.includes('fat')) {
        nutrients.fat = amount;
      } else if (name.includes('fiber')) {
        nutrients.fiber = amount;
      } else if (name.includes('sugar')) {
        nutrients.sugar = amount;
      } else if (name.includes('sodium')) {
        nutrients.sodium = amount;
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
    const normalized = measurement.toLowerCase().trim();
    
    // Extract quantity and unit
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    const quantity = match ? parseFloat(match[1]) : 1;
    const unit = match ? match[2].trim() : normalized;

    // Standard conversions (approximate)
    const conversions: { [key: string]: number } = {
      'g': 1,
      'gram': 1,
      'grams': 1,
      'kg': 1000,
      'kilogram': 1000,
      'oz': 28.35,
      'ounce': 28.35,
      'ounces': 28.35,
      'lb': 453.6,
      'pound': 453.6,
      'pounds': 453.6,
      'cup': 240, // approximate for liquids
      'cups': 240,
      'tablespoon': 15,
      'tablespoons': 15,
      'tbsp': 15,
      'teaspoon': 5,
      'teaspoons': 5,
      'tsp': 5,
      'ml': 1, // for liquids, approximate to grams
      'milliliter': 1,
      'milliliters': 1,
      'l': 1000,
      'liter': 1000,
      'liters': 1000,
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

    // Standard unit conversions
    for (const [unitPattern, grams] of Object.entries(conversions)) {
      if (unit.includes(unitPattern)) {
        gramsEquivalent = quantity * grams;
        break;
      }
    }

    // If no conversion found, assume it's already in grams or use serving size
    if (gramsEquivalent === quantity && food.servingSize) {
      gramsEquivalent = quantity * food.servingSize;
    } else if (gramsEquivalent === quantity) {
      gramsEquivalent = quantity * 100; // default to 100g
    }

    return { quantity, unit, gramsEquivalent };
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
        });
      }
    }

    return usdaFormat;
  }

  /**
   * Fallback calorie estimation when USDA data unavailable
   */
  private getFallbackCalorieEstimate(ingredientName: string, measurement: string) {
    // Basic fallback estimates for common ingredients
    const fallbacks: { [key: string]: number } = {
      'egg': 70,
      'grape': 3,
      'chicken': 200,
      'rice': 130,
      'bread': 80,
      'milk': 150,
      'cheese': 100,
    };

    const ingredient = ingredientName.toLowerCase();
    let baseCalories = 100; // default

    for (const [key, calories] of Object.entries(fallbacks)) {
      if (ingredient.includes(key)) {
        baseCalories = calories;
        break;
      }
    }

    return {
      ingredient: ingredientName,
      measurement,
      estimatedCalories: baseCalories,
      note: 'Estimate based on common nutrition data (USDA database temporarily unavailable)',
    };
  }
}

export const usdaService = new USDAService(process.env.USDA_API_KEY || 'DEMO_KEY');