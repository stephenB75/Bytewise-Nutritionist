// Debug script to check micronutrient data in logged meals
// Run this in browser console to check if meals have micronutrient data

console.log('=== Checking Micronutrient Data ===');

// Check localStorage for meals
const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
const today = new Date().toISOString().split('T')[0];
const todayMeals = weeklyMeals.filter(meal => meal.date === today);

console.log(`Found ${todayMeals.length} meals for today`);

if (todayMeals.length > 0) {
  console.log('\n--- Today\'s Meals ---');
  todayMeals.forEach((meal, index) => {
    console.log(`\nMeal ${index + 1}: ${meal.name}`);
    console.log('Macros:', {
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    });
    console.log('Micronutrients:', {
      vitaminC: meal.vitaminC,
      vitaminD: meal.vitaminD,
      vitaminB12: meal.vitaminB12,
      folate: meal.folate,
      iron: meal.iron,
      calcium: meal.calcium,
      zinc: meal.zinc,
      magnesium: meal.magnesium
    });
  });

  // Calculate totals
  const totals = todayMeals.reduce((acc, meal) => ({
    vitaminC: acc.vitaminC + (meal.vitaminC || 0),
    vitaminD: acc.vitaminD + (meal.vitaminD || 0),
    vitaminB12: acc.vitaminB12 + (meal.vitaminB12 || 0),
    folate: acc.folate + (meal.folate || 0),
    iron: acc.iron + (meal.iron || 0),
    calcium: acc.calcium + (meal.calcium || 0),
    zinc: acc.zinc + (meal.zinc || 0),
    magnesium: acc.magnesium + (meal.magnesium || 0)
  }), {
    vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0,
    iron: 0, calcium: 0, zinc: 0, magnesium: 0
  });

  console.log('\n--- Daily Micronutrient Totals ---');
  console.log(totals);
  
  // Check if any micronutrients have values
  const hasAnyMicronutrients = Object.values(totals).some(value => value > 0);
  console.log(`\nHas micronutrient data: ${hasAnyMicronutrients ? 'YES' : 'NO'}`);
} else {
  console.log('No meals logged today. Try logging a meal first.');
}

console.log('\n=== End Check ===');