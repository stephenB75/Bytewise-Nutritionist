/**
 * Data Restoration Hook
 * Automatically restores user data from database when logging in
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface RestoredData {
  success: boolean;
  data?: {
    userProfile?: any;
    meals?: any[];
    recipes?: any[];
    waterIntake?: any[];
    achievements?: any[];
    calorieGoal?: number;
    proteinGoal?: number;
    carbGoal?: number;
    fatGoal?: number;
    waterGoal?: number;
  };
  message?: string;
  timestamp?: string;
}

export function useDataRestoration() {
  const { user } = useAuth();
  const hasRestoredRef = useRef(false);

  // Restore data from database
  const { data: restoredData, isLoading } = useQuery<RestoredData>({
    queryKey: ['/api/user/restore-data'],
    enabled: !!user && !hasRestoredRef.current,
    retry: 1,
    staleTime: Infinity, // Don't refetch automatically
  });

  // Mark restore complete once — no toast, notification, or banner.
  useEffect(() => {
    if (restoredData?.success && restoredData.data && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
    }
  }, [restoredData]);

  // Reset when user logs out
  useEffect(() => {
    if (!user) {
      hasRestoredRef.current = false;
    }
  }, [user]);

  return {
    isRestoring: isLoading,
    hasRestored: hasRestoredRef.current
  };
}