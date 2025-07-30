/**
 * Weekly Logger - Track calories calculated and added as meals by user
 * Mobile-first responsive design with Bytewise brand identity
 * Features daily logging, weekly overview, and meal tracking
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Utensils
} from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
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

  // Get week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch logged meals for the week
  const { data: loggedMeals = [], isLoading } = useQuery({
    queryKey: ['/api/meals/logged', format(weekStart, 'yyyy-MM-dd')],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add meal mutation
  const addMealMutation = useMutation({
    mutationFn: async (meal: Omit<LoggedMeal, 'id'>) =>
      fetch('/api/meals/logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
        credentials: 'include',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
    },
  });

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

  const dailyCalorieGoal = 2000; // Default goal
  const avgDailyCalories = Math.round(weeklyTotals.calories / 7);

  // Include calculated calories in weekly stats
  const todaysCalculated = getTodaysCalories();
  const calculatedCaloriesTotal = todaysCalculated.reduce((sum, item) => sum + item.calories, 0);
  const calculatedItemsCount = todaysCalculated.length;
  
  const heroStats = [
    {
      label: 'Weekly Total',
      value: (weeklyTotals.calories + calculatedCaloriesTotal).toLocaleString(),
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Meals Logged',
      value: (weeklyTotals.meals + todaysCalculated.length).toString(),
      icon: Utensils,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Daily Average',
      value: Math.round((weeklyTotals.calories + calculatedCaloriesTotal) / 7).toLocaleString(),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#a8dadc]/10 to-[#fef7cd]/10">
      {/* Hero Section */}
      <HeroSection
        title="Weekly Logger"
        subtitle="Track your calculated calories and meals"
        component="logger"
        stats={heroStats}
        showProgress={false}
        className="pb-6"
      />

      <div className="px-4 space-y-6">
        {/* Calculator Connection Status - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Calculator Integration</h4>
              <p className="text-sm text-gray-600">Track calories calculated and logged entries</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Target className="w-3 h-3 mr-1" />
              Active Connection
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="w-4 h-4 mx-auto bg-blue-600 rounded mb-1"></div>
              <p className="text-xs text-gray-600">Calculated</p>
              <p className="font-bold text-gray-900 text-sm">{calculatedItemsCount}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <Utensils className="w-4 h-4 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-gray-600">Logged</p>
              <p className="font-bold text-gray-900 text-sm">{weeklyTotals.meals}</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <Flame className="w-4 h-4 mx-auto text-orange-600 mb-1" />
              <p className="text-xs text-gray-600">Calories</p>
              <p className="font-bold text-gray-900 text-sm">{calculatedCaloriesTotal}</p>
            </div>
          </div>
        </Card>

        {/* Week Navigation - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Overview</h4>
              <p className="text-sm text-gray-600">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Calendar className="w-3 h-3 mr-1" />
              Week {Math.ceil((new Date().getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Next Week
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          {/* Week Overview Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayTotals = getDayTotals(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
              const progress = Math.min((dayTotals.calories / dailyCalorieGoal) * 100, 100);
              
              return (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 text-center
                    ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}
                    ${isToday ? 'ring-2 ring-green-500' : ''}
                  `}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-2">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    {dayTotals.calories > 0 ? `${dayTotals.calories}` : '-'}
                  </div>
                  
                  {dayTotals.meals > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {dayTotals.meals} meals
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {format(selectedDay, 'EEEE, MMMM d')}
            </h3>
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

          {/* Daily Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Calories', value: getDayTotals(selectedDay).calories, color: 'text-orange-600' },
              { label: 'Protein', value: `${getDayTotals(selectedDay).protein}g`, color: 'text-red-600' },
              { label: 'Carbs', value: `${getDayTotals(selectedDay).carbs}g`, color: 'text-blue-600' },
              { label: 'Fat', value: `${getDayTotals(selectedDay).fat}g`, color: 'text-yellow-600' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Meals by Type */}
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const meals = getMealsByType(selectedDay)[mealType as keyof ReturnType<typeof getMealsByType>];
            
            return (
              <div key={mealType} className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                  <Clock size={16} />
                  {mealType}
                  {meals.length > 0 && (
                    <Badge variant="secondary">{meals.length}</Badge>
                  )}
                </h4>
                
                {meals.length === 0 ? (
                  <div className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded-lg text-center">
                    No {mealType} logged yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {meals.map((meal, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{meal.name}</div>
                          <div className="text-sm text-gray-600">{meal.time}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">{meal.calories} cal</div>
                          <div className="text-xs text-gray-600">
                            P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate('calculator')}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Calculate Meal
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2"
            >
              <TrendingUp size={16} />
              View Progress
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}