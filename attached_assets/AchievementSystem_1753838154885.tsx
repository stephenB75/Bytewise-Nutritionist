/**
 * Bytewise Achievement System
 * 
 * Comprehensive achievement definitions and automatic triggering
 * Features:
 * - Pre-defined achievements for all user actions
 * - Automatic progress tracking
 * - Smart achievement unlocking
 * - Category-based organization
 * - Integration with user stats
 */

import React, { useEffect, useCallback } from 'react';
import { Achievement, useUser } from './user/UserManager';
import { triggerAchievementNotification } from './AchievementNotification';

// Achievement Definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'id' | 'dateEarned' | 'isUnlocked'>[] = [
  // First Steps Category
  {
    title: "First Recipe",
    description: "Created your very first recipe in the Recipe Builder",
    icon: "🍳",
    category: "cooking",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },
  {
    title: "First Meal",
    description: "Logged your first meal successfully",
    icon: "🍽️",
    category: "nutrition",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },
  {
    title: "Profile Complete",
    description: "Filled out your complete user profile",
    icon: "👤",
    category: "health",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },

  // Consistency Category
  {
    title: "Day Streak",
    description: "Logged meals for 3 consecutive days",
    icon: "🔥",
    category: "consistency",
    progress: 0,
    maxProgress: 3,
    rarity: "common"
  },
  {
    title: "Week Warrior",
    description: "Maintained a 7-day meal logging streak",
    icon: "⚡",
    category: "consistency",
    progress: 0,
    maxProgress: 7,
    rarity: "rare"
  },
  {
    title: "Monthly Master",
    description: "Logged meals consistently for 30 days",
    icon: "🏆",
    category: "consistency",
    progress: 0,
    maxProgress: 30,
    rarity: "epic"
  },

  // Cooking Category
  {
    title: "Recipe Creator",
    description: "Created 5 different recipes",
    icon: "👨‍🍳",
    category: "cooking",
    progress: 0,
    maxProgress: 5,
    rarity: "common"
  },
  {
    title: "Kitchen Enthusiast",
    description: "Created 25 unique recipes",
    icon: "🥘",
    category: "cooking",
    progress: 0,
    maxProgress: 25,
    rarity: "rare"
  },
  {
    title: "Master Chef",
    description: "Created 100 amazing recipes",
    icon: "👑",
    category: "cooking",
    progress: 0,
    maxProgress: 100,
    rarity: "legendary"
  },

  // Nutrition Category
  {
    title: "Balanced Eater",
    description: "Hit your daily nutrition goals for the first time",
    icon: "⚖️",
    category: "nutrition",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },
  {
    title: "Nutrition Navigator",
    description: "Achieved nutrition goals for 7 consecutive days",
    icon: "🧭",
    category: "nutrition",
    progress: 0,
    maxProgress: 7,
    rarity: "rare"
  },
  {
    title: "Macro Master",
    description: "Perfect macro balance for 30 days",
    icon: "🎯",
    category: "nutrition",
    progress: 0,
    maxProgress: 30,
    rarity: "epic"
  },

  // Health Category
  {
    title: "Health Tracker",
    description: "Recorded your weight and health metrics",
    icon: "📊",
    category: "health",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },
  {
    title: "Goal Setter",
    description: "Set and customized your nutrition goals",
    icon: "🎯",
    category: "health",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },
  {
    title: "Wellness Warrior",
    description: "Maintained healthy habits for 60 days",
    icon: "💪",
    category: "health",
    progress: 0,
    maxProgress: 60,
    rarity: "epic"
  },

  // Social Category
  {
    title: "Early Adopter",
    description: "One of the first users to join Bytewise",
    icon: "🌟",
    category: "social",
    progress: 0,
    maxProgress: 1,
    rarity: "rare"
  },
  {
    title: "Feedback Hero",
    description: "Provided valuable feedback to improve the app",
    icon: "💬",
    category: "social",
    progress: 0,
    maxProgress: 1,
    rarity: "rare"
  },

  // Milestone Category
  {
    title: "Hundred Club",
    description: "Logged 100 meals in total",
    icon: "💯",
    category: "nutrition",
    progress: 0,
    maxProgress: 100,
    rarity: "rare"
  },
  {
    title: "Thousand Tracker",
    description: "Tracked 1000 calories worth of food",
    icon: "📈",
    category: "nutrition",
    progress: 0,
    maxProgress: 1000,
    rarity: "epic"
  },
  {
    title: "Dedication Legend",
    description: "Used Bytewise for 6 months consistently",
    icon: "🏅",
    category: "consistency",
    progress: 0,
    maxProgress: 180,
    rarity: "legendary"
  },

  // Special Category
  {
    title: "Speed Demon",
    description: "Created a recipe in under 60 seconds",
    icon: "⚡",
    category: "cooking",
    progress: 0,
    maxProgress: 1,
    rarity: "rare"
  },
  {
    title: "Midnight Snacker",
    description: "Logged a meal after midnight",
    icon: "🌙",
    category: "nutrition",
    progress: 0,
    maxProgress: 1,
    rarity: "common"
  },
  {
    title: "Weekend Warrior",
    description: "Maintained nutrition goals during weekends",
    icon: "🏖️",
    category: "nutrition",
    progress: 0,
    maxProgress: 8, // 8 weekend days
    rarity: "rare"
  }
];

