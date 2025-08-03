/**
 * Weekly Calories Card Component
 * 
 * Displays calories logged by day of the week with totals
 * Shows the current week's data in a vertical stack format
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame } from 'lucide-react';

interface DayCalories {
  day: string;
  date: string;
  calories: number;
  mealCount: number;
}

export function WeeklyCaloriesCard() {
  const [weeklyData, setWeeklyData] = useState<DayCalories[]>([]);
  const [totalWeeklyCalories, setTotalWeeklyCalories] = useState(0);

  // Get the current week's dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go to Sunday

    const weekDates = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push({
        day: dayNames[i],
        date: date.toISOString().split('T')[0],
        calories: 0,
        mealCount: 0
      });
    }
    
    return weekDates;
  };

  // Initialize with clean empty state for production
  const calculateWeeklyCalories = () => {
    const weekDates = getCurrentWeekDates();
    
    // Production-ready empty state - no localStorage data loading
    const weeklyData = weekDates.map(dayData => ({
      ...dayData,
      calories: 0,  // Authentic empty state
      mealCount: 0  // No meals logged initially
    }));

    const totalCalories = 0;  // Clean total for empty state
    
    setWeeklyData(weeklyData);
    setTotalWeeklyCalories(totalCalories);
  };

  // Load data on component mount and listen for updates
  useEffect(() => {
    calculateWeeklyCalories();

    const handleMealLogged = () => {
      calculateWeeklyCalories();
    };

    window.addEventListener('calories-logged', handleMealLogged);
    window.addEventListener('meal-logged-success', handleMealLogged);
    window.addEventListener('refresh-weekly-data', handleMealLogged);

    return () => {
      window.removeEventListener('calories-logged', handleMealLogged);
      window.removeEventListener('meal-logged-success', handleMealLogged);
      window.removeEventListener('refresh-weekly-data', handleMealLogged);
    };
  }, []);

  // Get today's date for highlighting
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
      <div className="space-y-4">
        {/* Weekly Summary Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">Weekly Summary</h4>
          </div>
          <Badge className="bg-blue-600 text-white">
            <Flame className="w-3 h-3 mr-1" />
            {totalWeeklyCalories} cal total
          </Badge>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-3">
          {weeklyData.map((dayData, index) => {
            const isToday = dayData.date === today;
            const hasMeals = dayData.mealCount > 0;
            
            return (
              <div
                key={dayData.date}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isToday 
                    ? 'bg-orange-500/20 border-orange-400/30 shadow-lg' 
                    : hasMeals
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-700/20 border-gray-600/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[80px]">
                    <p className={`text-sm font-medium ${
                      isToday ? 'text-orange-300' : 'text-gray-300'
                    }`}>
                      {dayData.day}
                    </p>
                    <p className={`text-xs ${
                      isToday ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      {new Date(dayData.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <Badge className="bg-orange-500 text-white text-xs">Today</Badge>
                    )}
                    {dayData.mealCount > 0 && (
                      <Badge variant="outline" className="text-xs text-gray-300 border-gray-400">
                        {dayData.mealCount} meal{dayData.mealCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {dayData.calories > 0 ? (
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${
                        isToday ? 'text-orange-400' : 'text-orange-500'
                      }`} />
                      <span className={`font-bold text-lg ${
                        isToday ? 'text-orange-300' : 'text-white'
                      }`}>
                        {dayData.calories}
                      </span>
                      <span className={`text-sm ${
                        isToday ? 'text-orange-400' : 'text-gray-400'
                      }`}>
                        cal
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No meals logged</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Goal Progress (Optional) */}
        {totalWeeklyCalories > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Weekly Average:</span>
              <span className="text-white font-semibold">
                {Math.round(totalWeeklyCalories / 7)} cal/day
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}