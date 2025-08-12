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
      <Card className={`p-6 border-2 border-[#faed39] shadow-xl ${className}`}>
        <h3 className="text-lg font-bold text-[#1f4aa6] mb-4">Quick Add from History</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#1f4aa6]" />
          <span className="ml-2 text-sm text-gray-600">Loading meal history...</span>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`p-6 border-2 border-[#faed39] shadow-xl ${className}`}>
        <h3 className="text-lg font-bold text-[#1f4aa6] mb-4">Quick Add from History</h3>
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
    <Card className={`p-6 border-2 border-[#faed39] shadow-xl ${className}`}>
      <h3 className="text-lg font-bold text-[#1f4aa6] mb-4">Quick Add from History</h3>
      
      {frequentMeals.length === 0 && recentMeals.length === 0 ? (
        <div className="text-center py-4">
          <Utensils className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No meal history yet. Start logging foods to see quick add suggestions here!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Stack all meals vertically */}
          {[...frequentMeals, ...recentMeals].map((meal, index) => {
            const isFrequent = index < frequentMeals.length;
            return (
              <Button
                key={`meal-${meal.id}-${index}`}
                variant="ghost"
                onClick={() => onSelectFood(meal)}
                className="w-full h-auto p-3 flex items-center justify-between hover:bg-[#faed39]/10 hover:border-[#faed39] border-2 border-transparent transition-all group"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {isFrequent ? (
                    <TrendingUp className="h-4 w-4 text-[#faed39] flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-[#1f4aa6] flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-[#0a0a00] text-sm">{meal.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600">{meal.calories} cal</span>
                      <span className="text-xs text-gray-500">P: {meal.protein}g</span>
                      <span className="text-xs text-gray-500">C: {meal.carbs}g</span>
                      <span className="text-xs text-gray-500">F: {meal.fat}g</span>
                      {isFrequent && meal.frequency && meal.frequency > 1 && (
                        <Badge className="bg-[#45c73e] text-white border-0 text-xs px-2 py-0">
                          {meal.frequency}x
                        </Badge>
                      )}
                      {!isFrequent && (
                        <Badge className="bg-[#1f4aa6] text-white border-0 text-xs px-2 py-0">
                          {meal.mealType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Plus className="h-5 w-5 text-[#1f4aa6] group-hover:text-[#45c73e] transition-colors" />
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
}