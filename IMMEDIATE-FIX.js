// COPY AND PASTE THIS INTO YOUR BROWSER CONSOLE (F12) WHILE ON THE APP
// This will immediately fix all historical meal dates

console.log('🚨 IMMEDIATE HISTORICAL DATE FIX');
console.log('================================');

// Get all meals from localStorage
const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`📊 Total meals found: ${meals.length}`);
console.log(`📅 Today's date: ${today}`);

// Check current situation
const currentlyOnToday = meals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === today;
});

console.log(`🚨 Currently on today: ${currentlyOnToday.length} meals`);

// FIX: Move meals to their correct historical dates
let fixed = 0;
const correctedMeals = meals.map(meal => {
  // Fix unrealistic calories first
  if (meal.calories && meal.calories > 5000) {
    meal.calories = 200; // Reasonable default
  }
  
  // Use timestamp to place on correct date
  if (meal.timestamp) {
    const correctDate = meal.timestamp.split('T')[0];
    let currentDate = meal.date;
    
    if (currentDate && currentDate.includes('T')) {
      currentDate = currentDate.split('T')[0];
    }
    
    if (currentDate !== correctDate) {
      console.log(`📅 ${++fixed}. "${meal.name}": ${currentDate} → ${correctDate}`);
      meal.date = correctDate;
    }
  }
  
  return meal;
});

// Save the corrected data
localStorage.setItem('weeklyMeals', JSON.stringify(correctedMeals));

// Verify results
const afterFix = correctedMeals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === today;
});

console.log(`\n✅ FIXED ${fixed} meals`);
console.log(`Before: ${currentlyOnToday.length} meals on today`);
console.log(`After: ${afterFix.length} meals on today`);

// Show final distribution
const distribution = {};
correctedMeals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  if (date) {
    distribution[date] = (distribution[date] || 0) + 1;
  }
});

console.log('\n📊 FINAL DISTRIBUTION:');
Object.keys(distribution).sort().forEach(date => {
  const count = distribution[date];
  const isToday = date === today;
  console.log(`${isToday ? '🎯 TODAY: ' : ''}${date}: ${count} meals`);
});

console.log('\n🔄 Refreshing page in 3 seconds...');
setTimeout(() => {
  window.location.reload();
}, 3000);