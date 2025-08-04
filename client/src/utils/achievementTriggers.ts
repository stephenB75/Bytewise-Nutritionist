/**
 * Achievement Trigger Utilities
 * 
 * Restricts achievement notifications to only daily and weekly nutrition goals
 * Prevents achievement spam from settings and utility actions
 */

export type AchievementTriggerType = 'daily_goal' | 'weekly_goal' | 'milestone' | 'streak';

export interface AchievementData {
  title: string;
  description: string;
  icon: any;
  type: AchievementTriggerType;
  value?: number;
  target?: number;
}

// Only trigger achievements for these specific cases
const ALLOWED_ACHIEVEMENT_TRIGGERS = [
  'daily_goal',
  'weekly_goal'
];

export function shouldTriggerAchievement(type: AchievementTriggerType): boolean {
  return ALLOWED_ACHIEVEMENT_TRIGGERS.includes(type);
}

export function triggerAchievement(achievement: AchievementData): void {
  if (!shouldTriggerAchievement(achievement.type)) {
    return;
  }

  const event = new CustomEvent('show-achievement', {
    detail: achievement
  });
  window.dispatchEvent(event);
}

// Daily goal achievement triggers
export function checkDailyGoalAchievement(calories: number, goal: number): void {
  if (calories >= goal) {
    triggerAchievement({
      title: 'Daily Goal Reached!',
      description: `Congratulations! You met your daily calorie goal of ${goal} calories.`,
      icon: 'Target',
      type: 'daily_goal',
      value: calories,
      target: goal
    });
  }
}

// Weekly goal achievement triggers
export function checkWeeklyGoalAchievement(totalCalories: number, weeklyGoal: number): void {
  if (totalCalories >= weeklyGoal) {
    triggerAchievement({
      title: 'Weekly Goal Achieved!',
      description: `Amazing! You've reached your weekly nutrition goal of ${weeklyGoal} calories.`,
      icon: 'Trophy',
      type: 'weekly_goal',
      value: totalCalories,
      target: weeklyGoal
    });
  }
}

// Streak achievements (considered weekly goals)
export function checkStreakAchievement(streakDays: number): void {
  const milestones = [7, 14, 21, 30, 60, 90];
  
  if (milestones.includes(streakDays)) {
    triggerAchievement({
      title: `${streakDays}-Day Streak!`,
      description: `Incredible consistency! You've logged meals for ${streakDays} days in a row.`,
      icon: 'Flame',
      type: 'weekly_goal', // Treated as weekly goal type
      value: streakDays
    });
  }
}