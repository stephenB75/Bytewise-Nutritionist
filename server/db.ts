import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Use Supabase connection for production
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set for Supabase connection.",
  );
}

// Create Supabase client for auth and database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For now, we'll use Supabase client directly instead of Drizzle
// This avoids the DATABASE_URL connection string issue
export const db = {
  // Mock Drizzle interface using Supabase
  query: {
    foods: {
      findMany: async (options?: any) => {
        const { data, error } = await supabase
          .from('foods')
          .select('*')
          .limit(options?.limit || 1000);
        if (error) throw error;
        return data;
      }
    }
  }
};