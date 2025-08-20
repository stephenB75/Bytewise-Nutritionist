// Debug script to check meal recovery system
console.log('🔍 DEBUGGING WEEKLY RECOVERY SYSTEM');

// Simulate browser localStorage access
const sampleMeals = [
  {
    "id": "sample1",
    "name": "Sample Meal 1", 
    "calories": 250,
    "date": "2025-08-20",
    "timestamp": "2025-08-18T10:30:00.000Z"
  },
  {
    "id": "sample2", 
    "name": "Sample Meal 2",
    "calories": 300,
    "date": "2025-08-20", 
    "timestamp": "2025-08-19T14:15:00.000Z"
  }
];

console.log('📊 Sample meal data for testing recovery:');
sampleMeals.forEach((meal, index) => {
  const correctDate = meal.timestamp.split('T')[0];
  const currentDate = meal.date;
  
  console.log(`Meal ${index + 1}: "${meal.name}"`);
  console.log(`  Current date: ${currentDate}`);
  console.log(`  Timestamp date: ${correctDate}`);
  console.log(`  Needs recovery: ${currentDate !== correctDate}`);
  console.log('');
});

// Test the recovery logic
console.log('🔄 Testing recovery logic:');
let recoveryCount = 0;
const recoveredMeals = sampleMeals.map((meal, index) => {
  if (!meal.timestamp) {
    return meal;
  }
  
  const correctDate = meal.timestamp.split('T')[0];
  let currentMealDate = meal.date;
  
  if (meal.date && meal.date.includes('T')) {
    currentMealDate = meal.date.split('T')[0];
  }
  
  if (currentMealDate !== correctDate) {
    recoveryCount++;
    console.log(`🔄 Recovering meal ${recoveryCount}: "${meal.name}" from ${currentMealDate} to ${correctDate}`);
    
    return {
      ...meal,
      date: correctDate
    };
  }
  
  return meal;
});

console.log(`✅ Recovery completed: ${recoveryCount} meals recovered`);
console.log('📊 Final meal distribution:');

const dateDistribution = {};
recoveredMeals.forEach(meal => {
  let date = meal.date;
  if (date && date.includes('T')) date = date.split('T')[0];
  if (date) {
    dateDistribution[date] = (dateDistribution[date] || 0) + 1;
  }
});

Object.keys(dateDistribution).sort().forEach(date => {
  console.log(`  ${date}: ${dateDistribution[date]} meals`);
});