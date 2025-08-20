// FORCE HISTORICAL DATE FIX - Direct correction without waiting for component load
console.log('🚨 FORCE HISTORICAL DATE CORRECTION');
console.log('=====================================');

const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`📊 Before fix: ${meals.length} total meals`);
console.log(`📅 Today: ${today}`);

// Count current situation
const beforeFix = meals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === today;
});

console.log(`🚨 Meals currently on today: ${beforeFix.length}`);

// FORCE FIX: Use timestamps to correct ALL meal dates
let fixedCount = 0;
const correctedMeals = meals.map(meal => {
  // Fix invalid calories first
  if (meal.calories && (meal.calories > 10000 || meal.calories < 0)) {
    meal.calories = 150; // Reset unrealistic calories
  }
  
  // Use timestamp to determine correct date
  if (meal.timestamp) {
    const correctDate = meal.timestamp.split('T')[0];
    let currentDate = meal.date;
    
    if (currentDate && currentDate.includes('T')) {
      currentDate = currentDate.split('T')[0];
    }
    
    // If dates don't match, fix it
    if (currentDate !== correctDate) {
      fixedCount++;
      console.log(`📅 Fix ${fixedCount}: "${meal.name}" ${currentDate} → ${correctDate}`);
      meal.date = correctDate;
    }
  }
  
  return meal;
});

// Save corrected data
localStorage.setItem('weeklyMeals', JSON.stringify(correctedMeals));

// Verify fix
const afterFix = correctedMeals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === today;
});

console.log(`\n✅ RESULTS:`);
console.log(`Fixed ${fixedCount} meals to historical dates`);
console.log(`Before: ${beforeFix.length} meals on today`);
console.log(`After: ${afterFix.length} meals on today`);

// Show distribution
const distribution = {};
correctedMeals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  if (date) {
    distribution[date] = (distribution[date] || 0) + 1;
  }
});

console.log('\n📊 CORRECTED DISTRIBUTION:');
Object.keys(distribution).sort().forEach(date => {
  const isToday = date === today;
  console.log(`${isToday ? '🎯 TODAY: ' : ''}${date}: ${distribution[date]} meals`);
});

console.log('\n🔄 Refreshing page...');
setTimeout(() => window.location.reload(), 2000);