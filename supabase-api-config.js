// Supabase API Configuration
// This file provides API endpoint configuration for the frontend
// It maps /api/* routes to Supabase Edge Functions

(function() {
  'use strict';

  // Get Supabase configuration from environment or defaults
  const getSupabaseConfig = () => {
    // Try to get from window (if set by build process)
    if (window.__SUPABASE_CONFIG__) {
      return window.__SUPABASE_CONFIG__;
    }

    // Default Supabase project URL
    const supabaseUrl = 'https://bcfilsryfjwemqytwbvr.supabase.co';
    const functionsBase = `${supabaseUrl}/functions/v1`;

    return {
      supabaseUrl,
      functionsBase,
      apiProxy: `${functionsBase}/api-proxy`
    };
  };

  const config = getSupabaseConfig();

  // API endpoint mapping
  const API_ENDPOINTS = {
    '/api/auth/user': `${config.apiProxy}/api/auth/user`,
    '/api/meals/logged': `${config.apiProxy}/api/meals/logged`,
    '/api/user/photos': `${config.apiProxy}/api/user/photos`,
    '/api/user/sync-data': `${config.apiProxy}/api/user/sync-data`,
    '/api/version': `${config.apiProxy}/api/version`,
    '/api/foods': `${config.apiProxy}/api/foods`,
    '/api/usda/search': `${config.apiProxy}/api/usda/search`
  };

  // Intercept fetch calls to /api/* and route to Supabase
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Check if it's an API call
    if (typeof url === 'string' && url.startsWith('/api/')) {
      // Get the mapped endpoint
      const mappedUrl = API_ENDPOINTS[url.split('?')[0]] || url;
      
      // Get Supabase auth token from localStorage or session
      const getAuthToken = () => {
        try {
          // Try to get from Supabase session
          const supabaseSession = localStorage.getItem('sb-bcfilsryfjwemqytwbvr-auth-token');
          if (supabaseSession) {
            const session = JSON.parse(supabaseSession);
            return session?.access_token;
          }
          
          // Try alternative storage keys
          const keys = Object.keys(localStorage);
          for (const key of keys) {
            if (key.includes('supabase') && key.includes('auth')) {
              const data = localStorage.getItem(key);
              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  return parsed?.access_token || parsed?.accessToken;
                } catch (e) {
                  // Continue searching
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not get auth token:', e);
        }
        return null;
      };

      // Add authorization header if available
      const token = getAuthToken();
      if (token && !options.headers?.Authorization && !options.headers?.authorization) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${token}`;
        options.headers['apikey'] = config.supabaseUrl.includes('supabase.co') 
          ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk'
          : '';
      }

      // Use the mapped URL
      return originalFetch.call(this, mappedUrl, options);
    }

    // For non-API calls, use original fetch
    return originalFetch.apply(this, arguments);
  };

  // Export config for use in other scripts
  window.__SUPABASE_API_CONFIG__ = {
    config,
    endpoints: API_ENDPOINTS,
    getSupabaseConfig
  };

  console.log('✅ Supabase API proxy configured');
})();

