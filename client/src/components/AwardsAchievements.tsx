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

  // Fetch user statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/user/statistics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/statistics');
      const data = await response.json();
      return data;
    },
    enabled: !!user,
  });

  // Update local state when data changes
  useEffect(() => {
    if (achievementsData?.achievements) {
      const userAchievements = achievementsData.achievements.map((achievement: any) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon || getAchievementIcon(achievement.id),
        category: getCategoryFromAchievement(achievement),
        difficulty: getDifficultyFromPoints(achievement.points),
        progress: achievement.progress || 0,
        target: achievement.target || 1,
        completed: achievement.unlocked || false,
        completedDate: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
        points: achievement.points || 10,
        reward: achievement.reward
      }));
      setAchievements(userAchievements);
    }
  }, [achievementsData]);

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
          filteredAchievements.map((achievement) => (
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
                    
                    <Progress 
                      value={(achievement.progress / achievement.target) * 100} 
                      className="h-2"
                    />
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