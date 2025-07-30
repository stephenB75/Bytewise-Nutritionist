/**
 * Bytewise Recipe Builder Component
 * 
 * Interactive recipe creation with drag & drop ingredients
 * Real-time nutrition calculation and meal logging
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  ChefHat, 
  Clock, 
  Users,
  Trash2,
  Save,
  Calculator,
  Scale,
  Zap,
  Heart
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface RecipeBuilderProps {
  onNavigate: (page: string) => void;
}

export default function RecipeBuilder({ onNavigate }: RecipeBuilderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(1);
  const [prepTime, setPrepTime] = useState(15);

  // Sample ingredient database
  const [availableIngredients] = useState<Ingredient[]>([
    {
      id: '1',
      name: 'Chicken Breast',
      amount: 100,
      unit: 'g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6
    },
    {
      id: '2', 
      name: 'Brown Rice',
      amount: 100,
      unit: 'g',
      calories: 112,
      protein: 2.6,
      carbs: 23,
      fat: 0.9
    },
    {
      id: '3',
      name: 'Broccoli',
      amount: 100,
      unit: 'g', 
      calories: 34,
      protein: 2.8,
      carbs: 7,
      fat: 0.4
    },
    {
      id: '4',
      name: 'Olive Oil',
      amount: 15,
      unit: 'ml',
      calories: 119,
      protein: 0,
      carbs: 0,
      fat: 13.5
    },
    {
      id: '5',
      name: 'Greek Yogurt',
      amount: 100,
      unit: 'g',
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4
    }
  ]);

  // Calculate total nutrition
  const totalNutrition = selectedIngredients.reduce(
    (total, ingredient) => ({
      calories: total.calories + ingredient.calories,
      protein: total.protein + ingredient.protein,
      carbs: total.carbs + ingredient.carbs,
      fat: total.fat + ingredient.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Filter ingredients based on search
  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient = { ...ingredient, id: `${ingredient.id}-${Date.now()}` };
    setSelectedIngredients(prev => [...prev, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setSelectedIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const updateIngredientAmount = (id: string, newAmount: number) => {
    setSelectedIngredients(prev => 
      prev.map(ingredient => {
        if (ingredient.id === id) {
          const ratio = newAmount / ingredient.amount;
          return {
            ...ingredient,
            amount: newAmount,
            calories: Math.round(ingredient.calories * ratio),
            protein: Math.round(ingredient.protein * ratio * 10) / 10,
            carbs: Math.round(ingredient.carbs * ratio * 10) / 10,
            fat: Math.round(ingredient.fat * ratio * 10) / 10
          };
        }
        return ingredient;
      })
    );
  };

  const saveRecipe = () => {
    if (recipeName && selectedIngredients.length > 0) {
      // In real app, this would save to backend
      console.log('Saving recipe:', {
        name: recipeName,
        ingredients: selectedIngredients,
        nutrition: totalNutrition,
        servings,
        prepTime
      });
      // Navigate back to dashboard or show success message
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
        backgroundAlt="Fresh cooking ingredients and utensils"
        title="Recipe Builder"
        subtitle="Create your perfect meal"
        description="Drag ingredients to build balanced recipes"
        statCard={{
          icon: ChefHat,
          value: selectedIngredients.length,
          label: "ingredients",
          iconColor: "yellow-400"
        }}
        progressRing={{
          percentage: Math.min((totalNutrition.calories / 600) * 100, 100),
          color: "#a8dadc", 
          label: "calories"
        }}
      />

      {/* Main Content */}
      <div className="px-4 space-y-6">
        {/* Recipe Details */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Recipe Details</h3>
          <div className="space-y-4">
            <Input
              placeholder="Recipe name..."
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="text-brand-body"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-brand-label">Servings</label>
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  min={1}
                  className="text-brand-body"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-label">Prep Time (min)</label>
                <Input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 15)}
                  min={5}
                  className="text-brand-body"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Ingredient Search */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Add Ingredients</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-brand-body"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {filteredIngredients.map((ingredient) => (
              <div 
                key={ingredient.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-brand-subheading">{ingredient.name}</p>
                  <p className="text-sm text-muted-foreground text-brand-body">
                    {ingredient.calories} cal per {ingredient.amount}{ingredient.unit}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => addIngredient(ingredient)}
                  className="text-brand-button"
                >
                  <Plus size={16} />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Recipe Ingredients</h3>
            <div className="space-y-3">
              {selectedIngredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-brand-subheading">{ingredient.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="number"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredientAmount(ingredient.id, parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-sm text-brand-body"
                        min={0}
                        step={0.1}
                      />
                      <span className="text-sm text-muted-foreground text-brand-body">{ingredient.unit}</span>
                    </div>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-sm font-medium text-brand-heading">{ingredient.calories} cal</p>
                    <p className="text-xs text-muted-foreground text-brand-body">{ingredient.protein}g protein</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeIngredient(ingredient.id)}
                    className="text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Nutrition Summary */}
        {selectedIngredients.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Nutrition Summary</h3>
            
            {/* Total Recipe */}
            <div className="mb-4 p-3 bg-primary/5 rounded-lg">
              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-primary text-brand-heading">
                  {Math.round(totalNutrition.calories)}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">Total Calories</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart size={12} className="text-chart-2 mr-1" />
                    <span className="font-semibold text-chart-2 text-brand-subheading">
                      {Math.round(totalNutrition.protein)}g
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-brand-body">Protein</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap size={12} className="text-chart-4 mr-1" />
                    <span className="font-semibold text-chart-4 text-brand-subheading">
                      {Math.round(totalNutrition.carbs)}g
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-brand-body">Carbs</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Scale size={12} className="text-chart-3 mr-1" />
                    <span className="font-semibold text-chart-3 text-brand-subheading">
                      {Math.round(totalNutrition.fat)}g
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-brand-body">Fat</p>
                </div>
              </div>
            </div>

            {/* Per Serving */}
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2 text-brand-body">
                Per Serving ({servings} serving{servings !== 1 ? 's' : ''} total)
              </p>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="font-semibold text-brand-heading">{Math.round(totalNutrition.calories / servings)}</p>
                  <p className="text-xs text-muted-foreground text-brand-body">cal</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-heading">{Math.round(totalNutrition.protein / servings)}g</p>
                  <p className="text-xs text-muted-foreground text-brand-body">protein</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-heading">{Math.round(totalNutrition.carbs / servings)}g</p>
                  <p className="text-xs text-muted-foreground text-brand-body">carbs</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-heading">{Math.round(totalNutrition.fat / servings)}g</p>
                  <p className="text-xs text-muted-foreground text-brand-body">fat</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedIngredients.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedIngredients([])}
              className="text-brand-button"
            >
              Clear All
            </Button>
            <Button 
              onClick={saveRecipe}
              disabled={!recipeName}
              className="text-brand-button"
            >
              <Save className="mr-2" size={16} />
              Save Recipe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}