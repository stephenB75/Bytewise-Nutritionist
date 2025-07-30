import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ChefHat, Plus, Search, Clock, Users, Trash2, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCalories } from '@/lib/utils';
import { useDragDrop } from '@/components/DragDropProvider';
import { ImageWithFallback } from '@/components/ImageWithFallback';

interface RecipeBuilderProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function RecipeBuilder({ onNavigate, showToast, notifications, setNotifications }: RecipeBuilderProps) {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [instructions, setInstructions] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([]);
  
  const queryClient = useQueryClient();
  const { isDragging, setIsDragging, draggedItem, setDraggedItem } = useDragDrop();

  // Fetch foods for search
  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['/api/foods', searchQuery],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: async (recipeData: any) => {
      return apiRequest('POST', '/api/recipes', recipeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      resetForm();
      showToast('Recipe created successfully!');
    },
    onError: () => {
      showToast('Failed to create recipe. Please try again.', 'destructive');
    },
  });

  // Mock food search results
  const mockFoods = [
    {
      id: 1,
      name: 'Chicken Breast',
      brand: 'Fresh',
      category: 'Protein',
      servingSize: '100g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
    {
      id: 2,
      name: 'Brown Rice',
      brand: 'Organic',
      category: 'Grains',
      servingSize: '1 cup cooked',
      calories: 218,
      protein: 5,
      carbs: 45,
      fat: 1.8,
    },
    {
      id: 3,
      name: 'Broccoli',
      brand: 'Fresh',
      category: 'Vegetables',
      servingSize: '1 cup',
      calories: 25,
      protein: 3,
      carbs: 5,
      fat: 0.3,
    },
    {
      id: 4,
      name: 'Olive Oil',
      brand: 'Extra Virgin',
      category: 'Oils',
      servingSize: '1 tbsp',
      calories: 120,
      protein: 0,
      carbs: 0,
      fat: 14,
    },
  ];

  const filteredFoods = (foods as any) || (searchQuery.length > 0 ? mockFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []);

  const addIngredient = (food: any) => {
    const newIngredient = {
      ...food,
      quantity: 1,
      unit: 'serving',
      order: ingredients.length
    };
    setIngredients(prev => [...prev, newIngredient]);
    showToast(`${food.name} added to recipe`);
    setSearchQuery('');
  };

  const removeIngredient = (index: number) => {
    const ingredient = ingredients[index];
    setIngredients(prev => prev.filter((_, i) => i !== index));
    showToast(`${ingredient.name} removed from recipe`);
  };

  const updateIngredientQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    setIngredients(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const updateIngredientUnit = (index: number, unit: string) => {
    setIngredients(prev => prev.map((item, i) => 
      i === index ? { ...item, unit } : item
    ));
  };

  const calculateNutritionTotals = () => {
    return ingredients.reduce((totals, ingredient) => ({
      calories: totals.calories + (ingredient.calories * ingredient.quantity),
      protein: totals.protein + (ingredient.protein * ingredient.quantity),
      carbs: totals.carbs + (ingredient.carbs * ingredient.quantity),
      fat: totals.fat + (ingredient.fat * ingredient.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const calculatePerServing = () => {
    const totals = calculateNutritionTotals();
    return {
      calories: totals.calories / servings,
      protein: totals.protein / servings,
      carbs: totals.carbs / servings,
      fat: totals.fat / servings,
    };
  };

  const resetForm = () => {
    setRecipeName('');
    setDescription('');
    setServings(4);
    setPrepTime(15);
    setCookTime(30);
    setInstructions('');
    setIngredients([]);
    setSearchQuery('');
  };

  const saveRecipe = () => {
    if (!recipeName.trim()) {
      showToast('Please enter a recipe name', 'destructive');
      return;
    }

    if (ingredients.length === 0) {
      showToast('Please add at least one ingredient', 'destructive');
      return;
    }

    const totals = calculateNutritionTotals();
    const recipeData = {
      name: recipeName,
      description,
      servings,
      prepTime,
      cookTime,
      instructions,
      ingredients: ingredients.map(ing => ({
        foodId: ing.id,
        quantity: ing.quantity,
        unit: ing.unit,
        order: ing.order
      })),
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    };

    createRecipeMutation.mutate(recipeData);
  };

  const totals = calculateNutritionTotals();
  const perServing = calculatePerServing();

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, ingredient: any, index: number) => {
    setIsDragging(true);
    setDraggedItem({ ingredient, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { index: dragIndex } = draggedItem;
    if (dragIndex === dropIndex) return;

    const newIngredients = [...ingredients];
    const [draggedIngredient] = newIngredients.splice(dragIndex, 1);
    newIngredients.splice(dropIndex, 0, draggedIngredient);
    
    // Update order
    const updatedIngredients = newIngredients.map((ing, idx) => ({
      ...ing,
      order: idx
    }));
    
    setIngredients(updatedIngredients);
    setIsDragging(false);
    setDraggedItem(null);
    showToast('Ingredient order updated');
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold brand-text-primary mb-2">Recipe Builder</h1>
        <p className="text-muted-foreground">Create and save your custom recipes</p>
      </div>

      {/* Recipe Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <span>Recipe Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipe-name">Recipe Name *</Label>
            <Input
              id="recipe-name"
              placeholder="Enter recipe name..."
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="touch-target"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="touch-target"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="touch-target"
              />
            </div>
            <div>
              <Label htmlFor="prep-time">Prep Time (min)</Label>
              <Input
                id="prep-time"
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                className="touch-target"
              />
            </div>
            <div>
              <Label htmlFor="cook-time">Cook Time (min)</Label>
              <Input
                id="cook-time"
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                className="touch-target"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Add Ingredients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 touch-target"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {(filteredFoods || []).map((food: any) => (
                <div
                  key={food.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer touch-target"
                  onClick={() => addIngredient(food)}
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
              {(filteredFoods || []).length === 0 && !foodsLoading && (
                <p className="text-center text-muted-foreground py-4">
                  No ingredients found. Try a different search term.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipe Ingredients */}
      {ingredients.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Recipe Ingredients ({ingredients.length})</span>
              </span>
              <Badge className="text-xs">
                {formatCalories(totals.calories)} total calories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ingredient, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    isDragging ? 'opacity-70' : ''
                  } hover:bg-muted/50 cursor-move`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{ingredient.name}</h4>
                    <p className="text-xs text-muted-foreground">{ingredient.category}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredientQuantity(index, parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 text-sm"
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredientUnit(index, e.target.value)}
                      className="px-2 py-1 border rounded text-sm bg-background"
                    >
                      <option value="serving">serving</option>
                      <option value="cup">cup</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="oz">oz</option>
                      <option value="g">g</option>
                      <option value="piece">piece</option>
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Summary */}
            <div className="bg-primary/10 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Nutrition Per Serving ({servings} servings)
              </h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{formatCalories(perServing.calories)}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-chart-2">{Math.round(perServing.protein)}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-chart-3">{Math.round(perServing.carbs)}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-chart-1">{Math.round(perServing.fat)}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Cooking Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter step-by-step cooking instructions..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-[120px] touch-target"
          />
        </CardContent>
      </Card>

      {/* Save Recipe */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={resetForm}
          className="flex-1 touch-target"
        >
          Clear All
        </Button>
        <Button
          onClick={saveRecipe}
          disabled={createRecipeMutation.isPending || !recipeName.trim() || ingredients.length === 0}
          className="flex-1 touch-target btn-animate"
        >
          <Save className="h-4 w-4 mr-2" />
          {createRecipeMutation.isPending ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>
    </div>
  );
}