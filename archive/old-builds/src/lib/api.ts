/**
 * Serverless API Layer
 * Supabase-powered data operations for Bytewise Nutrition Tracker
 */

import { supabase } from './supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Food = Tables['foods']['Row'];
type Meal = Tables['meals']['Row'];
type MealFood = Tables['meal_foods']['Row'];
type Recipe = Tables['recipes']['Row'];

// User Management
export const userApi = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
    return null;
  },

  // Update user profile
  async updateProfile(updates: Partial<User>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create or update user after auth
  async upsertUser(userData: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Food Database Operations
export const foodApi = {
  // Search foods
  async searchFoods(query: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .order('verified', { ascending: false })
      .order('is_from_usda', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get food by ID
  async getFoodById(id: number) {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Add food to database
  async addFood(food: Tables['foods']['Insert']) {
    const { data, error } = await supabase
      .from('foods')
      .insert(food)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get popular foods
  async getPopularFoods(limit: number = 10) {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

// USDA Integration
export const usdaApi = {
  // Search USDA FoodData Central
  async searchUSDA(query: string, limit: number = 10) {
    const apiKey = import.meta.env?.VITE_USDA_API_KEY || (typeof process !== 'undefined' ? process.env?.USDA_API_KEY : undefined);
    if (!apiKey) throw new Error('USDA API key not configured');

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          pageSize: limit,
          dataType: ['Branded', 'Foundation', 'Survey (FNDDS)'],
          sortBy: 'score',
          sortOrder: 'desc',
        }),
      }
    );

    if (!response.ok) throw new Error('USDA API request failed');
    return response.json();
  },

  // Get detailed USDA food data
  async getUSDAFoodDetails(fdcId: number) {
    const apiKey = import.meta.env?.VITE_USDA_API_KEY || (typeof process !== 'undefined' ? process.env?.USDA_API_KEY : undefined);
    if (!apiKey) throw new Error('USDA API key not configured');

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}&nutrients=203,204,205,208,269,291`
    );

    if (!response.ok) throw new Error('USDA API request failed');
    return response.json();
  },
};

// Meal Management
export const mealApi = {
  // Get user meals
  async getUserMeals(startDate?: string, endDate?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('meals')
      .select(`
        *,
        meal_foods (
          *,
          foods (*)
        )
      `)
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: false });

    if (startDate) {
      query = query.gte('scheduled_for', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_for', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Create meal
  async createMeal(meal: Omit<Tables['meals']['Insert'], 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .insert({ ...meal, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Add food to meal
  async addFoodToMeal(mealFood: Tables['meal_foods']['Insert']) {
    const { data, error } = await supabase
      .from('meal_foods')
      .insert(mealFood)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get meal nutrition summary
  async getMealNutrition(mealId: number) {
    const { data, error } = await supabase
      .from('meal_foods')
      .select(`
        quantity,
        unit,
        foods (
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          serving_size_grams
        )
      `)
      .eq('meal_id', mealId);

    if (error) throw error;
    return data;
  },
};

// Recipe Management
export const recipeApi = {
  // Get user recipes
  async getUserRecipes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create recipe
  async createRecipe(recipe: Omit<Tables['recipes']['Insert'], 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recipes')
      .insert({ ...recipe, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update recipe
  async updateRecipe(id: number, updates: Partial<Recipe>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recipes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Authentication
export const authApi = {
  // Sign in with email
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign up with email
  async signUpWithEmail(email: string, password: string, userData?: {
    first_name?: string;
    last_name?: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // OAuth providers
  async signInWithProvider(provider: 'google' | 'github' | 'discord') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },
};

export default {
  user: userApi,
  food: foodApi,
  usda: usdaApi,
  meal: mealApi,
  recipe: recipeApi,
  auth: authApi,
};