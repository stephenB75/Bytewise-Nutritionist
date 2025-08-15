/**
 * App Version Management
 * Handles version checking, updates, and changelog display
 */

export interface AppVersion {
  version: string;
  buildDate: string;
  changelog: string[];
  required: boolean;
}

const CURRENT_VERSION = 'BETA 1.5';
const BUILD_DATE = '2025-08-15';

export const getCurrentVersion = (): AppVersion => ({
  version: CURRENT_VERSION,
  buildDate: BUILD_DATE,
  changelog: [
    'Complete Profile system fully operational with authentication fixes',
    'Fixed critical user ID mapping issues between Supabase and database',
    'Enhanced search bar visibility with solid white backgrounds',
    'Resolved profile completion flow for all verified users',
    'Improved text contrast and readability across food search inputs',
    'Fixed foreign key constraint violations in user management',
    'Enhanced authentication middleware with proper ID resolution'
  ],
  required: false
});

export const checkForUpdates = async (): Promise<AppVersion | null> => {
  try {
    // Simulate API call to check for updates
    const response = await fetch('/api/version/check', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const latestVersion = await response.json();
      if (latestVersion.version !== CURRENT_VERSION) {
        return latestVersion;
      }
    }
  } catch (error) {
  }
  
  return null;
};

export const updateApp = async (): Promise<boolean> => {
  try {
    // Clear cache and reload
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    
    // Clear application cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Force reload to get latest version
    window.location.reload();
    return true;
  } catch (error) {
    // Update failure handled silently
    return false;
  }
};

export const getVersionHistory = (): Array<AppVersion> => [
  {
    version: 'BETA 1.5',
    buildDate: '2025-08-15',
    changelog: [
      'Complete Profile system fully operational with authentication fixes',
      'Fixed critical user ID mapping issues between Supabase and database',
      'Enhanced search bar visibility with solid white backgrounds',
      'Resolved profile completion flow for all verified users',
      'Improved text contrast and readability across food search inputs',
      'Fixed foreign key constraint violations in user management',
      'Enhanced authentication middleware with proper ID resolution'
    ],
    required: false
  },
  {
    version: 'BETA 1.4',
    buildDate: '2025-08-15',
    changelog: [
      'Fixed fasting timer milestone celebration system',
      'Added comprehensive milestone detection (8h, 12h, 16h, 18h, 20h, 24h+)',
      'Enhanced celebration toasts with personalized health benefit messages',
      'Implemented milestone persistence across browser sessions',
      'Fixed text field consistency in calorie calculator',
      'Streamlined data management with automatic sync system',
      'Achievement system integration with milestone completion'
    ],
    required: false
  },
  {
    version: 'BETA 1.3',
    buildDate: '2025-08-14',
    changelog: [
      'Profile icon UI improvements (removed white border)',
      'Enhanced fasting tracking system', 
      'Improved calorie calculator visibility',
      'Data management streamlining',
      'Auto-sync system enhancements'
    ],
    required: false
  },
  {
    version: 'BETA 1.2',
    buildDate: '2025-08-13',
    changelog: [
      'Authentication system enhancements',
      'Email verification implementation',
      'OAuth integration (Google, GitHub)',
      'Enhanced user management system',
      'Database schema improvements'
    ],
    required: false
  },
  {
    version: 'BETA 1.1',
    buildDate: '2025-08-12',
    changelog: [
      'Core nutrition tracking features',
      'USDA FoodData Central integration',
      'Basic fasting timer implementation',
      'Achievement system foundation',
      'PWA capabilities enhancement'
    ],
    required: false
  }
];

export const formatVersion = (version: string): string => {
  return `v${version}`;
};

export const formatBuildDate = (buildDate: string): string => {
  return new Date(buildDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};