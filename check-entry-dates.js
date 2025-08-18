// Check the exact dates of the food entries
console.log('📅 CHECKING FOOD ENTRY DATES');
console.log('='.repeat(40));

if (typeof window !== 'undefined' && window.localStorage) {
  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  
  if (weeklyMeals.length === 0) {
    console.log('⚪ No meals found in storage');
    return;
  }
  
  // Group meals by date
  const mealsByDate = {};
  
  weeklyMeals.forEach(meal => {
    if (!meal.date) return;
    
    // Extract just the date part (YYYY-MM-DD)
    let dateKey;
    if (meal.date.includes('T')) {
      dateKey = meal.date.split('T')[0];
    } else if (meal.date.includes(' ')) {
      const datePart = meal.date.split(' ')[0];
      if (datePart.includes('/')) {
        // Convert MM/DD/YYYY to YYYY-MM-DD
        const [month, day, year] = datePart.split('/');
        dateKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        dateKey = datePart;
      }
    } else {
      dateKey = meal.date;
    }
    
    if (!mealsByDate[dateKey]) {
      mealsByDate[dateKey] = [];
    }
    
    mealsByDate[dateKey].push({
      name: meal.name || 'Unnamed meal',
      calories: meal.totalCalories || 0,
      time: meal.date.includes('T') ? meal.date.split('T')[1] : 'unknown time',
      mealType: meal.mealType || 'unknown'
    });
  });
  
  // Sort dates (most recent first)
  const sortedDates = Object.keys(mealsByDate).sort().reverse();
  
  console.log(`📊 Found entries across ${sortedDates.length} dates:`);
  console.log();
  
  sortedDates.forEach(dateKey => {
    const meals = mealsByDate[dateKey];
    const dateObj = new Date(dateKey + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const displayDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    console.log(`🗓️ ${dayName} ${displayDate} (${dateKey})`);
    console.log(`   ${meals.length} entries:`);
    
    meals.forEach((meal, index) => {
      console.log(`   ${index + 1}. ${meal.name} - ${meal.calories} cal (${meal.mealType})`);
    });
    
    console.log();
  });
  
  // Check if any entries are for today
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  console.log(`🎯 TODAY'S DATE: ${today.toDateString()} (${todayKey})`);
  
  if (mealsByDate[todayKey]) {
    console.log(`✅ ${mealsByDate[todayKey].length} entries found for today`);
  } else {
    console.log('⚪ No entries found for today');
    console.log('📋 Entries found for these dates instead:');
    sortedDates.forEach(date => {
      console.log(`   • ${date}: ${mealsByDate[date].length} entries`);
    });
  }
  
} else {
  console.log('Run this script in browser console to check localStorage data');
}