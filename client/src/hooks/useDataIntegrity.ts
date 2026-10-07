/**
 * Data Integrity Hook
 * Ensures user data persists across app refresh, closure, and deployment
 * Prioritizes database storage with localStorage as backup
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface DataIntegrityStatus {
  isVerified: boolean;
  lastBackup: string | null;
  dataHealth: 'healthy' | 'at-risk' | 'degraded';
  issues: string[];
}

export function useDataIntegrity() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DataIntegrityStatus>({
    isVerified: false,
    lastBackup: null,
    dataHealth: 'healthy',
    issues: []
  });

  // Verify critical data exists in database
  const verifyDataIntegrity = useCallback(async () => {
    if (!user) return;

    try {
      const issues: string[] = [];

      // Check user profile in database
      try {
        const userResponse = await apiRequest('GET', '/api/auth/user');
        if (!userResponse) {
          issues.push('User profile not found in database');
        }
      } catch (error) {
        issues.push('Cannot access user profile');
      }

      // Check meal data in database (skip localStorage check to avoid quota errors)
      try {
        const mealsResponse = await apiRequest('GET', '/api/meals/logged') as any;
        if (!mealsResponse || !Array.isArray(mealsResponse)) {
          issues.push('Cannot access meal data from database');
        }
      } catch (error) {
        issues.push('Cannot verify meal data persistence');
      }

      // Determine data health
      let dataHealth: 'healthy' | 'at-risk' | 'degraded' = 'healthy';
      if (issues.length > 0) {
        dataHealth = issues.length === 1 ? 'at-risk' : 'degraded';
      }

      setStatus({
        isVerified: true,
        lastBackup: localStorage.getItem('lastDataBackup'),
        dataHealth,
        issues
      });
      // Silent — never toast/push for integrity checks (native maps toast → OS banners).
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        dataHealth: 'degraded',
        issues: ['Data verification failed']
      }));
    }
  }, [user]);

  // Backup critical data to database
  const backupCriticalData = useCallback(async () => {
    if (!user) return;

    try {
      let itemsBackedUp = 0;

      // Skip localStorage backup to avoid quota errors - data is already in database

      // Backup user goals
      const goals = {
        dailyCalorieGoal: localStorage.getItem('dailyCalorieGoal'),
        dailyProteinGoal: localStorage.getItem('dailyProteinGoal'),
        dailyCarbGoal: localStorage.getItem('dailyCarbGoal'),
        dailyFatGoal: localStorage.getItem('dailyFatGoal'),
        dailyWaterGoal: localStorage.getItem('dailyWaterGoal')
      };

      if (Object.values(goals).some(goal => goal !== null)) {
        try {
          await apiRequest('POST', '/api/user/goals', goals);
          itemsBackedUp++;
        } catch (error) {
          // Failed to backup user goals
        }
      }

      // Record successful backup — silent (no toast / OS notification).
      localStorage.setItem('lastDataBackup', new Date().toISOString());
      localStorage.setItem('itemsBackedUp', itemsBackedUp.toString());

      return itemsBackedUp;
    } catch (error) {
      throw error;
    }
  }, [user]);

  // Restore data from database if localStorage is empty
  const restoreDataFromDatabase = useCallback(async () => {
    if (!user) return;

    try {
      
      // Check if localStorage is empty but user has database data
      const localMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      
      if (localMeals.length === 0) {
        try {
          const mealsResponse = await apiRequest('GET', '/api/meals/logged');
          const databaseMeals = await mealsResponse.json();
          if (databaseMeals && Array.isArray(databaseMeals) && databaseMeals.length > 0) {
            const restoredMeals = databaseMeals.map((meal: any) => {
              const rawDate = meal.date ? String(meal.date) : '';
              const dateKey = /^\d{4}-\d{2}-\d{2}/.test(rawDate)
                ? rawDate.slice(0, 10)
                : new Date().toISOString().slice(0, 10);
              return {
                id: meal.id || `restored-${Date.now()}-${Math.random()}`,
                name: meal.name,
                calories: meal.totalCalories || meal.calories || 0,
                totalCalories: meal.totalCalories || meal.calories || 0,
                protein: meal.totalProtein || meal.protein || 0,
                carbs: meal.totalCarbs || meal.carbs || 0,
                fat: meal.totalFat || meal.fat || 0,
                sugar: meal.totalSugar || meal.sugar || 0,
                date: dateKey,
                mealType: meal.mealType || 'snack',
                timestamp: meal.createdAt || meal.loggedAt || new Date().toISOString(),
                source: 'database',
              };
            });

            localStorage.setItem('weeklyMeals', JSON.stringify(restoredMeals));
            // Silent restore — no toast/notification/banner.
          }
        } catch (error) {
        }
      }
    } catch (error) {
    }
  }, [user]);

  // Auto-verify data integrity on app start
  useEffect(() => {
    if (user) {
      // First restore any missing data
      restoreDataFromDatabase().then(() => {
        // Then verify integrity
        verifyDataIntegrity();
        
        // Set up periodic backup
        const backupInterval = setInterval(() => {
          backupCriticalData().catch(console.error);
        }, 5 * 60 * 1000); // Backup every 5 minutes

        return () => clearInterval(backupInterval);
      });
    }
  }, [user, restoreDataFromDatabase, verifyDataIntegrity, backupCriticalData]);

  return {
    status,
    verifyDataIntegrity,
    backupCriticalData,
    restoreDataFromDatabase
  };
}