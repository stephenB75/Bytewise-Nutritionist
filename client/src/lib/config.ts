/**
 * Environment Configuration
 * Safe handling of environment variables with development fallbacks
 */

import { env } from './env';

export const config = {
  // Supabase configuration
  supabase: {
    url: env.VITE_SUPABASE_URL || '',
    anonKey: env.VITE_SUPABASE_ANON_KEY || '',
    isConfigured: !!(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
  },
  
  // USDA API configuration
  usda: {
    apiKey: env.VITE_USDA_API_KEY || '',
    isConfigured: !!env.VITE_USDA_API_KEY,
  },
  
  // Development mode
  isDevelopment: env.VITE_DEVELOPMENT_MODE === 'true' || env.DEV === true,
  
  // Fallback values for development
  fallback: {
    supabaseUrl: 'https://demo.supabase.co',
    supabaseKey: 'demo-anon-key',
  }
};

export default config;