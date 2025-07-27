import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useDragDrop } from '@/components/DragDropProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { IngredientCard } from '@/components/IngredientCard';
import { RecipeNutritionSummary } from '@/components/RecipeNutritionSummary';
import { ArrowLeft, Save, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Food, Recipe, RecipeIngredient } from '@shared/schema';
import { isUnauthorizedError } from '@/lib/authUtils';

interface RecipeBuilderProps {
  onNavigate: (page: string) => void;
}

interface RecipeFormData {
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  instructions: string;
}

interface RecipeIngredientWithFood extends RecipeIngredient {
  food: Food;
}

export default function RecipeBuilder({ onNavigate }: RecipeBuilderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setOnDrop } = useDragDrop();

  const [recipe, setRecipe] = useState<RecipeFormData>({
    name: 'My Protein Bowl',
    description: '',
    servings: 2,
    prepTime: 15,
    cookTime: 0,
    instructions: '',
  });

  const [ingredients, setIngredients] = useState<RecipeIngredientWithFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddIngredient, setShowAddIngredient] = useState(false);

  // Search foods for adding ingredients
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/foods/search', { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  // Popular foods
  const { data: popularFoods } = useQuery({
    queryKey: ['/api/foods/popular'],
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: async (recipeData: any) => {
      const response = await apiRequest('POST', '/api/recipes', recipeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Recipe saved successfully",
        description: "Your recipe has been saved to your collection",
      });
      setRecipe({
        name: 'My Protein Bowl',
        description: '',
        servings: 2,
        prepTime: 15,
        cookTime: 0,
        instructions: '',
      });
      setIngredients([]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error saving recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up drop handler for drag and drop
  useEffect(() => {
    setOnDrop((food: Food) => {
      handleAddIngredient(food);
    });
  }, [ingredients]);

  const handleAddIngredient = (food: Food) => {
    const existingIngredient = ingredients.find(ing => ing.foodId === food.id);
    
    if (existingIngredient) {
      // Increase quantity if already exists
      setIngredients(prev => prev.map(ing => 
        ing.foodId === food.id 
          ? { ...ing, quantity: String(Number(ing.quantity) + 1) }
          : ing
      ));
    } else {
      // Add new ingredient
      const newIngredient: RecipeIngredientWithFood = {
        id: Date.now(), // Temporary ID
        recipeId: 0, // Will be set when recipe is saved
        foodId: food.id!,
        quantity: '1',
        unit: food.servingSize,
        order: ingredients.length,
        food,
      };
      setIngredients(prev => [...prev, newIngredient]);
    }

    toast({
      title: "Ingredient added",
      description: `${food.name} added to recipe`,
    });
  };

  const handleRemoveIngredient = (foodId: number) => {
    setIngredients(prev => prev.filter(ing => ing.foodId !== foodId));
    toast({
      title: "Ingredient removed",
      description: "Ingredient removed from recipe",
    });
  };

  const handleUpdateQuantity = (foodId: number, quantity: string, unit: string) => {
    setIngredients(prev => prev.map(ing => 
      ing.foodId === foodId 
        ? { ...ing, quantity, unit }
        : ing
    ));
  };

  const calculateNutrition = () => {
    const totals = ingredients.reduce((acc, ingredient) => {
      const multiplier = Number(ingredient.quantity) || 0;
      const servingMultiplier = ingredient.food.servingSizeGrams 
        ? multiplier / Number(ingredient.food.servingSizeGrams) 
        : multiplier;

      return {
        calories: acc.calories + (Number(ingredient.food.calories) * servingMultiplier),
        protein: acc.protein + (Number(ingredient.food.protein) * servingMultiplier),
        carbs: acc.carbs + (Number(ingredient.food.carbs) * servingMultiplier),
        fat: acc.fat + (Number(ingredient.food.fat) * servingMultiplier),
        fiber: acc.fiber + (Number(ingredient.food.fiber) * servingMultiplier),
        sugar: acc.sugar + (Number(ingredient.food.sugar) * servingMultiplier),
        sodium: acc.sodium + (Number(ingredient.food.sodium) * servingMultiplier),
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });

    return totals;
  };

  const handleSaveRecipe = async () => {
    if (!recipe.name.trim()) {
      toast({
        title: "Recipe name required",
        description: "Please enter a name for your recipe",
        variant: "destructive",
      });
      return;
    }

    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add at least one ingredient to your recipe",
        variant: "destructive",
      });
      return;
    }

    const nutrition = calculateNutrition();
    
    const recipeData = {
      ...recipe,
      totalCalories: nutrition.calories.toString(),
      totalProtein: nutrition.protein.toString(),
      totalCarbs: nutrition.carbs.toString(),
      totalFat: nutrition.fat.toString(),
      totalFiber: nutrition.fiber.toString(),
      totalSugar: nutrition.sugar.toString(),
      totalSodium: nutrition.sodium.toString(),
    };

    await createRecipeMutation.mutateAsync(recipeData);
  };

  const nutrition = calculateNutrition();

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-surface p-4 card-shadow">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full p-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold flex-1">Recipe Builder</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveRecipe}
            disabled={createRecipeMutation.isPending}
            className="w-10 h-10 rounded-full p-0"
          >
            <Save size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Recipe Info */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recipe Details</h2>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Recipe name..."
              value={recipe.name}
              onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
              className="touch-target"
            />
            <Textarea
              placeholder="Description (optional)..."
              value={recipe.description}
              onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
              className="touch-target min-h-[80px]"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Servings</label>
                <Input
                  type="number"
                  min="1"
                  value={recipe.servings}
                  onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  className="touch-target"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Prep (min)</label>
                <Input
                  type="number"
                  min="0"
                  value={recipe.prepTime}
                  onChange={(e) => setRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                  className="touch-target"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Cook (min)</label>
                <Input
                  type="number"
                  min="0"
                  value={recipe.cookTime}
                  onChange={(e) => setRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                  className="touch-target"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Ingredients Section */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Ingredients</h2>
          
          {/* Drop Zone */}
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 mb-4 text-center bg-muted/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Drop ingredients here</p>
            <p className="text-xs text-muted-foreground">Or tap to add manually</p>
          </div>

          {/* Current Ingredients */}
          <div className="space-y-3">
            {ingredients.length > 0 && (
              <h3 className="font-medium text-sm">Added Ingredients</h3>
            )}
            
            {ingredients.map((ingredient) => (
              <div key={ingredient.foodId} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{ingredient.food.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{ingredient.quantity} {ingredient.unit}</span>
                    <span>{Math.round(Number(ingredient.food.calories) * Number(ingredient.quantity))} cal</span>
                    <span>{Math.round(Number(ingredient.food.protein) * Number(ingredient.quantity))}g protein</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => {
                      const newQuantity = prompt('Enter quantity:', ingredient.quantity);
                      if (newQuantity && !isNaN(Number(newQuantity))) {
                        handleUpdateQuantity(ingredient.foodId, newQuantity, ingredient.unit);
                      }
                    }}
                  >
                    <Edit size={12} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => handleRemoveIngredient(ingredient.foodId)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-4 touch-target"
            onClick={() => setShowAddIngredient(!showAddIngredient)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More Ingredients
          </Button>
        </Card>

        {/* Add Ingredient Panel */}
        {showAddIngredient && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Add Ingredient</h3>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search for ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="touch-target"
              />
            </div>

            {searchQuery.length > 2 ? (
              <div className="space-y-2">
                {isSearching ? (
                  <p className="text-center text-muted-foreground">Searching...</p>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((food: Food) => (
                    <IngredientCard
                      key={food.id}
                      food={food}
                      onClick={() => {
                        handleAddIngredient(food);
                        setSearchQuery('');
                        setShowAddIngredient(false);
                      }}
                      draggable={false}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No ingredients found</p>
                )}
              </div>
            ) : popularFoods ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Popular Ingredients</p>
                {popularFoods.slice(0, 3).map((food: Food) => (
                  <IngredientCard
                    key={food.id}
                    food={food}
                    onClick={() => {
                      handleAddIngredient(food);
                      setShowAddIngredient(false);
                    }}
                    draggable={false}
                  />
                ))}
              </div>
            ) : null}
          </Card>
        )}

        {/* Nutrition Summary */}
        {ingredients.length > 0 && (
          <RecipeNutritionSummary
            nutrition={nutrition}
            servings={recipe.servings}
          />
        )}

        {/* Instructions */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <Textarea
            placeholder="Enter cooking instructions..."
            value={recipe.instructions}
            onChange={(e) => setRecipe(prev => ({ ...prev, instructions: e.target.value }))}
            className="touch-target min-h-[120px]"
          />
        </Card>

        {/* Save Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="touch-target"
            onClick={() => {
              // Save as draft logic could go here
              toast({
                title: "Draft saved",
                description: "Recipe saved as draft",
              });
            }}
          >
            Save Draft
          </Button>
          <Button
            className="touch-target"
            onClick={handleSaveRecipe}
            disabled={createRecipeMutation.isPending}
          >
            {createRecipeMutation.isPending ? 'Saving...' : 'Save Recipe'}
          </Button>
        </div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
