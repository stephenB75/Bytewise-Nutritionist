/**
 * Data Migration Utility
 * Migrates data between different localStorage formats to ensure compatibility
 */

export function migrateWeeklyMealsToTracker(): boolean {
  try {
    // Get the stored weeklyMeals data
    const weeklyMealsStr = localStorage.getItem('weeklyMeals');
    if (!weeklyMealsStr) {
      return false;
    }

    const weeklyMeals = JSON.parse(weeklyMealsStr);

    // Group meals by week and date
    const weeklyData: any[] = [];
    const weekGroups: { [key: string]: any } = {};

    weeklyMeals.forEach((meal: any) => {
      const mealDate = meal.date ? meal.date.split('T')[0] : new Date().toISOString().split('T')[0];
      const mealDateObj = new Date(mealDate);
      
      // Calculate week start (Sunday)
      const weekStart = new Date(mealDateObj);
      weekStart.setDate(mealDateObj.getDate() - mealDateObj.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = {
          week: weekKey,
          days: []
        };
      }

      // Find or create day entry
      let dayEntry = weekGroups[weekKey].days.find((d: any) => d.date === mealDate);
      if (!dayEntry) {
        dayEntry = {
          date: mealDate,
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
        weekGroups[weekKey].days.push(dayEntry);
      }

      // Convert meal format
      const mealEntry = {
        id: meal.id?.toString() || `migrated-${Date.now()}-${Math.random()}`,
        name: meal.name || 'Unknown Meal',
        calories: parseFloat(meal.totalCalories || meal.calories || '0'),
        protein: parseFloat(meal.totalProtein || meal.protein || '0'),
        carbs: parseFloat(meal.totalCarbs || meal.carbs || '0'),
        fat: parseFloat(meal.totalFat || meal.fat || '0'),
        category: meal.mealType || 'snack',
        timestamp: meal.createdAt || meal.timestamp || new Date().toISOString(),
        source: 'migrated'
      };

      dayEntry.meals.push(mealEntry);
      dayEntry.totalCalories += mealEntry.calories;
      dayEntry.totalProtein += mealEntry.protein;
      dayEntry.totalCarbs += mealEntry.carbs;
      dayEntry.totalFat += mealEntry.fat;
    });

    // Convert to array
    Object.values(weekGroups).forEach(week => weeklyData.push(week));

    // Save migrated data
    localStorage.setItem('weeklyTrackerData', JSON.stringify(weeklyData));

    // Also migrate to calculatedCalories format
    const calculatedCalories = weeklyMeals.map((meal: any) => ({
      id: meal.id?.toString() || `calc-${Date.now()}-${Math.random()}`,
      name: meal.name || 'Unknown Meal',
      calories: parseFloat(meal.totalCalories || meal.calories || '0'),
      protein: parseFloat(meal.totalProtein || meal.protein || '0'),
      carbs: parseFloat(meal.totalCarbs || meal.carbs || '0'),
      fat: parseFloat(meal.totalFat || meal.fat || '0'),
      date: meal.date ? meal.date.split('T')[0] : new Date().toISOString().split('T')[0],
      time: meal.createdAt ? new Date(meal.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
      source: 'migrated'
    }));

    localStorage.setItem('calculatedCalories', JSON.stringify(calculatedCalories));

    return true;
  } catch (error) {
    return false;
  }
}

export function runDataMigration(): boolean {
  
  // Check if migration is needed
  const hasWeeklyMeals = localStorage.getItem('weeklyMeals');
  const hasWeeklyTrackerData = localStorage.getItem('weeklyTrackerData');
  const hasCalculatedCalories = localStorage.getItem('calculatedCalories');

  if (hasWeeklyMeals && (!hasWeeklyTrackerData || !hasCalculatedCalories)) {
    const success = migrateWeeklyMealsToTracker();
    return success;
  } else {
    return false;
  }
}

// Auto-run migration on import if needed
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const migrated = runDataMigration();
    if (migrated) {
    }
  }, 1000);
}