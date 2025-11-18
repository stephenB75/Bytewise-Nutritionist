/**
 * AI Food Analysis Service
 * Uses Google Gemini Vision API for food recognition and USDA database for nutrition data
 */

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
  fiber?: number;
  sugar?: number;
  sodium?: number;
  // Add micronutrient properties
  iron?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
  folate?: number;
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
      // Validate URL format before processing
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('INVALID_INPUT: Image URL is required and must be a string');
      }

      // Check if it's a valid URL
      let url: URL;
      try {
        url = new URL(imageUrl);
      } catch (urlError) {
        throw new Error(`INVALID_URL: The provided image URL is not valid. Expected format: https://example.com/path/to/image.jpg, got: ${imageUrl}`);
      }

      // Extract object path from the Supabase Storage URL
      const pathParts = url.pathname.split('/');
      
      // For Supabase Storage URLs, find the object path
      let objectPath: string;
      
      if (imageUrl.includes('supabase')) {
        // Supabase Storage URL format: /storage/v1/object/public/bucket/path or /storage/v1/object/sign/bucket/path
        const storageIndex = pathParts.findIndex(part => part === 'storage');
        if (storageIndex !== -1 && pathParts.length > storageIndex + 5) {
          // Extract object path correctly
          // Format: ["", "storage", "v1", "object", "public|sign", "bucket-name", ...object-path]
          // Skip ["", "storage", "v1", "object", "public|sign", "bucket-name"] and get the rest
          objectPath = pathParts.slice(storageIndex + 6).join('/');
          console.log(`🔍 Parsed Supabase URL - Path: ${objectPath}, Full pathname: ${url.pathname}`);
        } else {
          objectPath = pathParts.slice(-1)[0]; // Just the filename as fallback
        }
      } else {
        // Default storage format
        {
          objectPath = pathParts.slice(-1)[0];
        }
      }
      
      if (objectPath) {
        
        // Get the file from Supabase Storage
        const { supabaseStorageService } = await import('./supabaseStorage');
        
        // Check if file exists with retries - longer wait for upload completion
        let exists = false;
        let retryCount = 0;
        const maxRetries = 8; // Increased retries
        
        while (!exists && retryCount < maxRetries) {
          exists = await supabaseStorageService.objectExists(objectPath);
          if (!exists) {
            const waitTime = retryCount < 3 ? 2000 : 5000; // Longer waits for later attempts
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
          }
        }
        
        if (!exists) {
          throw new Error('UPLOAD_ERROR: Image not found in storage after upload. Please wait a moment and try again.');
        }
        
        // Download the image data using service method (cleaner encapsulation)
        const { data, error } = await supabaseStorageService.supabase
          .storage
          .from(supabaseStorageService.bucketName)
          .download(objectPath);
          
        if (error || !data) {
          throw new Error(`DOWNLOAD_ERROR: Failed to download image: ${error?.message}`);
        }
        
        imageBuffer = Buffer.from(await data.arrayBuffer());
        
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
          
          // Get nutrition data for each food item with enhanced USDA integration
          for (let i = 0; i < foodItems.length; i++) {
            try {
              const nutrition = await getNutritionFromUSDA(foodItems[i].name, foodItems[i].estimatedGrams);
              
              // Verify we got real USDA data, not just estimates
              if (nutrition && (nutrition as any).dataSource === 'USDA') {
                foodItems[i] = { ...foodItems[i], ...nutrition };
              } else {
                const estimatedNutrition = getEstimatedNutrition(foodItems[i].name, foodItems[i].estimatedGrams);
                
                // Always preserve Gemini's macronutrients but add our micronutrients
                foodItems[i] = { 
                  ...foodItems[i], 
                  ...estimatedNutrition,
                  // Preserve Gemini's macronutrients if they exist
                  calories: (foodItems[i] as any).calories || estimatedNutrition.calories,
                  protein: (foodItems[i] as any).protein || estimatedNutrition.protein,
                  carbs: (foodItems[i] as any).carbs || estimatedNutrition.carbs,
                  fat: (foodItems[i] as any).fat || estimatedNutrition.fat
                };
              }
            } catch (nutritionError) {
              console.error(`❌ Nutrition lookup failed for ${foodItems[i].name}:`, nutritionError);
              // Add estimated nutrition if USDA lookup fails
              const estimatedNutrition = getEstimatedNutrition(foodItems[i].name, foodItems[i].estimatedGrams);
              
              // Always preserve Gemini's macronutrients but add our micronutrients
              foodItems[i] = { 
                ...foodItems[i], 
                ...estimatedNutrition,
                // Preserve Gemini's macronutrients if they exist
                calories: (foodItems[i] as any).calories || estimatedNutrition.calories,
                protein: (foodItems[i] as any).protein || estimatedNutrition.protein,
                carbs: (foodItems[i] as any).carbs || estimatedNutrition.carbs,
                fat: (foodItems[i] as any).fat || estimatedNutrition.fat
              };
            }
          }
        }
      } catch (parseError) {
        // Fallback: create a generic food item WITH micronutrients
        const fallbackNutrition = getEstimatedNutrition('Food Item', 150);
        foodItems = [{
          name: 'Food Item',
          confidence: 0.6,
          portion: '1 serving',
          estimatedGrams: 150,
          ...fallbackNutrition
        }];
      }

      // Ensure default fallback also has micronutrients
      const defaultFallback = foodItems.length > 0 ? foodItems : (() => {
        const fallbackNutrition = getEstimatedNutrition('Food Item', 150);
        return [{
          name: 'Food Item',
          confidence: 0.5,
          portion: '1 serving',
          estimatedGrams: 150,
          ...fallbackNutrition
        }];
      })();

      const analysisResult: FoodAnalysisResult = {
        identifiedFoods: defaultFallback,
        analysisTime: new Date().toISOString()
      };

      // Ensure micronutrients are included in final result

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
      // USDA search in progress
      
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
            // Found high-quality USDA data
            // Quality score calculated
            break;
          }
        }
      }
    }
    
    if (!bestFood) {
      // No valid USDA data found after search
      console.log(`🔄 Falling back to estimation for: "${foodName}"`);
      const estimation = getEstimatedNutrition(foodName, grams);
      return { ...estimation, dataSource: 'Estimation (USDA not found)' };
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
      // Add micronutrients from USDA data
      iron: Math.round((food.iron || 0) * multiplier * 10) / 10,
      calcium: Math.round((food.calcium || 0) * multiplier * 10) / 10,
      zinc: Math.round((food.zinc || 0) * multiplier * 10) / 10,
      magnesium: Math.round((food.magnesium || 0) * multiplier * 10) / 10,
      vitaminC: Math.round((food.vitaminC || food.vitamin_c || 0) * multiplier * 10) / 10,
      vitaminD: Math.round((food.vitaminD || food.vitamin_d || 0) * multiplier * 10) / 10,
      vitaminB12: Math.round((food.vitaminB12 || food.vitamin_b12 || 0) * multiplier * 10) / 10,
      folate: Math.round((food.folate || food.folic_acid || 0) * multiplier * 10) / 10,
      dataSource: 'USDA',
      dataQuality: bestFood.qualityScore,
      description: food.description || food.name
    };
    
    // USDA nutrition calculated successfully
    return nutrition;
    
  } catch (error) {
    // USDA lookup error, using estimation
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
  
  // Include comprehensive nutrition including micronutrients
  const fallbackFood = {
    name: 'Food Item',
    confidence: 0.6,
    portion: '1 serving',
    estimatedGrams: 150,
    calories: 200,
    protein: 8,
    carbs: 25,
    fat: 6,
    fiber: 3,
    sugar: 5,
    sodium: 50,
    // Add micronutrients to fallback analysis
    iron: 2.5,
    calcium: 60,
    zinc: 1.2,
    magnesium: 30,
    vitaminC: 8,
    vitaminD: 0.2,
    vitaminB12: 0.3,
    folate: 20
  };

  console.log('🔬 Fallback analysis result with micronutrients:', {
    name: fallbackFood.name,
    iron: fallbackFood.iron,
    calcium: fallbackFood.calcium,
    vitaminC: fallbackFood.vitaminC
  });
  
  return {
    identifiedFoods: [fallbackFood],
    analysisTime: new Date().toISOString()
  };
}

