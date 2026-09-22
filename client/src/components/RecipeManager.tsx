import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { RecipeNutritionSummary } from '@/components/RecipeNutritionSummary';
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { FREE_LIMITS } from '@/lib/usageLimits';
import { getLocalDateKey, getMealTypeByTime } from '@/utils/dateUtils';
import { Plus, Trash2, Utensils, BookOpen } from 'lucide-react';

interface RecipeRecord {
  id: number;
  name: string;
  description?: string | null;
  servings: number;
  instructions?: string | null;
  totalCalories?: string | number | null;
  totalProtein?: string | number | null;
  totalCarbs?: string | number | null;
  totalFat?: string | number | null;
}

const emptyForm = {
  name: '',
  description: '',
  servings: 1,
  instructions: '',
  totalCalories: '',
  totalProtein: '',
  totalCarbs: '',
  totalFat: '',
};

export function RecipeManager() {
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery<{ recipes: RecipeRecord[] }>({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/recipes');
      return response.json();
    },
  });

  const recipes = data?.recipes || [];
  const atFreeLimit = !isPremium && recipes.length >= FREE_LIMITS.recipes;

  const createRecipe = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/recipes', {
        name: form.name.trim(),
        description: form.description.trim(),
        servings: Number(form.servings) || 1,
        instructions: form.instructions.trim(),
        totalCalories: Number(form.totalCalories) || 0,
        totalProtein: Number(form.totalProtein) || 0,
        totalCarbs: Number(form.totalCarbs) || 0,
        totalFat: Number(form.totalFat) || 0,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      setForm(emptyForm);
      setShowForm(false);
      toast({ title: 'Recipe saved', description: 'Your recipe is ready to log as a meal.' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Could not save recipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({ title: 'Recipe deleted' });
    },
  });

  const logRecipe = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/recipes/${id}/log`, {
        date: getLocalDateKey(),
        mealType: getMealTypeByTime(),
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      window.dispatchEvent(new CustomEvent('reload-meal-data'));
      toast({
        title: 'Recipe logged',
        description: `${result.meal?.name || 'Recipe'} was added to today's meals.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Could not log recipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">Recipe Library</h4>
          <p className="text-xs text-gray-600">
            {isPremium ? 'Unlimited recipes' : `${recipes.length}/${FREE_LIMITS.recipes} free recipes`}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm((open) => !open)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? 'Cancel' : 'New Recipe'}
        </Button>
      </div>

      {showForm && atFreeLimit ? (
        <PremiumFeatureGate
          feature="premium"
          featureName="Unlimited Recipes"
          description="Free accounts can save 5 recipes. Upgrade to keep a full recipe library."
        />
      ) : showForm ? (
        <Card className="p-4 bg-white/70 border-amber-200 space-y-3">
          <Input
            placeholder="Recipe name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            data-testid="input-recipe-name"
          />
          <Textarea
            placeholder="Short description or ingredients"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Servings"
              value={form.servings}
              onChange={(e) => setForm({ ...form, servings: Number(e.target.value) || 1 })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Calories"
              value={form.totalCalories}
              onChange={(e) => setForm({ ...form, totalCalories: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Protein (g)"
              value={form.totalProtein}
              onChange={(e) => setForm({ ...form, totalProtein: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Carbs (g)"
              value={form.totalCarbs}
              onChange={(e) => setForm({ ...form, totalCarbs: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Fat (g)"
              value={form.totalFat}
              onChange={(e) => setForm({ ...form, totalFat: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Instructions (optional)"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
          <RecipeNutritionSummary
            nutrition={{
              calories: Number(form.totalCalories) || 0,
              protein: Number(form.totalProtein) || 0,
              carbs: Number(form.totalCarbs) || 0,
              fat: Number(form.totalFat) || 0,
            }}
            servings={Number(form.servings) || 1}
          />
          <Button
            onClick={() => createRecipe.mutate()}
            disabled={!form.name.trim() || createRecipe.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-save-recipe"
          >
            Save Recipe
          </Button>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <Card className="p-6 text-center bg-amber-50 border-amber-200">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-amber-600" />
          <p className="text-sm text-gray-700">Save a recipe to log it later in one tap.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="p-4 bg-white/70 border-amber-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-semibold text-gray-900">{recipe.name}</h5>
                  {recipe.description && (
                    <p className="text-xs text-gray-600 mt-1">{recipe.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{Math.round(Number(recipe.totalCalories || 0))} cal</Badge>
                    <Badge variant="outline">{recipe.servings} serving{recipe.servings === 1 ? '' : 's'}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => logRecipe.mutate(recipe.id)}
                    disabled={logRecipe.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Utensils className="w-3 h-3 mr-1" />
                    Log
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRecipe.mutate(recipe.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
