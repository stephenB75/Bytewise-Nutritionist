/**
 * Supabase Client Configuration
 * Serverless database connection for Bytewise Nutrition Tracker
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { config } from './config';

// Use configuration with safe fallbacks
const finalUrl = config.supabase.url;
const finalKey = config.supabase.anonKey;

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Create Supabase client with singleton pattern
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(finalUrl, finalKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'bytewise-auth',
        storage: window.localStorage,
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
  }
  return supabaseInstance;
})();

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