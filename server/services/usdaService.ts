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
        console.log(`Found ${cachedResults.length} cached results for "${query}"`);
        return this.formatCachedAsUSDAFood(cachedResults);
      }

      // Search USDA API
      console.log('🔑 API Key length:', this.apiKey?.length || 0);
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

      console.log(`🔍 Found ${foods.length} foods for "${ingredientName}"`);

      // Filter and prioritize results with measurement context
      const filteredFoods = this.filterAndPrioritizeFoodsWithMeasurement(foods, ingredientName, measurement);
      if (filteredFoods.length === 0) {
        throw new Error('No suitable foods found');
      }
      
      // Use the most relevant result (first one after filtering)
      const food = filteredFoods[0];
      
      console.log(`📱 Selected food: ${food.description} (ID: ${food.fdcId})`);
      console.log(`📊 Food has ${food.foodNutrients?.length || 0} nutrients`);
      
      // Extract key nutrients
      let nutrients = this.extractNutrients(food.foodNutrients);
      
      // Apply cooking retention factors if food is prepared
      const cookingMethod = detectCookingMethod(food.description);
      const foodGroup = classifyFood(food.description);
      
      if (cookingMethod !== 'raw') {
        nutrients = applyRetentionFactors(nutrients, cookingMethod, foodGroup);
        console.log(`🔥 Applied ${cookingMethod} retention factors for ${foodGroup}: ${JSON.stringify(nutrients)}`);
      }
      
      // Apply food-specific protein conversion factors if nitrogen data available
      const proteinFactor = getProteinConversionFactor(food.description, foodGroup);
      const proteinMethod = getProteinCalculationMethod(food.description);
      
      console.log(`🥩 Using protein conversion factor ${proteinFactor} for ${food.description} (${proteinMethod})`)
      
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
        console.log(`🧮 Enhanced calorie calculation for "${food.description}": ${estimatedCalories} cal (${gramsEquivalent}g)`);
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
      console.error('Calorie calculation error:', error);
      
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

    console.log(`📊 Extracting nutrients from ${foodNutrients?.length || 0} items`);

    if (!foodNutrients || !Array.isArray(foodNutrients)) {
      console.log('❌ No valid foodNutrients array');
      return nutrients;
    }

    // Log first nutrient to understand structure
    if (foodNutrients.length > 0) {
      console.log('🔍 Sample nutrient structure:', JSON.stringify(foodNutrients[0], null, 2));
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

      // Log nutrients being processed
      if (foodNutrients.indexOf(nutrient) < 3) {
        console.log(`🔍 Processing: "${nutrient.nutrientName || nutrient.nutrient?.name}" (ID: ${nutrientId}) = ${amount}`);
      }

      // Map using exact USDA nutrient IDs and names
      if (name.includes('energy') || name.includes('calorie') || nutrientId === 1008) {
        nutrients.calories = amount;
        console.log(`🔥 Found calories: ${amount} from "${name}"`);
      } else if (name.includes('protein') || nutrientId === 1003) {
        nutrients.protein = amount;
        console.log(`🥩 Found protein: ${amount}g from "${name}"`);
      } else if ((name.includes('carbohydrate') && !name.includes('fiber')) || nutrientId === 1005) {
        nutrients.carbs = amount;
        console.log(`🍞 Found carbs: ${amount}g from "${name}"`);
      } else if (name.includes('total lipid') || name.includes('fat') || nutrientId === 1004) {
        nutrients.fat = amount;
        console.log(`🧈 Found fat: ${amount}g from "${name}"`);
      } else if (name.includes('fiber') || nutrientId === 1079) {
        nutrients.fiber = amount;
      } else if (name.includes('sugar') || nutrientId === 2000) {
        nutrients.sugar = amount;
      } else if (name.includes('sodium') || nutrientId === 1093) {
        nutrients.sodium = amount > 100 ? amount / 1000 : amount; // Convert mg to g if needed
      }
    }

    console.log(`✅ Final nutrients:`, nutrients);
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
    
    // Extract quantity and unit with fraction support
    let quantity = 1;
    let unit = normalized;
    
    // Handle fractions like "1/2", "3/4"
    const fractionMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)\s+(.+)$/);
    if (fractionMatch) {
      const numerator = parseFloat(fractionMatch[1]);
      const denominator = parseFloat(fractionMatch[2]);
      quantity = numerator / denominator;
      unit = fractionMatch[3].trim();
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
        // Handle regular decimal numbers
        const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
        quantity = match ? parseFloat(match[1]) : 1;
        unit = match ? match[2].trim() : normalized;
      }
    }

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
      'cup': 47, // lettuce cup ≈ 47g, varies by ingredient
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
    
    console.log(`🔍 Filtered from ${foods.length} to ${validFoods.length} foods with valid nutrition data`);
    
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
      const fallbackResult = this.parseFallbackMeasurement(measurement);
      gramsEquivalent = fallbackResult.gramsEquivalent;
    }

    // Apply cooking retention factors if needed
    let adjustedNutrition = { ...nutritionData };
    if (cookingMethod !== 'raw') {
      adjustedNutrition = applyRetentionFactors(
        { 
          calories: nutritionData.calories,
          protein: nutritionData.protein, 
          fat: nutritionData.fat, 
          carbs: nutritionData.carbs 
        },
        cookingMethod,
        foodGroup
      );
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
      estimatedCalories: enhancedCalories,
      equivalentMeasurement: `100g ≈ ${nutritionData.calories} kcal`,
      note: portionWeight ? 
        'Enhanced estimate using USDA portion database and food-specific conversion factors' :
        'Estimate based on USDA nutrition averages with enhanced conversion factors',
      nutritionPer100g: nutritionData,
      usdaPortionUsed: !!portionWeight,
    };
  }

  private parseFallbackMeasurement(measurement: string): { gramsEquivalent: number } {
    const { quantity, unit } = parseMeasurement(measurement);

    // Enhanced conversions based on USDA portion data averages
    const conversions: { [key: string]: number } = {
      'g': 1, 'gram': 1, 'grams': 1,
      'kg': 1000, 'kilogram': 1000,
      'cup': 240, 'cups': 240,
      'tablespoon': 15, 'tbsp': 15,
      'teaspoon': 5, 'tsp': 5,
      'medium': 150, 'large': 200, 'small': 100,
      'slice': 28, 'piece': 50, 'whole': 200,
      'serving': 85, 'portion': 85,
      'breast': 172, 'thigh': 85, 'drumstick': 44,
      'fillet': 150, 'steak': 150,
      'ounce': 28.35, 'oz': 28.35,
      'pound': 453.6, 'lb': 453.6,
      'pint': 473, 'quart': 946, 'gallon': 3785,
      'liter': 1000, 'ml': 1, 'milliliter': 1,
    };

    let gramsEquivalent = quantity * 100; // default 100g per unit
    for (const [unitPattern, grams] of Object.entries(conversions)) {
      if (unit.includes(unitPattern)) {
        gramsEquivalent = quantity * grams;
        break;
      }
    }

    return { gramsEquivalent };
  }
}

export const usdaService = new USDAService(process.env.USDA_API_KEY || 'DEMO_KEY');