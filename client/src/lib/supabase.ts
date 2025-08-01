/**
 * Supabase Client Configuration
 * Serverless database connection for Bytewise Nutrition Tracker
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { config } from './config';

// Direct environment variable access (more reliable than config layer)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey 
  });
}

// Create Supabase client with direct credentials
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
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