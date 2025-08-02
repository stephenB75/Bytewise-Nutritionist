/**
 * Production-Ready Configuration
 * Handles both development and production environments
 */

// Environment detection
const isDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname.includes('replit.dev') ||
   window.location.hostname.includes('replit.app'));
const isGitHubPages = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('bytewise-nutritionist'));
const isProd = !isDev && !isGitHubPages;

// Fallback configuration for production
const FALLBACK_CONFIG = {
  supabaseUrl: 'https://ykgqcftrfvjblmqzbqvr.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3FjZnRyZnZqYmxtcXpicXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3ODcxNjQsImV4cCI6MjA1MTM2MzE2NH0.x7kMQbFJevYhYe4LvBTIb3VjcL6H6M7AQwvR8IbgAY4',
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

// Configuration object
export const config = {
  isDev,
  isProd,
  isGitHubPages,
  apiMode: isGitHubPages ? 'direct' : 'proxy', // Direct API calls for GitHub Pages
  baseUrl: isGitHubPages ? '/Bytewise-Nutritionist' : '',
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL') || FALLBACK_CONFIG.supabaseUrl,
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY') || FALLBACK_CONFIG.supabaseKey,
    isConfigured: true // Always configured with fallback values
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
    console.log('📱 ByteWise GitHub Pages Mode');
    console.log('🌐 Direct API mode enabled');
  } else {
    console.log('📱 ByteWise Production Mode');
  }
  console.log('🔧 Supabase configured:', config.supabase.isConfigured);
  console.log('🔗 Supabase URL:', config.supabase.url ? 'present' : 'missing');
  console.log('🔑 Supabase Key:', config.supabase.anonKey ? 'present' : 'missing');
}

export default config;