// Simple debug to check current state
const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log('Total meals:', meals.length);

if (meals.length > 0) {
  const first = meals[0];
  console.log('First meal:', {
    name: first.name,
    date: first.date,
    timestamp: first.timestamp,
    calories: first.calories
  });
  
  const today = new Date().toISOString().split('T')[0];
  console.log('Today:', today);
  
  // Count by dates
  const byDate = {};
  meals.forEach(meal => {
    let date = meal.date;
    if (date && date.includes('T')) {
      date = date.split('T')[0];
    }
    byDate[date] = (byDate[date] || 0) + 1;
  });
  
  console.log('Meals by date:');
  Object.keys(byDate).sort().forEach(date => {
    console.log(`  ${date}: ${byDate[date]} meals`);
  });
}