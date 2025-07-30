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
import { useCalorieTracking } from '@/hooks/useCalorieTracking';
import { useQuery } from '@tanstack/react-query';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
  // Get real-time data from calorie tracking hook
  const { getDailyStats, getTodaysCalories } = useCalorieTracking();
  const dailyStats = getDailyStats();
  const todaysCalculations = getTodaysCalories();

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
    currentStreak: 7,
    caloriesConsumed: 0,
    caloriesGoal: 2200,
    proteinConsumed: 0,
    proteinGoal: 120,
    carbsConsumed: 0,
    carbsGoal: 300,
    fatConsumed: 0,
    fatGoal: 70,
    waterConsumed: 6,
    waterGoal: 8
  });

  // Update stats when data changes
  useEffect(() => {
    // Combine calories from calculator and logged meals
    const calculatorCalories = dailyStats.calories || 0;
    const mealCalories = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.totalCalories) || 0), 0) : 0;
    
    const calculatorProtein = dailyStats.protein || 0;
    const mealProtein = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.totalProtein) || 0), 0) : 0;

    const calculatorCarbs = dailyStats.carbs || 0;
    const mealCarbs = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.totalCarbs) || 0), 0) : 0;

    const calculatorFat = dailyStats.fat || 0;
    const mealFat = Array.isArray(mealStats) ? mealStats.reduce((total: number, meal: any) => 
      total + (parseFloat(meal.totalFat) || 0), 0) : 0;

    setUserStats(prev => ({
      ...prev,
      name: (user as any)?.firstName || prev.name,
      caloriesConsumed: Math.round(calculatorCalories + mealCalories),
      proteinConsumed: Math.round(calculatorProtein + mealProtein),
      carbsConsumed: Math.round(calculatorCarbs + mealCarbs),
      fatConsumed: Math.round(calculatorFat + mealFat),
      caloriesGoal: (user as any)?.dailyCalorieGoal || prev.caloriesGoal,
      proteinGoal: (user as any)?.dailyProteinGoal || prev.proteinGoal,
      carbsGoal: (user as any)?.dailyCarbGoal || prev.carbsGoal,
      fatGoal: (user as any)?.dailyFatGoal || prev.fatGoal,
      waterGoal: (user as any)?.dailyWaterGoal || prev.waterGoal
    }));
  }, [dailyStats, mealStats, user]);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Daily Nutrition Metrics */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Daily Nutrition Overview</h3>
            <Badge variant="outline" className="text-xs">
              📊 Calculator: {dataSource.calculatorEntries} • Logger: {dataSource.mealEntries}
            </Badge>
          </div>
          
          {/* Data Source Status */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Live Data Sources</span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Calculator: {Math.round(dataSource.calculatorCalories)} cal • Last update: {dataSource.lastUpdate}
            </div>
          </div>
          
          {/* Macro Nutrients */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-lg w-fit mx-auto mb-2">
                <Beef className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{userStats.proteinConsumed}g</div>
              <div className="text-sm text-gray-600">Protein</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Goal: {userStats.proteinGoal}g</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg w-fit mx-auto mb-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{userStats.carbsConsumed}g</div>
              <div className="text-sm text-gray-600">Carbs</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(carbsProgress, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Goal: {userStats.carbsGoal}g</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
                <Droplets className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{userStats.fatConsumed}g</div>
              <div className="text-sm text-gray-600">Fat</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(fatProgress, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Goal: {userStats.fatGoal}g</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
                <Droplets className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">67g</div>
              <div className="text-sm text-gray-600">Fat</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: '85%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Goal: 79g</div>
            </div>
          </div>

          {/* Micro Nutrients */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Key Micronutrients</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Fiber</div>
                  <div className="text-sm text-gray-600">28g / 35g</div>
                </div>
                <div className="text-green-600 font-bold">80%</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Sodium</div>
                  <div className="text-sm text-gray-600">1,890mg / 2,300mg</div>
                </div>
                <div className="text-blue-600 font-bold">82%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Vitamin C</div>
                  <div className="text-sm text-gray-600">67mg / 90mg</div>
                </div>
                <div className="text-orange-600 font-bold">74%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Iron</div>
                  <div className="text-sm text-gray-600">12mg / 18mg</div>
                </div>
                <div className="text-indigo-600 font-bold">67%</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Meals */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Today's Meals</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                📊 {todayMeals.length} entries
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('calculator')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meal
              </Button>
            </div>
          </div>

          {/* Data Source Status */}
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Live Data Connection</span>
            </div>
            <div className="text-xs text-green-700 mt-1">
              Calculator: {todaysMealsFromCalculator.length} • Logger: {todaysMealsFromLogger.length} • Last sync: {dataSource.lastUpdate}
            </div>
          </div>
          
          <div className="space-y-3">
            {todayMeals.length > 0 ? (
              todayMeals.map((meal, index) => (
                <div key={index} className={`flex items-center justify-between p-3 bg-gradient-to-r ${meal.color} rounded-lg border`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {meal.source === 'calculator' ? (
                        <Target className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Utensils className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{meal.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{meal.time}</span>
                        <Badge variant="outline" className="text-xs">
                          {meal.source === 'calculator' ? '🧮 Calc' : '📝 Logger'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white">
                    {meal.calories} cal
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No meals logged today</p>
                <p className="text-sm text-gray-400">Use the calculator or logger to add entries</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Achievements</h3>
            <Badge variant="outline" className="text-xs">
              🏆 {achievements.length} earned today
            </Badge>
          </div>

          {/* Achievement Status */}
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Achievement System Active</span>
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              Tracking daily & weekly nutrition goals • Next reward at {Math.max(100 - calorieProgress, 0)}% progress
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {achievements.length > 0 ? (
              achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={achievement.id} className="text-center">
                    <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg mb-2 mx-auto w-fit border border-yellow-200">
                      <IconComponent className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <p className="text-xs font-medium text-gray-700">{achievement.title}</p>
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-4">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Complete nutrition goals to earn achievements</p>
                <p className="text-xs text-gray-400 mt-1">Track calories & meet daily targets</p>
              </div>
            )}
          </div>

          {/* Achievement Progress */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Today's Progress</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Calories:</span>
                <span className={calorieProgress >= 100 ? "text-green-600 font-medium" : "text-gray-600"}>
                  {calorieProgress}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Protein:</span>
                <span className={proteinProgress >= 100 ? "text-green-600 font-medium" : "text-gray-600"}>
                  {proteinProgress}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Meals logged:</span>
                <span className={todayMeals.length >= 3 ? "text-green-600 font-medium" : "text-gray-600"}>
                  {todayMeals.length}/3
                </span>
              </div>
              <div className="flex justify-between">
                <span>Streak:</span>
                <span className={userStats.currentStreak >= 7 ? "text-green-600 font-medium" : "text-gray-600"}>
                  {userStats.currentStreak} days
                </span>
              </div>
            </div>
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
  );
}

export default Dashboard;