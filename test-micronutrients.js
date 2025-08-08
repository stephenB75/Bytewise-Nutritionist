// Test script to verify micronutrient tracking
const testMicronutrients = async () => {
  console.log('Testing Micronutrient Tracking System...\n');
  
  const testCases = [
    { ingredient: 'spinach', measurement: '1 cup' },
    { ingredient: 'orange', measurement: '1 medium' },
    { ingredient: 'chicken breast', measurement: '100g' },
    { ingredient: 'milk', measurement: '1 cup' },
    { ingredient: 'salmon', measurement: '100g' }
  ];
  
  for (const test of testCases) {
    console.log(`\nTesting: ${test.ingredient} (${test.measurement})`);
    console.log('─'.repeat(50));
    
    try {
      const response = await fetch('http://localhost:5000/api/calculate-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });
      
      if (!response.ok) {
        console.error(`  ❌ API Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`  ✅ ${data.ingredient}`);
      console.log(`  📊 Calories: ${data.estimatedCalories} kcal`);
      console.log(`  🥩 Protein: ${data.nutritionPer100g?.protein || 0}g`);
      console.log(`  🍞 Carbs: ${data.nutritionPer100g?.carbs || 0}g`);
      console.log(`  🧈 Fat: ${data.nutritionPer100g?.fat || 0}g`);
      
      // Check micronutrients
      const micro = data.nutritionPer100g;
      if (micro) {
        console.log('\n  Micronutrients per 100g:');
        console.log(`    • Vitamin C: ${micro.vitaminC || 0}mg`);
        console.log(`    • Vitamin D: ${micro.vitaminD || 0}μg`);
        console.log(`    • Vitamin B12: ${micro.vitaminB12 || 0}μg`);
        console.log(`    • Folate: ${micro.folate || 0}μg`);
        console.log(`    • Iron: ${micro.iron || 0}mg`);
        console.log(`    • Calcium: ${micro.calcium || 0}mg`);
        console.log(`    • Zinc: ${micro.zinc || 0}mg`);
        console.log(`    • Magnesium: ${micro.magnesium || 0}mg`);
        
        // Check if we have real micronutrient data
        const hasMicronutrients = 
          micro.vitaminC > 0 || micro.vitaminD > 0 || 
          micro.iron > 0 || micro.calcium > 0 ||
          micro.zinc > 0 || micro.magnesium > 0 ||
          micro.vitaminB12 > 0 || micro.folate > 0;
        
        if (hasMicronutrients) {
          console.log('\n    ✨ Real micronutrient data detected from USDA!');
        } else {
          console.log('\n    ⚠️  No micronutrient data (may be using fallback)');
        }
      }
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Micronutrient Test Complete!');
};

// Run the test
testMicronutrients().catch(console.error);