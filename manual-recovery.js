// Manual recovery script to force-fix meal dates immediately
console.log('🔄 MANUAL MEAL DATE RECOVERY');

function forceRecoverMealDates() {
  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`Processing ${weeklyMeals.length} meals`);
  console.log(`Today is: ${today}`);
  
  let recoveredCount = 0;
  const recoveredMeals = weeklyMeals.map((meal, index) => {
    if (!meal.timestamp) {
      console.log(`Meal ${index + 1} (${meal.name}) has no timestamp - skipping`);
      return meal;
    }
    
    const timestampDate = meal.timestamp.split('T')[0];
    let currentMealDate = meal.date;
    
    // Handle different date formats
    if (meal.date && meal.date.includes('T')) {
      currentMealDate = meal.date.split('T')[0];
    }
    
    // Check if meal needs recovery
    if (currentMealDate !== timestampDate) {
      recoveredCount++;
      
      if (recoveredCount <= 10) {
        console.log(`${recoveredCount}. Recovering "${meal.name}"`);
        console.log(`   From: ${currentMealDate} → To: ${timestampDate}`);
        console.log(`   Time: ${meal.time || 'unknown'}`);
        console.log(`   Calories: ${meal.calories}`);
      }
      
      return {
        ...meal,
        date: timestampDate // Use timestamp date
      };
    }
    
    return meal;
  });
  
  if (recoveredCount > 0) {
    // Save recovered data
    localStorage.setItem('weeklyMeals', JSON.stringify(recoveredMeals));
    
    // Show final distribution
    const distribution = {};
    recoveredMeals.forEach(meal => {
      const date = meal.date && meal.date.includes('T') 
        ? meal.date.split('T')[0] 
        : meal.date;
      
      if (date) {
        distribution[date] = (distribution[date] || 0) + 1;
      }
    });
    
    console.log(`\n✅ RECOVERY COMPLETE! ${recoveredCount} meals restored`);
    console.log('\n📊 New distribution:');
    
    Object.keys(distribution).sort().forEach(date => {
      const count = distribution[date];
      const isToday = date === today;
      console.log(`${date}: ${count} meals ${isToday ? '← TODAY' : ''}`);
    });
    
    console.log('\n🔄 Page will refresh to show changes...');
    setTimeout(() => window.location.reload(), 2000);
    
  } else {
    console.log('ℹ️ No meals needed recovery');
  }
}

// Run the recovery
forceRecoverMealDates();