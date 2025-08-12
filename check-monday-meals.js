// Check localStorage for Monday 11th meals
const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');

console.log('=== MONDAY 11TH MEAL INSPECTION ===');
console.log('Total stored meals:', storedMeals.length);

// Find any meals from August 11th
const august11Meals = storedMeals.filter(meal => 
    meal.date && (
        meal.date.includes('2025-08-11') || 
        meal.date.includes('-08-11') ||
        meal.date === '2025-08-11'
    )
);

console.log('\nMeals found with August 11th date:', august11Meals.length);
august11Meals.forEach((meal, i) => {
    console.log(`${i+1}. ${meal.name} - ${meal.calories}cal - Date: ${meal.date}`);
});

// Get all unique dates to see the format pattern
const allDates = [...new Set(storedMeals.map(meal => meal.date))].sort();
console.log('\nAll unique meal dates in storage:');
allDates.forEach(date => console.log(date));

// Calculate what Monday should be this week
const today = new Date();
const day = today.getDay();
const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
const monday = new Date(today.setDate(diff));
const mondayKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

console.log('\nExpected Monday date key:', mondayKey);
console.log('Does this match any stored dates?', allDates.includes(mondayKey));
