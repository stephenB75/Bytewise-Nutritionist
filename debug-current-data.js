// Debug current localStorage data to understand the issue
console.log('=== Current Data Debug ===');

const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`Total meals: ${weeklyMeals.length}`);
console.log(`Today's date: ${today}`);

// Analyze first 10 meals in detail
console.log('\n=== First 10 Meals Analysis ===');
weeklyMeals.slice(0, 10).forEach((meal, i) => {
  console.log(`\nMeal ${i + 1}: ${meal.name}`);
  console.log(`  date: ${meal.date}`);
  console.log(`  timestamp: ${meal.timestamp}`);
  console.log(`  time: ${meal.time}`);
  console.log(`  calories: ${meal.calories}`);
  
  // Extract dates for comparison
  let extractedDate = 'unknown';
  if (meal.timestamp) {
    extractedDate = meal.timestamp.split('T')[0];
  } else if (meal.date && meal.date.includes('T')) {
    extractedDate = meal.date.split('T')[0];
  } else if (meal.date) {
    extractedDate = meal.date;
  }
  
  console.log(`  extracted date: ${extractedDate}`);
  console.log(`  matches today: ${extractedDate === today}`);
});

// Count meals by actual timestamp date vs stored date
const byTimestampDate = {};
const byStoredDate = {};

weeklyMeals.forEach(meal => {
  // By timestamp
  if (meal.timestamp) {
    const tsDate = meal.timestamp.split('T')[0];
    byTimestampDate[tsDate] = (byTimestampDate[tsDate] || 0) + 1;
  }
  
  // By stored date
  let storedDate = meal.date;
  if (meal.date && meal.date.includes('T')) {
    storedDate = meal.date.split('T')[0];
  }
  if (storedDate) {
    byStoredDate[storedDate] = (byStoredDate[storedDate] || 0) + 1;
  }
});

console.log('\n=== Distribution by Timestamp Date ===');
Object.keys(byTimestampDate).sort().forEach(date => {
  console.log(`${date}: ${byTimestampDate[date]} meals`);
});

console.log('\n=== Distribution by Stored Date ===');
Object.keys(byStoredDate).sort().forEach(date => {
  console.log(`${date}: ${byStoredDate[date]} meals`);
});

console.log('\n=== Summary ===');
console.log(`Unique timestamp dates: ${Object.keys(byTimestampDate).length}`);
console.log(`Unique stored dates: ${Object.keys(byStoredDate).length}`);
console.log(`All stored dates are today: ${Object.keys(byStoredDate).length === 1 && Object.keys(byStoredDate)[0] === today}`);