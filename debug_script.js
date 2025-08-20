// Debug localStorage to see what's actually stored
console.log('=== DEBUGGING LOCALSTORAGE ===');

// Check all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));

// Check weeklyMeals structure
const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log('weeklyMeals length:', weeklyMeals.length);
console.log('Sample weeklyMeals entries (first 3):');
weeklyMeals.slice(0, 3).forEach((meal, index) => {
  console.log(`  [${index}]:`, {
    name: meal.name,
    date: meal.date,
    calories: meal.calories,
    timestamp: meal.timestamp
  });
});

// Check calculatedCalories structure
const calculatedCalories = JSON.parse(localStorage.getItem('calculatedCalories') || '[]');
console.log('calculatedCalories length:', calculatedCalories.length);
console.log('Sample calculatedCalories entries (first 3):');
calculatedCalories.slice(0, 3).forEach((entry, index) => {
  console.log(`  [${index}]:`, {
    name: entry.name,
    date: entry.date,
    calories: entry.calories,
    time: entry.time
  });
});

// Check what dates are actually in the data
const uniqueDates = [...new Set([
  ...weeklyMeals.map(m => m.date),
  ...calculatedCalories.map(c => c.date)
])].sort();
console.log('Unique dates in data:', uniqueDates);

// Check today's entries specifically
const todayKey = '2025-08-20';
const todayMeals = weeklyMeals.filter(m => m.date === todayKey);
const todayCalories = calculatedCalories.filter(c => c.date === todayKey);
console.log(`Today (${todayKey}) meals:`, todayMeals.length);
console.log(`Today (${todayKey}) calories:`, todayCalories.length);

// Check if entries have different date formats
console.log('Date formats in weeklyMeals:');
weeklyMeals.slice(0, 5).forEach(meal => {
  console.log('  date:', meal.date, 'timestamp:', meal.timestamp);
});
