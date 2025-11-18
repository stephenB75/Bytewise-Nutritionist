/**
 * Production-Ready Configuration
 * Handles both development and production environments
 */

// Environment detection - updated for better URL handling
const isDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.port === '5000');
const isGitHubPages = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('bytewise-nutritionist'));
const isProd = !isDev && !isGitHubPages;

// Dynamic API base URL based on current environment
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '/api';
  return `${window.location.protocol}//${window.location.host}/api`;
};

// Fallback configuration for production
const FALLBACK_CONFIG = {
  supabaseUrl: 'https://bcfilsryfjwemqytwbvr.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk',
  usdaApiKey: 'z4YPCZm0HAL1SLXe9sRhXXRG8meDjQDBkGqE7hqY'
};

// Safe environment variable access
function getEnvVar(key: string): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
}

// Configuration object with dynamic URLs
export const config = {
  isDev,
  isProd,
  isGitHubPages,
  apiMode: isGitHubPages ? 'direct' : 'proxy',
  baseUrl: isGitHubPages ? '/Bytewise-Nutritionist' : '',
  apiBaseUrl: getApiBaseUrl(),
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL') || FALLBACK_CONFIG.supabaseUrl,
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY') || FALLBACK_CONFIG.supabaseKey,
    isConfigured: true
  },
  usda: {
    apiKey: getEnvVar('VITE_USDA_API_KEY') || FALLBACK_CONFIG.usdaApiKey,
    baseUrl: 'https://api.nal.usda.gov/fdc/v1'
  },
  fallback: {
    supabaseUrl: FALLBACK_CONFIG.supabaseUrl,
    supabaseKey: FALLBACK_CONFIG.supabaseKey,
    usdaApiKey: FALLBACK_CONFIG.usdaApiKey
  }
};

// Production logging
if (isProd) {
  if (isGitHubPages) {
  } else {
  }
}

export default config;