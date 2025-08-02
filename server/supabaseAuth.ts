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
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Enhanced request type with user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    claims?: any;
  };
}

// Type-safe middleware wrapper
export function createAuthenticatedHandler(
  handler: (req: AuthenticatedRequest, res: Response, next?: NextFunction) => Promise<void> | void
) {
  return (req: any, res: Response, next?: NextFunction) => {
    return handler(req as AuthenticatedRequest, res, next);
  };
}

// Middleware to verify Supabase JWT tokens
export async function isAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth verification failed:', error?.message);
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
    console.error('Authentication middleware error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Optional authentication - continues even if not authenticated
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      
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
    console.log('Optional auth failed:', error);
  }
  
  next();
}

// Setup function (replaces Replit auth setup)
export async function setupAuth(app: any) {
  console.log('🔐 Setting up Supabase authentication middleware');
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase auth service connected');
  } catch (error) {
    console.error('❌ Supabase auth connection failed:', error);
  }
}

export { supabase as serverSupabase };