// Achievement System Component
export function AchievementSystem() {
  const { user, addAchievement, updateStats } = useUser();

  // Check for achievements based on user stats
  const checkAchievements = useCallback(async () => {
    if (!user) return;

    const stats = user.stats;
    const currentAchievements = user.achievements;

    // Helper function to check if achievement exists
    const hasAchievement = (title: string) => {
      return currentAchievements.some(a => a.title === title);
    };

    // Helper function to unlock achievement
    const unlockAchievement = async (achievementDef: typeof ACHIEVEMENT_DEFINITIONS[0]) => {
      if (hasAchievement(achievementDef.title)) return;

      const achievement: Omit<Achievement, 'id' | 'dateEarned'> = {
        ...achievementDef,
        progress: achievementDef.maxProgress,
        isUnlocked: true
      };

      const success = await addAchievement(achievement);
      if (success) {
        console.log(`🏆 Achievement unlocked: ${achievement.title}`);
        triggerAchievementNotification(achievement as Achievement);
      }
    };

    // Check First Recipe
    if (stats.totalRecipes >= 1 && !hasAchievement("First Recipe")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "First Recipe")!);
    }

    // Check First Meal
    if (stats.totalMeals >= 1 && !hasAchievement("First Meal")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "First Meal")!);
    }

    // Check Recipe Creator (5 recipes)
    if (stats.totalRecipes >= 5 && !hasAchievement("Recipe Creator")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Recipe Creator")!);
    }

    // Check Kitchen Enthusiast (25 recipes)
    if (stats.totalRecipes >= 25 && !hasAchievement("Kitchen Enthusiast")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Kitchen Enthusiast")!);
    }

    // Check Master Chef (100 recipes)
    if (stats.totalRecipes >= 100 && !hasAchievement("Master Chef")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Master Chef")!);
    }

    // Check Day Streak (3 days)
    if (stats.streakDays >= 3 && !hasAchievement("Day Streak")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Day Streak")!);
    }

    // Check Week Warrior (7 days)
    if (stats.streakDays >= 7 && !hasAchievement("Week Warrior")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Week Warrior")!);
    }

    // Check Monthly Master (30 days)
    if (stats.streakDays >= 30 && !hasAchievement("Monthly Master")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Monthly Master")!);
    }

    // Check Hundred Club (100 meals)
    if (stats.totalMeals >= 100 && !hasAchievement("Hundred Club")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Hundred Club")!);
    }

    // Check Thousand Tracker (1000 calories)
    if (stats.caloriesTracked >= 1000 && !hasAchievement("Thousand Tracker")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Thousand Tracker")!);
    }

    // Check Goals Completed
    if (stats.goalsCompleted >= 1 && !hasAchievement("Balanced Eater")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Balanced Eater")!);
    }

    // Check Weekly Goals Met (7 days)
    if (stats.weeklyGoalsMet >= 7 && !hasAchievement("Nutrition Navigator")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Nutrition Navigator")!);
    }

    // Check Health Tracker (weight recorded)
    if (stats.weightsRecorded >= 1 && !hasAchievement("Health Tracker")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Health Tracker")!);
    }

    // Check Profile Complete (based on profile completeness)
    const profileFields = [
      user.personalInfo.firstName,
      user.personalInfo.lastName,
      user.personalInfo.email,
      user.personalInfo.height,
      user.personalInfo.weight
    ];
    const completedFields = profileFields.filter(field => field).length;
    
    if (completedFields >= 4 && !hasAchievement("Profile Complete")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Profile Complete")!);
    }

    // Check Early Adopter (based on join date)
    const joinDate = new Date(user.accountInfo.joinDate);
    const now = new Date();
    const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceJoin < 30 && !hasAchievement("Early Adopter")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Early Adopter")!);
    }

    // Check Dedication Legend (180 days of usage)
    if (daysSinceJoin >= 180 && stats.streakDays >= 90 && !hasAchievement("Dedication Legend")) {
      await unlockAchievement(ACHIEVEMENT_DEFINITIONS.find(a => a.title === "Dedication Legend")!);
    }

  }, [user, addAchievement, updateStats]);

  // Auto-check achievements when user stats change
  useEffect(() => {
    if (user) {
      // Small delay to allow for state updates
      const timer = setTimeout(() => {
        checkAchievements();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user?.stats, checkAchievements]);

  // Listen for specific achievement triggers
  useEffect(() => {
    const handleRecipeCreated = () => {
      console.log('🍳 Recipe created - checking achievements...');
      setTimeout(() => checkAchievements(), 100);
    };

    const handleMealLogged = () => {
      console.log('🍽️ Meal logged - checking achievements...');
      setTimeout(() => checkAchievements(), 100);
    };

    const handleGoalCompleted = () => {
      console.log('🎯 Goal completed - checking achievements...');
      setTimeout(() => checkAchievements(), 100);
    };

    const handleProfileUpdated = () => {
      console.log('👤 Profile updated - checking achievements...');
      setTimeout(() => checkAchievements(), 100);
    };

    // Listen for achievement trigger events
    window.addEventListener('bytewise-recipe-created', handleRecipeCreated);
    window.addEventListener('bytewise-meal-logged', handleMealLogged);
    window.addEventListener('bytewise-goal-completed', handleGoalCompleted);
    window.addEventListener('bytewise-profile-updated', handleProfileUpdated);

    return () => {
      window.removeEventListener('bytewise-recipe-created', handleRecipeCreated);
      window.removeEventListener('bytewise-meal-logged', handleMealLogged);
      window.removeEventListener('bytewise-goal-completed', handleGoalCompleted);
      window.removeEventListener('bytewise-profile-updated', handleProfileUpdated);
    };
  }, [checkAchievements]);

  return null; // This component doesn't render anything - it just manages achievements
}

// Hook for triggering achievements manually
export function useAchievementTriggers() {
  const { updateStats } = useUser();

  const triggerRecipeCreated = useCallback(async () => {
    await updateStats({ totalRecipes: (await updateStats({})).totalRecipes + 1 });
    window.dispatchEvent(new CustomEvent('bytewise-recipe-created'));
  }, [updateStats]);

  const triggerMealLogged = useCallback(async () => {
    await updateStats({ totalMeals: (await updateStats({})).totalMeals + 1 });
    window.dispatchEvent(new CustomEvent('bytewise-meal-logged'));
  }, [updateStats]);

  const triggerGoalCompleted = useCallback(async () => {
    await updateStats({ goalsCompleted: (await updateStats({})).goalsCompleted + 1 });
    window.dispatchEvent(new CustomEvent('bytewise-goal-completed'));
  }, [updateStats]);

  const triggerProfileUpdated = useCallback(() => {
    window.dispatchEvent(new CustomEvent('bytewise-profile-updated'));
  }, []);

  const triggerStreakIncreased = useCallback(async (days: number) => {
    await updateStats({ streakDays: days });
    window.dispatchEvent(new CustomEvent('bytewise-streak-updated', { detail: { days } }));
  }, [updateStats]);

  const triggerCaloriesTracked = useCallback(async (calories: number) => {
    const currentStats = await updateStats({});
    await updateStats({ caloriesTracked: currentStats.caloriesTracked + calories });
  }, [updateStats]);

  return {
    triggerRecipeCreated,
    triggerMealLogged,
    triggerGoalCompleted,
    triggerProfileUpdated,
    triggerStreakIncreased,
    triggerCaloriesTracked
  };
}

// Utility functions for easy achievement triggering
export function triggerAchievementCheck() {
  window.dispatchEvent(new CustomEvent('bytewise-check-achievements'));
}

export function simulateFirstRecipe() {
  window.dispatchEvent(new CustomEvent('bytewise-recipe-created'));
}

export function simulateFirstMeal() {
  window.dispatchEvent(new CustomEvent('bytewise-meal-logged'));
}

export function simulateGoalCompleted() {
  window.dispatchEvent(new CustomEvent('bytewise-goal-completed'));
}