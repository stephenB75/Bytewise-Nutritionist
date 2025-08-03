/**
 * Hook for tracking calories calculated and communicating with logger
 * Manages daily calorie tracking and communication between calculator and logger
 */

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CalculatedCalories {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  date: string;
  time: string;
  ingredients: string[];
  source: 'calculator' | 'manual';
}

export function useCalorieTracking() {
  const [calculatedCalories, setCalculatedCalories] = useState<CalculatedCalories[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const queryClient = useQueryClient();

  // Log calories to meals (for weekly logger) - simplified without auth requirement
  const logCaloriesMutation = useMutation({
    mutationFn: async (calorieEntry: CalculatedCalories) => {
      // Store in localStorage instead of requiring authentication
      const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      const mealEntry = {
        name: calorieEntry.name,
        calories: calorieEntry.calories,
        protein: calorieEntry.protein,
        carbs: calorieEntry.carbs,
        fat: calorieEntry.fat,
        date: calorieEntry.date,
        time: calorieEntry.time.replace(/:\d\d$/, ''), // Remove seconds for display
        category: getMealType(),
        timestamp: new Date().toISOString(),
        source: 'calculator',
        mealType: getMealType()
      };
      
      weeklyMeals.push(mealEntry);
      localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
      
      console.log('Calories logged from calculator:', mealEntry);
      console.log('Successfully logged to weekly ' + getMealType() + ':', {
        name: mealEntry.name,
        calories: mealEntry.calories,
        protein: mealEntry.protein,
        carbs: mealEntry.carbs,
        fat: mealEntry.fat,
        date: mealEntry.date,
        time: mealEntry.time,
        category: mealEntry.category
      });
      
      return mealEntry;
    },
    onSuccess: () => {
      // No need to invalidate API queries since we're using localStorage
      queryClient.invalidateQueries({ queryKey: ['weeklyMeals'] });
    },
  });

  // Add calculated calories
  const addCalculatedCalories = useCallback((calories: Omit<CalculatedCalories, 'id' | 'date' | 'time' | 'source'>) => {
    const newEntry: CalculatedCalories = {
      ...calories,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      source: 'calculator'
    };
    
    setCalculatedCalories(prev => [...prev, newEntry]);
    setDailyTotal(prev => prev + calories.calories);
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('calculatedCalories');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('calculatedCalories', JSON.stringify([...existing, newEntry]));
    
    console.log('Added calculated calories:', newEntry);
    
    return newEntry;
  }, [logCaloriesMutation]);

  // Get meal type based on time (enhanced logic)
  const getMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 21) return 'dinner';
    return 'snack';
  };

  // Get today's calculated calories
  const getTodaysCalories = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return calculatedCalories.filter(entry => entry.date === today);
  }, [calculatedCalories]);

  // Get daily statistics
  const getDailyStats = useCallback(() => {
    const todaysEntries = getTodaysCalories();
    return todaysEntries.reduce(
      (stats, entry) => ({
        calories: stats.calories + entry.calories,
        protein: stats.protein + entry.protein,
        carbs: stats.carbs + entry.carbs,
        fat: stats.fat + entry.fat,
        count: stats.count + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
    );
  }, [getTodaysCalories]);

  return {
    calculatedCalories,
    dailyTotal,
    addCalculatedCalories,
    logCaloriesMutation,
    getTodaysCalories,
    getDailyStats,
  };
}