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
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { getWeekDates, getLocalDateKey } from '@/utils/dateUtils';
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

  // Authentication and achievement hooks
  const { user } = useAuth();
  const checkAchievements = useCheckAchievements();



  // Get the current week's dates using actual calendar dates
  const getCurrentWeekDates = () => {
    // Use current date without any date override to fix the offset issue
    const currentDate = new Date();
    const weekDatesArray = getWeekDates(currentDate); // Use actual calendar dates
    
    const weekDates = weekDatesArray.map((date) => {
      // Get the actual day name for this date instead of using hardcoded array
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      return {
        day: dayName,
        date: getLocalDateKey(date),
        calories: 0,
        mealCount: 0
      };
    });

    const todayKey = getLocalDateKey(currentDate);
    
    return weekDates;
  };

  // Calculate weekly calories from stored meal data (optimized)
  const calculateWeeklyCalories = async () => {
    try {
      const weekDates = getCurrentWeekDates();
      let storedMeals: any[] = [];
      
      // For authenticated users, try to load from database first
      if (user) {
        try {
          const response = await apiRequest('GET', '/api/meals/logged');
          if (response.ok) {
            const databaseMeals = await response.json();
            storedMeals = Array.isArray(databaseMeals) ? databaseMeals : [];
            
            // Also sync to localStorage for offline capability
            localStorage.setItem('weeklyMeals', JSON.stringify(storedMeals));
          } else {
            throw new Error('Database fetch failed');
          }
        } catch (error) {
          // Fall back to localStorage
          storedMeals = getCachedLocalStorage('weeklyMeals', 0) || [];
        }
      } else {
        // For unauthenticated users, load from localStorage
        storedMeals = getCachedLocalStorage('weeklyMeals', 0) || [];
      }

      
      // Fix meals with missing calories and save back to localStorage
      let needsSave = false;
      storedMeals.forEach((meal: any) => {
        const currentCalories = Number(meal.calories) || Number(meal.totalCalories) || 0;
        
        // Only estimate if calories are truly missing or zero
        if (currentCalories === 0) {
          needsSave = true;
          
          // Estimate calories based on meal name only as fallback
          if (meal.name) {
            const name = meal.name.toLowerCase();
            if (name.includes('empanada')) meal.calories = 250;
            else if (name.includes('apple')) meal.calories = 95;
            else if (name.includes('water')) meal.calories = 0;
            else if (name.includes('chicken')) meal.calories = 300;
            else if (name.includes('popcycle') || name.includes('popsicle')) meal.calories = 150;
            else meal.calories = 100; // Default estimate
          }
        }
        // Important: Don't override existing valid calorie values
      });
      
      // Save the fixed data back to localStorage
      if (needsSave) {
        localStorage.setItem('weeklyMeals', JSON.stringify(storedMeals));
      }
      
      // Calculate calories for each day of the week with fixed date matching
      const weeklyData = weekDates.map(dayData => {
        // Strict filtering to prevent duplicate matches - each meal should only appear once
        const dayMeals = storedMeals.filter((meal: any) => {
          if (!meal.date) return false;
          
          const mealDateStr = meal.date;
          
          // Handle timestamp format dates - extract date part and normalize
          let normalizedMealDate = mealDateStr.includes('T') 
            ? mealDateStr.split('T')[0] 
            : mealDateStr;
            
          // If the meal date is an ISO string, parse it properly to get the local date
          if (mealDateStr.includes('T') || mealDateStr.includes('Z')) {
            const mealDate = new Date(mealDateStr);
            normalizedMealDate = getLocalDateKey(mealDate);
          }
          
          // Debug: Log date matching
          if (normalizedMealDate === dayData.date) {
            return true;
          }
          
          return false;
        });
        
        const dayCalories = dayMeals.reduce((sum: number, meal: any) => {
          const mealCalories = Number(meal.calories) || Number(meal.totalCalories) || 0;
          return sum + mealCalories;
        }, 0);
        
        
        return {
          ...dayData,
          calories: dayCalories,
          mealCount: dayMeals.length
        };
      });

      // Calculate total weekly calories
      const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
      
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
    <div className="weekly-calories-card-wrapper">
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-6">
        <div className="space-y-4">
        {/* Weekly Summary Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-gray-950">Weekly Summary</h4>
          </div>
          <Badge className="bg-amber-800 text-amber-100 border border-amber-700">
            <Flame className="w-3 h-3 mr-1 text-amber-100" />
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
                    ? 'bg-amber-100/70 border-amber-200/60 hover:bg-amber-200/70'
                    : 'bg-amber-50/40 border-amber-200/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[80px]">
                    <p className={`text-sm font-medium ${
                      isToday ? 'text-orange-600' : 'text-gray-950'
                    }`}>
                      {dayData.day}
                    </p>
                    <p className={`text-xs ${
                      isToday ? 'text-orange-500' : 'text-gray-900'
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
                      <Badge className="bg-orange-600 text-white text-xs">Today</Badge>
                    )}
                    {dayData.mealCount > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-400 bg-white/80">
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
                        isToday ? 'text-orange-600' : 'text-gray-950'
                      }`}>
                        {dayData.calories}
                      </span>
                      <span className={`text-sm ${
                        isToday ? 'text-orange-500' : 'text-gray-900'
                      }`}>
                        cal
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-800 text-sm">No meals logged</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Goal Progress (Optional) */}
        {totalWeeklyCalories > 0 && (
          <div className="pt-3 border-t border-amber-300/40">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-900">Weekly Average:</span>
              <span className="text-gray-950 font-semibold">
                {Math.round(totalWeeklyCalories / 7)} cal/day
              </span>
            </div>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
}