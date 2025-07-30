/**
 * Bytewise Version Management System
 * 
 * Comprehensive version tracking and management utilities
 * Features:
 * - Automatic version detection and logging
 * - Version history tracking with local storage
 * - Version comparison and update detection
 * - Release notes and changelog management
 * - Brand-consistent version display formatting
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Version information interface
export interface VersionInfo {
  version: string;
  build: string;
  releaseDate: string;
  timestamp: number;
  features: string[];
  bugfixes: string[];
  isPrerelease: boolean;
  releaseNotes?: string;
  commitHash?: string;
}

// Version history entry
export interface VersionHistoryEntry {
  version: string;
  build: string;
  installedAt: string;
  updatedFrom?: string;
  isFirstInstall: boolean;
}

// Version comparison result
export interface VersionComparison {
  isNewer: boolean;
  isOlder: boolean;
  isSame: boolean;
  majorDiff: number;
  minorDiff: number;
  patchDiff: number;
}

// Version manager context type
interface VersionManagerContextType {
  currentVersion: VersionInfo;
  versionHistory: VersionHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Version operations
  checkForUpdates: () => Promise<VersionInfo | null>;
  getVersionHistory: () => VersionHistoryEntry[];
  clearVersionHistory: () => void;
  compareVersions: (v1: string, v2: string) => VersionComparison;
  formatVersionDisplay: (version: VersionInfo) => string;
  getVersionStats: () => VersionStats;
  recordVersionInstall: (version: VersionInfo, previousVersion?: string) => void;
}

// Version statistics
interface VersionStats {
  totalInstalls: number;
  daysSinceFirstInstall: number;
  daysSinceLastUpdate: number;
  updateFrequency: number;
  versionCount: number;
}

// Current app version - Update this when releasing new versions
const CURRENT_VERSION: VersionInfo = {
  version: '1.2.0',
  build: '2024.12.3',
  releaseDate: '2024-12-03T00:00:00Z',
  timestamp: Date.now(),
  isPrerelease: false,
  features: [
    'Enhanced app version tracking system',
    'Improved meal logging with completion status',
    'Visual background images for dashboard metrics',
    'Editable calorie goals in profile settings'
  ],
  bugfixes: [
    'Fixed notification throttling issues',
    'Improved meal data persistence',
    'Enhanced database connection stability'
  ],
  releaseNotes: 'Major update with enhanced tracking capabilities and visual improvements.',
  commitHash: 'abc123def456' // In real app, this would be populated during build
};

// Version history storage key
const VERSION_HISTORY_KEY = 'bytewise-version-history';
const CURRENT_VERSION_KEY = 'bytewise-current-version';

// Create context
const VersionManagerContext = createContext<VersionManagerContextType | undefined>(undefined);

// Version Manager Provider Component
export function VersionManagerProvider({ children }: { children: React.ReactNode }) {
  const [currentVersion, setCurrentVersion] = useState<VersionInfo>(CURRENT_VERSION);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize version management
  useEffect(() => {
    initializeVersionManager();
  }, []);

  // Initialize version manager
  const initializeVersionManager = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load version history from storage
      const storedHistory = localStorage.getItem(VERSION_HISTORY_KEY);
      const storedCurrentVersion = localStorage.getItem(CURRENT_VERSION_KEY);
      
      let history: VersionHistoryEntry[] = [];
      let previousVersion: string | undefined;

      if (storedHistory) {
        history = JSON.parse(storedHistory);
        setVersionHistory(history);
      }

      if (storedCurrentVersion) {
        const stored = JSON.parse(storedCurrentVersion);
        previousVersion = stored.version;
      }

      // Check if this is a version update
      const isVersionUpdate = previousVersion && previousVersion !== CURRENT_VERSION.version;
      const isFirstInstall = !storedCurrentVersion;

      if (isVersionUpdate || isFirstInstall) {
        // Record the new version installation
        recordVersionInstall(CURRENT_VERSION, previousVersion);
        
        // Log version change
        if (isVersionUpdate) {
          console.log(`🚀 Bytewise updated from v${previousVersion} to v${CURRENT_VERSION.version}`);
          
          // Dispatch version update event
          window.dispatchEvent(new CustomEvent('bytewise-version-updated', {
            detail: {
              previousVersion,
              newVersion: CURRENT_VERSION.version,
              features: CURRENT_VERSION.features,
              bugfixes: CURRENT_VERSION.bugfixes
            }
          }));
        } else {
          console.log(`🎉 Bytewise v${CURRENT_VERSION.version} installed for the first time`);
          
          // Dispatch first install event
          window.dispatchEvent(new CustomEvent('bytewise-first-install', {
            detail: {
              version: CURRENT_VERSION.version,
              build: CURRENT_VERSION.build
            }
          }));
        }
      }

      // Update current version in storage
      localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(CURRENT_VERSION));
      setCurrentVersion(CURRENT_VERSION);

      console.log('✅ Version manager initialized successfully');
      console.log('📊 Current version:', CURRENT_VERSION);
      console.log('📈 Version history:', history);

    } catch (error) {
      console.error('❌ Failed to initialize version manager:', error);
      setError('Failed to initialize version tracking');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Record version installation
  const recordVersionInstall = useCallback((version: VersionInfo, previousVersion?: string) => {
    try {
      const newEntry: VersionHistoryEntry = {
        version: version.version,
        build: version.build,
        installedAt: new Date().toISOString(),
        updatedFrom: previousVersion,
        isFirstInstall: !previousVersion
      };

      const updatedHistory = [...versionHistory, newEntry];
      setVersionHistory(updatedHistory);
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(updatedHistory));

      console.log('📝 Version installation recorded:', newEntry);
    } catch (error) {
      console.error('❌ Failed to record version install:', error);
    }
  }, [versionHistory]);

  // Check for updates (placeholder for future implementation)
  const checkForUpdates = useCallback(async (): Promise<VersionInfo | null> => {
    try {
      // In a real app, this would check a remote server for updates
      console.log('🔍 Checking for updates...');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, return null (no updates available)
      console.log('✅ No updates available');
      return null;
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
      setError('Failed to check for updates');
      return null;
    }
  }, []);

  // Get version history
  const getVersionHistory = useCallback((): VersionHistoryEntry[] => {
    return [...versionHistory].sort((a, b) => 
      new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime()
    );
  }, [versionHistory]);

  // Clear version history
  const clearVersionHistory = useCallback(() => {
    try {
      setVersionHistory([]);
      localStorage.removeItem(VERSION_HISTORY_KEY);
      console.log('🧹 Version history cleared');
    } catch (error) {
      console.error('❌ Failed to clear version history:', error);
      setError('Failed to clear version history');
    }
  }, []);

  // Compare two version strings
  const compareVersions = useCallback((v1: string, v2: string): VersionComparison => {
    const parseVersion = (version: string) => {
      const parts = version.replace(/^v/, '').split('.').map(Number);
      return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0
      };
    };

    const version1 = parseVersion(v1);
    const version2 = parseVersion(v2);

    const majorDiff = version1.major - version2.major;
    const minorDiff = version1.minor - version2.minor;
    const patchDiff = version1.patch - version2.patch;

    let isNewer = false;
    let isOlder = false;
    let isSame = false;

    if (majorDiff > 0 || (majorDiff === 0 && minorDiff > 0) || (majorDiff === 0 && minorDiff === 0 && patchDiff > 0)) {
      isNewer = true;
    } else if (majorDiff < 0 || (majorDiff === 0 && minorDiff < 0) || (majorDiff === 0 && minorDiff === 0 && patchDiff < 0)) {
      isOlder = true;
    } else {
      isSame = true;
    }

    return {
      isNewer,
      isOlder,
      isSame,
      majorDiff,
      minorDiff,
      patchDiff
    };
  }, []);

  // Format version for display
  const formatVersionDisplay = useCallback((version: VersionInfo): string => {
    const versionStr = version.isPrerelease ? `${version.version}-beta` : version.version;
    return `v${versionStr} (Build ${version.build})`;
  }, []);

  // Get version statistics
  const getVersionStats = useCallback((): VersionStats => {
    const now = new Date();
    const history = getVersionHistory();
    
    const firstInstall = history.find(entry => entry.isFirstInstall);
    const lastUpdate = history[0]; // Most recent entry
    
    const daysSinceFirstInstall = firstInstall ? 
      Math.floor((now.getTime() - new Date(firstInstall.installedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const daysSinceLastUpdate = lastUpdate ? 
      Math.floor((now.getTime() - new Date(lastUpdate.installedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const updateFrequency = daysSinceFirstInstall > 0 ? 
      Math.round((history.length / daysSinceFirstInstall) * 30) : 0; // Updates per month
    
    return {
      totalInstalls: history.length,
      daysSinceFirstInstall,
      daysSinceLastUpdate,
      updateFrequency,
      versionCount: new Set(history.map(h => h.version)).size
    };
  }, [getVersionHistory]);

  const contextValue: VersionManagerContextType = {
    currentVersion,
    versionHistory,
    isLoading,
    error,
    checkForUpdates,
    getVersionHistory,
    clearVersionHistory,
    compareVersions,
    formatVersionDisplay,
    getVersionStats,
    recordVersionInstall
  };

  return (
    <VersionManagerContext.Provider value={contextValue}>
      {children}
    </VersionManagerContext.Provider>
  );
}

// Custom hook to use version manager
export function useVersionManager(): VersionManagerContextType {
  const context = useContext(VersionManagerContext);
  if (context === undefined) {
    throw new Error('useVersionManager must be used within a VersionManagerProvider');
  }
  return context;
}

// Version utilities that can be used without context
export const VersionUtils = {
  // Parse version string into components
  parseVersion: (version: string) => {
    const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4] || null,
      raw: version
    };
  },

  // Check if version is valid
  isValidVersion: (version: string): boolean => {
    try {
      VersionUtils.parseVersion(version);
      return true;
    } catch {
      return false;
    }
  },

  // Get version display string
  getDisplayString: (version: VersionInfo): string => {
    const versionStr = version.isPrerelease ? `${version.version}-beta` : version.version;
    return `v${versionStr} (Build ${version.build})`;
  },

  // Get short version string
  getShortVersion: (version: VersionInfo): string => {
    return version.isPrerelease ? `${version.version}-beta` : version.version;
  },

  // Check if version is prerelease
  isPrerelease: (version: string): boolean => {
    return version.includes('-') && (version.includes('alpha') || version.includes('beta') || version.includes('rc'));
  },

  // Format build date
  formatBuildDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  }
};

// Export current version for use in other components
export { CURRENT_VERSION };