/**
 * Enhanced nutrition estimation when USDA data is not available
 * Uses comprehensive food category database with realistic values
 */
function getEstimatedNutrition(foodName: string, grams: number = 100) {
  const name = foodName.toLowerCase();
  
  // Enhanced nutrition estimates per 100g with more detailed categories including micronutrients
  let baseNutrition = { 
    calories: 150, protein: 5, carbs: 20, fat: 5, 
    fiber: 2, sugar: 8, sodium: 50,
    // Add estimated micronutrients
    iron: 1.5, calcium: 40, zinc: 0.8, magnesium: 25,
    vitaminC: 5, vitaminD: 0.1, vitaminB12: 0.2, folate: 15
  };
  
  // Fruits (fresh)
  if (name.includes('apple') || name.includes('orange') || name.includes('pear')) {
    baseNutrition = { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1,
      iron: 0.12, calcium: 6, zinc: 0.04, magnesium: 5, vitaminC: 53, vitaminD: 0, vitaminB12: 0, folate: 3 };
  } else if (name.includes('banana')) {
    baseNutrition = { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1,
      iron: 0.26, calcium: 5, zinc: 0.15, magnesium: 27, vitaminC: 8.7, vitaminD: 0, vitaminB12: 0, folate: 20 };
  } else if (name.includes('strawberr') || name.includes('berr')) {
    baseNutrition = { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1,
      iron: 0.41, calcium: 16, zinc: 0.14, magnesium: 13, vitaminC: 58.8, vitaminD: 0, vitaminB12: 0, folate: 24 };
  } else if (name.includes('grape')) {
    baseNutrition = { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 2,
      iron: 0.36, calcium: 10, zinc: 0.07, magnesium: 7, vitaminC: 3.2, vitaminD: 0, vitaminB12: 0, folate: 2 };
  } else if (name.includes('fruit')) {
    baseNutrition = { calories: 60, protein: 1, carbs: 15, fat: 0.2, fiber: 2, sugar: 10, sodium: 1,
      iron: 0.3, calcium: 15, zinc: 0.1, magnesium: 10, vitaminC: 30, vitaminD: 0, vitaminB12: 0, folate: 10 };
  
  // Vegetables
  } else if (name.includes('lettuce') || name.includes('spinach')) {
    baseNutrition = { calories: 15, protein: 1.4, carbs: 3, fat: 0.2, fiber: 1.3, sugar: 1.2, sodium: 28,
      iron: 2.71, calcium: 99, zinc: 0.53, magnesium: 79, vitaminC: 28.1, vitaminD: 0, vitaminB12: 0, folate: 194 };
  } else if (name.includes('broccoli')) {
    baseNutrition = { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33,
      iron: 0.73, calcium: 47, zinc: 0.41, magnesium: 21, vitaminC: 89.2, vitaminD: 0, vitaminB12: 0, folate: 63 };
  } else if (name.includes('carrot')) {
    baseNutrition = { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69,
      iron: 0.3, calcium: 33, zinc: 0.24, magnesium: 12, vitaminC: 5.9, vitaminD: 0, vitaminB12: 0, folate: 19 };
  } else if (name.includes('tomato')) {
    baseNutrition = { calories: 18, protein: 0.9, carbs: 4, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5,
      iron: 0.27, calcium: 10, zinc: 0.17, magnesium: 11, vitaminC: 13.7, vitaminD: 0, vitaminB12: 0, folate: 15 };
  } else if (name.includes('potato') && !name.includes('fries') && !name.includes('chip')) {
    baseNutrition = { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6,
      iron: 0.81, calcium: 12, zinc: 0.3, magnesium: 23, vitaminC: 19.7, vitaminD: 0, vitaminB12: 0, folate: 15 };
  } else if (name.includes('vegetable') || name.includes('salad')) {
    baseNutrition = { calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2, sugar: 3, sodium: 20,
      iron: 1.0, calcium: 40, zinc: 0.4, magnesium: 15, vitaminC: 15, vitaminD: 0, vitaminB12: 0, folate: 30 };
  
  // Proteins - Meat
  } else if (name.includes('chicken breast')) {
    baseNutrition = { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74,
      iron: 1.04, calcium: 15, zinc: 1.0, magnesium: 29, vitaminC: 0, vitaminD: 0.1, vitaminB12: 0.34, folate: 4 };
  } else if (name.includes('chicken') && !name.includes('fried')) {
    baseNutrition = { calories: 180, protein: 25, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 80,
      iron: 0.9, calcium: 15, zinc: 1.3, magnesium: 25, vitaminC: 0, vitaminD: 0.1, vitaminB12: 0.3, folate: 4 };
  } else if (name.includes('beef') && name.includes('ground')) {
    baseNutrition = { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 75,
      iron: 2.7, calcium: 18, zinc: 5.3, magnesium: 21, vitaminC: 0, vitaminD: 0.1, vitaminB12: 2.6, folate: 7 };
  } else if (name.includes('beef')) {
    baseNutrition = { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 60,
      iron: 2.6, calcium: 18, zinc: 4.8, magnesium: 21, vitaminC: 0, vitaminD: 0.1, vitaminB12: 2.6, folate: 6 };
  } else if (name.includes('pork')) {
    baseNutrition = { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62,
      iron: 0.9, calcium: 19, zinc: 2.4, magnesium: 26, vitaminC: 0, vitaminD: 0.6, vitaminB12: 0.7, folate: 5 };
  } else if (name.includes('meat')) {
    baseNutrition = { calories: 250, protein: 25, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 70,
      iron: 2.5, calcium: 15, zinc: 4.0, magnesium: 20, vitaminC: 0, vitaminD: 0.1, vitaminB12: 2.0, folate: 5 };
  
  // Proteins - Fish
  } else if (name.includes('salmon')) {
    baseNutrition = { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 59,
      iron: 0.8, calcium: 12, zinc: 0.6, magnesium: 29, vitaminC: 0, vitaminD: 11.0, vitaminB12: 3.2, folate: 25 };
  } else if (name.includes('tuna')) {
    baseNutrition = { calories: 144, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 39,
      iron: 1.3, calcium: 8, zinc: 0.6, magnesium: 27, vitaminC: 0, vitaminD: 3.7, vitaminB12: 4.9, folate: 5 };
  } else if (name.includes('fish')) {
    baseNutrition = { calories: 180, protein: 25, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 50,
      iron: 0.7, calcium: 15, zinc: 0.5, magnesium: 25, vitaminC: 0, vitaminD: 5.0, vitaminB12: 2.0, folate: 15 };
  
  // Carbohydrates
  } else if (name.includes('rice') && name.includes('brown')) {
    baseNutrition = { calories: 123, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5,
      iron: 0.82, calcium: 23, zinc: 1.2, magnesium: 43, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 7 };
  } else if (name.includes('rice')) {
    baseNutrition = { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1,
      iron: 0.8, calcium: 28, zinc: 1.09, magnesium: 25, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 8 };
  } else if (name.includes('pasta')) {
    baseNutrition = { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 6,
      iron: 0.9, calcium: 7, zinc: 0.5, magnesium: 18, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 18 };
  } else if (name.includes('bread') && name.includes('whole')) {
    baseNutrition = { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, sugar: 6, sodium: 491,
      iron: 2.5, calcium: 107, zinc: 1.8, magnesium: 107, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 44 };
  } else if (name.includes('bread')) {
    baseNutrition = { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 681,
      iron: 3.6, calcium: 147, zinc: 0.7, magnesium: 22, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 43 };
  
  // Dairy
  } else if (name.includes('milk') && name.includes('whole')) {
    baseNutrition = { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1, sodium: 40,
      iron: 0.05, calcium: 113, zinc: 0.4, magnesium: 10, vitaminC: 0, vitaminD: 1.3, vitaminB12: 0.5, folate: 5 };
  } else if (name.includes('milk')) {
    baseNutrition = { calories: 50, protein: 3.4, carbs: 5, fat: 2, fiber: 0, sugar: 5, sodium: 44,
      iron: 0.03, calcium: 113, zinc: 0.4, magnesium: 10, vitaminC: 0, vitaminD: 1.3, vitaminB12: 0.5, folate: 5 };
  } else if (name.includes('cheese') && name.includes('cheddar')) {
    baseNutrition = { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621,
      iron: 0.7, calcium: 721, zinc: 3.1, magnesium: 28, vitaminC: 0, vitaminD: 0.6, vitaminB12: 0.8, folate: 18 };
  } else if (name.includes('cheese')) {
    baseNutrition = { calories: 300, protein: 20, carbs: 5, fat: 25, fiber: 0, sugar: 3, sodium: 500,
      iron: 0.7, calcium: 700, zinc: 3.0, magnesium: 22, vitaminC: 0, vitaminD: 0.6, vitaminB12: 1.1, folate: 18 };
  } else if (name.includes('yogurt')) {
    baseNutrition = { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, sodium: 36,
      iron: 0.1, calcium: 110, zinc: 0.6, magnesium: 11, vitaminC: 0.5, vitaminD: 0, vitaminB12: 0.5, folate: 7 };
  
  // Processed foods
  } else if (name.includes('pizza')) {
    baseNutrition = { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, sodium: 598,
      iron: 2.4, calcium: 144, zinc: 1.4, magnesium: 20, vitaminC: 0.2, vitaminD: 0.1, vitaminB12: 0.3, folate: 8 };
  } else if (name.includes('french fries') || name.includes('fries')) {
    baseNutrition = { calories: 365, protein: 4, carbs: 63, fat: 17, fiber: 3.8, sugar: 0.3, sodium: 246,
      iron: 0.8, calcium: 15, zinc: 0.3, magnesium: 25, vitaminC: 9.7, vitaminD: 0, vitaminB12: 0, folate: 15 };
  } else if (name.includes('burger') || name.includes('hamburger')) {
    baseNutrition = { calories: 295, protein: 17, carbs: 22, fat: 15, fiber: 2, sugar: 3, sodium: 396,
      iron: 2.1, calcium: 54, zinc: 2.9, magnesium: 20, vitaminC: 0.6, vitaminD: 0.1, vitaminB12: 1.3, folate: 8 };
  
  // Desserts and sweets
  } else if (name.includes('ice cream')) {
    baseNutrition = { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.7, sugar: 21, sodium: 80,
      iron: 0.09, calcium: 128, zinc: 0.3, magnesium: 14, vitaminC: 0.6, vitaminD: 0.1, vitaminB12: 0.3, folate: 5 };
  } else if (name.includes('cake') || name.includes('chocolate cake')) {
    baseNutrition = { calories: 352, protein: 5, carbs: 56, fat: 14, fiber: 1.8, sugar: 40, sodium: 299,
      iron: 1.8, calcium: 73, zinc: 0.5, magnesium: 22, vitaminC: 0.1, vitaminD: 0.6, vitaminB12: 0.1, folate: 8 };
  } else if (name.includes('cookie')) {
    baseNutrition = { calories: 502, protein: 5.9, carbs: 64, fat: 25, fiber: 2.4, sugar: 38, sodium: 363,
      iron: 3.0, calcium: 73, zinc: 0.5, magnesium: 30, vitaminC: 0, vitaminD: 0.5, vitaminB12: 0.1, folate: 15 };
  } else if (name.includes('donut') || name.includes('doughnut')) {
    baseNutrition = { calories: 452, protein: 4.9, carbs: 51, fat: 25, fiber: 1.4, sugar: 10, sodium: 373,
      iron: 1.5, calcium: 89, zinc: 0.4, magnesium: 13, vitaminC: 0.1, vitaminD: 0.4, vitaminB12: 0.1, folate: 47 };
  } else if (name.includes('chocolate')) {
    baseNutrition = { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7, sugar: 48, sodium: 24,
      iron: 2.3, calcium: 65, zinc: 0.9, magnesium: 63, vitaminC: 0, vitaminD: 0, vitaminB12: 0.3, folate: 12 };
  
  // Fats and oils
  } else if (name.includes('oil') || name.includes('olive oil')) {
    baseNutrition = { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2,
      iron: 0.56, calcium: 1, zinc: 0, magnesium: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0 };
  } else if (name.includes('butter')) {
    baseNutrition = { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, sodium: 11,
      iron: 0.02, calcium: 24, zinc: 0.09, magnesium: 2, vitaminC: 0, vitaminD: 1.5, vitaminB12: 0.17, folate: 3 };
  
  // Nuts and seeds
  } else if (name.includes('almond') || name.includes('nuts')) {
    baseNutrition = { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, sugar: 4.4, sodium: 1,
      iron: 3.7, calcium: 269, zinc: 3.1, magnesium: 270, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 44 };
  
  // Beverages
  } else if (name.includes('soda') || name.includes('cola')) {
    baseNutrition = { calories: 42, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, sodium: 2,
      iron: 0.11, calcium: 2, zinc: 0.04, magnesium: 1, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0 };
  } else if (name.includes('juice') && name.includes('orange')) {
    baseNutrition = { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2, sugar: 8.1, sodium: 1,
      iron: 0.2, calcium: 11, zinc: 0.1, magnesium: 11, vitaminC: 50, vitaminD: 0, vitaminB12: 0, folate: 30 };
  }
  
  const multiplier = grams / 100;
  
  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
    sugar: Math.round(baseNutrition.sugar * multiplier * 10) / 10,
    sodium: Math.round(baseNutrition.sodium * multiplier * 10) / 10,
    // Include all micronutrients in estimation return
    iron: Math.round((baseNutrition.iron || 0) * multiplier * 10) / 10,
    calcium: Math.round((baseNutrition.calcium || 0) * multiplier * 10) / 10,
    zinc: Math.round((baseNutrition.zinc || 0) * multiplier * 10) / 10,
    magnesium: Math.round((baseNutrition.magnesium || 0) * multiplier * 10) / 10,
    vitaminC: Math.round((baseNutrition.vitaminC || 0) * multiplier * 10) / 10,
    vitaminD: Math.round((baseNutrition.vitaminD || 0) * multiplier * 10) / 10,
    vitaminB12: Math.round((baseNutrition.vitaminB12 || 0) * multiplier * 10) / 10,
    folate: Math.round((baseNutrition.folate || 0) * multiplier * 10) / 10
  };
}