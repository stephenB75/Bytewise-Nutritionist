// Force recovery of meal dates - run this in browser console
console.log('=== FORCE MEAL RECOVERY ===');

const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`Found ${weeklyMeals.length} meals to process`);

let recoveredCount = 0;
const recoveredMeals = weeklyMeals.map((meal, index) => {
  if (!meal.timestamp) {
    console.log(`Meal ${index + 1} has no timestamp, keeping as-is`);
    return meal;
  }
  
  const timestampDate = meal.timestamp.split('T')[0];
  let currentDate = meal.date;
  
  if (meal.date && meal.date.includes('T')) {
    currentDate = meal.date.split('T')[0];
  }
  
  if (currentDate !== timestampDate) {
    recoveredCount++;
    if (recoveredCount <= 10) {
      console.log(`${recoveredCount}. "${meal.name}": ${currentDate} → ${timestampDate}`);
    }
    
    return {
      ...meal,
      date: timestampDate
    };
  }
  
  return meal;
});

if (recoveredCount > 0) {
  localStorage.setItem('weeklyMeals', JSON.stringify(recoveredMeals));
  
  // Show final distribution
  const finalDistribution = {};
  recoveredMeals.forEach(meal => {
    let date = meal.date;
    if (date && date.includes('T')) {
      date = date.split('T')[0];
    }
    if (date) {
      finalDistribution[date] = (finalDistribution[date] || 0) + 1;
    }
  });
  
  console.log(`\n✅ RECOVERY COMPLETE: ${recoveredCount} meals restored`);
  console.log('\n📊 Final distribution:');
  Object.keys(finalDistribution).sort().forEach(date => {
    const count = finalDistribution[date];
    const isToday = date === today;
    console.log(`${date}: ${count} meals ${isToday ? '(TODAY)' : ''}`);
  });
  
  console.log('\n🔄 Refreshing page to show changes...');
  window.location.reload();
} else {
  console.log('No meals needed recovery');
}