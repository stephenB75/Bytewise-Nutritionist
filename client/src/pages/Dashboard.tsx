/**
 * Bytewise Dashboard Component
 * 
 * Main dashboard with nutrition overview and daily progress
 * Features seamless hero integration and real-time data
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Target, 
  Flame, 
  Utensils,
  BarChart3,
  Award,
  Beef,
  Droplets,
  Calendar
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { PWAStatus } from '@/components/PWAStatus';
import { useCalorieTracking } from '@/hooks/useCalorieTracking';
import { useQuery } from '@tanstack/react-query';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { WorkflowNavigation } from '@/components/visual/WorkflowNavigation';
import { InteractiveProgressRing } from '@/components/visual/InteractiveProgressRing';
import { MinimalistMealCard } from '@/components/visual/MinimalistMealCard';
import { ADHDFriendlyToggle } from '@/components/visual/ADHDFriendlyToggle';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
  // Get real-time data from calorie tracking hook
  const { getDailyStats, getTodaysCalories } = useCalorieTracking();
  const dailyStats = getDailyStats();
  const todaysCalculations = getTodaysCalories();
  
  // Add rotating background to main dashboard
  const { currentImage, currentAlt, isLoading: imageLoading } = useRotatingBackground();
  
  // Workflow state
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState('track');
  const [completedSteps, setCompletedSteps] = useState(['calculate', 'log']);
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  // Fetch user data from API
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Fetch daily stats from logged meals
  const { data: mealStats } = useQuery({
    queryKey: ['/api/meals/logged'],
    retry: false,
  });

  // Combined stats from calculator and logged meals
  const [userStats, setUserStats] = useState({
    name: "User",
    currentStreak: 0,
    caloriesConsumed: 0,
    caloriesGoal: 2200,
    proteinConsumed: 0,
    proteinGoal: 120,
    carbsConsumed: 0,
    carbsGoal: 300,
    fatConsumed: 0,
    fatGoal: 70,
    waterConsumed: 0,
    waterGoal: 8
  });

  // Update stats when data changes - memoized to prevent infinite loops
  useEffect(() => {
    // Real-time data integration: Combine calories from calculator and logged meals
    const calculatorCalories = dailyStats.calories || 0;
    const mealCalories = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.calories) || 0), 0) : 0;
    
    const calculatorProtein = dailyStats.protein || 0;
    const mealProtein = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.protein) || 0), 0) : 0;
    
    const calculatorCarbs = dailyStats.carbs || 0;
    const mealCarbs = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.carbs) || 0), 0) : 0;
    
    const calculatorFat = dailyStats.fat || 0;
    const mealFat = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.fat) || 0), 0) : 0;

    const newStats = {
      name: (user as any)?.firstName || "User",
      currentStreak: 0,
      caloriesConsumed: Math.round(calculatorCalories + mealCalories),
      proteinConsumed: Math.round(calculatorProtein + mealProtein),
      carbsConsumed: Math.round(calculatorCarbs + mealCarbs),
      fatConsumed: Math.round(calculatorFat + mealFat),
      caloriesGoal: (user as any)?.dailyCalorieGoal || 2200,
      proteinGoal: (user as any)?.dailyProteinGoal || 120,
      carbsGoal: (user as any)?.dailyCarbGoal || 300,
      fatGoal: (user as any)?.dailyFatGoal || 70,
      waterConsumed: 0,
      waterGoal: (user as any)?.dailyWaterGoal || 8
    };

    setUserStats(newStats);
  }, [
    dailyStats.calories, 
    dailyStats.protein, 
    dailyStats.carbs, 
    dailyStats.fat,
    mealStats, 
    (user as any)?.firstName,
    (user as any)?.dailyCalorieGoal,
    (user as any)?.dailyProteinGoal,
    (user as any)?.dailyCarbGoal,
    (user as any)?.dailyFatGoal,
    (user as any)?.dailyWaterGoal
  ]);

  // Get today's meals from multiple sources
  const todaysMealsFromLogger = Array.isArray(mealStats) ? mealStats.filter((meal: any) => {
    const mealDate = meal.date || meal.created_at?.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return mealDate === today;
  }) : [];

  const todaysMealsFromCalculator = todaysCalculations.map(calc => ({
    name: calc.name,
    time: calc.time,
    calories: calc.calories,
    type: 'calculated',
    source: 'calculator',
    color: "from-blue-100 to-blue-200"
  }));

  // Combine all today's meals
  const combinedMeals = [
    ...todaysMealsFromLogger.map((meal: any) => ({
      name: meal.name || 'Logged Meal',
      time: meal.time || new Date(meal.created_at).toLocaleTimeString(),
      calories: Math.round(parseFloat(meal.totalCalories) || meal.calories || 0),
      type: meal.mealType || meal.type || 'meal',
      source: 'logger',
      color: "from-green-100 to-green-200"
    })),
    ...todaysMealsFromCalculator
  ];

  // Sort by time for chronological display
  const todayMeals = combinedMeals.sort((a, b) => {
    const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
    const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
    return timeA - timeB;
  });

  // Fetch achievements from API
  const { data: userAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    retry: false,
  });

  // Calculate progress percentages first
  const calorieProgress = Math.round((userStats.caloriesConsumed / userStats.caloriesGoal) * 100);
  const proteinProgress = Math.round((userStats.proteinConsumed / userStats.proteinGoal) * 100);
  const carbsProgress = Math.round((userStats.carbsConsumed / userStats.carbsGoal) * 100);
  const fatProgress = Math.round((userStats.fatConsumed / userStats.fatGoal) * 100);
  const waterProgress = Math.round((userStats.waterConsumed / userStats.waterGoal) * 100);

  // Calculate dynamic achievements based on current progress
  const calculateAchievements = () => {
    const achievements = [];
    
    // Daily goal achievements
    if (calorieProgress >= 100) {
      achievements.push({ id: 1, title: "Daily Goal", icon: Target, color: "text-green-500" });
    }
    if (proteinProgress >= 100) {
      achievements.push({ id: 2, title: "Protein Power", icon: Beef, color: "text-red-500" });
    }
    
    // Weekly streak achievements
    if (userStats.currentStreak >= 7) {
      achievements.push({ id: 3, title: "Week Warrior", icon: Flame, color: "text-orange-500" });
    }
    
    // Data tracking achievements
    if (todayMeals.length >= 3) {
      achievements.push({ id: 4, title: "Meal Master", icon: Utensils, color: "text-blue-500" });
    }
    
    // Calculator usage achievements
    if (todaysMealsFromCalculator.length >= 2) {
      achievements.push({ id: 5, title: "Calculator Pro", icon: Target, color: "text-purple-500" });
    }
    
    // Logger usage achievements
    if (todaysMealsFromLogger.length >= 2) {
      achievements.push({ id: 6, title: "Logger Champion", icon: Calendar, color: "text-indigo-500" });
    }
    
    return achievements.slice(0, 3); // Show top 3 achievements
  };

  const achievements = calculateAchievements();

  // Data source indicators
  const dataSource = {
    calculatorEntries: todaysCalculations.length,
    calculatorCalories: dailyStats.calories,
    mealEntries: Array.isArray(mealStats) ? mealStats.length : 0,
    lastUpdate: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Rotating Food Background - VISUAL REDESIGN ACTIVE */}
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px) brightness(0.4)'
        }}
        role="img"
        aria-label={currentAlt}
      />
      
      {/* Loading state for background */}
      {imageLoading && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-500 to-blue-600" />
      )}
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 z-5 bg-black/30" />
      
      {/* Visual Redesign Debug Indicator */}
      <div className="absolute top-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
        VISUAL REDESIGN ACTIVE
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection
          title={`Good morning, ${userStats.name}!`}
          subtitle="Keep up your amazing progress"
          component="dashboard"
          caloriesConsumed={userStats.caloriesConsumed}
          caloriesGoal={userStats.caloriesGoal}
          currentStreak={userStats.currentStreak}
        />

        {/* Main Content */}
        <div className="max-w-md mx-auto w-full px-3 py-6 space-y-6">
          {/* Workflow Navigation */}
          <WorkflowNavigation
            currentStep={currentWorkflowStep}
            completedSteps={completedSteps}
            onStepClick={(step) => {
              setCurrentWorkflowStep(step);
              if (step === 'calculate') onNavigate('calculator');
              if (step === 'log') onNavigate('logger');
              if (step === 'view') onNavigate('profile');
            }}
          />

          {/* Visual Progress Overview */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Today's Progress</h3>
              <ADHDFriendlyToggle
                checked={showProgressDetails}
                onChange={setShowProgressDetails}
                label=""
                size="sm"
                variant="success"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <InteractiveProgressRing
                value={userStats.caloriesConsumed}
                max={userStats.caloriesGoal}
                size={80}
                strokeWidth={6}
                label="Calories"
                unit=""
                showValue={true}
                color="#10b981"
              />
              <InteractiveProgressRing
                value={userStats.proteinConsumed}
                max={userStats.proteinGoal}
                size={80}
                strokeWidth={6}
                label="Protein"
                unit="g"
                showValue={true}
                color="#ef4444"
              />
              <InteractiveProgressRing
                value={userStats.carbsConsumed}
                max={userStats.carbsGoal}
                size={80}
                strokeWidth={6}
                label="Carbs"
                unit="g"
                showValue={true}
                color="#f59e0b"
              />
              <InteractiveProgressRing
                value={userStats.fatConsumed}
                max={userStats.fatGoal}
                size={80}
                strokeWidth={6}
                label="Fat"
                unit="g"
                showValue={true}
                color="#3b82f6"
              />
            </div>

            {showProgressDetails && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span>{userStats.caloriesConsumed} / {userStats.caloriesGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span>{userStats.proteinConsumed}g / {userStats.proteinGoal}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span>{userStats.carbsConsumed}g / {userStats.carbsGoal}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span>{userStats.fatConsumed}g / {userStats.fatGoal}g</span>
                </div>
              </div>
            )}
          </Card>

          {/* Today's Meals */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Today's Meals</h3>
              <Badge variant="outline" className="text-xs">
                {todayMeals.length} meals logged
              </Badge>
            </div>
            
            <div className="space-y-3">
              {todayMeals.length > 0 ? (
                todayMeals.slice(0, 3).map((meal, index) => (
                  <MinimalistMealCard
                    key={index}
                    name={meal.name}
                    time={meal.time}
                    calories={meal.calories}
                    mealType={meal.type as any}
                    onClick={() => onNavigate('logger')}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Utensils className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">No meals logged today</p>
                  <Button
                    onClick={() => onNavigate('calculator')}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Meal
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => onNavigate('calculator')} 
              className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Calculate Calories
            </Button>
            <Button 
              onClick={() => onNavigate('logger')} 
              variant="outline"
              className="h-16 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Weekly Logger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
