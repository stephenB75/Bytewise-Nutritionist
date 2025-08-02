/**
 * GitHub Pages Configuration
 * Client-side only configuration for static hosting
 */

// Detect GitHub Pages environment
const isGitHubPages = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('bytewise'));

// GitHub Pages configuration
export const githubConfig = {
  isGitHubPages,
  baseUrl: isGitHubPages ? '/Bytewise-Nutritionist' : '',
  apiMode: isGitHubPages ? 'direct' : 'proxy',
  
  supabase: {
    url: 'https://ykgqcftrfvjblmqzbqvr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3FjZnRyZnZqYmxtcXpicXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3ODcxNjQsImV4cCI6MjA1MTM2MzE2NH0.x7kMQbFJevYhYe4LvBTIb3VjcL6H6M7AQwvR8IbgAY4',
    isConfigured: true
  },
  
  usda: {
    apiKey: 'z4YPCZm0HAL1SLXe9sRhXXRG8meDjQDBkGqE7hqY',
    baseUrl: 'https://api.nal.usda.gov/fdc/v1'
  }
};

export default githubConfig;