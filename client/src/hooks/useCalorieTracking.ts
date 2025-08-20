/**
 * Hook for tracking calories calculated and communicating with logger
 * Manages daily calorie tracking and communication between calculator and logger
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataPersistence } from './useDataPersistence';
import { getLocalDateKey, formatLocalTime, getMealTypeByTime } from '@/utils/dateUtils';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

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
  const { user } = useAuth();
  
  // Use data persistence for automatic saving (limited to avoid quota errors)
  useDataPersistence({
    key: 'calculatedCalories',
    data: calculatedCalories,
    syncToDatabase: true,
    debounceMs: 2000
  });
  
  // Load persisted data on mount with quota error handling
  useEffect(() => {
    try {
      const stored = localStorage.getItem('calculatedCalories');
      if (stored) {
        const loaded = JSON.parse(stored);
        if (loaded && Array.isArray(loaded)) {
          setCalculatedCalories(loaded);
          // Calculate daily total from loaded data using local date
          const today = getLocalDateKey();
          const todaysTotal = loaded
            .filter((entry: CalculatedCalories) => entry.date === today)
            .reduce((sum: number, entry: CalculatedCalories) => sum + entry.calories, 0);
          setDailyTotal(todaysTotal);
        }
      }
    } catch (error) {
      console.warn('Failed to load calculated calories from localStorage:', error);
    }
  }, []);

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
        category: getMealTypeByTime(),
        timestamp: new Date().toISOString(),
        source: 'calculator',
        mealType: getMealTypeByTime()
      };
      
      weeklyMeals.push(mealEntry);
      localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
      
      // Calories logged successfully
      
      return mealEntry;
    },
    onSuccess: () => {
      // No need to invalidate API queries since we're using localStorage
      queryClient.invalidateQueries({ queryKey: ['weeklyMeals'] });
    },
  });

  // Add calculated calories
  const addCalculatedCalories = useCallback(async (calories: Omit<CalculatedCalories, 'id' | 'date' | 'time' | 'source'>) => {
    const now = new Date();
    const newEntry: CalculatedCalories = {
      ...calories,
      id: Date.now().toString(),
      date: getLocalDateKey(now),
      time: formatLocalTime(now),
      source: 'calculator'
    };
    
    setCalculatedCalories(prev => [...prev, newEntry]);
    setDailyTotal(prev => prev + calories.calories);
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('calculatedCalories');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('calculatedCalories', JSON.stringify([...existing, newEntry]));
    
    // Check if this is a water entry and update water consumption
    const isWaterEntry = calories.name.toLowerCase().includes('water') && calories.calories === 0;
    if (isWaterEntry) {
      console.log('💧 Water detected in calorie tracker:', calories.name);
      
      // Extract water amount (default to 1 glass if bottle/glass detected)
      let waterGlasses = 1;
      const nameLC = calories.name.toLowerCase();
      if (nameLC.includes('bottle') || nameLC.includes('glass') || nameLC.includes('cup')) {
        waterGlasses = 1;
      }
      
      // Always update localStorage immediately for instant UI feedback
      const currentStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
      const currentWater = currentStats.waterGlasses || 0;
      const newWaterTotal = currentWater + waterGlasses;
      
      // Update localStorage immediately
      localStorage.setItem('dailyStats', JSON.stringify({
        ...currentStats,
        waterGlasses: newWaterTotal
      }));
      
      console.log('💧 Water updated in localStorage:', {
        added: waterGlasses,
        newTotal: newWaterTotal
      });
      
      // Fire custom event immediately for UI update
      window.dispatchEvent(new CustomEvent('waterUpdated', { 
        detail: { glasses: newWaterTotal } 
      }));
      
      // Try to update database if authenticated, but don't block on it
      if (user?.id) {
        try {
          await apiRequest('POST', '/api/daily-stats', {
            waterGlasses: newWaterTotal,
            date: getLocalDateKey()
          });
          console.log('✅ Water consumption synced to database');
          queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
        } catch (error) {
          console.warn('⚠️ Failed to sync water to database (will retry later):', error);
        }
      } else {
        console.log('ℹ️ Water saved locally (user not authenticated)');
      }
    }
    
    return newEntry;
  }, [logCaloriesMutation, queryClient, user]);

  // Get today's calculated calories
  const getTodaysCalories = useCallback(() => {
    const today = getLocalDateKey();
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