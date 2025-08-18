// Comprehensive localStorage diagnostic
console.log('🔍 COMPREHENSIVE STORAGE DIAGNOSTIC');
console.log('='.repeat(50));

// Check all localStorage keys
console.log('\n📦 ALL LOCALSTORAGE KEYS:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  let preview = value;
  
  if (value && value.length > 100) {
    preview = value.substring(0, 97) + '...';
  }
  
  console.log(`${i + 1}. ${key}: ${preview}`);
}

console.log(`\nTotal localStorage items: ${localStorage.length}`);

// Detailed analysis of likely meal storage keys
const mealKeys = [
  'weeklyMeals',
  'meals',
  'userMeals', 
  'dailyMeals',
  'mealData',
  'foodEntries',
  'calculatedCalories'
];

console.log('\n🍽️ CHECKING MEAL STORAGE KEYS:');
mealKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        console.log(`\n✅ ${key}: ${parsed.length} items`);
        
        // Show sample entries
        parsed.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(item, null, 2).substring(0, 200)}...`);
        });
        
        // Check for San Pellegrino and Cheez-It
        const matchingItems = parsed.filter(item => {
          const itemStr = JSON.stringify(item).toLowerCase();
          return itemStr.includes('pellegrino') || 
                 itemStr.includes('cheez') || 
                 itemStr.includes('san pellegrino') ||
                 itemStr.includes('cheez-it');
        });
        
        if (matchingItems.length > 0) {
          console.log(`  🎯 Found ${matchingItems.length} matching foods (Pellegrino/Cheez-It):`);
          matchingItems.forEach(item => {
            console.log(`    - ${item.name || 'unnamed'} (${item.date || 'no date'}) - ${item.totalCalories || item.calories || 0} cal`);
          });
        }
      } else if (typeof parsed === 'object') {
        console.log(`\n📋 ${key}: Object with keys: ${Object.keys(parsed).join(', ')}`);
      }
    } catch (e) {
      console.log(`\n⚠️ ${key}: Not JSON - ${data.substring(0, 50)}...`);
    }
  } else {
    console.log(`⚪ ${key}: Not found`);
  }
});

// Check for any keys containing food-related terms
console.log('\n🔍 SEARCHING FOR FOOD-RELATED KEYS:');
const foodTerms = ['meal', 'food', 'calorie', 'nutrition', 'eat'];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i).toLowerCase();
  const hasFood = foodTerms.some(term => key.includes(term));
  
  if (hasFood) {
    const data = localStorage.getItem(localStorage.key(i));
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`🍽️ ${localStorage.key(i)}: ${parsed.length} items`);
      } else {
        console.log(`📋 ${localStorage.key(i)}: ${typeof parsed}`);
      }
    } catch (e) {
      console.log(`📝 ${localStorage.key(i)}: Text data`);
    }
  }
}

console.log('\n🎯 DIAGNOSIS COMPLETE');
console.log('Look for your 9+ food entries in the output above');