/**
 * Data Persistence Hook
 * Automatically saves and syncs user data to localStorage and database
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PersistenceConfig {
  key: string;
  data: any;
  syncToDatabase?: boolean;
  debounceMs?: number;
}

export function useDataPersistence({ key, data, syncToDatabase = true, debounceMs = 1000 }: PersistenceConfig) {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<string>('');

  // Save to localStorage with quota error handling
  const saveToLocalStorage = useCallback((dataToSave: any) => {
    try {
      if (dataToSave === undefined || dataToSave === null) return;
      
      const serialized = JSON.stringify(dataToSave);
      
      // Only store small essential data to avoid quota errors
      if (serialized.length < 50000) { // 50KB limit
        localStorage.setItem(key, serialized);
        localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
      }
      
      return true;
    } catch (error) {
      // Handle quota exceeded errors gracefully
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, skipping save for:', key);
      }
      return false;
    }
  }, [key]);

  // Sync to database mutation
  const syncMutation = useMutation({
    mutationFn: async (dataToSync: any) => {
      if (!user) return;
      
      // Emit sync start event
      window.dispatchEvent(new CustomEvent('sync-start'));
      
      return apiRequest('POST', '/api/user/sync-data', {
        key,
        data: dataToSync,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: (response: any) => {
      lastSyncRef.current = new Date().toISOString();
      localStorage.setItem(`${key}_lastSync`, lastSyncRef.current);
      
      // Emit sync success event
      window.dispatchEvent(new CustomEvent('sync-success', {
        detail: { 
          message: `Saved ${response?.itemsBackedUp || 0} items`,
          key,
          itemsBackedUp: response?.itemsBackedUp 
        }
      }));
    },
    onError: (error) => {
      // Emit sync error event for user feedback
      window.dispatchEvent(new CustomEvent('sync-error', {
        detail: { key, error: error.message }
      }));
    }
  });

  // Debounced sync to database with performance optimization
  const syncToDb = useCallback((dataToSync: any) => {
    if (!syncToDatabase || !user) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Use variable debounce based on data size for performance
    const dataSize = JSON.stringify(dataToSync).length;
    const dynamicDebounce = dataSize > 10000 ? debounceMs + 500 : debounceMs;

    // Set new timeout for debounced sync
    timeoutRef.current = setTimeout(() => {
      syncMutation.mutate(dataToSync);
    }, dynamicDebounce);
  }, [syncToDatabase, user, debounceMs, syncMutation]);

  // Auto-save effect with enhanced cleanup
  useEffect(() => {
    if (data === undefined || data === null) return;

    // Save to localStorage immediately
    const saved = saveToLocalStorage(data);
    
    if (saved) {
      // Sync to database (debounced)
      syncToDb(data);
    }

    // Enhanced cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      
      // Force final save on cleanup if there's unsaved data
      if (data !== undefined && data !== null) {
        saveToLocalStorage(data);
      }
    };
  }, [data, saveToLocalStorage, syncToDb]);

  // Load data from localStorage on mount
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Try backup if main key fails
      const backup = localStorage.getItem(`${key}_backup`);
      if (backup) {
        return JSON.parse(backup);
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return null;
  }, [key]);

  // Force sync function
  const forceSync = useCallback(() => {
    if (data && user) {
      syncMutation.mutate(data);
      toast({
        title: "Syncing data",
        description: "Your data is being backed up to the cloud"
      });
    }
  }, [data, user, syncMutation, toast]);

  return {
    loadFromLocalStorage,
    saveToLocalStorage,
    forceSync,
    isSyncing: syncMutation.isPending,
    lastSync: lastSyncRef.current
  };
}

// Global data persistence manager
export class DataPersistenceManager {
  private static instance: DataPersistenceManager;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): DataPersistenceManager {
    if (!DataPersistenceManager.instance) {
      DataPersistenceManager.instance = new DataPersistenceManager();
    }
    return DataPersistenceManager.instance;
  }

  // Save all app data
  saveAllData() {
    const dataKeys = [
      'meals',
      'recipes', 
      'waterIntake',
      'calorieGoal',
      'proteinGoal',
      'carbGoal',
      'fatGoal',
      'waterGoal',
      'userProfile',
      'achievements',
      'fastingSessions'
    ];

    dataKeys.forEach(key => {
      const element = document.querySelector(`[data-persistence-key="${key}"]`);
      if (element) {
        const event = new CustomEvent('persist-data', { detail: { key } });
        element.dispatchEvent(event);
      }
    });
  }

  // Start coordinated auto-save with longer interval to reduce conflicts
  startAutoSave(intervalMs: number = 45000) {
    this.stopAutoSave();
    
    // Stagger the timer to avoid conflicts with other systems
    setTimeout(() => {
      this.syncInterval = setInterval(() => {
        this.saveAllData();
      }, intervalMs);
    }, 2000); // 2-second delay to let other systems initialize

    // Save on page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Save on visibility change (tab switch, minimize)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // Stop auto-save with complete cleanup
  stopAutoSave() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Clean up event listeners
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Clear any pending saves
    this.saveAllData();
  }

  // Complete cleanup method
  cleanup() {
    this.stopAutoSave();
  }

  private handleBeforeUnload = () => {
    this.saveAllData();
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.saveAllData();
    }
  };
}

// Initialize auto-save with proper cleanup
let globalManagerInstance: DataPersistenceManager | null = null;

if (typeof window !== 'undefined') {
  try {
    // Cleanup any existing instance first
    if (globalManagerInstance) {
      try {
        (globalManagerInstance as any).cleanup?.();
      } catch {}
    }
    
    globalManagerInstance = DataPersistenceManager.getInstance();
    try {
      (globalManagerInstance as any).startAutoSave?.();
    } catch {}
  } catch (error) {
    console.warn('Failed to initialize auto-save:', error);
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    try {
      const instance = globalManagerInstance;
      if (instance) {
        try {
          (instance as any).cleanup?.();
        } catch {}
        globalManagerInstance = null;
      }
    } catch {}
  });
  
  // Development hot-reload cleanup
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      try {
        const instance = globalManagerInstance;
        if (instance) {
          try {
            (instance as any).cleanup?.();
          } catch {}
          globalManagerInstance = null;
        }
      } catch {}
    });
  }
}