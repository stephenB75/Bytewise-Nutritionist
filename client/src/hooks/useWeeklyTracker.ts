/**
 * Weekly Tracker Hook
 * 
 * Manages weekly nutrition tracking functionality with local storage persistence
 */

import { useState, useEffect, useCallback } from 'react';

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
  source: 'calculator' | 'manual';
}

interface DayData {
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  target: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface WeeklyData {
  week: string;
  days: DayData[];
}

export function useWeeklyTracker() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [currentWeek, setCurrentWeek] = useState<string>('');

  // Initialize weekly tracker
  useEffect(() => {
    const stored = localStorage.getItem('bytewise-weekly-tracker');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setWeeklyData(data);
      } catch (error) {
        // Failed to parse weekly tracker data
      }
    }

    // Set current week
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    setCurrentWeek(startOfWeek.toISOString().split('T')[0]);

    // Listen for logged entries from calculator
    const handleCaloriesLogged = (event: CustomEvent) => {
      const data = event.detail;
      if (data.source === 'calculator') {
        logMealEntry({
          id: `calc-${Date.now()}`,
          name: data.name,
          calories: data.calories,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fat || 0,
          category: data.mealType || 'snack',
          timestamp: data.timestamp,
          source: 'calculator'
        });
      }
    };

    window.addEventListener('calories-logged', handleCaloriesLogged as EventListener);
    return () => {
      window.removeEventListener('calories-logged', handleCaloriesLogged as EventListener);
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('bytewise-weekly-tracker', JSON.stringify(weeklyData));
  }, [weeklyData]);

  const logMealEntry = useCallback((entry: MealEntry) => {
    const today = new Date().toISOString().split('T')[0];
    
    setWeeklyData(prev => {
      const updated = [...prev];
      let currentWeekData = updated.find(w => w.week === currentWeek);
      
      if (!currentWeekData) {
        currentWeekData = {
          week: currentWeek,
          days: []
        };
        updated.push(currentWeekData);
      }

      let dayData = currentWeekData.days.find(d => d.date === today);
      if (!dayData) {
        dayData = {
          date: today,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          target: {
            calories: 2000,
            protein: 120,
            carbs: 250,
            fat: 67
          }
        };
        currentWeekData.days.push(dayData);
      }

      // Add meal and update totals
      dayData.meals.push(entry);
      dayData.totalCalories += entry.calories;
      dayData.totalProtein += entry.protein;
      dayData.totalCarbs += entry.carbs;
      dayData.totalFat += entry.fat;

      return updated;
    });

    // Show success notification
    const toastEvent = new CustomEvent('show-toast', {
      detail: { 
        message: `Successfully logged ${entry.name} to ${entry.category}!`,
        type: 'success' 
      }
    });
    window.dispatchEvent(toastEvent);

  }, [currentWeek]);

  const getCurrentWeekData = useCallback(() => {
    return weeklyData.find(w => w.week === currentWeek);
  }, [weeklyData, currentWeek]);

  const getTodayData = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentWeekData = getCurrentWeekData();
    return currentWeekData?.days.find(d => d.date === today);
  }, [getCurrentWeekData]);

  const getWeeklyStats = useCallback(() => {
    const currentWeekData = getCurrentWeekData();
    if (!currentWeekData) return null;

    const totalMeals = currentWeekData.days.reduce((sum, day) => sum + day.meals.length, 0);
    const avgCalories = currentWeekData.days.length > 0 
      ? currentWeekData.days.reduce((sum, day) => sum + day.totalCalories, 0) / currentWeekData.days.length
      : 0;

    return {
      totalMeals,
      avgCalories: Math.round(avgCalories),
      daysWithMeals: currentWeekData.days.filter(d => d.meals.length > 0).length,
      currentStreak: getCurrentStreak()
    };
  }, [getCurrentWeekData]);

  const getCurrentStreak = useCallback(() => {
    // Simple streak calculation - days with at least one meal
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasData = weeklyData.some(week => 
        week.days.some(day => day.date === dateStr && day.meals.length > 0)
      );
      
      if (hasData) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [weeklyData]);

  return {
    logMealEntry,
    getCurrentWeekData,
    getTodayData,
    getWeeklyStats,
    weeklyData,
    currentWeek
  };
}