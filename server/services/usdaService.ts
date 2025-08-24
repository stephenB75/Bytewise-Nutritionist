/**
 * USDA Food Database Service
 * 
 * Handles integration with USDA FoodData Central API
 * Provides offline caching and intelligent calorie calculations
 */

import { db } from '../db';
import { usdaFoodCache } from '@shared/schema';
import { eq, like, desc, asc, sql, or } from 'drizzle-orm';
import { getPortionWeight, parseMeasurement } from '../data/portionData.js';
import { findCandyNutrition, calculateCandyNutrition } from '../data/candyNutritionDatabase.js';

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

  // In-memory LRU cache for performance optimization
  private memoryCache: Map<string, { data: any; timestamp: number; accessCount: number }> = new Map();
  private cacheMaxSize = 2000; // Increased cache size for more foods
  private cacheExpiryTime = 7200000; // Extended to 2 hours for better performance
  private popularFoodsCache: Map<string, number> = new Map(); // Track popular foods for priority caching

  constructor() {
    this.apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    if (this.apiKey === 'DEMO_KEY') {
      console.warn('⚠️  Using DEMO_KEY for USDA API - limited requests available');
    }
    // Pre-warm cache with most popular foods on startup
    this.preWarmCache();
  }

  /**
   * Get data from optimized memory cache with LRU eviction and popularity tracking
   */
  private getFromMemoryCache(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheExpiryTime) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // Update access count for LRU and track popularity
    cached.accessCount++;
    const currentCount = this.popularFoodsCache.get(key) || 0;
    this.popularFoodsCache.set(key, currentCount + 1);
    
    return cached.data;
  }
  
  /**
   * Store data in optimized memory cache with intelligent LRU eviction
   */
  private setMemoryCache(key: string, data: any): void {
    // Evict least popular and least recently used items if cache is full
    if (this.memoryCache.size >= this.cacheMaxSize) {
      let lruKey = '';
      let lruScore = Infinity; // Combination of access count and popularity
      
      for (const entry of Array.from(this.memoryCache.entries())) {
        const [k, v] = entry;
        const popularity = this.popularFoodsCache.get(k) || 0;
        // Score combines recency and popularity (lower score = more likely to be evicted)
        const score = v.accessCount + (popularity * 2);
        
        if (score < lruScore) {
          lruKey = k;
          lruScore = score;
        }
      }
      
      if (lruKey) {
        this.memoryCache.delete(lruKey);
        // Don't delete from popularity cache to maintain long-term tracking
      }
    }
    
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1
    });
    
    // Initialize popularity tracking
    if (!this.popularFoodsCache.has(key)) {
      this.popularFoodsCache.set(key, 1);
    }
  }
  
  /**
   * Pre-warm cache with popular foods for optimal performance
   */
  private async preWarmCache(): Promise<void> {
    const popularFoods = [
      'chicken', 'rice', 'eggs', 'bread', 'milk', 'cheese', 'yogurt', 'apple',
      'banana', 'salmon', 'beef', 'pasta', 'pizza', 'salad', 'potato'
    ];
    
    // Pre-calculate common measurements for popular foods
    const commonMeasurements = ['100g', '1 cup', '1 medium', '1 serving'];
    
    setTimeout(async () => {
      for (const food of popularFoods) {
        for (const measurement of commonMeasurements) {
          try {
            // This will cache the results without blocking startup
            await this.calculateIngredientCalories(food, measurement);
          } catch (error) {
            // Silently continue if pre-warming fails
          }
        }
      }
    }, 1000); // Delay to not block server startup
  }

  /**
   * Batch process multiple food calculations for optimal performance
   */
  async calculateBatchCalories(requests: Array<{ingredient: string, measurement: string}>): Promise<any[]> {
    const results = [];
    
    // Process in parallel batches of 5 to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(req => 
        this.calculateIngredientCalories(req.ingredient, req.measurement)
          .catch(error => ({ error: error.message, ingredient: req.ingredient }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Check if search term is candy-related
   */
  private isCandyRelated(query: string): boolean {
    const candyTerms = [
      'candy', 'candies', 'chocolate', 'gummy', 'lollipop', 'sucker',
      'hard candy', 'soft candy', 'taffy', 'caramel', 'fudge',
      'gumdrops', 'jelly beans', 'jelly bean', 'mint candy', 'mint', 'drops', 'sweets',
      'marshmallow', 'marshmallows', 'caramels', 'bonbon', 'bonbons',
      // Popular candy brands
      'skittles', 'm&m', 'snickers', 'kit kat', 'kitkat', 'reeses', 'reese',
      'hershey', 'twizzler', 'twizzlers', 'jolly rancher', 'starburst',
      'nerds', 'sour patch', 'swedish fish', 'haribo', 'lifesaver',
      'tootsie', 'milky way', 'three musketeers', 'butterfinger',
      'crunch bar', 'almond joy', 'mounds', 'york peppermint',
      // Candy types
      'licorice', 'gummi', 'gummies', 'sour gummies', 'fruit snacks',
      'rock candy', 'peppermint', 'wintergreen', 'cinnamon candy',
      'chocolate bar', 'candy bar', 'fun size', 'bite size', 'miniature'
    ];
    
    const lowerQuery = query.toLowerCase();
    return candyTerms.some(term => lowerQuery.includes(term));
  }

  /**
   * Enhance USDA results with FoodStruct candy data
   */
  private enhanceWithCandyData(foods: USDAFood[], query: string): USDAFood[] {
    if (!this.isCandyRelated(query)) {
      return foods;
    }

    const candyData = findCandyNutrition(query);
    if (!candyData) {
      return foods;
    }

    // Create enhanced food entry with FoodStruct data
    const enhancedFood: USDAFood = {
      fdcId: -1, // Special ID for enhanced data
      description: `${candyData.name} (Enhanced with detailed nutrition)`,
      dataType: 'Enhanced',
      foodCategory: `Candy - ${candyData.category}`,
      foodNutrients: [
        {
          nutrientId: 1008,
          nutrientName: "Energy",
          nutrientNumber: "208",
          unitName: "KCAL",
          value: candyData.per100g.calories
        },
        {
          nutrientId: 1003,
          nutrientName: "Protein",
          nutrientNumber: "203",
          unitName: "G",
          value: candyData.per100g.protein
        },
        {
          nutrientId: 1004,
          nutrientName: "Total lipid (fat)",
          nutrientNumber: "204",
          unitName: "G",
          value: candyData.per100g.fat
        },
        {
          nutrientId: 1005,
          nutrientName: "Carbohydrate, by difference",
          nutrientNumber: "205",
          unitName: "G",
          value: candyData.per100g.carbs
        },
        {
          nutrientId: 2000,
          nutrientName: "Total Sugars",
          nutrientNumber: "269",
          unitName: "G",
          value: candyData.per100g.sugar
        },
        {
          nutrientId: 1079,
          nutrientName: "Fiber, total dietary",
          nutrientNumber: "291",
          unitName: "G",
          value: candyData.per100g.fiber
        },
        // Enhanced minerals from FoodStruct
        {
          nutrientId: 1087,
          nutrientName: "Calcium, Ca",
          nutrientNumber: "301",
          unitName: "MG",
          value: candyData.per100g.calcium
        },
        {
          nutrientId: 1089,
          nutrientName: "Iron, Fe",
          nutrientNumber: "303",
          unitName: "MG",
          value: candyData.per100g.iron
        },
        {
          nutrientId: 1090,
          nutrientName: "Magnesium, Mg",
          nutrientNumber: "304",
          unitName: "MG",
          value: candyData.per100g.magnesium
        },
        {
          nutrientId: 1093,
          nutrientName: "Sodium, Na",
          nutrientNumber: "307",
          unitName: "MG",
          value: candyData.per100g.sodium
        },
        {
          nutrientId: 1092,
          nutrientName: "Potassium, K",
          nutrientNumber: "306",
          unitName: "MG",
          value: candyData.per100g.potassium
        },
        // Add caffeine and theobromine if present (chocolate candies)
        ...(candyData.per100g.caffeine ? [{
          nutrientId: 1057,
          nutrientName: "Caffeine",
          nutrientNumber: "262",
          unitName: "MG",
          value: candyData.per100g.caffeine
        }] : []),
        ...(candyData.per100g.theobromine ? [{
          nutrientId: 1058,
          nutrientName: "Theobromine",
          nutrientNumber: "263",
          unitName: "MG",
          value: candyData.per100g.theobromine
        }] : [])
      ]
    };

    // Add enhanced data at the beginning for priority
    return [enhancedFood, ...foods];
  }

  /**
   * Search foods with USDA API and cache results (optimized)
   */
  async searchFoods(query: string, pageSize = 25): Promise<USDAFood[]> {
    try {
      // Check if this is a candy-related query first
      if (this.isCandyRelated(query)) {
        const candyResults = this.enhanceWithCandyData([], query);
        if (candyResults.length > 0) {
          return candyResults;
        }
      }

      // First check local cache
      const cachedResults = await this.searchCachedFoodsInternal(query, pageSize);
      if (cachedResults.length > 0) {

        return cachedResults.map((food: any) => {
          let nutrients = [];
          try {
            if (typeof food.nutrients === 'string') {
              nutrients = JSON.parse(food.nutrients || '[]');
            } else if (Array.isArray(food.nutrients)) {
              nutrients = food.nutrients;
            } else if (food.nutrients && typeof food.nutrients === 'object') {
              nutrients = [food.nutrients];
            }
          } catch (parseError) {

            nutrients = [];
          }
          
          return {
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            foodNutrients: nutrients,
            foodCategory: food.foodCategory || undefined
          };
        });
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
      
      // Enhance with FoodStruct candy data if applicable
      return this.enhanceWithCandyData(data.foods, query);
    } catch (error) {
      // USDA API unavailable, using fallback approach
      
      // If USDA API fails, try candy enhancement first
      if (this.isCandyRelated(query)) {
        const candyResults = this.enhanceWithCandyData([], query);
        if (candyResults.length > 0) {
          return candyResults;
        }
      }
      
      // Fallback to cached results
      try {
        const cachedResults = await this.searchCachedFoodsInternal(query, pageSize);
        const mappedResults = cachedResults.map((food: any) => {
          let nutrients = [];
          try {
            if (typeof food.nutrients === 'string') {
              nutrients = JSON.parse(food.nutrients || '[]');
            } else if (Array.isArray(food.nutrients)) {
              nutrients = food.nutrients;
            } else if (food.nutrients && typeof food.nutrients === 'object') {
              nutrients = [food.nutrients];
            }
          } catch (parseError) {

            nutrients = [];
          }
          
          return {
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            foodNutrients: nutrients,
            foodCategory: food.foodCategory || undefined
          };
        });
        
        // Enhance with FoodStruct candy data even for cached results
        return this.enhanceWithCandyData(mappedResults, query);
      } catch (cacheError) {

        
        // Last resort: return enhanced candy data if applicable
        if (this.isCandyRelated(query)) {
          return this.enhanceWithCandyData([], query);
        }
        
        // Return empty array if all else fails
        return [];
      }
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
          foodNutrients: JSON.parse((cachedFood.nutrients as string) || '[]') as USDAFoodNutrient[],
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
    fdaServing?: string;
    enhancedDatabase?: boolean;
    category?: string;
    portionInfo?: {
      isRealistic?: boolean;
      warning?: string;
      suggestion?: string;
      recommendedServing?: string;
      recommendedCalories?: number;
    };
  }> {
    // Create memory cache key for this calculation
    const cacheKey = `calc:${ingredientName.toLowerCase()}:${measurement.toLowerCase()}`;
    
    // Check memory cache first for instant results
    const cachedResult = this.getFromMemoryCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      // Check for zero-calorie beverages FIRST before any other processing
      if (this.isZeroCalorieBeverage(ingredientName)) {

        const servingInfo = USDAService.getStandardLiquidServing(ingredientName.toLowerCase());
        
        const zeroCalorieResult = {
          ingredient: ingredientName.toUpperCase(),
          measurement: `${measurement} (~330g)`,
          estimatedCalories: 0,
          equivalentMeasurement: '100g ≈ 0 kcal',
          note: 'Zero-calorie sparkling water',
          nutritionPer100g: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            iron: 0.1,
            calcium: 5,
            zinc: 0.1,
            magnesium: 3,
            vitaminC: 0,
            vitaminD: 0,
            vitaminB12: 0,
            folate: 0,
            vitaminA: 0,
            vitaminE: 0,
            potassium: 50,
            phosphorus: 10
          },
          fdaServing: servingInfo ? `FDA ${servingInfo.fdaCategory}: ${servingInfo.description}` : 'FDA Water: 8 fl oz (1 cup) standard'
        };
        
        // Cache and return zero-calorie result
        this.setMemoryCache(cacheKey, zeroCalorieResult);
        return zeroCalorieResult;
      }
      
      // Enhanced food database integration temporarily disabled for compilation
      
      // Try liquid fallbacks and enhanced fallback data
      try {
        const fallbackResult = this.getEnhancedFallbackEstimate(ingredientName, measurement);
        if (fallbackResult) {
          // Cache the fallback result for future requests
          this.setMemoryCache(cacheKey, fallbackResult);
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
      
      // Apply cooking adjustments if needed (simplified for now)
      // const cookingMethod = this.detectCookingMethod(food.description);
      // if (cookingMethod !== 'raw') {
      //   const foodGroup = this.classifyFood(food.description);
      //   nutrients = this.applyRetentionFactors(nutrients, cookingMethod, foodGroup);
      // }
      
      // Parse measurement and convert to grams
      const measurementResult = this.parseMeasurement(measurement, food);
      const { quantity, unit, gramsEquivalent, portionInfo } = measurementResult;
      
      // Calculate calories based on grams
      const estimatedCalories = Math.round((nutrients.calories * gramsEquivalent) / 100);
      
      // Calculate micronutrients based on serving size
      const micronutrientsPer100g = {
        iron: nutrients.iron || 0,
        calcium: nutrients.calcium || 0,
        zinc: nutrients.zinc || 0,
        magnesium: nutrients.magnesium || 0,
        vitaminC: nutrients.vitaminC || 0,
        vitaminD: nutrients.vitaminD || 0,
        vitaminB12: nutrients.vitaminB12 || 0,
        folate: nutrients.folate || 0,
        vitaminA: nutrients.vitaminA || 0,
        vitaminE: nutrients.vitaminE || 0,
        potassium: nutrients.potassium || 0,
        phosphorus: nutrients.phosphorus || 0
      };
      
      const result: any = {
        ingredient: food.description,
        measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
        estimatedCalories,
        equivalentMeasurement: `100g ≈ ${nutrients.calories} kcal`,
        note: `From USDA database (${food.dataType})`,
        nutritionPer100g: {
          ...nutrients,
          ...micronutrientsPer100g
        },
        portionInfo
      };
      
      // Include FDA serving information if available
      if ((measurementResult as any).fdaServing) {
        result.fdaServing = (measurementResult as any).fdaServing;
      }
      
      return result;
    } catch (error) {
      
      // Fallback to enhanced estimation with proper nutrition data
      try {
        return this.getEnhancedFallbackEstimate(ingredientName, measurement);
      } catch (fallbackError) {
        // Create a basic estimate for unknown foods
        return this.getGenericFoodEstimate(ingredientName, measurement);
      }
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
    'macaroni pie': 'macaroni cheese baked caribbean',
    
    // Caribbean beverages
    'peanut punch': 'peanut milk beverage caribbean',
    'sorrel': 'hibiscus drink spiced caribbean',
    'sorrel drink': 'hibiscus drink spiced caribbean',
    'ginger beer': 'ginger ale jamaican spiced',
    'rum punch': 'fruit punch rum caribbean',
    'mauby': 'bark drink caribbean traditional',
    'sea moss': 'seaweed drink nutritious caribbean',
    'irish moss': 'seaweed drink nutritious caribbean',
    
    // Branded sparkling waters (zero calorie)
    'san pellegrino sparkling water': 'water carbonated mineral',
    'san pellegrino water': 'water carbonated mineral',
    'pellegrino sparkling water': 'water carbonated mineral',
    'pellegrino water': 'water carbonated mineral',
    'perrier sparkling water': 'water carbonated mineral',
    'perrier water': 'water carbonated mineral',
    'la croix sparkling water': 'water carbonated flavored',
    'lacroix sparkling water': 'water carbonated flavored',
    'bubly sparkling water': 'water carbonated flavored',
    'sparkling water': 'water carbonated',
    'carbonated water': 'water carbonated',
    'seltzer water': 'water carbonated',
    'club soda': 'water carbonated sodium',
    'tonic water': 'water tonic quinine',
    'mineral water': 'water mineral',
    'spring water': 'water spring'
  };

  private static readonly COOKING_METHODS = ['grilled', 'fried', 'baked', 'roasted', 'boiled', 'steamed', 'raw', 'fresh', 'cooked'];
  private static readonly PREPARATION_FORMS = ['canned', 'frozen', 'dried', 'fresh', 'pickled', 'smoked'];
  private static readonly FALLBACK_FOODS = ['apple', 'chicken', 'chicken breast', 'hotdog', 'hot dog', 'egg', 'rice', 'white rice', 'brown rice', 'bread', 'white bread', 'whole wheat bread', 'pasta', 'spaghetti', 'penne', 'macaroni', 'corn', 'sweet corn', 'corn on cob', 'corn on the cob', 'potato', 'baked potato', 'oats', 'oatmeal', 'quinoa', 'barley', 'bulgur', 'cereal', 'cheerios', 'cornflakes', 'granola', 'peanut punch', 'sorrel', 'ginger beer', 'coconut water', 'rum punch', 'mauby', 'sea moss', 'nectarine', 'nectarines', 'protein bar', 'nutrition bar', 'energy bar'];

  // FDA Standard Liquid Serving Sizes (RACC - Reference Amounts Customarily Consumed)
  private static readonly STANDARD_LIQUID_SERVINGS: Record<string, { 
    standardServing: number; // in mL
    fdaCategory: string;
    description: string;
  }> = {
    // FDA: Most beverages - 12 fl oz (360 mL)
    'soda': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'cola': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'pepsi': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'coke': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'sprite': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'ginger ale': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'energy drink': { standardServing: 360, fdaCategory: 'Energy Beverages', description: '12 fl oz standard' },
    'sports drink': { standardServing: 360, fdaCategory: 'Sports Beverages', description: '12 fl oz standard' },
    'gatorade': { standardServing: 360, fdaCategory: 'Sports Beverages', description: '12 fl oz standard' },
    'powerade': { standardServing: 360, fdaCategory: 'Sports Beverages', description: '12 fl oz standard' },
    
    // FDA: Milk and fruit juices - 8 fl oz (240 mL)
    'milk': { standardServing: 240, fdaCategory: 'Milk and Milk Products', description: '8 fl oz (1 cup) standard' },
    'whole milk': { standardServing: 240, fdaCategory: 'Milk and Milk Products', description: '8 fl oz (1 cup) standard' },
    'skim milk': { standardServing: 240, fdaCategory: 'Milk and Milk Products', description: '8 fl oz (1 cup) standard' },
    'almond milk': { standardServing: 240, fdaCategory: 'Alternative Milks', description: '8 fl oz (1 cup) standard' },
    'soy milk': { standardServing: 240, fdaCategory: 'Alternative Milks', description: '8 fl oz (1 cup) standard' },
    'oat milk': { standardServing: 240, fdaCategory: 'Alternative Milks', description: '8 fl oz (1 cup) standard' },
    'rice milk': { standardServing: 240, fdaCategory: 'Alternative Milks', description: '8 fl oz (1 cup) standard' },
    'coconut milk': { standardServing: 240, fdaCategory: 'Alternative Milks', description: '8 fl oz (1 cup) standard' },
    
    // FDA: Fruit Juices - 8 fl oz (240 mL)
    'orange juice': { standardServing: 240, fdaCategory: 'Fruit Juices', description: '8 fl oz (1 cup) standard' },
    'apple juice': { standardServing: 240, fdaCategory: 'Fruit Juices', description: '8 fl oz (1 cup) standard' },
    'grape juice': { standardServing: 240, fdaCategory: 'Fruit Juices', description: '8 fl oz (1 cup) standard' },
    'cranberry juice': { standardServing: 240, fdaCategory: 'Fruit Juices', description: '8 fl oz (1 cup) standard' },
    'pineapple juice': { standardServing: 240, fdaCategory: 'Fruit Juices', description: '8 fl oz (1 cup) standard' },
    'tomato juice': { standardServing: 240, fdaCategory: 'Vegetable Juices', description: '8 fl oz (1 cup) standard' },
    
    // Caribbean beverages - 8 fl oz (240 mL) for traditional drinks
    'peanut punch': { standardServing: 240, fdaCategory: 'Traditional Beverages', description: '8 fl oz (1 cup) standard' },
    'sorrel': { standardServing: 240, fdaCategory: 'Traditional Beverages', description: '8 fl oz (1 cup) standard' },
    'ginger beer': { standardServing: 360, fdaCategory: 'Carbonated Beverages', description: '12 fl oz standard' },
    'rum punch': { standardServing: 120, fdaCategory: 'Alcoholic Mixed Drinks', description: '4 fl oz standard' },
    'mauby': { standardServing: 240, fdaCategory: 'Traditional Beverages', description: '8 fl oz (1 cup) standard' },
    'sea moss': { standardServing: 240, fdaCategory: 'Traditional Beverages', description: '8 fl oz (1 cup) standard' },
    'coconut water': { standardServing: 240, fdaCategory: 'Natural Beverages', description: '8 fl oz (1 cup) standard' },
    
    // Sparkling waters and branded zero-calorie beverages
    'sparkling water': { standardServing: 240, fdaCategory: 'Water', description: '8 fl oz (1 cup) standard' },
    'carbonated water': { standardServing: 240, fdaCategory: 'Water', description: '8 fl oz (1 cup) standard' },
    'seltzer': { standardServing: 240, fdaCategory: 'Water', description: '8 fl oz (1 cup) standard' },
    'club soda': { standardServing: 240, fdaCategory: 'Water', description: '8 fl oz (1 cup) standard' },
    'mineral water': { standardServing: 240, fdaCategory: 'Water', description: '8 fl oz (1 cup) standard' },
    'san pellegrino': { standardServing: 330, fdaCategory: 'Water', description: '11 fl oz bottle standard' },
    'pellegrino': { standardServing: 330, fdaCategory: 'Water', description: '11 fl oz bottle standard' },
    'perrier': { standardServing: 330, fdaCategory: 'Water', description: '11 fl oz bottle standard' },
    'la croix': { standardServing: 360, fdaCategory: 'Water', description: '12 fl oz can standard' },
    'lacroix': { standardServing: 360, fdaCategory: 'Water', description: '12 fl oz can standard' },
    'bubly': { standardServing: 360, fdaCategory: 'Water', description: '12 fl oz can standard' },
    
    // Other beverages
    'coffee': { standardServing: 240, fdaCategory: 'Hot Beverages', description: '8 fl oz (1 cup) standard' },
    'tea': { standardServing: 240, fdaCategory: 'Hot Beverages', description: '8 fl oz (1 cup) standard' },
    'water': { standardServing: 240, fdaCategory: 'Water', description: '8 fl oz (1 cup) standard' },
    'beer': { standardServing: 360, fdaCategory: 'Alcoholic Beverages', description: '12 fl oz standard' },
    'wine': { standardServing: 150, fdaCategory: 'Alcoholic Beverages', description: '5 fl oz standard' },
    'smoothie': { standardServing: 240, fdaCategory: 'Blended Beverages', description: '8 fl oz (1 cup) standard' },
    'milkshake': { standardServing: 240, fdaCategory: 'Dairy Beverages', description: '8 fl oz (1 cup) standard' },
  };

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
    
    // Grains & Starches (Enhanced coverage)
    'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'brown rice': { calories: 123, protein: 2.6, carbs: 23, fat: 0.9 },
    'jasmine rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'basmati rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'wild rice': { calories: 101, protein: 4.0, carbs: 21.3, fat: 0.3 },
    'cooked rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    
    'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
    'white bread': { calories: 266, protein: 8.9, carbs: 49, fat: 3.6 },
    'whole wheat bread': { calories: 247, protein: 13.4, carbs: 41, fat: 4.2 },
    'sourdough bread': { calories: 289, protein: 11.7, carbs: 56.3, fat: 2.1 },
    'rye bread': { calories: 259, protein: 8.5, carbs: 48.3, fat: 3.3 },
    'pita bread': { calories: 275, protein: 9.1, carbs: 55.7, fat: 1.2 },
    'naan': { calories: 310, protein: 8.7, carbs: 54.3, fat: 7.4 },
    'bagel': { calories: 277, protein: 11, carbs: 55.8, fat: 1.4 },
    
    'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'spaghetti': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'penne': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'macaroni': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'linguine': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'fettuccine': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'whole wheat pasta': { calories: 124, protein: 5.3, carbs: 26.5, fat: 0.5 },
    'cooked pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    
    'oats': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
    'oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
    'rolled oats': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
    'steel cut oats': { calories: 379, protein: 14.7, carbs: 67.7, fat: 6.5 },
    'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
    'barley': { calories: 123, protein: 2.3, carbs: 28.2, fat: 0.4 },
    'bulgur': { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2 },
    
    // Breakfast Cereals (per 100g dry weight)
    'cereal': { calories: 379, protein: 8.0, carbs: 84, fat: 1.5 },
    'cheerios': { calories: 378, protein: 11, carbs: 74, fat: 6.5 },
    'cornflakes': { calories: 357, protein: 7.5, carbs: 84, fat: 0.4 },
    'corn flakes': { calories: 357, protein: 7.5, carbs: 84, fat: 0.4 },
    'rice krispies': { calories: 386, protein: 4.0, carbs: 87, fat: 1.0 },
    'frosted flakes': { calories: 375, protein: 4.5, carbs: 88, fat: 0.5 },
    'lucky charms': { calories: 386, protein: 6.0, carbs: 80, fat: 4.0 },
    'fruit loops': { calories: 384, protein: 4.0, carbs: 87, fat: 3.0 },
    'froot loops': { calories: 384, protein: 4.0, carbs: 87, fat: 3.0 },
    'granola': { calories: 471, protein: 13.3, carbs: 57.8, fat: 20.7 },
    'muesli': { calories: 362, protein: 9.7, carbs: 66.2, fat: 6.0 },
    'bran flakes': { calories: 321, protein: 10.6, carbs: 76.0, fat: 1.8 },
    'wheat flakes': { calories: 340, protein: 11.0, carbs: 73.0, fat: 2.2 },
    'shredded wheat': { calories: 340, protein: 11.0, carbs: 73.0, fat: 2.2 },
    'raisin bran': { calories: 316, protein: 7.5, carbs: 75.4, fat: 2.0 },
    'cocoa puffs': { calories: 400, protein: 4.0, carbs: 87, fat: 4.0 },
    'honey nut cheerios': { calories: 367, protein: 7.4, carbs: 78.9, fat: 4.2 },
    'special k': { calories: 374, protein: 17.0, carbs: 74.0, fat: 1.5 },
    'cinnamon toast crunch': { calories: 420, protein: 4.2, carbs: 76.0, fat: 12.0 },
    'captain crunch': { calories: 420, protein: 4.2, carbs: 76.0, fat: 12.0 },
    'trix': { calories: 393, protein: 4.5, carbs: 85.7, fat: 3.6 },
    'cocoa krispies': { calories: 389, protein: 4.2, carbs: 87.0, fat: 2.4 },
    'honey bunches of oats': { calories: 400, protein: 6.7, carbs: 80.0, fat: 6.7 },
    
    // Additional Starches & Snacks
    'crackers': { calories: 489, protein: 8.8, carbs: 63.3, fat: 22.3 },
    'saltine crackers': { calories: 421, protein: 7.0, carbs: 71.0, fat: 12.0 },
    'graham crackers': { calories: 423, protein: 6.1, carbs: 77.5, fat: 9.9 },
    'pretzels': { calories: 380, protein: 10.0, carbs: 79.0, fat: 3.0 },
    'tortilla chips': { calories: 489, protein: 7.2, carbs: 61.9, fat: 23.3 },
    'potato chips': { calories: 536, protein: 7.0, carbs: 53.0, fat: 32.0 },
    'tortilla': { calories: 218, protein: 5.7, carbs: 43.6, fat: 2.9 },
    'flour tortilla': { calories: 304, protein: 8.2, carbs: 50.4, fat: 7.3 },
    'corn tortilla': { calories: 218, protein: 5.7, carbs: 43.6, fat: 2.9 },
    'wrap': { calories: 304, protein: 8.2, carbs: 50.4, fat: 7.3 },
    
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
    
    // Chicken & Poultry (USDA-based accurate data)
    'chicken meat': { calories: 250, protein: 23, carbs: 0, fat: 15 },
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'grilled chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'baked chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'roasted chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'chicken thigh': { calories: 250, protein: 23, carbs: 0, fat: 15.5 },
    'chicken drumstick': { calories: 250, protein: 23, carbs: 0, fat: 15.5 },
    'chicken wing': { calories: 290, protein: 27, carbs: 0, fat: 19.5 },
    'ground chicken': { calories: 143, protein: 26, carbs: 0, fat: 3.6 },
    'chicken tenders': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'rotisserie chicken': { calories: 190, protein: 29, carbs: 0, fat: 7.4 },
    'fried chicken': { calories: 320, protein: 25, carbs: 8, fat: 20 },
    
    // Turkey
    'turkey meat': { calories: 189, protein: 29, carbs: 0, fat: 7.4 },
    'turkey breast': { calories: 135, protein: 30, carbs: 0, fat: 1 },
    'ground turkey': { calories: 200, protein: 27, carbs: 0, fat: 8 },
    
    // Beef (USDA-based accurate data)
    'beef meat': { calories: 250, protein: 26, carbs: 0, fat: 15 },
    'ground beef': { calories: 254, protein: 26, carbs: 0, fat: 15 },
    'lean ground beef': { calories: 213, protein: 26, carbs: 0, fat: 11 },
    'sirloin steak': { calories: 271, protein: 27, carbs: 0, fat: 17 },
    'ribeye steak': { calories: 291, protein: 25, carbs: 0, fat: 21 },
    'filet mignon': { calories: 227, protein: 25, carbs: 0, fat: 13 },
    'new york strip': { calories: 271, protein: 27, carbs: 0, fat: 17 },
    'chuck roast': { calories: 293, protein: 22, carbs: 0, fat: 23 },
    'brisket': { calories: 338, protein: 21, carbs: 0, fat: 28 },
    
    // Pork
    'pork meat': { calories: 242, protein: 27, carbs: 0, fat: 14 },
    'pork chop': { calories: 231, protein: 25, carbs: 0, fat: 14 },
    'pork tenderloin': { calories: 143, protein: 26, carbs: 0, fat: 3.5 },
    'bacon strips': { calories: 541, protein: 37, carbs: 1.4, fat: 42 },
    'ham slices': { calories: 145, protein: 21, carbs: 1.5, fat: 5.5 },
    'ground pork meat': { calories: 297, protein: 25, carbs: 0, fat: 21 },
    
    // Fish & Seafood (USDA-based accurate data)
    'salmon fish': { calories: 208, protein: 25, carbs: 0, fat: 12 },
    'tuna': { calories: 144, protein: 30, carbs: 0, fat: 1 },
    'cod': { calories: 105, protein: 23, carbs: 0, fat: 0.9 },
    'tilapia': { calories: 128, protein: 26, carbs: 0, fat: 2.7 },
    'shrimp': { calories: 85, protein: 20, carbs: 0, fat: 0.3 },
    'crab': { calories: 97, protein: 20, carbs: 0, fat: 1.8 },
    'lobster': { calories: 89, protein: 19, carbs: 0, fat: 0.9 },
    'mahi mahi': { calories: 109, protein: 23, carbs: 0, fat: 0.9 },
    'halibut': { calories: 111, protein: 23, carbs: 0, fat: 2.3 },
    'sea bass': { calories: 125, protein: 23, carbs: 0, fat: 2.6 },
    'snapper': { calories: 128, protein: 26, carbs: 0, fat: 1.7 },
    'tuna steak': { calories: 144, protein: 30, carbs: 0, fat: 1 },
    'salmon fillet': { calories: 208, protein: 25, carbs: 0, fat: 12 },

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
    'breakfruit': { calories: 103, protein: 1.1, carbs: 27, fat: 0.2 }, // Common misspelling
    'callaloo': { calories: 22, protein: 2.1, carbs: 3.7, fat: 0.3 },
    'curry goat': { calories: 250, protein: 22, carbs: 5, fat: 16 },
    'oxtail': { calories: 330, protein: 19, carbs: 0, fat: 28 },
    'saltfish': { calories: 290, protein: 62, carbs: 0, fat: 2.4 },
    'ackee': { calories: 151, protein: 2.9, carbs: 0.8, fat: 15 },
    
    // Additional Caribbean fruits
    'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
    'papaya': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },
    'guava': { calories: 68, protein: 2.6, carbs: 14.3, fat: 1.0 },
    'soursop': { calories: 66, protein: 1.0, carbs: 16.8, fat: 0.3 },
    'star fruit': { calories: 31, protein: 1.0, carbs: 6.7, fat: 0.3 },
    'passion fruit': { calories: 97, protein: 2.2, carbs: 23.4, fat: 0.7 },
    'sugar apple': { calories: 94, protein: 2.1, carbs: 23.6, fat: 0.3 },
    'sweetsop': { calories: 94, protein: 2.1, carbs: 23.6, fat: 0.3 },
    'custard apple': { calories: 94, protein: 2.1, carbs: 23.6, fat: 0.3 },
    'coconut meat': { calories: 354, protein: 3.3, carbs: 15.2, fat: 33.5 },
    'june plum': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'golden apple': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'otaheite apple': { calories: 25, protein: 0.6, carbs: 5.7, fat: 0.3 },
    'mountain apple': { calories: 25, protein: 0.6, carbs: 5.7, fat: 0.3 },
    'carambola': { calories: 31, protein: 1.0, carbs: 6.7, fat: 0.3 },
    'avocado': { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7 },
    'lime': { calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2 },
    'scotch bonnet pepper': { calories: 40, protein: 1.9, carbs: 8.8, fat: 0.4 },
    'plantain': { calories: 122, protein: 1.3, carbs: 32, fat: 0.4 },
    
    // Caribbean fruit variations and alternative names
    'plumrose': { calories: 25, protein: 0.6, carbs: 5.7, fat: 0.3 }, // Mountain apple variety
    'starapple': { calories: 67, protein: 1.5, carbs: 15.3, fat: 0.7 }, // Star apple (one word)
    'star apple': { calories: 67, protein: 1.5, carbs: 15.3, fat: 0.7 },
    'timbrine': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 }, // Regional name for june plum
    'golden plum': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'hog plum': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'jew plum': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'coolie plum': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'pommecythere': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
    'rose apple': { calories: 25, protein: 0.6, carbs: 5.7, fat: 0.3 },
    'wax apple': { calories: 25, protein: 0.6, carbs: 5.7, fat: 0.3 },
    'water apple': { calories: 25, protein: 0.6, carbs: 5.7, fat: 0.3 },
    'mammee apple': { calories: 51, protein: 0.5, carbs: 12.5, fat: 0.5 },
    'mamey': { calories: 124, protein: 1.4, carbs: 32.1, fat: 0.5 },
    'sapodilla': { calories: 83, protein: 0.4, carbs: 20, fat: 1.1 },
    'naseberry': { calories: 83, protein: 0.4, carbs: 20, fat: 1.1 },
    'guinep': { calories: 58, protein: 1.3, carbs: 13.7, fat: 0.1 },
    'spanish lime': { calories: 58, protein: 1.3, carbs: 13.7, fat: 0.1 },
    'ackee fruit': { calories: 151, protein: 2.9, carbs: 0.8, fat: 15 },
    'breadnut': { calories: 191, protein: 7.4, carbs: 38.4, fat: 2.3 },
    
    // Additional Caribbean fruit variations
    'tambrine': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 }, // Another spelling of timbrine
    'jackfruit': { calories: 95, protein: 1.7, carbs: 23.2, fat: 0.6 },
    'jack fruit': { calories: 95, protein: 1.7, carbs: 23.2, fat: 0.6 },
    'caimito': { calories: 67, protein: 1.5, carbs: 15.3, fat: 0.7 }, // Star apple Spanish name
    'milk fruit': { calories: 67, protein: 1.5, carbs: 15.3, fat: 0.7 },
    
    // Critical Missing Foods - Phase 1 (Daily Use)
    'eggs': { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0 },
    'omelette': { calories: 154, protein: 11.0, carbs: 0.6, fat: 11.9 },
    'yogurt': { calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4 },
    'yoghurt': { calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4 }, // UK spelling
    'greek yogurt': { calories: 100, protein: 17.3, carbs: 3.9, fat: 0.4 },
    'soup': { calories: 38, protein: 1.9, carbs: 5.4, fat: 1.2 },
    'chips': { calories: 536, protein: 7.0, carbs: 53.0, fat: 35.0 },
    
    // Dairy and Cheese Varieties
    'cheese': { calories: 113, protein: 7.0, carbs: 1.0, fat: 9.0 },
    'cheddar cheese': { calories: 403, protein: 25.0, carbs: 1.3, fat: 33.1 },
    'mozzarella': { calories: 300, protein: 22.2, carbs: 2.2, fat: 22.4 },
    'swiss cheese': { calories: 380, protein: 27.0, carbs: 5.4, fat: 27.8 },
    'cream cheese': { calories: 342, protein: 6.2, carbs: 4.1, fat: 34.4 },
    'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81.0 },
    'margarine': { calories: 719, protein: 0.2, carbs: 0.9, fat: 80.7 },
    
    // Condiments and Spreads
    'mayo': { calories: 680, protein: 1.0, carbs: 0.6, fat: 75.0 },
    'mustard': { calories: 66, protein: 4.1, carbs: 8.3, fat: 4.2 },
    'ranch dressing': { calories: 320, protein: 0.4, carbs: 5.9, fat: 33.8 },
    'honey': { calories: 304, protein: 0.3, carbs: 82.4, fat: 0.0 },
    'jelly': { calories: 278, protein: 0.1, carbs: 73.6, fat: 0.1 },
    'peanut butter': { calories: 588, protein: 25.8, carbs: 20.0, fat: 50.4 },
    'almond butter': { calories: 614, protein: 21.2, carbs: 18.8, fat: 55.5 },
    
    // Nuts and Seeds
    'nuts': { calories: 607, protein: 20.3, carbs: 21.7, fat: 54.1 },
    'almonds': { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9 },
    'walnuts': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2 },
    'cashews': { calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9 },
    'peanuts': { calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2 },
    
    // Additional proteins
    'steak meat': { calories: 271, protein: 25.4, carbs: 0.0, fat: 18.4 },
    'fish fillet': { calories: 206, protein: 22.0, carbs: 0.0, fat: 12.4 },
    
    // Common Vegetables
    'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
    'kale': { calories: 35, protein: 2.9, carbs: 4.4, fat: 1.5 },
    'cauliflower': { calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3 },
    'carrots': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
    'celery': { calories: 16, protein: 0.7, carbs: 3.5, fat: 0.2 },
    'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
    
    // Breakfast Foods and Pancakes
    'pancake': { calories: 227, protein: 6.2, carbs: 28.8, fat: 9.0 },
    'pancakes': { calories: 227, protein: 6.2, carbs: 28.8, fat: 9.0 },
    'buttermilk pancake': { calories: 227, protein: 6.2, carbs: 28.8, fat: 9.0 },
    'buttermilk pancakes': { calories: 227, protein: 6.2, carbs: 28.8, fat: 9.0 },
    'blueberry pancake': { calories: 253, protein: 6.7, carbs: 33.1, fat: 10.5 },
    'blueberry pancakes': { calories: 253, protein: 6.7, carbs: 33.1, fat: 10.5 },
    'chocolate chip pancake': { calories: 250, protein: 6.0, carbs: 32.0, fat: 11.0 },
    'chocolate chip pancakes': { calories: 250, protein: 6.0, carbs: 32.0, fat: 11.0 },
    'whole wheat pancake': { calories: 200, protein: 8.1, carbs: 25.0, fat: 7.9 },
    'whole wheat pancakes': { calories: 200, protein: 8.1, carbs: 25.0, fat: 7.9 },
    'waffle': { calories: 291, protein: 7.9, carbs: 33.4, fat: 14.7 },
    'waffles': { calories: 291, protein: 7.9, carbs: 33.4, fat: 14.7 },
    'belgian waffle': { calories: 291, protein: 7.9, carbs: 33.4, fat: 14.7 },
    'belgian waffles': { calories: 291, protein: 7.9, carbs: 33.4, fat: 14.7 },
    'french toast': { calories: 166, protein: 5.9, carbs: 16.3, fat: 7.7 },
    
    // Candy and Confectionery
    'twizzlers': { calories: 327, protein: 3.7, carbs: 79.6, fat: 0.9 },
    'twizzler': { calories: 327, protein: 3.7, carbs: 79.6, fat: 0.9 },
    'red licorice': { calories: 327, protein: 3.7, carbs: 79.6, fat: 0.9 },
    'strawberry twizzlers': { calories: 327, protein: 3.7, carbs: 79.6, fat: 0.9 },
    'licorice': { calories: 327, protein: 3.7, carbs: 79.6, fat: 0.9 },
    'licorice candy': { calories: 327, protein: 3.7, carbs: 79.6, fat: 0.9 },
    'candy': { calories: 380, protein: 0, carbs: 100, fat: 0 },
    'gummy bears': { calories: 318, protein: 6.9, carbs: 77.2, fat: 0.2 },
    'gummy candy': { calories: 318, protein: 6.9, carbs: 77.2, fat: 0.2 },
    'hard candy': { calories: 394, protein: 0, carbs: 97.2, fat: 1.0 },
    'lollipop': { calories: 392, protein: 0, carbs: 98, fat: 0 },
    'chocolate candy': { calories: 535, protein: 4.2, carbs: 59.2, fat: 31.3 },

    // Desserts and Sweet Treats
    'brownie': { calories: 466, protein: 6.1, carbs: 63.3, fat: 20.7 },
    'brownies': { calories: 466, protein: 6.1, carbs: 63.3, fat: 20.7 },
    'chocolate brownie': { calories: 466, protein: 6.1, carbs: 63.3, fat: 20.7 },
    'cake': { calories: 257, protein: 2.9, carbs: 46.4, fat: 7.7 },
    'chocolate cake': { calories: 371, protein: 4.9, carbs: 50.7, fat: 16.9 },
    'vanilla cake': { calories: 257, protein: 2.9, carbs: 46.4, fat: 7.7 },
    'birthday cake': { calories: 257, protein: 2.9, carbs: 46.4, fat: 7.7 },
    'cupcake': { calories: 305, protein: 3.6, carbs: 48.3, fat: 11.1 },
    'muffin': { calories: 377, protein: 6.6, carbs: 55.1, fat: 15.8 },
    'chocolate muffin': { calories: 377, protein: 6.6, carbs: 55.1, fat: 15.8 },
    'blueberry muffin': { calories: 313, protein: 5.7, carbs: 54.6, fat: 8.5 },
    'cookie': { calories: 502, protein: 5.9, carbs: 64, fat: 24 },
    'chocolate chip cookie': { calories: 488, protein: 5.9, carbs: 68.4, fat: 22.9 },
    'sugar cookie': { calories: 473, protein: 6.1, carbs: 71.6, fat: 18.6 },
    'oatmeal cookie': { calories: 457, protein: 6.1, carbs: 68.4, fat: 18.8 },
    'pie': { calories: 237, protein: 2.6, carbs: 34.4, fat: 10.7 },
    'apple pie': { calories: 237, protein: 2.6, carbs: 34.4, fat: 10.7 },
    'pumpkin pie': { calories: 229, protein: 4.5, carbs: 30.4, fat: 10.4 },
    'cheesecake': { calories: 321, protein: 5.5, carbs: 25.9, fat: 22.9 },
    'ice cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11 },
    'vanilla ice cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11 },
    'chocolate ice cream': { calories: 216, protein: 3.8, carbs: 28.2, fat: 11 },
    'strawberry ice cream': { calories: 192, protein: 3.2, carbs: 24.4, fat: 9.8 },
    'donut': { calories: 452, protein: 4.9, carbs: 51, fat: 25 },
    'doughnut': { calories: 452, protein: 4.9, carbs: 51, fat: 25 },
    'glazed donut': { calories: 269, protein: 4.1, carbs: 31.8, fat: 14.2 },
    'chocolate donut': { calories: 452, protein: 4.9, carbs: 51, fat: 25 },
    'pudding': { calories: 158, protein: 2.8, carbs: 22.7, fat: 6.8 },
    'chocolate pudding': { calories: 158, protein: 2.8, carbs: 22.7, fat: 6.8 },
    'vanilla pudding': { calories: 111, protein: 2.5, carbs: 17.6, fat: 2.8 },
    'tiramisu': { calories: 240, protein: 4.0, carbs: 21.0, fat: 16.0 },
    'creme brulee': { calories: 323, protein: 6.1, carbs: 21.4, fat: 24.3 },
    'panna cotta': { calories: 240, protein: 4.5, carbs: 20.0, fat: 16.0 },
    'mousse': { calories: 168, protein: 6.1, carbs: 16.0, fat: 9.3 },
    'chocolate mousse': { calories: 168, protein: 6.1, carbs: 16.0, fat: 9.3 },
    'eclair': { calories: 262, protein: 6.0, carbs: 24.3, fat: 15.9 },
    'profiterole': { calories: 262, protein: 6.0, carbs: 24.3, fat: 15.9 },
    'cannoli': { calories: 380, protein: 8.2, carbs: 27.1, fat: 27.1 },
    'baklava': { calories: 307, protein: 4.4, carbs: 32.0, fat: 18.3 },
    'fudge': { calories: 411, protein: 2.2, carbs: 84.2, fat: 8.6 },
    'tart': { calories: 256, protein: 2.5, carbs: 39.2, fat: 10.7 },
    'fruit tart': { calories: 256, protein: 2.5, carbs: 39.2, fat: 10.7 },
    'macaron': { calories: 390, protein: 8.5, carbs: 45.0, fat: 20.0 },
    'macaroon': { calories: 181, protein: 2.0, carbs: 17.8, fat: 12.0 },
    'strudel': { calories: 274, protein: 4.0, carbs: 29.0, fat: 16.0 },
    'danish': { calories: 374, protein: 6.6, carbs: 45.9, fat: 18.8 },
    'croissant': { calories: 406, protein: 8.2, carbs: 45.8, fat: 21.0 },
    'pain au chocolat': { calories: 414, protein: 7.8, carbs: 44.6, fat: 23.2 },
    
    // Olives and olive products
    'olive': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
    'olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
    'green olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
    'black olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
    'kalamata olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
    
    // Peanut butter sandwiches
    'peanut butter sandwich': { calories: 325, protein: 13.8, carbs: 32.4, fat: 16.2 },
    'pb sandwich': { calories: 325, protein: 13.8, carbs: 32.4, fat: 16.2 },
    'peanut butter and jelly': { calories: 342, protein: 12.4, carbs: 38.6, fat: 15.8 },
    'pbj sandwich': { calories: 342, protein: 12.4, carbs: 38.6, fat: 15.8 },
    'pb&j': { calories: 342, protein: 12.4, carbs: 38.6, fat: 15.8 }
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
   * Search cached foods locally with optimized performance and intelligent prioritization
   */
  private async searchCachedFoodsInternal(query: string, limit: number) {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      const results = await db
        .select()
        .from(usdaFoodCache)
        .where(
          or(
            like(sql`LOWER(${usdaFoodCache.description})`, searchTerm),
            like(sql`LOWER(${usdaFoodCache.brandName})`, searchTerm || '')
          )
        )
        .orderBy(
          // Optimized scoring system with search count and data quality
          sql`CASE 
            WHEN LOWER(${usdaFoodCache.description}) = LOWER(${query}) THEN 0
            WHEN LOWER(${usdaFoodCache.description}) LIKE LOWER(${query}) || '%' THEN 1
            WHEN ${usdaFoodCache.dataType} = 'Foundation' THEN 2
            WHEN ${usdaFoodCache.dataType} = 'SR Legacy' THEN 3
            WHEN ${usdaFoodCache.searchCount} > 10 THEN 4
            WHEN ${usdaFoodCache.searchCount} > 5 THEN 5
            ELSE 6
          END`,
          sql`${usdaFoodCache.searchCount} DESC`,
          usdaFoodCache.description
        )
        .limit(limit);
      
      // Update search count for popular items (fire and forget)
      if (results.length > 0) {
        const topResult = results[0];
        db.update(usdaFoodCache)
          .set({ 
            searchCount: sql`${usdaFoodCache.searchCount} + 1`,
            lastUpdated: new Date()
          })
          .where(sql`${usdaFoodCache.id} = ${topResult.id}`)
          .then()
          .catch(() => {}); // Silent fail for performance
      }
      
      return results;
    } catch (error) {
      // Cache search failed, using fallback method
      return [];
    }
  }

  /**
   * Cache USDA search results with batch optimization
   */
  private async cacheSearchResults(foods: USDAFood[]) {
    if (foods.length === 0) return;
    
    // Batch insert for better performance
    const cacheEntries = foods.map(food => {
      const nutrients = this.extractNutrients(food.foodNutrients);
      
      return {
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
      };
    });
    
    // Batch insert with conflict resolution
    try {
      for (const entry of cacheEntries) {
        await db
          .insert(usdaFoodCache)
          .values(entry)
          .onConflictDoUpdate({
            target: [usdaFoodCache.fdcId],
            set: {
              searchCount: sql`${usdaFoodCache.searchCount} + 1`,
              lastUpdated: new Date(),
            },
          });
      }
    } catch (error) {
      // Batch cache insert failed, continuing without caching
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
      // Micronutrients
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
      phosphorus: 0
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
      } else if (name.includes('iron') || nutrientId === 1089) { // Iron, mg
        nutrients.iron = amount;
      } else if (name.includes('calcium') || nutrientId === 1087) { // Calcium, mg
        nutrients.calcium = amount;
      } else if (name.includes('zinc') || nutrientId === 1095) { // Zinc, mg
        nutrients.zinc = amount;
      } else if (name.includes('magnesium') || nutrientId === 1090) { // Magnesium, mg
        nutrients.magnesium = amount;
      } else if ((name.includes('vitamin c') || name.includes('ascorbic')) || nutrientId === 1162) { // Vitamin C, mg
        nutrients.vitaminC = amount;
      } else if (name.includes('vitamin d') || nutrientId === 1110 || nutrientId === 1114) { // Vitamin D (D2 + D3), mcg
        nutrients.vitaminD += amount;
      } else if (name.includes('vitamin b-12') || name.includes('cobalamin') || nutrientId === 1178) { // Vitamin B12, mcg
        nutrients.vitaminB12 = amount;
      } else if (name.includes('folate') || nutrientId === 1177) { // Folate, mcg
        nutrients.folate = amount;
      } else if (name.includes('vitamin a') || nutrientId === 1106 || nutrientId === 1107) { // Vitamin A, mcg
        nutrients.vitaminA += amount;
      } else if (name.includes('vitamin e') || nutrientId === 1109) { // Vitamin E, mg
        nutrients.vitaminE = amount;
      } else if (name.includes('potassium') || nutrientId === 1092) { // Potassium, mg
        nutrients.potassium = amount;
      } else if (name.includes('phosphorus') || nutrientId === 1091) { // Phosphorus, mg
        nutrients.phosphorus = amount;
      }
    }

    return nutrients;
  }

  /**
   * Parse measurement string and convert to grams
   */
  /**
   * Get smart serving sizes for realistic portions
   */
  private getSmartServingSize(ingredient: string, measurement: string): { grams: number; servingName: string; isRealistic: boolean; warning?: string } {
    const cleanIngredient = ingredient.toLowerCase();
    const cleanMeasurement = measurement.toLowerCase();

    // Realistic serving sizes database
    const servingSizes: Record<string, { [key: string]: { grams: number; name: string } }> = {
      'potato chips': {
        'serving': { grams: 28, name: '1 oz serving (about 15 chips)' },
        'small bag': { grams: 28, name: '1 oz individual bag' },
        'handful': { grams: 15, name: 'small handful' },
        'large handful': { grams: 28, name: 'large handful' },
        'family size': { grams: 150, name: 'family size sharing portion' }
      },
      'tortilla chips': {
        'serving': { grams: 28, name: '1 oz serving (about 12 chips)' },
        'small bag': { grams: 28, name: '1 oz bag' },
        'handful': { grams: 20, name: 'handful (6-8 chips)' }
      },
      'crackers': {
        'serving': { grams: 16, name: '4-6 crackers' },
        'handful': { grams: 12, name: 'small handful' }
      },
      'chicken breast': {
        'serving': { grams: 113, name: '4 oz serving' },
        'piece': { grams: 113, name: '1 medium breast' },
        'large': { grams: 170, name: '6 oz large breast' }
      },
      'ground beef': {
        'serving': { grams: 113, name: '4 oz serving' },
        'patty': { grams: 113, name: '1/4 lb burger patty' }
      }
    };

    // Check for specific food matches
    for (const [food, sizes] of Object.entries(servingSizes)) {
      if (cleanIngredient.includes(food)) {
        // Try to match measurement terms
        for (const [term, size] of Object.entries(sizes)) {
          if (cleanMeasurement.includes(term)) {
            return { grams: size.grams, servingName: size.name, isRealistic: true };
          }
        }
        // Default to serving size
        if (sizes.serving) {
          return { grams: sizes.serving.grams, servingName: sizes.serving.name, isRealistic: true };
        }
      }
    }

    return { grams: 100, servingName: 'standard serving', isRealistic: false };
  }

  /**
   * Check if portion size is unrealistically large and provide warnings
   */
  private validatePortionSize(ingredient: string, grams: number, calories?: number): any {
    const cleanIngredient = ingredient.toLowerCase();
    
    // Define unrealistic portion thresholds for different food types
    const portionLimits = {
      'potato chips': { warning: 100, extreme: 200, realistic: 28, suggestedServing: '1 oz (28g)', suggestedCalories: 152 },
      'chips': { warning: 100, extreme: 200, realistic: 28, suggestedServing: '1 oz (28g)', suggestedCalories: 152 },
      'tortilla chips': { warning: 100, extreme: 200, realistic: 28, suggestedServing: '1 oz (28g)', suggestedCalories: 140 },
      'crackers': { warning: 60, extreme: 120, realistic: 30, suggestedServing: '6 crackers (30g)', suggestedCalories: 120 },
      'candy': { warning: 100, extreme: 200, realistic: 40, suggestedServing: '1.4 oz (40g)', suggestedCalories: 150 },
      'chocolate': { warning: 100, extreme: 200, realistic: 40, suggestedServing: '1.4 oz (40g)', suggestedCalories: 200 },
      'ice cream': { warning: 200, extreme: 400, realistic: 65, suggestedServing: '1/2 cup (65g)', suggestedCalories: 130 },
      'cookies': { warning: 100, extreme: 200 },
      'nuts': { warning: 60, extreme: 120 }
    };

    for (const [food, limits] of Object.entries(portionLimits)) {
      if (cleanIngredient.includes(food)) {
        if (grams >= limits.extreme) {
          return {
            warning: `⚠️ Very large portion (${grams}g)`,
            suggestion: `Consider a typical serving of ${limits.warning/4}g (${(limits.warning/4 * 536/100).toFixed(0)} cal) instead`
          };
        } else if (grams >= limits.warning) {
          return {
            warning: `⚠️ Large portion (${grams}g)`,
            suggestion: `Typical serving is ${limits.warning/4}g (${(limits.warning/4 * 536/100).toFixed(0)} cal)`
          };
        }
      }
    }

    return {};
  }

  /**
   * Get candy-specific portion data from the candy nutrition database
   */
  private getCandySpecificPortion(foodDescription: string, measurement: string): {
    quantity: number;
    unit: string;
    gramsEquivalent: number;
    portionInfo?: { isRealistic: boolean; warning?: string; suggestion?: string; servingName?: string };
  } | null {
    // Check if this is a candy item
    if (!this.isCandyRelated(foodDescription)) {
      return null;
    }

    // Get candy data from the enhanced database
    const candyData = findCandyNutrition(foodDescription);
    if (candyData) {
      // Parse the measurement to get quantity and unit
      const measurementParts = this.parseSimpleMeasurement(measurement);
      let { quantity, unit } = measurementParts;
      
      // Find matching serving size from candy database
      const matchingServing = candyData.servingSizes.find(serving => {
        const servingName = serving.name.toLowerCase();
        const unitLower = unit.toLowerCase();
        
        return (
          servingName.includes(unitLower) ||
          unitLower.includes('piece') && servingName.includes('piece') ||
          unitLower.includes('small') && servingName.includes('small') ||
          unitLower.includes('oz') && servingName.includes('oz')
        );
      });

      if (matchingServing) {
        const gramsEquivalent = quantity * matchingServing.grams;
        return {
          quantity,
          unit: matchingServing.name,
          gramsEquivalent,
          portionInfo: {
            isRealistic: true,
            servingName: `${quantity} × ${matchingServing.name} (${matchingServing.grams}g each)`
          }
        };
      }

      // Fallback to default serving size for the candy type
      const defaultServing = candyData.servingSizes[1] || candyData.servingSizes[0]; // Prefer "1 piece" over small
      if (defaultServing) {
        const gramsEquivalent = quantity * defaultServing.grams;
        return {
          quantity,
          unit: defaultServing.name,
          gramsEquivalent,
          portionInfo: {
            isRealistic: true,
            servingName: `${quantity} × ${defaultServing.name} (${defaultServing.grams}g each)`,
            warning: `Using standard ${candyData.category} candy portion`
          }
        };
      }
    }

    // No candy database match, return null to use standard parsing
    return null;
  }

  /**
   * Generate portion warnings for unrealistic measurements
   */
  private generatePortionWarning(
    ingredient: string, 
    unit: string, 
    actualGrams: number, 
    availableConversions: { [key: string]: number }
  ): { isRealistic: boolean; warning?: string; suggestion?: string; servingName?: string } | undefined {
    
    // Portion warning check
    
    // FDA RACC (Reference Amounts Customarily Consumed) standards
    const fdaServings: { [key: string]: { standardUnit: string; standardGrams: number; category: string } } = {
      'snickers': { standardUnit: 'bar', standardGrams: 52, category: 'candy bar' },
      'snickers bar': { standardUnit: 'bar', standardGrams: 52, category: 'candy bar' },
      'ice cream bar': { standardUnit: 'bar', standardGrams: 60, category: 'ice cream bar' },
      'ice cream': { standardUnit: 'cup', standardGrams: 66, category: 'ice cream' },
      'popsicle': { standardUnit: 'piece', standardGrams: 50, category: 'popsicle' },
      'kit kat': { standardUnit: 'bar', standardGrams: 42, category: 'candy bar' },
      'reeses': { standardUnit: 'cup', standardGrams: 21, category: 'candy' },
      'hershey': { standardUnit: 'bar', standardGrams: 43, category: 'candy bar' },
      'chips': { standardUnit: 'oz', standardGrams: 28, category: 'snack' },
      'potato chips': { standardUnit: 'oz', standardGrams: 28, category: 'snack' },
    };
    
    // Normalize ingredient name for lookup
    const normalizedIngredient = ingredient.toLowerCase().trim();
    // Looking up FDA data
    
    let fdaInfo = fdaServings[normalizedIngredient];
    
    // Try partial matches if exact match fails
    if (!fdaInfo) {
      for (const [key, info] of Object.entries(fdaServings)) {
        if (normalizedIngredient.includes(key) || key.includes(normalizedIngredient)) {
          fdaInfo = info;
          // Found partial match in FDA data
          break;
        }
      }
    }
    
    if (!fdaInfo) {
      // No FDA data found
      return { isRealistic: true };
    }
    
    // FDA portion comparison
    
    // Warning if user measurement is significantly different from FDA standard
    const percentDifference = Math.abs(actualGrams - fdaInfo.standardGrams) / fdaInfo.standardGrams;
    
    // Warn if portion is more than 50% different from FDA standard
    if (percentDifference > 0.5) {
      const suggestions = [];
      
      // Find available FDA-compliant serving suggestions
      if (availableConversions[fdaInfo.standardUnit]) {
        suggestions.push(`1 ${fdaInfo.standardUnit} (${fdaInfo.standardGrams}g)`);
      }
      if (availableConversions['piece'] && fdaInfo.standardUnit !== 'piece') {
        suggestions.push(`1 piece`);
      }
      if (availableConversions['bar'] && fdaInfo.standardUnit !== 'bar') {
        suggestions.push(`1 bar`);
      }
      
      const comparisonText = actualGrams < fdaInfo.standardGrams 
        ? `much smaller than` 
        : `much larger than`;
      
      return {
        isRealistic: false,
        warning: `Your portion (${actualGrams}g) is ${comparisonText} FDA standard (${fdaInfo.standardGrams}g)`,
        suggestion: suggestions.length > 0 ? `FDA recommendation: ${suggestions.join(' or ')}` : undefined,
        servingName: `FDA RACC: 1 ${fdaInfo.standardUnit} (${fdaInfo.standardGrams}g)`
      };
    }
    
    return { isRealistic: true };
  }

  /**
   * Simple measurement parsing for candy portion detection
   */
  private parseSimpleMeasurement(measurement: string): { quantity: number; unit: string } {
    const normalized = measurement.toLowerCase().trim();
    
    // Handle fractions
    const fractionMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)\s*(.*)$/);
    if (fractionMatch) {
      const quantity = parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
      const unit = fractionMatch[3].trim() || 'piece';
      return { quantity, unit };
    }
    
    // Handle regular numbers
    const numberMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (numberMatch) {
      return {
        quantity: parseFloat(numberMatch[1]),
        unit: numberMatch[2].trim() || 'piece'
      };
    }
    
    // Default case
    return { quantity: 1, unit: normalized || 'piece' };
  }

  private parseMeasurement(measurement: string, food: USDAFood): {
    quantity: number;
    unit: string;
    gramsEquivalent: number;
    portionInfo?: { isRealistic: boolean; warning?: string; suggestion?: string; servingName?: string };
  } {
    // Check if this is a candy item first and use candy-specific portions
    const candyPortionResult = this.getCandySpecificPortion(food.description, measurement);
    if (candyPortionResult) {
      return candyPortionResult;
    }

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

    // Standard conversions with base unit names (realistic servings prioritized)
    const conversions: { [key: string]: number } = {
      'gram': 1,
      'kilogram': 1000,
      'ounce': 28.35,
      'pound': 453.6,
      'cup': 240, // standard cup volume ≈ 240ml/g
      'cups': 240, // same as singular for consistency
      // Small measurements (trigger warnings for candy bars)
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
      'piece': 50, // average piece ≈ 50g (FDA standard for most food items)
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
      // Ice cream products - FDA RACC compliant
      'ice cream bar': {
        'bar': 60,     // FDA RACC: 1 bar = 60g
        'piece': 60,   // 1 piece = 1 bar
        'bars': 60,
      },
      'ice cream': {
        'cup': 66,     // FDA RACC: 2/3 cup = 66g
        'scoop': 66,   // 1 scoop ≈ 2/3 cup
        'tablespoon': 15,
      },
      // Premium ice cream bars - specific brands
      'haagen dazs bar': {
        'bar': 88,     // Standard Haagen-Dazs bar (88ml/~85g)
        'piece': 88,   // 1 piece = 1 bar
        'bars': 88,
      },
      'haagen dazs': {
        'bar': 88,     // Standard Haagen-Dazs bar (88ml/~85g)
        'piece': 88,   // 1 piece = 1 bar
        'bars': 88,
      },
      'haagen-dazs bar': {
        'bar': 88,     // Standard Haagen-Dazs bar (88ml/~85g)
        'piece': 88,   // 1 piece = 1 bar
        'bars': 88,
      },
      'haagen-dazs': {
        'bar': 88,     // Standard Haagen-Dazs bar (88ml/~85g)
        'piece': 88,   // 1 piece = 1 bar
        'bars': 88,
      },
      'klondike bar': {
        'bar': 91,     // Standard Klondike bar (~3 oz/85-97g average)
        'piece': 91,   // 1 piece = 1 bar
        'bars': 91,
      },
      'klondike': {
        'bar': 91,     // Standard Klondike bar (~3 oz/85-97g average)
        'piece': 91,   // 1 piece = 1 bar
        'bars': 91,
      },
      'good humor bar': {
        'bar': 78,     // Good Humor bar (2.75 fl oz/~78g)
        'piece': 78,   // 1 piece = 1 bar
        'bars': 78,
      },
      'good humor': {
        'bar': 78,     // Good Humor bar (2.75 fl oz/~78g)
        'piece': 78,   // 1 piece = 1 bar
        'bars': 78,
      },
      'creamsicle': {
        'bar': 78,     // Good Humor Creamsicle bar (2.75 fl oz)
        'piece': 78,   // 1 piece = 1 bar
        'bars': 78,
      },
      'ben jerry bar': {
        'bar': 71,     // Ben & Jerry's pint slice bar (~250 cal/3.5 oz)
        'piece': 71,   // 1 piece = 1 bar
        'bars': 71,
        'slice': 71,   // Pint slice
      },
      'ben jerrys bar': {
        'bar': 71,     // Ben & Jerry's pint slice bar
        'piece': 71,   // 1 piece = 1 bar
        'bars': 71,
        'slice': 71,   // Pint slice
      },
      'popsicle': {
        'piece': 50,   // FDA RACC: 1 popsicle = 50g
        'popsicle': 50,
        'pop': 50,
      },
      // Candy and confectionery items
      'twizzlers': {
        'piece': 11,  // Standard Twizzlers piece ≈ 11g
        'pieces': 11,
        'stick': 11,
        'package': 70, // Small package ≈ 70g
      },
      'twizzler': {
        'piece': 11,
        'pieces': 11,
        'stick': 11,
      },
      // Comprehensive candy portion data
      'candy bar': {
        'piece': 6,  // Average candy piece
        'pieces': 6,
        'small': 3,  // Small candy piece
        'large': 12, // Large candy piece
        'fun size': 15, // Fun size candy bar
        'bite size': 8,  // Bite-sized candy
      },
      'chocolate': {
        'piece': 10,  // Average chocolate piece
        'pieces': 10,
        'square': 5,   // Chocolate square
        'bar': 40,     // Standard chocolate bar
        'mini': 7,     // Mini chocolate
        'fun size': 17, // Fun size chocolate bar
        'king size': 75, // King size bar
      },
      'gummy': {
        'piece': 3,    // Individual gummy candy
        'pieces': 3,
        'bear': 3,     // Gummy bear
        'bears': 3,
        'worm': 2,     // Gummy worm
        'worms': 2,
        'package': 50, // Small package of gummies
      },
      'lollipop': {
        'piece': 12,   // Standard lollipop
        'pop': 12,
        'sucker': 12,
        'small': 8,    // Small lollipop
        'large': 25,   // Large lollipop
      },
      'hard candy': {
        'piece': 6,    // Standard hard candy
        'pieces': 6,
        'small': 3,    // Small hard candy
        'mint': 2,     // Breath mint
        'drop': 4,     // Cough drop or candy drop
      },
      'caramel': {
        'piece': 8,    // Individual caramel
        'pieces': 8,
        'square': 7,   // Caramel square
      },
      'marshmallow': {
        'piece': 7,    // Regular marshmallow
        'pieces': 7,
        'mini': 1,     // Mini marshmallow
        'minis': 1,
        'large': 15,   // Large marshmallow
      },
      'jelly bean': {
        'piece': 1,    // Individual jelly bean
        'pieces': 1,
        'bean': 1,
        'beans': 1,
      },
      'skittles': {
        'piece': 1,    // Individual Skittle
        'pieces': 1,
        'package': 61, // Standard package
        'fun size': 15,
      },
      'm&m': {
        'piece': 1,    // Individual M&M
        'pieces': 1,
        'fun size': 17,
        'package': 47, // Standard package
      },
      'snickers': {
        'fun size': 17,
        'bar': 52,     // Regular Snickers bar  
        'king size': 113,
      },
      'snickers bar': {
        'fun size': 17,
        'bar': 52,     // Regular Snickers bar
        'piece': 52,   // 1 piece = 1 bar
        'king size': 113,
      },
      'kit kat': {
        'fun size': 15,
        'bar': 42,     // Regular Kit Kat
        'finger': 10,  // Single Kit Kat finger
      },
      'reeses': {
        'cup': 21,     // Single Reese's cup
        'pieces': 21,
        'fun size': 17,
        'king size': 79,
      },
      'hershey': {
        'kiss': 4,     // Hershey's Kiss
        'kisses': 4,
        'bar': 43,     // Regular Hershey's bar
        'fun size': 11,
        'miniature': 8,
        'stick': 11,
        'package': 70,
      },
      'licorice': {
        'piece': 11,
        'pieces': 11,
        'stick': 11,
      },
    };

    let gramsEquivalent = quantity;
    let fdaServingUsed = false;
    let fdaServingInfo: string | null = null;

    // Check for FDA standard liquid serving sizes first for beverages
    if (this.isLiquidQuery(food.description || '')) {
      const standardServing = USDAService.getStandardLiquidServing(food.description || '');
      if (standardServing && (unit.includes('glass') || unit.includes('serving') || unit.includes('standard') || unit.includes('cup'))) {
        gramsEquivalent = quantity * standardServing.standardServing;
        fdaServingUsed = true;
        fdaServingInfo = `FDA ${standardServing.fdaCategory}: ${standardServing.description}`;
      }
      
      // Enhanced liquid volume conversions using FDA standards
      else if (unit.includes('fl oz') || unit.includes('fluid ounce')) {
        gramsEquivalent = quantity * 29.57; // 1 fl oz = 29.57 mL
      }
      else if (unit.includes('quart')) {
        gramsEquivalent = quantity * 946; // 1 quart = 946 mL
      }
      else if (unit.includes('pint')) {
        gramsEquivalent = quantity * 473; // 1 pint = 473 mL
      }
      else if (unit.includes('gallon')) {
        gramsEquivalent = quantity * 3785; // 1 gallon = 3785 mL
      }
    }

    // Check for item-specific conversions first - prioritize ingredient name over food description
    const ingredientName = (food.description?.toLowerCase() || '').replace(/[^\w\s]/g, ' ');
    
    for (const [ingredient, conversions] of Object.entries(itemConversions)) {
      // Check the food description for ingredient matches
      if (ingredientName.includes(ingredient)) {
        for (const [unitPattern, grams] of Object.entries(conversions)) {
          if (unit.includes(unitPattern)) {
            gramsEquivalent = quantity * grams;
            
            // Generate portion warning comparing user input to FDA standards
            const portionInfo = this.generatePortionWarning(ingredient, unitPattern, gramsEquivalent, conversions);
            return { quantity, unit, gramsEquivalent, portionInfo };
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

    // Enhanced candy-specific logic for generic measurements when no specific conversion found
    if (gramsEquivalent === quantity && this.isCandyRelated(food.description || '')) {
      // Use candy-specific weights for common units
      const candyConversions: { [key: string]: number } = {
        'piece': 6,      // Default candy piece
        'pieces': 6,
        'small': 3,      // Small candy
        'large': 12,     // Large candy
        'mini': 2,       // Mini candy
        'fun size': 15,  // Fun size
        'bite size': 8,  // Bite size
        'bar': 40,       // Standard candy bar
        'package': 50,   // Small package
      };

      for (const [candyUnit, candyWeight] of Object.entries(candyConversions)) {
        if (unit.includes(candyUnit)) {
          gramsEquivalent = quantity * candyWeight;
          break;
        }
      }
    }

    // If no conversion found, try smart defaults based on food type
    if (gramsEquivalent === quantity) {
      if (unit.match(/^g$|^grams?$|^\d+g$/) || unit.includes('gram')) {
        // Already in grams, don't multiply
        gramsEquivalent = quantity;
      } else if (food.servingSize) {
        gramsEquivalent = quantity * food.servingSize;
      } else {
        // For items like "medium", "large", use food-specific defaults
        const foodType = food.description.toLowerCase();
        
        // Ice cream bars - assume "1" means "1 bar" when no unit specified
        if (foodType.includes('haagen') && foodType.includes('daz')) {
          gramsEquivalent = quantity * 88; // Haagen-Dazs bar standard size
        } else if (foodType.includes('klondike')) {
          gramsEquivalent = quantity * 91; // Klondike bar standard size
        } else if (foodType.includes('good humor') || foodType.includes('creamsicle')) {
          gramsEquivalent = quantity * 78; // Good Humor bar standard size
        } else if (foodType.includes('ben') && foodType.includes('jer')) {
          gramsEquivalent = quantity * 71; // Ben & Jerry's pint slice bar
        } else if (foodType.includes('ice cream bar')) {
          gramsEquivalent = quantity * 60; // Generic ice cream bar FDA standard
        // Candy bars - assume "1" means "1 bar" when no unit specified
        } else if (foodType.includes('snickers')) {
          gramsEquivalent = quantity * 52; // Snickers bar standard size
        } else if (foodType.includes('kit kat')) {
          gramsEquivalent = quantity * 42; // Kit Kat bar standard size
        } else if (foodType.includes('hershey')) {
          gramsEquivalent = quantity * 43; // Hershey bar standard size
        } else if (foodType.includes('reese')) {
          gramsEquivalent = quantity * 21; // Reese's cup standard size
        } else if (this.isCandyRelated(foodType)) {
          gramsEquivalent = quantity * 40; // Generic candy bar
        } else if (foodType.includes('apple')) {
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

    // Get smart serving suggestions for realistic portions
    const smartServing = this.getSmartServingSize(food.description, measurement);
    const portionValidation = this.validatePortionSize(food.description, gramsEquivalent);
    
    // Create portion info object
    let portionInfo: any = {
      isRealistic: gramsEquivalent <= 200 || !food.description.toLowerCase().includes('chips'),
      servingName: smartServing.servingName
    };
    
    // For snack foods with unrealistic portions, add warnings and suggestions
    if (food.description.toLowerCase().includes('chips') && gramsEquivalent > 100) {
      portionInfo.warning = portionValidation.warning;
      portionInfo.suggestion = portionValidation.suggestion;
      portionInfo.isRealistic = false;
      portionInfo.recommendedServing = smartServing.servingName;
      portionInfo.recommendedCalories = Math.round((smartServing.grams * 536) / 100); // Using 536 cal/100g for chips
    }

    // Include FDA serving information in return if used
    const result: any = { 
      quantity, 
      unit, 
      gramsEquivalent,
      portionInfo
    };
    
    if (fdaServingUsed && fdaServingInfo) {
      result.fdaServing = fdaServingInfo;
    }
    
    return result;
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
      'hot chocolate', 'cocoa', 'lemonade', 'punch',
      // Sparkling/carbonated water brands and varieties
      'sparkling water', 'carbonated water', 'seltzer', 'club soda',
      'perrier', 'san pellegrino', 'pellegrino', 'la croix', 'lacroix',
      'bubly', 'schweppes', 'canada dry', 'tonic water', 'mineral water'
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
      if (description.includes('water, municipal') || description.includes('water, well')) score += 700;
      if (description.includes('water') && description.includes('carbonated')) score += 600;
      if (description.includes('water') && !description.includes('tuna') && !description.includes('fish') && !description.includes('coconut') && !description.includes('flavored')) score += 600;
      if (description.includes('tuna') || description.includes('fish') || description.includes('canned')) score -= 1000; // Heavy penalty for non-water items
      if (description.includes('coconut water')) score -= 200; // different drink
      if (description.includes('vitamin water') || description.includes('flavored')) score -= 400;
    }
    
    // SPARKLING WATER scoring (zero calorie beverages)
    if (searchTerm.includes('sparkling') || searchTerm.includes('carbonated') || 
        searchTerm.includes('pellegrino') || searchTerm.includes('perrier') ||
        searchTerm.includes('lacroix') || searchTerm.includes('la croix') ||
        searchTerm.includes('bubly') || searchTerm.includes('seltzer')) {
      if (description.includes('water') && description.includes('carbonated')) score += 800;
      if (description.includes('seltzer') || description.includes('sparkling')) score += 700;
      if (description.includes('mineral water')) score += 650;
      if (description.includes('club soda')) score += 600;
      // Penalize sugary drinks that might match brand names
      if (description.includes('sugar') || description.includes('sweetened') || description.includes('cola')) score -= 500;
      if (description.includes('fruit juice') || description.includes('flavored soda')) score -= 400;
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
   * Get FDA standard serving size for liquid beverages
   */
  static getStandardLiquidServing(ingredient: string): {
    standardServing: number;
    fdaCategory: string;
    description: string;
  } | null {
    const normalized = ingredient.toLowerCase().trim();
    
    // Direct match first
    if (USDAService.STANDARD_LIQUID_SERVINGS[normalized]) {
      return USDAService.STANDARD_LIQUID_SERVINGS[normalized];
    }
    
    // Partial matching for compound names
    for (const [key, serving] of Object.entries(USDAService.STANDARD_LIQUID_SERVINGS)) {
      if (normalized.includes(key) || key.includes(normalized.split(' ')[0])) {
        return serving;
      }
    }
    
    // Default liquid serving if no specific match (FDA general beverage standard)
    if (normalized.includes('water') || normalized.includes('juice') || normalized.includes('soda') || 
        normalized.includes('coffee') || normalized.includes('tea') || normalized.includes('milk')) {
      return {
        standardServing: 240, // 8 fl oz default for most liquids
        fdaCategory: 'General Beverages',
        description: '8 fl oz (1 cup) default liquid serving'
      };
    }
    
    return null;
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
   * Check if ingredient is a zero-calorie beverage
   */
  private isZeroCalorieBeverage(ingredientName: string): boolean {
    const zeroCalorian = ingredientName.toLowerCase();
    const zeroCalorieBeverages = [
      'water', 'sparkling water', 'carbonated water', 'seltzer', 'club soda',
      'mineral water', 'spring water', 'tap water', 'bottled water',
      'san pellegrino', 'pellegrino', 'perrier', 'la croix', 'lacroix', 
      'bubly', 'schweppes sparkling', 'canada dry seltzer', 'tonic water',
      'black coffee', 'plain tea', 'green tea', 'herbal tea', 'diet soda',
      'diet coke', 'coke zero', 'pepsi max', 'diet pepsi', 'diet sprite',
      'smartwater', 'smart water' // electrolyte water with no calories
    ];
    
    // Specifically exclude vitamin water and flavored water as they often contain calories
    const caloriedBeverages = [
      'vitamin water', 'vitaminwater', 'flavored water', 'enhanced water',
      'coconut water', 'sports drink', 'energy drink'
    ];
    
    // Check if it's in the excluded list first
    if (caloriedBeverages.some(beverage => zeroCalorian.includes(beverage))) {
      return false;
    }
    
    return zeroCalorieBeverages.some(beverage => 
      zeroCalorian.includes(beverage) || 
      (beverage === 'water' && zeroCalorian.includes('water') && 
       !zeroCalorian.includes('coconut') && 
       !zeroCalorian.includes('vitamin') &&
       !zeroCalorian.includes('flavored') &&
       !zeroCalorian.includes('enhanced'))
    );
  }

  /**
   * Enhanced fallback estimation with better nutrition data
   */
  private getEnhancedFallbackEstimate(ingredientName: string, measurement: string) {
    const normalized = ingredientName.toLowerCase().trim();

    // Enhanced food database integration temporarily disabled
    // Fallback processing continues below

    // Check for zero-calorie beverages
    if (this.isZeroCalorieBeverage(normalized)) {

      const servingInfo = USDAService.getStandardLiquidServing(normalized);
      
      return {
        ingredient: ingredientName.toUpperCase(),
        measurement: `${measurement} (~240g)`,
        estimatedCalories: 0,
        equivalentMeasurement: '100g ≈ 0 kcal',
        note: 'Contains no calories',
        nutritionPer100g: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          iron: 0.1,
          calcium: 5,
          zinc: 0.1,
          magnesium: 3,
          vitaminC: 0,
          vitaminD: 0,
          vitaminB12: 0,
          folate: 0,
          vitaminA: 0,
          vitaminE: 0,
          potassium: 50,
          phosphorus: 10
        },
        fdaServing: servingInfo ? `FDA ${servingInfo.fdaCategory}: ${servingInfo.description}` : 'FDA Water: 8 fl oz (1 cup) standard'
      };
    }

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
      
      // Milk varieties (essential liquids that were missing)
      'milk': { calories: 42, protein: 3.4, carbs: 5.0, fat: 1.0 },
      'whole milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
      '2% milk': { calories: 50, protein: 3.3, carbs: 4.9, fat: 2.0 },
      '1% milk': { calories: 42, protein: 3.4, carbs: 5.0, fat: 1.0 },
      'skim milk': { calories: 34, protein: 3.4, carbs: 5.0, fat: 0.2 },
      'nonfat milk': { calories: 34, protein: 3.4, carbs: 5.0, fat: 0.2 },
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
      'lime juice fresh': { calories: 25, protein: 0.4, carbs: 8.4, fat: 0.1 },
      'orange juice': { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2 },
      'apple juice': { calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1 },
      'grape juice': { calories: 60, protein: 0.4, carbs: 14.8, fat: 0.2 },
      'cranberry juice': { calories: 46, protein: 0.4, carbs: 12.2, fat: 0.1 },
      'tomato juice': { calories: 17, protein: 0.8, carbs: 4.2, fat: 0.1 },
      'coconut water fresh': { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
      
      // Tropical and exotic fruit juices
      'pineapple juice': { calories: 53, protein: 0.5, carbs: 12.9, fat: 0.1 },
      'mango juice': { calories: 54, protein: 0.4, carbs: 13.7, fat: 0.2 },
      'guava juice': { calories: 56, protein: 0.3, carbs: 14.8, fat: 0.1 },
      'papaya juice': { calories: 43, protein: 0.5, carbs: 11.0, fat: 0.1 },
      'passion fruit fresh juice': { calories: 51, protein: 1.4, carbs: 11.2, fat: 0.4 },
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
      
      // Peanut butter sandwiches
      'peanut butter sandwich': { calories: 325, protein: 13.8, carbs: 32.4, fat: 16.2 },
      'pb sandwich': { calories: 325, protein: 13.8, carbs: 32.4, fat: 16.2 },
      'peanut butter and jelly': { calories: 342, protein: 12.4, carbs: 38.6, fat: 15.8 },
      'pbj sandwich': { calories: 342, protein: 12.4, carbs: 38.6, fat: 15.8 },
      'pb&j': { calories: 342, protein: 12.4, carbs: 38.6, fat: 15.8 },
      
      // Olives and olive products
      'olive': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
      'olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
      'green olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
      'black olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
      'kalamata olives': { calories: 115, protein: 0.8, carbs: 6.0, fat: 10.7 },
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
      
      // Bread varieties (per 100g)
      'white bread': { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2 },
      'whole wheat bread': { calories: 247, protein: 13.0, carbs: 41.0, fat: 4.2 },
      'whole grain bread': { calories: 259, protein: 12.8, carbs: 43.3, fat: 4.1 },
      'multigrain bread': { calories: 265, protein: 11.2, carbs: 45.1, fat: 4.8 },
      'sourdough bread': { calories: 289, protein: 11.5, carbs: 56.8, fat: 2.1 },
      'rye bread': { calories: 259, protein: 8.5, carbs: 48.3, fat: 3.7 },
      'pumpernickel bread': { calories: 250, protein: 8.1, carbs: 47.7, fat: 3.1 },
      'italian bread': { calories: 271, protein: 9.2, carbs: 50.6, fat: 3.8 },
      'french bread': { calories: 289, protein: 9.8, carbs: 58.5, fat: 2.3 },
      'ciabatta bread': { calories: 271, protein: 9.2, carbs: 50.6, fat: 3.8 },
      'focaccia bread': { calories: 294, protein: 8.2, carbs: 51.1, fat: 6.9 },
      'pita bread': { calories: 275, protein: 9.1, carbs: 55.7, fat: 1.2 },
      'naan bread': { calories: 310, protein: 8.7, carbs: 45.9, fat: 9.9 },
      'bagel': { calories: 257, protein: 10.1, carbs: 50.9, fat: 1.7 },
      'english muffin': { calories: 227, protein: 8.0, carbs: 44.8, fat: 2.0 },
      'croissant': { calories: 406, protein: 8.2, carbs: 45.8, fat: 21.0 },
      'dinner roll': { calories: 296, protein: 8.9, carbs: 54.3, fat: 5.0 },
      'hamburger bun': { calories: 294, protein: 8.7, carbs: 54.8, fat: 4.6 },
      'hot dog bun': { calories: 300, protein: 9.2, carbs: 56.2, fat: 4.1 },
      
      // Specialty breads
      'brioche': { calories: 329, protein: 9.7, carbs: 56.0, fat: 7.4 },
      'challah': { calories: 320, protein: 9.5, carbs: 55.2, fat: 6.8 },
      'cornbread': { calories: 307, protein: 7.0, carbs: 51.0, fat: 9.3 },
      'banana bread': { calories: 326, protein: 4.3, carbs: 56.3, fat: 10.5 },
      'zucchini bread': { calories: 271, protein: 4.2, carbs: 47.8, fat: 7.9 },
      'garlic bread': { calories: 350, protein: 8.5, carbs: 48.2, fat: 14.2 },
      'texas toast': { calories: 310, protein: 8.8, carbs: 49.5, fat: 8.9 },
      
      // International breads
      'tortilla': { calories: 304, protein: 8.2, carbs: 48.9, fat: 8.1 },
      'flour tortilla': { calories: 304, protein: 8.2, carbs: 48.9, fat: 8.1 },
      'corn tortilla': { calories: 218, protein: 5.7, carbs: 44.9, fat: 2.9 },
      'lavash': { calories: 275, protein: 9.1, carbs: 55.7, fat: 1.2 },
      'flatbread': { calories: 275, protein: 9.1, carbs: 55.7, fat: 1.2 },
      
      // Pasta varieties (dry, per 100g)
      'pasta': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'spaghetti': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'penne': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'rigatoni': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'fusilli': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'farfalle': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'linguine': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'fettuccine': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'angel hair pasta': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'rotini': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'shells pasta': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'bow tie pasta': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'macaroni': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'elbows pasta': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'orzo': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'ziti': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      'lasagna noodles': { calories: 371, protein: 13.0, carbs: 74.7, fat: 1.5 },
      
      // Whole grain pasta
      'whole wheat pasta': { calories: 348, protein: 14.6, carbs: 71.5, fat: 2.5 },
      'whole wheat spaghetti': { calories: 348, protein: 14.6, carbs: 71.5, fat: 2.5 },
      'whole grain pasta': { calories: 348, protein: 14.6, carbs: 71.5, fat: 2.5 },
      
      // Specialty pasta
      'gluten free pasta': { calories: 357, protein: 7.0, carbs: 78.0, fat: 2.0 },
      'rice pasta': { calories: 364, protein: 7.2, carbs: 80.0, fat: 1.4 },
      'quinoa pasta': { calories: 357, protein: 14.0, carbs: 71.6, fat: 2.8 },
      'lentil pasta': { calories: 336, protein: 25.0, carbs: 52.0, fat: 2.0 },
      'chickpea pasta': { calories: 337, protein: 20.9, carbs: 57.6, fat: 4.2 },
      
      // Cooked pasta (per 100g)
      'cooked pasta': { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1 },
      'cooked spaghetti': { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1 },
      'cooked penne': { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1 },
      'cooked whole wheat pasta': { calories: 124, protein: 5.3, carbs: 23.0, fat: 1.4 },
      
      // Asian noodles
      'ramen noodles': { calories: 436, protein: 9.4, carbs: 58.0, fat: 18.0 },
      'udon noodles': { calories: 270, protein: 8.0, carbs: 52.0, fat: 2.0 },
      'soba noodles': { calories: 274, protein: 11.0, carbs: 56.0, fat: 1.9 },
      'rice noodles': { calories: 364, protein: 5.9, carbs: 83.0, fat: 0.6 },
      'lo mein noodles': { calories: 384, protein: 14.0, carbs: 71.0, fat: 4.4 },
      'pad thai noodles': { calories: 192, protein: 4.6, carbs: 42.2, fat: 0.6 },
      
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
      'coconut milk thick': { calories: 230, protein: 2.3, carbs: 5.5, fat: 23.8 },
      'rice milk': { calories: 47, protein: 0.3, carbs: 9.2, fat: 1.0 },
      
      // Caribbean and Jamaican beverages
      'peanut punch': { calories: 185, protein: 8.2, carbs: 18.5, fat: 9.8 },
      'sorrel': { calories: 45, protein: 0.4, carbs: 11.2, fat: 0.1 },
      'sorrel drink': { calories: 45, protein: 0.4, carbs: 11.2, fat: 0.1 },
      'jamaican sorrel': { calories: 45, protein: 0.4, carbs: 11.2, fat: 0.1 },
      'ginger beer': { calories: 38, protein: 0.1, carbs: 9.5, fat: 0 },
      'jamaican ginger beer': { calories: 38, protein: 0.1, carbs: 9.5, fat: 0 },
      'rum punch': { calories: 168, protein: 0.2, carbs: 24.8, fat: 0.1 },
      'caribbean punch': { calories: 156, protein: 0.3, carbs: 22.4, fat: 0.2 },
      'mauby': { calories: 42, protein: 0.1, carbs: 10.8, fat: 0 },
      'sea moss': { calories: 49, protein: 1.5, carbs: 12.3, fat: 0.6 },
      'sea moss drink': { calories: 49, protein: 1.5, carbs: 12.3, fat: 0.6 },
      'irish moss': { calories: 49, protein: 1.5, carbs: 12.3, fat: 0.6 },
      'coconut water': { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
      'coconut milk drink': { calories: 45, protein: 0.4, carbs: 6.3, fat: 4.6 },
      'tamarind drink': { calories: 239, protein: 2.8, carbs: 62.5, fat: 0.6 },
      'soursop juice': { calories: 66, protein: 1.0, carbs: 16.8, fat: 0.3 },
      'june plum juice': { calories: 46, protein: 0.9, carbs: 11.2, fat: 0.3 },
      'guinep juice': { calories: 58, protein: 1.3, carbs: 13.7, fat: 0.1 },
      'passion fruit concentrate': { calories: 97, protein: 2.2, carbs: 23.4, fat: 0.7 },
      
      // Traditional fruit juices (moved here to avoid duplicates)
      'fruit punch': { calories: 45, protein: 0, carbs: 11.5, fat: 0 },
      'lime juice': { calories: 25, protein: 0.4, carbs: 8.4, fat: 0.2 },
      
      // Other beverages
      'kombucha': { calories: 30, protein: 0, carbs: 7, fat: 0 },
      'smoothie': { calories: 66, protein: 1.8, carbs: 16, fat: 0.2 },
      'milkshake': { calories: 112, protein: 3.2, carbs: 17.9, fat: 3.2 },
      'hot chocolate': { calories: 77, protein: 3.2, carbs: 13.4, fat: 2.3 },
      'iced coffee': { calories: 5, protein: 0.3, carbs: 1.0, fat: 0.0 },
      
      // Salad varieties (per 100g)
      'salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'garden salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'mixed greens': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'caesar salad': { calories: 158, protein: 7.2, carbs: 8.4, fat: 12.6 },
      'cesar salad': { calories: 158, protein: 7.2, carbs: 8.4, fat: 12.6 }, // Common misspelling
      'greek salad': { calories: 107, protein: 3.8, carbs: 7.2, fat: 7.8 },
      'cobb salad': { calories: 235, protein: 18.5, carbs: 6.8, fat: 15.2 },
      'chef salad': { calories: 143, protein: 12.4, carbs: 5.2, fat: 8.6 },
      'spinach salad': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      'kale salad': { calories: 35, protein: 2.9, carbs: 6.7, fat: 0.9 },
      'arugula salad': { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7 },
      'lettuce salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'iceberg salad': { calories: 14, protein: 0.9, carbs: 3.0, fat: 0.1 },
      'romaine salad': { calories: 17, protein: 1.2, carbs: 3.3, fat: 0.3 },
      'mixed salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'house salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'side salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      
      // Specialty salads
      'waldorf salad': { calories: 145, protein: 2.8, carbs: 14.2, fat: 9.6 },
      'potato salad': { calories: 143, protein: 2.6, carbs: 17.8, fat: 7.2 },
      'pasta salad': { calories: 192, protein: 4.8, carbs: 32.4, fat: 5.2 },
      'chicken salad': { calories: 201, protein: 15.8, carbs: 3.2, fat: 14.6 },
      'tuna salad': { calories: 158, protein: 13.4, carbs: 2.8, fat: 10.2 },
      'egg salad': { calories: 183, protein: 10.5, carbs: 1.8, fat: 14.8 },
      'coleslaw': { calories: 147, protein: 1.2, carbs: 12.2, fat: 10.8 },
      'fruit salad': { calories: 50, protein: 0.6, carbs: 12.8, fat: 0.2 },
      'quinoa salad': { calories: 172, protein: 6.8, carbs: 28.4, fat: 3.8 },
      'bean salad': { calories: 89, protein: 4.2, carbs: 16.8, fat: 1.2 },
      'caprese salad': { calories: 166, protein: 9.8, carbs: 5.2, fat: 12.4 },
      'nicoise salad': { calories: 145, protein: 8.6, carbs: 7.4, fat: 9.8 },
      
      // Salad synonyms and variations
      'green salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'leafy greens': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'fresh salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'dinner salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      'lunch salad': { calories: 143, protein: 12.4, carbs: 5.2, fat: 8.6 },
      'vegetable salad': { calories: 25, protein: 2.1, carbs: 4.8, fat: 0.3 },
      'mixed vegetable salad': { calories: 25, protein: 2.1, carbs: 4.8, fat: 0.3 },
      'chopped salad': { calories: 35, protein: 3.2, carbs: 5.8, fat: 0.8 },
      'mediterranean salad': { calories: 107, protein: 3.8, carbs: 7.2, fat: 7.8 },
      'italian salad': { calories: 107, protein: 3.8, carbs: 7.2, fat: 7.8 },
      'antipasto salad': { calories: 145, protein: 8.6, carbs: 7.4, fat: 9.8 },

      // Stone fruits - Nectarines
      'nectarine': { calories: 44, protein: 1.1, carbs: 10.6, fat: 0.3 },
      'nectarines': { calories: 44, protein: 1.1, carbs: 10.6, fat: 0.3 },
      'fresh nectarine': { calories: 44, protein: 1.1, carbs: 10.6, fat: 0.3 },
      'raw nectarine': { calories: 44, protein: 1.1, carbs: 10.6, fat: 0.3 },

      // Protein bars and nutrition bars (per 100g)
      'protein bar': { calories: 413, protein: 25.0, carbs: 45.0, fat: 8.5 },
      'nutrition bar': { calories: 413, protein: 25.0, carbs: 45.0, fat: 8.5 },
      'energy bar': { calories: 413, protein: 25.0, carbs: 45.0, fat: 8.5 },
      'protein energy bar': { calories: 413, protein: 25.0, carbs: 45.0, fat: 8.5 },
      'whey protein bar': { calories: 413, protein: 25.0, carbs: 45.0, fat: 8.5 },
      'quest bar': { calories: 400, protein: 21.0, carbs: 22.0, fat: 14.0 },
      'clif bar': { calories: 421, protein: 10.5, carbs: 68.4, fat: 10.5 },
      'kind bar': { calories: 500, protein: 16.0, carbs: 32.0, fat: 32.0 },
      'granola bar': { calories: 471, protein: 10.1, carbs: 64.8, fat: 19.0 },
      'cereal bar': { calories: 395, protein: 6.0, carbs: 70.0, fat: 10.0 },
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
      const measurementResult = this.parseMeasurement(measurement, mockFood);
      const { quantity, unit, gramsEquivalent } = measurementResult;
      const estimatedCalories = Math.round((nutrition.calories * gramsEquivalent) / 100);
      
      // Add estimated micronutrients to liquid fallback
      const nutritionWithMicronutrients = {
        ...nutrition,
        // Estimate micronutrients for liquids (per 100g/ml)
        iron: 0.1,
        calcium: 5,
        zinc: 0.1,
        magnesium: 3,
        vitaminC: 0,
        vitaminD: 0,
        vitaminB12: 0,
        folate: 0,
        vitaminA: 0,
        vitaminE: 0,
        potassium: 50,
        phosphorus: 10
      };
      
      // Check for portion size warnings
      const portionInfo = this.validatePortionSize(normalized, gramsEquivalent, estimatedCalories);

      const result: any = {
        ingredient: normalized.toUpperCase(),
        measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
        estimatedCalories,
        equivalentMeasurement: `100g ≈ ${nutrition.calories} kcal`,
        note: estimatedCalories === 0 ? 'Contains no calories' : 'Low-calorie beverage',
        nutritionPer100g: nutritionWithMicronutrients,
        portionInfo: portionInfo
      };
      
      // Include FDA serving information if available
      if ((measurementResult as any).fdaServing) {
        result.fdaServing = (measurementResult as any).fdaServing;
      }
      
      return result;
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
      const measurementResult = this.parseMeasurement(measurement, mockFood);
      const { quantity, unit, gramsEquivalent } = measurementResult;
      const estimatedCalories = Math.round((nutrition.calories * gramsEquivalent) / 100);

      // Add estimated micronutrients based on food category
      const nutritionWithMicronutrients = {
        ...nutrition,
        // Estimate micronutrients based on typical values (per 100g)
        iron: Math.round((nutrition.protein * 0.1 + 1) * 10) / 10,
        calcium: Math.round((nutrition.protein * 2 + 20)),
        zinc: Math.round((nutrition.protein * 0.05 + 0.5) * 10) / 10,
        magnesium: Math.round((nutrition.carbs * 0.5 + 10)),
        vitaminC: Math.round((nutrition.carbs * 0.3)),
        vitaminD: Math.round((nutrition.fat * 0.02) * 10) / 10,
        vitaminB12: Math.round((nutrition.protein * 0.02) * 10) / 10,
        folate: Math.round((nutrition.carbs * 0.8 + 5)),
        vitaminA: Math.round((nutrition.fat * 0.5)),
        vitaminE: Math.round((nutrition.fat * 0.1) * 10) / 10,
        potassium: Math.round((nutrition.calories * 1.5)),
        phosphorus: Math.round((nutrition.protein * 8 + 50))
      };
      
      // Check for portion size warnings
      const portionInfo = this.validatePortionSize(normalized, gramsEquivalent, estimatedCalories);

      const result: any = {
        ingredient: normalized.toUpperCase(),
        measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
        estimatedCalories,
        equivalentMeasurement: `100g ≈ ${nutrition.calories} kcal`,
        note: 'Estimate based on USDA nutrition averages with enhanced conversion factors',
        nutritionPer100g: nutritionWithMicronutrients,
        usdaPortionUsed: false,
        portionInfo: portionInfo
      };
      
      // Include FDA serving information if available
      if ((measurementResult as any).fdaServing) {
        result.fdaServing = (measurementResult as any).fdaServing;
      }
      
      return result;
    }

    // Final fallback: create basic estimate
    return this.getGenericFoodEstimate(ingredientName, measurement);
  }

  /**
   * Generate generic estimates for unknown foods based on common food patterns
   */
  private getGenericFoodEstimate(ingredientName: string, measurement: string): any {
    const normalized = ingredientName.toLowerCase().trim();
    
    // Generic estimates based on food type patterns
    let baseCalories = 150; // Default moderate calorie food
    let protein = 5.0;
    let carbs = 20.0;
    let fat = 3.0;
    
    // Enhanced pattern-based nutrition estimates for complex foods
    if (normalized.includes('patty') || normalized.includes('pie') || normalized.includes('turnover')) {
      // Pastry-wrapped foods (meat + pastry)
      baseCalories = 285; protein = 12.5; carbs = 25.0; fat = 16.0;
    } else if (normalized.includes('sandwich') || normalized.includes('burger') || normalized.includes('wrap')) {
      // Sandwich-style foods (protein + bread/wrap)
      baseCalories = 245; protein = 15.0; carbs = 22.0; fat = 11.0;
    } else if (normalized.includes('burrito') || normalized.includes('taco') || normalized.includes('quesadilla')) {
      // Mexican composite foods
      baseCalories = 215; protein = 12.0; carbs = 24.0; fat = 9.0;
    } else if (normalized.includes('curry') || normalized.includes('masala') || normalized.includes('stew')) {
      // Sauce-based dishes
      baseCalories = 185; protein = 18.0; carbs = 8.0; fat = 9.0;
    } else if (normalized.includes('fried') && (normalized.includes('chicken') || normalized.includes('fish'))) {
      // Fried proteins
      baseCalories = 280; protein = 20.0; carbs = 12.0; fat = 17.0;
    } else if (normalized.includes('bar') || normalized.includes('protein')) {
      baseCalories = 413; protein = 25.0; carbs = 45.0; fat = 8.5;
    } else if (normalized.includes('fruit') || normalized.match(/\b(apple|banana|orange|peach|pear|plum|nectarine|berry)\b/)) {
      baseCalories = 44; protein = 1.1; carbs = 10.6; fat = 0.3;
    } else if (normalized.includes('vegetable') || normalized.match(/\b(broccoli|carrot|spinach|lettuce|tomato)\b/)) {
      baseCalories = 25; protein = 2.5; carbs = 5.0; fat = 0.2;
    } else if (normalized.includes('meat') || normalized.match(/\b(chicken|beef|pork|fish|turkey)\b/)) {
      baseCalories = 250; protein = 25.0; carbs = 0.0; fat = 15.0;
    } else if (normalized.includes('grain') || normalized.match(/\b(rice|bread|pasta|cereal|oats)\b/)) {
      baseCalories = 350; protein = 10.0; carbs = 70.0; fat = 2.0;
    }
    
    // Add estimated micronutrients for generic foods
    const nutrition = { 
      calories: baseCalories, 
      protein, 
      carbs, 
      fat,
      // Generic micronutrient estimates (per 100g)
      iron: Math.round((protein * 0.08 + 0.8) * 10) / 10,
      calcium: Math.round((protein * 1.5 + 15)),
      zinc: Math.round((protein * 0.04 + 0.4) * 10) / 10,
      magnesium: Math.round((carbs * 0.4 + 8)),
      vitaminC: Math.round((carbs * 0.2)),
      vitaminD: Math.round((fat * 0.01) * 10) / 10,
      vitaminB12: Math.round((protein * 0.01) * 10) / 10,
      folate: Math.round((carbs * 0.6 + 4)),
      vitaminA: Math.round((fat * 0.3)),
      vitaminE: Math.round((fat * 0.08) * 10) / 10,
      potassium: Math.round((baseCalories * 1.2)),
      phosphorus: Math.round((protein * 6 + 40))
    };
    const mockFood: USDAFood = {
      fdcId: 0,
      description: normalized,
      dataType: 'Generic Estimate',
      foodNutrients: []
    };
    
    const measurementResult = this.parseMeasurement(measurement, mockFood);
    const { quantity, unit, gramsEquivalent } = measurementResult;
    const estimatedCalories = Math.round((nutrition.calories * gramsEquivalent) / 100);
    
    // Check for portion size warnings
    const portionInfo = this.validatePortionSize(normalized, gramsEquivalent, estimatedCalories);
    
    return {
      ingredient: ingredientName.toUpperCase(),
      measurement: `${quantity} ${unit} (~${gramsEquivalent}g)`,
      estimatedCalories,
      equivalentMeasurement: `100g ≈ ${nutrition.calories} kcal`,
      note: 'Generic estimate - consider adding specific nutrition data',
      nutritionPer100g: nutrition,
      isGenericEstimate: true,
      portionInfo: portionInfo
    };
  }

}

export const usdaService = new USDAService();
