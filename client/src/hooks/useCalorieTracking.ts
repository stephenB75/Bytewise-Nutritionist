/**
 * Hook for tracking calories calculated and communicating with logger
 * Manages daily calorie tracking and communication between calculator and logger
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
  const currentDateRef = useRef(getLocalDateKey());
  
  // Use data persistence for automatic saving (limited to avoid quota errors)
  useDataPersistence({
    key: 'calculatedCalories',
    data: calculatedCalories,
    syncToDatabase: true,
    debounceMs: 2000
  });
  
  // Clear yesterday's logged meals when a new day starts
  const clearYesterdaysEntries = useCallback(() => {
    const today = getLocalDateKey();
    console.log('🔄 Daily reset: keeping only today\'s entries for new day:', today);
    
    // Keep only today's entries from calculatedCalories (clears all previous days)
    setCalculatedCalories(prev => {
      const todaysEntries = prev.filter(entry => entry.date === today);
      
      // Recalculate daily total from filtered entries
      const newDailyTotal = todaysEntries.reduce((sum, entry) => sum + entry.calories, 0);
      setDailyTotal(newDailyTotal);
      
      return todaysEntries;
    });
    
    // Update localStorage to keep only today's entries
    try {
      const stored = localStorage.getItem('calculatedCalories');
      if (stored) {
        const existing = JSON.parse(stored);
        const todaysEntries = existing.filter((entry: CalculatedCalories) => entry.date === today);
        localStorage.setItem('calculatedCalories', JSON.stringify(todaysEntries));
        console.log(`🧹 Cleaned storage: kept ${todaysEntries.length} entries for ${today}`);
      }
    } catch (error) {
      console.warn('Failed to clear yesterday\'s entries from localStorage:', error);
    }
    
    // Dispatch event for any components listening for meal data updates
    window.dispatchEvent(new CustomEvent('dailyMealsReset', { 
      detail: { date: today } 
    }));
  }, []);

  // Set up daily reset timer - checks every minute for date change
  useEffect(() => {
    const checkForDateChange = () => {
      const today = getLocalDateKey();
      if (today !== currentDateRef.current) {
        console.log('🌅 New day detected, resetting logged meals:', {
          previousDate: currentDateRef.current,
          newDate: today
        });
        currentDateRef.current = today;
        clearYesterdaysEntries();
      }
    };

    // Check immediately on mount
    checkForDateChange();
    
    // Set up interval to check every minute (60000ms)
    const interval = setInterval(checkForDateChange, 60000);
    
    return () => clearInterval(interval);
  }, [clearYesterdaysEntries]);

  // Load persisted data on mount with quota error handling and auto-prune old entries
  useEffect(() => {
    try {
      const stored = localStorage.getItem('calculatedCalories');
      if (stored) {
        const loaded = JSON.parse(stored);
        if (loaded && Array.isArray(loaded)) {
          const today = getLocalDateKey();
          
          // Filter to only today's entries on cold start (auto-prune old entries)
          const todaysEntries = loaded.filter((entry: CalculatedCalories) => entry.date === today);
          
          // Update state with only today's entries
          setCalculatedCalories(todaysEntries);
          
          // Calculate daily total from today's entries
          const todaysTotal = todaysEntries.reduce((sum: number, entry: CalculatedCalories) => sum + entry.calories, 0);
          setDailyTotal(todaysTotal);
          
          // If we pruned any entries, update localStorage to remove old entries
          if (todaysEntries.length !== loaded.length) {
            localStorage.setItem('calculatedCalories', JSON.stringify(todaysEntries));
            console.log(`🧹 Cold start cleanup: pruned ${loaded.length - todaysEntries.length} old entries, kept ${todaysEntries.length} for ${today}`);
            
            // Dispatch event to notify other components of the cleanup
            window.dispatchEvent(new CustomEvent('dailyMealsReset', { 
              detail: { date: today, coldStart: true } 
            }));
          }
          
          // Update the current date ref to prevent immediate re-check
          currentDateRef.current = today;
        }
      }
    } catch (error) {
      console.warn('Failed to load calculated calories from localStorage:', error);
    }
  }, []);

  // Log calories to meals (for weekly logger) - save to database and localStorage
  const logCaloriesMutation = useMutation({
    mutationFn: async (calorieEntry: CalculatedCalories) => {
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
      
      // Store in localStorage for instant feedback
      const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      weeklyMeals.push(mealEntry);
      localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
      
      // Save to database if authenticated
      if (user?.id) {
        try {
          const response = await apiRequest('POST', '/api/meals/logged', {
            name: calorieEntry.name,
            mealType: getMealTypeByTime(),
            date: calorieEntry.date,
            totalCalories: calorieEntry.calories,
            totalProtein: calorieEntry.protein,
            totalCarbs: calorieEntry.carbs,
            totalFat: calorieEntry.fat,
            fiber: calorieEntry.fiber || 0,
            sugar: calorieEntry.sugar || 0,
            sodium: calorieEntry.sodium || 0
          });
          console.log('✅ Meal synced to database:', response);
          
          // Fire event for meal data reload
          window.dispatchEvent(new CustomEvent('reload-meal-data'));
        } catch (error) {
          console.warn('⚠️ Failed to sync meal to database (saved locally):', error);
        }
      } else {
        console.log('ℹ️ Meal saved locally (user not authenticated)');
      }
      
      return mealEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyMeals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
      // Force refetch of user stats
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/daily-stats`] });
      }
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
          queryClient.invalidateQueries({ queryKey: ['/api/daily-stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
          if (user?.id) {
            queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/daily-stats`] });
          }
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