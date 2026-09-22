/**
 * Client configuration. Secrets come from Vite env vars only.
 */

import { getApiOrigin } from './apiUrl';

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

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL') || 'https://bcfilsryfjwemqytwbvr.supabase.co';
const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk';
const usdaApiKey = getEnvVar('VITE_USDA_API_KEY') || 'DEMO_KEY';

export const config = {
  isDev,
  isProd,
  isGitHubPages,
  apiMode: isGitHubPages ? 'direct' : 'proxy',
  baseUrl: isGitHubPages ? '/Bytewise-Nutritionist' : '',
  apiBaseUrl: typeof window === 'undefined' ? '/api' : `${getApiOrigin()}/api`,
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
