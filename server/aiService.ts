/**
 * AI Service for Food Recognition
 * Uses Imagga API to identify foods in images
 */

// Initialize Imagga API client with proper credentials
const IMAGGA_API_KEY = process.env.IMAGGA_API_KEY || '';
const IMAGGA_API_SECRET = process.env.IMAGGA_API_SECRET || '';

export interface IdentifiedFood {
  name: string;
  confidence: number;
  portion: string;
  estimatedGrams: number;
}

export interface FoodAnalysisResult {
  identifiedFoods: IdentifiedFood[];
  analysisTime: string;
}

/**
 * Analyze a food image using Imagga API
 * @param imageUrl - URL of the uploaded food image
 * @returns Promise<FoodAnalysisResult>
 */
export async function analyzeFoodImage(imageUrl: string): Promise<FoodAnalysisResult> {
  try {
    console.log('🔍 Starting Imagga food analysis for image:', imageUrl);

    // Validate API credentials
    if (!IMAGGA_API_KEY || !IMAGGA_API_SECRET) {
      throw new Error('MISSING_CREDENTIALS: Imagga API credentials are not configured. Please check IMAGGA_API_KEY and IMAGGA_API_SECRET environment variables.');
    }

    // Create authorization header for Imagga API
    const auth = Buffer.from(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`).toString('base64');
    
    // Call Imagga API for food recognition
    const apiUrl = `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!response.ok) {
      throw new Error(`Imagga API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process Imagga response to extract food items
    const foodTags = data.result?.tags || [];
    
    // Enhanced food keyword list for better identification
    const foodKeywords = [
      'food', 'fruit', 'vegetable', 'meat', 'bread', 'drink', 'meal', 'dish', 'snack',
      'chicken', 'beef', 'pork', 'fish', 'rice', 'pasta', 'salad', 'pizza', 'burger',
      'apple', 'banana', 'orange', 'tomato', 'potato', 'carrot', 'lettuce', 'cheese',
      'milk', 'water', 'juice', 'coffee', 'tea', 'sandwich', 'soup', 'cake', 'cookie',
      'breakfast', 'lunch', 'dinner', 'dessert', 'appetizer', 'sauce', 'spice', 'herb',
      'grain', 'cereal', 'nuts', 'berry', 'egg', 'butter', 'oil', 'sugar', 'flour'
    ];
    
    const foodItems = foodTags
      .filter((tag: any) => {
        const tagName = tag.tag?.en?.toLowerCase() || '';
        // Check if tag matches any food keywords and has sufficient confidence
        return (
          tag.confidence > 25 && 
          foodKeywords.some(keyword => tagName.includes(keyword) || keyword.includes(tagName))
        );
      })
      .slice(0, 5) // Limit to top 5 most confident food items
      .map((tag: any) => ({
        name: tag.tag?.en || 'Unknown Food',
        confidence: tag.confidence / 100, // Convert to 0-1 scale
        portion: '1 serving',
        estimatedGrams: estimateGrams(tag.tag?.en || 'Unknown Food') // Dynamic gram estimation
      }));

    const result: FoodAnalysisResult = {
      identifiedFoods: foodItems.length > 0 ? foodItems : [{
        name: 'Generic Food Item',
        confidence: 0.5,
        portion: '1 serving',
        estimatedGrams: 150
      }],
      analysisTime: new Date().toISOString()
    };

    console.log('✅ Imagga analysis completed:', result);
    return result;

  } catch (error) {
    console.error('❌ Imagga food analysis failed:', error);
    
    // Check if it's a quota/rate limit error
    if (error instanceof Error && (
      error.message.includes('quota') || 
      error.message.includes('429') ||
      error.message.includes('RESOURCE_EXHAUSTED') ||
      error.message.includes('quota exceeded')
    )) {
      throw new Error('QUOTA_EXCEEDED: The Imagga API quota has been exceeded. Please check your API usage or provide a new API key with available quota.');
    }
    
    // Check for invalid API key
    if (error instanceof Error && (
      error.message.includes('API_KEY_INVALID') ||
      error.message.includes('403') ||
      error.message.includes('401') ||
      error.message.includes('unauthorized')
    )) {
      throw new Error('INVALID_API_KEY: The Imagga API key is invalid or unauthorized. Please check your API key configuration.');
    }
    
    throw new Error(`Food analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get nutrition data for a specific food from USDA database
 * This integrates with the existing USDA search functionality
 */
export async function getNutritionFromUSDA(foodName: string, grams: number = 100) {
  // This will integrate with existing USDA search functionality
  // For now, return a basic structure that matches the expected format
  try {
    // Use the existing food search API endpoint
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ''}/api/foods/search?q=${encodeURIComponent(foodName)}&limit=1`);
    
    if (!response.ok) {
      throw new Error('USDA search failed');
    }
    
    const foods = await response.json();
    
    if (!foods || foods.length === 0) {
      // Return estimated nutrition if no USDA match found
      return getEstimatedNutrition(foodName, grams);
    }
    
    const food = foods[0];
    
    // Check if food object has the required nutritional data
    if (!food || typeof food !== 'object') {
      console.log('⚠️ Invalid food object from USDA, using estimation for:', foodName);
      return getEstimatedNutrition(foodName, grams);
    }
    
    const multiplier = grams / 100; // USDA data is typically per 100g
    
    return {
      calories: Math.round((parseFloat(food.calories) || 0) * multiplier),
      protein: Math.round((parseFloat(food.protein) || 0) * multiplier * 10) / 10,
      carbs: Math.round((parseFloat(food.carbs) || 0) * multiplier * 10) / 10,
      fat: Math.round((parseFloat(food.fat) || 0) * multiplier * 10) / 10,
      fiber: Math.round((parseFloat(food.fiber) || 0) * multiplier * 10) / 10,
      sugar: Math.round((parseFloat(food.sugar) || 0) * multiplier * 10) / 10,
      sodium: Math.round((parseFloat(food.sodium) || 0) * multiplier * 10) / 10,
    };
    
  } catch (error) {
    console.error('USDA nutrition lookup failed:', error);
    return getEstimatedNutrition(foodName, grams);
  }
}

/**
 * Provide estimated nutrition when USDA data is not available
 */
function getEstimatedNutrition(foodName: string, grams: number) {
  const name = foodName.toLowerCase();
  let baseCalories = 200; // Default calories per 100g
  let baseProtein = 10;
  let baseCarbs = 20;
  let baseFat = 8;
  let baseFiber = 2;
  let baseSugar = 5;
  let baseSodium = 300;

  // Basic food category estimates
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) {
    baseCalories = 250;
    baseProtein = 25;
    baseCarbs = 0;
    baseFat = 15;
    baseFiber = 0;
    baseSugar = 0;
    baseSodium = 400;
  } else if (name.includes('rice') || name.includes('pasta') || name.includes('bread')) {
    baseCalories = 350;
    baseProtein = 8;
    baseCarbs = 70;
    baseFat = 2;
    baseFiber = 3;
    baseSugar = 2;
    baseSodium = 200;
  } else if (name.includes('apple') || name.includes('banana') || name.includes('fruit')) {
    baseCalories = 60;
    baseProtein = 1;
    baseCarbs = 15;
    baseFat = 0;
    baseFiber = 3;
    baseSugar = 12;
    baseSodium = 2;
  } else if (name.includes('salad') || name.includes('lettuce') || name.includes('vegetable')) {
    baseCalories = 25;
    baseProtein = 2;
    baseCarbs = 5;
    baseFat = 0;
    baseFiber = 2;
    baseSugar = 2;
    baseSodium = 20;
  }

  const multiplier = grams / 100;
  
  return {
    calories: Math.round(baseCalories * multiplier),
    protein: Math.round(baseProtein * multiplier * 10) / 10,
    carbs: Math.round(baseCarbs * multiplier * 10) / 10,
    fat: Math.round(baseFat * multiplier * 10) / 10,
    fiber: Math.round(baseFiber * multiplier * 10) / 10,
    sugar: Math.round(baseSugar * multiplier * 10) / 10,
    sodium: Math.round(baseSodium * multiplier * 10) / 10,
  };
}

/**
 * Estimate portion size in grams based on food type
 */
function estimateGrams(foodName: string): number {
  const name = foodName.toLowerCase();
  
  // Portion size estimates based on common food types
  if (name.includes('apple') || name.includes('orange') || name.includes('banana')) {
    return 180; // Medium fruit
  } else if (name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
    return 120; // Standard protein serving
  } else if (name.includes('rice') || name.includes('pasta')) {
    return 200; // Cooked grain serving
  } else if (name.includes('bread') || name.includes('slice')) {
    return 30; // Slice of bread
  } else if (name.includes('salad')) {
    return 100; // Side salad
  } else if (name.includes('soup')) {
    return 250; // Bowl of soup
  } else if (name.includes('cookie') || name.includes('candy')) {
    return 20; // Small sweet treat
  } else if (name.includes('drink') || name.includes('beverage') || name.includes('juice')) {
    return 250; // Glass of liquid
  } else {
    return 150; // Default serving size
  }
}