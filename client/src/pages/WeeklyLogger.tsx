/**
 * Weekly Logger - Advanced nutrition tracking with enhanced visual design
 * Mobile-first responsive design with improved user experience
 * Features meal timeline, progress visualization, and smart insights
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroSection } from '@/components/HeroSection';
import { 
  Calendar,
  Plus,
  Clock,
  Target,
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Utensils,
  Activity,
  Zap,
  Award,
  Eye,
  BarChart3,
  PieChart,
  Coffee,
  Moon,
  Sun,
  Sunrise
} from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isYesterday } from 'date-fns';
import { useCalorieTracking } from '@/hooks/useCalorieTracking';

interface WeeklyLoggerProps {
  onNavigate: (page: string) => void;
}

interface LoggedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export default function WeeklyLogger({ onNavigate }: WeeklyLoggerProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const queryClient = useQueryClient();
  const { getTodaysCalories, getDailyStats, calculatedCalories } = useCalorieTracking();

  // Constants for calculations
  const dailyCalorieGoal = 2000;
  const calculatedCaloriesTotal = getTodaysCalories();
  const calculatedItemsCount = calculatedCalories.length;

  // Navigation functions
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  // Listen for calculator events to refresh data
  useEffect(() => {
    const handleRefreshData = () => {
      console.log('🔄 Refreshing weekly logger data...');
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
      queryClient.refetchQueries({ queryKey: ['/api/meals/logged'] });
    };

    const handleCaloriesLogged = (event: CustomEvent) => {
      console.log('📥 WeeklyLogger received calories:', event.detail);
      // Immediate refresh for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
      queryClient.refetchQueries({ queryKey: ['/api/meals/logged'] });
      
      // Also refresh after a short delay to ensure API has processed
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
        queryClient.refetchQueries({ queryKey: ['/api/meals/logged'] });
      }, 1000);
    };

    // Listen for app focus events to refresh data
    const handleWindowFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
    };

    window.addEventListener('refresh-weekly-data', handleRefreshData);
    window.addEventListener('calories-logged', handleCaloriesLogged as EventListener);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('refresh-weekly-data', handleRefreshData);
      window.removeEventListener('calories-logged', handleCaloriesLogged as EventListener);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [queryClient]);

  // Get week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch logged meals for the week  
  const { data: loggedMeals = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/meals/logged', format(weekStart, 'yyyy-MM-dd')],
    staleTime: 1000 * 30, // 30 seconds for more frequent updates
    refetchInterval: 1000 * 60, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });

  // Force refresh when meals are logged
  useEffect(() => {
    const handleMealLogged = () => {
      console.log('🔄 Forcing meal data refresh...');
      refetch();
    };

    window.addEventListener('meal-logged-success', handleMealLogged);
    
    return () => {
      window.removeEventListener('meal-logged-success', handleMealLogged);
    };
  }, [refetch]);

  // Calculate daily totals
  const getDayTotals = (date: Date) => {
    const dayMeals = (loggedMeals as LoggedMeal[]).filter(
      meal => meal.date === format(date, 'yyyy-MM-dd')
    );
    
    return dayMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
        meals: totals.meals + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
    );
  };

  // Calculate weekly totals
  const weeklyTotals = weekDays.reduce(
    (weekly, day) => {
      const dayTotals = getDayTotals(day);
      return {
        calories: weekly.calories + dayTotals.calories,
        protein: weekly.protein + dayTotals.protein,
        carbs: weekly.carbs + dayTotals.carbs,
        fat: weekly.fat + dayTotals.fat,
        meals: weekly.meals + dayTotals.meals,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
  );

  // Hero stats
  const heroStats = [
    {
      icon: Flame,
      label: 'Weekly Cal',
      value: (weeklyTotals.calories + calculatedCaloriesTotal).toLocaleString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Utensils,
      label: 'Meals Logged',
      value: weeklyTotals.meals.toString(),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Daily Avg',
      value: Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / 7).toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  // Get meals by type for a specific day
  const getMealsByType = (date: Date) => {
    const dayMeals = (loggedMeals as LoggedMeal[]).filter(
      meal => meal.date === format(date, 'yyyy-MM-dd')
    );
    
    return {
      breakfast: dayMeals.filter(m => m.mealType === 'breakfast'),
      lunch: dayMeals.filter(m => m.mealType === 'lunch'),
      dinner: dayMeals.filter(m => m.mealType === 'dinner'),
      snack: dayMeals.filter(m => m.mealType === 'snack'),
    };
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return Sunrise;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      case 'snack': return Coffee;
      default: return Utensils;
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'lunch': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'dinner': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'snack': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#a8dadc]/10 to-[#fef7cd]/10">
      {/* Hero Section */}
      <HeroSection
        title="Weekly Logger"
        subtitle="Advanced nutrition tracking and insights"
        component="logger"
        stats={heroStats}
        showProgress={false}
        className="pb-6"
      />

      <div className="max-w-md mx-auto w-full px-3 space-y-6">
        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm h-12">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 h-10 px-3 py-2 text-sm font-medium">
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center justify-center gap-2 h-10 px-3 py-2 text-sm font-medium">
              <Clock size={16} />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center justify-center gap-2 h-10 px-3 py-2 text-sm font-medium">
              <Award size={16} />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Week Progress Card - Data Management Style */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Week Progress</h3>
              
              <div className="space-y-6">
                {/* Week Navigation Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Week Navigation</h4>
                      <p className="text-sm text-gray-600">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      Current Week
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigateWeek('prev')}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Week
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigateWeek('next')}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Next Week
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Weekly Statistics Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Weekly Statistics</h4>
                      <p className="text-sm text-gray-600">Nutrition tracking progress and insights</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / (dailyCalorieGoal * 7) * 100)}% Complete
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Flame className="w-5 h-5 mx-auto text-orange-600 mb-1" />
                      <p className="text-xs text-gray-600">Total Calories</p>
                      <p className="font-bold text-gray-900">{(weeklyTotals.calories + calculatedCaloriesTotal).toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Activity className="w-5 h-5 mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-gray-600">Daily Average</p>
                      <p className="font-bold text-gray-900">{Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / 7)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Target className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <p className="text-xs text-gray-600">Weekly Goal</p>
                      <p className="font-bold text-gray-900">{(dailyCalorieGoal * 7).toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                      <p className="text-xs text-gray-600">Progress</p>
                      <p className="font-bold text-gray-900">{Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / (dailyCalorieGoal * 7) * 100)}%</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Daily Overview Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Daily Overview</h4>
                  <div className="grid grid-cols-1 gap-3">
                {weekDays.map((day, index) => {
                  const dayTotals = getDayTotals(day);
                  const progress = Math.min((dayTotals.calories / dailyCalorieGoal) * 100, 100);
                  const dayLabel = getDateLabel(day);
                  
                  return (
                    <div
                      key={index}
                      className={`
                        p-4 rounded-lg border transition-all duration-200 cursor-pointer
                        ${format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd') 
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }
                        ${isToday(day) ? 'ring-2 ring-green-300' : ''}
                      `}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-600">{format(day, 'EEE')}</div>
                            <div className="text-lg font-bold text-gray-900">{format(day, 'd')}</div>
                            {dayLabel !== format(day, 'MMM d') && (
                              <Badge variant="secondary" className="text-xs mt-1">{dayLabel}</Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {dayTotals.calories} / {dailyCalorieGoal} cal
                              </span>
                              <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {dayTotals.meals > 0 && (
                              <p className="text-xs text-gray-600 mt-1">{dayTotals.meals} meals logged</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            {/* Daily Meal Timeline */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {getDateLabel(selectedDay)} - {format(selectedDay, 'EEEE, MMM d')}
                  </h3>
                  <p className="text-sm text-gray-600">Daily meal timeline and nutrition breakdown</p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onNavigate('calculator')}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Meal
                </Button>
              </div>

              {/* Meal Timeline */}
              <div className="space-y-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                  const meals = getMealsByType(selectedDay)[mealType as keyof ReturnType<typeof getMealsByType>];
                  const MealIcon = getMealIcon(mealType);
                  const mealColorClass = getMealColor(mealType);
                  const mealTotal = meals.reduce((sum, meal) => sum + meal.calories, 0);

                  return (
                    <div key={mealType} className={`p-4 rounded-lg border-2 ${mealColorClass}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <MealIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold capitalize">{mealType}</h4>
                            <p className="text-sm opacity-75">{meals.length} {meals.length === 1 ? 'item' : 'items'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{mealTotal} cal</p>
                          <p className="text-sm opacity-75">
                            {Math.round((mealTotal / dailyCalorieGoal) * 100)}% of daily goal
                          </p>
                        </div>
                      </div>

                      {meals.length === 0 ? (
                        <div className="text-center py-4 opacity-60">
                          <p className="text-sm">No {mealType} logged yet</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('calculator')}
                            className="mt-2 text-xs"
                          >
                            <Plus size={12} className="mr-1" />
                            Add {mealType}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between p-3 bg-white/70 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{meal.name}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {meal.time}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                  P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-orange-600">{meal.calories} cal</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6 mt-6">
            {/* Calculator Integration Status */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Calculator Integration</h3>
                  <p className="text-sm text-gray-600">Real-time connection to calorie calculator</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xl font-bold text-blue-600">{calculatedItemsCount}</p>
                  <p className="text-xs text-gray-600">Items Calculated</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xl font-bold text-green-600">{weeklyTotals.meals}</p>
                  <p className="text-xs text-gray-600">Meals Logged</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xl font-bold text-orange-600">{calculatedCaloriesTotal}</p>
                  <p className="text-xs text-gray-600">Total Calories</p>
                </div>
              </div>
            </Card>

            {/* Weekly Insights */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Weekly Insights</h3>
                  <p className="text-sm text-gray-600">Smart analysis of your nutrition patterns</p>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  <Award className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Progress Trend</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    You're averaging {Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / 7)} calories per day this week. 
                    {Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / 7) < dailyCalorieGoal 
                      ? ' Consider adding more nutritious meals to reach your daily goal.' 
                      : ' Great job staying consistent with your nutrition goals!'}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Goal Achievement</span>
                  </div>
                  <p className="text-sm text-green-800">
                    You've logged {weeklyTotals.meals + calculatedItemsCount} meals this week across {weekDays.filter(day => getDayTotals(day).meals > 0).length} days. 
                    Keep up the consistent tracking!
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-900">Recommendation</span>
                  </div>
                  <p className="text-sm text-amber-800">
                    Use the calorie calculator to plan tomorrow's meals and maintain your nutrition momentum.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onNavigate('calculator')}
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Calculate Meal</p>
                    <p className="text-xs text-gray-600">Add new nutrition</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Progress</p>
                    <p className="text-xs text-gray-600">See dashboard</p>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}