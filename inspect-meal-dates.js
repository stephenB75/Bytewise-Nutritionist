// Inspect current meal dates in localStorage
console.log('=== Current Meal Date Inspection ===');

const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log(`Total meals found: ${weeklyMeals.length}`);

// Group meals by date
const mealsByDate = {};
const today = new Date().toISOString().split('T')[0];
console.log(`Today's date: ${today}`);

weeklyMeals.forEach((meal, index) => {
  let mealDate;
  
  if (meal.date) {
    mealDate = meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
  } else if (meal.timestamp) {
    mealDate = meal.timestamp.split('T')[0];
  } else {
    mealDate = 'NO_DATE';
  }
  
  if (!mealsByDate[mealDate]) {
    mealsByDate[mealDate] = [];
  }
  mealsByDate[mealDate].push({
    name: meal.name,
    calories: meal.calories,
    originalDate: meal.date,
    timestamp: meal.timestamp
  });
});

// Display meals by date
Object.keys(mealsByDate).sort().forEach(date => {
  const meals = mealsByDate[date];
  const totalCals = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  console.log(`\n📅 ${date} (${meals.length} meals, ${totalCals} cal):`);
  
  meals.slice(0, 3).forEach((meal, i) => {
    console.log(`  ${i + 1}. ${meal.name} - ${meal.calories} cal`);
    console.log(`     Original date: ${meal.originalDate}`);
    console.log(`     Timestamp: ${meal.timestamp}`);
  });
  
  if (meals.length > 3) {
    console.log(`  ... and ${meals.length - 3} more meals`);
  }
});

console.log('\n=== Summary ===');
console.log(`Dates with meals: ${Object.keys(mealsByDate).length}`);
console.log(`Today's meals: ${mealsByDate[today]?.length || 0}`);
console.log(`Total calories today: ${mealsByDate[today]?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0}`);