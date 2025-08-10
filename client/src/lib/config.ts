/**
 * ByteWise Nutritionist Configuration
 * Primary domain: bytewisenutritionist.com
 */

// Primary domain configuration
const PRIMARY_DOMAIN = 'bytewisenutritionist.com';
const PRIMARY_URL = 'https://bytewisenutritionist.com';

// Environment detection 
const isLocalDev = typeof window !== 'undefined' && 
  window.location.hostname === 'localhost';

const isReplitPreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('replit.dev') ||
   window.location.hostname.includes('replit.app') ||
   window.location.hostname.includes('repl.co'));

const isCustomDomain = typeof window !== 'undefined' && 
  (window.location.hostname === PRIMARY_DOMAIN ||
   window.location.hostname === `www.${PRIMARY_DOMAIN}`);

const isGitHubPages = typeof window !== 'undefined' && 
  window.location.hostname.includes('github.io');

// Redirect to primary domain if on Replit preview
if (isReplitPreview && typeof window !== 'undefined') {
  // Show redirect message
  console.log(`Redirecting to primary domain: ${PRIMARY_URL}`);
}

const isDev = isLocalDev || isReplitPreview;
const isProd = isCustomDomain;

// Dynamic API base URL
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '/api';
  
  // Always use primary domain for production
  if (isCustomDomain || isProd) {
    return `${PRIMARY_URL}/api`;
  }
  
  // For local development
  return `${window.location.protocol}//${window.location.host}/api`;
};

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

// Configuration object with primary domain
export const config = {
  isDev,
  isProd,
  isCustomDomain,
  isReplitPreview,
  isLocalDev,
  isGitHubPages,
  primaryDomain: PRIMARY_DOMAIN,
  primaryUrl: PRIMARY_URL,
  apiMode: isGitHubPages ? 'direct' : 'proxy',
  baseUrl: isCustomDomain || isProd ? '' : (isGitHubPages ? '/Bytewise-Nutritionist' : ''),
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