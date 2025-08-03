/**
 * Goal-based Achievement System Hook
 * 
 * Only handles achievements related to daily and weekly nutrition goals
 * Prevents achievement spam from non-goal activities
 */

import { useState, useCallback } from 'react';
import { Trophy, Target, Calendar, Flame, Star } from 'lucide-react';

export interface GoalAchievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: 'daily' | 'weekly';
  points: number;
  earnedAt: Date;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface WeeklyGoals {
  consistentLogging: number; // days per week
  calorieTarget: number; // weekly average
  exerciseDays: number;
  mealPrepDays: number;
}

const DAILY_ACHIEVEMENTS = [
  {
    id: 'daily_calories_met',
    title: 'Daily Calorie Champion',
    description: 'Met your daily calorie goal',
    icon: Flame,
    points: 10
  },
  {
    id: 'daily_protein_met',
    title: 'Protein Power',
    description: 'Reached your daily protein target',
    icon: Target,
    points: 10
  },
  {
    id: 'daily_all_macros',
    title: 'Macro Master',
    description: 'Hit all your macro targets for the day',
    icon: Star,
    points: 25
  },
  {
    id: 'daily_water_goal',
    title: 'Hydration Hero',
    description: 'Completed your daily water intake goal',
    icon: Trophy,
    points: 5
  }
];

const WEEKLY_ACHIEVEMENTS = [
  {
    id: 'weekly_consistency',
    title: 'Week Warrior',
    description: 'Logged meals every day this week',
    icon: Calendar,
    points: 50
  },
  {
    id: 'weekly_calorie_average',
    title: 'Weekly Balance',
    description: 'Maintained your weekly calorie average',
    icon: Target,
    points: 40
  },
  {
    id: 'weekly_perfect_week',
    title: 'Perfect Week',
    description: 'Met all daily goals for 7 consecutive days',
    icon: Star,
    points: 100
  }
];

export function useGoalAchievements() {
  const [achievements, setAchievements] = useState<GoalAchievement[]>([]);
  const [celebrationAchievement, setCelebrationAchievement] = useState<GoalAchievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check daily goal achievements
  const checkDailyGoals = useCallback((
    actualIntake: DailyGoals,
    targetGoals: DailyGoals
  ) => {
    const newAchievements: GoalAchievement[] = [];

    // Check calorie goal
    if (actualIntake.calories >= targetGoals.calories * 0.9 && 
        actualIntake.calories <= targetGoals.calories * 1.1) {
      const achievement = DAILY_ACHIEVEMENTS.find(a => a.id === 'daily_calories_met');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          new Date(a.earnedAt).toDateString() === new Date().toDateString())) {
        newAchievements.push({
          ...achievement,
          type: 'daily' as const,
          earnedAt: new Date()
        });
      }
    }

    // Check protein goal
    if (actualIntake.protein >= targetGoals.protein) {
      const achievement = DAILY_ACHIEVEMENTS.find(a => a.id === 'daily_protein_met');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          new Date(a.earnedAt).toDateString() === new Date().toDateString())) {
        newAchievements.push({
          ...achievement,
          type: 'daily' as const,
          earnedAt: new Date()
        });
      }
    }

    // Check all macros
    const caloriesInRange = actualIntake.calories >= targetGoals.calories * 0.9 && 
                           actualIntake.calories <= targetGoals.calories * 1.1;
    const proteinMet = actualIntake.protein >= targetGoals.protein;
    const carbsMet = actualIntake.carbs >= targetGoals.carbs * 0.9;
    const fatMet = actualIntake.fat >= targetGoals.fat * 0.9;

    if (caloriesInRange && proteinMet && carbsMet && fatMet) {
      const achievement = DAILY_ACHIEVEMENTS.find(a => a.id === 'daily_all_macros');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          new Date(a.earnedAt).toDateString() === new Date().toDateString())) {
        newAchievements.push({
          ...achievement,
          type: 'daily' as const,
          earnedAt: new Date()
        });
      }
    }

    // Check water goal
    if (actualIntake.water >= targetGoals.water) {
      const achievement = DAILY_ACHIEVEMENTS.find(a => a.id === 'daily_water_goal');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          new Date(a.earnedAt).toDateString() === new Date().toDateString())) {
        newAchievements.push({
          ...achievement,
          type: 'daily' as const,
          earnedAt: new Date()
        });
      }
    }

    // Add new achievements and show celebration
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setCelebrationAchievement(newAchievements[0]);
      setShowCelebration(true);
    }

    return newAchievements;
  }, [achievements]);

  // Check weekly goal achievements
  const checkWeeklyGoals = useCallback((
    weeklyStats: {
      daysLogged: number;
      averageCalories: number;
      perfectDays: number;
    },
    weeklyTargets: WeeklyGoals
  ) => {
    const newAchievements: GoalAchievement[] = [];

    // Check consistency
    if (weeklyStats.daysLogged >= weeklyTargets.consistentLogging) {
      const achievement = WEEKLY_ACHIEVEMENTS.find(a => a.id === 'weekly_consistency');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          isCurrentWeek(a.earnedAt))) {
        newAchievements.push({
          ...achievement,
          type: 'weekly' as const,
          earnedAt: new Date()
        });
      }
    }

    // Check weekly calorie average
    if (Math.abs(weeklyStats.averageCalories - weeklyTargets.calorieTarget) <= 100) {
      const achievement = WEEKLY_ACHIEVEMENTS.find(a => a.id === 'weekly_calorie_average');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          isCurrentWeek(a.earnedAt))) {
        newAchievements.push({
          ...achievement,
          type: 'weekly' as const,
          earnedAt: new Date()
        });
      }
    }

    // Check perfect week
    if (weeklyStats.perfectDays >= 7) {
      const achievement = WEEKLY_ACHIEVEMENTS.find(a => a.id === 'weekly_perfect_week');
      if (achievement && !achievements.find(a => a.id === achievement.id && 
          isCurrentWeek(a.earnedAt))) {
        newAchievements.push({
          ...achievement,
          type: 'weekly' as const,
          earnedAt: new Date()
        });
      }
    }

    // Add new achievements and show celebration
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setCelebrationAchievement(newAchievements[0]);
      setShowCelebration(true);
    }

    return newAchievements;
  }, [achievements]);

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
    setCelebrationAchievement(null);
  }, []);

  const getTotalPoints = useCallback(() => {
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  }, [achievements]);

  return {
    achievements,
    celebrationAchievement,
    showCelebration,
    checkDailyGoals,
    checkWeeklyGoals,
    closeCelebration,
    getTotalPoints
  };
}

// Helper function to check if date is in current week
function isCurrentWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  
  return date >= startOfWeek && date <= endOfWeek;
}