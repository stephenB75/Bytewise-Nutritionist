/**
 * Client configuration. Secrets come from Vite env vars only.
 */

const isDev = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.port === '5000');
const isGitHubPages = typeof window !== 'undefined' &&
  window.location.hostname.includes('github.io');
const isProd = !isDev && !isGitHubPages;

function getEnvVar(key: string): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return String(import.meta.env[key] || '');
    }
  } catch {
    // Ignore environments without import.meta
  }
  return '';
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const usdaApiKey = getEnvVar('VITE_USDA_API_KEY');

export const config = {
  isDev,
  isProd,
  isGitHubPages,
  apiMode: isGitHubPages ? 'direct' : 'proxy',
  baseUrl: isGitHubPages ? '/Bytewise-Nutritionist' : '',
  apiBaseUrl: typeof window === 'undefined'
    ? '/api'
    : `${window.location.protocol}//${window.location.host}/api`,
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  },
  usda: {
    apiKey: usdaApiKey,
    baseUrl: 'https://api.nal.usda.gov/fdc/v1',
  },
};

export default config;
