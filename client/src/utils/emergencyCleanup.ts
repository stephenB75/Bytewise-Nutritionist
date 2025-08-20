/**
 * Emergency cleanup utilities for fixing data corruption
 * Can be run manually to clear all corrupted data
 */

import { apiRequest } from '@/lib/queryClient';
import { cleanupCorruptedMealData, emergencyDataReset } from './dataCleanup';

/**
 * Run complete data cleanup - both local and database
 */
export async function runCompleteDataCleanup(userId?: string): Promise<{
  localCleanup: { originalCount: number; cleanedCount: number; removedCount: number };
  databaseCleanup?: { success: boolean; removedCount?: number; fixedCount?: number };
}> {
  console.log('🚨 Running complete data cleanup...');
  
  // Clean local data first
  const localResult = cleanupCorruptedMealData();
  
  let databaseResult = undefined;
  
  // Clean database if user is authenticated
  if (userId) {
    try {
      const response = await apiRequest('POST', '/api/admin/cleanup-database');
      databaseResult = {
        success: true,
        ...response
      };
    } catch (error) {
      console.warn('Database cleanup failed:', error);
      databaseResult = { success: false };
    }
  }
  
  return {
    localCleanup: localResult,
    databaseCleanup: databaseResult
  };
}

/**
 * Emergency reset - clears all data
 */
export async function runEmergencyReset(): Promise<boolean> {
  console.log('🚨 Running emergency data reset...');
  
  const success = emergencyDataReset();
  
  if (success) {
    // Refresh the page to clear any cached data
    window.location.reload();
  }
  
  return success;
}

/**
 * Add emergency cleanup button to window for testing
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).emergencyCleanup = {
    runCompleteDataCleanup,
    runEmergencyReset,
    cleanupCorruptedMealData
  };
  
  console.log('🔧 Emergency cleanup tools available via window.emergencyCleanup');
}