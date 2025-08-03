/**
 * Awards and Achievements Component
 * Comprehensive achievement system with trophies and progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
  Gift
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
    bronze: 'bg-amber-600/20 border-amber-500/30 text-amber-400',
    silver: 'bg-gray-400/20 border-gray-300/30 text-gray-300',
    gold: 'bg-[#faed39]/20 border-[#faed39]/30 text-[#faed39]',
    platinum: 'bg-purple-500/20 border-purple-400/30 text-purple-400'
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed);

  // TODO: Connect to real data source for achievement tracking
  useEffect(() => {
    // Load user achievements and stats from database
    const loadAchievements = async () => {
      try {
        // Future: Fetch from API/database
        // const response = await fetch('/api/achievements');
        // const data = await response.json();
        // setAchievements(data.achievements);
        // setUserStats(data.userStats);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };

    loadAchievements();
  }, []);

  const renderAchievementCard = (achievement: Achievement) => (
    <Card 
      key={achievement.id}
      className={`${difficultyColors[achievement.difficulty]} backdrop-blur-md p-4 relative overflow-hidden ${
        achievement.completed ? 'opacity-100' : 'opacity-80'
      }`}
    >
      {achievement.completed && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-white">{achievement.title}</h3>
            {!achievement.completed && achievement.progress === 0 && (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <p className="text-sm text-gray-300 mb-3">{achievement.description}</p>
          
          {!achievement.completed && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.target}</span>
              </div>
              <Progress 
                value={(achievement.progress / achievement.target) * 100} 
                className="h-2"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {achievement.points} pts
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {achievement.difficulty}
              </Badge>
            </div>
            {achievement.completed && achievement.completedDate && (
              <span className="text-xs text-gray-400">
                {achievement.completedDate.toLocaleDateString()}
              </span>
            )}
          </div>
          
          {achievement.reward && (
            <div className="mt-2">
              <Badge className="text-xs bg-purple-500/20 text-purple-300">
                Reward: {achievement.reward}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'League Spartan', sans-serif" }}>Awards & Achievements</h2>
            <p className="text-gray-600">Track your progress and unlock rewards</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-blue-100 border-blue-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{userStats.totalPoints}</div>
            <div className="text-sm text-blue-600">Total Points</div>
          </Card>
          <Card className="bg-green-100 border-green-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{userStats.achievementsCompleted}</div>
            <div className="text-sm text-green-600">Completed</div>
          </Card>
          <Card className="bg-orange-500/20 backdrop-blur-md border-orange-500/30 p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{userStats.currentStreak}</div>
            <div className="text-sm text-gray-300">Current Streak</div>
          </Card>
          <Card className="bg-purple-500/20 backdrop-blur-md border-purple-500/30 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">Level {userStats.level}</div>
            <div className="text-sm text-gray-300">{userStats.nextLevelPoints} to next</div>
          </Card>
        </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`flex items-center space-x-2 whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Progress Overview */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Achievement Progress
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-2">Completed ({completedAchievements.length})</h4>
            <div className="space-y-2">
              {completedAchievements.slice(0, 3).map(achievement => (
                <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-green-500/10 rounded-lg">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{achievement.title}</p>
                    <p className="text-gray-400 text-xs">{achievement.points} points earned</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-white mb-2">In Progress ({inProgressAchievements.length})</h4>
            <div className="space-y-2">
              {inProgressAchievements.slice(0, 3).map(achievement => (
                <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-[#faed39]/10 rounded-lg">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{achievement.title}</p>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-1 flex-1"
                      />
                      <span className="text-xs text-gray-400">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAchievements.map(renderAchievementCard)}
      </div>

      {/* Achievement Celebration */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-500/30 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-purple-400" />
          Upcoming Rewards
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="text-white font-medium">Daily Streak</h4>
            <p className="text-sm text-gray-400">3 more days for bonus points</p>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="text-white font-medium">Level Up</h4>
            <p className="text-sm text-gray-400">300 points to level 6</p>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="text-white font-medium">Special Badge</h4>
            <p className="text-sm text-gray-400">Complete 5 more achievements</p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}