// IMMEDIATE DATA CORRUPTION FIX
// Run this script to clean corrupted meal data right now

console.log('=== FIXING CORRUPTED DATA ===');

// Function to validate and clean data
function validateAndClean(data, type) {
  const cleaned = data.filter((item) => {
    const calories = Number(item.calories) || 0;
    const protein = Number(item.protein) || 0;
    const carbs = Number(item.carbs) || 0;
    const fat = Number(item.fat) || 0;
    
    // Remove entries with unrealistic values
    if (calories > 10000 || calories < 0) return false;
    if (protein > 500 || protein < 0) return false;
    if (carbs > 1000 || carbs < 0) return false;
    if (fat > 500 || fat < 0) return false;
    
    // Must have a name
    if (!item.name || typeof item.name !== 'string') return false;
    
    return true;
  });
  
  const removed = data.length - cleaned.length;
  console.log(`${type}: Removed ${removed} corrupted entries, kept ${cleaned.length}`);
  return cleaned;
}

// Fix weeklyMeals
const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const cleanedMeals = validateAndClean(weeklyMeals, 'Weekly Meals');
localStorage.setItem('weeklyMeals', JSON.stringify(cleanedMeals));

// Fix calculatedCalories
const calculatedCalories = JSON.parse(localStorage.getItem('calculatedCalories') || '[]');
const cleanedCalories = validateAndClean(calculatedCalories, 'Calculated Calories');
localStorage.setItem('calculatedCalories', JSON.stringify(cleanedCalories));

// Clear any cached totals that might be corrupted
const cacheKeys = ['dailyTotal', 'weeklyTotal', 'monthlyTotal'];
cacheKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`Cleared cached ${key}`);
  }
});

console.log('=== DATA CORRUPTION FIX COMPLETE ===');
console.log('Refreshing page to reflect clean data...');
window.location.reload();
