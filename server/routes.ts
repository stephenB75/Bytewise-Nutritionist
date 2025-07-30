import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFoodSchema, insertRecipeSchema, insertRecipeIngredientSchema, insertMealSchema, insertMealFoodSchema, insertWaterIntakeSchema } from "@shared/schema";
import { z } from "zod";

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

  // User routes
  app.patch('/api/user/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = req.body;
      const user = await storage.updateUserGoals(userId, goals);
      res.json(user);
    } catch (error) {
      console.error("Error updating user goals:", error);
      res.status(500).json({ message: "Failed to update goals" });
    }
  });

  // Food routes
  app.get('/api/foods/search', async (req, res) => {
    try {
      const { q: query, limit } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const foods = await storage.searchFoods(query, limit ? parseInt(limit as string) : undefined);
      res.json(foods);
    } catch (error) {
      console.error("Error searching foods:", error);
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  app.get('/api/foods/popular', async (req, res) => {
    try {
      const { limit } = req.query;
      const foods = await storage.getPopularFoods(limit ? parseInt(limit as string) : undefined);
      res.json(foods);
    } catch (error) {
      console.error("Error fetching popular foods:", error);
      res.status(500).json({ message: "Failed to fetch popular foods" });
    }
  });

  app.get('/api/foods/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const food = await storage.getFoodById(id);
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      res.json(food);
    } catch (error) {
      console.error("Error fetching food:", error);
      res.status(500).json({ message: "Failed to fetch food" });
    }
  });

  app.post('/api/foods', isAuthenticated, async (req, res) => {
    try {
      const foodData = insertFoodSchema.parse(req.body);
      const food = await storage.createFood(foodData);
      res.status(201).json(food);
    } catch (error) {
      console.error("Error creating food:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid food data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food" });
    }
  });

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipes = await storage.getUserRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeData = insertRecipeSchema.parse({ ...req.body, userId });
      const recipe = await storage.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.patch('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipeData = req.body;
      const recipe = await storage.updateRecipe(id, recipeData);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRecipe(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Recipe ingredient routes
  app.post('/api/recipes/:id/ingredients', isAuthenticated, async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const ingredientData = insertRecipeIngredientSchema.parse({ ...req.body, recipeId });
      const ingredient = await storage.addRecipeIngredient(ingredientData);
      res.status(201).json(ingredient);
    } catch (error) {
      console.error("Error adding recipe ingredient:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add ingredient" });
    }
  });

  app.delete('/api/recipes/:recipeId/ingredients/:foodId', isAuthenticated, async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      const foodId = parseInt(req.params.foodId);
      await storage.removeRecipeIngredient(recipeId, foodId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing recipe ingredient:", error);
      res.status(500).json({ message: "Failed to remove ingredient" });
    }
  });

  app.patch('/api/recipes/:id/nutrition', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const nutrition = req.body;
      const recipe = await storage.updateRecipeNutrition(id, nutrition);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe nutrition:", error);
      res.status(500).json({ message: "Failed to update recipe nutrition" });
    }
  });

  // Meal routes
  app.get('/api/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const meals = await storage.getUserMeals(userId, start, end);
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  // Get today's meals
  app.get('/api/meals/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const meals = await storage.getMealsByDate(userId, today);
      res.json(meals || []);
    } catch (error) {
      console.error("Error fetching today's meals:", error);
      res.status(500).json({ message: "Failed to fetch today's meals" });
    }
  });

  app.get('/api/meals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meal ID" });
      }
      const meal = await storage.getMealById(id);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error) {
      console.error("Error fetching meal:", error);
      res.status(500).json({ message: "Failed to fetch meal" });
    }
  });

  app.post('/api/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealData = insertMealSchema.parse({ ...req.body, userId });
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      console.error("Error creating meal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meal" });
    }
  });

  app.patch('/api/meals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meal ID" });
      }
      const mealData = req.body;
      const meal = await storage.updateMeal(id, mealData);
      res.json(meal);
    } catch (error) {
      console.error("Error updating meal:", error);
      res.status(500).json({ message: "Failed to update meal" });
    }
  });

  app.delete('/api/meals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meal ID" });
      }
      await storage.deleteMeal(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meal:", error);
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Meal food routes
  app.post('/api/meals/:id/foods', isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      if (isNaN(mealId)) {
        return res.status(400).json({ message: "Invalid meal ID" });
      }
      const mealFoodData = insertMealFoodSchema.parse({ ...req.body, mealId });
      const mealFood = await storage.addMealFood(mealFoodData);
      res.status(201).json(mealFood);
    } catch (error) {
      console.error("Error adding meal food:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal food data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add meal food" });
    }
  });

  app.delete('/api/meals/:mealId/foods/:foodId', isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.mealId);
      const foodId = parseInt(req.params.foodId);
      await storage.removeMealFood(mealId, foodId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing meal food:", error);
      res.status(500).json({ message: "Failed to remove meal food" });
    }
  });

  // Water intake routes
  app.get('/api/water/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date(req.params.date);
      const waterIntake = await storage.getUserWaterIntake(userId, date);
      res.json(waterIntake || { glasses: 0 });
    } catch (error) {
      console.error("Error fetching water intake:", error);
      res.status(500).json({ message: "Failed to fetch water intake" });
    }
  });

  app.post('/api/water', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const waterData = insertWaterIntakeSchema.parse({ ...req.body, userId });
      const waterIntake = await storage.upsertWaterIntake(waterData);
      res.json(waterIntake);
    } catch (error) {
      console.error("Error updating water intake:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid water intake data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update water intake" });
    }
  });

  // Analytics routes
  app.get('/api/stats/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date(req.params.date);
      const stats = await storage.getUserDailyStats(userId, date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ message: "Failed to fetch daily stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
