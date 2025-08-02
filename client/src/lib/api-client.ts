/**
 * API Client for GitHub Pages
 * Direct API calls without backend proxy
 */

import { githubConfig } from './github-config';
import { supabase } from './supabase';

export class GitHubPagesApiClient {
  // Direct USDA API calls for GitHub Pages
  async calculateCalories(ingredient: string, measurement: string) {
    try {
      // Search for the ingredient
      const searchResponse = await fetch(`${githubConfig.usda.baseUrl}/foods/search?api_key=${githubConfig.usda.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: ingredient,
          dataType: ['Foundation', 'Branded', 'Survey'],
          pageSize: 5,
          pageNumber: 1,
          sortBy: 'lowercaseDescription.keyword',
          sortOrder: 'asc'
        }),
      });

      if (!searchResponse.ok) {
        throw new Error(`USDA API error: ${searchResponse.statusText}`);
      }

      const data = await searchResponse.json();
      
      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        const nutrients = this.extractNutrients(food.foodNutrients || []);
        const { gramsEquivalent } = this.parseMeasurement(measurement);
        
        const caloriesPer100g = nutrients.calories || 0;
        const estimatedCalories = Math.round((caloriesPer100g * gramsEquivalent) / 100);
        
        return {
          ingredient: food.description,
          measurement: `${measurement} (~${Math.round(gramsEquivalent)}g)`,
          estimatedCalories,
          nutritionPer100g: {
            calories: nutrients.calories,
            protein: nutrients.protein,
            carbs: nutrients.carbs,
            fat: nutrients.fat,
          },
        };
      }
      
      // Fallback if no results
      return this.getFallbackEstimate(ingredient, measurement);
    } catch (error) {
      console.error('USDA API error:', error);
      return this.getFallbackEstimate(ingredient, measurement);
    }
  }

  // Supabase-based meal logging for GitHub Pages
  async logMeal(mealData: any) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Store meal in Supabase
      const { data, error } = await supabase
        .from('meals')
        .insert({
          ...mealData,
          user_id: user.user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, meal: data };
    } catch (error) {
      console.error('Meal logging error:', error);
      throw error;
    }
  }

  // Get logged meals from Supabase
  async getLoggedMeals() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Get meals error:', error);
      return [];
    }
  }

  private extractNutrients(foodNutrients: any[]) {
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
      if (!nutrient?.nutrient?.name) continue;
      
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

  private parseMeasurement(measurement: string) {
    const normalized = measurement.toLowerCase().trim();
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    const quantity = match ? parseFloat(match[1]) : 1;
    const unit = match ? match[2].trim() : normalized;

    const conversions: { [key: string]: number } = {
      'g': 1, 'gram': 1, 'grams': 1,
      'kg': 1000, 'kilogram': 1000,
      'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35,
      'lb': 453.6, 'pound': 453.6, 'pounds': 453.6,
      'cup': 240, 'cups': 240,
      'tablespoon': 15, 'tablespoons': 15, 'tbsp': 15,
      'teaspoon': 5, 'teaspoons': 5, 'tsp': 5,
      'ml': 1, 'milliliter': 1, 'milliliters': 1,
      'l': 1000, 'liter': 1000, 'liters': 1000,
    };

    let gramsEquivalent = quantity;
    for (const [unitPattern, grams] of Object.entries(conversions)) {
      if (unit.includes(unitPattern)) {
        gramsEquivalent = quantity * grams;
        break;
      }
    }

    if (gramsEquivalent === quantity) {
      gramsEquivalent = quantity * 100; // default to 100g
    }

    return { quantity, unit, gramsEquivalent };
  }

  private getFallbackEstimate(ingredient: string, measurement: string) {
    const fallbacks: { [key: string]: number } = {
      'egg': 70, 'grape': 3, 'chicken': 200, 'rice': 130,
      'bread': 80, 'milk': 150, 'cheese': 100,
    };

    const ingredientLower = ingredient.toLowerCase();
    let baseCalories = 100;

    for (const [key, calories] of Object.entries(fallbacks)) {
      if (ingredientLower.includes(key)) {
        baseCalories = calories;
        break;
      }
    }

    return {
      ingredient,
      measurement,
      estimatedCalories: baseCalories,
      note: 'Estimate based on common nutrition data',
    };
  }
}

export const githubApiClient = new GitHubPagesApiClient();