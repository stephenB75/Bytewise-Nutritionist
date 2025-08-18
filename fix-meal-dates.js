// Fix meal dates - correct August 17th entries to August 18th if needed
console.log('🛠️ MEAL DATE CORRECTION TOOL');
console.log('='.repeat(40));

if (typeof window !== 'undefined' && window.localStorage) {
  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  
  if (weeklyMeals.length === 0) {
    console.log('⚪ No meals found in storage');
    return;
  }
  
  console.log(`📊 Found ${weeklyMeals.length} total meals`);
  
  // Today should be 2025-08-18
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterdayKey = '2025-08-17'; // The problematic date from the bug
  
  console.log(`📅 Today: ${today.toDateString()} (${todayKey})`);
  console.log(`📅 Yesterday: ${yesterdayKey}`);
  
  // Count entries by date
  let todayCount = 0;
  let yesterdayCount = 0;
  let otherCount = 0;
  
  const mealsByDate = {};
  
  weeklyMeals.forEach(meal => {
    let dateKey = 'unknown';
    
    if (meal.date) {
      if (meal.date.includes('T')) {
        dateKey = meal.date.split('T')[0];
      } else if (meal.date.length >= 10) {
        dateKey = meal.date.substring(0, 10);
      } else {
        dateKey = meal.date;
      }
    }
    
    if (!mealsByDate[dateKey]) {
      mealsByDate[dateKey] = [];
    }
    
    mealsByDate[dateKey].push(meal);
    
    if (dateKey === todayKey) todayCount++;
    else if (dateKey === yesterdayKey) yesterdayCount++;
    else otherCount++;
  });
  
  console.log(`\n📊 CURRENT DATE DISTRIBUTION:`);
  console.log(`Today (${todayKey}): ${todayCount} entries`);
  console.log(`Yesterday (${yesterdayKey}): ${yesterdayCount} entries`);
  console.log(`Other dates: ${otherCount} entries`);
  
  // If we have entries on August 17th but user says they should be on August 18th
  if (yesterdayCount > 0 && todayCount === 0) {
    console.log(`\n🔧 CORRECTION NEEDED:`);
    console.log(`Found ${yesterdayCount} entries on August 17th that should be moved to August 18th`);
    
    // Ask for user confirmation before making changes
    if (confirm(`Move ${yesterdayCount} meals from August 17th to August 18th? This will correct the date bug.`)) {
      
      let correctedCount = 0;
      const updatedMeals = weeklyMeals.map(meal => {
        if (meal.date && meal.date.includes(yesterdayKey)) {
          // Update the date to today
          const timePart = meal.date.includes('T') ? meal.date.split('T')[1] : '';
          meal.date = timePart ? `${todayKey}T${timePart}` : todayKey;
          correctedCount++;
          
          console.log(`✅ Corrected: ${meal.name} → ${meal.date}`);
        }
        return meal;
      });
      
      // Save the corrected data
      localStorage.setItem('weeklyMeals', JSON.stringify(updatedMeals));
      localStorage.setItem('weeklyMeals_backup', JSON.stringify(updatedMeals));
      localStorage.setItem('weeklyMeals_lastCorrection', new Date().toISOString());
      
      console.log(`\n✅ CORRECTION COMPLETE:`);
      console.log(`Moved ${correctedCount} meals from August 17th to August 18th`);
      console.log('All entries now correctly dated for today');
      
      // Trigger UI refresh
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      console.log('🔄 UI refresh triggered');
      
    } else {
      console.log('❌ Correction cancelled by user');
    }
  } else if (todayCount > 0) {
    console.log(`\n✅ DATES ARE CORRECT:`);
    console.log(`Found ${todayCount} entries correctly dated for today (August 18th)`);
  } else {
    console.log(`\n📋 DETAILED BREAKDOWN:`);
    Object.keys(mealsByDate).sort().reverse().forEach(dateKey => {
      const meals = mealsByDate[dateKey];
      console.log(`${dateKey}: ${meals.length} entries`);
      meals.forEach(meal => {
        console.log(`  - ${meal.name || 'Unnamed meal'}`);
      });
    });
  }
  
} else {
  console.log('Run this script in the browser console');
}