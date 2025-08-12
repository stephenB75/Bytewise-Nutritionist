/**
 * Meal Date Test Panel - For testing and verifying meal date corrections
 * This component helps verify the meal date fixing functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TestTube, Plus, Trash2, RefreshCw } from 'lucide-react';
import { checkMealDateMismatches, fixMealDateMismatches } from '@/utils/mealDateFixer';
import { getLocalDateKey } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

export function MealDateTestPanel() {
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const addTestMeal = () => {
    const testMeal = {
      id: `test-${Date.now()}`,
      name: 'Test Meal (Wrong Date)',
      date: '2025-08-11', // Yesterday (Monday) - wrong date
      timestamp: new Date().toISOString(), // Today (Tuesday) - correct timestamp
      calories: 300,
      protein: 20,
      carbs: 30,
      fat: 10,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      mealType: 'lunch',
      category: 'lunch',
      source: 'test'
    };

    const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    weeklyMeals.push(testMeal);
    localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));

    toast({
      title: "Test Meal Added",
      description: "Added a meal with wrong date to test the fixing system",
      duration: 3000,
    });
  };

  const removeTestMeals = () => {
    const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    const filteredMeals = weeklyMeals.filter((meal: any) => meal.source !== 'test');
    localStorage.setItem('weeklyMeals', JSON.stringify(filteredMeals));

    toast({
      title: "Test Meals Removed",
      description: "Cleaned up all test meals from storage",
      duration: 3000,
    });

    setTestResults(null);
  };

  const runDateCheck = () => {
    setIsChecking(true);
    
    setTimeout(() => {
      const results = checkMealDateMismatches();
      setTestResults(results);
      setIsChecking(false);

      if (results.mismatches.length > 0) {
        toast({
          title: "Date Issues Found",
          description: `Found ${results.mismatches.length} meals with incorrect dates`,
          duration: 4000,
        });
      } else {
        toast({
          title: "All Dates Correct",
          description: "No meal date corrections needed",
          duration: 3000,
        });
      }
    }, 500);
  };

  const runDateFix = () => {
    const result = fixMealDateMismatches();
    
    if (result.success && result.fixedCount > 0) {
      toast({
        title: "Dates Fixed Successfully",
        description: `Corrected ${result.fixedCount} meal entries`,
        duration: 4000,
      });
      
      // Refresh the check results
      setTimeout(() => {
        const updatedResults = checkMealDateMismatches();
        setTestResults(updatedResults);
      }, 500);

      // Trigger app refresh events
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      window.dispatchEvent(new CustomEvent('calories-logged'));
    } else {
      toast({
        title: "No Changes Made",
        description: result.error || "All dates are already correct",
        duration: 3000,
      });
    }
  };

  const getCurrentMealCount = () => {
    try {
      const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      const today = getLocalDateKey();
      const todayMeals = weeklyMeals.filter((meal: any) => meal.date === today);
      return { total: weeklyMeals.length, today: todayMeals.length };
    } catch {
      return { total: 0, today: 0 };
    }
  };

  const mealCount = getCurrentMealCount();

  return (
    <Card className="p-6 border-2 border-dashed border-blue-300 bg-blue-50/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Meal Date Test Panel</h3>
          </div>
          <Badge variant="secondary">
            {mealCount.total} total meals, {mealCount.today} today
          </Badge>
        </div>

        <p className="text-sm text-blue-700">
          Test the meal date fixing system by adding test meals with wrong dates and then fixing them.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={addTestMeal} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Test Meal
          </Button>
          
          <Button onClick={removeTestMeals} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-1" />
            Remove Test Meals
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={runDateCheck}
            disabled={isChecking}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-1" />
                Check Dates
              </>
            )}
          </Button>

          <Button
            onClick={runDateFix}
            disabled={!testResults || testResults.mismatches.length === 0}
            className="bg-orange-600 hover:bg-orange-700"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Fix Dates
          </Button>
        </div>

        {testResults && (
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Meals:</span>
                <span>{testResults.totalMeals}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Correct Dates:</span>
                <span className="text-green-600">{testResults.correctMeals}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Need Fixing:</span>
                <span className={testResults.mismatches.length > 0 ? "text-red-600" : "text-green-600"}>
                  {testResults.mismatches.length}
                </span>
              </div>

              {testResults.mismatches.length > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded border">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Issues Found:</p>
                  {testResults.mismatches.slice(0, 2).map((mismatch: any, i: number) => (
                    <p key={i} className="text-xs text-yellow-700">
                      • "{mismatch.meal}": {mismatch.storedDate} → {mismatch.actualDate}
                    </p>
                  ))}
                  {testResults.mismatches.length > 2 && (
                    <p className="text-xs text-yellow-600">...and {testResults.mismatches.length - 2} more</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          💡 This panel is for testing only. The app automatically fixes date issues when it loads.
        </div>
      </div>
    </Card>
  );
}