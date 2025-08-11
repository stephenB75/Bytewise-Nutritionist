/**
 * Data Restoration Hook
 * Automatically restores user data from database when logging in
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useDataRestoration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const hasRestoredRef = useRef(false);

  // Restore data from database
  const { data: restoredData, isLoading } = useQuery({
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

      // Restore meals
      if (data.meals && data.meals.length > 0) {
        const existingMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        const mealIds = new Set(existingMeals.map((m: any) => m.id));
        
        const newMeals = data.meals.filter((meal: any) => !mealIds.has(meal.id));
        if (newMeals.length > 0) {
          localStorage.setItem('weeklyMeals', JSON.stringify([...existingMeals, ...newMeals]));
          itemsRestored += newMeals.length;
        }
      }

      // Restore recipes
      if (data.recipes && data.recipes.length > 0) {
        const existingRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        const recipeIds = new Set(existingRecipes.map((r: any) => r.id));
        
        const newRecipes = data.recipes.filter((recipe: any) => !recipeIds.has(recipe.id));
        if (newRecipes.length > 0) {
          localStorage.setItem('savedRecipes', JSON.stringify([...existingRecipes, ...newRecipes]));
          itemsRestored += newRecipes.length;
        }
      }

      // Restore water intake
      if (data.waterIntake && data.waterIntake.length > 0) {
        const existingIntake = JSON.parse(localStorage.getItem('waterIntake') || '[]');
        const intakeIds = new Set(existingIntake.map((w: any) => `${w.date}-${w.timestamp}`));
        
        const newIntake = data.waterIntake.filter((intake: any) => 
          !intakeIds.has(`${intake.date}-${intake.timestamp}`)
        );
        if (newIntake.length > 0) {
          localStorage.setItem('waterIntake', JSON.stringify([...existingIntake, ...newIntake]));
          itemsRestored += newIntake.length;
        }
      }

      // Restore goals
      if (data.calorieGoal) localStorage.setItem('dailyCalorieGoal', data.calorieGoal.toString());
      if (data.proteinGoal) localStorage.setItem('dailyProteinGoal', data.proteinGoal.toString());
      if (data.carbGoal) localStorage.setItem('dailyCarbGoal', data.carbGoal.toString());
      if (data.fatGoal) localStorage.setItem('dailyFatGoal', data.fatGoal.toString());
      if (data.waterGoal) localStorage.setItem('dailyWaterGoal', data.waterGoal.toString());

      // Restore achievements
      if (data.achievements && data.achievements.length > 0) {
        localStorage.setItem('userAchievements', JSON.stringify(data.achievements));
        itemsRestored += data.achievements.length;
      }

      // Restore user profile
      if (data.userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
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