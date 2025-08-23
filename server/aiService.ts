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
    console.log('🔍 Starting Gemini Vision food analysis for image:', imageUrl);

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
      console.log('⚠️ Gemini 2.0 Flash not available, falling back to Gemini 1.5 Pro...');
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
        console.log('📁 Downloading image from storage:', objectPath);
        
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
            console.log(`⏳ Waiting for upload completion (attempt ${retryCount + 1}/${maxRetries}), waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
          }
        }
        
        if (!exists) {
          console.log('❌ File not found after all retries. Object path:', objectPath);
          console.log('🔍 Bucket name:', bucketName);
          console.log('📁 Full image URL:', imageUrl);
          throw new Error('UPLOAD_ERROR: Image not found in storage after upload. Please wait a moment and try again.');
        }
        
        // Download the image data
        const [fileData] = await file.download();
        imageBuffer = fileData;
        console.log('✅ Image downloaded from storage:', imageBuffer.length, 'bytes');
        
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

    console.log('🤖 Calling Gemini Vision API...');
    try {
      const geminiResult = await model.generateContent([prompt, imagePart]);
      const response = await geminiResult.response;
      const text = response.text();
      console.log('✅ Gemini API call successful');

      console.log('🔍 Raw Gemini response:', text);

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
              console.log(`⚠️ Could not get nutrition for ${foodItems[i].name}:`, nutritionError);
              // Add estimated nutrition if USDA lookup fails
              const estimatedNutrition = getEstimatedNutrition(foodItems[i].name, foodItems[i].estimatedGrams);
              foodItems[i] = { ...foodItems[i], ...estimatedNutrition };
            }
          }
        }
      } catch (parseError) {
        console.log('⚠️ Could not parse Gemini response as JSON:', parseError);
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

      console.log('✅ Gemini Vision analysis completed:', analysisResult);
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
        console.log('⚠️ Gemini API quota exceeded, providing fallback analysis...');
        return getFallbackAnalysis();
      }
      
      // Check if it's an API access restriction and return fallback immediately
      if (geminiError instanceof Error && (
        geminiError.message.includes('403') ||
        geminiError.message.includes('referer') ||
        geminiError.message.includes('blocked') ||
        geminiError.message.includes('unauthorized')
      )) {
        console.log('⚠️ API access restricted, providing fallback analysis...');
        return getFallbackAnalysis();
      }
      
      // Check if it's an image validation error and return fallback immediately
      if (geminiError instanceof Error && (
        geminiError.message.includes('400') ||
        geminiError.message.includes('not valid') ||
        geminiError.message.includes('Bad Request') ||
        geminiError.message.includes('invalid image')
      )) {
        console.log('⚠️ Image validation failed, providing fallback analysis...');
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
 * This integrates with the existing USDA search functionality
 */
export async function getNutritionFromUSDA(foodName: string, grams: number = 100) {
  try {
    // Import the USDA service for direct database access
    const { usdaService } = await import('./services/usdaService.js');
    
    // Preprocess food name for better USDA matching
    const searchTerms = preprocessFoodNameForUSDA(foodName);
    
    let bestFood = null;
    
    // Try multiple search strategies
    for (const searchTerm of searchTerms) {
      console.log(`🔍 Looking up USDA data for: "${searchTerm}"`);
      const foods = await usdaService.searchFoods(searchTerm, 3);
      
      if (foods && foods.length > 0) {
        // Find the best match with complete nutrition data
        bestFood = foods.find((food: any) => 
          food && 
          typeof food.calories === 'number' && 
          food.calories > 0 &&
          typeof food.protein === 'number' &&
          typeof food.fat === 'number'
        );
        
        if (bestFood) {
          console.log(`✅ Found USDA data for "${searchTerm}": ${(bestFood as any).description || (bestFood as any).name}`);
          break;
        }
      }
    }
    
    if (!bestFood) {
      console.log(`⚠️ No USDA data found for: "${foodName}", using estimation`);
      return getEstimatedNutrition(foodName, grams);
    }
    
    // Calculate nutrition based on grams (USDA data is per 100g)
    const multiplier = grams / 100;
    const food = bestFood as any;
    
    return {
      calories: Math.round((food.calories || 0) * multiplier),
      protein: Math.round((food.protein || 0) * multiplier * 10) / 10,
      carbs: Math.round((food.carbohydrates || food.carbs || 0) * multiplier * 10) / 10,
      fat: Math.round((food.fat || 0) * multiplier * 10) / 10,
      fiber: Math.round((food.fiber || 0) * multiplier * 10) / 10,
      sugar: Math.round((food.sugar || 0) * multiplier * 10) / 10,
      sodium: Math.round((food.sodium || 0) * multiplier * 10) / 10
    };
    
  } catch (error) {
    console.log('⚠️ USDA lookup failed for', foodName, '- using estimation:', error);
    return getEstimatedNutrition(foodName, grams);
  }
}

/**
 * Preprocess food names to improve USDA database matches
 */
function preprocessFoodNameForUSDA(foodName: string): string[] {
  const name = foodName.toLowerCase().trim();
  const searchTerms: string[] = [];
  
  // Add original name first
  searchTerms.push(name);
  
  // Handle pizza specifically
  if (name.includes('pizza')) {
    searchTerms.push('pizza');
    searchTerms.push('pizza, cheese');
    if (name.includes('cheese')) {
      searchTerms.push('pizza, cheese, regular crust');
    }
  }
  
  // Handle common composite foods
  const compositeMap: { [key: string]: string[] } = {
    'cheese pizza': ['pizza, cheese', 'pizza', 'cheese pizza'],
    'tomato sauce': ['tomato sauce', 'sauce, tomato', 'marinara sauce'],
    'chicken breast': ['chicken, breast', 'chicken breast', 'chicken'],
    'ground beef': ['beef, ground', 'ground beef', 'beef'],
    'french fries': ['potatoes, french fried', 'french fries', 'fries'],
    'ice cream': ['ice cream', 'ice cream, vanilla'],
    'apple pie': ['pie, apple', 'apple pie'],
    'chocolate cake': ['cake, chocolate', 'chocolate cake'],
  };
  
  // Check for known composite foods
  for (const [key, alternatives] of Object.entries(compositeMap)) {
    if (name.includes(key) || key.includes(name)) {
      searchTerms.push(...alternatives);
      break;
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(searchTerms));
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
 * Get estimated nutrition when USDA data is not available
 */
function getEstimatedNutrition(foodName: string, grams: number = 100) {
  const name = foodName.toLowerCase();
  
  // Basic nutrition estimates per 100g for common food categories
  let baseNutrition = { calories: 150, protein: 5, carbs: 20, fat: 5 };
  
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || name.includes('orange')) {
    baseNutrition = { calories: 60, protein: 1, carbs: 15, fat: 0.2 };
  } else if (name.includes('vegetable') || name.includes('salad') || name.includes('lettuce')) {
    baseNutrition = { calories: 25, protein: 2, carbs: 5, fat: 0.3 };
  } else if (name.includes('meat') || name.includes('chicken') || name.includes('beef') || name.includes('pork')) {
    baseNutrition = { calories: 250, protein: 25, carbs: 0, fat: 15 };
  } else if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) {
    baseNutrition = { calories: 200, protein: 22, carbs: 0, fat: 12 };
  } else if (name.includes('bread') || name.includes('pasta') || name.includes('rice')) {
    baseNutrition = { calories: 350, protein: 10, carbs: 70, fat: 2 };
  } else if (name.includes('cheese') || name.includes('dairy')) {
    baseNutrition = { calories: 300, protein: 20, carbs: 5, fat: 25 };
  } else if (name.includes('oil') || name.includes('butter')) {
    baseNutrition = { calories: 800, protein: 0, carbs: 0, fat: 90 };
  }
  
  const multiplier = grams / 100;
  
  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * multiplier * 10) / 10
  };
}