/**
 * Recent custom food entries for the Tracker calculator.
 * Filters out USDA database entries; shows only user-logged foods.
 */

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User,
  History,
  ChevronRight,
  ChevronDown,
  Utensils,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time?: string;
  loggedAt?: string | null;
  mealType: MealType;
  source?: string;
}

interface UserFoodSuggestionsProps {
  /** Called when a suggestion is picked; ignored when onAddFood is set. */
  onSelectFood?: (food: UserFood) => void;
  /** Lets the user add the food to today's log right here instead of going to another page. */
  onAddFood?: (food: UserFood, mealType: MealType) => Promise<void>;
  className?: string;
  /** When provided, suggestions come from app state (e.g. API) instead of localStorage only */
  meals?: UserFood[];
  /** Journal already lists Logged Today, so skip the overlapping recent list there. */
  showRecentEntries?: boolean;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function mealTypeForNow(date = new Date()): MealType {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snack';
}

// "2026-09-29" parsed by Date is midnight UTC, which is the previous evening in the US.
function parseDay(dateStr: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T12:00:00`) : new Date(dateStr);
}

function entryTime(food: UserFood): number {
  return (food.loggedAt && Date.parse(food.loggedAt)) || parseDay(food.date).getTime() || 0;
}

export function UserFoodSuggestions({
  onSelectFood,
  onAddFood,
  className = "",
  meals,
  showRecentEntries = true,
}: UserFoodSuggestionsProps) {
  const [userFoods, setUserFoods] = useState<UserFood[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(mealTypeForNow());
  const [adding, setAdding] = useState(false);

  // Load user-entered foods only
  useEffect(() => {
    const loadUserFoods = () => {
      try {
        const storedMeals =
          meals !== undefined
            ? meals
            : JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        
        // Filter to only user-entered foods (not from USDA database)
        const userEnteredFoods = storedMeals.filter((meal: UserFood) => 
          meal.source !== 'usda' && meal.source !== 'database'
        );
        
        // Sort by date (newest first)
        const sortedFoods = [...userEnteredFoods].sort((a: UserFood, b: UserFood) => entryTime(b) - entryTime(a));

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
  }, [meals]);

  // Unique foods by name, newest first (recent entries only)
  const uniqueFoods = useMemo(() => {
    const byName = new Map<string, UserFood>();
    userFoods.forEach((food) => {
      const key = food.name.toLowerCase().trim();
      const existing = byName.get(key);
      if (!existing || entryTime(food) > entryTime(existing)) {
        byName.set(key, food);
      }
    });
    return Array.from(byName.values())
      .sort((a, b) => entryTime(b) - entryTime(a))
      .slice(0, 4);
  }, [userFoods]);

  const getDateLabel = (dateStr: string) => {
    const date = parseDay(dateStr);
    const today = new Date();
    
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    
    const days = differenceInDays(today, date);
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return format(date, 'MMM d');
  };

  const handleSelectFood = (food: UserFood, key: string) => {
    if (!onAddFood) {
      onSelectFood?.(food);
      return;
    }
    if (expandedKey === key) {
      setExpandedKey(null);
      return;
    }
    setMealType(mealTypeForNow());
    setExpandedKey(key);
  };

  const handleAdd = async (food: UserFood) => {
    if (!onAddFood) return;
    setAdding(true);
    try {
      await onAddFood(food, mealType);
      setExpandedKey(null);
    } finally {
      setAdding(false);
    }
  };

  const renderAddPanel = (food: UserFood) => (
    <div className="mt-2 rounded-lg bg-white/80 p-3 ring-1 ring-orange-200" data-testid="suggestion-add-panel">
      <p className="text-xs font-medium text-gray-700 mb-2">Add to today as</p>
      <div className="flex flex-wrap gap-1.5 mb-3" role="radiogroup" aria-label="Meal type">
        {MEAL_TYPES.map(type => (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={mealType === type}
            onClick={() => setMealType(type)}
            className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium capitalize ring-1 transition-colors ${
              mealType === type
                ? 'on-color bg-orange-600 ring-orange-600'
                : 'bg-white text-gray-800 ring-gray-300 hover:bg-orange-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => handleAdd(food)}
          disabled={adding}
          className="on-color flex-1 bg-orange-700 hover:bg-orange-800 disabled:opacity-75"
          data-testid="button-add-suggestion"
        >
          {adding ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
          Add {Math.round(Number(food.calories) || 0)} cal to today
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setExpandedKey(null)} disabled={adding}>
          Cancel
        </Button>
      </div>
    </div>
  );

  if (!showRecentEntries || uniqueFoods.length === 0) {
    if (!showRecentEntries) return null;
    return (
      <Card className={`p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-0 shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <h3 className="text-lg font-semibold mb-2">No Custom Foods Yet</h3>
          <p className="text-sm">Log a meal to see it here for quick reuse</p>
        </div>
      </Card>
    );
  }

  const chevron = (open: boolean) => onAddFood
    ? (open ? <ChevronDown className="h-4 w-4 text-orange-600" /> : <Plus className="h-4 w-4 text-gray-700 group-hover:text-orange-600" />)
    : <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-blue-600" />;

  return (
    <Card className={`p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-0 shadow-lg ${className}`} data-testid="tracker-recent-entries">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <History className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent Entries</h3>
          <p className="text-sm text-gray-600">
            {onAddFood ? 'Tap a food to add it to today' : 'Tap to fill the calculator'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {uniqueFoods.map((food) => {
          const key = `recent-${food.id}`;
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => handleSelectFood(food, key)}
                aria-expanded={onAddFood ? expandedKey === key : undefined}
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
                        {Math.round(Number(food.calories) || 0)} cal
                      </span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {food.mealType}
                      </Badge>
                    </div>
                  </div>
                  {chevron(expandedKey === key)}
                </div>
              </button>
              {expandedKey === key && renderAddPanel(food)}
            </div>
          );
        })}
      </div>
      {uniqueFoods.length >= 4 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">Showing your 4 most recent custom foods</p>
        </div>
      )}
    </Card>
  );
}
