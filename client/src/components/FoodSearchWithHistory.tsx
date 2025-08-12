/**
 * Food Search with History Component
 * 
 * Enhanced food search that includes:
 * - Today's logged meals
 * - Previous weeks' meals
 * - Previous months' meals
 * - Quick re-log functionality
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Clock, 
  ChevronRight,
  Utensils,
  History,
  TrendingUp,
  Star
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

interface FoodSearchWithHistoryProps {
  value?: string;
  onSelectFood: (food: LoggedFood) => void;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function FoodSearchWithHistory({
  value,
  onSelectFood,
  onSearchChange,
  placeholder = "Search today's meals or history...",
  className = ""
}: FoodSearchWithHistoryProps) {
  const [historicalMeals, setHistoricalMeals] = useState<LoggedFood[]>([]);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use value prop directly if provided, otherwise use internal state
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = value !== undefined ? value : internalSearchQuery;
  
  console.log('FoodSearchWithHistory render - value prop:', value, 'searchQuery:', searchQuery);

  // Load historical meals from localStorage
  useEffect(() => {
    const loadHistoricalMeals = () => {
      try {
        const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        
        // Sort by date (newest first)
        const sortedMeals = storedMeals.sort((a: LoggedFood, b: LoggedFood) => {
          const dateA = new Date(a.timestamp || `${a.date} ${a.time}`);
          const dateB = new Date(b.timestamp || `${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

        setHistoricalMeals(sortedMeals);
      } catch (error) {
        console.error('Error loading historical meals:', error);
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

  // Click away handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter meals based on search query
  const filteredMeals = useMemo(() => {
    let meals = [...historicalMeals];
    
    // Filter by search query
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

  const handleSearch = (newValue: string) => {
    // Update internal state if not controlled
    if (value === undefined) {
      setInternalSearchQuery(newValue);
    }
    // Show results if there's a search query OR if there are popular meals to show
    setShowResults(newValue.length > 0 || popularMeals.length > 0);
    onSearchChange(newValue);
  };

  const handleSelectFood = (food: LoggedFood) => {
    console.log('FoodSearchWithHistory - handleSelectFood called with:', food.name);
    console.log('Current value prop:', value);
    // Close dropdown and call parent's onSelectFood
    setShowResults(false);
    onSelectFood(food);
    // Parent will handle updating the search field through the value prop
  };



  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-10 pr-4 h-12 text-base text-gray-900 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-brand-yellow focus:ring-brand-yellow placeholder:text-gray-500"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full mt-2 left-0 right-0 z-[9999] p-0 shadow-2xl border border-gray-300 bg-white overflow-hidden max-h-[400px]">
          <ScrollArea className="h-full max-h-[400px] bg-white">
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
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-brand-blue">
                          {meal.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700">
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {meal.calories} cal
                          </span>
                          <Badge 
                            className={`text-white border-0 text-xs px-2 py-0 ${
                              meal.mealType === 'breakfast' ? 'bg-orange-500' :
                              meal.mealType === 'lunch' ? 'bg-blue-500' :
                              meal.mealType === 'dinner' ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`}
                          >
                            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                          </Badge>
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
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-brand-blue">
                          {meal.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700">
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {meal.calories} cal
                          </span>
                          <Badge 
                            className={`text-white border-0 text-xs px-2 py-0 ${
                              meal.mealType === 'breakfast' ? 'bg-orange-500' :
                              meal.mealType === 'lunch' ? 'bg-blue-500' :
                              meal.mealType === 'dinner' ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`}
                          >
                            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-brand-blue" />
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-700 font-medium">No matching meals found</p>
                <p className="text-xs text-gray-600 mt-1">Try searching in the USDA database</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-700 font-medium">No meals logged yet</p>
                <p className="text-xs text-gray-600 mt-1">Start logging meals to see them here</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}