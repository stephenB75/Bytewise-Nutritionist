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
 */
function getCorrectDateFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check for meal date mismatches
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
    console.error('Error checking meal dates:', error);
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
          console.log(`Fixing meal: "${meal.name}" from ${meal.date} to ${correctDate}`);
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
    console.error('Error fixing meal dates:', error);
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

/**
 * Auto-fix meal dates if mismatches are detected
 */
export function autoFixMealDatesIfNeeded(): boolean {
  console.log('🔍 Checking for meal date mismatches...');
  
  if (needsMealDateFix()) {
    console.log('📅 Date mismatches detected, applying fixes...');
    const result = fixMealDateMismatches();
    if (result.success && result.fixedCount > 0) {
      console.log(`✅ Auto-fixed ${result.fixedCount} meal date(s)`);
      return true;
    } else {
      console.log('❌ Failed to fix meal dates:', result.error);
    }
  } else {
    console.log('✅ All meal dates are already correct');
  }
  return false;
}