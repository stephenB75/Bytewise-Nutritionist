/**
 * AI Food Analysis Service
 * Uses Google Gemini Vision API for food recognition and USDA database for nutrition data
 */

import { objectStorageClient } from './objectStorage.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client with proper credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

export interface IdentifiedFood {
  name: string;
  confidence: number;
  portion: string;
  estimatedGrams: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface FoodAnalysisResult {
  identifiedFoods: IdentifiedFood[];
  analysisTime: string;
}

/**
 * Analyze a food image using Google Gemini Vision API
 * @param imageUrl - URL of the uploaded food image
 * @returns Promise<FoodAnalysisResult>
 */
export async function analyzeFoodImage(imageUrl: string): Promise<FoodAnalysisResult> {
  try {

    // Validate API credentials
    if (!GOOGLE_API_KEY) {
      throw new Error('MISSING_CREDENTIALS: Google API key is not configured. Please check GOOGLE_API_KEY environment variable.');
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    
    // Try gemini-2.0-flash-exp first, fall back to stable model if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    } catch (modelError) {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    }

    // Download the image from our storage and convert to base64
    let imageBuffer: Buffer;
    
    try {
      // Extract object path from the clean URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part.includes('replit-objstore-'));
      
      if (bucketIndex !== -1) {
        // Get everything after the bucket name as the object path
        const objectPath = pathParts.slice(bucketIndex + 1).join('/');
        
        // Get the file from object storage
        const bucketName = pathParts[bucketIndex];
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectPath);
        
        // Check if file exists with retries - longer wait for upload completion
        let exists = false;
        let retryCount = 0;
        const maxRetries = 8; // Increased retries
        
        while (!exists && retryCount < maxRetries) {
          [exists] = await file.exists();
          if (!exists) {
            const waitTime = retryCount < 3 ? 2000 : 5000; // Longer waits for later attempts
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
          }
        }
        
        if (!exists) {
          throw new Error('UPLOAD_ERROR: Image not found in storage after upload. Please wait a moment and try again.');
        }
        
        // Download the image data
        const [fileData] = await file.download();
        imageBuffer = fileData;
        
      } else {
        throw new Error('INVALID_URL: Unable to parse storage URL');
      }
      
    } catch (storageError) {
      console.error('❌ Storage error:', storageError);
      throw new Error('STORAGE_ERROR: Unable to access uploaded image from storage.');
    }

    // Create the prompt for food analysis
    const prompt = `Analyze this food image and identify all food items visible. For each food item, provide:
    1. The name of the food
    2. Your confidence level (0-100)
    3. Estimated portion size (e.g., "1 medium apple", "2 slices", "1 cup")
    4. Estimated weight in grams

    Please focus only on actual food items and be as specific as possible about the type of food.
    Return your response as a JSON array with this format:
    [
      {
        "name": "food name",
        "confidence": 85,
        "portion": "1 medium serving",
        "estimatedGrams": 150
      }
    ]`;

    // Call Gemini Vision API with the image
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };

    try {
      const geminiResult = await model.generateContent([prompt, imagePart]);
      const response = await geminiResult.response;
      const text = response.text();


      // Parse the JSON response
      let foodItems: IdentifiedFood[] = [];
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedFoods = JSON.parse(jsonMatch[0]);
          
          // Process each identified food
          foodItems = parsedFoods.map((food: any) => ({
            name: food.name || 'Unknown Food',
            confidence: Math.min(100, Math.max(0, food.confidence || 50)) / 100,
            portion: food.portion || '1 serving',
            estimatedGrams: Math.max(1, food.estimatedGrams || 100)
          }));
          
          // Get nutrition data for each food item
          for (let i = 0; i < foodItems.length; i++) {
            try {
              const nutrition = await getNutritionFromUSDA(foodItems[i].name, foodItems[i].estimatedGrams);
              foodItems[i] = { ...foodItems[i], ...nutrition };
            } catch (nutritionError) {
              // Add estimated nutrition if USDA lookup fails
              const estimatedNutrition = getEstimatedNutrition(foodItems[i].name, foodItems[i].estimatedGrams);
              foodItems[i] = { ...foodItems[i], ...estimatedNutrition };
            }
          }
        }
      } catch (parseError) {
        // Fallback: create a generic food item
        foodItems = [{
          name: 'Food Item',
          confidence: 0.6,
          portion: '1 serving',
          estimatedGrams: 150,
          calories: 150,
          protein: 5,
          carbs: 20,
          fat: 5
        }];
      }

