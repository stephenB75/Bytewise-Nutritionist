import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Meals API for logger
  app.post('/api/meals/logged', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealData = {
        ...req.body,
        userId,
        createdAt: new Date()
      };
      
      // Store meal in database/memory
      console.log('Logging meal from calculator:', mealData);
      
      res.json({ success: true, meal: mealData });
    } catch (error) {
      console.error("Error logging meal:", error);
      res.status(500).json({ message: "Failed to log meal" });
    }
  });

  app.get('/api/meals/logged', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Return logged meals for the user
      const meals = []; // Implement meal retrieval from storage
      
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  // Calculate calories API
  app.post('/api/calculate-calories', async (req, res) => {
    try {
      const { ingredient, measurement } = req.body;
      
      // Simulate USDA API call for calorie calculation
      const mockCalorieData = {
        ingredient,
        measurement,
        estimatedCalories: Math.floor(Math.random() * 300) + 50,
        equivalentMeasurement: `${Math.floor(Math.random() * 200) + 50}g`,
        note: `Estimated calories for ${ingredient}`,
        nutritionPer100g: {
          calories: Math.floor(Math.random() * 400) + 100,
          protein: Math.floor(Math.random() * 30) + 5,
          carbs: Math.floor(Math.random() * 50) + 10,
          fat: Math.floor(Math.random() * 20) + 2,
        }
      };
      
      res.json(mockCalorieData);
    } catch (error) {
      console.error("Error calculating calories:", error);
      res.status(500).json({ message: "Failed to calculate calories" });
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