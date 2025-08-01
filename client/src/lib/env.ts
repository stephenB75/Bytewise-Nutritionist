/**
 * Environment variables helper
 * Provides safe access to environment variables with TypeScript support
 */

// Environment type extensions
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_USDA_API_KEY?: string;
  readonly VITE_DEVELOPMENT_MODE?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
}

export const env = {
  VITE_SUPABASE_URL: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined,
  VITE_SUPABASE_ANON_KEY: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined,
  VITE_USDA_API_KEY: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USDA_API_KEY : undefined,
  VITE_DEVELOPMENT_MODE: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_DEVELOPMENT_MODE : undefined,
  DEV: typeof import.meta !== 'undefined' ? import.meta.env?.DEV : false,
} as const;

export default env;