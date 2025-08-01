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
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50/50 border-0 shadow-xl">
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
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateWeek('next')}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Progress Ring */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isGoalReached ? "#10b981" : isOnTrack ? "#3b82f6" : "#f59e0b"}
                strokeWidth="3"
                strokeDasharray={`${weekProgress}, 100`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">{Math.round(weekProgress)}%</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </div>
        
        {/* Achievement Badge */}
        {isGoalReached && (
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Calories</p>
              <p className="text-xs text-gray-500">{totalCalories.toLocaleString()} / {weeklyGoal.toLocaleString()}</p>
            </div>
          </div>
          <Progress value={weekProgress} className="h-2 bg-orange-100" />
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Daily Average</p>
              <p className="text-xs text-gray-500">{dailyAverage} / {dailyCalorieGoal} cal</p>
            </div>
          </div>
          <Progress value={(dailyAverage / dailyCalorieGoal) * 100} className="h-2 bg-blue-100" />
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Meals Logged</p>
              <p className="text-xs text-gray-500">{weeklyTotals.meals} this week</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < Math.ceil((weeklyTotals.meals / 21) * 7) ? 'bg-green-400' : 'bg-green-100'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Progress</p>
              <p className="text-xs text-gray-500">
                {isGoalReached ? 'Goal Reached!' : isOnTrack ? 'On Track' : 'Keep Going'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isGoalReached ? 'bg-green-400' : 'bg-gray-200'}`} />
            <div className={`w-2 h-2 rounded-full ${isOnTrack ? 'bg-blue-400' : 'bg-gray-200'}`} />
            <div className={`w-2 h-2 rounded-full ${weekProgress > 30 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
            <div className={`w-2 h-2 rounded-full ${weekProgress > 0 ? 'bg-purple-400' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge 
          variant={isGoalReached ? "default" : isOnTrack ? "secondary" : "outline"}
          className={`
            px-4 py-2 text-sm font-medium
            ${isGoalReached ? 'bg-green-100 text-green-800 border-green-200' : ''}
            ${isOnTrack && !isGoalReached ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
            ${!isOnTrack ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
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