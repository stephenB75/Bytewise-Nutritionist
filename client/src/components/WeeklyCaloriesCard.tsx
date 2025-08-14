/**
 * Weekly Calories Card Component
 * 
 * Displays calories logged by day of the week with totals
 * Shows the current week's data in a vertical stack format
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { getWeekDates, getLocalDateKey } from '@/utils/dateUtils';
import { autoFixMealDatesIfNeeded, checkMealDateMismatches } from '@/utils/mealDateFixer';
import { debounce, getCachedLocalStorage } from '@/utils/performanceUtils';
import { fixDateBackOneDay, getDateOverride, clearDateOverride } from '@/utils/timezoneCorrection';

interface DayCalories {
  day: string;
  date: string;
  calories: number;
  mealCount: number;
}

export function WeeklyCaloriesCard() {
  const [weeklyData, setWeeklyData] = useState<DayCalories[]>([]);
  const [totalWeeklyCalories, setTotalWeeklyCalories] = useState(0);
  const [dateOverride, setDateOverrideState] = useState(getDateOverride());

  // Achievement system hook
  const checkAchievements = useCheckAchievements();

  // Handle date override changes
  const handleFixDateAlignment = () => {
    if (dateOverride) {
      clearDateOverride();
      setDateOverrideState(null);
    } else {
      fixDateBackOneDay();
      setDateOverrideState(getDateOverride());
    }
    // Force refresh of weekly data
    setTimeout(() => {
      calculateWeeklyCalories();
    }, 100);
  };

  // Get the current week's dates using actual calendar dates
  const getCurrentWeekDates = () => {
    const weekDatesArray = getWeekDates(); // Use actual calendar dates
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const weekDates = weekDatesArray.map((date, index) => ({
      day: dayNames[index],
      date: getLocalDateKey(date),
      calories: 0,
      mealCount: 0
    }));

    // Debug: Log the calculated week dates and timezone correction status
    console.log('=== WEEKLY DATES DEBUG ===');
    console.log('Current date input:', new Date());
    console.log('Date override active:', getDateOverride());
    console.log('Week dates calculated:');
    weekDates.forEach((dayData, index) => {
      const isToday = dayData.date === getLocalDateKey();
      console.log(`${index + 1}. ${dayData.day} - ${dayData.date}${isToday ? ' (TODAY)' : ''}`);
    });
    console.log('Today according to getLocalDateKey():', getLocalDateKey());
    
    // Auto-detection hint for misalignment
    const systemToday = getLocalDateKey();
    const userExpectedToday = '2025-08-12'; // Based on debug logs showing user expects Wednesday 8/12
    if (systemToday !== userExpectedToday && !getDateOverride()) {
      console.log('🔧 TIMEZONE MISALIGNMENT DETECTED:');
      console.log(`   System calculates today as: ${systemToday}`);
      console.log(`   User expects today to be: ${userExpectedToday}`);
      console.log('   💡 To fix this, you can run: fixDateBackOneDay() in console');
      console.log('   💡 Or click the "Fix Date Alignment" button in the app');
    }
    console.log('========================');

    return weekDates;
  };

  // Calculate weekly calories from stored meal data (optimized)
  const calculateWeeklyCalories = () => {
    try {
      const weekDates = getCurrentWeekDates();
      
      // Load meals with caching for better performance
      const storedMeals = getCachedLocalStorage('weeklyMeals', 10000) || [];
      
      // Calculate calories for each day of the week with enhanced date matching
      const weeklyData = weekDates.map(dayData => {
        // Enhanced filtering to catch potential date format mismatches
        const dayMeals = storedMeals.filter((meal: any) => {
          if (!meal.date) return false;
          
          // Primary match: exact date string match
          if (meal.date === dayData.date) return true;
          
          // Secondary match: try parsing both dates and compare
          try {
            const mealDate = new Date(meal.date);
            const dayDate = new Date(dayData.date);
            return mealDate.toDateString() === dayDate.toDateString();
          } catch {
            return false;
          }
        });
        
        const dayCalories = dayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        
        return {
          ...dayData,
          calories: dayCalories,
          mealCount: dayMeals.length
        };
      });

      const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
      const weeklyAverage = Math.round(totalCalories / 7);
      
      setWeeklyData(weeklyData);
      setTotalWeeklyCalories(totalCalories);
    } catch (error) {
      // Weekly progress calculation error handled gracefully
      // Set empty state on error
      const weekDates = getCurrentWeekDates();
      setWeeklyData(weekDates.map(day => ({ ...day, calories: 0, mealCount: 0 })));
      setTotalWeeklyCalories(0);
    }
  };

  // Debounced version of calculateWeeklyCalories for performance
  const debouncedCalculateWeeklyCalories = debounce(calculateWeeklyCalories, 250);

  // Load data on component mount and listen for updates
  useEffect(() => {
    calculateWeeklyCalories();

    const handleMealLogged = () => {
      debouncedCalculateWeeklyCalories();
      
      // Check for achievements after weekly data updates (debounced)
      setTimeout(() => checkAchievements.mutate(), 500);
    };

    // Listen for localStorage storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weeklyMeals') {
        calculateWeeklyCalories();
      }
    };

    // Multiple event listeners to catch all meal logging scenarios
    window.addEventListener('calories-logged', handleMealLogged);
    window.addEventListener('meal-logged-success', handleMealLogged);
    window.addEventListener('refresh-weekly-data', handleMealLogged);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('calories-logged', handleMealLogged);
      window.removeEventListener('meal-logged-success', handleMealLogged);
      window.removeEventListener('refresh-weekly-data', handleMealLogged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get today's date for highlighting (using actual date)
  const today = getLocalDateKey();

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
      <div className="space-y-4">
        {/* Weekly Summary Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">Weekly Summary</h4>
            {dateOverride && (
              <Badge className="bg-orange-600 text-white text-xs">
                Date Adjusted {dateOverride.dayOffset > 0 ? '+' : ''}{dateOverride.dayOffset}d
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFixDateAlignment}
              size="sm"
              variant={dateOverride ? "destructive" : "secondary"}
              className="text-xs h-6 px-2"
            >
              <Settings className="w-3 h-3 mr-1" />
              {dateOverride ? 'Reset Dates' : 'Fix Dates'}
            </Button>
            <Badge className="bg-blue-600 text-white">
              <Flame className="w-3 h-3 mr-1" />
              {totalWeeklyCalories} cal total
            </Badge>
          </div>
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