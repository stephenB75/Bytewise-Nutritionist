/**
 * Redesigned Daily Progress Component
 * Enhanced day-by-day view with interactive elements and better visual hierarchy
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Utensils,
  CheckCircle,
  Circle,
  Star,
  Zap
} from 'lucide-react';
import { format, isToday, isYesterday, isFuture } from 'date-fns';

interface DayData {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
}

interface DailyProgressProps {
  weekDays: Date[];
  getDayTotals: (date: Date) => { calories: number; protein: number; carbs: number; fat: number; meals: number; };
  selectedDay: Date;
  dailyCalorieGoal: number;
  onSelectDay: (date: Date) => void;
}

export function DailyProgress({ 
  weekDays, 
  getDayTotals, 
  selectedDay, 
  dailyCalorieGoal,
  onSelectDay 
}: DailyProgressProps) {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isFuture(date)) return 'Future';
    return format(date, 'MMM d');
  };

  const getDayStatus = (date: Date, calories: number) => {
    if (isFuture(date)) return 'future';
    if (calories >= dailyCalorieGoal) return 'complete';
    if (calories >= dailyCalorieGoal * 0.7) return 'good';
    if (calories > 0) return 'started';
    return 'empty';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return CheckCircle;
      case 'good': return Target;
      case 'started': return Circle;
      case 'future': return Clock;
      default: return Circle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-[#45c73e] bg-[#45c73e]/10 border-[#45c73e]/20';
      case 'good': return 'text-[#1f4aa6] bg-[#1f4aa6]/10 border-[#1f4aa6]/20';
      case 'started': return 'text-[#faed39] bg-[#faed39]/10 border-[#faed39]/20';
      case 'future': return 'text-gray-400 bg-amber-50/60 border-gray-200';
      default: return 'text-gray-600 bg-amber-50/60 border-gray-200';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-green-50/20 to-blue-50/30 border-0 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">Daily Progress</h3>
          <p className="text-lg text-gray-600">Track your nutrition goals day by day</p>
        </div>
        <Badge variant="outline" className="text-lg text-purple-600 border-purple-200 bg-purple-50">
          <Calendar className="w-4 h-4 mr-1" />
          7 Days
        </Badge>
      </div>

      <div className="space-y-3">
        {weekDays.map((day, index) => {
          const dayTotals = getDayTotals(day);
          const progress = Math.min((dayTotals.calories / dailyCalorieGoal) * 100, 100);
          const dayLabel = getDateLabel(day);
          const status = getDayStatus(day, dayTotals.calories);
          const StatusIcon = getStatusIcon(status);
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={index}
              className={`
                relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg
                ${isSelected 
                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-xl ring-2 ring-blue-300' 
                  : 'border-gray-200 bg-gradient-to-br from-white to-gray-50/50 hover:border-gray-300 hover:shadow-md'
                }
                ${isTodayDate && !isSelected ? 'ring-2 ring-green-300 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : ''}
                ${status === 'future' ? 'opacity-60' : ''}
              `}
              onClick={() => onSelectDay(day)}
            >
              {/* Status Indicator */}
              <div className="absolute top-3 right-3">
                <div className={`p-1.5 rounded-full ${getStatusColor(status)}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Special Day Badge */}
              {(isTodayDate || isYesterday(day)) && (
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-1 ${
                      isTodayDate ? 'bg-green-100 text-green-800 border-green-200' : 
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {dayLabel}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Date Column */}
                <div className="text-center min-w-[60px]">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 leading-none mt-1">
                    {format(day, 'd')}
                  </div>
                  {status === 'complete' && (
                    <div className="mt-1">
                      <Star className="w-4 h-4 text-[#faed39] mx-auto" />
                    </div>
                  )}
                </div>

                {/* Progress Column */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {dayTotals.calories.toLocaleString()} / {dailyCalorieGoal.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={progress} 
                    className={`h-3 mb-3 transition-all duration-700 ${
                      status === 'complete' ? '[&>div]:bg-gradient-to-r [&>div]:from-[#45c73e] [&>div]:to-[#45c73e]' :
                      status === 'good' ? '[&>div]:bg-gradient-to-r [&>div]:from-[#1f4aa6] [&>div]:to-[#1f4aa6]' :
                      status === 'started' ? '[&>div]:bg-gradient-to-r [&>div]:from-[#faed39] [&>div]:to-[#faed39]' :
                      '[&>div]:bg-gray-300'
                    }`}
                  />

                  {/* Meal and Macro Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      {dayTotals.meals > 0 ? (
                        <div className="flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          <span>{dayTotals.meals} meal{dayTotals.meals !== 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No meals logged</span>
                      )}
                    </div>
                    
                    {dayTotals.calories > 0 && (
                      <div className="text-right">
                        <div>P: {dayTotals.protein}g • C: {dayTotals.carbs}g • F: {dayTotals.fat}g</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Energy Indicator */}
              {progress > 0 && (
                <div className="absolute bottom-2 right-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'complete' ? 'bg-[#45c73e]/10 text-[#45c73e]' :
                    status === 'good' ? 'bg-[#1f4aa6]/10 text-[#1f4aa6]' :
                    status === 'started' ? 'bg-[#faed39]/10 text-[#faed39]' :
                    'bg-amber-50/80 text-gray-700'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {status === 'complete' ? 'Goal!' :
                     status === 'good' ? 'Good' :
                     status === 'started' ? 'Started' : 'Empty'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Week Summary</span>
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#45c73e]" />
              <span>{weekDays.filter(day => getDayTotals(day).calories >= dailyCalorieGoal).length} goal days</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-[#1f4aa6]" />
              <span>{weekDays.filter(day => getDayTotals(day).calories > 0).length} active days</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}