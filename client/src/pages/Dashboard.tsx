import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, TrendingUp, Target, Droplets, Clock } from 'lucide-react';
import { formatCalories, calculatePercentage, formatDate } from '@/lib/utils';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function Dashboard({ onNavigate, showToast, notifications, setNotifications }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch user's daily nutrition data
  const { data: todayStats, isLoading } = useQuery({
    queryKey: ['/api/meals/today'],
    retry: false,
  });

  // Fetch user profile with goals
  const { data: userProfile } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Mock data for demonstration (will be replaced with real API data)
  const mockStats = {
    calories: { consumed: 1420, goal: userProfile?.dailyCalorieGoal || 2000 },
    protein: { consumed: 85, goal: userProfile?.dailyProteinGoal || 150 },
    carbs: { consumed: 180, goal: userProfile?.dailyCarbGoal || 200 },
    fat: { consumed: 65, goal: userProfile?.dailyFatGoal || 70 },
    water: { consumed: 6, goal: userProfile?.dailyWaterGoal || 8 }
  };

  const stats = todayStats || mockStats;

  // Quick actions
  const quickActions = [
    {
      title: 'Log Breakfast',
      icon: '🌅',
      action: () => {
        onNavigate('meals');
        showToast('Opening Meal Logger for breakfast');
      }
    },
    {
      title: 'Add Recipe',
      icon: '👨‍🍳',
      action: () => {
        onNavigate('recipe-builder');
        showToast('Opening Recipe Builder');
      }
    },
    {
      title: 'Log Water',
      icon: '💧',
      action: () => {
        showToast('Added 1 glass of water!');
        // TODO: Implement water logging API call
      }
    },
    {
      title: 'View Calendar',
      icon: '📅',
      action: () => {
        onNavigate('calendar');
        showToast('Opening nutrition calendar');
      }
    }
  ];

  // Calculate daily progress
  const calorieProgress = calculatePercentage(stats.calories.consumed, stats.calories.goal);
  const proteinProgress = calculatePercentage(stats.protein.consumed, stats.protein.goal);
  const carbProgress = calculatePercentage(stats.carbs.consumed, stats.carbs.goal);
  const fatProgress = calculatePercentage(stats.fat.consumed, stats.fat.goal);
  const waterProgress = calculatePercentage(stats.water.consumed, stats.water.goal);

  // Overall progress calculation
  const overallProgress = (calorieProgress + proteinProgress + carbProgress + fatProgress) / 4;

  useEffect(() => {
    // Welcome message for first-time users
    if (!notifications.includes('welcome') && userProfile) {
      setNotifications([...notifications, 'welcome']);
      showToast(`Welcome back, ${userProfile.firstName || 'there'}! Ready to track your nutrition?`);
    }
  }, [userProfile, notifications, setNotifications, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold brand-text-primary">Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('calendar')}
            className="touch-target"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(currentDate)}
          </Button>
        </div>
        <p className="text-muted-foreground">Track your daily nutrition progress</p>
      </div>

      {/* Daily Progress Overview */}
      <Card className="mb-6 brand-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Today's Progress</span>
            <Badge variant="outline" className="ml-auto">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calories */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Calories</span>
                <span className="text-muted-foreground">
                  {formatCalories(stats.calories.consumed)} / {formatCalories(stats.calories.goal)}
                </span>
              </div>
              <Progress value={calorieProgress} className="h-2" />
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-chart-2 font-medium">Protein</span>
                  <span>{stats.protein.consumed}g</span>
                </div>
                <Progress value={proteinProgress} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-chart-3 font-medium">Carbs</span>
                  <span>{stats.carbs.consumed}g</span>
                </div>
                <Progress value={carbProgress} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-chart-1 font-medium">Fat</span>
                  <span>{stats.fat.consumed}g</span>
                </div>
                <Progress value={fatProgress} className="h-1.5" />
              </div>
            </div>

            {/* Water */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium flex items-center">
                  <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                  Water
                </span>
                <span className="text-muted-foreground">
                  {stats.water.consumed} / {stats.water.goal} glasses
                </span>
              </div>
              <Progress value={waterProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-1 touch-target btn-animate"
                onClick={action.action}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-xs font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">🥗</span>
              <div className="flex-1">
                <p className="font-medium text-sm">Greek Salad added</p>
                <p className="text-xs text-muted-foreground">Lunch • 2 hours ago</p>
              </div>
              <Badge variant="outline" className="text-xs">320 cal</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">💧</span>
              <div className="flex-1">
                <p className="font-medium text-sm">2 glasses of water</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
              <Badge variant="outline" className="text-xs">16 oz</Badge>
            </div>

            <Button
              variant="ghost"
              className="w-full text-primary"
              onClick={() => onNavigate('calendar')}
            >
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}