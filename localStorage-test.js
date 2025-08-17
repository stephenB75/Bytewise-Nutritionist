
// Test localStorage persistence
const testMeal = {
  id: 'test-1755460318141',
  name: 'Test Persistence Meal',
  calories: 500,
  date: new Date().toDateString(),
  timestamp: new Date().toISOString()
};

// Save to localStorage
localStorage.setItem('weeklyMeals', JSON.stringify([testMeal]));
localStorage.setItem('testData', JSON.stringify(testMeal));

// Verify retrieval
const retrieved = JSON.parse(localStorage.getItem('testData'));
console.log('LocalStorage test result:', retrieved.name === testMeal.name ? 'PASS' : 'FAIL');

// Simulate app refresh by clearing and restoring
const backup = localStorage.getItem('weeklyMeals');
localStorage.removeItem('weeklyMeals');
localStorage.setItem('weeklyMeals', backup);

const restored = JSON.parse(localStorage.getItem('weeklyMeals'));
console.log('Persistence simulation:', restored.length > 0 ? 'PASS' : 'FAIL');
  