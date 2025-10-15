/**
 * Data Restoration Hook
 * Handles restoring user data from localStorage on app load
 */

import { useState, useEffect } from 'react';

export function useDataRestoration() {
  const [isRestoring, setIsRestoring] = useState(true);
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const restoreData = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('auth_token');
        if (token) {
          // User is authenticated, data should be restored from API
          setHasRestored(true);
        } else {
          // No authentication, no data to restore
          setHasRestored(false);
        }
      } catch (error) {
        console.error('Data restoration error:', error);
        setHasRestored(false);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreData();
  }, []);

  return {
    isRestoring,
    hasRestored,
  };
}
