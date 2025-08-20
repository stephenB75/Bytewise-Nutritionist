// HISTORICAL DATE RECOVERY - Place meals on their ACTUAL original dates
console.log('🕰️ HISTORICAL DATE RECOVERY STARTING...');

const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`📊 Total meals: ${meals.length}`);
console.log(`📅 Today: ${today}`);

// Analyze current vs actual dates
let historicalMeals = 0;
let correctlyPlaced = 0;
let needsFixing = 0;

const analysis = meals.map(meal => {
  const currentDate = meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
  const actualDate = meal.timestamp ? meal.timestamp.split('T')[0] : null;
  
  if (actualDate && actualDate !== currentDate) {
    needsFixing++;
    return { ...meal, actualDate, currentDate, needsFix: true };
  } else {
    correctlyPlaced++;
    return { ...meal, actualDate, currentDate, needsFix: false };
  }
});

console.log(`📊 Analysis Results:`);
console.log(`  ✅ Correctly placed: ${correctlyPlaced}`);
console.log(`  🔄 Needs fixing: ${needsFixing}`);

// Fix meals by placing them on their actual historical dates
console.log('\n🔄 FIXING MEAL DATES TO HISTORICAL ORIGINALS...');
let fixedCount = 0;

const correctedMeals = meals.map(meal => {
  if (meal.timestamp) {
    const actualDate = meal.timestamp.split('T')[0];
    const currentDate = meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
    
    if (actualDate !== currentDate) {
      fixedCount++;
      console.log(`📅 "${meal.name}": ${currentDate} → ${actualDate}`);
      return { ...meal, date: actualDate };
    }
  }
  return meal;
});

// Save the corrected data
localStorage.setItem('weeklyMeals', JSON.stringify(correctedMeals));
console.log(`\n✅ Fixed ${fixedCount} meals to their historical dates`);

// Show final distribution
const finalDistribution = {};
correctedMeals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  if (date) {
    finalDistribution[date] = (finalDistribution[date] || 0) + 1;
  }
});

console.log('\n📊 FINAL HISTORICAL DISTRIBUTION:');
const sortedDates = Object.keys(finalDistribution).sort();
sortedDates.forEach(date => {
  const isToday = date === today;
  const isThisWeek = isToday; // For now just highlight today
  console.log(`${isToday ? '🎯 TODAY: ' : ''}${date}: ${finalDistribution[date]} meals`);
});

const todayMeals = finalDistribution[today] || 0;
console.log(`\n🎯 TODAY (${today}) now has: ${todayMeals} meals`);
console.log(`📊 Total historical dates with meals: ${sortedDates.length}`);

console.log('\n🔄 Refreshing page to show corrected data...');
setTimeout(() => window.location.reload(), 1000);