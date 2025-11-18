/**
 * Supabase Authentication Middleware
 * JWT token verification for serverless backend
 */

import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Environment variables - allow preview mode in development
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Lazy initialization for preview mode
let supabase: ReturnType<typeof createClient> | null = null;
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

const initializeSupabase = () => {
  if (supabase) return; // Already initialized
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Supabase credentials not found - running in preview mode');
      console.warn('⚠️  Authentication features will not work');
      return; // Allow server to start without Supabase in dev
    } else {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
    }
  }

  // Create Supabase client for regular operations
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Create admin client for server-side operations (email verification, etc.)
  supabaseAdmin = SUPABASE_SERVICE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : supabase;
};

// Initialize if credentials are available
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  initializeSupabase();
}

// Getter functions that lazy-initialize
const getSupabase = () => {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    initializeSupabase();
    if (!supabase) {
      throw new Error('Supabase initialization failed');
    }
  }
  return supabase;
};

// Getter function for admin client (safe for preview mode)
const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }
    initializeSupabase();
    if (!supabase && supabaseAdmin === null) {
      // If supabase was initialized, ensure admin exists
      supabaseAdmin = supabase;
    }
  }
  return supabaseAdmin;
};

// Export admin client getter
export { getSupabaseAdmin };

// For backward compatibility, export the variable (may be null in preview)
export { supabaseAdmin };

// Export regular client for authentication  
export const serverSupabase = getSupabase;

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
        const admin = getSupabaseAdmin();
        if (!admin) {
          return res.status(503).json({ message: 'Authentication service not available' });
        }
        const { data: { user }, error } = await admin.auth.getUser(token);
        
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
      const admin = getSupabaseAdmin();
      if (!admin) {
        return next(); // Skip auth in preview mode
      }
      try {
        const { data: { user }, error } = await admin.auth.getUser(token);
        
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
  if (!supabase) {
    console.warn('⚠️  Supabase not configured - skipping auth setup');
    return;
  }
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();
  } catch (error) {
    // Silently fail in preview mode
  }
}