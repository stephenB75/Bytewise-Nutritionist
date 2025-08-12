/**
 * Logged Food Suggestions Component
 * 
 * Shows frequently logged foods from database as suggestions for quick re-logging
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Clock,
  Utensils,
  Plus,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LoggedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  frequency?: number;
}

interface LoggedFoodSuggestionsProps {
  onSelectFood: (food: LoggedFood) => void;
  className?: string;
}

interface MealHistoryResponse {
  frequentMeals: LoggedFood[];
  recentMeals: LoggedFood[];
}

export function LoggedFoodSuggestions({
  onSelectFood,
  className = ""
}: LoggedFoodSuggestionsProps) {
  // Fetch meal history from database
  const { data, isLoading, error, isSuccess } = useQuery<MealHistoryResponse>({
    queryKey: ['/api/meals/history'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  const frequentMeals = data?.frequentMeals || [];
  const recentMeals = data?.recentMeals || [];

  // Show loading state
  if (isLoading) {
    return (
      <Card className={`p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Add from History</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading meal history...</span>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Add from History</h3>
        <div className="text-center py-4">
          <Utensils className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Unable to load meal history. Please try again later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Add from History</h3>
      
      {frequentMeals.length === 0 && recentMeals.length === 0 ? (
        <div className="text-center py-4">
          <Utensils className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No meal history yet. Start logging foods to see quick add suggestions here!
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Combine all meals in a single row */}
          {[...frequentMeals, ...recentMeals].map((meal, index) => {
            const isFrequent = index < frequentMeals.length;
            return (
              <Button
                key={`meal-${meal.id}-${index}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectFood(meal)}
                className="flex-shrink-0 min-w-[200px] h-auto p-3 flex flex-col items-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">{meal.name}</span>
                  <Plus className="h-4 w-4 text-gray-400 ml-2" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {isFrequent ? (
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                  ) : (
                    <Clock className="h-3 w-3 text-blue-500" />
                  )}
                  <span>{meal.calories} cal</span>
                  {isFrequent && meal.frequency && meal.frequency > 1 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {meal.frequency}x
                    </Badge>
                  )}
                  {!isFrequent && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {meal.mealType}
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
}