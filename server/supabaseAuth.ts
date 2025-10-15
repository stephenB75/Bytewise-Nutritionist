/**
 * Supabase Authentication Middleware
 * JWT token verification for serverless backend
 */

import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Environment variables - NO fallbacks for security
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

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
    
    // Reject legacy verified_ tokens (should no longer occur after migration)
    if (token.startsWith('verified_')) {
      console.log('❌ Rejecting legacy verified_ token - use proper Supabase JWT');
      return res.status(401).json({ message: 'Legacy token format not supported' });
    }
    
    // SECURITY: Removed insecure "verified_" token bypass - use proper JWT tokens only
    
    // SECURITY: Removed insecure test token bypass for production safety
    
    // Try as standard Supabase JWT token - use proper server-side verification
    // ONLY if it looks like a valid JWT (3 parts separated by dots)
    if (token.split('.').length === 3) {
      try {
        // For server-side, we need to verify the JWT token directly
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) {
          console.log('🔐 Auth verification failed:', error?.message || 'No user found');
          return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log('✅ User authenticated:', user.id);
        
        // Add user info to request
        req.user = {
          id: user.id,
          email: user.email,
          claims: { sub: user.id },
        };
      } catch (tokenError) {
        console.log('❌ Token verification error:', tokenError);
        return res.status(401).json({ message: 'Unauthorized' });
      }
    } else {
      // Not a valid JWT format, reject
      console.log('❌ Invalid token format - not a JWT');
      return res.status(401).json({ message: 'Unauthorized' });
    }

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
      
      // SECURITY: Only accept proper Supabase JWT tokens
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email,
            claims: { sub: user.id },
          };
        }
      } catch (tokenError) {
        // Silently fail for optional auth - no user context set
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

// Setup function for Supabase authentication
export async function setupAuth(app: any) {
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();
  } catch (error) {
  }
}

// Export regular client for authentication
export { supabase as serverSupabase };