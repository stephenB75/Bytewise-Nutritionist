const REAL_SUPABASE_URL = 'https://bcfilsryfjwemqytwbvr.supabase.co';
const REAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk';

function isPlaceholder(value?: string | null): boolean {
  if (!value || !value.trim()) {
    return true;
  }
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes('your-project') ||
    normalized.includes('your_project') ||
    normalized.includes('placeholder') ||
    normalized.includes('changeme') ||
    normalized.includes('your-supabase') ||
    normalized.includes('your_password') ||
    normalized.includes('your-usda') ||
    normalized === 'demo_key'
  );
}

function firstReal(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => !isPlaceholder(value));
}

export function getSupabaseUrl(): string {
  return firstReal(process.env.SUPABASE_URL, process.env.VITE_SUPABASE_URL) || REAL_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  return firstReal(process.env.SUPABASE_ANON_KEY, process.env.VITE_SUPABASE_ANON_KEY) || REAL_ANON_KEY;
}

export function getSupabaseServiceKey(): string | undefined {
  return firstReal(process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SERVICE_KEY);
}

export function getDatabaseUrl(): string | undefined {
  return firstReal(process.env.DATABASE_URL);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getUsdaApiKey(): string {
  return firstReal(process.env.USDA_API_KEY, process.env.VITE_USDA_API_KEY) || 'DEMO_KEY';
}
