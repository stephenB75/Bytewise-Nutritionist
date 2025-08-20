// Debug script to analyze actual meal timestamps and dates
console.log('🔍 ANALYZING ACTUAL MEAL DATES AND TIMESTAMPS');

const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log(`📊 Total meals: ${meals.length}`);

// Show first 10 meals with their actual timestamps and current dates
console.log('📅 FIRST 10 MEALS - TIMESTAMP vs CURRENT DATE:');
meals.slice(0, 10).forEach((meal, i) => {
  const timestamp = meal.timestamp;
  const currentDate = meal.date;
  const timestampDate = timestamp ? timestamp.split('T')[0] : 'NO_TIMESTAMP';
  
  console.log(`${i+1}. "${meal.name}"`);
  console.log(`   Current date: ${currentDate}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   Timestamp date: ${timestampDate}`);
  console.log(`   Matches: ${currentDate === timestampDate ? '✅' : '❌'}`);
  console.log('');
});

// Check today's date and how many meals are incorrectly assigned to today
const today = new Date().toISOString().split('T')[0];
console.log(`📅 Today: ${today}`);

const mealsOnToday = meals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === today;
});

console.log(`📊 Meals currently on today (${today}): ${mealsOnToday.length}`);

// Check how many actually belong to today based on timestamp
const actuallyFromToday = mealsOnToday.filter(meal => {
  if (!meal.timestamp) return false;
  return meal.timestamp.split('T')[0] === today;
});

console.log(`📊 Meals that actually belong to today: ${actuallyFromToday.length}`);
console.log(`🚨 Meals incorrectly on today: ${mealsOnToday.length - actuallyFromToday.length}`);

// Show date distribution by timestamp
const timestampDistribution = {};
meals.forEach(meal => {
  if (meal.timestamp) {
    const date = meal.timestamp.split('T')[0];
    timestampDistribution[date] = (timestampDistribution[date] || 0) + 1;
  }
});

console.log('📊 ACTUAL DISTRIBUTION BY TIMESTAMP:');
Object.keys(timestampDistribution).sort().forEach(date => {
  console.log(`  ${date}: ${timestampDistribution[date]} meals`);
});