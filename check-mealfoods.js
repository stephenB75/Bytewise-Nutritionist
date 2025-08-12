// Check meal foods entries
import { db } from './server/db.js';
import { meals, mealFoods } from './shared/schema.js';
import { desc, sql } from 'drizzle-orm';

async function checkMealFoods() {
  try {
    // Check recent meal foods entries
    const recentMealFoods = await db
      .select({
        id: mealFoods.id,
        mealId: mealFoods.mealId,
        foodName: mealFoods.foodName,
        calories: mealFoods.calories,
        protein: mealFoods.protein,
        carbs: mealFoods.carbs,
        fat: mealFoods.fat
      })
      .from(mealFoods)
      .orderBy(desc(mealFoods.id))
      .limit(5);
    
    console.log('Recent meal foods entries:');
    if (recentMealFoods.length === 0) {
      console.log('No meal foods found yet');
    } else {
      recentMealFoods.forEach((food, index) => {
        console.log(`${index + 1}. ID: ${food.id}, Meal: ${food.mealId}, Food: ${food.foodName || 'N/A'}`);
        console.log(`   Calories: ${food.calories}, Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fat: ${food.fat}g`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkMealFoods();