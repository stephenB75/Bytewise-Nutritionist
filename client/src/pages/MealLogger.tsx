import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Clock, Utensils, Coffee, Moon, Flame } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCalories, formatDate, getTodayDateString } from '@/lib/utils';
import { useDragDrop } from '@/components/DragDropProvider';
import { ImageWithFallback } from '@/components/ImageWithFallback';

interface MealLoggerProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function MealLogger({ onNavigate, showToast, notifications, setNotifications }: MealLoggerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [currentMeal, setCurrentMeal] = useState<any[]>([]);
  
  const queryClient = useQueryClient();
  const { isDragging, setIsDragging } = useDragDrop();

  // Fetch foods for search
  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['/api/foods', searchQuery],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  // Fetch today's meals
  const { data: todayMeals } = useQuery({
    queryKey: ['/api/meals/today'],
    retry: false,
  });

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      return apiRequest('POST', '/api/meals', mealData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      setCurrentMeal([]);
      showToast('Meal logged successfully!');
    },
    onError: () => {
      showToast('Failed to log meal. Please try again.', 'destructive');
    },
  });

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, time: '7:00 AM' },
    { id: 'lunch', label: 'Lunch', icon: Utensils, time: '12:00 PM' },
    { id: 'dinner', label: 'Dinner', icon: Utensils, time: '7:00 PM' },
    { id: 'snack', label: 'Snack', icon: Moon, time: 'Anytime' },
  ];

  // Mock food search results
  const mockFoods = [
    {
      id: 1,
      name: 'Banana',
      brand: 'Fresh',
      category: 'Fruits',
      servingSize: '1 medium',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
    },
    {
      id: 2,
      name: 'Greek Yogurt',
      brand: 'Chobani',
      category: 'Dairy',
      servingSize: '1 cup',
      calories: 130,
      protein: 20,
      carbs: 9,
      fat: 0,
    },
    {
      id: 3,
      name: 'Oatmeal',
      brand: 'Quaker',
      category: 'Grains',
      servingSize: '1/2 cup dry',
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
    },
  ];

  const filteredFoods = (foods as any) || (searchQuery.length > 0 ? mockFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []);

  const addFoodToMeal = (food: any) => {
    setCurrentMeal(prev => [...prev, { ...food, quantity: 1 }]);
    showToast(`${food.name} added to ${selectedMealType}`);
  };

  const removeFoodFromMeal = (index: number) => {
    const food = currentMeal[index];
    setCurrentMeal(prev => prev.filter((_, i) => i !== index));
    showToast(`${food.name} removed from meal`);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    setCurrentMeal(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const calculateMealTotals = () => {
    return currentMeal.reduce((totals, item) => ({
      calories: totals.calories + (item.calories * item.quantity),
      protein: totals.protein + (item.protein * item.quantity),
      carbs: totals.carbs + (item.carbs * item.quantity),
      fat: totals.fat + (item.fat * item.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const saveMeal = () => {
    if (currentMeal.length === 0) {
      showToast('Please add some food to your meal first', 'destructive');
      return;
    }

    const totals = calculateMealTotals();
    const mealData = {
      mealType: selectedMealType,
      date: getTodayDateString(),
      foods: currentMeal,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    };

    createMealMutation.mutate(mealData);
  };

  const totals = calculateMealTotals();

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold brand-text-primary mb-2">Meal Logger</h1>
        <p className="text-muted-foreground">Track your daily food intake</p>
      </div>

      {/* Meal Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Select Meal Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {mealTypes.map((mealType) => (
              <Button
                key={mealType.id}
                variant={selectedMealType === mealType.id ? 'default' : 'outline'}
                className="h-16 flex flex-col items-center justify-center space-y-1 touch-target"
                onClick={() => setSelectedMealType(mealType.id)}
              >
                <mealType.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{mealType.label}</span>
                <span className="text-xs text-muted-foreground">{mealType.time}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Food Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Search Foods</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for foods, brands, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 touch-target"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(filteredFoods as any).map((food: any) => (
                <div
                  key={food.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer touch-target"
                  onClick={() => addFoodToMeal(food)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{food.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {food.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {food.brand} • {food.servingSize}
                    </p>
                    <div className="flex space-x-3 text-xs">
                      <span className="font-medium">{formatCalories(food.calories)} cal</span>
                      <span className="text-chart-2">{food.protein}g protein</span>
                      <span className="text-chart-3">{food.carbs}g carbs</span>
                      <span className="text-chart-1">{food.fat}g fat</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(filteredFoods as any).length === 0 && !foodsLoading && (
                <p className="text-center text-muted-foreground py-4">
                  No foods found. Try a different search term.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Meal */}
      {currentMeal.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-primary" />
                <span>Current {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</span>
              </span>
              <Badge className="text-xs">
                {formatCalories(totals.calories)} calories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {currentMeal.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFoodFromMeal(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Meal Totals */}
            <div className="bg-primary/10 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{formatCalories(totals.calories)}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-chart-2">{Math.round(totals.protein)}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-chart-3">{Math.round(totals.carbs)}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-chart-1">{Math.round(totals.fat)}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
            </div>

            <Button
              onClick={saveMeal}
              disabled={createMealMutation.isPending}
              className="w-full touch-target btn-animate"
            >
              {createMealMutation.isPending ? 'Saving...' : 'Save Meal'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Add Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 touch-target"
              onClick={() => onNavigate('recipe-builder')}
            >
              Add Recipe
            </Button>
            <Button
              variant="outline"
              className="h-12 touch-target"
              onClick={() => showToast('Barcode scanner coming soon!')}
            >
              Scan Barcode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}