// EMERGENCY MEAL RECOVERY SCRIPT
// Run this in browser console to immediately fix meal date distribution

console.log('🚨 EMERGENCY MEAL RECOVERY STARTING...');

// Get current meal data
const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log(`📊 Found ${storedMeals.length} meals to analyze`);

// Analyze current distribution
const currentDistribution = {};
storedMeals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  if (date) {
    currentDistribution[date] = (currentDistribution[date] || 0) + 1;
  }
});

console.log('📊 CURRENT DISTRIBUTION:');
Object.keys(currentDistribution).sort().forEach(date => {
  console.log(`  ${date}: ${currentDistribution[date]} meals`);
});

// Get this week's dates
const getWeekDates = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  return weekDates;
};

const thisWeek = getWeekDates();
console.log('📅 This week dates:', thisWeek);

// EMERGENCY RECOVERY LOGIC
let recoveredCount = 0;
const recoveredMeals = storedMeals.map((meal, index) => {
  // Fix invalid calories first
  if (meal.calories && (meal.calories > 10000 || meal.calories < 0)) {
    console.log(`🔧 Fixing invalid calories for "${meal.name}": ${meal.calories} -> 150`);
    meal.calories = 150;
  }
  
  // If meal has timestamp, use it for recovery
  if (meal.timestamp) {
    const correctDate = meal.timestamp.split('T')[0];
    let currentDate = meal.date;
    if (meal.date && meal.date.includes('T')) {
      currentDate = meal.date.split('T')[0];
    }
    
    if (currentDate !== correctDate) {
      recoveredCount++;
      console.log(`🔄 Timestamp recovery ${recoveredCount}: "${meal.name}" ${currentDate} -> ${correctDate}`);
      return { ...meal, date: correctDate };
    }
  }
  
  return meal;
});

// Additional recovery for meals without timestamps
// Distribute meals evenly across the week if they're all on the same day
const todayDate = new Date().toISOString().split('T')[0];
const mealsOnToday = recoveredMeals.filter(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  return date === todayDate;
});

if (mealsOnToday.length > 10) { // If too many meals on today, redistribute
  console.log(`🔄 EMERGENCY: ${mealsOnToday.length} meals on today, redistributing...`);
  
  let dayIndex = 0;
  recoveredMeals.forEach(meal => {
    let date = meal.date;
    if (date && date.includes('T')) date = date.split('T')[0];
    
    if (date === todayDate && !meal.timestamp) {
      // Distribute meals across the week
      const targetDate = thisWeek[dayIndex % 7];
      meal.date = targetDate;
      console.log(`📅 Redistributed "${meal.name}" to ${targetDate}`);
      dayIndex++;
    }
  });
}

// Save the recovered data
localStorage.setItem('weeklyMeals', JSON.stringify(recoveredMeals));

// Show final distribution
const finalDistribution = {};
recoveredMeals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  if (date) {
    finalDistribution[date] = (finalDistribution[date] || 0) + 1;
  }
});

console.log('✅ RECOVERY COMPLETE!');
console.log('📊 FINAL DISTRIBUTION:');
Object.keys(finalDistribution).sort().forEach(date => {
  const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  console.log(`  ${dayName} ${date}: ${finalDistribution[date]} meals`);
});

console.log('🔄 Refreshing page...');
window.location.reload();