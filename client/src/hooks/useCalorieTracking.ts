/**
 * Hook for tracking calories calculated and communicating with logger
 * Manages daily calorie tracking and communication between calculator and logger
 */

import { useState, useCallback } from 'react';
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
    
    // Automatically log to meals API
    setTimeout(() => {
      logCaloriesMutation.mutate(newEntry);
    }, 100);
    
    return newEntry;
  }, [logCaloriesMutation]);

  // Log calories to meals (for weekly logger)
  const logCaloriesMutation = useMutation({
    mutationFn: async (calorieEntry: CalculatedCalories) => {
      const response = await fetch('/api/meals/logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: calorieEntry.name,
          calories: calorieEntry.calories,
          protein: calorieEntry.protein,
          carbs: calorieEntry.carbs,
          fat: calorieEntry.fat,
          fiber: calorieEntry.fiber,
          sugar: calorieEntry.sugar,
          sodium: calorieEntry.sodium,
          date: calorieEntry.date,
          time: calorieEntry.time,
          mealType: getMealType(),
          source: 'calculator'
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to log calories');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
    },
  });

  // Get meal type based on time
  const getMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 19) return 'dinner';
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