/**
 * Enhanced Meal Timeline Component
 * Redesigned meal tracking with improved visual hierarchy and interactions
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Plus,
  Clock,
  Flame,
  Target,
  Utensils,
  Sunrise,
  Sun,
  Moon,
  Coffee,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { isToday, getDateLabel } from '@/utils/dateUtils';

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

interface MealTimelineProps {
  selectedDay: Date;
  getMealsByType: (date: Date) => {
    breakfast: LoggedMeal[];
    lunch: LoggedMeal[];
    dinner: LoggedMeal[];
    snack: LoggedMeal[];
  };
  dailyCalorieGoal: number;
  onNavigate: (page: string) => void;
}

export function MealTimeline({ 
  selectedDay, 
  getMealsByType, 
  dailyCalorieGoal,
  onNavigate 
}: MealTimelineProps) {

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
      case 'breakfast': return {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        accent: 'bg-orange-500'
      };
      case 'lunch': return {
        bg: 'bg-gradient-to-br from-[#faed39]/10 to-orange-50',
        border: 'border-[#faed39]/20',
        text: 'text-[#faed39]',
        accent: 'bg-[#faed39]'
      };
      case 'dinner': return {
        bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        accent: 'bg-indigo-500'
      };
      case 'snack': return {
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        accent: 'bg-purple-500'
      };
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        accent: 'bg-gray-500'
      };
    }
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
  const mealsByType = getMealsByType(selectedDay);
  
  // Calculate daily totals
  const dailyTotals = Object.values(mealsByType).flat().reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
      meals: totals.meals + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
  );

  const dailyProgress = Math.min((dailyTotals.calories / dailyCalorieGoal) * 100, 100);

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-200/30 border-amber-200/40 shadow-xl backdrop-blur-sm">
      {/* Header with Daily Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {getDateLabel(selectedDay)}
            </h3>
            <p className="text-sm text-gray-600">{format(selectedDay, 'EEEE, MMM d, yyyy')}</p>
          </div>
          <Button
            onClick={() => onNavigate('calculator')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
        </div>

        {/* Daily Progress Summary */}
        <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-200 rounded-xl border border-amber-300 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-950">Daily Progress</p>
                <p className="text-sm text-gray-900">
                  {dailyTotals.calories.toLocaleString()} / {dailyCalorieGoal.toLocaleString()} calories
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-950">{Math.round(dailyProgress)}%</p>
              <p className="text-xs text-gray-900">{dailyTotals.meals} meals</p>
            </div>
          </div>
          <Progress value={dailyProgress} className="h-3 bg-amber-200 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-600" />
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="space-y-4">
        {mealTypes.map((mealType) => {
          const meals = mealsByType[mealType];
          const MealIcon = getMealIcon(mealType);
          const colors = getMealColor(mealType);
          const mealTotal = meals.reduce((sum, meal) => sum + meal.calories, 0);
          const mealProgress = Math.min((mealTotal / (dailyCalorieGoal * 0.25)) * 100, 100);

          return (
            <div 
              key={mealType} 
              className={`
                relative p-5 rounded-2xl border-2 transition-all duration-300
                ${colors.bg} ${colors.border}
              `}
            >
              {/* Meal Type Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                    <MealIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold capitalize ${colors.text}`}>
                      {mealType}
                    </h4>
                    <p className={`text-sm ${colors.text} opacity-75`}>
                      {meals.length} {meals.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${colors.text}`}>
                    {mealTotal.toLocaleString()} cal
                  </p>
                  <p className={`text-xs ${colors.text} opacity-75`}>
                    {Math.round((mealTotal / dailyCalorieGoal) * 100)}% of daily goal
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Progress 
                  value={mealProgress} 
                  className={`h-2 bg-white/50 [&>div]:${colors.accent.replace('bg-', 'bg-')}`}
                />
              </div>

              {/* Meal Items */}
              {meals.length === 0 ? (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 ${colors.accent} rounded-full mx-auto mb-3 flex items-center justify-center opacity-30`}>
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                  <p className={`text-sm ${colors.text} opacity-60 mb-3`}>
                    No {mealType} logged yet
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('calculator')}
                    className={`${colors.text} hover:bg-amber-100/50`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {mealType}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal, index) => (
                    <div
                      key={meal.id}
                      className="bg-amber-50/70 backdrop-blur-sm p-4 rounded-xl border border-amber-100/50 transition-all duration-300 hover:bg-amber-100/90 hover:shadow-lg hover:scale-[1.02] transform"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-gray-900">{meal.name}</h5>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {meal.time}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-green-600" />
                              <span>P: {meal.protein}g</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-blue-600" />
                              <span>C: {meal.carbs}g</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-yellow-600" />
                              <span>F: {meal.fat}g</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-purple-600" />
                              <span>Fiber: {meal.fiber}g</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-bold text-orange-600">
                              {meal.calories.toLocaleString()}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500">calories</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Summary Footer */}
      {dailyTotals.meals > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-700">
                  {dailyTotals.calories.toLocaleString()} calories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#45c73e]" />
                <span className="text-gray-600">
                  P: {dailyTotals.protein}g • C: {dailyTotals.carbs}g • F: {dailyTotals.fat}g
                </span>
              </div>
            </div>
            <Badge 
              variant={dailyProgress >= 100 ? "default" : "secondary"}
              className={`
                ${dailyProgress >= 100 ? 'bg-green-100 text-green-800 border-green-200' : 
                  dailyProgress >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                  'bg-[#faed39]/10 text-[#faed39] border-[#faed39]/20'}
              `}
            >
              {dailyProgress >= 100 ? 'Goal Reached!' : 
               dailyProgress >= 70 ? 'On Track' : 
               'Keep Going'}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}