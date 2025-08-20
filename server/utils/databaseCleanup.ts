/**
 * Database cleanup utilities to fix corrupted meal data
 * Removes or fixes entries with unrealistic calorie values
 */

import { db } from "../db";
import { meals } from "../../shared/schema";
import { sql } from "drizzle-orm";

/**
 * Clean up corrupted meals in the database
 * Removes meals with unrealistic calorie values (>3000 or <0)
 */
export async function cleanupCorruptedMealsInDatabase(userId?: string): Promise<{
  removedCount: number;
  fixedCount: number;
  totalChecked: number;
}> {
  try {
    console.log('🧹 Starting database cleanup for corrupted meals...');
    
    // First, get all meals to check
    const allMeals = userId 
      ? await db.select().from(meals).where(sql`${meals.userId} = ${userId}`)
      : await db.select().from(meals);
    
    console.log(`📊 Checking ${allMeals.length} meals in database...`);
    
    let removedCount = 0;
    let fixedCount = 0;
    
    for (const meal of allMeals) {
      const calories = parseFloat(meal.totalCalories || '0');
      
      // Check for unrealistic calorie values
      if (calories < 0 || calories > 5000) {
        // Remove meals with extremely unrealistic values
        await db.delete(meals).where(sql`${meals.id} = ${meal.id}`);
        console.log(`🗑️ Removed meal "${meal.name}" with invalid calories: ${calories}`);
        removedCount++;
      }
      // Check for moderately unrealistic values that can be fixed
      else if (calories > 3000 && calories <= 5000) {
        // Cap at reasonable maximum (3000 calories)
        await db.update(meals)
          .set({ totalCalories: '3000' })
          .where(sql`${meals.id} = ${meal.id}`);
        console.log(`🔧 Fixed meal "${meal.name}" calories from ${calories} to 3000`);
        fixedCount++;
      }
    }
    
    console.log(`✅ Database cleanup completed:`, {
      totalChecked: allMeals.length,
      removed: removedCount,
      fixed: fixedCount
    });
    
    return {
      removedCount,
      fixedCount,
      totalChecked: allMeals.length
    };
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

/**
 * Get database meal statistics for debugging
 */
export async function getDatabaseMealStats(userId?: string): Promise<{
  totalMeals: number;
  averageCalories: number;
  maxCalories: number;
  minCalories: number;
  unrealisticCount: number;
}> {
  try {
    const allMeals = userId 
      ? await db.select().from(meals).where(sql`${meals.userId} = ${userId}`)
      : await db.select().from(meals);
    
    if (allMeals.length === 0) {
      return {
        totalMeals: 0,
        averageCalories: 0,
        maxCalories: 0,
        minCalories: 0,
        unrealisticCount: 0
      };
    }
    
    const calories = allMeals.map(meal => parseFloat(meal.totalCalories || '0'));
    const validCalories = calories.filter(cal => cal > 0);
    
    const totalCalories = validCalories.reduce((sum, cal) => sum + cal, 0);
    const averageCalories = validCalories.length > 0 ? totalCalories / validCalories.length : 0;
    const maxCalories = Math.max(...calories);
    const minCalories = Math.min(...calories.filter(cal => cal > 0));
    const unrealisticCount = calories.filter(cal => cal < 0 || cal > 3000).length;
    
    return {
      totalMeals: allMeals.length,
      averageCalories: Math.round(averageCalories),
      maxCalories,
      minCalories,
      unrealisticCount
    };
    
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    throw error;
  }
}