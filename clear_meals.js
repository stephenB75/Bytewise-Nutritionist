// COMPREHENSIVE MEAL CLEARING SCRIPT for stephen75@me.com
// This will clear ALL meal data for today from localStorage

console.log('=== CLEARING ALL MEAL ENTRIES FOR TODAY ===');

const todayKey = '2025-08-20';
let totalCleared = 0;

// 1. Clear weeklyMeals
console.log('1. Clearing weeklyMeals...');
const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const originalMealCount = weeklyMeals.length;
const filteredMeals = weeklyMeals.filter(meal => {
  // Check multiple date formats
  const mealDate = meal.date || meal.dateKey || meal.day;
  return mealDate !== todayKey;
});
localStorage.setItem('weeklyMeals', JSON.stringify(filteredMeals));
const mealsCleared = originalMealCount - filteredMeals.length;
totalCleared += mealsCleared;
console.log(`   Cleared ${mealsCleared} meals from weeklyMeals`);

// 2. Clear calculatedCalories
console.log('2. Clearing calculatedCalories...');
const calculatedCalories = JSON.parse(localStorage.getItem('calculatedCalories') || '[]');
const originalCalorieCount = calculatedCalories.length;
const filteredCalories = calculatedCalories.filter(entry => {
  const entryDate = entry.date || entry.dateKey || entry.day;
  return entryDate !== todayKey;
});
localStorage.setItem('calculatedCalories', JSON.stringify(filteredCalories));
const caloriesCleared = originalCalorieCount - filteredCalories.length;
totalCleared += caloriesCleared;
console.log(`   Cleared ${caloriesCleared} calorie entries`);

// 3. Clear dailyStats for today
console.log('3. Clearing dailyStats...');
const dailyStatsKey = `dailyStats_${todayKey}`;
if (localStorage.getItem(dailyStatsKey)) {
  localStorage.removeItem(dailyStatsKey);
  console.log(`   Cleared dailyStats for ${todayKey}`);
}

// 4. Clear any meal-related keys that might contain today's data
console.log('4. Checking for other meal-related keys...');
const allKeys = Object.keys(localStorage);
const mealKeys = allKeys.filter(key => 
  key.includes('meal') || 
  key.includes('food') || 
  key.includes('calorie') ||
  key.includes(todayKey)
);

mealKeys.forEach(key => {
  if (key.includes(todayKey)) {
    console.log(`   Removing key: ${key}`);
    localStorage.removeItem(key);
  }
});

// 5. Force clear any cached meal data
console.log('5. Clearing cached data...');
['mealCache', 'foodCache', 'dailyMealCache', 'todaysMeals'].forEach(cacheKey => {
  if (localStorage.getItem(cacheKey)) {
    localStorage.removeItem(cacheKey);
    console.log(`   Cleared ${cacheKey}`);
  }
});

console.log(`=== TOTAL ENTRIES CLEARED: ${totalCleared} ===`);
console.log('Refreshing page to show updated data...');

// Force page refresh
window.location.reload();
