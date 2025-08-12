/**
 * LocalStorage Debugger Utility
 * Helps diagnose data persistence issues
 */

export function debugLocalStorage(): void {
  console.log('=== LocalStorage Debug Report ===');
  
  const keys = [
    'weeklyMeals',
    'calculatedCalories', 
    'weeklyTrackerData',
    'bytewise-weekly-tracker',
    'userProfile',
    'mealHistory',
    'recipeData',
    'waterIntake',
    'achievements',
    'fastingData',
    'weeklyProgress',
    'bytewise_data_backup',
    'bytewise_backup_timestamp'
  ];
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          console.log(`${key}: ${parsed.length} items`);
          if (parsed.length > 0) {
            console.log(`  Latest item:`, parsed[parsed.length - 1]);
          }
        } else if (typeof parsed === 'object') {
          console.log(`${key}:`, Object.keys(parsed));
        } else {
          console.log(`${key}:`, value.substring(0, 100));
        }
      } catch {
        console.log(`${key}: ${value.substring(0, 100)} (raw)`);
      }
    } else {
      console.log(`${key}: NOT FOUND`);
    }
  });
  
  // Check backup status
  const backupTimestamp = localStorage.getItem('bytewise_backup_timestamp');
  if (backupTimestamp) {
    console.log(`Last backup: ${new Date(backupTimestamp).toLocaleString()}`);
  }
  
  console.log('=== End Debug Report ===');
}

// Check for data from specific dates
export function debugDataForDate(dateKey: string): void {
  console.log(`=== Data for ${dateKey} ===`);
  
  // Check calculated calories
  const calories = localStorage.getItem('calculatedCalories');
  if (calories) {
    try {
      const parsed = JSON.parse(calories);
      const forDate = parsed.filter((item: any) => item.date === dateKey);
      console.log(`Calculated calories for ${dateKey}: ${forDate.length} entries`);
      forDate.forEach((item: any) => console.log(`  ${item.name}: ${item.calories} cal`));
    } catch (e) {
      console.log('Error parsing calculated calories:', e);
    }
  }
  
  // Check weekly meals
  const weeklyMeals = localStorage.getItem('weeklyMeals');
  if (weeklyMeals) {
    try {
      const parsed = JSON.parse(weeklyMeals);
      const forDate = parsed.filter((item: any) => item.date === dateKey);
      console.log(`Weekly meals for ${dateKey}: ${forDate.length} entries`);
      forDate.forEach((item: any) => console.log(`  ${item.name}: ${item.calories} cal (${item.time})`));
    } catch (e) {
      console.log('Error parsing weekly meals:', e);
    }
  }
  
  // Check weekly tracker data
  const weeklyData = localStorage.getItem('weeklyTrackerData');
  if (weeklyData) {
    try {
      const parsed = JSON.parse(weeklyData);
      parsed.forEach((week: any) => {
        const dayData = week.days?.find((day: any) => day.date === dateKey);
        if (dayData) {
          console.log(`Weekly tracker for ${dateKey}: ${dayData.meals?.length || 0} meals, ${dayData.totalCalories || 0} calories`);
          dayData.meals?.forEach((meal: any) => console.log(`  ${meal.name}: ${meal.calories} cal`));
        }
      });
    } catch (e) {
      console.log('Error parsing weekly tracker data:', e);
    }
  }
}

// Get yesterday's date in local format
export function getYesterdayDateKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).debugLocalStorage = debugLocalStorage;
  (window as any).debugDataForDate = debugDataForDate;
  (window as any).getYesterdayDateKey = getYesterdayDateKey;
}