/**
 * Redesigned Week Progress Component
 * Modern UI with enhanced visual hierarchy and interactive elements
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
  Flame,
  Activity,
  Zap,
  Trophy,
  BarChart3
} from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { format, addDays } from 'date-fns';

interface WeekProgressProps {
  weekStart: Date;
  weeklyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meals: number;
  };
  calculatedCaloriesTotal: number;
  dailyCalorieGoal: number;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
}

export function WeekProgress({ 
  weekStart, 
  weeklyTotals, 
  calculatedCaloriesTotal, 
  dailyCalorieGoal,
  onNavigateWeek 
}: WeekProgressProps) {
  const totalCalories = weeklyTotals.calories + calculatedCaloriesTotal;
  const weeklyGoal = dailyCalorieGoal * 7;
  const weekProgress = Math.min((totalCalories / weeklyGoal) * 100, 100);
  const dailyAverage = Math.round(totalCalories / 7);
  
  // Calculate streak and achievement indicators
  const isGoalReached = weekProgress >= 100;
  const isOnTrack = weekProgress >= 70;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 border-0 shadow-xl backdrop-blur-sm">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Week Progress</h3>
          <p className="text-sm text-gray-600">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateWeek('prev')}
            className="h-9 w-9 p-0 hover:bg-orange-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateWeek('next')}
            className="h-9 w-9 p-0 hover:bg-orange-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Progress Ring */}
      <div className="flex justify-center mb-8">
        <ProgressRing
          progress={weekProgress}
          size="lg"
          color={isGoalReached ? "green" : isOnTrack ? "blue" : "orange"}
          showAchievement={true}
          animated={true}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700">Total Calories</p>
              <p className="text-sm text-gray-500">{totalCalories.toLocaleString()} / {weeklyGoal.toLocaleString()}</p>
            </div>
          </div>
          <Progress value={weekProgress} className="h-2 bg-orange-100" />
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700">Daily Average</p>
              <p className="text-sm text-gray-500">{dailyAverage} / {dailyCalorieGoal} cal</p>
            </div>
          </div>
          <Progress value={(dailyAverage / dailyCalorieGoal) * 100} className="h-2 bg-orange-100" />
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700">Meals Logged</p>
              <p className="text-sm text-gray-500">{weeklyTotals.meals} this week</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < Math.ceil((weeklyTotals.meals / 21) * 7) ? 'bg-[#45c73e]' : 'bg-[#45c73e]/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700">Progress</p>
              <p className="text-sm text-gray-500">
                {isGoalReached ? 'Goal Reached!' : isOnTrack ? 'On Track' : 'Keep Going'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isGoalReached ? 'bg-[#45c73e]' : 'bg-gray-200'}`} />
            <div className={`w-2 h-2 rounded-full ${isOnTrack ? 'bg-[#1f4aa6]' : 'bg-gray-200'}`} />
            <div className={`w-2 h-2 rounded-full ${weekProgress > 30 ? 'bg-[#faed39]' : 'bg-gray-200'}`} />
            <div className={`w-2 h-2 rounded-full ${weekProgress > 0 ? 'bg-purple-400' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge 
          variant={isGoalReached ? "default" : isOnTrack ? "secondary" : "outline"}
          className={`
            px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105
            ${isGoalReached ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-lg' : ''}
            ${isOnTrack && !isGoalReached ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-md' : ''}
            ${!isOnTrack ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200' : ''}
          `}
        >
          <BarChart3 className="w-3 h-3 mr-2" />
          {isGoalReached ? 'Weekly Goal Achieved!' : 
           isOnTrack ? 'Great Progress This Week' : 
           'Building Momentum'}
        </Badge>
      </div>
    </Card>
  );
}