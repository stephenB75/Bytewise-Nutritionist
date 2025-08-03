/**
 * Environment variables helper
 * Provides safe access to environment variables with TypeScript support
 */

// Environment variables are handled by Vite automatically

export const env = {
  VITE_SUPABASE_URL: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined,
  VITE_SUPABASE_ANON_KEY: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined,
  VITE_USDA_API_KEY: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USDA_API_KEY : undefined,
  VITE_DEVELOPMENT_MODE: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_DEVELOPMENT_MODE : undefined,
  DEV: typeof import.meta !== 'undefined' ? import.meta.env?.DEV : false,
} as const;

export default env;