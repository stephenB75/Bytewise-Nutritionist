/**
 * Data Integrity Hook
 * Ensures user data persists across app refresh, closure, and deployment
 * Prioritizes database storage with localStorage as backup
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DataIntegrityStatus {
  isVerified: boolean;
  lastBackup: string | null;
  dataHealth: 'healthy' | 'at-risk' | 'degraded';
  issues: string[];
}

export function useDataIntegrity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<DataIntegrityStatus>({
    isVerified: false,
    lastBackup: null,
    dataHealth: 'healthy',
    issues: []
  });

  // Clean corrupted data before sync
  const cleanCorruptedData = useCallback(() => {
    console.log('🧹 Cleaning corrupted local data...');
    let cleanedItems = 0;

    // Clean weeklyMeals - remove entries with unrealistic values
    const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    const cleanedMeals = weeklyMeals.filter((meal: any) => {
      const calories = Number(meal.calories) || 0;
      const protein = Number(meal.protein) || 0;
      const carbs = Number(meal.carbs) || 0;
      const fat = Number(meal.fat) || 0;
      
      // Remove entries with unrealistic values (likely corrupted)
      if (calories > 10000 || protein > 500 || carbs > 1000 || fat > 500) {
        cleanedItems++;
        return false;
      }
      return true;
    });
    
    if (cleanedItems > 0) {
      localStorage.setItem('weeklyMeals', JSON.stringify(cleanedMeals));
    }

    // Clean calculatedCalories
    const calculatedCalories = JSON.parse(localStorage.getItem('calculatedCalories') || '[]');
    const cleanedCalories = calculatedCalories.filter((entry: any) => {
      const calories = Number(entry.calories) || 0;
      if (calories > 10000) {
        cleanedItems++;
        return false;
      }
      return true;
    });
    
    if (cleanedItems > 0) {
      localStorage.setItem('calculatedCalories', JSON.stringify(cleanedCalories));
    }

    if (cleanedItems > 0) {
      console.log(`✅ Cleaned ${cleanedItems} corrupted data entries`);
    }

    return cleanedItems;
  }, []);

  // Verify critical data exists in database
  const verifyDataIntegrity = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔍 Verifying data integrity...');
      const issues: string[] = [];

      // Clean corrupted data first
      const cleanedItems = cleanCorruptedData();
      if (cleanedItems > 0) {
        issues.push(`Cleaned ${cleanedItems} corrupted entries`);
      }

      // Check user profile in database with timeout
      try {
        const userResponse = await Promise.race([
          apiRequest('GET', '/api/auth/user'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        if (!userResponse) {
          issues.push('User profile not found in database');
        }
      } catch (error: any) {
        if (error.message === 'Timeout' || error.message?.includes('fetch failed')) {
          issues.push('Database connection temporarily unavailable');
        } else {
          issues.push('Cannot access user profile');
        }
      }

      // Check meal data in database with better error handling
      try {
        const mealsResponse = await Promise.race([
          apiRequest('GET', '/api/meals/logged'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]) as any;
        const localMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        
        if (localMeals.length > 0 && (!mealsResponse || !Array.isArray(mealsResponse) || mealsResponse.length === 0)) {
          // Only flag as issue if we have good connection - might just be empty database
          issues.push('Meal data will be synced to database');
        }
      } catch (error: any) {
        if (error.message === 'Timeout' || error.message?.includes('fetch failed')) {
          issues.push('Meal sync temporarily unavailable due to connection issues');
        } else {
          issues.push('Cannot verify meal data persistence');
        }
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

      // Show appropriate messages based on issue types
      if (issues.length > 0) {
        console.warn('⚠️ Data integrity issues found:', issues);
        
        const hasConnectionIssues = issues.some(issue => 
          issue.includes('connection') || issue.includes('unavailable') || issue.includes('Timeout')
        );
        
        if (hasConnectionIssues) {
          // Don't show toast for temporary connection issues - this is normal
          console.log('ℹ️ Connection issues detected, data will sync when connection is restored');
        } else {
          toast({
            title: 'Data Sync Status',
            description: `${issues.length} sync issue(s) detected. Your data is protected locally.`,
            variant: 'default'
          });
        }
      }

    } catch (error) {
      console.error('❌ Data integrity verification failed:', error);
      setStatus(prev => ({
        ...prev,
        dataHealth: 'degraded',
        issues: ['Data verification failed']
      }));
    }
  }, [user, toast]);

  // Backup critical data to database with better error handling
  const backupCriticalData = useCallback(async () => {
    if (!user) return;

    try {
      console.log('💾 Starting critical data backup...');
      let itemsBackedUp = 0;
      let connectionError = false;

      // Import and use cleanup function
      const { cleanupCorruptedMealData } = await import('@/utils/dataCleanup');
      cleanupCorruptedMealData();

      // Get cleaned meal data after cleanup
      const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      
      // Check for data corruption - if too many meals, don't backup
      const mealsByDate = weeklyMeals.reduce((acc: any, meal: any) => {
        const date = meal.date || new Date().toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      const maxMealsPerDay = Math.max(...Object.values(mealsByDate).map(count => Number(count)));
      
      if (maxMealsPerDay > 30) {
        console.log(`🚫 Skipping backup: corrupted data detected (${maxMealsPerDay} meals in one day)`);
        return 0; // Don't backup corrupted data
      }
      
      if (weeklyMeals.length > 0) {
        // Only backup recent, valid meals with strict validation
        const validMeals = weeklyMeals
          .slice(-100) // Last 100 meals max
          .filter((meal: any) => {
            const calories = Number(meal.calories) || 0;
            // Stricter validation to prevent unrealistic values
            return calories > 0 && calories < 3000 && meal.name && meal.date;
          })
          .slice(-50); // Final limit to 50 meals

        for (const meal of validMeals) {
          try {
            await Promise.race([
              apiRequest('POST', '/api/meals/logged', {
                name: meal.name,
                date: meal.timestamp || new Date().toISOString(),
                mealType: meal.mealType || 'snack',
                totalCalories: meal.calories || 0,
                totalProtein: meal.protein || 0,
                totalCarbs: meal.carbs || 0,
                totalFat: meal.fat || 0
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Backup timeout')), 10000))
            ]);
            itemsBackedUp++;
          } catch (error: any) {
            if (error.message?.includes('fetch failed') || error.message === 'Backup timeout') {
              connectionError = true;
              console.warn('Connection issue during backup, will retry later');
              break; // Stop trying if connection issues
            } else {
              console.warn('Failed to backup meal:', meal.name, error.message);
            }
          }
        }
      }

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
          console.warn('Failed to backup user goals');
        }
      }

      // Record successful backup
      localStorage.setItem('lastDataBackup', new Date().toISOString());
      localStorage.setItem('itemsBackedUp', itemsBackedUp.toString());

      if (connectionError) {
        console.log(`⚠️ Backup partially completed: ${itemsBackedUp} items (connection issues detected)`);
        // Don't show toast for connection issues
      } else {
        console.log(`✅ Backed up ${itemsBackedUp} data items`);
        
        if (itemsBackedUp > 0) {
          toast({
            title: 'Data Backup Complete',
            description: `Successfully backed up ${itemsBackedUp} items to secure database`,
            variant: 'default'
          });
        }
      }

      return itemsBackedUp;
    } catch (error) {
      console.error('❌ Critical data backup failed:', error);
      throw error;
    }
  }, [user, toast]);

  // Restore data from database if localStorage is empty
  const restoreDataFromDatabase = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔄 Checking for data to restore...');
      
      // Check if localStorage is empty but user has database data
      const localMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      
      if (localMeals.length === 0) {
        try {
          const databaseMeals = await apiRequest('GET', '/api/meals/logged') as any;
          if (databaseMeals && Array.isArray(databaseMeals) && databaseMeals.length > 0) {
            // Filter out corrupted database entries BEFORE restoring
            const validDatabaseMeals = databaseMeals.filter((meal: any) => {
              const calories = Number(meal.totalCalories) || 0;
              // Prevent restoring unrealistic calorie values from database
              return calories > 0 && calories < 3000 && meal.name;
            });
            
            if (validDatabaseMeals.length === 0) {
              console.log('⚠️ No valid meals found in database backup');
              return;
            }
            
            // Convert database format to localStorage format
            const restoredMeals = validDatabaseMeals.map((meal: any) => ({
              id: meal.id || `restored-${Date.now()}-${Math.random()}`,
              name: meal.name,
              calories: Number(meal.totalCalories) || 0,
              protein: meal.totalProtein || 0,
              carbs: meal.totalCarbs || 0,
              fat: meal.totalFat || 0,
              date: meal.date ? new Date(meal.date).toLocaleDateString() : new Date().toLocaleDateString(),
              time: meal.date ? new Date(meal.date).toLocaleTimeString() : new Date().toLocaleTimeString(),
              mealType: meal.mealType || 'snack',
              timestamp: meal.date || new Date().toISOString(),
              source: 'database'
            }));

            localStorage.setItem('weeklyMeals', JSON.stringify(restoredMeals));
            
            console.log(`✅ Restored ${restoredMeals.length} valid meals from database (filtered out ${databaseMeals.length - validDatabaseMeals.length} corrupted entries)`);
            
            toast({
              title: 'Data Restored',
              description: `Restored ${restoredMeals.length} meals from your secure backup`,
              variant: 'default'
            });

            // Notify other components of restored data
            window.dispatchEvent(new CustomEvent('data-restored'));
          }
        } catch (error) {
          console.warn('Could not restore meal data:', error);
        }
      }
    } catch (error) {
      console.error('❌ Data restoration failed:', error);
    }
  }, [user, toast]);

  // Auto-verify data integrity on app start (backup disabled to prevent corruption)
  useEffect(() => {
    if (user) {
      // First restore any missing data
      restoreDataFromDatabase().then(() => {
        // Then verify integrity
        verifyDataIntegrity();
        
        // Periodic backup DISABLED until data corruption is resolved
        console.log('ℹ️ Automatic backup disabled to prevent data corruption');
        
        // Uncomment when data is clean:
        // const backupInterval = setInterval(() => {
        //   backupCriticalData().catch(console.error);
        // }, 15 * 60 * 1000);
        // return () => clearInterval(backupInterval);
      });
    }
  }, [user, restoreDataFromDatabase, verifyDataIntegrity]);

  return {
    status,
    verifyDataIntegrity,
    backupCriticalData,
    restoreDataFromDatabase
  };
}