// Test script to verify meal history data in database
import { db } from './server/db.js';
import { meals, mealFoods, foods } from './shared/schema.js';
import { desc, sql } from 'drizzle-orm';

async function testMealHistory() {
  try {
    console.log('Testing meal history database query...\n');
    
    // Check total meals in database
    const totalMeals = await db.select({ count: sql`count(*)` }).from(meals);
    console.log('Total meals in database:', totalMeals[0].count);
    
    // Check total meal foods
    const totalMealFoods = await db.select({ count: sql`count(*)` }).from(mealFoods);
    console.log('Total meal foods in database:', totalMealFoods[0].count);
    
    // Get sample meals with their foods
    const sampleMeals = await db
      .select({
        mealId: meals.id,
        userId: meals.userId,
        mealDate: meals.date,
        mealType: meals.mealType,
        foodName: foods.name,
        quantity: mealFoods.quantity,
        unit: mealFoods.unit,
        calories: mealFoods.calories
      })
      .from(meals)
      .innerJoin(mealFoods, sql`${mealFoods.mealId} = ${meals.id}`)
      .leftJoin(foods, sql`${foods.id} = ${mealFoods.foodId}`)
      .orderBy(desc(meals.date))
      .limit(5);
    
    console.log('\nSample meal data (last 5 entries):');
    sampleMeals.forEach((meal, index) => {
      console.log(`${index + 1}. User: ${meal.userId}, Date: ${meal.mealDate}, Type: ${meal.mealType}`);
      console.log(`   Food: ${meal.foodName || 'Custom'}, Quantity: ${meal.quantity} ${meal.unit}, Calories: ${meal.calories}`);
    });
    
    // Check for recent meals (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentMealsCount = await db
      .select({ count: sql`count(distinct ${meals.id})` })
      .from(meals)
      .where(sql`${meals.date} >= ${thirtyDaysAgo.toISOString()}`);
    
    console.log(`\nMeals in last 30 days: ${recentMealsCount[0].count}`);
    
  } catch (error) {
    console.error('Error testing meal history:', error);
  } finally {
    process.exit(0);
  }
}

testMealHistory();