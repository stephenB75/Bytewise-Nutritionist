/**
 * Goal Achievements Hook
 * Manages goal-based achievements and celebrations
 */

import { useState, useCallback } from 'react';

export interface GoalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
}

export function useGoalAchievements() {
  const [achievements, setAchievements] = useState<GoalAchievement[]>([]);
  const [celebrationAchievement, setCelebrationAchievement] = useState<GoalAchievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
    setCelebrationAchievement(null);
  }, []);

  const checkGoalAchievements = useCallback(async () => {
    // Mock goal achievements for demo
    const mockAchievements: GoalAchievement[] = [
      {
        id: 'first-meal',
        title: 'First Meal Logged',
        description: 'You logged your first meal!',
        icon: '🍽️',
        achieved: true,
        achievedAt: new Date().toISOString(),
      },
      {
        id: 'calorie-goal',
        title: 'Calorie Goal Met',
        description: 'You met your daily calorie goal!',
        icon: '🎯',
        achieved: false,
      },
      {
        id: 'protein-goal',
        title: 'Protein Goal Met',
        description: 'You met your daily protein goal!',
        icon: '💪',
        achieved: false,
      },
    ];

    setAchievements(mockAchievements);
  }, []);

  return {
    achievements,
    celebrationAchievement,
    showCelebration,
    closeCelebration,
    checkGoalAchievements,
  };
}
