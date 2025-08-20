// Recovery script to restore historical meals to correct dates
console.log('=== Meal Date Recovery Script ===');

const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];

console.log(`Found ${weeklyMeals.length} total meals`);
console.log(`Today's date: ${today}`);

// Find meals that have today's date but timestamps from other days
const mealsToRestore = weeklyMeals.filter(meal => {
  if (!meal.timestamp) return false;
  
  const timestampDate = meal.timestamp.split('T')[0];
  const mealDate = meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
  
  // Find meals where the meal date doesn't match the timestamp date
  return timestampDate !== mealDate;
});

console.log(`Found ${mealsToRestore.length} meals with mismatched dates to restore`);

if (mealsToRestore.length > 0) {
  // Restore meals to their correct dates based on timestamp
  const restoredMeals = weeklyMeals.map(meal => {
    if (!meal.timestamp) return meal;
    
    const timestampDate = meal.timestamp.split('T')[0];
    const mealDate = meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
    
    // If dates don't match, restore to timestamp date
    if (timestampDate !== mealDate) {
      console.log(`Restoring: "${meal.name}" from ${mealDate} to ${timestampDate}`);
      return {
        ...meal,
        date: timestampDate // Restore to original date from timestamp
      };
    }
    
    return meal;
  });
  
  // Save restored meals
  localStorage.setItem('weeklyMeals', JSON.stringify(restoredMeals));
  
  // Show new distribution
  const dateDistribution = {};
  restoredMeals.forEach(meal => {
    const mealDate = meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
    if (mealDate) {
      dateDistribution[mealDate] = (dateDistribution[mealDate] || 0) + 1;
    }
  });
  
  console.log('\n📅 After restoration:');
  Object.keys(dateDistribution).sort().forEach(date => {
    const count = dateDistribution[date];
    const isToday = date === today;
    console.log(`${date}: ${count} meals ${isToday ? '(TODAY)' : ''}`);
  });
  
  console.log(`\n✅ Restored ${mealsToRestore.length} meals to their correct dates`);
  console.log('🔄 Refreshing page to apply changes...');
  
  // Trigger page refresh to apply changes
  window.location.reload();
} else {
  console.log('ℹ️ No meals need restoration');
}