// Check food entries logged today
console.log('🍽️ CHECKING TODAY\'S FOOD ENTRIES');
console.log('='.repeat(40));

// Get today's date key
const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

console.log(`📅 Today's Date: ${today.toDateString()}`);
console.log(`🔑 Date Key: ${todayKey}`);

if (typeof window !== 'undefined' && window.localStorage) {
  console.log('\n📊 CHECKING LOCALSTORAGE DATA:');
  
  // Check weekly meals data
  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  const todaysMeals = weeklyMeals.filter(meal => meal.date?.includes(todayKey));
  
  console.log(`Total meals in storage: ${weeklyMeals.length}`);
  console.log(`Today's meals: ${todaysMeals.length}`);
  
  if (todaysMeals.length > 0) {
    console.log('\n✅ TODAY\'S LOGGED FOODS:');
    todaysMeals.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.name || 'Unnamed meal'}`);
      console.log(`   📊 ${meal.totalCalories || 0} calories`);
      console.log(`   🍽️ ${meal.mealType || 'unknown'} meal`);
      console.log(`   ⏰ ${new Date(meal.date).toLocaleTimeString()}`);
      
      if (meal.foods && meal.foods.length > 0) {
        console.log(`   🥗 Foods: ${meal.foods.length} items`);
        meal.foods.forEach(food => {
          console.log(`      - ${food.name}: ${food.calories} cal`);
        });
      }
      console.log('');
    });
  } else {
    console.log('⚪ No food entries logged today');
  }
  
  // Check additional data
  console.log('\n📋 OTHER DATA LOGGED TODAY:');
  
  // Water intake
  const waterData = localStorage.getItem('dailyWaterIntake');
  if (waterData) {
    const water = JSON.parse(waterData);
    console.log(`💧 Water: ${water.glasses || 0} glasses`);
  }
  
  // User goals
  const userGoals = JSON.parse(localStorage.getItem('userGoals') || '{}');
  if (Object.keys(userGoals).length > 0) {
    console.log(`🎯 Daily calorie goal: ${userGoals.dailyCalorieGoal || 'not set'}`);
  }
  
  // Check backup data
  console.log('\n🔄 BACKUP DATA STATUS:');
  const backupKeys = ['weeklyMeals_backup', 'userData_backup', 'dailyWaterIntake_backup'];
  backupKeys.forEach(key => {
    const backup = localStorage.getItem(key);
    console.log(`${backup ? '✅' : '⚪'} ${key}: ${backup ? 'exists' : 'none'}`);
  });
  
  // Check sync status
  const lastSync = localStorage.getItem('weeklyMeals_lastSync');
  if (lastSync) {
    const syncTime = new Date(lastSync);
    const minutesAgo = Math.floor((Date.now() - syncTime.getTime()) / 60000);
    console.log(`🔄 Last sync: ${minutesAgo} minutes ago`);
  }
  
} else {
  console.log('Running in Node.js environment - cannot access localStorage');
  console.log('Run this script in the browser console to check data');
}