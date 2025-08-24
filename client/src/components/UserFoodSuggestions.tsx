/**
 * User Food Suggestions Component
 * 
 * Shows only user-entered food items as suggestions
 * Filters out USDA database entries, showing only custom user entries
 */

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User,
  History,
  Star,
  ChevronRight,
  Utensils,
  Clock
} from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

interface UserFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source: string;
}

interface UserFoodSuggestionsProps {
  onSelectFood: (food: UserFood) => void;
  className?: string;
}

export function UserFoodSuggestions({
  onSelectFood,
  className = ""
}: UserFoodSuggestionsProps) {
  const [userFoods, setUserFoods] = useState<UserFood[]>([]);

  // Load user-entered foods only
  useEffect(() => {
    const loadUserFoods = () => {
      try {
        const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        
        // Filter to only user-entered foods (not from USDA database)
        const userEnteredFoods = storedMeals.filter((meal: UserFood) => 
          meal.source !== 'usda' && meal.source !== 'database'
        );
        
        // Sort by date (newest first)
        const sortedFoods = userEnteredFoods.sort((a: UserFood, b: UserFood) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

        setUserFoods(sortedFoods);
      } catch (error) {
        console.error('Error loading user foods:', error);
        setUserFoods([]);
      }
    };

    loadUserFoods();
    
    // Refresh when new meals are added
    const handleRefresh = () => loadUserFoods();
    window.addEventListener('meals-updated', handleRefresh);
    window.addEventListener('calories-logged', handleRefresh);
    
    return () => {
      window.removeEventListener('meals-updated', handleRefresh);
      window.removeEventListener('calories-logged', handleRefresh);
    };
  }, []);

  // Get unique foods and popular items
  const { uniqueFoods, popularFoods } = useMemo(() => {
    // Remove duplicates and track frequency
    const frequency = new Map<string, { food: UserFood; count: number }>();
    
    userFoods.forEach(food => {
      const key = food.name.toLowerCase().trim();
      if (frequency.has(key)) {
        frequency.get(key)!.count++;
        // Keep the most recent entry
        if (new Date(`${food.date} ${food.time}`) > new Date(`${frequency.get(key)!.food.date} ${frequency.get(key)!.food.time}`)) {
          frequency.get(key)!.food = food;
        }
      } else {
        frequency.set(key, { food, count: 1 });
      }
    });
    
    const unique = Array.from(frequency.values()).map(item => item.food);
    const popular = Array.from(frequency.values())
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.food);
    
    return { uniqueFoods: unique.slice(0, 10), popularFoods: popular };
  }, [userFoods]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    
    const days = differenceInDays(today, date);
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return format(date, 'MMM d');
  };

  const handleSelectFood = (food: UserFood) => {
    onSelectFood(food);
  };

  if (userFoods.length === 0) {
    return (
      <Card className={`p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-0 shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <h3 className="text-lg font-semibold mb-2">No Custom Foods Yet</h3>
          <p className="text-sm">Start adding your own food entries to see personalized suggestions here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <User className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Your Food Suggestions</h3>
          <p className="text-sm text-gray-600">Foods you've added previously</p>
        </div>
      </div>

      {/* Popular Foods */}
      {popularFoods.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-gray-700">Frequently Added</h4>
          </div>
          <div className="space-y-2">
            {popularFoods.map((food) => (
              <button
                key={`popular-${food.id}`}
                onClick={() => handleSelectFood(food)}
                className="w-full text-left p-3 hover:bg-amber-50/60 rounded-lg transition-colors group border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm group-hover:text-purple-600">
                      {food.name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        {food.calories} cal
                      </span>
                      <span>P: {food.protein}g</span>
                      <span>C: {food.carbs}g</span>
                      <span>F: {food.fat}g</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-purple-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Foods */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-blue-500" />
          <h4 className="font-medium text-gray-700">Recent Entries</h4>
        </div>
        <div className="space-y-2">
          {uniqueFoods.map((food) => (
            <button
              key={food.id}
              onClick={() => handleSelectFood(food)}
              className="w-full text-left p-3 hover:bg-amber-50/60 rounded-lg transition-colors group border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm group-hover:text-blue-600">
                    {food.name}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDateLabel(food.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="h-3 w-3" />
                      {food.calories} cal
                    </span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {food.mealType}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-blue-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {uniqueFoods.length >= 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">Showing your 10 most recent custom foods</p>
        </div>
      )}
    </Card>
  );
}