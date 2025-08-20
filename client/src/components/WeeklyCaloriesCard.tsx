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

import { useCheckAchievements } from '@/hooks/useAchievements';
import { getWeekDates, getLocalDateKey, cleanupOldWeeklyData } from '@/utils/dateUtils';
import { cleanupCorruptedMealData } from '@/utils/dataCleanup';
import { checkMealDateMismatches } from '@/utils/mealDateFixer';
import { debounce, getCachedLocalStorage } from '@/utils/performanceUtils';
// Removed timezone correction import to fix date display issues

interface DayCalories {
  day: string;
  date: string;
  calories: number;
  mealCount: number;
}

export function WeeklyCaloriesCard() {
  const [weeklyData, setWeeklyData] = useState<DayCalories[]>([]);
  const [totalWeeklyCalories, setTotalWeeklyCalories] = useState(0);
  // Removed date override state to fix date display issues

  // Achievement system hook
  const checkAchievements = useCheckAchievements();




  // Get the current week's dates using actual calendar dates
  const getCurrentWeekDates = () => {
    const currentDate = new Date();
    const weekDatesArray = getWeekDates(currentDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const weekDates = weekDatesArray.map((date, index) => ({
      day: dayNames[index],
      date: getLocalDateKey(date),
      calories: 0,
      mealCount: 0
    }));
    
    return weekDates;
  };


  // Calculate weekly calories from stored meal data (cleaned up version)
  const calculateWeeklyCalories = () => {
    try {
      // Clean up old data keeping last 30 days
      const wasCleanedUp = cleanupOldWeeklyData();
      
      // Clean up corrupted data
      const { removedCount } = cleanupCorruptedMealData();
      
      if (wasCleanedUp || removedCount > 0) {
        console.log('🔄 Data cleanup completed');
      }
      
      const weekDates = getCurrentWeekDates();
      const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      
      if (storedMeals.length === 0) {
        return weekDates;
      }
      
      // Data validation and cleanup
      const validMeals = storedMeals.filter((meal: any) => {
        // Validate meal has required fields
        if (!meal.name || !meal.date) return false;
        
        // Validate calorie range (realistic values only)
        const calories = Number(meal.calories) || 0;
        if (calories < 0 || calories > 5000) return false;
        
        // Validate date format
        let mealDate = meal.date;
        if (mealDate && mealDate.includes('T')) {
          mealDate = mealDate.split('T')[0];
        }
        
        // Check if date is valid YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(mealDate)) return false;
        
        return true;
      }).map((meal: any) => {
        // Normalize the meal data
        let mealDate = meal.date;
        if (mealDate && mealDate.includes('T')) {
          mealDate = mealDate.split('T')[0];
        }
        
        return {
          ...meal,
          date: mealDate, // Ensure date is in YYYY-MM-DD format
          calories: Number(meal.calories) || 0
        };
      });
      
      // If we cleaned up invalid data, save the valid meals back
      if (validMeals.length !== storedMeals.length) {
        localStorage.setItem('weeklyMeals', JSON.stringify(validMeals));
        console.log(`🧹 Cleaned up ${storedMeals.length - validMeals.length} invalid meals`);
      }

      
      // Calculate calories for each day of the current week
      const weeklyData = weekDates.map(dayData => {
        // Filter meals for this specific day with strict date matching
        const dayMeals = validMeals.filter((meal: any) => {
          return meal.date === dayData.date;
        });
        
        // Calculate total calories for the day
        const dayCalories = dayMeals.reduce((sum: number, meal: any) => {
          return sum + (meal.calories || 0);
        }, 0);
        
        return {
          ...dayData,
          calories: dayCalories,
          mealCount: dayMeals.length
        };
      });

      const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
      
      setWeeklyData(weeklyData);
      setTotalWeeklyCalories(totalCalories);
      
      return weeklyData;
    } catch (error) {
      console.error('Error calculating weekly calories:', error);
      const weekDates = getCurrentWeekDates();
      setWeeklyData(weekDates.map(day => ({ ...day, calories: 0, mealCount: 0 })));
      setTotalWeeklyCalories(0);
      return weekDates.map(day => ({ ...day, calories: 0, mealCount: 0 }));
    }
  };

  // Debounced version of calculateWeeklyCalories for performance
  const debouncedCalculateWeeklyCalories = debounce(calculateWeeklyCalories, 250);

  // Load data on component mount and listen for updates
  useEffect(() => {
    // Clear any cached date overrides on component load
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user-date-override');
      localStorage.removeItem('date-calculation-cache');
    }
    
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
            <h4 className="text-lg font-semibold text-black">Weekly Summary</h4>
          </div>
          <Badge className="bg-[#0099FF] text-black">
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
                    ? 'bg-[#0099FF]/20 border-orange-400/30 shadow-lg' 
                    : hasMeals
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-[#DADADA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[80px]">
                    <p className={`text-sm font-medium ${
                      isToday ? 'text-[#0099FF]' : 'text-black'
                    }`}>
                      {dayData.day}
                    </p>
                    <p className={`text-xs ${
                      isToday ? 'text-[#0099FF]' : 'text-black'
                    }`}>
                      {(() => {
                        // Force correct date display by parsing as UTC to prevent timezone shift
                        const [year, month, day] = dayData.date.split('-').map(Number);
                        const displayDate = new Date(year, month - 1, day);
                        return displayDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      })()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <Badge className="bg-[#0099FF] text-black text-xs">Today</Badge>
                    )}
                    {dayData.mealCount > 0 && (
                      <Badge variant="outline" className="text-xs text-black border-[#DADADA]">
                        {dayData.mealCount} meal{dayData.mealCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {dayData.calories > 0 ? (
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${
                        isToday ? 'text-yellow-500' : 'text-gray-500'
                      }`} />
                      <span className={`font-bold text-lg ${
                        isToday ? 'text-[#0099FF]' : 'text-black'
                      }`}>
                        {dayData.calories}
                      </span>
                      <span className={`text-sm ${
                        isToday ? 'text-[#0099FF]' : 'text-black'
                      }`}>
                        cal
                      </span>
                    </div>
                  ) : (
                    <span className="text-black text-sm">No meals logged</span>
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
              <span className="text-black">Weekly Average:</span>
              <span className="text-black font-semibold">
                {Math.round(totalWeeklyCalories / 7)} cal/day
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}