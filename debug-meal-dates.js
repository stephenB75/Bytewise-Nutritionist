// Debug script to check meal date consistency
console.log('=== Meal Date Debugging ===');

// Get localStorage data
const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log(`Found ${weeklyMeals.length} meals in localStorage`);

// Check date formats
const dateFormats = {
  'date_only': 0,
  'date_with_time': 0,
  'timestamp_only': 0,
  'both_fields': 0,
  'no_date_info': 0
};

const today = new Date().toISOString().split('T')[0]; // Get today in YYYY-MM-DD format
console.log('Today (for comparison):', today);

weeklyMeals.forEach((meal, index) => {
  const hasDate = !!meal.date;
  const hasTimestamp = !!meal.timestamp;
  const dateIncludesT = meal.date && meal.date.includes('T');
  
  if (hasDate && hasTimestamp) {
    dateFormats.both_fields++;
  } else if (hasDate && !dateIncludesT) {
    dateFormats.date_only++;
  } else if (hasDate && dateIncludesT) {
    dateFormats.date_with_time++;
  } else if (hasTimestamp) {
    dateFormats.timestamp_only++;
  } else {
    dateFormats.no_date_info++;
  }
  
  // Log first few meals for inspection
  if (index < 5) {
    console.log(`Meal ${index + 1}:`, {
      name: meal.name,
      date: meal.date,
      timestamp: meal.timestamp,
      extractedDate: meal.date && meal.date.includes('T') ? meal.date.split('T')[0] : meal.date
    });
  }
});

console.log('Date format analysis:', dateFormats);

// Count today's meals using different methods
const todayMeals1 = weeklyMeals.filter(meal => {
  const mealDate = meal.date && meal.date.includes('T') 
    ? meal.date.split('T')[0] 
    : meal.date;
  return mealDate === today;
}).length;

const todayMeals2 = weeklyMeals.filter(meal => {
  let mealDate;
  if (meal.date) {
    if (meal.date.includes('T')) {
      mealDate = meal.date.split('T')[0];
    } else {
      mealDate = meal.date;
    }
  } else if (meal.timestamp) {
    mealDate = meal.timestamp.split('T')[0];
  } else {
    return false;
  }
  return mealDate === today;
}).length;

console.log(`Today's meals (old method): ${todayMeals1}`);
console.log(`Today's meals (new method): ${todayMeals2}`);

console.log('=== End Debug ===');