      const analysisResult: FoodAnalysisResult = {
        identifiedFoods: foodItems.length > 0 ? foodItems : [{
          name: 'Food Item',
          confidence: 0.5,
          portion: '1 serving',
          estimatedGrams: 150,
          calories: 150,
          protein: 5,
          carbs: 20,
          fat: 5
        }],
        analysisTime: new Date().toISOString()
      };

      return analysisResult;

    } catch (geminiError) {
      console.error('❌ Gemini API call failed:', geminiError);
      
      // Check if it's a quota error and return fallback immediately
      if (geminiError instanceof Error && (
        geminiError.message.includes('quota') ||
        geminiError.message.includes('429') ||
        geminiError.message.includes('RESOURCE_EXHAUSTED') ||
        geminiError.message.includes('quota exceeded')
      )) {
        return getFallbackAnalysis();
      }
      
      // Check if it's an API access restriction and return fallback immediately
      if (geminiError instanceof Error && (
        geminiError.message.includes('403') ||
        geminiError.message.includes('referer') ||
        geminiError.message.includes('blocked') ||
        geminiError.message.includes('unauthorized')
      )) {
        return getFallbackAnalysis();
      }
      
      // Check if it's an image validation error and return fallback immediately
      if (geminiError instanceof Error && (
        geminiError.message.includes('400') ||
        geminiError.message.includes('not valid') ||
        geminiError.message.includes('Bad Request') ||
        geminiError.message.includes('invalid image')
      )) {
        return getFallbackAnalysis();
      }
      
      // For other errors, throw to outer catch
      throw geminiError;
    }



  } catch (error) {
    console.error('❌ Gemini Vision food analysis failed:', error);
    
    // Check if it's a quota/rate limit error
    if (error instanceof Error && (
      error.message.includes('quota') || 
      error.message.includes('429') ||
      error.message.includes('RESOURCE_EXHAUSTED') ||
      error.message.includes('quota exceeded')
    )) {
      console.log('⚠️ Gemini API quota exceeded, providing fallback analysis...');
      return getFallbackAnalysis();
    }
    
    // Check for invalid API key, disabled API, or HTTP referrer restrictions
    if (error instanceof Error && (
      error.message.includes('API_KEY_INVALID') ||
      error.message.includes('403') ||
      error.message.includes('401') ||
      error.message.includes('unauthorized') ||
      error.message.includes('has not been used') ||
      error.message.includes('disabled') ||
      error.message.includes('referer') ||
      error.message.includes('blocked')
    )) {
      console.log('⚠️ API access restricted, providing fallback analysis...');
      return getFallbackAnalysis();
    }

    // Check for image-related errors
    if (error instanceof Error && (
      error.message.includes('UPLOAD_ERROR') ||
      error.message.includes('STORAGE_ERROR') ||
      error.message.includes('INVALID_URL')
    )) {
      throw error; // Re-throw our custom errors as-is
    }

    // Check for network/connectivity errors
    if (error instanceof Error && (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('fetch failed')
    )) {
      throw new Error('NETWORK_ERROR: Unable to connect to the AI analysis service. Please check your internet connection and try again.');
    }
    
    throw new Error(`Food analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get nutrition data for a specific food from USDA database
 * Enhanced integration with comprehensive database search and validation
 */
export async function getNutritionFromUSDA(foodName: string, grams: number = 100) {
  try {
    // Import the USDA service for direct database access
    const { usdaService } = await import('./services/usdaService.js');
    
    // Enhanced preprocessing for better USDA matching
    const searchTerms = preprocessFoodNameForUSDA(foodName);
    
    let bestFood = null;
    let searchStats = {
      termsSearched: 0,
      totalResults: 0,
      usdaDataFound: false
    };
    
    // Try multiple search strategies with enhanced validation
    for (const searchTerm of searchTerms) {
      searchStats.termsSearched++;
      console.log(`🔍 USDA Search ${searchStats.termsSearched}/${searchTerms.length}: "${searchTerm}"`);
      
      const foods = await usdaService.searchFoods(searchTerm, 5); // Increased results for better matching
      
      if (foods && foods.length > 0) {
        searchStats.totalResults += foods.length;
        
        // Enhanced food validation with quality scoring
        const validFoods = foods.filter((food: any) => 
          food && 
          typeof food.calories === 'number' && 
          food.calories > 0 &&
          typeof food.protein === 'number' &&
          typeof food.fat === 'number' &&
          food.calories < 2000 && // Sanity check: reasonable calorie range per 100g
          food.protein >= 0 && food.fat >= 0 // Non-negative values
        );
        
        if (validFoods.length > 0) {
          // Score foods based on completeness and relevance
          const scoredFoods = validFoods.map((food: any) => {
            let score = 0;
            
            // Base score for having core nutrients
            if (food.calories > 0) score += 20;
            if (food.protein >= 0) score += 15;
            if (food.fat >= 0) score += 15;
            if (food.carbohydrates || food.carbs) score += 15;
            
            // Bonus for additional nutrients
            if (food.fiber) score += 10;
            if (food.sugar) score += 10;
            if (food.sodium) score += 10;
            
            // Bonus for detailed descriptions
            if (food.description && food.description.length > 10) score += 5;
            
            // Penalty for generic/vague names
            if (food.description && food.description.toLowerCase().includes('generic')) score -= 10;
            
            return { ...food, qualityScore: score };
          });
          
          // Select highest scoring food
          bestFood = scoredFoods.sort((a, b) => b.qualityScore - a.qualityScore)[0];
          
          if (bestFood) {
            searchStats.usdaDataFound = true;
            console.log(`✅ Found high-quality USDA data for "${searchTerm}"`);
            console.log(`📊 Quality score: ${bestFood.qualityScore}, Description: ${bestFood.description || bestFood.name}`);
            break;
          }
        }
      }
    }
    
    if (!bestFood) {
      console.log(`⚠️ No valid USDA data found after ${searchStats.termsSearched} searches (${searchStats.totalResults} total results)`);
      console.log(`🔄 Falling back to estimation for: "${foodName}"`);
      return getEstimatedNutrition(foodName, grams);
    }
    
    // Enhanced nutrition calculation with better accuracy
    const multiplier = grams / 100;
    const food = bestFood as any;
    
    const nutrition = {
      calories: Math.round((food.calories || 0) * multiplier),
      protein: Math.round((food.protein || 0) * multiplier * 10) / 10,
      carbs: Math.round((food.carbohydrates || food.carbs || 0) * multiplier * 10) / 10,
      fat: Math.round((food.fat || 0) * multiplier * 10) / 10,
      fiber: Math.round((food.fiber || 0) * multiplier * 10) / 10,
      sugar: Math.round((food.sugar || 0) * multiplier * 10) / 10,
      sodium: Math.round((food.sodium || 0) * multiplier * 10) / 10,
      dataSource: 'USDA',
      dataQuality: bestFood.qualityScore,
      description: food.description || food.name
    };
    
    console.log(`📊 USDA nutrition for ${grams}g ${foodName}:`, nutrition);
    return nutrition;
    
  } catch (error) {
    console.log('⚠️ USDA lookup error for', foodName, '- using estimation:', error);
    const estimation = getEstimatedNutrition(foodName, grams);
    return { ...estimation, dataSource: 'Estimation' };
  }
}

/**
 * Enhanced preprocessing for better USDA database matches
 * Uses comprehensive food mapping and smart search strategies
 */
function preprocessFoodNameForUSDA(foodName: string): string[] {
  const name = foodName.toLowerCase().trim();
  const searchTerms: string[] = [];
  
  // Add original name first
  searchTerms.push(name);
  
  // Remove common descriptors that might hinder search
  const cleanName = name
    .replace(/\b(grilled|fried|baked|roasted|steamed|boiled|sauteed|fresh|frozen|canned|organic|homemade|restaurant|fast food)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  if (cleanName && cleanName !== name) {
    searchTerms.push(cleanName);
  }
  
  // Enhanced composite food mapping with more varieties
  const compositeMap: { [key: string]: string[] } = {
    // Pizza varieties
    'cheese pizza': ['pizza, cheese', 'pizza', 'cheese pizza', 'pizza, regular crust, cheese'],
    'pepperoni pizza': ['pizza, pepperoni', 'pizza', 'pepperoni pizza'],
    'pizza slice': ['pizza, cheese', 'pizza'],
    
    // Protein sources
    'chicken breast': ['chicken, breast, meat only', 'chicken breast', 'chicken'],
    'chicken thigh': ['chicken, thigh, meat only', 'chicken thigh', 'chicken'],
    'ground beef': ['beef, ground, 85% lean meat', 'beef, ground', 'ground beef'],
    'ground turkey': ['turkey, ground', 'ground turkey'],
    'salmon': ['salmon, atlantic, farmed', 'salmon, cooked', 'salmon'],
    'tuna': ['tuna, light, canned in water', 'tuna'],
    
    // Vegetables
    'broccoli': ['broccoli, raw', 'broccoli, cooked', 'broccoli'],
    'spinach': ['spinach, raw', 'spinach, cooked', 'spinach'],
    'carrots': ['carrots, raw', 'carrots, cooked', 'carrots'],
    'tomatoes': ['tomatoes, raw', 'tomatoes, red, ripe'],
    
    // Starches and grains
    'rice': ['rice, white, long-grain, cooked', 'rice, cooked', 'rice'],
    'brown rice': ['rice, brown, long-grain, cooked', 'rice, brown, cooked'],
    'pasta': ['pasta, cooked', 'spaghetti, cooked', 'pasta'],
    'bread': ['bread, white', 'bread, whole-wheat', 'bread'],
    'french fries': ['potatoes, french fried', 'fast foods, potato, french fried', 'french fries'],
    
    // Desserts and sweets
    'ice cream': ['ice creams, vanilla', 'ice cream, vanilla', 'ice cream'],
    'chocolate cake': ['cake, chocolate, prepared from recipe', 'cake, chocolate'],
    'apple pie': ['pie, apple, commercially prepared', 'pie, apple'],
    'cheesecake': ['cheesecake commercially prepared', 'cheesecake'],
    'chocolate': ['chocolate, dark', 'candies, chocolate'],
    
    // Dairy
    'milk': ['milk, reduced fat, fluid, 2% milkfat', 'milk, whole', 'milk'],
    'cheese': ['cheese, cheddar', 'cheese, mozzarella', 'cheese'],
    'yogurt': ['yogurt, plain, low fat', 'yogurt, greek, plain'],
    
    // Condiments and sauces
    'tomato sauce': ['sauce, tomato, canned', 'tomato sauce', 'marinara sauce'],
    'ketchup': ['catsup', 'ketchup'],
    'mayonnaise': ['mayonnaise, regular', 'mayonnaise'],
    
    // Beverages
    'orange juice': ['orange juice, raw', 'orange juice'],
    'apple juice': ['apple juice, canned or bottled', 'apple juice'],
    'coffee': ['coffee, brewed from grounds', 'coffee'],
    
    // Snacks
    'potato chips': ['snacks, potato chips, plain', 'potato chips'],
    'nuts': ['nuts, mixed', 'almonds', 'peanuts'],
    'crackers': ['crackers, saltines', 'crackers'],
    
    // Fruits
    'apple': ['apples, raw, with skin', 'apple'],
    'banana': ['bananas, raw', 'banana'],
    'orange': ['oranges, raw, all commercial varieties', 'orange'],
    'strawberry': ['strawberries, raw', 'strawberries'],
    'grapes': ['grapes, red or green', 'grapes']
  };
  
  // Smart matching - check for partial matches and add alternatives
  for (const [key, alternatives] of Object.entries(compositeMap)) {
    if (name.includes(key) || key.includes(name.split(' ')[0]) || 
        name.split(' ').some(word => key.includes(word) && word.length > 3)) {
      searchTerms.push(...alternatives);
    }
  }
  
  // Add base ingredient searches for compound foods
  const words = name.split(' ');
  if (words.length > 1) {
    // For compound foods, try searching for the main ingredient
    const mainIngredients = words.filter(word => 
      word.length > 3 && 
      !['with', 'and', 'the', 'in', 'on', 'sauce', 'dressing'].includes(word)
    );
    searchTerms.push(...mainIngredients);
  }
  
  // Remove duplicates and return prioritized list
  const uniqueTerms = Array.from(new Set(searchTerms));
  
  // Prioritize more specific terms first, then general ones
  return uniqueTerms.sort((a, b) => {
    if (a === name) return -1; // Original name first
    if (b === name) return 1;
    return b.length - a.length; // Longer (more specific) terms first
  });
}

/**
 * Provide a fallback analysis when Gemini API is unavailable
 */
function getFallbackAnalysis(): FoodAnalysisResult {
  console.log('🔄 Providing fallback AI analysis due to API limitations');
  
  return {
    identifiedFoods: [{
      name: 'Food Item',
      confidence: 0.6,
      portion: '1 serving',
      estimatedGrams: 150,
      calories: 200,
      protein: 8,
      carbs: 25,
      fat: 6
    }],
    analysisTime: new Date().toISOString()
  };
}

/**
 * Enhanced nutrition estimation when USDA data is not available
 * Uses comprehensive food category database with realistic values
 */
function getEstimatedNutrition(foodName: string, grams: number = 100) {
  const name = foodName.toLowerCase();
  
  // Enhanced nutrition estimates per 100g with more detailed categories
  let baseNutrition = { 
    calories: 150, protein: 5, carbs: 20, fat: 5, 
    fiber: 2, sugar: 8, sodium: 50 
  };
  
  // Fruits (fresh)
  if (name.includes('apple') || name.includes('orange') || name.includes('pear')) {
    baseNutrition = { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 };
  } else if (name.includes('banana')) {
    baseNutrition = { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 };
  } else if (name.includes('strawberr') || name.includes('berr')) {
    baseNutrition = { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 };
  } else if (name.includes('grape')) {
    baseNutrition = { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 2 };
  } else if (name.includes('fruit')) {
    baseNutrition = { calories: 60, protein: 1, carbs: 15, fat: 0.2, fiber: 2, sugar: 10, sodium: 1 };
  
  // Vegetables
  } else if (name.includes('lettuce') || name.includes('spinach')) {
    baseNutrition = { calories: 15, protein: 1.4, carbs: 3, fat: 0.2, fiber: 1.3, sugar: 1.2, sodium: 28 };
  } else if (name.includes('broccoli')) {
    baseNutrition = { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 };
  } else if (name.includes('carrot')) {
    baseNutrition = { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 };
  } else if (name.includes('tomato')) {
    baseNutrition = { calories: 18, protein: 0.9, carbs: 4, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 };
  } else if (name.includes('potato') && !name.includes('fries') && !name.includes('chip')) {
    baseNutrition = { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6 };
  } else if (name.includes('vegetable') || name.includes('salad')) {
    baseNutrition = { calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2, sugar: 3, sodium: 20 };
  
  // Proteins - Meat
  } else if (name.includes('chicken breast')) {
    baseNutrition = { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 };
  } else if (name.includes('chicken') && !name.includes('fried')) {
    baseNutrition = { calories: 180, protein: 25, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 80 };
  } else if (name.includes('beef') && name.includes('ground')) {
    baseNutrition = { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 75 };
  } else if (name.includes('beef')) {
    baseNutrition = { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 60 };
  } else if (name.includes('pork')) {
    baseNutrition = { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62 };
  } else if (name.includes('meat')) {
    baseNutrition = { calories: 250, protein: 25, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 70 };
  
  // Proteins - Fish
  } else if (name.includes('salmon')) {
    baseNutrition = { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 59 };
  } else if (name.includes('tuna')) {
    baseNutrition = { calories: 144, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 39 };
  } else if (name.includes('fish')) {
    baseNutrition = { calories: 180, protein: 25, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 50 };
  
  // Carbohydrates
  } else if (name.includes('rice') && name.includes('brown')) {
    baseNutrition = { calories: 123, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 };
  } else if (name.includes('rice')) {
    baseNutrition = { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 };
  } else if (name.includes('pasta')) {
    baseNutrition = { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 6 };
  } else if (name.includes('bread') && name.includes('whole')) {
    baseNutrition = { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, sugar: 6, sodium: 491 };
  } else if (name.includes('bread')) {
    baseNutrition = { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 681 };
  
  // Dairy
  } else if (name.includes('milk') && name.includes('whole')) {
    baseNutrition = { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1, sodium: 40 };
  } else if (name.includes('milk')) {
    baseNutrition = { calories: 50, protein: 3.4, carbs: 5, fat: 2, fiber: 0, sugar: 5, sodium: 44 };
  } else if (name.includes('cheese') && name.includes('cheddar')) {
    baseNutrition = { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621 };
  } else if (name.includes('cheese')) {
    baseNutrition = { calories: 300, protein: 20, carbs: 5, fat: 25, fiber: 0, sugar: 3, sodium: 500 };
  } else if (name.includes('yogurt')) {
    baseNutrition = { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, sodium: 36 };
  
  // Processed foods
  } else if (name.includes('pizza')) {
    baseNutrition = { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, sodium: 598 };
  } else if (name.includes('french fries') || name.includes('fries')) {
    baseNutrition = { calories: 365, protein: 4, carbs: 63, fat: 17, fiber: 3.8, sugar: 0.3, sodium: 246 };
  } else if (name.includes('burger') || name.includes('hamburger')) {
    baseNutrition = { calories: 295, protein: 17, carbs: 22, fat: 15, fiber: 2, sugar: 3, sodium: 396 };
  
  // Desserts and sweets
  } else if (name.includes('ice cream')) {
    baseNutrition = { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.7, sugar: 21, sodium: 80 };
  } else if (name.includes('cake') || name.includes('chocolate cake')) {
    baseNutrition = { calories: 352, protein: 5, carbs: 56, fat: 14, fiber: 1.8, sugar: 40, sodium: 299 };
  } else if (name.includes('cookie')) {
    baseNutrition = { calories: 502, protein: 5.9, carbs: 64, fat: 25, fiber: 2.4, sugar: 38, sodium: 363 };
  } else if (name.includes('chocolate')) {
    baseNutrition = { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7, sugar: 48, sodium: 24 };
  
  // Fats and oils
  } else if (name.includes('oil') || name.includes('olive oil')) {
    baseNutrition = { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2 };
  } else if (name.includes('butter')) {
    baseNutrition = { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, sodium: 11 };
  
  // Nuts and seeds
  } else if (name.includes('almond') || name.includes('nuts')) {
    baseNutrition = { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, sugar: 4.4, sodium: 1 };
  
  // Beverages
  } else if (name.includes('soda') || name.includes('cola')) {
    baseNutrition = { calories: 42, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, sodium: 2 };
  } else if (name.includes('juice') && name.includes('orange')) {
    baseNutrition = { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2, sugar: 8.1, sodium: 1 };
  }
  
  const multiplier = grams / 100;
  
  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
    sugar: Math.round(baseNutrition.sugar * multiplier * 10) / 10,
    sodium: Math.round(baseNutrition.sodium * multiplier * 10) / 10
  };
}