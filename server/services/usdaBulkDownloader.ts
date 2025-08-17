/**
 * USDA Bulk Food Database Downloader
 * 
 * Downloads and stores commonly used foods from USDA FoodData Central
 * for enhanced offline functionality and faster response times
 */

import { db } from '../db';
import { usdaFoodCache } from '@shared/schema';
import { USDAService } from './usdaService';
import { sql } from 'drizzle-orm';

interface BulkDownloadProgress {
  totalFoods: number;
  downloadedFoods: number;
  failedFoods: number;
  currentCategory: string;
  isComplete: boolean;
  errors: string[];
}

export class USDABulkDownloader {
  private usdaService: USDAService;
  private progress: BulkDownloadProgress;

  constructor(apiKey: string) {
    this.usdaService = new USDAService();
    this.progress = {
      totalFoods: 0,
      downloadedFoods: 0,
      failedFoods: 0,
      currentCategory: '',
      isComplete: false,
      errors: []
    };
  }

  /**
   * Download popular foods by category for comprehensive local database
   */
  async downloadPopularFoods(): Promise<BulkDownloadProgress> {
    // Starting bulk food download process
    
    // Categories of most commonly tracked foods
    const foodCategories = [
      // Fruits & Vegetables
      { category: 'fruits', searches: ['apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'peach', 'pear', 'plum', 'cherry'] },
      { category: 'vegetables', searches: ['broccoli', 'carrot', 'spinach', 'lettuce', 'tomato', 'onion', 'pepper', 'cucumber', 'corn', 'potato'] },
      
      // Proteins
      { category: 'proteins', searches: ['chicken breast', 'ground beef', 'salmon', 'tuna', 'egg', 'turkey', 'pork', 'shrimp', 'tofu', 'beans'] },
      
      // Grains & Carbs  
      { category: 'grains', searches: ['rice', 'bread', 'pasta', 'oats', 'quinoa', 'wheat', 'barley', 'cereal', 'crackers', 'tortilla'] },
      
      // Dairy
      { category: 'dairy', searches: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'cottage cheese', 'mozzarella', 'cheddar', 'ice cream'] },
      
      // Nuts & Seeds
      { category: 'nuts', searches: ['almonds', 'peanuts', 'walnuts', 'cashews', 'pistachios', 'sunflower seeds', 'chia seeds', 'flax seeds'] },
      
      // Common Processed Foods
      { category: 'processed', searches: ['pizza', 'hamburger', 'french fries', 'hot dog', 'sandwich', 'soup', 'pasta sauce', 'salad dressing'] },
      
      // Beverages
      { category: 'beverages', searches: ['coffee', 'tea', 'juice', 'soda', 'beer', 'wine', 'protein shake', 'smoothie'] },
      
      // Cooking Ingredients
      { category: 'ingredients', searches: ['olive oil', 'sugar', 'flour', 'salt', 'honey', 'vinegar', 'garlic', 'ginger', 'herbs', 'spices'] }
    ];

    // Calculate total foods to download
    this.progress.totalFoods = foodCategories.reduce((total, cat) => total + cat.searches.length * 5, 0); // 5 foods per search
    this.progress.isComplete = false;

    for (const categoryData of foodCategories) {
      this.progress.currentCategory = categoryData.category;
      // Processing category: ${categoryData.category}

      for (const searchTerm of categoryData.searches) {
        try {
          // Search for top 5 foods per term to get variety
          const foods = await this.usdaService.searchFoods(searchTerm, 5);
          
          // Filter for Foundation and Survey data (most reliable)
          const qualityFoods = foods.filter(food => 
            food.dataType === 'Foundation' || food.dataType === 'Survey (FNDDS)'
          );

          // Cache the foods locally
          if (qualityFoods.length > 0) {
            await this.cacheFoodsToDatabase(qualityFoods);
            this.progress.downloadedFoods += qualityFoods.length;
          } else {
            // Fallback to any available foods if no quality data
            if (foods.length > 0) {
              await this.cacheFoodsToDatabase(foods.slice(0, 2)); // Only cache 2 if lower quality
              this.progress.downloadedFoods += Math.min(2, foods.length);
            }
          }

          // Add small delay to be respectful to USDA API
          await this.delay(100);

        } catch (error) {
          // Failed to download foods - error logged to progress
          this.progress.failedFoods++;
          this.progress.errors.push(`${searchTerm}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    this.progress.isComplete = true;
    this.progress.currentCategory = 'Complete';
    
    // Bulk download completed successfully
    return this.progress;
  }

  /**
   * Download foods from a specific category only
   */
  async downloadCategory(category: string, searches: string[]): Promise<number> {
    this.progress.currentCategory = category;
    let downloadedCount = 0;

    for (const searchTerm of searches) {
      try {
        const foods = await this.usdaService.searchFoods(searchTerm, 3);
        if (foods.length > 0) {
          await this.cacheFoodsToDatabase(foods);
          downloadedCount += foods.length;
        }
        await this.delay(100);
      } catch (error) {
        // Failed to download - error logged to progress
        this.progress.errors.push(`${searchTerm}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return downloadedCount;
  }

  /**
   * Cache foods to local database using existing cache table
   */
  private async cacheFoodsToDatabase(foods: any[]): Promise<void> {
    for (const food of foods) {
      try {
        // Extract nutrients using USDA service method
        const nutrients = this.extractNutrients(food.foodNutrients);
        
        await db
          .insert(usdaFoodCache)
          .values({
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            foodCategory: food.foodCategory || null,
            brandOwner: food.brandOwner || null,
            brandName: food.brandName || null,
            ingredients: food.ingredients || null,
            servingSize: food.servingSize ? food.servingSize.toString() : null,
            servingSizeUnit: food.servingSizeUnit || null,
            householdServingFullText: food.householdServingFullText || null,
            nutrients: nutrients,
            searchCount: 1,
            isBulkDownloaded: true, // Mark as bulk downloaded
          })
          .onConflictDoNothing(); // Don't overwrite existing entries
      } catch (error) {
        console.error(`Failed to cache food ${food.fdcId}:`, error);
      }
    }
  }

  /**
   * Extract nutrients from USDA food data (simplified version)
   */
  private extractNutrients(foodNutrients: any[]): any {
    const nutrients: any = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    if (!foodNutrients || !Array.isArray(foodNutrients)) {
      return nutrients;
    }

    for (const nutrient of foodNutrients) {
      if (!nutrient || (!nutrient.nutrientName && !nutrient.nutrient?.name)) {
        continue;
      }
      
      const name = (nutrient.nutrientName || nutrient.nutrient?.name || '').toLowerCase();
      const amount = nutrient.value || nutrient.amount || 0;
      const nutrientId = nutrient.nutrientId || nutrient.nutrient?.id;

      // Map using USDA nutrient IDs
      if (name.includes('energy') || name.includes('calorie') || nutrientId === 1008) {
        nutrients.calories = amount;
      } else if (name.includes('protein') || nutrientId === 1003) {
        nutrients.protein = amount;
      } else if ((name.includes('carbohydrate') && !name.includes('fiber')) || nutrientId === 1005) {
        nutrients.carbs = amount;
      } else if (name.includes('total lipid') || name.includes('fat') || nutrientId === 1004) {
        nutrients.fat = amount;
      } else if (name.includes('fiber') || nutrientId === 1079) {
        nutrients.fiber = amount;
      } else if (name.includes('sugar') || nutrientId === 2000) {
        nutrients.sugar = amount;
      } else if (name.includes('sodium') || nutrientId === 1093) {
        nutrients.sodium = amount > 100 ? amount / 1000 : amount; // Convert mg to g if needed
      }
    }

    return nutrients;
  }

  /**
   * Get current download progress
   */
  getProgress(): BulkDownloadProgress {
    return this.progress;
  }

  /**
   * Get statistics about cached foods
   */
  async getCacheStatistics() {
    const totalFoods = await db.select().from(usdaFoodCache);
    const bulkDownloaded = totalFoods.filter(food => food.isBulkDownloaded);
    const categories = Array.from(new Set(totalFoods.map(food => food.foodCategory).filter(Boolean)));

    return {
      totalCachedFoods: totalFoods.length,
      bulkDownloadedFoods: bulkDownloaded.length,
      categoriesRepresented: categories.length,
      categories: categories,
      lastBulkDownload: bulkDownloaded.length > 0 ? 
        Math.max(...bulkDownloaded.map(food => new Date(food.lastUpdated || food.createdAt || 0).getTime())) : null
    };
  }

  /**
   * Clear old cache entries to free up space
   */
  async cleanupOldCache(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleted = await db
      .delete(usdaFoodCache)
      .where(sql`${usdaFoodCache.lastUpdated} < ${cutoffDate} AND ${usdaFoodCache.searchCount} < 2`);

    return deleted;
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}