/**
 * Data Restoration Hook
 * Automatically restores user data from database when logging in
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const { toast } = useToast();
  const hasRestoredRef = useRef(false);

  // Restore data from database
  const { data: restoredData, isLoading } = useQuery<RestoredData>({
    queryKey: ['/api/user/restore-data'],
    enabled: !!user && !hasRestoredRef.current,
    retry: 1,
    staleTime: Infinity, // Don't refetch automatically
  });

  // Process restored data
  useEffect(() => {
    if (restoredData?.success && restoredData.data && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      
      const { data } = restoredData;
      let itemsRestored = 0;

      // Count restored items but don't store in localStorage to avoid quota errors
      if (data.meals && data.meals.length > 0) {
        itemsRestored += data.meals.length;
      }

      if (data.recipes && data.recipes.length > 0) {
        itemsRestored += data.recipes.length;
      }

      if (data.waterIntake && data.waterIntake.length > 0) {
        itemsRestored += data.waterIntake.length;
      }

      // Goals are fetched from database, no need to store in localStorage
      if (data.calorieGoal || data.proteinGoal || data.carbGoal || data.fatGoal || data.waterGoal) {
        itemsRestored++;
      }

      if (data.achievements && data.achievements.length > 0) {
        itemsRestored += data.achievements.length;
      }

      if (data.userProfile) {
        itemsRestored++;
      }

      // Show success message if data was restored
      if (itemsRestored > 0) {
        toast({
          title: "Data restored",
          description: `Successfully restored ${itemsRestored} items from your account`,
          duration: 3000
        });
      }

      // Trigger a custom event to notify components that data was restored
      window.dispatchEvent(new CustomEvent('data-restored', { 
        detail: { 
          itemsRestored,
          timestamp: new Date().toISOString() 
        } 
      }));
    }
  }, [restoredData, toast]);

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