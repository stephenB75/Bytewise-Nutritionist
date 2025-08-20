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
  ChevronDown
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
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'daily', name: 'Daily', icon: Calendar },
    { id: 'weekly', name: 'Weekly', icon: Flame },
    { id: 'monthly', name: 'Monthly', icon: Star },
    { id: 'milestone', name: 'Milestones', icon: Target },
    { id: 'special', name: 'Special', icon: Gift }
  ];

  const difficultyColors = {
    bronze: 'bg-amber-600/20 border-amber-500/30 text-amber-700',
    silver: 'bg-gray-400/20 border-gray-400/30 text-gray-700',
    gold: 'bg-[#faed39]/20 border-[#faed39]/50 text-[#faed39]',
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
    queryKey: ['/api/user/progress'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/daily-stats');
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
    if (progressData || achievementsData) {
      const allAchievementsWithProgress = ALL_ACHIEVEMENTS.map(achievement => {
        const progressInfo = calculateProgress(achievement, progressData);
        return {
          ...achievement,
          progress: progressInfo.progress,
          completed: progressInfo.completed,
          completedDate: progressInfo.completedDate
        };
      });
      
      setAchievements(allAchievementsWithProgress);
    }
  }, [achievementsData, progressData]);

  // Update user stats when data changes
  useEffect(() => {
    if (statsData) {
      const completedCount = achievements.filter(a => a.completed).length;
      const totalPoints = achievements.filter(a => a.completed)
        .reduce((sum, a) => sum + a.points, 0);
      
      setUserStats({
        totalPoints: totalPoints || statsData.totalPoints || 0,
        achievementsCompleted: completedCount || statsData.achievementsUnlocked || 0,
        currentStreak: statsData.currentStreak || 0,
        longestStreak: statsData.longestStreak || 0,
        level: Math.floor(totalPoints / 100) + 1 || 1,
        nextLevelPoints: ((Math.floor(totalPoints / 100) + 1) * 100) || 100
      });
    }
  }, [statsData, achievements]);

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
            <div className="text-2xl font-bold text-[#faed39]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{userStats.totalPoints || 0}</div>
            <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Total Points</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#45c73e]/10 to-[#45c73e]/5 rounded-lg border border-[#45c73e]/20">
            <div className="text-2xl font-bold text-[#45c73e]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{completedAchievements.length || 0}</div>
            <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Completed</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#1f4aa6]/10 to-[#1f4aa6]/5 rounded-lg border border-[#1f4aa6]/20">
            <div className="text-2xl font-bold text-[#1f4aa6]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{userStats.currentStreak || 0}</div>
            <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#faed39]/10 to-[#1f4aa6]/10 rounded-lg border border-[#faed39]/20">
            <div className="text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>Level {userStats.level}</div>
            <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Current Level</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Overall Progress</span>
            <span className="text-white font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                variant="outline"
                size="lg"
                onClick={() => setSelectedCategory(category.id)}
                className={`h-24 w-full min-w-[140px] max-w-[140px] p-4 flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] text-white shadow-2xl border-2 border-transparent transform scale-105' 
                    : 'bg-white/95 hover:bg-white text-gray-700 border-2 border-white/30 hover:border-[#1f4aa6] hover:shadow-xl hover:scale-102'
                } rounded-2xl backdrop-blur-sm relative`}
              >
                <div className={`w-12 h-12 p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-[#1f4aa6]/10'}`}>
                  <IconComponent 
                    className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#1f4aa6]'}`}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {category.name}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsLoading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Loading achievements...</div>
                  </div>
                ) : !user ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Sign in to track your achievements</div>
                  </div>
                ) : filteredAchievements.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>No achievements in this category yet. Keep tracking to unlock!</div>
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
              className={`bg-white/10 backdrop-blur-md border-white/20 p-6 transition-all duration-200 hover:bg-white/15 ${
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
                    <h4 className="font-semibold text-white truncate" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                      {achievement.title}
                    </h4>
                    <Badge className={`${difficultyColors[achievement.difficulty]} capitalize text-xs`}>
                      {achievement.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {achievement.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        Progress: {achievement.progress}/{achievement.target}
                      </span>
                      <span className="text-[#faed39] font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        {achievement.points} pts
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={achievement.completed ? 100 : Math.min(100, (achievement.progress / achievement.target) * 100)} 
                        className={`h-3 ${achievement.completed ? 'bg-[#45c73e]/20' : 'bg-gray-700'}`}
                      />
                      {achievement.completed && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#45c73e] to-[#3ab82e] rounded-full h-3" />
                      )}
                    </div>
                  </div>
                  
                  {achievement.completed && achievement.completedDate && (
                    <div className="mt-3 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#45c73e]" />
                      <span className="text-xs text-[#45c73e]" style={{ fontFamily: "'Work Sans', sans-serif" }}>
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