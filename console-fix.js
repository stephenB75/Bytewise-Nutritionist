// Direct console fix for meal dates
// Copy and paste this entire script into your browser console

console.log('🛠️ FIXING MEAL DATES - August 17th → August 18th');
console.log('='.repeat(50));

try {
  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  const yesterdayKey = '2025-08-17';
  const todayKey = '2025-08-18';
  
  console.log(`Found ${weeklyMeals.length} total meals in storage`);
  
  // Find meals on August 17th
  const mealsToFix = weeklyMeals.filter(meal => meal.date && meal.date.includes(yesterdayKey));
  console.log(`Found ${mealsToFix.length} meals on August 17th that need to be moved`);
  
  if (mealsToFix.length > 0) {
    console.log('\nMeals to be moved:');
    mealsToFix.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.name || 'Unnamed meal'} - ${meal.totalCalories || 0} cal`);
    });
    
    // Fix the dates
    let correctedCount = 0;
    const updatedMeals = weeklyMeals.map(meal => {
      if (meal.date && meal.date.includes(yesterdayKey)) {
        const timePart = meal.date.includes('T') ? meal.date.split('T')[1] : '';
        meal.date = timePart ? `${todayKey}T${timePart}` : todayKey;
        correctedCount++;
      }
      return meal;
    });
    
    // Save the corrected data
    localStorage.setItem('weeklyMeals', JSON.stringify(updatedMeals));
    localStorage.setItem('weeklyMeals_backup', JSON.stringify(updatedMeals));
    localStorage.setItem('weeklyMeals_lastCorrection', new Date().toISOString());
    
    console.log(`\n✅ SUCCESS! Moved ${correctedCount} meals to August 18th`);
    
    // Trigger UI refresh
    window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
    window.dispatchEvent(new CustomEvent('calories-logged'));
    
    console.log('🔄 Triggered UI refresh events');
    console.log('✅ COMPLETE! Check your weekly summary - entries should now show for today');
    
  } else {
    console.log('⚪ No meals found on August 17th');
    
    // Check what dates we do have
    const dateCount = {};
    weeklyMeals.forEach(meal => {
      if (meal.date) {
        const dateKey = meal.date.includes('T') ? meal.date.split('T')[0] : meal.date.substring(0, 10);
        dateCount[dateKey] = (dateCount[dateKey] || 0) + 1;
      }
    });
    
    console.log('Current date distribution:');
    Object.keys(dateCount).sort().forEach(date => {
      console.log(`  ${date}: ${dateCount[date]} meals`);
    });
  }
  
} catch (error) {
  console.error('❌ Error fixing dates:', error);
}

console.log('\nScript complete. If your meals are now showing for today, the fix worked!');