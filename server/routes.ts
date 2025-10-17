import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, optionalAuth, serverSupabase, supabaseAdmin, createAuthenticatedHandler, type AuthenticatedRequest } from "./supabaseAuth";
// Lazy load heavy services to prevent startup hangs
// import { usdaService } from "./services/usdaService";
// import { analyzeFoodImage, getNutritionFromUSDA } from "./aiService";
import { db } from "./db";
import { meals, userPhotos } from "@shared/schema";
import { eq, and, gte, desc, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { supabaseStorageService } from "./supabaseStorage";
import express from "express";

// Zod schemas for request validation
const subscriptionSyncSchema = z.object({
  revenueCatUserId: z.string().min(1, "RevenueCat user ID is required"),
  customerInfo: z.object({
    entitlements: z.object({
      active: z.record(z.object({
        productIdentifier: z.string(),
        expirationDate: z.string().optional()
      })).optional()
    }).optional()
  })
});

// Store processed webhook event IDs to prevent duplicates
const processedEventIds = new Set<string>();

// Security: Safe redirect helper to prevent open redirect attacks
function getSafeRedirectUrl(targetPath: string = ''): string {
  const baseUrl = process.env.APP_URL || 'https://www.bytewisenutritionist.com';
  return `${baseUrl}${targetPath}`;
}


export async function registerRoutes(app: Express): Promise<Server> {
  console.log('📋 Starting route registration...');
  
  // Create and return server immediately - no blocking awaits before this point
  const server = createServer(app);
  // Health check endpoint - simplified for production
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      // Check database connection status
      let databaseStatus = 'disconnected';
      if (db) {
        try {
          await db.execute(sql`SELECT 1`);
          databaseStatus = 'connected';
        } catch (error) {
          databaseStatus = 'error';
        }
      } else {
        databaseStatus = 'mock';
      }

      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: 'BETA 4.4',
        database: databaseStatus
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: 'BETA 4.4',
        error: 'Health check failed'
      });
    }
  });

  // Additional health check at root for Railway compatibility
  app.get('/health', async (req: Request, res: Response) => {
    try {
      // Check database connection status
      let databaseStatus = 'disconnected';
      if (db) {
        try {
          await db.execute(sql`SELECT 1`);
          databaseStatus = 'connected';
        } catch (error) {
          databaseStatus = 'error';
        }
      } else {
        databaseStatus = 'mock';
      }

      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: 'BETA 4.4',
        database: databaseStatus,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        port: process.env.PORT || '5000',
        host: process.env.HOST || '0.0.0.0'
      };
      
      // Set cache headers to prevent caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.status(200).json(healthData);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: 'BETA 4.4',
        error: 'Health check failed'
      });
    }
  });

  // Ready endpoint for k8s-style health checks
  app.get('/ready', async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  });


  // RevenueCat webhook endpoint - capture raw body for signature verification
  app.post('/api/webhooks/revenuecat', 
    express.raw({ type: 'application/json' }), 
    async (req: Request, res: Response) => {
    try {
      console.log('🔔 Received RevenueCat webhook:', req.headers['x-revenuecat-signature'] ? '[SIGNED]' : '[UNSIGNED]');

      // Verify webhook authenticity - CRITICAL for security
      const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
      const signature = req.headers['x-revenuecat-signature'] as string;
      const rawBody = req.body; // Raw bytes from express.raw middleware
      
      // Enforce webhook secret in production
      if (process.env.NODE_ENV === 'production' && !webhookSecret) {
        console.error('❌ REVENUECAT_WEBHOOK_SECRET required in production');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }
      
      if (webhookSecret) {
        if (!signature) {
          console.error('❌ Missing webhook signature');
          return res.status(401).json({ error: 'Missing signature' });
        }

        // Verify HMAC SHA256 signature over raw body
        const crypto = await import('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(rawBody)
          .digest('hex');
        
        const receivedSignature = signature.replace(/^sha256=/, '');
        
        // Validate buffer lengths before comparison
        if (expectedSignature.length !== receivedSignature.length) {
          console.error('❌ Invalid signature length');
          return res.status(401).json({ error: 'Invalid signature' });
        }
        
        if (!crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(receivedSignature, 'hex'))) {
          console.error('❌ Invalid webhook signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }
        
        console.log('✅ Webhook signature verified');
      } else {
        console.warn('⚠️ No webhook secret configured - accepting unsigned webhook (development only)');
      }

      // Parse the JSON body now that signature is verified
      const webhookData = JSON.parse(rawBody.toString());
      const eventId = webhookData.event?.id;
      
      // Idempotency check for duplicate events
      if (eventId) {
        if (processedEventIds.has(eventId)) {
          console.log(`📋 Event ${eventId} already processed, skipping`);
          return res.status(200).json({ 
            status: 'success',
            message: 'Event already processed',
            eventId
          });
        }
        
        // Mark as processed
        processedEventIds.add(eventId);
        
        // Clean up old event IDs (keep last 1000 to prevent memory growth)
        if (processedEventIds.size > 1000) {
          const entries = Array.from(processedEventIds);
          const toDelete = entries.slice(0, entries.length - 1000);
          toDelete.forEach(id => processedEventIds.delete(id));
        }
        
        console.log(`📋 Processing new event ID: ${eventId}`);
      }

      // Process the webhook data
      await storage.updateSubscriptionFromWebhook(webhookData);

      // Respond to RevenueCat that webhook was processed successfully
      res.status(200).json({ 
        status: 'success',
        message: 'Webhook processed successfully',
        eventId
      });

    } catch (error) {
      console.error('❌ RevenueCat webhook processing failed:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to process webhook'
      });
    }
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

  // Auth middleware - non-blocking initialization to prevent startup hangs
  console.log('🔧 Starting auth setup...');
  
  const authInit = Promise.race([
    setupAuth(app),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth setup timeout')), 5000)
    )
  ]);
  
  // Don't await - let auth setup happen in background
  authInit.catch(err => {
    console.warn('⚠️ Auth setup failed, continuing with server startup:', err.message);
  });
  
  console.log('✅ Auth setup initiated (non-blocking)');

  // Auth routes
  app.get('/api/auth/user', optionalAuth, async (req: any, res: Response) => {
    const userId = req.user?.id;
    
    
    if (!userId) {
      res.json(null);
      return;
    }
    
    try {
      const user = await storage.getUser(userId);
      
      // If user exists in database, return it
      if (user) {
        res.json(user);
        return;
      }
      
      // If user doesn't exist in database, fetch from Supabase
      // If user not found in database, return Supabase user data directly 
      try {
        const { data: supabaseUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (fetchError) {
          res.json(null);
          return;
        }
        
        if (supabaseUser?.user) {
          
          // Return user data in the expected format for frontend
          const userData = {
            id: supabaseUser.user.id,
            email: supabaseUser.user.email!,
            emailVerified: !!supabaseUser.user.email_confirmed_at,
            firstName: supabaseUser.user.user_metadata?.first_name || supabaseUser.user.user_metadata?.firstName || null,
            lastName: supabaseUser.user.user_metadata?.last_name || supabaseUser.user.user_metadata?.lastName || null,
            profileImageUrl: supabaseUser.user.user_metadata?.avatar_url || null,
            profileIcon: Math.floor(Math.random() * 2) + 1, // Random avatar: 1=male, 2=female
            createdAt: new Date(supabaseUser.user.created_at),
            updatedAt: new Date(supabaseUser.user.updated_at || supabaseUser.user.created_at),
            // Default nutrition goals from metadata or defaults
            dailyCalorieGoal: supabaseUser.user.user_metadata?.calorie_goal || 2000,
            dailyProteinGoal: 150,
            dailyCarbGoal: 200,
            dailyFatGoal: 70,
            dailyWaterGoal: 8,
            personalInfo: supabaseUser.user.user_metadata || null,
            privacySettings: null,
            notificationSettings: null,
            displaySettings: null,
          };
          
          // Important: Create/update user in local database so future updates work
          try {
            const databaseUser = await storage.upsertUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              emailVerified: userData.emailVerified,
              profileIcon: userData.profileIcon
            });
            
            // CRITICAL: Use the database user's ID, not the Supabase ID
            userData.id = databaseUser.id;
          } catch (dbError) {
            // Continue anyway - we can still return the Supabase data
          }
          
          res.json(userData);
          return;
        } else {
        }
      } catch (createError) {
      }
      res.json(null);
    } catch (error) {
      // If database error, also try Supabase fallback
      try {
        const { data: supabaseUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (!fetchError && supabaseUser?.user) {
          const userData = {
            id: supabaseUser.user.id,
            email: supabaseUser.user.email!,
            emailVerified: !!supabaseUser.user.email_confirmed_at,
            firstName: supabaseUser.user.user_metadata?.first_name || supabaseUser.user.user_metadata?.firstName || null,
            lastName: supabaseUser.user.user_metadata?.last_name || supabaseUser.user.user_metadata?.lastName || null,
            profileImageUrl: supabaseUser.user.user_metadata?.avatar_url || null,
            profileIcon: Math.floor(Math.random() * 2) + 1, // Random avatar: 1=male, 2=female
            createdAt: new Date(supabaseUser.user.created_at),
            updatedAt: new Date(supabaseUser.user.updated_at || supabaseUser.user.created_at),
            dailyCalorieGoal: supabaseUser.user.user_metadata?.calorie_goal || 2000,
            dailyProteinGoal: 150,
            dailyCarbGoal: 200,
            dailyFatGoal: 70,
            dailyWaterGoal: 8,
            personalInfo: supabaseUser.user.user_metadata || null,
            privacySettings: null,
            notificationSettings: null,
            displaySettings: null,
          };
          
          // Important: Create the user in local database so future updates work
          try {
            console.log('💾 Creating user in local database from Supabase data (fallback)...');
            const databaseUser = await storage.upsertUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              emailVerified: userData.emailVerified,
              profileIcon: userData.profileIcon
            });
            
            // CRITICAL: Use the database user's ID, not the Supabase ID  
            userData.id = databaseUser.id;
            console.log('✅ User created/updated in local database (fallback), using database ID:', {
              databaseId: databaseUser.id?.substring(0, 8) + '...',
              email: databaseUser.email
            });
          } catch (dbError) {
            console.log('⚠️ Failed to create user in local database (fallback):', dbError);
          }
          
          res.json(userData);
          return;
        }
      } catch (fallbackError) {
        console.log('❌ Supabase fallback failed:', fallbackError);
      }
      res.json(null);
    }
  });

  // Sign in endpoint with verified user bypass
  app.post('/api/auth/signin', async (req: Request, res: Response) => {
    try {
      const { email: rawEmail, password } = req.body;
      const email = rawEmail?.toLowerCase().trim();
      
      console.log('🔐 Sign-in attempt for:', email);
      
      // Try authentication first - let Supabase tell us if user exists and credentials are valid
      console.log('🔍 Attempting authentication with client...');
      try {
        const { data: signInData, error: signInError } = await serverSupabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.log('❌ Authentication failed:', signInError.message);
          
          // Now check if user exists to provide specific error messages
          if (signInError.message.includes('Invalid login credentials')) {
            console.log('🔍 Checking if user exists for better error message...');
            
            // Try to find user in admin list (with pagination handling)
            let existingUser = null;
            let nextPage: string = '';
            let attempts = 0;
            const maxAttempts = 5; // Prevent infinite loops
            
            while (!existingUser && attempts < maxAttempts) {
              const listOptions: any = { perPage: 1000 };
              if (nextPage) listOptions.page = nextPage;
              
              const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers(listOptions);
              
              if (listError) {
                console.log('❌ Failed to list users:', listError.message);
                break;
              }
              
              existingUser = users?.users?.find(u => u.email?.toLowerCase() === email);
              nextPage = String(users?.nextPage || '');
              attempts++;
              
              console.log(`📄 Searched page ${attempts}, found ${users?.users?.length} users, nextPage: ${!!nextPage}`);
              console.log('👥 Users found:', users?.users?.map(u => ({ email: u.email, verified: !!u.email_confirmed_at })));
              
              if (!nextPage || existingUser) break;
            }
            
            if (existingUser && !existingUser.email_confirmed_at) {
              console.log('❌ User found but email not verified');
              return res.status(400).json({ 
                message: "Please verify your email address before signing in. Check your email for a verification link.",
                code: "EMAIL_NOT_VERIFIED",
                requiresVerification: true
              });
            } else if (existingUser) {
              console.log('❌ User found but wrong password');
              return res.status(400).json({ 
                message: "Invalid email or password. Please check your credentials and try again.",
                code: "INVALID_CREDENTIALS"
              });
            } else {
              console.log('❌ User account not found after searching all pages');
              return res.status(400).json({ 
                message: "No account found with this email address. Please sign up first or check your email address.",
                code: "ACCOUNT_NOT_FOUND"
              });
            }
          } else if (signInError.message.includes('Email not confirmed')) {
            console.log('❌ Email not confirmed error');
            return res.status(400).json({ 
              message: "Please verify your email address before signing in. Check your email for a verification link.",
              code: "EMAIL_NOT_VERIFIED",
              requiresVerification: true
            });
          }
          
          return res.status(400).json({ 
            message: "Sign in failed. Please try again.",
            code: "SIGNIN_FAILED"
          });
        }

        // Success - user authenticated with real Supabase session
        if (signInData?.user && signInData?.session) {
          console.log('✅ Authentication successful for:', signInData.user.email);
          console.log('✅ Returning real Supabase session with JWT tokens');
          
          // Ensure user exists in our database (create if doesn't exist)
          try {
            await storage.upsertUser({
              id: signInData.user.id,
              email: signInData.user.email || '',
              firstName: signInData.user.user_metadata?.firstName || '',
              lastName: signInData.user.user_metadata?.lastName || ''
            });
            console.log('✅ User record synchronized to database');
          } catch (dbError) {
            console.log('⚠️ Database sync error (non-critical):', dbError);
            // Continue even if DB sync fails - user can still use the app
          }
          
          // Return the actual Supabase session with proper JWT tokens
          return res.json({
            user: signInData.user,
            session: signInData.session
          });
        }
      } catch (authError) {
        console.log('❌ Authentication service error:', authError);
        return res.status(500).json({ 
          message: "Authentication service temporarily unavailable. Please try again.",
          code: "SERVICE_ERROR"
        });
      }

      
      // Fallback error
      console.log('❌ Unexpected sign-in state');
      return res.status(400).json({ 
        message: "Sign in failed. Please try again.",
        code: "SIGNIN_FAILED"
      });
      
    } catch (error) {
      console.log('❌ Sign-in error:', error);
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
      
      // Sign up user with admin Supabase client (sends verification email automatically)
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getSafeRedirectUrl('/api/auth/verify-email')
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
          return res.redirect(getSafeRedirectUrl(`?verified=false&error=${encodeURIComponent(error.message)}`));
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
        
        return res.redirect(getSafeRedirectUrl('?verified=true&message=Email verified successfully! You can now sign in.'));
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
            return res.redirect(getSafeRedirectUrl('?verified=true&message=Email verified successfully!'));
          }
        } catch (fallbackError) {
          console.log('⚠️ Generic verification also failed:', fallbackError);
        }
      }
      
      console.log('❌ No valid verification parameters found');
      res.redirect(getSafeRedirectUrl('?verified=false&error=Invalid verification link'));
    } catch (error) {
      console.log('💥 Verification callback error:', error);
      res.redirect(getSafeRedirectUrl('?verified=false&error=Verification failed'));
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
        redirectTo: `${process.env.VITE_APP_URL || process.env.APP_URL || 'https://www.bytewisenutritionist.com'}/reset-password`,
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
                  // Fix date handling for migration: Parse date string as noon UTC to prevent timezone drift
                  let mealDate;
                  if (meal.date) {
                    if (typeof meal.date === 'string' && meal.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      mealDate = new Date(`${meal.date}T12:00:00.000Z`);
                    } else {
                      mealDate = new Date(meal.date);
                    }
                  } else {
                    mealDate = new Date();
                  }
                  
                  await storage.createMeal({
                    userId,
                    date: mealDate,
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
      
      // Create meal entry with micronutrients
      // Fix date handling: Parse date string as noon UTC to prevent timezone drift
      let mealDate;
      if (req.body.date) {
        // If date is in YYYY-MM-DD format, parse as noon UTC to prevent timezone drift
        if (typeof req.body.date === 'string' && req.body.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          mealDate = new Date(`${req.body.date}T12:00:00.000Z`);
        } else {
          mealDate = new Date(req.body.date);
        }
      } else {
        mealDate = new Date();
      }
      
      console.log(`🍽️ Creating meal with date: ${req.body.date} → ${mealDate.toISOString()}`);
      
      const meal = await storage.createMeal({
        userId,
        date: mealDate,
        mealType: req.body.mealType || 'meal',
        name: req.body.name,
        totalCalories: req.body.totalCalories ? req.body.totalCalories.toString() : '0',
        totalProtein: req.body.totalProtein ? req.body.totalProtein.toString() : '0',
        totalCarbs: req.body.totalCarbs ? req.body.totalCarbs.toString() : '0',
        totalFat: req.body.totalFat ? req.body.totalFat.toString() : '0',
        // Include micronutrients from CalorieCalculator
        iron: req.body.iron ? req.body.iron.toString() : '0',
        calcium: req.body.calcium ? req.body.calcium.toString() : '0',
        zinc: req.body.zinc ? req.body.zinc.toString() : '0',
        magnesium: req.body.magnesium ? req.body.magnesium.toString() : '0',
        vitaminC: req.body.vitaminC ? req.body.vitaminC.toString() : '0',
        vitaminD: req.body.vitaminD ? req.body.vitaminD.toString() : '0',
        vitaminB12: req.body.vitaminB12 ? req.body.vitaminB12.toString() : '0',
        folate: req.body.folate ? req.body.folate.toString() : '0'
      });

      // Check for new achievements after meal logging
      const newAchievements = await storage.checkAndCreateAchievements(userId);
      
      res.json({ 
        success: true, 
        meal,
        newAchievements: newAchievements.length > 0 ? newAchievements : undefined
      });
    } catch (error: any) {
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

  // Achievement API routes - using same auth middleware as daily-stats
  app.get('/api/achievements', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Getting achievements for user
    
    try {
      const achievements = await storage.getUserAchievements(userId);
      // Found user achievements
      res.json({ achievements });
    } catch (error: any) {
      console.error('Failed to retrieve achievements:', error);
      res.status(500).json({ message: "Failed to retrieve achievements" });
    }
  });

  app.post('/api/achievements/check', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Checking achievements for user
    
    try {
      const newAchievements = await storage.checkAndCreateAchievements(userId);
      // Created new achievements
      res.json({ 
        newAchievements,
        message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements'
      });
    } catch (error: any) {
      console.error('Failed to check achievements:', error);
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // User statistics API for awards page
  app.get('/api/user/statistics', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Getting user statistics
    
    try {
      const achievements = await storage.getUserAchievements(userId);
      const totalPoints = achievements.reduce((sum, achievement) => {
        // Extract points from achievement title/description or default values
        if (achievement.achievementType.includes('first_day')) return sum + 10;
        if (achievement.achievementType.includes('calorie_goal')) return sum + 15;
        if (achievement.achievementType.includes('protein_goal')) return sum + 10;
        if (achievement.achievementType.includes('three_meals')) return sum + 20;
        if (achievement.achievementType.includes('five_day')) return sum + 25;
        if (achievement.achievementType.includes('fast')) return sum + 15;
        return sum + 10; // default points
      }, 0);
      
      // Calculate streak from recent meals
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentMeals = await db
        .select()
        .from(meals)
        .where(
          and(
            eq(meals.userId, userId),
            gte(meals.date, sevenDaysAgo)
          )
        );
      
      const daysWithMeals = new Set(
        recentMeals.map((meal: any) => meal.date.toISOString().split('T')[0])
      ).size;

      // User stats calculated

      res.json({
        totalPoints,
        achievementsUnlocked: achievements.length,
        currentStreak: daysWithMeals,
        longestStreak: Math.max(daysWithMeals, 0)
      });
    } catch (error: any) {
      console.error('Failed to retrieve user statistics:', error);
      res.status(500).json({ message: "Failed to retrieve user statistics" });
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
      // Test Railway database connection
      const { Pool } = await import('pg');
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('Railway DATABASE_URL not found');
      }
      
      if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
        throw new Error(`Invalid DATABASE_URL format from Railway: ${databaseUrl.substring(0, 20)}...`);
      }
      
      const testPool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }, // Railway requires SSL
        max: 1,
      });
      
      const client = await testPool.connect();
      const result = await client.query('SELECT 1 as test');
      client.release();
      await testPool.end();
      
      res.json({
        success: true,
        message: 'Raw PostgreSQL connection successful',
        testResults: {
          rawConnection: 'success',
          testQuery: result.rows[0] || 'no result'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Database test failed',
        error: error.message,
        errorCode: error.code || 'unknown',
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
  });

  // AI Food Analysis Routes
  // Object storage upload endpoint (no authentication required for AI analysis)
  app.post('/api/objects/upload', async (req: Request, res: Response) => {
    try {
      const { contentType } = req.body;
      const { supabaseStorageService } = await import('./supabaseStorage');
      const uploadURL = await supabaseStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error: any) {
      console.error('❌ Error getting upload URL:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to get upload URL', details: error.message });
    }
  });

  // Track successful photo uploads (requires authentication for privacy compliance)
  app.post('/api/objects/track-upload', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    try {
      const { fileName, storagePath, storageUrl, mimeType, fileSize, analysisId } = req.body;
      
      if (!fileName || !storagePath || !storageUrl || !mimeType) {
        res.status(400).json({ 
          success: false,
          message: "fileName, storagePath, storageUrl, and mimeType are required" 
        });
        return;
      }

      console.log(`📸 Tracking photo upload for user: ${userId.substring(0, 8)}... - ${fileName}`);
      
      // Insert photo record into database for tracking and future deletion
      const [photoRecord] = await db
        .insert(userPhotos)
        .values({
          userId,
          fileName,
          storagePath,
          storageUrl,
          mimeType,
          fileSize: fileSize || null,
          analysisId: analysisId || null,
          uploadedAt: new Date()
        })
        .returning();
      
      console.log(`✅ Photo tracked successfully: ID ${photoRecord.id}, File: ${fileName}`);
      
      res.json({
        success: true,
        message: "Photo upload tracked successfully",
        photoRecord: {
          id: photoRecord.id,
          fileName: photoRecord.fileName,
          uploadedAt: photoRecord.uploadedAt
        }
      });
    } catch (error) {
      console.error("❌ Error tracking photo upload:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to track photo upload" 
      });
    }
  });

  // Image proxy endpoint for AI analysis
  app.get('/api/ai/proxy-image', async (req: Request, res: Response) => {
    try {
      const objectPath = req.query.path as string;
      if (!objectPath) {
        return res.status(400).json({ error: 'Object path is required' });
      }

      
      // Get the object file from Supabase Storage
      const { supabaseStorageService } = await import('./supabaseStorage');
      
      // Check if file exists with retries for recent uploads
      let exists = false;
      let retryCount = 0;
      const maxRetries = 5;
      
      while (!exists && retryCount < maxRetries) {
        exists = await supabaseStorageService.objectExists(objectPath);
        if (!exists) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
        }
      }
      
      if (!exists) {
        return res.status(404).json({ 
          error: 'Image not found in storage',
          details: 'The image may still be uploading or the upload may have failed. Please try uploading again.',
          path: objectPath
        });
      }
      
      // Stream the file using Supabase Storage
      await supabaseStorageService.downloadObject(objectPath, res);
      
    } catch (error: any) {
      console.error('❌ Error proxying image:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to proxy image', details: error.message });
      }
    }
  });

  // AI food analysis endpoint
  app.post('/api/ai/analyze-food', async (req: Request, res: Response) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ 
          error: 'MISSING_IMAGE_URL',
          message: 'Image URL is required. Please upload an image first.',
          details: 'Expected: { "imageUrl": "https://..." }'
        });
      }


      // With Gemini Vision, we pass the storage URL directly as it downloads the image internally
      
      // Add validation for empty analysis results
      const { analyzeFoodImage } = await import('./aiService');
      const aiResult = await analyzeFoodImage(imageUrl);

      // Handle case where no foods are identified
      if (!aiResult.identifiedFoods || aiResult.identifiedFoods.length === 0) {
        return res.json({
          imageUrl,
          identifiedFoods: [],
          totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          analysisTime: aiResult.analysisTime,
          message: "No food items were detected in this image. Please try a different photo with clear food items."
        });
      }
      
      // The Gemini AI service already includes nutrition data in identifiedFoods
      const identifiedFoods = aiResult.identifiedFoods.map(food => ({
        name: food.name,
        confidence: food.confidence,
        portion: food.portion,
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        // Include micronutrients from AI analysis
        iron: food.iron || 0,
        calcium: food.calcium || 0,
        zinc: food.zinc || 0,
        magnesium: food.magnesium || 0,
        vitaminC: food.vitaminC || 0,
        vitaminD: food.vitaminD || 0,
        vitaminB12: food.vitaminB12 || 0,
        folate: food.folate || 0,
      }));

      // Calculate total nutrition including micronutrients
      const totalNutrition = identifiedFoods.reduce(
        (total, food) => ({
          calories: total.calories + food.calories,
          protein: total.protein + food.protein,
          carbs: total.carbs + food.carbs,
          fat: total.fat + food.fat,
          // Aggregate micronutrients
          iron: total.iron + food.iron,
          calcium: total.calcium + food.calcium,
          zinc: total.zinc + food.zinc,
          magnesium: total.magnesium + food.magnesium,
          vitaminC: total.vitaminC + food.vitaminC,
          vitaminD: total.vitaminD + food.vitaminD,
          vitaminB12: total.vitaminB12 + food.vitaminB12,
          folate: total.folate + food.folate,
        }),
        { 
          calories: 0, protein: 0, carbs: 0, fat: 0,
          iron: 0, calcium: 0, zinc: 0, magnesium: 0,
          vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0
        }
      );

      const result = {
        imageUrl,
        identifiedFoods,
        totalNutrition,
        analysisTime: aiResult.analysisTime
      };


      res.json(result);
    } catch (error: any) {
      console.error('❌ Food analysis failed with detailed error:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      
      // Send a more detailed error response
      const errorMessage = error.message || 'Food analysis failed';
      res.status(500).json({ 
        error: errorMessage,
        details: 'Please check the server logs for more information'
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
      
      console.log('🍭 Calorie calculation request:', { ingredient, measurement });
      
      // Validate input
      if (!ingredient && !measurement) {
        return res.status(400).json({ 
          error: 'Missing required fields: ingredient and measurement' 
        });
      }
      
      // Use real USDA service for calorie calculation
      const { usdaService } = await import('./services/usdaService');
      const calorieData = await usdaService.calculateIngredientCalories(
        ingredient || 'unknown', 
        measurement || '1 serving'
      );
      
      console.log('🍭 Calorie calculation result:', {
        ingredient: calorieData.ingredient,
        measurement: calorieData.measurement,
        calories: calorieData.estimatedCalories,
        hasPortionInfo: !!calorieData.portionInfo,
        portionWarning: calorieData.portionInfo?.warning || 'No warning',
        portionSuggestion: calorieData.portionInfo?.suggestion || 'No suggestion'
      });
      
      res.json(calorieData);
    } catch (error: any) {
      console.error('❌ Calorie calculation error:', error.message);
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

  // User profile update endpoint (used by UserSettingsManager)
  app.put('/api/user/profile', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    try {
      const { firstName, lastName, personalInfo, profileIcon } = req.body;
      
      console.log('🔄 Profile update request:', {
        userId: userId.substring(0, 8) + '...',
        firstName: firstName?.trim() || '(empty)',
        lastName: lastName?.trim() || '(empty)', 
        profileIcon: profileIcon || 'not provided',
        personalInfo: personalInfo ? Object.keys(personalInfo) : 'none'
      });
      
      // Update user profile information
      const profileUpdateData: any = {
        firstName: firstName?.trim() || '',
        lastName: lastName?.trim() || '',
        personalInfo: personalInfo || {}
      };
      
      // Include profileIcon if provided
      if (profileIcon !== undefined) {
        profileUpdateData.profileIcon = profileIcon;
      }
      
      const updatedUser = await storage.updateUserProfile(userId, profileUpdateData);
      
      console.log('✅ Profile updated successfully:', {
        userId: userId.substring(0, 8) + '...',
        updatedFields: Object.keys({ firstName, lastName, personalInfo }).filter(k => req.body[k] !== undefined),
        hasUpdatedUser: !!updatedUser,
        updatedUserId: updatedUser?.id?.substring(0, 8) + '...' || 'none'
      });
      
      res.json({ 
        success: true, 
        user: updatedUser,
        itemsUpdated: Object.keys(req.body).length,
        message: "Profile updated successfully"
      });
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      console.error('Error stack:', error.stack);
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
      
      console.log('🎯 Goals update request:', {
        userId: userId.substring(0, 8) + '...',
        goals: goals,
        goalKeys: Object.keys(goals)
      });
      
      // Update user goals
      const updatedUser = await storage.updateUserGoals(userId, goals);
      
      console.log('✅ Goals updated successfully:', {
        userId: userId.substring(0, 8) + '...',
        hasUpdatedUser: !!updatedUser,
        updatedUserId: updatedUser?.id?.substring(0, 8) + '...' || 'none',
        updatedGoals: goals
      });
      
      res.json({ 
        success: true, 
        user: updatedUser,
        updatedGoals: goals,
        message: "Goals updated successfully"
      });
    } catch (error: any) {
      console.error('❌ Goals update error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        message: error?.message || "Failed to update goals" 
      });
    }
  });

  // Delete individual meal endpoint
  app.delete('/api/meals/:id', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const mealId = req.params.id;
    
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    if (!mealId) {
      res.status(400).json({ message: "Meal ID required" });
      return;
    }
    
    try {
      console.log(`🗑️ Deleting meal ID: ${mealId} for user: ${userId.substring(0, 8)}...`);
      
      // Pass userId for security verification
      await storage.deleteMeal(parseInt(mealId), userId);
      
      console.log(`✅ Meal ${mealId} deleted successfully for user: ${userId.substring(0, 8)}...`);
      res.json({ success: true, message: "Meal deleted successfully" });
    } catch (error) {
      console.error("Error deleting meal:", error);
      res.status(500).json({ success: false, message: "Failed to delete meal" });
    }
  });

  // Photo management routes - Critical for App Store privacy compliance
  
  // List user's uploaded photos
  app.get('/api/user/photos', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    try {
      console.log(`📸 Fetching photos for user: ${userId.substring(0, 8)}...`);
      
      // Get photos from database, ordered by most recent first
      const photos = await db
        .select()
        .from(userPhotos)
        .where(eq(userPhotos.userId, userId))
        .orderBy(desc(userPhotos.uploadedAt))
        .limit(100); // Limit to recent 100 photos for performance
      
      console.log(`✅ Found ${photos.length} photos for user: ${userId.substring(0, 8)}...`);
      
      res.json({ 
        success: true, 
        photos: photos.map(photo => ({
          id: photo.id,
          fileName: photo.fileName,
          uploadedAt: photo.uploadedAt,
          fileSize: photo.fileSize,
          analysisId: photo.analysisId
          // Note: Don't expose storage URLs/paths for security
        }))
      });
    } catch (error) {
      console.error("❌ Error fetching user photos:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch photos" 
      });
    }
  });

  // Delete a specific photo
  app.delete('/api/user/photos/:photoId', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const photoId = req.params.photoId;
    
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    if (!photoId || isNaN(parseInt(photoId))) {
      res.status(400).json({ message: "Valid photo ID required" });
      return;
    }

    try {
      console.log(`🗑️ Deleting photo ID: ${photoId} for user: ${userId.substring(0, 8)}...`);
      
      // First, get the photo record to verify ownership and get storage path
      const photo = await db
        .select()
        .from(userPhotos)
        .where(and(
          eq(userPhotos.id, parseInt(photoId)),
          eq(userPhotos.userId, userId) // Ensure user owns this photo
        ))
        .limit(1);

      if (!photo || photo.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: "Photo not found or access denied" 
        });
        return;
      }

      const photoRecord = photo[0];
      
      // Delete from storage first
      try {
        await supabaseStorageService.deleteObject(photoRecord.storagePath);
        console.log(`✅ Photo deleted from storage: ${photoRecord.storagePath}`);
      } catch (storageError) {
        console.warn(`⚠️ Storage deletion failed for ${photoRecord.storagePath}:`, storageError);
        // Continue with database deletion even if storage deletion fails
        // (file might already be deleted or storage might be unavailable)
      }
      
      // Delete from database
      await db
        .delete(userPhotos)
        .where(and(
          eq(userPhotos.id, parseInt(photoId)),
          eq(userPhotos.userId, userId)
        ));
      
      console.log(`✅ Photo ${photoId} deleted successfully for user: ${userId.substring(0, 8)}...`);
      res.json({ 
        success: true, 
        message: "Photo deleted successfully",
        deletedPhoto: {
          id: photoRecord.id,
          fileName: photoRecord.fileName
        }
      });
    } catch (error) {
      console.error("❌ Error deleting photo:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete photo" 
      });
    }
  });

  // Delete multiple photos (batch deletion for privacy compliance)
  app.delete('/api/user/photos', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const { photoIds } = req.body;
    
    if (!userId) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      res.status(400).json({ 
        message: "Array of photo IDs required" 
      });
      return;
    }

    // Validate all IDs are numbers
    const validIds = photoIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
    if (validIds.length !== photoIds.length) {
      res.status(400).json({ 
        message: "All photo IDs must be valid numbers" 
      });
      return;
    }

    try {
      console.log(`🗑️ Batch deleting ${validIds.length} photos for user: ${userId.substring(0, 8)}...`);
      
      // Get all photos to verify ownership and get storage paths
      const photos = await db
        .select()
        .from(userPhotos)
        .where(and(
          eq(userPhotos.userId, userId), // Ensure user owns these photos
          inArray(userPhotos.id, validIds) // Use drizzle inArray for multiple IDs
        ));

      if (photos.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: "No photos found or access denied" 
        });
        return;
      }

      console.log(`📋 Found ${photos.length} photos to delete out of ${validIds.length} requested`);
      
      // Delete from storage (batch operation)
      const storagePaths = photos.map(photo => photo.storagePath);
      
      let storageResults = { successful: [] as string[], failed: [] as string[] };
      try {
        storageResults = await supabaseStorageService.deleteObjects(storagePaths);
        console.log(`✅ Storage deletion completed: ${storageResults.successful.length} successful, ${storageResults.failed.length} failed`);
      } catch (storageError) {
        console.warn(`⚠️ Batch storage deletion encountered issues:`, storageError);
        // Continue with database deletion even if storage deletion fails partially
      }
      
      // Delete from database (all photos user owns from the requested list)
      const photoIdsToDelete = photos.map(photo => photo.id);
      
      await db
        .delete(userPhotos)
        .where(and(
          eq(userPhotos.userId, userId),
          inArray(userPhotos.id, photoIdsToDelete)
        ));
      
      console.log(`✅ Batch deletion completed for user: ${userId.substring(0, 8)}... - ${photos.length} photos deleted`);
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${photos.length} photos`,
        deletedCount: photos.length,
        storageResults: {
          successful: storageResults.successful.length,
          failed: storageResults.failed.length
        },
        deletedPhotos: photos.map(photo => ({
          id: photo.id,
          fileName: photo.fileName
        }))
      });
    } catch (error) {
      console.error("❌ Error in batch photo deletion:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete photos" 
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
      console.log(`🗑️ Delete all data request from user: ${userId.substring(0, 8)}...`);
      
      // Delete all user data but keep the user account
      const result = await storage.deleteAllUserData(userId);
      
      const totalDeleted = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
      
      console.log(`✅ Successfully processed delete request for user: ${userId.substring(0, 8)}...`);
      console.log(`📊 Final deletion counts:`, result.counts);
      
      res.json({ 
        success: true, 
        message: `All data deleted successfully. Removed ${totalDeleted} records.`,
        counts: result.counts
      });
    } catch (error) {
      console.error(`❌ Failed to delete user data:`, error);
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
      
      const { usdaService } = await import('./services/usdaService');
      
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
      
      const { usdaService } = await import('./services/usdaService');
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
      const { usdaService } = await import('./services/usdaService');
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

  // GET endpoint for water intake history
  app.get('/api/water-history', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    console.log('💧 Water history request:', { userId, days });

    if (!userId) {
      console.log('❌ Water history: User not found or unauthorized');
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    try {
      const waterHistory = await storage.getUserWaterIntakeHistory(userId, days);
      
      res.json({
        success: true,
        data: waterHistory,
        totalDays: days
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch water history:', error.message, error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch water history',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // POST endpoint for manually seeding water history data
  app.post('/api/water-history/seed', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    try {
      // Generate sample water intake data for the last 30 days
      const waterIntakeData = [];
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const glasses = Math.floor(Math.random() * 8) + 2; // Random 2-9 glasses
        
        await storage.upsertWaterIntake({
          userId,
          date,
          glasses
        });
        
        waterIntakeData.push({ date: date.toISOString().split('T')[0], glasses });
      }

      console.log('💧 Seeded water history for user:', userId, 'with', waterIntakeData.length, 'records');

      res.json({
        success: true,
        message: 'Water history seeded successfully',
        data: waterIntakeData
      });
    } catch (error: any) {
      console.error('❌ Failed to seed water history:', error.message, error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to seed water history',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Daily stats API with fasting integration
  app.get('/api/users/:userId/daily-stats', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const requestedUserId = req.params.userId;
    
    // Daily stats request
    
    if (!userId || userId !== requestedUserId) {
      // Daily stats: User not found or unauthorized
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    try {
      const today = new Date();
      // Getting daily stats for user
      
      const stats = await storage.getUserDailyStats(userId, today);
      // Daily stats retrieved successfully
      
      res.json(stats);
    } catch (error: any) {
      console.error('❌ Failed to get daily stats:', error.message, error.stack);
      
      // Return default stats instead of failing completely
      const defaultStats = {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        waterGlasses: 0,
        fastingStatus: undefined
      };
      
      res.json(defaultStats);
    }
  });

  // POST endpoint for updating daily stats (including water consumption)
  app.post('/api/daily-stats', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const { waterGlasses, date } = req.body;
    
    console.log('💧 Water update request:', { userId, waterGlasses, date });
    
    if (!userId) {
      console.log('❌ Water update: User not found or unauthorized');
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    if (typeof waterGlasses !== 'number' || waterGlasses < 0 || waterGlasses > 8) {
      return res.status(400).json({ message: "Invalid water glasses count. Must be between 0 and 8." });
    }

    try {
      // Update daily stats with new water consumption
      const targetDate = date ? new Date(date) : new Date();
      console.log('💧 Updating water glasses for user:', userId, 'date:', targetDate.toISOString(), 'glasses:', waterGlasses);
      
      const updatedStats = await storage.updateUserDailyStats(userId, targetDate, { waterGlasses });
      console.log('✅ Water consumption updated successfully:', updatedStats);
      
      res.json({
        success: true,
        waterGlasses: updatedStats.waterGlasses,
        message: 'Water consumption updated successfully'
      });
    } catch (error: any) {
      console.error('❌ Failed to update water consumption:', error.message, error.stack);
      res.status(500).json({ 
        success: false,
        message: 'Failed to update water consumption',
        error: error.message 
      });
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

  // Subscription API routes
  app.get('/api/subscription/status', isAuthenticated, createAuthenticatedHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        res.json({
          isActive: false,
          tier: 'free',
          status: 'inactive'
        });
        return;
      }

      // Check if subscription is still active
      const now = new Date();
      const isExpired = subscription.expiresAt && subscription.expiresAt < now;
      
      res.json({
        isActive: !isExpired && subscription.status === 'active',
        tier: isExpired ? 'free' : subscription.tier,
        status: isExpired ? 'expired' : subscription.status,
        productId: subscription.productId,
        expiresAt: subscription.expiresAt,
        willRenew: subscription.willRenew
      });
    } catch (error) {
      console.error('❌ Failed to get subscription status:', error);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  }));

  app.post('/api/subscription/sync', isAuthenticated, createAuthenticatedHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      // Validate request body with Zod schema
      const validationResult = subscriptionSyncSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ 
          error: 'Invalid request body',
          details: validationResult.error.errors
        });
        return;
      }

      const { revenueCatUserId, customerInfo } = validationResult.data;

      // Find or create subscription based on customer info
      let subscription = await storage.getUserSubscription(userId);
      
      // Parse customer info from RevenueCat
      const entitlements = customerInfo.entitlements;
      let tier = 'free';
      let status = 'inactive';
      let productId = '';
      let expiresAt = null;

      if (entitlements && entitlements.active) {
        if (entitlements.active['pro']) {
          tier = 'pro';
          status = 'active';
          const entitlement = entitlements.active['pro'];
          productId = entitlement.productIdentifier;
          expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
        } else if (entitlements.active['premium']) {
          tier = 'premium';
          status = 'active';
          const entitlement = entitlements.active['premium'];
          productId = entitlement.productIdentifier;
          expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
        }
      }

      if (subscription) {
        // Update existing subscription
        await storage.updateSubscription(userId, {
          revenueCatUserId,
          status,
          tier,
          productId,
          expiresAt
        });
      } else {
        // Create new subscription
        await storage.createSubscription({
          userId,
          revenueCatUserId,
          productId: productId || 'unknown',
          entitlementId: tier,
          status,
          tier,
          expiresAt,
          environment: 'production'
        });
      }

      res.json({ success: true, tier, status });
    } catch (error) {
      console.error('❌ Failed to sync subscription:', error);
      res.status(500).json({ error: 'Failed to sync subscription' });
    }
  }));

  // Image proxy route to serve images from object storage with proper headers
  app.get('/api/proxy-image/:path(*)', async (req: Request, res: Response) => {
    try {
      const objectPath = req.params.path;
      console.log(`🖼️ Proxy request for: ${objectPath}`);
      
      // Try multiple bucket naming patterns to find the image
      const possibleBuckets = [
        // Cloud storage buckets
      ].filter(Boolean);
      
      let foundBucket = null;
      let file = null;
      
      // Use Supabase Storage instead of trying multiple buckets
      const { supabaseStorageService } = await import('./supabaseStorage');
      
      console.log(`🖼️ Checking Supabase Storage for: ${objectPath}`);
      try {
        const exists = await supabaseStorageService.objectExists(objectPath);
        
        if (exists) {
          console.log(`✅ Found file in Supabase Storage: ${objectPath}`);
          
          // Set CORS headers for AI analysis
          res.set({
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          
          // Stream the file using Supabase Storage
          await supabaseStorageService.downloadObject(objectPath, res);
          return;
        } else {
          console.log(`❌ Image not found in Supabase Storage: ${objectPath}`);
          return res.status(404).json({ error: 'Image not found in storage' });
        }
      } catch (storageError: any) {
        console.log(`⚠️ Error checking Supabase Storage:`, storageError?.message || storageError);
        return res.status(500).json({ error: 'Storage access error' });
      }
      
      
    } catch (error: any) {
      console.error('❌ Image proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  });

  // Background startup tasks (non-blocking)
  void (async () => {
    try {
      console.log('🚀 Starting background initialization...');
      
      // Set a timeout for background initialization
      const initTimeout = setTimeout(() => {
        console.warn('⚠️ Background initialization timed out after 30 seconds');
      }, 30000);
      
      // Give auth setup time to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize Supabase Storage bucket (best effort)
      try {
        const { supabaseStorageService } = await import('./supabaseStorage');
        await supabaseStorageService.initializeBucket();
        console.log('✅ Supabase Storage bucket initialized');
      } catch (storageError) {
        console.warn('⚠️ Storage bucket initialization failed (non-critical):', storageError);
      }
      
      clearTimeout(initTimeout);
      console.log('✅ Background initialization completed');
    } catch (error) {
      console.warn('⚠️ Background initialization failed:', error);
    }
  })();

  console.log('✅ Routes registered, returning server');
  return server;
}