/**
 * Meals Service - Handles meal data fetching for both development and production
 * In production (bytewisenutritionist.com), uses Supabase directly
 * In development, uses Express API endpoints
 */

import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { apiRequest } from '@/lib/queryClient';

export interface Meal {
  id: string;
  userId: string;
  date: Date | string;
  mealType: string;
  name: string;
  totalCalories: string;
  totalProtein: string;
  totalCarbs: string;
  totalFat: string;
}

/**
 * Fetch meals based on environment
 * Production: Direct Supabase query
 * Development: Express API endpoint
 */
export async function fetchMeals(startDate?: Date, endDate?: Date): Promise<Meal[]> {
  // Check if we're in production (on custom domain)
  const isProduction = config.isCustomDomain || config.isProd || 
    (typeof window !== 'undefined' && window.location.hostname === 'bytewisenutritionist.com');

  if (isProduction) {
    // Production: Use Supabase directly
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return [];
    }

    let query = supabase
      .from('meals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    // Add date filtering if provided
    if (startDate) {
      query = query.gte('date', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching meals from Supabase:', error);
      return [];
    }

    // Transform snake_case to camelCase
    return (data || []).map(meal => ({
      id: meal.id,
      userId: meal.user_id,
      date: meal.date,
      mealType: meal.meal_type,
      name: meal.name,
      totalCalories: meal.total_calories,
      totalProtein: meal.total_protein,
      totalCarbs: meal.total_carbs,
      totalFat: meal.total_fat
    }));
  } else {
    // Development: Use Express API
    try {
      let url = '/api/meals/logged';
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest('GET', url);
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching meals from API:', error);
      return [];
    }
  }
}

/**
 * Create a new meal
 * Production: Direct Supabase insert
 * Development: Express API endpoint
 */
export async function createMeal(meal: Omit<Meal, 'id' | 'userId'>): Promise<Meal | null> {
  const isProduction = config.isCustomDomain || config.isProd || 
    (typeof window !== 'undefined' && window.location.hostname === 'bytewisenutritionist.com');

  if (isProduction) {
    // Production: Use Supabase directly
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('meals')
      .insert({
        user_id: session.user.id,
        date: meal.date instanceof Date ? meal.date.toISOString() : meal.date,
        meal_type: meal.mealType,
        name: meal.name,
        total_calories: meal.totalCalories,
        total_protein: meal.totalProtein,
        total_carbs: meal.totalCarbs,
        total_fat: meal.totalFat
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meal in Supabase:', error);
      return null;
    }

    // Transform snake_case to camelCase
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      mealType: data.meal_type,
      name: data.name,
      totalCalories: data.total_calories,
      totalProtein: data.total_protein,
      totalCarbs: data.total_carbs,
      totalFat: data.total_fat
    };
  } else {
    // Development: Use Express API
    try {
      const response = await apiRequest('POST', '/api/meals/logged', meal);
      
      if (response.ok) {
        const data = await response.json();
        return data.meal || data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating meal via API:', error);
      return null;
    }
  }
}

/**
 * Delete a meal
 * Production: Direct Supabase delete
 * Development: Express API endpoint
 */
export async function deleteMeal(mealId: string): Promise<boolean> {
  const isProduction = config.isCustomDomain || config.isProd || 
    (typeof window !== 'undefined' && window.location.hostname === 'bytewisenutritionist.com');

  if (isProduction) {
    // Production: Use Supabase directly
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (error) {
      console.error('Error deleting meal from Supabase:', error);
      return false;
    }

    return true;
  } else {
    // Development: Use Express API
    try {
      const response = await apiRequest('DELETE', `/api/meals/${mealId}`);
      return response.ok;
    } catch (error) {
      console.error('Error deleting meal via API:', error);
      return false;
    }
  }
}