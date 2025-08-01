/**
 * Supabase Client Configuration
 * Serverless database connection for Bytewise Nutrition Tracker
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { config } from './config';

// Use configuration with safe fallbacks
const finalUrl = config.supabase.url || config.fallback.supabaseUrl;
const finalKey = config.supabase.anonKey || config.fallback.supabaseKey;

// Production-ready configuration - debug logs removed

// Create Supabase client
export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'bytewise-nutrition-tracker',
    },
  },
});

// Auth helpers
export const auth = supabase.auth;

// Database helpers
export const db = supabase;

// Real-time subscription helper
export const subscribe = (table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table }, 
      callback
    )
    .subscribe();
};

// Storage helpers for file uploads
export const storage = supabase.storage;

// Edge Functions helper
export const functions = supabase.functions;

export default supabase;