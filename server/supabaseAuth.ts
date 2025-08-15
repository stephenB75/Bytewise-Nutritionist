/**
 * Supabase Authentication Middleware
 * JWT token verification for serverless backend
 */

import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for production
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ykgqcftrfvjblmqzbqvr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3FjZnRyZnZqYmxtcXpicXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3ODcxNjQsImV4cCI6MjA1MTM2MzE2NH0.x7kMQbFJevYhYe4LvBTIb3VjcL6H6M7AQwvR8IbgAY4';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client for regular operations
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create admin client for server-side operations (email verification, etc.)
const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Export both clients
export { supabaseAdmin };

// Enhanced request type with user info  
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    claims?: any;
  };
}

// Middleware handler type that works with Express
export type AuthMiddleware = (req: any, res: Response, next: NextFunction) => Promise<void | Response>;

// Type-safe middleware wrapper
export function createAuthenticatedHandler(
  handler: (req: AuthenticatedRequest, res: Response, next?: NextFunction) => Promise<void> | void
) {
  return async (req: any, res: Response, next?: NextFunction) => {
    try {
      await handler(req as AuthenticatedRequest, res, next);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}

// Middleware to verify both Supabase JWT tokens and custom tokens
export const isAuthenticated: AuthMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Check if it's a custom verified token first
    if (token.startsWith('verified_')) {
      // Parse verified_userId_timestamp format
      const parts = token.split('_');
      if (parts.length >= 2) {
        const supabaseUserId = parts[1];
        
        // CRITICAL: Map Supabase user ID to database user ID for required auth
        const { mapSupabaseIdToDatabaseId } = await import('./userMapping');
        const actualUserId = await mapSupabaseIdToDatabaseId(supabaseUserId);
        
        // Set user directly since we trust our own verified tokens
        req.user = {
          id: actualUserId,
          email: null, // Will be populated by endpoints that need it
          claims: { sub: actualUserId },
        };
        return next();
      }
    }
    
    // Try as standard Supabase JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      claims: { sub: user.id },
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Optional authentication - continues even if not authenticated
export const optionalAuth: AuthMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // For our custom tokens, we need to extract the user ID differently
      console.log('🔍 Validating token:', token.substring(0, 20) + '...', 'Length:', token.length);
      
      if (token.startsWith('verified_')) {
        // Parse verified_userId_timestamp format
        const parts = token.split('_');
        if (parts.length >= 2) {
          const supabaseUserId = parts[1];
          console.log('🔍 Extracting user ID from custom token:', supabaseUserId.substring(0, 8) + '...');
          
          // CRITICAL: Map Supabase user ID to database user ID
          const { mapSupabaseIdToDatabaseId } = await import('./userMapping');
          const actualUserId = await mapSupabaseIdToDatabaseId(supabaseUserId);
          
          // Set user with the correct ID (either original or mapped)
          req.user = {
            id: actualUserId,
            email: null, // Will be populated by user endpoint
            claims: { sub: actualUserId },
          };
          console.log('✅ Custom token validated, user ID set:', actualUserId.substring(0, 8) + '...');
        }
      } else {
        // Try as standard Supabase token or generated token
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          
          if (!error && user) {
            req.user = {
              id: user.id,
              email: user.email,
              claims: { sub: user.id },
            };
            console.log('✅ Supabase token validated for user:', user.email);
          } else {
            console.log('⚠️ Token validation failed:', error?.message);
            // If it's a 56-char token from our generateLink, try to extract from recent users
            if (token.length === 56) {
              console.log('🔍 Attempting recovery token lookup...');
              // For now, we'll skip this complex lookup
            }
          }
        } catch (tokenError) {
          console.log('⚠️ Token validation threw error:', tokenError);
        }
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

// Setup function (replaces Replit auth setup)
export async function setupAuth(app: any) {
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();
  } catch (error) {
  }
}

// Export regular client for authentication
export { supabase as serverSupabase };