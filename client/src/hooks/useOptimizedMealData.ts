/**
 * Optimized Meal Data Hook
 * Provides cached and memoized meal data operations for better performance
 */

import { useMemo, useCallback } from 'react';
import { getCachedLocalStorage, memoize } from '@/utils/performanceUtils';
import { getLocalDateKey, getWeekDates } from '@/utils/dateUtils';

interface MealData {
  id: string;
  name: string;
  date: string;
  timestamp: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: any;
}

// Memoized function to parse meal data
const getMealData = memoize(
  (data: string): MealData[] => {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  (data: string) => data.slice(0, 100) // Cache key based on first 100 chars
);

// Memoized function to filter meals by date
const filterMealsByDate = memoize(
  (meals: MealData[], targetDate: string): MealData[] => {
    return meals.filter(meal => meal.date === targetDate);
  },
  (meals: MealData[], targetDate: string) => `${meals.length}-${targetDate}`
);

// Memoized function to calculate daily totals
const calculateDailyTotals = memoize(
  (meals: MealData[]): { calories: number; protein: number; carbs: number; fat: number } => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fat: totals.fat + (meal.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },
  (meals: MealData[]) => `${meals.length}-${meals.map(m => m.id).join(',')}`
);

export function useOptimizedMealData() {
  // Get cached meal data with 10-second TTL
  const allMeals = useMemo(() => {
    const data = getCachedLocalStorage('weeklyMeals', 10000) || [];
    return getMealData(JSON.stringify(data));
  }, []);

  // Get today's meals efficiently
  const getTodaysMeals = useCallback(() => {
    const today = getLocalDateKey();
    return filterMealsByDate(allMeals, today);
  }, [allMeals]);

  // Get this week's meals efficiently
  const getWeeklyMeals = useCallback(() => {
    const weekDates = getWeekDates();
    const weekDateKeys = weekDates.map(date => getLocalDateKey(date));
    
    return allMeals.filter(meal => weekDateKeys.includes(meal.date));
  }, [allMeals]);

  // Calculate daily nutritional totals
  const getDailyTotals = useCallback((date?: string) => {
    const targetDate = date || getLocalDateKey();
    const dayMeals = filterMealsByDate(allMeals, targetDate);
    return calculateDailyTotals(dayMeals);
  }, [allMeals]);

  // Calculate weekly nutritional totals
  const getWeeklyTotals = useCallback(() => {
    const weekMeals = getWeeklyMeals();
    return calculateDailyTotals(weekMeals);
  }, [getWeeklyMeals]);

  // Get meals grouped by date for the current week
  const getWeeklyMealsGrouped = useCallback(() => {
    const weekDates = getWeekDates();
    const weekDateKeys = weekDates.map(date => getLocalDateKey(date));
    
    return weekDateKeys.reduce((grouped, dateKey) => {
      grouped[dateKey] = filterMealsByDate(allMeals, dateKey);
      return grouped;
    }, {} as Record<string, MealData[]>);
  }, [allMeals]);

  return {
    allMeals,
    getTodaysMeals,
    getWeeklyMeals,
    getDailyTotals,
    getWeeklyTotals,
    getWeeklyMealsGrouped
  };
}