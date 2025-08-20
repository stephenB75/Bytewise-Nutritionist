// TEST SCRIPT: Run in browser console to verify historical date recovery
console.log('🧪 TESTING HISTORICAL DATE RECOVERY SYSTEM');
console.log('==========================================');

// Check current meal data structure
const currentMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`📊 Total meals in storage: ${currentMeals.length}`);
console.log(`📅 Today's date: ${today}`);

// Analyze timestamp vs date field accuracy
console.log('\n🔍 ANALYZING TIMESTAMP vs DATE ACCURACY:');
let correctlyPlaced = 0;
let needsRecovery = 0;
let noTimestamp = 0;

currentMeals.forEach((meal, i) => {
  const currentDate = meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
  
  if (!meal.timestamp) {
    noTimestamp++;
    return;
  }
  
  const timestampDate = meal.timestamp.split('T')[0];
  
  if (currentDate === timestampDate) {
    correctlyPlaced++;
  } else {
    needsRecovery++;
    if (needsRecovery <= 3) { // Show first 3 examples
      console.log(`❌ "${meal.name}": date=${currentDate}, timestamp=${timestampDate}`);
    }
  }
});

console.log(`✅ Correctly placed: ${correctlyPlaced}`);
console.log(`🔄 Need recovery: ${needsRecovery}`);
console.log(`⚠️ No timestamp: ${noTimestamp}`);

// Check meals currently on today
const mealsOnToday = currentMeals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === today;
});

const actuallyFromToday = mealsOnToday.filter(meal => {
  if (!meal.timestamp) return false;
  return meal.timestamp.split('T')[0] === today;
});

console.log(`\n🎯 CURRENT SITUATION:`);
console.log(`Meals on today: ${mealsOnToday.length}`);
console.log(`Actually from today: ${actuallyFromToday.length}`);
console.log(`Historical meals on today: ${mealsOnToday.length - actuallyFromToday.length}`);

// Show what the recovery system should do
if (needsRecovery > 0) {
  console.log(`\n🔄 RECOVERY NEEDED: ${needsRecovery} meals will be moved to historical dates`);
  console.log('💡 Go to "Meal Journal" → "Weekly" view to trigger automatic recovery');
} else {
  console.log('\n✅ All meals are correctly placed on their historical dates');
}

// Show expected today count after recovery
console.log(`\n🎯 EXPECTED AFTER RECOVERY:`);
console.log(`Today will have: ${actuallyFromToday.length} meals (only actual today's entries)`);
console.log(`Historical dates will get: ${mealsOnToday.length - actuallyFromToday.length} meals`);

if (actuallyFromToday.length <= 1) {
  console.log('✅ This matches your expectation of 1 entry for today');
} else {
  console.log(`⚠️ Found ${actuallyFromToday.length} entries for today - check if this is correct`);
}