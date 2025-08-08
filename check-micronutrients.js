// Simple script to check micronutrient data in localStorage
const meals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
console.log('Total meals stored:', meals.length);

if (meals.length > 0) {
  console.log('\nFirst meal micronutrient data:');
  const firstMeal = meals[0];
  console.log('Name:', firstMeal.name);
  console.log('Calories:', firstMeal.calories);
  console.log('Vitamin C:', firstMeal.vitaminC);
  console.log('Vitamin D:', firstMeal.vitaminD);
  console.log('Iron:', firstMeal.iron);
  console.log('Calcium:', firstMeal.calcium);
  
  console.log('\nAll micronutrients in first meal:');
  const microKeys = ['vitaminC', 'vitaminD', 'vitaminB12', 'folate', 'iron', 'calcium', 'zinc', 'magnesium'];
  microKeys.forEach(key => {
    console.log(`${key}: ${firstMeal[key]}`);
  });
}
