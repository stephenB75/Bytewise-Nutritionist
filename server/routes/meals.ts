import { Router } from 'express';
import { db } from '../db';
import { meals, mealFoods, foods } from '../../shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { isAuthenticated } from '../supabaseAuth';

const router = Router();

// Get user's meal history for suggestions
router.get('/api/meals/history', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    console.log('[Meals History API] User ID:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all meals from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query meals with their food items
    const userMealData = await db
      .select({
        mealId: meals.id,
        mealDate: meals.date,
        mealType: meals.mealType,
        foodId: mealFoods.id,
        foodName: sql<string>`COALESCE(${foods.name}, ${mealFoods.foodName})`, // Use food name from foods table or custom name
        quantity: mealFoods.quantity,
        unit: mealFoods.unit,
        calories: mealFoods.calories,
        protein: mealFoods.protein,
        carbs: mealFoods.carbs,
        fat: mealFoods.fat
      })
      .from(meals)
      .innerJoin(mealFoods, eq(mealFoods.mealId, meals.id))
      .leftJoin(foods, eq(foods.id, mealFoods.foodId))
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.date, thirtyDaysAgo)
        )
      )
      .orderBy(desc(meals.date));
    
    console.log(`[Meals History API] Found ${userMealData.length} meal items from database`);

    // Process meals to get frequency and recent items
    const frequencyMap = new Map();
    const recentMealsList = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    userMealData.forEach(item => {
      const foodName = item.foodName || 'Unknown Food';
      
      // Track frequency
      const key = foodName.toLowerCase().trim();
      if (frequencyMap.has(key)) {
        frequencyMap.get(key).count++;
      } else {
        frequencyMap.set(key, {
          meal: {
            id: item.foodId?.toString() || String(item.mealId),
            name: foodName,
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fat: Number(item.fat) || 0,
            mealType: item.mealType,
            date: item.mealDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
          },
          count: 1
        });
      }

      // Track recent meals (last 24 hours)
      const mealDate = new Date(item.mealDate || new Date());
      if (mealDate > yesterday) {
        recentMealsList.push({
          id: item.foodId?.toString() || String(item.mealId),
          name: foodName,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          mealType: item.mealType,
          date: item.mealDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
        });
      }
    });

    // Get top frequent meals
    const frequentMeals = Array.from(frequencyMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(item => ({
        ...item.meal,
        frequency: item.count
      }));

    // Remove duplicates from recent meals
    const uniqueRecent = new Map();
    recentMealsList.forEach(meal => {
      const key = meal.name.toLowerCase().trim();
      if (!uniqueRecent.has(key)) {
        uniqueRecent.set(key, meal);
      }
    });

    res.json({
      frequentMeals,
      recentMeals: Array.from(uniqueRecent.values()).slice(0, 6)
    });
  } catch (error) {
    console.error('Error fetching meal history:', error);
    res.status(500).json({ error: 'Failed to fetch meal history' });
  }
});

export default router;