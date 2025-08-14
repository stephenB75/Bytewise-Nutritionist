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
    // Clear any active override since user wants Wednesday = Aug 13th (system default)
    if (dateOverride) {
      clearDateOverride();
      setDateOverrideState(null);
      console.log('✅ Cleared date override - Wednesday should now be Aug 13th');
    } else {
      // User wants system default behavior
      console.log('ℹ️ No date override needed - system shows Wednesday as Aug 13th');
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
    const userExpectedToday = '2025-08-13'; // User wants Wednesday to be Aug 13th
    if (systemToday !== userExpectedToday && !getDateOverride()) {
      console.log('🔧 TIMEZONE MISALIGNMENT DETECTED:');
      console.log(`   System calculates today as: ${systemToday}`);
      console.log(`   User expects today to be: ${userExpectedToday}`);
      console.log('   💡 System appears to be showing correct dates');
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
          
          // Handle timestamp format dates (e.g., "2025-08-13T23:11:05.184Z")
          if (meal.date && meal.date.includes('T')) {
            const mealDateOnly = meal.date.split('T')[0]; // Extract just the date part
            if (mealDateOnly === dayData.date) return true;
          }
          
          // Enhanced matching: check if stored meal should appear on this adjusted day
          const dateOverride = getDateOverride();
          if (dateOverride && dateOverride.dayOffset) {
            try {
              // Calculate what the original date would be for this adjusted day
              const dayDateObj = new Date(dayData.date + 'T12:00:00');
              const originalDayDate = new Date(dayDateObj.getTime() - (dateOverride.dayOffset * 24 * 60 * 60 * 1000));
              const originalDayDateKey = originalDayDate.toISOString().split('T')[0];
              
              // If meal was stored on the original date, show it on the adjusted day
              if (meal.date === originalDayDateKey) return true;
            } catch {
              // Skip invalid dates
            }
          }
          
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
        
        // Debug to trace why EMPANADA appears on both Wednesday and Thursday
        if (dayData.day === 'Thursday' && dayMeals.some((meal: any) => meal.name && meal.name.includes('EMPANADA'))) {
          console.log(`❌ BUG: EMPANADA should NOT appear on Thursday ${dayData.date}`);
          console.log(`  Debugging why it's matching Thursday...`);
          
          storedMeals.forEach((meal: any) => {
            if (meal.name && meal.name.includes('EMPANADA')) {
              // Test each matching condition individually
              const exactMatch = meal.date === dayData.date;
              const timestampMatch = meal.date && meal.date.includes('T') && meal.date.split('T')[0] === dayData.date;
              
              // Test date override logic
              const dateOverride = getDateOverride();
              let overrideMatch = false;
              if (dateOverride && dateOverride.dayOffset) {
                try {
                  const dayDateObj = new Date(dayData.date + 'T12:00:00');
                  const originalDayDate = new Date(dayDateObj.getTime() - (dateOverride.dayOffset * 24 * 60 * 60 * 1000));
                  const originalDayDateKey = originalDayDate.toISOString().split('T')[0];
                  overrideMatch = meal.date === originalDayDateKey;
                } catch {
                  // Skip invalid dates
                }
              }
              
              // Test secondary date matching
              let secondaryMatch = false;
              try {
                const mealDate = new Date(meal.date);
                const dayDate = new Date(dayData.date);
                secondaryMatch = mealDate.toDateString() === dayDate.toDateString();
              } catch {
                // Skip invalid dates
              }
              
              console.log(`    EMPANADA check: "${meal.date}" vs "${dayData.date}"`);
              console.log(`      1. Exact match: ${exactMatch}`);
              console.log(`      2. Timestamp match: ${timestampMatch}`);  
              console.log(`      3. Override match: ${overrideMatch}`);
              console.log(`      4. Secondary match: ${secondaryMatch}`);
              console.log(`      Final result: ${exactMatch || timestampMatch || overrideMatch || secondaryMatch}`);
            }
          });
        }
        
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
                Date Override Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {dateOverride && (
              <Button
                onClick={handleFixDateAlignment}
                size="sm"
                variant="destructive"
                className="text-xs h-6 px-2"
              >
                <Settings className="w-3 h-3 mr-1" />
                Clear Override
              </Button>
            )}
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