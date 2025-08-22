/**
 * Food Search with History Component
 * 
 * Enhanced food search that includes:
 * - Today's logged meals
 * - Previous weeks' meals
 * - Previous months' meals
 * - Quick re-log functionality
 */

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Clock, 
  Calendar,
  ChevronRight,
  Utensils,
  History,
  TrendingUp,
  Star
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, isToday, isYesterday, differenceInDays } from 'date-fns';
import { getLocalDateKey } from '@/utils/dateUtils';

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

interface FoodSearchWithHistoryProps {
  onSelectFood: (food: LoggedFood) => void;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function FoodSearchWithHistory({
  onSelectFood,
  onSearchChange,
  placeholder = "Search Meal's",
  className = ""
}: FoodSearchWithHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [historicalMeals, setHistoricalMeals] = useState<LoggedFood[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Load historical meals from localStorage
  useEffect(() => {
    const loadHistoricalMeals = () => {
      try {
        let storedMeals = [];
        try {
          storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        } catch (error) {
          console.warn('Failed to load meals from localStorage:', error);
        }
        
        // Sort by date (newest first)
        const sortedMeals = storedMeals.sort((a: LoggedFood, b: LoggedFood) => {
          const dateA = new Date(a.timestamp || `${a.date} ${a.time}`);
          const dateB = new Date(b.timestamp || `${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

        setHistoricalMeals(sortedMeals);
      } catch (error) {
        // Silent fail - just set empty array
        setHistoricalMeals([]);
      }
    };

    loadHistoricalMeals();
    
    // Refresh when new meals are added
    const handleRefresh = () => loadHistoricalMeals();
    window.addEventListener('meals-updated', handleRefresh);
    window.addEventListener('calories-logged', handleRefresh);
    
    return () => {
      window.removeEventListener('meals-updated', handleRefresh);
      window.removeEventListener('calories-logged', handleRefresh);
    };
  }, []);

  // Filter meals based on search query only
  const filteredMeals = useMemo(() => {
    let meals = [...historicalMeals];
    
    // Filter by search query only
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      meals = meals.filter(meal => 
        meal.name.toLowerCase().includes(query)
      );
    }
    
    // Remove duplicates (keep most recent)
    const uniqueMeals = new Map<string, LoggedFood>();
    meals.forEach(meal => {
      const key = meal.name.toLowerCase().trim();
      if (!uniqueMeals.has(key) || 
          (meal.timestamp && uniqueMeals.get(key)!.timestamp && 
           new Date(meal.timestamp) > new Date(uniqueMeals.get(key)!.timestamp!))) {
        uniqueMeals.set(key, meal);
      }
    });
    
    return Array.from(uniqueMeals.values()).slice(0, 10); // Limit to 10 results
  }, [historicalMeals, searchQuery]);

  // Group meals by frequency for popular items
  const popularMeals = useMemo(() => {
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
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.food);
  }, [historicalMeals]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowResults(false); // Disable dropdown results
    onSearchChange(value);
  };

  const handleSelectFood = (food: LoggedFood) => {
    onSelectFood(food);
    setSearchQuery('');
    setShowResults(false);
  };

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

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Input
          data-testid="nutrition-food-search"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(false)}
          placeholder={placeholder}
          className={className || "text-base bg-white/80 border-2 border-amber-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-4 py-3 text-gray-950 placeholder-gray-700"}
        />
      </div>

      {/* Search Results Dropdown - DISABLED */}
      {false && showResults && (
        <Card className="absolute top-full mt-2 left-0 right-0 z-50 p-0 shadow-xl border-gray-200 overflow-hidden max-h-[400px]">
          <ScrollArea className="h-full max-h-[340px]">
            {/* Popular/Frequent Items (when no search) */}
            {!searchQuery && popularMeals.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500">
                  <Star className="h-3 w-3" />
                  <span className="font-medium">Frequently Logged</span>
                </div>
                {popularMeals.map((meal) => (
                  <button
                    key={`popular-${meal.id}`}
                    onClick={() => handleSelectFood(meal)}
                    className="w-full text-left p-2 hover:bg-amber-100/50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm group-hover:text-brand-blue">
                          {meal.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {meal.calories} cal
                          </span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-brand-blue" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {filteredMeals.length > 0 ? (
              <div className="p-2">
                {searchQuery && (
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500">
                    <History className="h-3 w-3" />
                    <span className="font-medium">Previous Meals</span>
                  </div>
                )}
                {filteredMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => handleSelectFood(meal)}
                    className="w-full text-left p-2 hover:bg-amber-100/50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm group-hover:text-brand-blue">
                          {meal.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {getDateLabel(meal.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {meal.calories} cal
                          </span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {meal.mealType}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-brand-blue" />
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No matching meals found</p>
                <p className="text-xs mt-1">Try searching in the USDA database</p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No meals logged yet</p>
                <p className="text-xs mt-1">Start logging meals to see them here</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}