// INSTANT RECOVERY - Run this immediately in browser console
console.log('🚨 INSTANT MEAL DATE RECOVERY');

const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`Found ${meals.length} meals to process`);
console.log(`Today: ${today}`);

// Check current distribution
const currentDist = {};
meals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  currentDist[date] = (currentDist[date] || 0) + 1;
});

console.log('Current distribution:');
Object.keys(currentDist).sort().forEach(date => {
  console.log(`  ${date}: ${currentDist[date]} meals`);
});

// Force recovery
let fixed = 0;
const fixedMeals = meals.map(meal => {
  if (!meal.timestamp) return meal;
  
  const correctDate = meal.timestamp.split('T')[0];
  let currentDate = meal.date;
  if (meal.date && meal.date.includes('T')) {
    currentDate = meal.date.split('T')[0];
  }
  
  if (currentDate !== correctDate) {
    fixed++;
    if (fixed <= 5) {
      console.log(`${fixed}. "${meal.name}": ${currentDate} → ${correctDate}`);
    }
    return { ...meal, date: correctDate };
  }
  return meal;
});

if (fixed > 0) {
  localStorage.setItem('weeklyMeals', JSON.stringify(fixedMeals));
  
  // Show new distribution
  const newDist = {};
  fixedMeals.forEach(meal => {
    let date = meal.date;
    if (date && date.includes('T')) date = date.split('T')[0];
    newDist[date] = (newDist[date] || 0) + 1;
  });
  
  console.log(`\n✅ FIXED ${fixed} meals!`);
  console.log('New distribution:');
  Object.keys(newDist).sort().forEach(date => {
    console.log(`  ${date}: ${newDist[date]} meals`);
  });
  
  window.location.reload();
} else {
  console.log('No meals needed fixing');
}