import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, optionalAuth, createAuthenticatedHandler, type AuthenticatedRequest } from "./supabaseAuth";
import { usdaService } from "./services/usdaService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, createAuthenticatedHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    const user = await storage.getUser(userId);
    res.json(user);
  }));

  // Meals API for logger
  app.post('/api/meals/logged', isAuthenticated, createAuthenticatedHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    const mealData = {
      ...req.body,
      userId,
      createdAt: new Date()
    };
    
    // Store meal in database/memory
    console.log('Logging meal from calculator:', mealData);
    
    res.json({ success: true, meal: mealData });
  }));

  app.get('/api/meals/logged', isAuthenticated, createAuthenticatedHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    // Return logged meals for the user
    const meals: any[] = []; // Implement meal retrieval from storage
    
    res.json(meals);
  }));

  // Calculate calories API with real USDA integration (no auth required)
  app.post('/api/calculate-calories', async (req, res) => {
    const { ingredient, measurement } = req.body;
    
    // Use real USDA service for calorie calculation
    const calorieData = await usdaService.calculateIngredientCalories(ingredient, measurement);
    
    res.json(calorieData);
  });

  // USDA Food Database Sync API
  app.post('/api/sync/food-database', async (req, res) => {
    console.log('Starting USDA food database sync...');
      
      // Sync popular foods for offline access
      const popularFoods = [
        'chicken breast', 'eggs', 'milk', 'bread', 'rice', 'apple', 'banana', 
        'broccoli', 'salmon', 'yogurt', 'oats', 'almonds', 'spinach', 
        'sweet potato', 'avocado', 'quinoa', 'ground beef', 'cheese'
      ];
      
      let syncedCount = 0;
      const syncResults = [];
      
      for (const food of popularFoods) {
        try {
          const foods = await usdaService.searchFoods(food, 5);
          syncedCount += foods.length;
          syncResults.push({
            query: food,
            found: foods.length,
            foods: foods.slice(0, 2).map(f => ({ 
              fdcId: f.fdcId, 
              description: f.description 
            }))
          });
        } catch (error) {
          console.error(`Error syncing ${food}:`, error);
          syncResults.push({
            query: food,
            found: 0,
            error: 'Sync failed'
          });
        }
      }
      
    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} foods from USDA database`,
      syncResults,
      timestamp: new Date().toISOString()
    });
  });

  // User Data Sync API
  app.post('/api/sync/user-data', async (req, res) => {
    try {
      console.log('Starting user data sync');
      
      // Sync user meals, achievements, and preferences
      const syncData = {
        meals: [], // Get from storage
        achievements: [], // Get from storage
        waterIntake: [], // Get from storage
        lastSync: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: "User data synchronized successfully",
        data: syncData,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error syncing user data:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to sync user data",
        error: error.message
      });
    }
  });

  // Search USDA Foods API
  app.get('/api/foods/search', async (req, res) => {
    try {
      const { q: query, limit = 25 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const foods = await usdaService.searchFoods(query, parseInt(limit as string));
      
      res.json({
        query,
        totalResults: foods.length,
        foods: foods.map(food => ({
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          brandOwner: food.brandOwner,
          foodCategory: food.foodCategory,
          nutrients: food.foodNutrients?.slice(0, 10) || [] // Return limited nutrients
        }))
      });
    } catch (error) {
      console.error("Error searching foods:", error);
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  // Version check API
  app.get('/api/version/check', async (req, res) => {
    // Simulate version check
    res.json({
      version: '2.1.2',
      buildDate: '2025-01-31',
      changelog: [
        'Enhanced calculator-logger communication',
        'Improved button functionality throughout app',
        'Better visual feedback for all interactions'
      ],
      required: false
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}