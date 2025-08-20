// COMPREHENSIVE MEAL CLEARING AND DATABASE SYNC FIX
console.log('=== CLEARING ALL MEAL ENTRIES ===');

// 1. Clear all meal-related localStorage
const mealKeys = [
  'weeklyMeals',
  'calculatedCalories', 
  'dailyStats',
  'mealCache',
  'foodCache',
  'dailyMealCache',
  'todaysMeals',
  'dailyTotal',
  'weeklyTotal',
  'monthlyTotal'
];

let clearedKeys = 0;
mealKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    clearedKeys++;
    console.log(`✅ Cleared: ${key}`);
  }
});

// 2. Clear all date-specific keys
const allKeys = Object.keys(localStorage);
const dateKeys = allKeys.filter(key => 
  key.includes('2025-08') || 
  key.includes('dailyStats_') ||
  key.includes('meal_') ||
  key.includes('calorie_')
);

dateKeys.forEach(key => {
  localStorage.removeItem(key);
  clearedKeys++;
  console.log(`✅ Cleared date key: ${key}`);
});

// 3. Reset any cached data
localStorage.removeItem('lastDataBackup');
localStorage.removeItem('itemsBackedUp');

console.log(`=== CLEARED ${clearedKeys} KEYS TOTAL ===`);
console.log('Refreshing to sync with clean state...');
window.location.reload();
