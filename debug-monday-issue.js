/**
 * Debug script to find Monday 11th meal issue
 */

// Check localStorage and debug the Monday issue
const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');

console.log('=== MONDAY 11TH DEBUG ANALYSIS ===');

// Get what the weekly card expects for Monday
const today = new Date();
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDates = () => {
  const weekStart = getWeekStart(new Date());
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dates.push(d);
  }
  
  return dates;
};

const weekDates = getWeekDates();
const mondayDate = weekDates[1]; // Monday is index 1
const expectedMondayKey = getLocalDateKey(mondayDate);

console.log('Expected Monday date key:', expectedMondayKey);
console.log('Monday actual date:', mondayDate.toDateString());

// Find all meals for expected Monday
const mondayMeals = storedMeals.filter(meal => meal.date === expectedMondayKey);
console.log('Meals found for expected Monday:', mondayMeals.length);

// Look for any August 11th meals with different formats
const august11Patterns = [
  '2025-08-11',
  '08-11-2025',
  '11-08-2025',
  '2025/08/11',
  '08/11/2025',
  '11/08/2025'
];

august11Patterns.forEach(pattern => {
  const matches = storedMeals.filter(meal => meal.date === pattern);
  if (matches.length > 0) {
    console.log(`Found ${matches.length} meals with date format "${pattern}"`);
    matches.forEach(meal => console.log(`  - ${meal.name}: ${meal.calories}cal`));
  }
});

// Show all unique date formats
const allDates = [...new Set(storedMeals.map(meal => meal.date))].sort();
console.log('\nAll unique meal dates in storage:');
allDates.forEach(date => {
  const count = storedMeals.filter(meal => meal.date === date).length;
  console.log(`${date} (${count} meals)`);
});

// Check if August 11th should be Monday
const aug11 = new Date('2025-08-11');
console.log('\nAugust 11th, 2025 is a:', aug11.toLocaleDateString('en-US', { weekday: 'long' }));
console.log('Is August 11th expected to be Monday this week?', expectedMondayKey === '2025-08-11');