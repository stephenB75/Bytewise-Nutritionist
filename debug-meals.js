// Debug script to check meal data structure
console.log('=== MEAL DATA DEBUG ===');

// Check localStorage data
const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log('Total meals in storage:', weeklyMeals.length);

if (weeklyMeals.length > 0) {
  console.log('First meal structure:', weeklyMeals[0]);
  console.log('Meal IDs:', weeklyMeals.map(m => m.id));
  console.log('Meal dates:', weeklyMeals.map(m => m.date));
  console.log('Meal names:', weeklyMeals.map(m => m.name));
} else {
  console.log('No meals found in localStorage');
}

// Check current date
const today = new Date();
console.log('Current date:', today.toISOString().split('T')[0]);

// Add a test meal if none exist
if (weeklyMeals.length === 0) {
  const testMeal = {
    id: `test-${Date.now()}`,
    name: 'Test Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    date: today.toISOString().split('T')[0],
    time: today.toLocaleTimeString(),
    mealType: 'snack',
    source: 'test'
  };
  
  weeklyMeals.push(testMeal);
  localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
  console.log('Added test meal:', testMeal);
  
  // Refresh the page to show the test meal
  setTimeout(() => window.location.reload(), 1000);
}