/**
 * Data Integrity Hook
 * Manages data backup and integrity verification
 */

import { useState, useCallback } from 'react';

export function useDataIntegrity() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'backing-up' | 'error'>('idle');

  const verifyDataIntegrity = useCallback(async () => {
    setStatus('checking');
    try {
      // Check if critical data exists in localStorage
      const userData = localStorage.getItem('user_data');
      const mealData = localStorage.getItem('meal_data');
      
      if (!userData && !mealData) {
        setStatus('error');
        return false;
      }
      
      setStatus('idle');
      return true;
    } catch (error) {
      console.error('Data integrity check failed:', error);
      setStatus('error');
      return false;
    }
  }, []);

  const backupCriticalData = useCallback(async () => {
    setStatus('backing-up');
    try {
      // Backup critical data to localStorage
      const userData = {
        timestamp: Date.now(),
        data: {
          user: localStorage.getItem('user_data'),
          meals: localStorage.getItem('meal_data'),
          settings: localStorage.getItem('app_settings'),
        }
      };
      
      localStorage.setItem('data_backup', JSON.stringify(userData));
      setStatus('idle');
      return true;
    } catch (error) {
      console.error('Data backup failed:', error);
      setStatus('error');
      return false;
    }
  }, []);

  return {
    status,
    verifyDataIntegrity,
    backupCriticalData,
  };
}
