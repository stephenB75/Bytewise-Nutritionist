/**
 * Data Integrity Manager Component
 * Ensures user data persists across app refresh, closure, and deployment
 */

import { useEffect } from 'react';
import { useDataIntegrity } from '@/hooks/useDataIntegrity';
import { useAuth } from '@/hooks/useAuth';

export function DataIntegrityManager() {
  const { user } = useAuth();
  const { status, verifyDataIntegrity, backupCriticalData } = useDataIntegrity();

  useEffect(() => {
    if (user) {
      // Monitor for app-wide data changes and backup automatically
      const handleDataChange = () => {
        setTimeout(() => {
          backupCriticalData().catch(console.error);
        }, 1000); // Debounce backup requests
      };

      // Listen for critical data changes
      window.addEventListener('data-changed', handleDataChange);
      window.addEventListener('storage', handleDataChange);
      
      // Verify data integrity periodically (coordinated timing)
      const integrityInterval = setInterval(() => {
        verifyDataIntegrity();
      }, 12 * 60 * 1000); // Check every 12 minutes (offset from auto-save timing)

      return () => {
        window.removeEventListener('data-changed', handleDataChange);
        window.removeEventListener('storage', handleDataChange);
        clearInterval(integrityInterval);
      };
    }
  }, [user, backupCriticalData, verifyDataIntegrity]);

  // Component renders nothing - it's just for data management
  return null;
}