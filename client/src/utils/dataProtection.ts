/**
 * Data Protection Utility
 * Ensures user data persists across deployments and updates
 */

const PROTECTED_KEYS = [
  'weeklyMeals',
  'calculatedCalories',
  'weeklyTrackerData',
  'bytewise-weekly-tracker',
  'userProfile',
  'mealHistory',
  'recipeData',
  'waterIntake',
  'achievements',
  'fastingData',
  'weeklyProgress'
];

// Create backup of all protected data
export function backupUserData(): void {
  try {
    const backup: Record<string, any> = {};
    const timestamp = new Date().toISOString();
    
    PROTECTED_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        backup[key] = value;
      }
    });
    
    // Store backup with timestamp
    localStorage.setItem('bytewise_data_backup', JSON.stringify(backup));
    localStorage.setItem('bytewise_backup_timestamp', timestamp);
    
    console.log('User data backed up successfully');
  } catch (error) {
    console.error('Failed to backup user data:', error);
  }
}

// Restore data from backup if main keys are missing
export function restoreUserData(): boolean {
  try {
    const backupStr = localStorage.getItem('bytewise_data_backup');
    if (!backupStr) return false;
    
    const backup = JSON.parse(backupStr);
    let restoredCount = 0;
    
    Object.entries(backup).forEach(([key, value]) => {
      // Only restore if key is missing
      if (!localStorage.getItem(key) && value) {
        localStorage.setItem(key, value as string);
        restoredCount++;
      }
    });
    
    if (restoredCount > 0) {
      console.log(`Restored ${restoredCount} data keys from backup`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to restore user data:', error);
    return false;
  }
}

// Check if data needs restoration
export function checkDataIntegrity(): void {
  // Check if any critical data is missing
  const weeklyMeals = localStorage.getItem('weeklyMeals');
  const calculatedCalories = localStorage.getItem('calculatedCalories');
  
  if (!weeklyMeals && !calculatedCalories) {
    // Try to restore from backup
    const restored = restoreUserData();
    if (restored) {
      console.log('Data integrity check: Restored from backup');
    }
  }
}

// Auto-backup on page unload
export function initDataProtection(): void {
  // Backup data before page unload
  window.addEventListener('beforeunload', () => {
    backupUserData();
  });
  
  // Check data integrity on load
  checkDataIntegrity();
  
  // Periodic backup every 5 minutes
  setInterval(() => {
    backupUserData();
  }, 5 * 60 * 1000);
}

// Export all user data as JSON
export function exportUserData(): string {
  const data: Record<string, any> = {};
  
  PROTECTED_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });
  
  return JSON.stringify(data, null, 2);
}

// Import user data from JSON
export function importUserData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    Object.entries(data).forEach(([key, value]) => {
      if (PROTECTED_KEYS.includes(key)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}