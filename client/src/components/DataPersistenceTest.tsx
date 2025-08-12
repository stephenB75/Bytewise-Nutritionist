/**
 * Data Persistence Test Component
 * Live testing interface for verifying food entry persistence
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { getLocalDateKey } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

interface MealEntry {
  id: string;
  name: string;
  date: string;
  timestamp: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  mealType: string;
}

export function DataPersistenceTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runPersistenceTest = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        // Test 1: Check localStorage availability
        const localStorageAvailable = typeof(Storage) !== "undefined";
        
        // Test 2: Check existing meal data
        const weeklyMealsData = localStorage.getItem('weeklyMeals');
        const weeklyMeals: MealEntry[] = weeklyMealsData ? JSON.parse(weeklyMealsData) : [];
        
        // Test 3: Check today's meals
        const today = getLocalDateKey();
        const todayMeals = weeklyMeals.filter(meal => meal.date === today);
        
        // Test 4: Check data structure validity
        const validMeals = weeklyMeals.filter(meal => 
          meal.id && meal.name && meal.date && meal.calories !== undefined
        );
        
        // Test 5: Check date consistency
        const dateInconsistencies = weeklyMeals.filter(meal => {
          if (!meal.timestamp) return false;
          const timestampDate = new Date(meal.timestamp).toISOString().split('T')[0];
          return meal.date !== timestampDate;
        });
        
        // Test 6: Calculate total data size
        const dataSize = new Blob([weeklyMealsData || '']).size;
        
        // Test 7: Check for duplicate entries
        const mealIds = weeklyMeals.map(meal => meal.id);
        const uniqueIds = [...new Set(mealIds)];
        const hasDuplicates = mealIds.length !== uniqueIds.length;
        
        const results = {
          localStorageAvailable,
          totalMeals: weeklyMeals.length,
          todayMeals: todayMeals.length,
          validMeals: validMeals.length,
          invalidMeals: weeklyMeals.length - validMeals.length,
          dateInconsistencies: dateInconsistencies.length,
          dataSize: Math.round(dataSize / 1024), // KB
          hasDuplicates,
          sampleMeals: todayMeals.slice(0, 3),
          lastMeal: weeklyMeals.length > 0 ? weeklyMeals[weeklyMeals.length - 1] : null,
          dateRange: weeklyMeals.length > 0 ? {
            earliest: weeklyMeals.reduce((min, meal) => meal.date < min ? meal.date : min, weeklyMeals[0].date),
            latest: weeklyMeals.reduce((max, meal) => meal.date > max ? meal.date : max, weeklyMeals[0].date)
          } : null
        };
        
        setTestResults(results);
        setIsLoading(false);
        
        if (results.totalMeals > 0) {
          toast({
            title: "Data Found",
            description: `Found ${results.totalMeals} meal entries, ${results.todayMeals} from today`,
            duration: 4000,
          });
        } else {
          toast({
            title: "No Data Found",
            description: "No meal entries found in storage. Try logging a meal first.",
            duration: 4000,
          });
        }
        
      } catch (error) {
        setTestResults({ error: error.message });
        setIsLoading(false);
        
        toast({
          title: "Test Error",
          description: `Failed to test data persistence: ${error.message}`,
          duration: 4000,
        });
      }
    }, 500);
  };

  const addTestMeal = () => {
    try {
      const testMeal: MealEntry = {
        id: `test-${Date.now()}`,
        name: `Test Meal - ${new Date().toLocaleTimeString()}`,
        date: getLocalDateKey(),
        timestamp: new Date().toISOString(),
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 20) + 5,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        mealType: 'snack'
      };

      const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      weeklyMeals.push(testMeal);
      localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));

      // Trigger events to update the UI
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      window.dispatchEvent(new CustomEvent('calories-logged'));

      toast({
        title: "Test Meal Added",
        description: `Added "${testMeal.name}" with ${testMeal.calories} calories`,
        duration: 3000,
      });

      // Refresh test results
      setTimeout(() => runPersistenceTest(), 500);

    } catch (error) {
      toast({
        title: "Failed to Add Test Meal",
        description: error.message,
        duration: 4000,
      });
    }
  };

  const clearTestMeals = () => {
    try {
      const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      const filteredMeals = weeklyMeals.filter((meal: MealEntry) => !meal.id.startsWith('test-'));
      localStorage.setItem('weeklyMeals', JSON.stringify(filteredMeals));

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      
      toast({
        title: "Test Meals Cleared",
        description: "Removed all test meal entries",
        duration: 3000,
      });

      // Refresh test results
      setTimeout(() => runPersistenceTest(), 500);

    } catch (error) {
      toast({
        title: "Failed to Clear Test Meals",
        description: error.message,
        duration: 4000,
      });
    }
  };

  // Auto-run test on mount
  useEffect(() => {
    runPersistenceTest();
  }, []);

  return (
    <Card className="p-6 border-2 border-dashed border-green-300 bg-green-50/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Data Persistence Test</h3>
          </div>
          <Badge variant="secondary">
            Live Testing
          </Badge>
        </div>

        <p className="text-sm text-green-700">
          Verify that food entries are being saved and restored properly from localStorage.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={runPersistenceTest}
            disabled={isLoading}
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Test Data
              </>
            )}
          </Button>
          
          <Button onClick={addTestMeal} variant="outline" size="sm">
            Add Test Meal
          </Button>
          
          <Button onClick={clearTestMeals} variant="outline" size="sm">
            Clear Tests
          </Button>
        </div>

        {testResults && !testResults.error && (
          <div className="p-4 bg-white rounded-lg border space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">LocalStorage:</span>
                  <span className={testResults.localStorageAvailable ? "text-green-600" : "text-red-600"}>
                    {testResults.localStorageAvailable ? "✓ Available" : "✗ Unavailable"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Total Meals:</span>
                  <span className="text-blue-600">{testResults.totalMeals}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Today's Meals:</span>
                  <span className="text-green-600">{testResults.todayMeals}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Data Size:</span>
                  <span className="text-gray-600">{testResults.dataSize} KB</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Valid Entries:</span>
                  <span className="text-green-600">{testResults.validMeals}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Invalid Entries:</span>
                  <span className={testResults.invalidMeals > 0 ? "text-red-600" : "text-green-600"}>
                    {testResults.invalidMeals}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Date Issues:</span>
                  <span className={testResults.dateInconsistencies > 0 ? "text-orange-600" : "text-green-600"}>
                    {testResults.dateInconsistencies}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Duplicates:</span>
                  <span className={testResults.hasDuplicates ? "text-red-600" : "text-green-600"}>
                    {testResults.hasDuplicates ? "✗ Found" : "✓ None"}
                  </span>
                </div>
              </div>
            </div>

            {testResults.dateRange && (
              <div className="p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Data Range:</span> {testResults.dateRange.earliest} to {testResults.dateRange.latest}
              </div>
            )}

            {testResults.lastMeal && (
              <div className="p-2 bg-blue-50 rounded text-xs">
                <span className="font-medium">Last Entry:</span> {testResults.lastMeal.name} 
                ({testResults.lastMeal.calories} cal on {testResults.lastMeal.date})
              </div>
            )}

            {testResults.sampleMeals.length > 0 && (
              <div className="p-2 bg-green-50 rounded text-xs">
                <span className="font-medium">Today's Meals:</span>
                <div className="mt-1 space-y-1">
                  {testResults.sampleMeals.map((meal: MealEntry, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{meal.name}</span>
                      <span>{meal.calories} cal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {testResults && testResults.error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Test Failed</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{testResults.error}</p>
          </div>
        )}

        <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
          💡 This panel tests data persistence. Your food entries should survive page refreshes.
        </div>
      </div>
    </Card>
  );
}