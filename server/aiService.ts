/**
 * AI Service for Food Recognition
 * Uses Google Gemini Vision to identify foods in images
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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
 * Analyze a food image using Google Gemini Vision
 * @param imageUrl - URL of the uploaded food image
 * @returns Promise<FoodAnalysisResult>
 */
export async function analyzeFoodImage(imageUrl: string): Promise<FoodAnalysisResult> {
  try {
    console.log('🔍 Starting AI food analysis for image:', imageUrl);

    const prompt = `You are a professional nutritionist and food expert. Analyze this food image and identify all visible food items with high accuracy.

For each food item you identify, provide:
1. The specific name of the food (be as specific as possible, include preparation method if visible)
2. Your confidence level (0.0 to 1.0)
3. A description of the portion size you can see
4. Estimated weight in grams

Please be very thorough and identify ALL visible food items, including:
- Main dishes, sides, garnishes
- Beverages if present
- Condiments, sauces, or toppings
- Any packaged items you can read labels for

Respond in JSON format with this structure:
{
  "identifiedFoods": [
    {
      "name": "specific food name",
      "confidence": 0.95,
      "portion": "description of portion size",
      "estimatedGrams": 150
    }
  ]
}

Be conservative with confidence levels - only use >0.9 for foods you're very certain about.`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch the image and convert to the required format
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageResponse.headers.get('content-type') || 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response from Google Gemini');
    }

    // Clean the response to extract JSON
    let jsonContent = content.trim();
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.split('```json')[1].split('```')[0].trim();
    } else if (jsonContent.includes('```')) {
      jsonContent = jsonContent.split('```')[1].split('```')[0].trim();
    }

    const analysisResult = JSON.parse(jsonContent);
    
    console.log('✅ AI analysis complete:', {
      foodsIdentified: analysisResult.identifiedFoods?.length || 0,
      foods: analysisResult.identifiedFoods?.map((f: any) => f.name) || []
    });

    return {
      identifiedFoods: analysisResult.identifiedFoods || [],
      analysisTime: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ AI food analysis failed:', error);
    
    // Check if it's a quota/rate limit error for Google API
    if (error instanceof Error && (
      error.message.includes('quota') || 
      error.message.includes('429') ||
      error.message.includes('RESOURCE_EXHAUSTED') ||
      error.message.includes('quota exceeded')
    )) {
      throw new Error('QUOTA_EXCEEDED: The Google AI API quota has been exceeded. Please check your API usage at https://console.cloud.google.com/apis/api/generativeai.googleapis.com or provide a new API key with available quota.');
    }
    
    // Check for invalid API key
    if (error instanceof Error && (
      error.message.includes('API_KEY_INVALID') ||
      error.message.includes('403') ||
      error.message.includes('unauthorized')
    )) {
      throw new Error('INVALID_API_KEY: The Google API key is invalid or unauthorized. Please check your API key configuration.');
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
    
    if (foods.length === 0) {
      // Return estimated nutrition if no USDA match found
      return getEstimatedNutrition(foodName, grams);
    }
    
    const food = foods[0];
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