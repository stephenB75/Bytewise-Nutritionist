// Clear meals from localStorage to test with fresh data
console.log('Clearing meal data from localStorage...');

// Clear the weekly meals
localStorage.removeItem('weeklyMeals');

// Clear any other related storage
localStorage.removeItem('dailyCalories');
localStorage.removeItem('weeklyCalories');

console.log('✅ Meal data cleared successfully!');
console.log('Please refresh the page and log new meals to see properly scaled micronutrients.');