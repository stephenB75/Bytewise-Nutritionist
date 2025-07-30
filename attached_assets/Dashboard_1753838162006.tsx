/**
 * Bytewise Dashboard Component
 * 
 * Enhanced dashboard with accurate meal logging data integration
 * Features:
 * - Seamless header-hero integration
 * - Real-time calorie progress tracking from logged meals
 * - Dynamic content based on actual user meal data
 * - Accurate metrics from daily meal logs
 * - Visual nutrients module with charts and progress bars
 * - Brand-consistent styling with explicit typography
 * - Enhanced visual appeal with contextual background images
 */

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Plus, 
  ChefHat, 
  Calendar, 
  TrendingUp, 
  Target, 
  Flame, 
  Clock,
  Utensils,
  BarChart3,
  Award,
  ArrowRight,
  Zap,
  Activity,
  Trophy,
  Apple,
  Beef,
  Wheat,
  Pill,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TodaysNutrients } from './TodaysNutrients';

interface DashboardProps {
  userName: string;
  onNavigate?: (page: string) => void;
}

interface DailyMealLog {
  date: string;
  meals: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snack: any[];
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

interface CalorieGoalData {
  currentCalories: number;
  goalCalories: number;
  remaining: number;
  progressPercentage: number;
  isOverGoal: boolean;
}

export function Dashboard({ userName, onNavigate }: DashboardProps) {
  // Real data from meal logs with proper initialization
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalMealsLogged, setTotalMealsLogged] = useState(0);
  const [totalIngredientsLogged, setTotalIngredientsLogged] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRealTimeUpdate, setIsRealTimeUpdate] = useState(false);

  // Enhanced calorie goal tracking
  const [calorieGoalData, setCalorieGoalData] = useState<CalorieGoalData>({
    currentCalories: 0,
    goalCalories: 2200, // Default goal
    remaining: 2200,
    progressPercentage: 0,
    isOverGoal: false
  });

  // Today's nutritional data from logged meals for the visual nutrients module
  const [todayNutrients, setTodayNutrients] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0
  });

  // Meal breakdown by category with accurate data
  const [mealBreakdown, setMealBreakdown] = useState([
    { name: 'Breakfast', count: 0, calories: 0, color: 'from-orange-100 to-orange-200', iconColor: 'text-orange-600' },
    { name: 'Lunch', count: 0, calories: 0, color: 'from-green-100 to-green-200', iconColor: 'text-green-600' },
    { name: 'Dinner', count: 0, calories: 0, color: 'from-blue-100 to-blue-200', iconColor: 'text-blue-600' },
    { name: 'Snacks', count: 0, calories: 0, color: 'from-purple-100 to-purple-200', iconColor: 'text-purple-600' }
  ]);

  // Load real data from meal logs with enhanced accuracy
  useEffect(() => {
    loadDashboardData();
    
    // Set up listener for meal log changes
    const handleMealLogUpdate = (event?: CustomEvent) => {
      console.log('📊 Dashboard: Meal log updated, refreshing data...');
      if (event?.detail) {
        console.log('📦 Received update event with data:', event.detail);
        setIsRealTimeUpdate(true);
        setTimeout(() => setIsRealTimeUpdate(false), 2000); // Show indicator for 2 seconds
      }
      loadDashboardData();
    };

    // Listen for custom events from meal logger
    window.addEventListener('bytewise-meal-log-updated', handleMealLogUpdate);
    window.addEventListener('storage', handleMealLogUpdate);

    return () => {
      window.removeEventListener('bytewise-meal-log-updated', handleMealLogUpdate);
      window.removeEventListener('storage', handleMealLogUpdate);
    };
  }, []);

  // Enhanced data loading with accurate calculations
  const loadDashboardData = () => {
    setIsLoading(true);
    
    try {
      console.log('📊 Loading Dashboard data from meal logs...');
      const savedMealLogs = JSON.parse(localStorage.getItem('dailyMealLogs') || '{}');
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📅 Today:', today);
      console.log('🗄️ Available meal logs:', Object.keys(savedMealLogs));
      console.log('🔍 Raw localStorage data:', localStorage.getItem('dailyMealLogs'));
      
      // Get accurate today's data
      const todayLog = savedMealLogs[today] as DailyMealLog | undefined;
      let currentCalories = 0;
      let currentNutrients = { 
        calories: 0, 
        protein: 0, 
        carbs: 0, 
        fat: 0, 
        fiber: 0, 
        sodium: 0, 
        sugar: 0 
      };
      let breakdown = [
        { name: 'Breakfast', count: 0, calories: 0, color: 'from-orange-100 to-orange-200', iconColor: 'text-orange-600' },
        { name: 'Lunch', count: 0, calories: 0, color: 'from-green-100 to-green-200', iconColor: 'text-green-600' },
        { name: 'Dinner', count: 0, calories: 0, color: 'from-blue-100 to-blue-200', iconColor: 'text-blue-600' },
        { name: 'Snacks', count: 0, calories: 0, color: 'from-purple-100 to-purple-200', iconColor: 'text-purple-600' }
      ];
      
      if (todayLog && todayLog.totals) {
        console.log('✅ Found today\'s meal log:', todayLog);
        
        // Use accurate totals from meal log
        currentCalories = Math.round(todayLog.totals.calories || 0);
        currentNutrients = {
          calories: Math.round(todayLog.totals.calories || 0),
          protein: Math.round(todayLog.totals.protein || 0),
          carbs: Math.round(todayLog.totals.carbs || 0),
          fat: Math.round(todayLog.totals.fat || 0),
          fiber: Math.round(todayLog.totals.fiber || 0),
          sodium: Math.round(todayLog.totals.sodium || 0),
          sugar: Math.round(todayLog.totals.sugar || 0)
        };
        
        // Calculate accurate meal breakdown
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        mealTypes.forEach((mealType, index) => {
          const mealData = todayLog.meals[mealType as keyof typeof todayLog.meals] || [];
          const mealCalories = mealData.reduce((sum: number, item: any) => sum + (item.calories || 0), 0);
          
          breakdown[index] = {
            ...breakdown[index],
            count: mealData.length,
            calories: Math.round(mealCalories)
          };
        });
        
        console.log('🔢 Today\'s calories:', currentCalories);
        console.log('🥗 Today\'s nutrients:', currentNutrients);
        console.log('🍽️ Meal breakdown:', breakdown);
      } else {
        console.log('ℹ️ No meal log found for today');
      }

      // Calculate enhanced calorie goal data
      const goalCalories = 2200; // Could be loaded from user preferences
      const remaining = Math.max(0, goalCalories - currentCalories);
      const progressPercentage = goalCalories > 0 ? Math.min((currentCalories / goalCalories) * 100, 100) : 0;
      const isOverGoal = currentCalories > goalCalories;

      const calorieData: CalorieGoalData = {
        currentCalories,
        goalCalories,
        remaining,
        progressPercentage: Math.round(progressPercentage),
        isOverGoal
      };

      console.log('🎯 Calorie goal data:', calorieData);

      // Set all data
      setCalorieGoalData(calorieData);
      setTodayNutrients(currentNutrients);
      setMealBreakdown(breakdown);

      // Calculate historical data (totals across all logged days)
      const dates = Object.keys(savedMealLogs).filter(date => savedMealLogs[date]?.meals);
      let totalMeals = 0;
      let totalIngredients = 0;
      let streak = 0;

      console.log('📊 Processing historical data for', dates.length, 'dates');

      // Calculate total meals and ingredients with better accuracy
      dates.forEach(date => {
        const log = savedMealLogs[date] as DailyMealLog;
        if (log?.meals) {
          const dayIngredients = [
            ...(log.meals.breakfast || []),
            ...(log.meals.lunch || []),
            ...(log.meals.dinner || []),
            ...(log.meals.snack || [])
          ];
          
          if (dayIngredients.length > 0) {
            totalMeals++;
            totalIngredients += dayIngredients.length;
          }
        }
      });

      // Calculate current streak (consecutive days with logged meals)
      const todayDate = new Date();
      let checkDate = new Date(todayDate);
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const log = savedMealLogs[dateStr] as DailyMealLog;
        
        if (log?.meals) {
          const dayIngredients = [
            ...(log.meals.breakfast || []),
            ...(log.meals.lunch || []),
            ...(log.meals.dinner || []),
            ...(log.meals.snack || [])
          ];
          
          if (dayIngredients.length > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Calculate weekly progress (last 7 days)
      const last7Days = [];
      const date = new Date();
      for (let i = 0; i < 7; i++) {
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr);
        date.setDate(date.getDate() - 1);
      }

      const daysWithMeals = last7Days.filter(date => {
        const log = savedMealLogs[date] as DailyMealLog;
        if (log?.meals) {
          const dayIngredients = [
            ...(log.meals.breakfast || []),
            ...(log.meals.lunch || []),
            ...(log.meals.dinner || []),
            ...(log.meals.snack || [])
          ];
          return dayIngredients.length > 0;
        }
        return false;
      }).length;

      const weeklyProgressPercent = Math.round((daysWithMeals / 7) * 100);

      // Update all state
      setCurrentStreak(streak);
      setTotalMealsLogged(totalMeals);
      setTotalIngredientsLogged(totalIngredients);
      setWeeklyProgress(weeklyProgressPercent);
      setLastUpdated(new Date().toLocaleTimeString());

      console.log('✅ Dashboard data loaded successfully:', {
        streak,
        totalMeals,
        totalIngredients,
        weeklyProgress: weeklyProgressPercent,
        currentCalories,
        lastUpdated: new Date().toLocaleTimeString()
      });

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      // Set safe defaults on error
      setCalorieGoalData({
        currentCalories: 0,
        goalCalories: 2200,
        remaining: 2200,
        progressPercentage: 0,
        isOverGoal: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh function
  const handleRefreshData = () => {
    console.log('🔄 Manual dashboard refresh triggered');
    loadDashboardData();
  };

  // Test function to verify data recording
  const testDataRecording = () => {
    const today = new Date().toISOString().split('T')[0];
    const mealLogs = JSON.parse(localStorage.getItem('dailyMealLogs') || '{}');
    
    console.log('🧪 MEAL DATA VERIFICATION TEST');
    console.log('📅 Checking date:', today);
    console.log('🗂️ Total logs in storage:', Object.keys(mealLogs).length);
    console.log('📋 Today\'s log exists:', !!mealLogs[today]);
    
    if (mealLogs[today]) {
      const log = mealLogs[today];
      console.log('📊 Today\'s meal data:', log);
      console.log('🔢 Today\'s totals:', log.totals);
      console.log('🍽️ Meals breakdown:');
      console.log('  - Breakfast:', log.meals?.breakfast?.length || 0, 'items');
      console.log('  - Lunch:', log.meals?.lunch?.length || 0, 'items');  
      console.log('  - Dinner:', log.meals?.dinner?.length || 0, 'items');
      console.log('  - Snacks:', log.meals?.snack?.length || 0, 'items');
    } else {
      console.log('⚠️ No meal data found for today');
    }
    
    console.log('✅ Verification complete');
  };

  // Quick action handlers
  const handleQuickAdd = () => {
    if (onNavigate) {
      onNavigate('calculator');
    }
  };

  const handleViewCalendar = () => {
    if (onNavigate) {
      onNavigate('calendar');
    }
  };

  const handleMealPlanning = () => {
    if (onNavigate) {
      onNavigate('planner');
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Hero Section with Seamless Header Integration */}
      <div className="relative -mx-4 mb-3">
        <div className="h-64 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Fresh healthy ingredients and meal planning setup"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <div className="absolute inset-x-4 bottom-3 top-16 flex flex-col justify-end text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p 
                  className="text-sm opacity-90 mb-1 text-brand-body" 
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
                >
                  Welcome back
                </p>
                <h1 
                  className="text-brand-heading" 
                  style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.2 }}
                >
                  {userName}
                </h1>
                <p 
                  className="text-sm opacity-90 mt-1 text-brand-body" 
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
                >
                  {currentStreak === 0 ? 'Start your nutrition journey today' : 'Track every ingredient, master your nutrition'}
                </p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Flame className={currentStreak > 0 ? "text-orange-400" : "text-white/50"} size={16} />
                  <span 
                    className="text-2xl font-bold text-brand-heading" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    {currentStreak}
                  </span>
                </div>
                <p 
                  className="text-xs opacity-90 text-brand-body" 
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                >
                  {currentStreak === 0 ? 'day streak' : currentStreak === 1 ? 'day streak' : 'day streak'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-md rounded-2xl px-3 py-2.5 flex-1 min-w-0">
                <div className="text-center">
                  <div 
                    className="text-lg font-bold text-brand-heading" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    {calorieGoalData.currentCalories}
                  </div>
                  <div 
                    className="text-xs text-white/80 text-brand-body" 
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    Calories
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div 
                    className="text-lg font-bold text-brand-heading" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    {totalMealsLogged}
                  </div>
                  <div 
                    className="text-xs text-white/80 text-brand-body" 
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    Days Logged
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div 
                    className="text-lg font-bold text-brand-heading" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    {totalIngredientsLogged}
                  </div>
                  <div 
                    className="text-xs text-white/80 text-brand-body" 
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    Ingredients
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Ring with Accurate Data */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth="6" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    stroke={calorieGoalData.isOverGoal ? "#f59e0b" : "#a8dadc"}
                    strokeWidth="6" 
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - calorieGoalData.progressPercentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div 
                      className="text-lg font-bold text-brand-heading" 
                      style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                    >
                      {calorieGoalData.progressPercentage}%
                    </div>
                    <div 
                      className="text-xs opacity-75 text-brand-body" 
                      style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                    >
                      Goal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Enhanced Today's Goals with Accurate Data */}
        <Card className="p-4 bg-gradient-to-r from-pastel-yellow/20 to-pastel-blue/20 border-2 border-pastel-blue/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pastel-blue/20 flex items-center justify-center border-2 border-pastel-blue/30">
                <Target className="w-5 h-5 text-pastel-blue-dark" />
              </div>
              <div>
                <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                  Today's Goal
                </h3>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  {calorieGoalData.currentCalories === 0 ? 'Ready to start tracking?' : 
                   calorieGoalData.isOverGoal ? `${calorieGoalData.currentCalories - calorieGoalData.goalCalories} calories over goal` :
                   `${calorieGoalData.remaining} calories remaining`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {isRealTimeUpdate && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                      {isRealTimeUpdate ? 'Live Update' : `Updated ${lastUpdated}`}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={testDataRecording}
                  className="text-brand-button h-8 w-8 p-0"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                  title="Test Data Recording (Check Console)"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  className="text-brand-button h-8 w-8 p-0"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Calorie Progress Display */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-3xl font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.875rem", fontWeight: 700 }}>
                  {calorieGoalData.currentCalories}
                </div>
                <div className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  / {calorieGoalData.goalCalories} cal
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="w-full bg-white/50 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    calorieGoalData.isOverGoal 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                      : 'bg-gradient-to-r from-pastel-blue to-pastel-blue-dark'
                  }`}
                  style={{ width: `${Math.min(calorieGoalData.progressPercentage, 100)}%` }}
                />
              </div>
              
              {/* Status Message */}
              <div className="text-sm text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                {calorieGoalData.currentCalories === 0 ? (
                  <span className="text-muted-foreground">Start tracking your first meal to see progress</span>
                ) : calorieGoalData.isOverGoal ? (
                  <span className="text-orange-600">Goal exceeded! Great job staying active 💪</span>
                ) : calorieGoalData.progressPercentage >= 80 ? (
                  <span className="text-green-600">Almost there! You're doing great 🎯</span>
                ) : (
                  <span className="text-blue-600">Keep going! You've got this 🚀</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Visual Today's Nutrients Module */}
        <TodaysNutrients
          calories={todayNutrients.calories}
          protein={todayNutrients.protein}
          carbs={todayNutrients.carbs}
          fat={todayNutrients.fat}
          fiber={todayNutrients.fiber}
          sodium={todayNutrients.sodium}
          sugar={todayNutrients.sugar}
          calorieTarget={calorieGoalData.goalCalories}
          proteinTarget={150}
          carbsTarget={275}
          fatTarget={73}
        />

        {/* Today's Meals Distribution with Background Image */}
        <Card className="relative p-4 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-10">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Delicious meal spread with various dishes"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                  Today's Meals
                </h3>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  {calorieGoalData.currentCalories === 0 ? 'No meals logged yet' : 'Distribution by meal type'}
                </p>
              </div>
            </div>

            {calorieGoalData.currentCalories === 0 ? (
              <div className="text-center py-6">
                <ChefHat className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  Start logging meals to see your daily distribution
                </p>
                <Button 
                  className="mt-3 text-brand-button" 
                  onClick={handleQuickAdd}
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log First Meal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {mealBreakdown.map((meal, index) => (
                  <div key={meal.name} className={`bg-gradient-to-br ${meal.color} rounded-lg p-4 border backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                        {meal.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {meal.count} items
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
                      {meal.calories}
                    </div>
                    <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                      calories
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
              Quick Actions
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-between p-4 h-auto text-brand-button" 
              onClick={handleQuickAdd}
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                    Log Food
                  </div>
                  <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                    Add ingredients to meals
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center justify-between p-4 h-auto text-brand-button" 
              onClick={handleMealPlanning}
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                    Meal Planner
                  </div>
                  <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                    Plan your weekly meals
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center justify-between p-4 h-auto text-brand-button" 
              onClick={handleViewCalendar}
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                    View Calendar
                  </div>
                  <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                    Track your progress over time
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </Card>

        {/* Weekly Progress Summary */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                Weekly Progress
              </h3>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Your consistency this week
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-600 text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
                {weeklyProgress}%
              </div>
              <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                days with meals
              </div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
                {currentStreak}
              </div>
              <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                current streak
              </div>
            </div>
          </div>
          
          {weeklyProgress === 100 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-green-700 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Perfect week! You logged meals every day 🎉
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}