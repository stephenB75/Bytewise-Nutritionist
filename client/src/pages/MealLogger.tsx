import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useDragDrop } from '@/components/DragDropProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IngredientCard } from '@/components/IngredientCard';
import { MealCard } from '@/components/MealCard';
import { ArrowLeft, Search, Camera, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Food } from '@shared/schema';

interface MealLoggerProps {
  onNavigate: (page: string) => void;
}

export default function MealLogger({ onNavigate }: MealLoggerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setOnDrop } = useDragDrop();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [currentMeal, setCurrentMeal] = useState<any>(null);

  // Search foods
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/foods/search', { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  // Popular foods
  const { data: popularFoods } = useQuery({
    queryKey: ['/api/foods/popular'],
  });

  // Today's meals
  const today = new Date().toISOString().split('T')[0];
  const { data: todayMeals } = useQuery({
    queryKey: ['/api/meals', { startDate: today, endDate: today }],
    enabled: !!user,
  });

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      const response = await apiRequest('POST', '/api/meals', mealData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Meal logged successfully",
        description: "Your meal has been added to your diary",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add food to meal mutation
  const addFoodToMealMutation = useMutation({
    mutationFn: async ({ mealId, foodData }: { mealId: number; foodData: any }) => {
      const response = await apiRequest('POST', `/api/meals/${mealId}/foods`, foodData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });

  // Set up drop handler for drag and drop
  useEffect(() => {
    setOnDrop((food: Food) => {
      handleAddFood(food);
    });
  }, [currentMeal, selectedMealType]);

  const handleAddFood = async (food: Food) => {
    try {
      let meal = currentMeal;
      
      // Create meal if it doesn't exist
      if (!meal) {
        const mealData = {
          date: new Date(),
          mealType: selectedMealType,
          name: `${selectedMealType} meal`,
          totalCalories: '0',
          totalProtein: '0',
          totalCarbs: '0',
          totalFat: '0',
        };
        
        meal = await createMealMutation.mutateAsync(mealData);
        setCurrentMeal(meal);
      }

      // Add food to meal
      const foodData = {
        foodId: food.id,
        quantity: '1',
        unit: food.servingSize,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      };

      await addFoodToMealMutation.mutateAsync({
        mealId: meal.id,
        foodData,
      });

      toast({
        title: "Food added",
        description: `${food.name} added to your ${selectedMealType}`,
      });
    } catch (error) {
      toast({
        title: "Error adding food",
        description: "Failed to add food to meal",
        variant: "destructive",
      });
    }
  };

  const quickAddFoods = [
    { name: 'Water', calories: 0, unit: '1 glass' },
    { name: 'Coffee', calories: 5, unit: '1 cup' },
    { name: 'Banana', calories: 105, unit: '1 medium' },
  ];

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '☀️' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
    { id: 'snack', label: 'Snack', emoji: '🍿' },
  ];

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-surface p-4 card-shadow">
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full p-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold flex-1">Find Food</h1>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full p-0"
          >
            <Camera size={20} />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Search foods, recipes, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 touch-target"
          />
        </div>

        {/* Meal Type Selector */}
        <div className="flex space-x-2 overflow-x-auto">
          {mealTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedMealType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMealType(type.id)}
              className="flex items-center space-x-1 whitespace-nowrap"
            >
              <span>{type.emoji}</span>
              <span>{type.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Add Pills */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Add</h2>
          <div className="flex flex-wrap gap-2">
            {quickAddFoods.map((food) => (
              <Button
                key={food.name}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 touch-target"
                onClick={() => {
                  // Handle quick add
                  toast({
                    title: "Quick add",
                    description: `${food.name} added to ${selectedMealType}`,
                  });
                }}
              >
                <span>{food.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {food.calories} cal
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            {isSearching ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((food: Food) => (
                  <IngredientCard
                    key={food.id}
                    food={food}
                    onClick={() => handleAddFood(food)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No foods found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Popular Foods */}
        {!searchQuery && popularFoods && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Popular Foods</h2>
            <div className="space-y-3">
              {popularFoods.map((food: Food) => (
                <IngredientCard
                  key={food.id}
                  food={food}
                  onClick={() => handleAddFood(food)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's Meals */}
        {todayMeals && todayMeals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Today's Meals</h2>
            <div className="space-y-3">
              {todayMeals.map((meal: any) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (!popularFoods || popularFoods.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm mb-4">Start by searching for foods above</p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery('chicken')}
            >
              Try searching "chicken"
            </Button>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
