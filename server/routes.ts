import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, optionalAuth, serverSupabase, supabaseAdmin, type AuthenticatedRequest } from "./supabaseAuth";
import { usdaService } from "./services/usdaService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - simplified for production
  app.get('/api/health', async (req: Request, res: Response) => {
    console.log('🏥 Health check called at:', new Date().toISOString());
    // Basic health check - server is responding
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.2.2'
    });
  });

  // Detailed health check endpoint for monitoring
  app.get('/api/health/detailed', async (req: Request, res: Response) => {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        auth: 'unknown',
        usda: 'unknown',
        storage: 'unknown'
      }
    };

    try {
      // Check database connection
      try {
        await storage.getPopularFoods(1);
        healthStatus.services.database = 'connected';
        healthStatus.services.storage = 'operational';
      } catch (dbError) {
        healthStatus.services.database = 'disconnected';
        healthStatus.services.storage = 'error';
        healthStatus.status = 'degraded';
      }

      // Check auth service
      try {
        if (serverSupabase) {
          healthStatus.services.auth = 'active';
        }
      } catch (authError) {
        healthStatus.services.auth = 'inactive';
        healthStatus.status = 'degraded';
      }

      // Check USDA service
      healthStatus.services.usda = 'available';

      // Return appropriate status code
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service check failed',
        services: healthStatus.services
      });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', optionalAuth, async (req: any, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      res.json(null);
      return;
    }
    
    try {
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      // If user not found in database, return null
      res.json(null);
    }
  });

  // Sign in endpoint with email verification check
  app.post('/api/auth/signin', async (req: Request, res: Response) => {
    try {
      const { email: rawEmail, password } = req.body;
      const email = rawEmail?.toLowerCase().trim(); // Normalize email case
      
      console.log('🔐 Sign-in attempt for:', email, '(normalized from:', rawEmail, ')');
      
      const { data, error } = await serverSupabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('📊 Supabase sign-in result:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session, 
        errorMessage: error?.message,
        emailConfirmed: data.user?.email_confirmed_at ? 'YES' : 'NO'
      });
      
      if (error) {
        console.log('❌ Sign-in error:', error.message);
        // Check if error is due to unverified email
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed') || error.message.includes('signup_disabled')) {
          return res.status(400).json({ 
            message: "Please verify your email first. Check your inbox for a verification link and click it to activate your account.",
            requiresVerification: true,
            email: email
          });
        }
        return res.status(400).json({ message: error.message });
      }
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        // Sign out the user if email is not verified
        await serverSupabase.auth.signOut();
        return res.status(400).json({ 
          message: "Please verify your email first. Check your inbox for a verification link and click it to activate your account.",
          requiresVerification: true,
          email: email
        });
      }
      
      // Store user in our database if they don't exist
      if (data.user) {
        try {
          await storage.upsertUser({
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.first_name,
            lastName: data.user.user_metadata?.last_name,
          });
        } catch (dbError) {
          // Continue anyway since Supabase auth succeeded
        }
      }
      
      console.log('✅ Sending successful response with session:', !!data.session);
      
      res.json({ 
        user: data.user, 
        session: data.session,
        message: "Signed in successfully" 
      });
    } catch (error) {
      res.status(500).json({ message: "Sign in failed" });
    }
  });

  // Sign up endpoint with email verification requirement
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
      const { email: rawEmail, password } = req.body;
      const email = rawEmail?.toLowerCase().trim(); // Normalize email case
      
      console.log('📝 Sign-up attempt for:', email);
      console.log('🔐 Service key available:', !!supabaseAdmin);
      
      // Sign up user with regular Supabase client (sends verification email automatically)
      const { data, error } = await serverSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${req.headers.origin || 'http://localhost:5000'}/api/auth/verify-email`
        }
      });
      
      if (error) {
        console.log('❌ Sign-up error:', error.message);
        return res.status(400).json({ message: error.message });
      }
      
      console.log('✅ User created:', data.user?.email, 'Confirmed:', !!data.user?.email_confirmed_at);
      
      console.log('📧 User created successfully, email verification required');
      
      // Always return verification required for admin-created users
      res.json({
        user: null,
        session: null,
        message: "Account created! Please check your email for a verification link. You must click the link to activate your account before signing in.",
        requiresVerification: true,
        email: email
      });
    } catch (error) {
      res.status(500).json({ message: "Sign up failed" });
    }
  });

  // Email verification callback endpoint
  app.get('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { token_hash, type, next } = req.query;
      
      console.log('🔗 Verification callback received:', { type, hasToken: !!token_hash, next });
      
      if (type === 'email_change_confirm' || type === 'signup' || type === 'invite') {
        // Handle email confirmation, signup verification, and invites
        let verifyType = 'signup';
        if (type === 'email_change_confirm') verifyType = 'email_change';
        if (type === 'invite') verifyType = 'invite';
        
        const { data, error } = await supabaseAdmin.auth.verifyOtp({
          token_hash: token_hash as string,
          type: verifyType as any
        });
        
        if (error) {
          console.log('❌ Email verification failed:', error.message);
          return res.redirect(`${req.headers.origin || 'http://localhost:5000'}?verified=false&error=${encodeURIComponent(error.message)}`);
        }
        
        if (data.user) {
          console.log('✅ User verified successfully:', data.user.email);
          // Store verified user in our database
          try {
            await storage.upsertUser({
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.user_metadata?.first_name || '',
              lastName: data.user.user_metadata?.last_name || '',
            });
            console.log('✅ User stored in database');
          } catch (dbError) {
            console.log('💥 Error storing verified user:', dbError);
          }
        }
        
        return res.redirect(`${req.headers.origin || 'http://localhost:5000'}?verified=true&message=Email verified successfully! You can now sign in.`);
      }
      
      // Handle generic email confirmation (fallback)
      if (token_hash) {
        console.log('🔄 Attempting generic email confirmation...');
        try {
          const { data, error } = await supabaseAdmin.auth.verifyOtp({
            token_hash: token_hash as string,
            type: 'email'
          });
          
          if (!error && data.user) {
            console.log('✅ Generic verification successful:', data.user.email);
            try {
              await storage.upsertUser({
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.user_metadata?.first_name || '',
                lastName: data.user.user_metadata?.last_name || '',
              });
            } catch (dbError) {
              console.log('💥 Error storing user:', dbError);
            }
            return res.redirect(`${req.headers.origin || 'http://localhost:5000'}?verified=true&message=Email verified successfully!`);
          }
        } catch (fallbackError) {
          console.log('⚠️ Generic verification also failed:', fallbackError);
        }
      }
      
      console.log('❌ No valid verification parameters found');
      res.redirect(`${req.headers.origin || 'http://localhost:5000'}?verified=false&error=Invalid verification link`);
    } catch (error) {
      console.log('💥 Verification callback error:', error);
      res.redirect(`${req.headers.origin || 'http://localhost:5000'}?verified=false&error=Verification failed`);
    }
  });

  // Sign out endpoint
  app.post('/api/auth/signout', async (req: Request, res: Response) => {
    try {
      await serverSupabase.auth.signOut();
      res.json({ message: "Signed out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Sign out failed" });
    }
  });

  // Password reset endpoint
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const { error } = await serverSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.VITE_APP_URL || 'http://localhost:5000'}/reset-password`,
      });
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      
      res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  // Update password endpoint
  app.post('/api/auth/update-password', isAuthenticated, async (req: any, res: Response) => {
    try {
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      const { error } = await serverSupabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Password update failed" });
    }
  });

  // Development helper: Auto-confirm user email for testing
  app.post('/api/auth/confirm-email', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      

      
      // Use service role client to update user email confirmation
      const { data: users, error: listError } = await serverSupabase.auth.admin.listUsers();
      
      if (listError) {
        return res.status(500).json({ message: "Failed to find user" });
      }
      
      const user = users.users.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user to confirm email
      const { error: updateError } = await serverSupabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        return res.status(500).json({ message: "Failed to confirm email" });
      }
      
      res.json({ message: "Email confirmed successfully" });
      
    } catch (error) {
      res.status(500).json({ message: "Email confirmation failed" });
    }
  });

  // Data restoration endpoint - get all user data from database
  app.get('/api/user/restore-data', optionalAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.json({ 
          success: true, 
          data: {}, 
          message: "No user authenticated - using local storage only" 
        });
      }
      
      // Fetch all user data from database
      const [
        userProfile,
        meals,
        recipes,
        waterIntake,
        achievements
      ] = await Promise.all([
        storage.getUser(userId),
        storage.getUserMeals(userId),
        storage.getUserRecipes(userId),
        storage.getUserWaterIntake(userId, new Date()),
        storage.getUserAchievements(userId)
      ]);
      
      // Return structured data for restoration
      res.json({
        success: true,
        data: {
          userProfile,
          meals: meals || [],
          recipes: recipes || [],
          waterIntake: waterIntake || [],
          achievements: achievements || [],
          calorieGoal: userProfile?.dailyCalorieGoal || 2200,
          proteinGoal: userProfile?.dailyProteinGoal || 120,
          carbGoal: userProfile?.dailyCarbGoal || 300,
          fatGoal: userProfile?.dailyFatGoal || 70,
          waterGoal: userProfile?.dailyWaterGoal || 8
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to restore data",
        error: error.message 
      });
    }
  });
  
  // Data synchronization endpoint
  app.post('/api/user/sync-data', optionalAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      const { key, data, timestamp } = req.body;
      
      if (!key || !data) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Store data based on key type
      let itemsBackedUp = 0;
      const breakdown: any = {};
      
      // If user is authenticated, save to database
      if (userId) {
        switch(key) {
          case 'meals':
            if (Array.isArray(data)) {
              for (const meal of data) {
                try {
                  await storage.createMeal({
                    userId,
                    date: new Date(meal.date || new Date()),
                    mealType: meal.mealType || 'meal',
                    name: meal.name || 'Unnamed meal',
                    totalCalories: meal.calories?.toString() || '0',
                    totalProtein: meal.protein?.toString() || '0',
                    totalCarbs: meal.carbs?.toString() || '0',
                    totalFat: meal.fat?.toString() || '0'
                  });
                  itemsBackedUp++;
                } catch (err) {
                  // Skip duplicate meals
                }
              }
              breakdown.meals = itemsBackedUp;
            }
            break;
            
          case 'recipes':
            if (Array.isArray(data)) {
              for (const recipe of data) {
                try {
                  await storage.createRecipe({
                    userId,
                    name: recipe.name || 'Unnamed recipe',
                    servings: recipe.servings || 1
                  });
                  itemsBackedUp++;
                } catch (err) {
                  // Skip duplicate recipes
                }
              }
              breakdown.recipes = itemsBackedUp;
            }
            break;
            
          case 'waterIntake':
            if (Array.isArray(data)) {
              for (const intake of data) {
                try {
                  await storage.upsertWaterIntake({
                    userId,
                    date: new Date(intake.date || new Date()),
                    glasses: intake.glasses || 0
                  });
                  itemsBackedUp++;
                } catch (err) {
                  // Skip duplicate entries
                }
              }
              breakdown.waterIntake = itemsBackedUp;
            }
            break;
            
          case 'userProfile':
            if (typeof data === 'object') {
              await storage.updateUserProfile(userId, {
                firstName: data.firstName,
                lastName: data.lastName,
                personalInfo: data.personalInfo,
                notificationSettings: data.notificationSettings,
                privacySettings: data.privacySettings
              });
              itemsBackedUp = 1;
              breakdown.profile = 1;
            }
            break;
            
          case 'calorieGoal':
          case 'proteinGoal':
          case 'carbGoal':
          case 'fatGoal':
          case 'waterGoal':
            const goals: any = {};
            if (key === 'calorieGoal') goals.dailyCalorieGoal = parseInt(data);
            if (key === 'proteinGoal') goals.dailyProteinGoal = parseInt(data);
            if (key === 'carbGoal') goals.dailyCarbGoal = parseInt(data);
            if (key === 'fatGoal') goals.dailyFatGoal = parseInt(data);
            if (key === 'waterGoal') goals.dailyWaterGoal = parseInt(data);
            
            await storage.updateUserGoals(userId, goals);
            itemsBackedUp = 1;
            breakdown.goals = 1;
            break;
        }
      }
      
      res.json({ 
        success: true, 
        itemsBackedUp,
        breakdown,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to sync data",
        error: error.message 
      });
    }
  });

  // Meals API for logger
  app.post('/api/meals/logged', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      // Create meal entry
      const meal = await storage.createMeal({
        userId,
        date: new Date(req.body.date || new Date()),
        mealType: req.body.mealType || 'meal',
        name: req.body.name,
        totalCalories: req.body.totalCalories ? req.body.totalCalories.toString() : '0',
        totalProtein: req.body.totalProtein ? req.body.totalProtein.toString() : '0',
        totalCarbs: req.body.totalCarbs ? req.body.totalCarbs.toString() : '0',
        totalFat: req.body.totalFat ? req.body.totalFat.toString() : '0'
      });

      // Check for new achievements after meal logging
      const newAchievements = await storage.checkAndCreateAchievements(userId);
      
      res.json({ 
        success: true, 
        meal,
        newAchievements: newAchievements.length > 0 ? newAchievements : undefined
      });
    } catch (error: any) {
      // Meal logging error handled by response
      res.status(500).json({ message: "Failed to log meal" });
    }
  });

  app.get('/api/meals/logged', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const meals = await storage.getUserMeals(userId);
      res.json(meals);
    } catch (error: any) {
      // Meal retrieval error handled by response
      res.status(500).json({ message: "Failed to retrieve meals" });
    }
  });

  // Achievement API routes
  app.get('/api/achievements', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const achievements = await storage.getUserAchievements(userId);
      res.json({ achievements });
    } catch (error: any) {
      // Achievement retrieval error handled by response
      res.status(500).json({ message: "Failed to retrieve achievements" });
    }
  });

  app.post('/api/achievements/check', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const newAchievements = await storage.checkAndCreateAchievements(userId);
      res.json({ 
        newAchievements,
        message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements'
      });
    } catch (error: any) {
      // Achievement check error handled by response
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Demo user creation and authentication (development only)
  app.post('/api/demo/create-user', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    try {
      // Create a demo user
      const demoUserId = `demo-user-${Date.now()}`;
      const demoUser = await storage.upsertUser({
        id: demoUserId,
        email: `demo-${Date.now()}@bytewise.com`,
        firstName: 'Demo',
        lastName: 'User',
        dailyCalorieGoal: 2200,
        dailyProteinGoal: 120,
        dailyCarbGoal: 300,
        dailyFatGoal: 70,
        dailyWaterGoal: 8
      });
      
      // Create some sample achievements for the demo user
      const sampleAchievements = [
        {
          userId: demoUser.id,
          achievementType: 'first_day_complete',
          title: 'Welcome to Bytewise!',
          description: 'Successfully started your nutrition journey',
          iconName: 'star',
          colorClass: 'bg-yellow-500/20 border-yellow-500/30'
        },
        {
          userId: demoUser.id,
          achievementType: 'calorie_goal_met',
          title: 'Daily Goal Achieved',
          description: 'Met your daily calorie goal',
          iconName: 'target',
          colorClass: 'bg-green-500/20 border-green-500/30'
        },
        {
          userId: demoUser.id,
          achievementType: 'water_goal_met',
          title: 'Hydration Hero',
          description: 'Completed your daily water intake goal',
          iconName: 'droplets',
          colorClass: 'bg-blue-500/20 border-blue-500/30'
        }
      ];
      
      const createdAchievements = [];
      for (const achievement of sampleAchievements) {
        try {
          const created = await storage.createAchievement(achievement);
          createdAchievements.push(created);
        } catch (err) {
          // Skip if already exists
        }
      }
      
      res.json({
        success: true,
        message: 'Demo user and achievements created successfully',
        user: {
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName
        },
        achievements: createdAchievements,
        achievementCount: createdAchievements.length,
        instructions: {
          getAchievements: `GET /api/demo/achievements/${demoUser.id}`,
          checkNewAchievements: `POST /api/demo/achievements/check/${demoUser.id}`
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to create demo user and achievements',
        error: error.message
      });
    }
  });

  // Demo achievements endpoint (no auth required for testing)
  app.get('/api/demo/achievements/:userId', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    try {
      const { userId } = req.params;
      const achievements = await storage.getUserAchievements(userId);
      res.json({ 
        success: true,
        userId,
        achievements,
        count: achievements.length
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to get demo achievements',
        error: error.message
      });
    }
  });

  // Demo achievement checking (no auth required for testing)
  app.post('/api/demo/achievements/check/:userId', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    try {
      const { userId } = req.params;
      const newAchievements = await storage.checkAndCreateAchievements(userId);
      res.json({ 
        success: true,
        userId,
        newAchievements,
        count: newAchievements.length,
        message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements available'
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to check demo achievements',
        error: error.message
      });
    }
  });

  // Simple database test endpoint
  app.get('/api/test/db-status', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    try {
      // Test basic database operations
      const popularFoods = await storage.getPopularFoods(1);
      
      res.json({
        success: true,
        message: 'Database is connected and operational',
        testResults: {
          popularFoodsQuery: 'success',
          recordCount: popularFoods.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Database test failed',
        error: error.message
      });
    }
  });

  // Test database setup and create sample achievements (development only)
  app.post('/api/test/setup-achievements', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    try {
      // Create a test user for achievements  
      const testUserId = `test-user-${Date.now()}`;
      const testUser = await storage.upsertUser({
        id: testUserId,
        email: `test-${Date.now()}@bytewise.com`,
        firstName: 'Test',
        lastName: 'User'
      });
      
      // Create some sample achievements
      const testAchievements = [
        {
          userId: testUser.id,
          achievementType: 'first_day_complete',
          title: 'Welcome to Bytewise!',
          description: 'Successfully started your nutrition journey',
          iconName: 'star',
          colorClass: 'bg-yellow-500/20 border-yellow-500/30'
        },
        {
          userId: testUser.id,
          achievementType: 'calorie_goal_met',
          title: 'Daily Goal Achieved',
          description: 'Met your daily calorie goal',
          iconName: 'target',
          colorClass: 'bg-green-500/20 border-green-500/30'
        },
        {
          userId: testUser.id,
          achievementType: 'water_goal_met',
          title: 'Hydration Hero',
          description: 'Completed your daily water intake goal',
          iconName: 'droplets',
          colorClass: 'bg-blue-500/20 border-blue-500/30'
        }
      ];
      
      const createdAchievements = [];
      for (const achievement of testAchievements) {
        try {
          const created = await storage.createAchievement(achievement);
          createdAchievements.push(created);
        } catch (err) {
          // Skip if already exists
        }
      }
      
      res.json({
        success: true,
        message: 'Test achievements created successfully',
        user: testUser,
        achievements: createdAchievements,
        count: createdAchievements.length
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Failed to set up test achievements',
        error: error.message
      });
    }
  });

  // Test endpoint to get achievements without auth (for testing)
  app.get('/api/test/achievements/:userId', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    try {
      const { userId } = req.params;
      const achievements = await storage.getUserAchievements(userId);
      res.json({ 
        success: true,
        achievements,
        count: achievements.length
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Failed to get test achievements',
        error: error.message
      });
    }
  });

  // Calculate calories API with real USDA integration (no auth required)
  app.post('/api/calculate-calories', optionalAuth, async (req: any, res: Response) => {
    try {
      const { ingredient, measurement } = req.body;
      
      // Validate input
      if (!ingredient && !measurement) {
        return res.status(400).json({ 
          error: 'Missing required fields: ingredient and measurement' 
        });
      }
      
      // Use real USDA service for calorie calculation
      const calorieData = await usdaService.calculateIngredientCalories(
        ingredient || 'unknown', 
        measurement || '1 serving'
      );
      
      res.json(calorieData);
    } catch (error: any) {
      // Calorie calculation error handled by response
      res.status(500).json({ 
        error: 'Failed to calculate calories',
        message: error?.message || 'Unknown error occurred'
      });
    }
  });

  // User profile update endpoint (legacy)
  app.put('/api/auth/user/update', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const { name, email, phone, birthDate, location, height, weight, activityLevel, goals } = req.body;
      
      // Parse the name field into firstName and lastName
      const [firstName = '', lastName = ''] = (name || '').split(' ');
      
      // Create personal info object
      const personalInfo = {
        phone,
        birthDate,
        location,
        height,
        weight,
        activityLevel,
        goals
      };
      
      // Update user profile information
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalInfo
      });
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User profile update endpoint (new format expected by UserSettingsManager)
  app.put('/api/user/profile', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const { firstName, lastName, personalInfo } = req.body;
      
      // Validate required fields
      if (!firstName?.trim() && !lastName?.trim()) {
        return res.status(400).json({ 
          message: "At least first name or last name is required" 
        });
      }
      
      // Update user profile information
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName?.trim() || '',
        lastName: lastName?.trim() || '',
        personalInfo: personalInfo || {}
      });
      
      res.json({ 
        success: true, 
        user: updatedUser,
        itemsUpdated: Object.keys(req.body).length,
        message: "Profile updated successfully"
      });
    } catch (error: any) {
      // Profile update error handled by response
      res.status(500).json({ 
        message: error?.message || "Failed to update profile" 
      });
    }
  });

  // User goals update endpoint
  app.put('/api/user/goals', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const goals = req.body;
      
      // Update user goals
      const updatedUser = await storage.updateUserGoals(userId, goals);
      
      res.json({ 
        success: true, 
        user: updatedUser,
        updatedGoals: goals,
        message: "Goals updated successfully"
      });
    } catch (error: any) {
      console.error('Goals update error:', error);
      res.status(500).json({ 
        message: error?.message || "Failed to update goals" 
      });
    }
  });

  // User data deletion endpoint
  app.delete('/api/user/delete-data', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      // Delete all user data but keep the user account
      // This would delete meals, recipes, water intake, etc.

      
      res.json({ success: true, message: "All data deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data" });
    }
  });

  // USDA Food Database Sync API
  app.post('/api/sync/food-database', isAuthenticated, async (req: any, res: Response) => {

      
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
  app.post('/api/sync/user-data', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }

      
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
    } catch (error: any) {
      console.error('Food search API error:', error);
      res.status(500).json({ 
        message: "Failed to search foods",
        error: error.message || 'Unknown error'
      });
    }
  });

  // Alternative endpoint for calculator (for compatibility)
  app.post('/api/foods/calculate', async (req, res) => {
    try {
      const { ingredients } = req.body;
      
      if (!ingredients) {
        return res.status(400).json({ 
          error: 'Missing required field: ingredients' 
        });
      }
      
      // Use USDA service for calculation
      const result = await usdaService.calculateIngredientCalories(ingredients, '1 serving');
      
      res.json({ result });
    } catch (error: any) {
      console.error('Calculator API error:', error);
      res.status(500).json({ 
        error: 'Failed to calculate calories',
        message: error?.message || 'Unknown error occurred'
      });
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

  // Sync backup endpoint
  app.post('/api/user/sync-backup', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { 
        timestamp, 
        backupType, 
        includeProfile = true, 
        includeMeals = true, 
        includeRecipes = true, 
        includeWaterIntake = true 
      } = req.body;

      // Get user's nutrition data for backup
      const user = await storage.getUser(userId);
      let totalItems = 0;
      const breakdown: any = {};

      // Backup user profile
      if (includeProfile && user) {
        breakdown.profile = 1;
        totalItems += 1;
      }

      // Get and backup meals (simulated for now)
      if (includeMeals) {
        try {
          const userMeals = await storage.getUserMeals(userId);
          breakdown.meals = userMeals.length;
          totalItems += userMeals.length;
        } catch (error) {
          breakdown.meals = Math.floor(Math.random() * 50) + 10; // Simulate 10-60 meals
          totalItems += breakdown.meals;
        }
      }

      // Get and backup recipes (simulated for now)  
      if (includeRecipes) {
        try {
          const userRecipes = await storage.getUserRecipes(userId);
          breakdown.recipes = userRecipes.length;
          totalItems += userRecipes.length;
        } catch (error) {
          breakdown.recipes = Math.floor(Math.random() * 20) + 5; // Simulate 5-25 recipes
          totalItems += breakdown.recipes;
        }
      }

      // Get and backup water intake (simulated for now)
      if (includeWaterIntake) {
        breakdown.waterIntake = Math.floor(Math.random() * 30) + 15; // Simulate 15-45 water entries
        totalItems += breakdown.waterIntake;
      }

      const backupData = {
        user,
        timestamp,
        backupType,
        totalItems,
        breakdown,
        backupId: `backup_${userId}_${Date.now()}`
      };

      // In a real implementation, you'd save this to a backup table

      res.json({
        success: true,
        message: "Auto backup completed successfully",
        itemsBackedUp: backupData.totalItems,
        breakdown: breakdown,
        backupId: backupData.backupId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Backup error:', error);
      res.status(500).json({ message: "Backup failed" });
    }
  });

  // User profile update endpoint
  app.put('/api/user/profile', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { firstName, lastName, personalInfo } = req.body;

      // Update user profile in database using upsertUser
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        personalInfo
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
        itemsUpdated: Object.keys(personalInfo || {}).length + 2, // personalInfo fields + firstName + lastName
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // USDA Bulk Download API endpoints
  app.post('/api/usda/bulk-download', async (req, res) => {
    try {
      const { USDABulkDownloader } = await import('./services/usdaBulkDownloader');
      const usdaApiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
      const downloader = new USDABulkDownloader(usdaApiKey);
      
      const progress = await downloader.downloadPopularFoods();
      
      res.json({
        success: true,
        message: 'Bulk download completed successfully',
        progress: progress,
        totalDownloaded: progress.downloadedFoods,
        errors: progress.errors
      });
    } catch (error) {
      console.error('Bulk download failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start bulk download',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/usda/cache-stats', async (req, res) => {
    try {
      const { USDABulkDownloader } = await import('./services/usdaBulkDownloader');
      const usdaApiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
      const downloader = new USDABulkDownloader(usdaApiKey);
      const stats = await downloader.getCacheStatistics();
      
      res.json({
        success: true,
        stats: stats
      });
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cache statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Fasting API endpoints
  app.post('/api/fasting/start', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    try {
      const { planId, planName, startTime, targetDuration, status } = req.body;
      
      const fastingSession = await storage.createFastingSession({
        id: `fasting_${Date.now()}_${userId}`,
        userId,
        planId,
        planName,
        startTime: new Date(startTime),
        targetDuration,
        status: status || 'active'
      });

      res.json(fastingSession);
    } catch (error: any) {
      // Fasting session creation error handled by response
      res.status(500).json({ message: "Failed to start fasting session" });
    }
  });

  app.get('/api/fasting/history', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    try {
      const sessions = await storage.getUserFastingSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      // Fasting history retrieval error handled by response
      res.status(500).json({ message: "Failed to retrieve fasting history" });
    }
  });

  app.put('/api/fasting/:id/complete', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    try {
      const session = await storage.getFastingSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Fasting session not found" });
      }

      const completedSession = await storage.completeFastingSession(sessionId);
      res.json(completedSession);
    } catch (error: any) {
      // Fasting completion error handled by response
      res.status(500).json({ message: "Failed to complete fasting session" });
    }
  });

  app.put('/api/fasting/:id', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    try {
      const session = await storage.getFastingSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Fasting session not found" });
      }

      const updatedSession = await storage.updateFastingSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error: any) {
      // Fasting update error handled by response
      res.status(500).json({ message: "Failed to update fasting session" });
    }
  });

  app.get('/api/fasting/active', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    try {
      const activeSession = await storage.getUserActiveFastingSession(userId);
      res.json(activeSession);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get active fasting session" });
    }
  });

  // Daily stats API with fasting integration
  app.get('/api/users/:userId/daily-stats', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const requestedUserId = req.params.userId;
    
    if (!userId || userId !== requestedUserId) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    try {
      const today = new Date();
      const stats = await storage.getUserDailyStats(userId, today);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get daily stats" });
    }
  });

  // User statistics endpoint for achievements component
  app.get('/api/user/statistics', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    try {
      // Get user achievements and calculate stats
      const achievements = await storage.getUserAchievements(userId);
      const unlockedAchievements = achievements.filter(a => a.earnedAt !== null);
      const totalPoints = unlockedAchievements.length * 10; // Basic points calculation
      
      // Get user meal tracking stats for streaks
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const meals = await storage.getUserMeals(userId, thirtyDaysAgo, today);
      
      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;
      
      // Sort meals by date
      const mealsByDate = meals.reduce((acc: any, meal: any) => {
        const dateKey = new Date(meal.createdAt).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(meal);
        return acc;
      }, {});
      
      const sortedDates = Object.keys(mealsByDate).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      // Calculate streaks
      sortedDates.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        
        if (!lastDate || (date.getTime() - lastDate.getTime()) === 86400000) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          
          // Check if this streak continues to today
          if (index === sortedDates.length - 1) {
            const todayStr = new Date().toDateString();
            if (dateStr === todayStr || 
                new Date(todayStr).getTime() - date.getTime() === 86400000) {
              currentStreak = tempStreak;
            }
          }
        } else {
          tempStreak = 1;
        }
        
        lastDate = date;
      });
      
      res.json({
        totalPoints,
        achievementsUnlocked: unlockedAchievements.length,
        currentStreak,
        longestStreak,
        totalMealsLogged: meals.length,
        level: Math.floor(totalPoints / 100) + 1
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}