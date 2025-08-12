/**
 * Logged Food Suggestions Component
 * 
 * Shows frequently logged foods as suggestions for quick re-logging
 */

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Clock,
  Utensils,
  Plus
} from 'lucide-react';

interface LoggedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp?: string;
}

interface LoggedFoodSuggestionsProps {
  onSelectFood: (food: LoggedFood) => void;
  className?: string;
}

export function LoggedFoodSuggestions({
  onSelectFood,
  className = ""
}: LoggedFoodSuggestionsProps) {
  const [historicalMeals, setHistoricalMeals] = useState<LoggedFood[]>([]);

  // Load historical meals from localStorage
  useEffect(() => {
    const loadHistoricalMeals = () => {
      try {
        const stored = localStorage.getItem('calorieEntries');
        if (stored) {
          const entries = JSON.parse(stored);
          const allMeals: LoggedFood[] = [];
          
          Object.entries(entries).forEach(([date, dayData]: [string, any]) => {
            if (dayData?.meals) {
              Object.entries(dayData.meals).forEach(([mealType, foods]: [string, any]) => {
                if (Array.isArray(foods)) {
                  foods.forEach(food => {
                    allMeals.push({
                      ...food,
                      date,
                      mealType,
                      timestamp: food.timestamp || new Date(date).toISOString()
                    });
                  });
                }
              });
            }
          });
          
          setHistoricalMeals(allMeals.sort((a, b) => 
            new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
          ));
        }
      } catch (error) {
        console.error('Error loading historical meals:', error);
      }
    };

    loadHistoricalMeals();
    
    // Listen for updates
    const handleRefresh = () => loadHistoricalMeals();
    window.addEventListener('calories-logged', handleRefresh);
    window.addEventListener('meals-updated', handleRefresh);
    
    return () => {
      window.removeEventListener('calories-logged', handleRefresh);
      window.removeEventListener('meals-updated', handleRefresh);
    };
  }, []);

  // Get most frequently logged items
  const frequentMeals = useMemo(() => {
    const frequency = new Map<string, { food: LoggedFood; count: number }>();
    
    historicalMeals.forEach(meal => {
      const key = meal.name.toLowerCase().trim();
      if (frequency.has(key)) {
        frequency.get(key)!.count++;
      } else {
        frequency.set(key, { food: meal, count: 1 });
      }
    });
    
    return Array.from(frequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(item => ({ ...item.food, frequency: item.count }));
  }, [historicalMeals]);

  // Get recent meals (last 24 hours)
  const recentMeals = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recent = historicalMeals
      .filter(meal => {
        const mealDate = new Date(meal.timestamp || meal.date);
        return mealDate > yesterday;
      })
      .slice(0, 6);
    
    // Remove duplicates
    const uniqueMeals = new Map<string, LoggedFood>();
    recent.forEach(meal => {
      const key = meal.name.toLowerCase().trim();
      if (!uniqueMeals.has(key)) {
        uniqueMeals.set(key, meal);
      }
    });
    
    return Array.from(uniqueMeals.values());
  }, [historicalMeals]);

  if (frequentMeals.length === 0 && recentMeals.length === 0) {
    return null;
  }

  return (
    <Card className={`p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Add from History</h3>
      
      {/* Frequently Logged */}
      {frequentMeals.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-medium text-gray-700">Frequently Logged</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {frequentMeals.map((meal) => (
              <Button
                key={`freq-${meal.id}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectFood(meal)}
                className="h-auto p-2 flex flex-col items-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-medium text-gray-900 truncate">{meal.name}</span>
                  <Plus className="h-3 w-3 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{meal.calories} cal</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {meal.frequency}x
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Meals */}
      {recentMeals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-medium text-gray-700">Recent Meals</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {recentMeals.map((meal) => (
              <Button
                key={`recent-${meal.id}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectFood(meal)}
                className="h-auto p-2 flex flex-col items-start hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-medium text-gray-900 truncate">{meal.name}</span>
                  <Plus className="h-3 w-3 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Utensils className="h-3 w-3" />
                  <span>{meal.calories} cal</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {meal.mealType}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}