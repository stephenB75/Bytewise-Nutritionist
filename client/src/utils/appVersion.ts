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

const CURRENT_VERSION = '2.1.1';
const BUILD_DATE = '2025-01-30';

export const getCurrentVersion = (): AppVersion => ({
  version: CURRENT_VERSION,
  buildDate: BUILD_DATE,
  changelog: [
    'Enhanced calorie calculator and logger communication',
    'Improved header spacing and icon sizes',
    'Added food background images to hero components',
    'Fixed Privacy & Security button interactions',
    'Imperial system integration complete',
    'Achievement celebration system with confetti',
    'Enhanced mobile PWA optimizations'
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
    console.error('Update failed:', error);
    return false;
  }
};

export const getVersionHistory = (): Array<AppVersion> => [
  {
    version: '2.1.1',
    buildDate: '2025-01-30',
    changelog: [
      'Enhanced calorie calculator and logger communication',
      'Improved header spacing and icon sizes',
      'Added food background images to hero components',
      'Fixed Privacy & Security button interactions'
    ],
    required: false
  },
  {
    version: '2.1.0',
    buildDate: '2025-01-28',
    changelog: [
      'Imperial system integration (feet/inches, pounds)',
      'Achievement celebration system with confetti',
      'Email verification with celebration popup',
      'Enhanced mobile PWA optimizations',
      'Increased header height and logo sizes'
    ],
    required: false
  },
  {
    version: '2.0.0',
    buildDate: '2025-01-15',
    changelog: [
      'Complete UI overhaul with Bytewise design system',
      'USDA FoodData Central integration',
      'Weekly calorie logger implementation',
      'Enhanced nutrition metrics dashboard',
      'Mobile-first responsive design'
    ],
    required: true
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