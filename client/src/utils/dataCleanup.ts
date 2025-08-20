/**
 * Data cleanup utilities to fix corrupted meal data
 * Removes invalid entries and fixes date formatting issues
 */

import { getLocalDateKey } from './dateUtils';

interface MealEntry {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date: string;
  time?: string;
  timestamp?: string;
}

/**
 * Clean up corrupted meal data in localStorage
 * Removes entries with invalid calories, dates, or missing data
 */
export function cleanupCorruptedMealData(): {
  originalCount: number;
  cleanedCount: number;
  removedCount: number;
} {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    const originalCount = storedMeals.length;
    
    if (originalCount === 0) {
      return { originalCount: 0, cleanedCount: 0, removedCount: 0 };
    }
    
    // Filter out corrupted entries
    const validMeals: MealEntry[] = storedMeals.filter((meal: any) => {
      // Must have name and date
      if (!meal.name || !meal.date) return false;
      
      // Validate calorie range (realistic values only)
      const calories = Number(meal.calories) || 0;
      if (calories < 0 || calories > 5000) {
        console.log(`🗑️ Removing meal "${meal.name}" with invalid calories: ${calories}`);
        return false;
      }
      
      // Validate date format
      let mealDate = meal.date;
      if (mealDate && mealDate.includes('T')) {
        mealDate = mealDate.split('T')[0];
      }
      
      // Check if date is valid YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(mealDate)) {
        console.log(`🗑️ Removing meal "${meal.name}" with invalid date: ${meal.date}`);
        return false;
      }
      
      // Check if date is reasonable (not too old or in future)
      const today = new Date();
      const mealDateObj = new Date(mealDate + 'T12:00:00');
      const sixtyDaysAgo = new Date(today.getTime() - (60 * 24 * 60 * 60 * 1000));
      const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
      
      if (mealDateObj < sixtyDaysAgo || mealDateObj > tomorrow) {
        console.log(`🗑️ Removing meal "${meal.name}" with unrealistic date: ${mealDate}`);
        return false;
      }
      
      return true;
    }).map((meal: any) => {
      // Normalize the meal data
      let mealDate = meal.date;
      if (mealDate && mealDate.includes('T')) {
        mealDate = mealDate.split('T')[0];
      }
      
      return {
        ...meal,
        date: mealDate, // Ensure date is in YYYY-MM-DD format
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0
      };
    });
    
    // Save cleaned data back to localStorage
    localStorage.setItem('weeklyMeals', JSON.stringify(validMeals));
    
    const cleanedCount = validMeals.length;
    const removedCount = originalCount - cleanedCount;
    
    if (removedCount > 0) {
      console.log(`🧹 Data cleanup completed: Removed ${removedCount} corrupted entries, kept ${cleanedCount} valid meals`);
    }
    
    return { originalCount, cleanedCount, removedCount };
    
  } catch (error) {
    console.error('Error during data cleanup:', error);
    return { originalCount: 0, cleanedCount: 0, removedCount: 0 };
  }
}

/**
 * Reset all meal data (emergency cleanup)
 * Use this to completely clear corrupted data
 */
export function emergencyDataReset(): boolean {
  try {
    localStorage.removeItem('weeklyMeals');
    localStorage.removeItem('calculatedCalories');
    localStorage.removeItem('lastDataCleanup');
    
    console.log('🚨 Emergency data reset completed - all meal data cleared');
    return true;
  } catch (error) {
    console.error('Error during emergency reset:', error);
    return false;
  }
}

/**
 * Get data statistics for debugging
 */
export function getMealDataStats(): {
  totalMeals: number;
  dateRange: string[];
  todayMeals: number;
  totalCaloriesToday: number;
  averageCaloriesPerMeal: number;
} {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    const today = getLocalDateKey();
    
    const dates = new Set<string>();
    let todayMeals = 0;
    let totalCaloriesToday = 0;
    let totalCalories = 0;
    
    storedMeals.forEach((meal: any) => {
      let mealDate = meal.date;
      if (mealDate && mealDate.includes('T')) {
        mealDate = mealDate.split('T')[0];
      }
      
      if (mealDate) dates.add(mealDate);
      
      const calories = Number(meal.calories) || 0;
      totalCalories += calories;
      
      if (mealDate === today) {
        todayMeals++;
        totalCaloriesToday += calories;
      }
    });
    
    return {
      totalMeals: storedMeals.length,
      dateRange: Array.from(dates).sort(),
      todayMeals,
      totalCaloriesToday,
      averageCaloriesPerMeal: storedMeals.length > 0 ? Math.round(totalCalories / storedMeals.length) : 0
    };
  } catch (error) {
    console.error('Error getting meal stats:', error);
    return {
      totalMeals: 0,
      dateRange: [],
      todayMeals: 0,
      totalCaloriesToday: 0,
      averageCaloriesPerMeal: 0
    };
  }
}