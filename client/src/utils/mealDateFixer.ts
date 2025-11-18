/**
 * Meal Date Fixer Utility
 * Automatically detects and corrects meal entries that may be on wrong days
 * due to the old date correction system
 */

export interface MealData {
  id: string;
  name: string;
  date: string;
  timestamp: string;
  time?: string;
  calories: number;
  [key: string]: any;
}

export interface DateMismatch {
  meal: string;
  storedDate: string;
  actualDate: string;
  timestamp: string;
  time?: string;
}

/**
 * Get correct date key from timestamp
 * Fixed to use browser timezone detection matching getLocalDateKey
 */
function getCorrectDateFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  
  // Use the same timezone-aware logic as getLocalDateKey
  try {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    });
    
    return formatter.format(date); // Returns YYYY-MM-DD format
  } catch (error) {
    // Fallback to offset-based calculation if Intl API fails
    const offsetMinutes = date.getTimezoneOffset();
    const localTime = new Date(date.getTime() - (offsetMinutes * 60 * 1000));
    
    const year = localTime.getUTCFullYear();
    const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localTime.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

/**
 * Check for meal date mismatches (optimized version)
 */
export function checkMealDateMismatches(): {
  mismatches: DateMismatch[];
  totalMeals: number;
  correctMeals: number;
} {
  try {
    const weeklyMealsData = localStorage.getItem('weeklyMeals');
    if (!weeklyMealsData) {
      return { mismatches: [], totalMeals: 0, correctMeals: 0 };
    }

    const meals: MealData[] = JSON.parse(weeklyMealsData);
    const mismatches: DateMismatch[] = [];

    // Optimized: Early exit if no meals
    if (meals.length === 0) {
      return { mismatches: [], totalMeals: 0, correctMeals: 0 };
    }

    // Process meals efficiently
    meals.forEach(meal => {
      if (meal.timestamp) {
        const correctDate = getCorrectDateFromTimestamp(meal.timestamp);
        if (meal.date !== correctDate) {
          mismatches.push({
            meal: meal.name,
            storedDate: meal.date,
            actualDate: correctDate,
            timestamp: meal.timestamp,
            time: meal.time
          });
        }
      }
    });

    return {
      mismatches,
      totalMeals: meals.length,
      correctMeals: meals.length - mismatches.length
    };
  } catch (error) {

    return { mismatches: [], totalMeals: 0, correctMeals: 0 };
  }
}

/**
 * Fix meal date mismatches automatically
 */
export function fixMealDateMismatches(): {
  fixedCount: number;
  success: boolean;
  error?: string;
} {
  try {
    const weeklyMealsData = localStorage.getItem('weeklyMeals');
    if (!weeklyMealsData) {
      return { fixedCount: 0, success: true };
    }

    const meals: MealData[] = JSON.parse(weeklyMealsData);
    let fixedCount = 0;

    const fixedMeals = meals.map(meal => {
      if (meal.timestamp) {
        const correctDate = getCorrectDateFromTimestamp(meal.timestamp);
        if (meal.date !== correctDate) {

          fixedCount++;
          return { ...meal, date: correctDate };
        }
      }
      return meal;
    });

    if (fixedCount > 0) {
      localStorage.setItem('weeklyMeals', JSON.stringify(fixedMeals));
      
      // Trigger refresh events
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      window.dispatchEvent(new CustomEvent('calories-logged'));
      window.dispatchEvent(new CustomEvent('meals-updated'));
    }

    return { fixedCount, success: true };
  } catch (error) {

    return { 
      fixedCount: 0, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get meal summary by actual dates (corrected)
 */
export function getMealSummaryByCorrectDates(): Record<string, MealData[]> {
  try {
    const weeklyMealsData = localStorage.getItem('weeklyMeals');
    if (!weeklyMealsData) {
      return {};
    }

    const meals: MealData[] = JSON.parse(weeklyMealsData);
    const summary: Record<string, MealData[]> = {};

    meals.forEach(meal => {
      const correctDate = meal.timestamp ? 
        getCorrectDateFromTimestamp(meal.timestamp) : 
        meal.date;
      
      if (!summary[correctDate]) {
        summary[correctDate] = [];
      }
      
      summary[correctDate].push({
        ...meal,
        date: correctDate // Use corrected date
      });
    });

    return summary;
  } catch (error) {
    console.error('Error getting meal summary:', error);
    return {};
  }
}

/**
 * Check if meal date fixes are needed
 */
export function needsMealDateFix(): boolean {
  const check = checkMealDateMismatches();
  return check.mismatches.length > 0;
}

// Performance optimization: Cache the last check to prevent excessive checking
let lastCheckTime = 0;
let lastDataHash = '';
const CHECK_COOLDOWN = 30000; // 30 seconds minimum between checks

/**
 * Get hash of current meal data to detect changes
 */
function getMealDataHash(): string {
  try {
    const weeklyMeals = localStorage.getItem('weeklyMeals') || '[]';
    return btoa(weeklyMeals).slice(0, 16); // Simple hash of data
  } catch {
    return '';
  }
}

/**
 * Auto-fix meal dates if mismatches are detected (optimized with caching)
 */
export function autoFixMealDatesIfNeeded(): boolean {
  const now = Date.now();
  const currentDataHash = getMealDataHash();
  
  // Skip check if:
  // 1. Recently checked (within cooldown period)
  // 2. Data hasn't changed since last check
  if (now - lastCheckTime < CHECK_COOLDOWN && currentDataHash === lastDataHash) {
    return false;
  }
  
  // Silent operation for production
  lastCheckTime = now;
  lastDataHash = currentDataHash;
  
  if (needsMealDateFix()) {
    const result = fixMealDateMismatches();
    if (result.success && result.fixedCount > 0) {
      lastDataHash = getMealDataHash(); // Update hash after fixes
      return true;
    }
  }
  return false;
}