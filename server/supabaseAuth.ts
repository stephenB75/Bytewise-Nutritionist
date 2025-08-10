/**
 * Supabase Authentication Middleware
 * JWT token verification for serverless backend
 */

import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for production
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ykgqcftrfvjblmqzbqvr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3FjZnRyZnZqYmxtcXpicXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3ODcxNjQsImV4cCI6MjA1MTM2MzE2NH0.x7kMQbFJevYhYe4LvBTIb3VjcL6H6M7AQwvR8IbgAY4';

// Create Supabase client for server-side operations
// Use service role key if available for better access, otherwise use anon key
const supabase = createClient(
  SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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

// Middleware to verify Supabase JWT tokens
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
    
    // Create a new client with the user's token for proper authentication
    const authClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Verify the JWT token with Supabase using the authenticated client
    const { data: { user }, error } = await authClient.auth.getUser();
    
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
      
      // Create a new client with the user's token
      const authClient = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      const { data: { user } } = await authClient.auth.getUser();
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          claims: { sub: user.id },
        };
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

export { supabase as serverSupabase };