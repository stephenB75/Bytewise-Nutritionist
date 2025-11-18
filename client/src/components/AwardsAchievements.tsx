/**
 * Awards and Achievements Component
 * Comprehensive achievement system with trophies and progress tracking - ByteWise Brand Styling
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Calendar, 
  Activity, 
  Award, 
  Zap, 
  Heart, 
  TrendingUp,
  CheckCircle,
  Lock,
  Gift,
  X,
  ChevronDown,
  Grid,
  Sun,
  CalendarCheck,
  Flag,
  Crown
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number;
  target: number;
  completed: boolean;
  completedDate?: Date;
  points: number;
  reward?: string;
}

// Comprehensive list of all possible achievements
const ALL_ACHIEVEMENTS: Omit<Achievement, 'progress' | 'completed' | 'completedDate'>[] = [
  // Daily Achievements
  {
    id: 'first_meal_logged',
    title: 'First Meal',
    description: 'Log your first meal to start your nutrition journey',
    icon: '🥗',
    category: 'daily',
    difficulty: 'bronze',
    target: 1,
    points: 10
  },
  {
    id: 'calorie_goal_met',
    title: 'Calorie Champion',
    description: 'Hit your daily calorie target within 10%',
    icon: '🎯',
    category: 'daily',
    difficulty: 'bronze',
    target: 1,
    points: 15
  },
  {
    id: 'protein_goal_met',
    title: 'Protein Power',
    description: 'Reach your daily protein target',
    icon: '💪',
    category: 'daily',
    difficulty: 'bronze',
    target: 1,
    points: 10
  },
  {
    id: 'water_goal_met',
    title: 'Hydration Hero',
    description: 'Complete your daily water intake goal',
    icon: '💧',
    category: 'daily',
    difficulty: 'bronze',
    target: 1,
    points: 10
  },
  {
    id: 'three_meals_day',
    title: 'Three Meals Champion',
    description: 'Log breakfast, lunch, and dinner in one day',
    icon: '🍽️',
    category: 'daily',
    difficulty: 'silver',
    target: 3,
    points: 20
  },

  // Weekly Achievements  
  {
    id: 'three_day_streak',
    title: '3 Day Streak',
    description: 'Track nutrition for 3 consecutive days',
    icon: '🔥',
    category: 'weekly',
    difficulty: 'silver',
    target: 3,
    points: 25
  },
  {
    id: 'weekly_consistency',
    title: 'Week Warrior',
    description: 'Log meals for 7 consecutive days',
    icon: '👑',
    category: 'weekly',
    difficulty: 'gold',
    target: 7,
    points: 50
  },
  {
    id: 'weekly_calorie_average',
    title: 'Weekly Balance',
    description: 'Maintain your weekly calorie average',
    icon: '⚖️',
    category: 'weekly',
    difficulty: 'silver',
    target: 7,
    points: 35
  },

  // Monthly Achievements
  {
    id: 'monthly_consistency',
    title: 'Month Master',
    description: 'Log meals for 20 days in a month',
    icon: '🏆',
    category: 'monthly',
    difficulty: 'gold',
    target: 20,
    points: 100
  },
  {
    id: 'monthly_calorie_goals',
    title: 'Monthly Goal Crusher',
    description: 'Hit calorie goals for 15 days in a month',
    icon: '🎯',
    category: 'monthly',
    difficulty: 'gold',
    target: 15,
    points: 75
  },

  // Milestone Achievements
  {
    id: 'hundred_meals',
    title: 'Meal Century',
    description: 'Log 100 total meals',
    icon: '💯',
    category: 'milestone',
    difficulty: 'platinum',
    target: 100,
    points: 150
  },
  {
    id: 'thousand_calories_tracked',
    title: 'Calorie Counter',
    description: 'Track 50,000 total calories',
    icon: '📊',
    category: 'milestone',
    difficulty: 'gold',
    target: 50000,
    points: 100
  },
  {
    id: 'nutrition_master',
    title: 'Nutrition Master',
    description: 'Achieve 30 daily goals',
    icon: '🧠',
    category: 'milestone',
    difficulty: 'platinum',
    target: 30,
    points: 200
  },

  // Special Achievements
  {
    id: 'fasting_beginner',
    title: 'Fasting Beginner',
    description: 'Complete your first intermittent fast',
    icon: '⏰',
    category: 'special',
    difficulty: 'bronze',
    target: 1,
    points: 25
  },
  {
    id: 'fasting_warrior',
    title: 'Fasting Warrior',
    description: 'Complete 10 fasting sessions',
    icon: '⚔️',
    category: 'special',
    difficulty: 'gold',
    target: 10,
    points: 75
  },
  {
    id: 'ai_food_analyzer',
    title: 'AI Explorer',
    description: 'Use AI Food Analyzer 5 times',
    icon: '🤖',
    category: 'special',
    difficulty: 'silver',
    target: 5,
    points: 30
  }
];

interface AwardsAchievementsProps {
  onClose?: () => void;
}

export function AwardsAchievements({ onClose }: AwardsAchievementsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);


  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    achievementsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    nextLevelPoints: 100
  });

  const categories = [
    { id: 'all', name: 'All', icon: Grid },
    { id: 'daily', name: 'Daily', icon: Sun },
    { id: 'weekly', name: 'Weekly', icon: Calendar },
    { id: 'monthly', name: 'Monthly', icon: CalendarCheck },
    { id: 'milestone', name: 'Milestones', icon: Flag },
    { id: 'special', name: 'Special', icon: Crown }
  ];

  const difficultyColors = {
    bronze: 'bg-amber-600/20 border-amber-500/30 text-amber-700',
    silver: 'bg-gray-400/20 border-gray-400/30 text-gray-700',
    gold: 'bg-orange-100/80 border-orange-400/50 text-orange-700',
    platinum: 'bg-[#1f4aa6]/20 border-[#1f4aa6]/30 text-[#1f4aa6]'
  };

    // Fetch user achievements from backend
  const { data: achievementsData, isLoading: achievementsLoading, refetch } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/achievements');
      const data = await response.json();
      return data;
    },
    enabled: !!user,
  });

  // Fetch user progress data for calculating achievement progress
  const { data: progressData } = useQuery({
    queryKey: ['/api/user/progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const response = await apiRequest('GET', `/api/users/${user.id}/daily-stats`);
        const dailyStats = await response.json();
        
        // Get additional data from localStorage for offline tracking
        const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        const fastingHistory = JSON.parse(localStorage.getItem('fastingHistory') || '[]');
        const aiAnalyzerUsage = JSON.parse(localStorage.getItem('aiAnalyzerUsage') || '[]');
        
        return {
          dailyStats,
          weeklyMeals,
          fastingHistory,
          aiAnalyzerUsage
        };
      } catch (error) {
        console.error('Error fetching daily stats:', error);
        return {
          dailyStats: { totalCalories: 0, totalProtein: 0, waterGlasses: 0 },
          weeklyMeals: JSON.parse(localStorage.getItem('weeklyMeals') || '[]'),
          fastingHistory: JSON.parse(localStorage.getItem('fastingHistory') || '[]'),
          aiAnalyzerUsage: JSON.parse(localStorage.getItem('aiAnalyzerUsage') || '[]')
        };
      }
    },
    enabled: !!user,
  });

  // Fetch user statistics - combined with progress data
  const { data: statsData } = useQuery({
    queryKey: ['/api/user/statistics'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/user/statistics');
        const data = await response.json();
        return data;
      } catch (error) {
        // Return default stats if API fails
        return {
          totalPoints: 0,
          achievementsUnlocked: 0,
          currentStreak: 0,
          longestStreak: 0
        };
      }
    },
    enabled: !!user,
  });

  // Calculate user progress for all achievements
  const calculateProgress = (achievement: typeof ALL_ACHIEVEMENTS[0], progressData: any): { progress: number; completed: boolean; completedDate?: Date } => {
    if (!progressData) return { progress: 0, completed: false };
    
    const { dailyStats, weeklyMeals = [], fastingHistory = [], aiAnalyzerUsage = [] } = progressData;
    
    // Check if achievement is already completed
    const completedAchievement = achievementsData?.achievements?.find((a: any) => a.achievementType === achievement.id);
    if (completedAchievement) {
      return { 
        progress: achievement.target, 
        completed: true, 
        completedDate: new Date(completedAchievement.earnedAt) 
      };
    }

    switch (achievement.id) {
      case 'first_meal_logged':
        return { progress: weeklyMeals.length > 0 ? 1 : 0, completed: weeklyMeals.length > 0 };
        
      case 'calorie_goal_met':
        const calorieGoalMet = dailyStats?.totalCalories >= 1800 && dailyStats?.totalCalories <= 2200;
        return { progress: calorieGoalMet ? 1 : 0, completed: calorieGoalMet };
        
      case 'protein_goal_met':
        const proteinGoalMet = dailyStats?.totalProtein >= 120;
        return { progress: proteinGoalMet ? 1 : 0, completed: proteinGoalMet };
        
      case 'water_goal_met':
        const waterGoalMet = dailyStats?.waterGlasses >= 8;
        return { progress: waterGoalMet ? 1 : 0, completed: waterGoalMet };
        
      case 'three_meals_day':
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = weeklyMeals.filter((meal: any) => {
          const mealDate = meal.date?.includes('T') ? meal.date.split('T')[0] : meal.date;
          return mealDate === today;
        });
        return { progress: Math.min(todayMeals.length, 3), completed: todayMeals.length >= 3 };
        
      case 'three_day_streak':
      case 'weekly_consistency':
        // Calculate consecutive days with meals logged
        const uniqueDatesArray = weeklyMeals.map((meal: any) => {
          const mealDate = meal.date?.includes('T') ? meal.date.split('T')[0] : meal.date;
          return mealDate;
        });
        const uniqueDates = Array.from(new Set(uniqueDatesArray)).sort();
        
        if (achievement.id === 'three_day_streak') {
          let currentStreak = 0;
          let maxStreak = 0;
          const today_date = new Date().toISOString().split('T')[0];
          
          for (let i = uniqueDates.length - 1; i >= 0; i--) {
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - (uniqueDates.length - 1 - i));
            const expectedDateStr = expectedDate.toISOString().split('T')[0];
            
            if (uniqueDates[i] === expectedDateStr || (i === uniqueDates.length - 1 && uniqueDates[i] === today_date)) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
            } else {
              currentStreak = 0;
            }
          }
          
          return { progress: Math.min(maxStreak, 3), completed: maxStreak >= 3 };
        } else {
          return { progress: Math.min(uniqueDates.length, 7), completed: uniqueDates.length >= 7 };
        }
        
      case 'fasting_beginner':
        const completedFasts = fastingHistory.filter((f: any) => f.status === 'completed').length;
        return { progress: Math.min(completedFasts, 1), completed: completedFasts >= 1 };
        
      case 'fasting_warrior':
        const totalCompletedFasts = fastingHistory.filter((f: any) => f.status === 'completed').length;
        return { progress: Math.min(totalCompletedFasts, 10), completed: totalCompletedFasts >= 10 };
        
      case 'ai_food_analyzer':
        return { progress: Math.min(aiAnalyzerUsage.length, 5), completed: aiAnalyzerUsage.length >= 5 };
        
      case 'hundred_meals':
        return { progress: Math.min(weeklyMeals.length, 100), completed: weeklyMeals.length >= 100 };
        
      case 'thousand_calories_tracked':
        const totalCalories = weeklyMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        return { progress: Math.min(totalCalories, 50000), completed: totalCalories >= 50000 };
        
      case 'calorie_counter':
        const totalTrackedCalories = weeklyMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        return { progress: Math.min(totalTrackedCalories, 50000), completed: totalTrackedCalories >= 50000 };
        
      default:
        return { progress: 0, completed: false };
    }
  };

  // Update local state when data changes  
  useEffect(() => {
    if (achievementsData?.achievements) {
      // Map backend achievements to frontend format
      const backendAchievements = achievementsData.achievements.map((dbAchievement: any) => {
        // Find the matching static achievement definition
        const staticAchievement = ALL_ACHIEVEMENTS.find(a => a.id === dbAchievement.achievementType);
        
        return {
          id: dbAchievement.achievementType,
          title: dbAchievement.title,
          description: dbAchievement.description,
          icon: staticAchievement?.icon || '🏅',
          category: staticAchievement?.category || 'daily',
          difficulty: staticAchievement?.difficulty || 'bronze',
          progress: staticAchievement?.target || 1,
          target: staticAchievement?.target || 1,
          completed: true,
          completedDate: new Date(dbAchievement.earnedAt),
          points: staticAchievement?.points || 10
        };
      });

      // Add incomplete achievements (show progress for achievable ones)
      const completedTypes = new Set(backendAchievements.map((a: any) => a.id));
      const incompleteAchievements = ALL_ACHIEVEMENTS
        .filter(a => !completedTypes.has(a.id))
        .map(achievement => ({
          ...achievement,
          progress: 0,
          completed: false
        }));

      setAchievements([...backendAchievements, ...incompleteAchievements]);
    } else {
      // Show all achievements as incomplete if no backend data
      setAchievements(ALL_ACHIEVEMENTS.map(a => ({ ...a, progress: 0, completed: false })));
    }
  }, [achievementsData]);

  // Update user stats when data changes
  useEffect(() => {
    if (statsData) {
      setUserStats({
        totalPoints: statsData.totalPoints || 0,
        achievementsCompleted: statsData.achievementsUnlocked || 0,
        currentStreak: statsData.currentStreak || 0,
        longestStreak: statsData.longestStreak || 0,
        level: Math.floor((statsData.totalPoints || 0) / 100) + 1,
        nextLevelPoints: ((Math.floor((statsData.totalPoints || 0) / 100) + 1) * 100)
      });
    }
  }, [statsData]);

  // Helper functions
  const getAchievementIcon = (id: string | undefined): string => {
    const iconMap: { [key: string]: string } = {
      'first-meal': '🥗',
      'first-food': '🍎',
      'first-recipe': '👨‍🍳',
      'daily-tracker': '📅',
      'calorie-goal': '🎯',
      'protein-power': '💪',
      'balanced-nutrition': '⚖️',
      'hydration-hero': '💧',
      'streak-master': '🔥',
      'nutrition-master': '🏆',
      'recipe-creator': '📝',
      'meal-planner': '📋',
      'health-champion': '❤️',
      'fitness-enthusiast': '🏃',
      'mindful-eater': '🧘'
    };
    return (id && iconMap[id]) || '🏅';
  };

  const getCategoryFromAchievement = (achievement: any): Achievement['category'] => {
    const id = achievement.id || '';
    if (typeof id === 'string') {
      if (id.includes('streak') || id.includes('weekly')) return 'weekly';
      if (id.includes('month')) return 'monthly';
      if (id.includes('milestone') || achievement.target >= 30) return 'milestone';
      if (id.includes('special')) return 'special';
    }
    return 'daily';
  };

  const getDifficultyFromPoints = (points: number): Achievement['difficulty'] => {
    if (points >= 100) return 'platinum';
    if (points >= 50) return 'gold';
    if (points >= 25) return 'silver';
    return 'bronze';
  };

  // Check for new achievements periodically
  useEffect(() => {
    if (!user) return;
    
    const checkAchievements = async () => {
      try {
        await apiRequest('POST', '/api/achievements/check');
        refetch(); // Refresh achievements list
      } catch (error) {
        // Silent fail - achievements will be checked on next action
      }
    };

    // Check immediately when component mounts
    checkAchievements();

    // Check every 30 seconds for updates
    const interval = setInterval(checkAchievements, 30000);
    
    return () => clearInterval(interval);
  }, [user, refetch]);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const completedAchievements = achievements.filter(a => a.completed);
  const progressPercentage = achievements.length > 0 ? (completedAchievements.length / achievements.length) * 100 : 0;

  return (
    <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-[#faed39]/10 to-[#faed39]/5 rounded-lg border border-[#faed39]/20">
            <div className="text-2xl font-bold text-orange-600" style={{ fontFamily: "'League Spartan', sans-serif" }}>{userStats.totalPoints || 0}</div>
            <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Total Points</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#45c73e]/10 to-[#45c73e]/5 rounded-lg border border-[#45c73e]/20">
            <div className="text-2xl font-bold text-[#45c73e]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{completedAchievements.length || 0}</div>
            <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Completed</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#1f4aa6]/10 to-[#1f4aa6]/5 rounded-lg border border-[#1f4aa6]/20">
            <div className="text-2xl font-bold text-[#1f4aa6]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{userStats.currentStreak || 0}</div>
            <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#faed39]/10 to-[#1f4aa6]/10 rounded-lg border border-[#faed39]/20">
            <div className="text-2xl font-bold text-gray-950" style={{ fontFamily: "'League Spartan', sans-serif" }}>Level {userStats.level}</div>
            <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Current Level</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Overall Progress</span>
            <span className="text-gray-950 font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="relative w-full bg-blue-100 rounded-full h-3" style={{ backgroundColor: '#dbeafe' }}>
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 my-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = selectedCategory === category.id;
            
            // Define colors for each category
            const categoryColors = {
              all: { bg: 'from-purple-200 to-pink-200', icon: 'text-purple-700', active: 'from-purple-300 to-pink-300' },
              daily: { bg: 'from-orange-200 to-yellow-200', icon: 'text-orange-700', active: 'from-orange-300 to-yellow-300' },
              weekly: { bg: 'from-blue-200 to-cyan-200', icon: 'text-blue-700', active: 'from-blue-300 to-cyan-300' },
              monthly: { bg: 'from-green-200 to-emerald-200', icon: 'text-green-700', active: 'from-green-300 to-emerald-300' },
              milestone: { bg: 'from-red-200 to-rose-200', icon: 'text-red-700', active: 'from-red-300 to-rose-300' },
              special: { bg: 'from-amber-200 to-orange-200', icon: 'text-amber-700', active: 'from-amber-300 to-orange-300' }
            };
            
            const colors = categoryColors[category.id as keyof typeof categoryColors];
            
            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="cursor-pointer transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-2"
              >
                <div className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                  isActive 
                    ? `bg-gradient-to-br ${colors.active} shadow-xl transform scale-110`
                    : `bg-gradient-to-br ${colors.bg} hover:shadow-xl hover:scale-105`
                }`}>
                  <IconComponent 
                    className={`w-8 h-8 transition-all duration-300 ${colors.icon}`}
                    strokeWidth={2.5}
                    fill="currentColor"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}
                  />
                </div>
                <span className={`text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-gray-900 font-bold' 
                    : 'text-gray-700'
                }`}>
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsLoading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Loading achievements...</div>
                  </div>
                ) : !user ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Sign in to track your achievements</div>
                  </div>
                ) : filteredAchievements.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>No achievements in this category yet. Keep tracking to unlock!</div>
                  </div>
                ) : (
          filteredAchievements.sort((a, b) => {
            // Sort completed achievements last, then by category, then by points
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            if (a.category !== b.category) {
              const categoryOrder = ['daily', 'weekly', 'monthly', 'milestone', 'special'];
              return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
            }
            return b.points - a.points;
          }).map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40 p-6 transition-all duration-200 hover:from-amber-100 hover:to-amber-200 ${
                achievement.completed ? 'ring-2 ring-[#45c73e]/30' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl text-2xl ${
                  achievement.completed 
                    ? 'bg-gradient-to-br from-[#45c73e] to-[#3ab82e]' 
                    : 'bg-gray-100'
                }`}>
                  {achievement.completed ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span>{achievement.icon}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-950 truncate" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                      {achievement.title}
                    </h4>
                    <Badge className={`${difficultyColors[achievement.difficulty]} capitalize text-xs`}>
                      {achievement.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-3" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {achievement.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        Progress: {achievement.progress}/{achievement.target}
                      </span>
                      <span className="text-blue-600 font-bold" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        {achievement.points} pts
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className={`relative w-full rounded-full h-3 ${achievement.completed ? 'bg-green-100' : 'bg-blue-100'}`}
                           style={{ backgroundColor: achievement.completed ? '#dcfce7' : '#dbeafe' }}>
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            achievement.completed 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${achievement.completed ? 100 : Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {achievement.completed && achievement.completedDate && (
                    <div className="mt-3 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        Completed {achievement.completedDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}