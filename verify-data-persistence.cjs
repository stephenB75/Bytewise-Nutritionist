/**
 * Food Entry Data Persistence Verification Script
 * Tests if user food entries are being saved and restored properly
 */

const fs = require('fs');

console.log('=== FOOD ENTRY DATA PERSISTENCE VERIFICATION ===\n');

// Test data structure expectations
const expectedDataStructure = {
  weeklyMeals: 'Array of meal objects',
  userProfiles: 'User profile data',
  achievements: 'Achievement progress',
  waterIntake: 'Daily water tracking',
  calorieGoals: 'Daily calorie targets'
};

console.log('1. CHECKING DATA STRUCTURE EXPECTATIONS:\n');
Object.entries(expectedDataStructure).forEach(([key, description]) => {
  console.log(`📋 ${key}: ${description}`);
});

console.log('\n2. CHECKING DATA PERSISTENCE IMPLEMENTATION:\n');

// Check if data persistence utilities exist
const dataFilesToCheck = [
  'client/src/utils/performanceUtils.ts',
  'client/src/hooks/useOptimizedMealData.ts',
  'client/src/utils/mealDateFixer.ts',
  'client/src/pages/ModernFoodLayout.tsx'
];

dataFilesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    console.log(`✅ ${file} exists`);
    
    // Check for localStorage operations
    const hasLocalStorage = content.includes('localStorage');
    const hasGetItem = content.includes('getItem');
    const hasSetItem = content.includes('setItem');
    const hasCaching = content.includes('cache') || content.includes('Cache');
    
    console.log(`   - localStorage operations: ${hasLocalStorage ? '✅' : '❌'}`);
    console.log(`   - Data retrieval (getItem): ${hasGetItem ? '✅' : '❌'}`);
    console.log(`   - Data saving (setItem): ${hasSetItem ? '✅' : '❌'}`);
    console.log(`   - Caching system: ${hasCaching ? '✅' : '❌'}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}\n`);
  }
});

console.log('3. CHECKING MEAL DATA STRUCTURE:\n');

// Check ModernFoodLayout for data handling
try {
  const layoutContent = fs.readFileSync('client/src/pages/ModernFoodLayout.tsx', 'utf8');
  
  const hasMealLogging = layoutContent.includes('weeklyMeals');
  const hasDataRestoration = layoutContent.includes('loadExistingData') || layoutContent.includes('getCachedLocalStorage');
  const hasMealDateFixer = layoutContent.includes('autoFixMealDatesIfNeeded');
  const hasBackupSystem = layoutContent.includes('backup') || layoutContent.includes('User data backed up');
  
  console.log('Main App Data Handling:');
  console.log(`  - Meal logging system: ${hasMealLogging ? '✅' : '❌'}`);
  console.log(`  - Data restoration: ${hasDataRestoration ? '✅' : '❌'}`);
  console.log(`  - Date fixing system: ${hasMealDateFixer ? '✅' : '❌'}`);
  console.log(`  - Backup system: ${hasBackupSystem ? '✅' : '❌'}`);
  
} catch (error) {
  console.log(`❌ Error checking main app: ${error.message}`);
}

console.log('\n4. CHECKING CALORIE CALCULATOR INTEGRATION:\n');

// Check CalorieCalculator for meal saving
try {
  const calculatorContent = fs.readFileSync('client/src/components/CalorieCalculator.tsx', 'utf8');
  
  const hasLogMeal = calculatorContent.includes('logMeal') || calculatorContent.includes('Log Meal');
  const hasSaveToStorage = calculatorContent.includes('localStorage.setItem');
  const hasWeeklyMealsUpdate = calculatorContent.includes('weeklyMeals');
  const hasTimestamp = calculatorContent.includes('timestamp') || calculatorContent.includes('new Date()');
  
  console.log('Calorie Calculator Data Saving:');
  console.log(`  - Meal logging function: ${hasLogMeal ? '✅' : '❌'}`);
  console.log(`  - Save to localStorage: ${hasSaveToStorage ? '✅' : '❌'}`);
  console.log(`  - Weekly meals update: ${hasWeeklyMealsUpdate ? '✅' : '❌'}`);
  console.log(`  - Timestamp tracking: ${hasTimestamp ? '✅' : '❌'}`);
  
} catch (error) {
  console.log(`❌ Error checking calculator: ${error.message}`);
}

console.log('\n5. DATA PERSISTENCE VERIFICATION STEPS:\n');

console.log('To manually verify data persistence:');
console.log('1. Open browser dev tools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Check Local Storage for your domain');
console.log('4. Look for these keys:');
console.log('   - weeklyMeals (array of meal objects)');
console.log('   - userProfiles (user data)');
console.log('   - achievements (progress data)');
console.log('5. Log a meal and refresh the page');
console.log('6. Verify the meal persists after refresh');

console.log('\n6. EXPECTED MEAL DATA FORMAT:\n');

console.log('Each meal entry should have:');
console.log('- id: unique identifier');
console.log('- name: food name');
console.log('- date: YYYY-MM-DD format');
console.log('- timestamp: ISO string');
console.log('- calories: number');
console.log('- protein, carbs, fat: macro values');
console.log('- time: human-readable time');
console.log('- mealType: breakfast/lunch/dinner/snack');

console.log('\n7. TROUBLESHOOTING STEPS:\n');

console.log('If food entries are not restoring:');
console.log('1. Check browser console for localStorage errors');
console.log('2. Verify localStorage quota (usually 5-10MB)');
console.log('3. Test in incognito mode (fresh storage)');
console.log('4. Check if date fixing is working properly');
console.log('5. Verify cache system is not interfering');

console.log('\n=== VERIFICATION COMPLETE ===');
console.log('\nNext: Test by logging a meal, refreshing page, and checking persistence');