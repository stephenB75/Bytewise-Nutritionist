/**
 * ByteWise Visual Recipe Builder
 * 
 * Modern visual recipe building system with click-to-add interface
 * Features:
 * - Visual two-column layout with equal heights
 * - Real-time USDA food database integration with visual search
 * - Brand-compliant design with seamless header-hero integration
 * - Mobile-first responsive design with touch-friendly interactions
 * - Enhanced quantity selection with comprehensive measurement options
 * - Click-to-add functionality replacing drag and drop
 * - Auto-save functionality with enhanced notification system
 * - Nutritional calculations with real-time totals display
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, ChefHat, Trash2, Calculator, Clock, Users, Target, ArrowRight, X, Loader, AlertCircle, CheckCircle, Edit3, Filter, Utensils, Coffee, Sandwich, Apple } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFoodDatabase, LocalFoodItem, FoodPortion } from './FoodDatabaseManager';
import { 
  useNotificationSystem, 
  createMealLogNotification, 
  createDailySummaryNotification,
  createSearchResultNotification,
  createEditNotification 
} from './NotificationSystem';

interface LoggedIngredient {
  id: string;
  fdcId: number;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  category?: string;
  portions?: FoodPortion[];
  availableMeasurements?: MeasurementOption[];
  loggedAt: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface MeasurementOption {
  id: string;
  name: string;
  value: string;
  gramWeight: number;
  type: 'volume' | 'weight' | 'piece' | 'custom';
  source: 'base' | 'custom';
  symbol?: string;
}

interface DropZone {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  ingredients: LoggedIngredient[];
  emoji: string;
}

interface DailyMealLog {
  date: string;
  meals: {
    breakfast: LoggedIngredient[];
    lunch: LoggedIngredient[];
    dinner: LoggedIngredient[];
    snack: LoggedIngredient[];
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  lastModified?: string;
  version?: string;
}

interface CalorieCalculatorProps {
  onNavigate?: (page: string) => void;
}

// Enhanced debounce function
function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Safe nutrient value extraction
const getNutrientValue = (nutrients: any[] | undefined, nutrientId: number): number => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;
  const nutrient = nutrients.find(n => n && n.nutrientId === nutrientId);
  return nutrient?.value || 0;
};

// Safe array access
function safeArray<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

// Enhanced measurement system with comprehensive options
const getMeasurementOptions = (food: LocalFoodItem | null): MeasurementOption[] => {
  if (!food) return [];

  // Enhanced base measurements with symbols and better organization
  const baseMeasurements: MeasurementOption[] = [
    // Weight measurements
    { id: 'base-gram', name: '1 gram', value: 'gram', gramWeight: 1, type: 'weight', source: 'base', symbol: 'g' },
    { id: 'base-ounce', name: '1 ounce', value: 'ounce', gramWeight: 28.35, type: 'weight', source: 'base', symbol: 'oz' },
    { id: 'base-pound', name: '1 pound', value: 'pound', gramWeight: 453.59, type: 'weight', source: 'base', symbol: 'lb' },
    { id: 'base-100gram', name: '100 grams', value: '100gram', gramWeight: 100, type: 'weight', source: 'base', symbol: '100g' },
    
    // Volume measurements (liquid)
    { id: 'base-ml', name: '1 milliliter', value: 'milliliter', gramWeight: 1, type: 'volume', source: 'base', symbol: 'ml' },
    { id: 'base-fl-oz', name: '1 fl oz', value: 'fluid-ounce', gramWeight: 29.57, type: 'volume', source: 'base', symbol: 'fl oz' },
    { id: 'base-teaspoon', name: '1 teaspoon', value: 'teaspoon', gramWeight: 5, type: 'volume', source: 'base', symbol: 'tsp' },
    { id: 'base-tablespoon', name: '1 tablespoon', value: 'tablespoon', gramWeight: 15, type: 'volume', source: 'base', symbol: 'tbsp' },
    
    // Fractional cup measurements
    { id: 'base-quarter-cup', name: '1/4 cup', value: 'quarter-cup', gramWeight: 60, type: 'volume', source: 'base', symbol: '1/4 c' },
    { id: 'base-third-cup', name: '1/3 cup', value: 'third-cup', gramWeight: 80, type: 'volume', source: 'base', symbol: '1/3 c' },
    { id: 'base-half-cup', name: '1/2 cup', value: 'half-cup', gramWeight: 120, type: 'volume', source: 'base', symbol: '1/2 c' },
    { id: 'base-two-thirds-cup', name: '2/3 cup', value: 'two-thirds-cup', gramWeight: 160, type: 'volume', source: 'base', symbol: '2/3 c' },
    { id: 'base-three-quarters-cup', name: '3/4 cup', value: 'three-quarters-cup', gramWeight: 180, type: 'volume', source: 'base', symbol: '3/4 c' },
    { id: 'base-full-cup', name: '1 cup', value: 'full-cup', gramWeight: 240, type: 'volume', source: 'base', symbol: '1 c' },
    
    // Larger volume measurements
    { id: 'base-pint', name: '1 pint', value: 'pint', gramWeight: 473, type: 'volume', source: 'base', symbol: 'pt' },
    { id: 'base-quart', name: '1 quart', value: 'quart', gramWeight: 946, type: 'volume', source: 'base', symbol: 'qt' },
    { id: 'base-liter', name: '1 liter', value: 'liter', gramWeight: 1000, type: 'volume', source: 'base', symbol: 'L' },
    
    // Piece/serving measurements
    { id: 'base-piece', name: '1 piece', value: 'piece', gramWeight: 50, type: 'piece', source: 'base', symbol: 'pc' },
    { id: 'base-slice', name: '1 slice', value: 'slice', gramWeight: 30, type: 'piece', source: 'base', symbol: 'slice' },
  ];

  // Add custom portions from the food data
  const customMeasurements: MeasurementOption[] = safeArray(food.portions).map((portion, index) => ({
    id: `custom-${index}`,
    name: portion.name,
    value: portion.name.toLowerCase().replace(/\s+/g, '-'),
    gramWeight: portion.gramWeight,
    type: 'custom' as const,
    source: 'custom' as const,
    symbol: portion.name.split(' ')[0] || 'serving'
  }));

  return [...baseMeasurements, ...customMeasurements];
};

export function CalorieCalculator({ onNavigate }: CalorieCalculatorProps) {
  const { searchFoods, getFoodById, isLoading: dbLoading } = useFoodDatabase();
  const { addNotification } = useNotificationSystem();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocalFoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<LocalFoodItem | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>('100gram');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  // Meal zones configuration
  const mealZones: DropZone[] = [
    {
      id: 'breakfast',
      name: 'Breakfast',
      icon: Coffee,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      ingredients: [],
      emoji: '🌅'
    },
    {
      id: 'lunch',
      name: 'Lunch',
      icon: Sandwich,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      ingredients: [],
      emoji: '🥪'
    },
    {
      id: 'dinner',
      name: 'Dinner',
      icon: Utensils,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      ingredients: [],
      emoji: '🍽️'
    },
    {
      id: 'snack',
      name: 'Snacks',
      icon: Apple,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      ingredients: [],
      emoji: '🍎'
    }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchFoods(query, 20);
        setSearchResults(results);
        
        // Create search result notification
        addNotification(createSearchResultNotification(query, results.length));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        addNotification({
          type: 'error',
          message: 'Search failed. Please try again.',
          duration: 4000
        });
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchFoods, addNotification]
  );

  // Handle search input change
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Calculate nutrition for a food item with specific amount and measurement
  const calculateNutrition = useCallback((food: LocalFoodItem, amount: number, measurement: string) => {
    const measurementOptions = getMeasurementOptions(food);
    const selectedMeasurement = measurementOptions.find(m => m.value === measurement);
    const gramWeight = selectedMeasurement ? selectedMeasurement.gramWeight * amount : 100 * amount;
    
    // Calculate based on 100g serving
    const factor = gramWeight / 100;
    
    return {
      calories: Math.round(food.calories * factor),
      protein: Math.round((food.protein * factor) * 10) / 10,
      carbs: Math.round((food.carbs * factor) * 10) / 10,
      fat: Math.round((food.fat * factor) * 10) / 10,
      fiber: Math.round((food.fiber * factor) * 10) / 10,
      sugar: Math.round((food.sugar * factor) * 10) / 10,
      sodium: Math.round((food.sodium * factor) * 10) / 10
    };
  }, []);

  // Handle adding food to meal
  const handleAddFood = useCallback(async () => {
    if (!selectedFood) return;

    const nutrition = calculateNutrition(selectedFood, selectedAmount, selectedMeasurement);
    const measurementOptions = getMeasurementOptions(selectedFood);
    const measurementOption = measurementOptions.find(m => m.value === selectedMeasurement);
    
    const ingredient: LoggedIngredient = {
      id: `${selectedFood.fdcId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fdcId: selectedFood.fdcId,
      name: selectedFood.description,
      amount: selectedAmount,
      unit: measurementOption?.symbol || selectedMeasurement,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      sodium: nutrition.sodium,
      category: selectedFood.category,
      portions: selectedFood.portions,
      availableMeasurements: measurementOptions,
      loggedAt: new Date().toISOString(),
      mealType: selectedMealType
    };

    // Log meal entry (simulate API call)
    try {
      // In a real app, this would be an API call
      console.log('Logging meal:', ingredient);
      
      // Create meal log notification
      addNotification(createMealLogNotification(
        selectedFood.description,
        selectedMealType,
        nutrition.calories,
        nutrition.protein
      ));

      // Reset form
      setSelectedFood(null);
      setSelectedAmount(1);
      setSelectedMeasurement('100gram');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to log meal:', error);
      addNotification({
        type: 'error',
        message: 'Failed to log meal. Please try again.',
        duration: 4000
      });
    }
  }, [selectedFood, selectedAmount, selectedMeasurement, selectedMealType, calculateNutrition, addNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-white to-pastel-blue">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pastel-yellow to-pastel-blue p-6 pt-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Calculator className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-black"
                style={{ fontFamily: "'League Spartan', sans-serif" }}
              >
                Recipe Builder
              </h1>
              <p 
                className="text-sm text-black/70"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Build meals with precise nutrition tracking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4 -mt-4">
        {/* Search Section */}
        <Card className="mb-6 p-4 shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 border-gray-200 focus:ring-2 focus:ring-pastel-blue/50"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            />
            {isSearching && (
              <Loader className="absolute right-3 top-3 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food.fdcId}
                  onClick={() => setSelectedFood(food)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedFood?.fdcId === food.fdcId
                      ? 'bg-pastel-blue/20 border-2 border-pastel-blue'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-semibold text-sm text-gray-900 truncate"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        {food.description}
                      </p>
                      <p 
                        className="text-xs text-gray-500 mt-1"
                        style={{ fontFamily: "'Quicksand', sans-serif" }}
                      >
                        {food.category}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-gray-900">{food.calories}</p>
                      <p className="text-xs text-gray-500">cal/100g</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Food Selection Panel */}
        {selectedFood && (
          <Card className="mb-6 p-4 shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 
                className="font-bold text-gray-900"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Selected Food
              </h3>
            </div>
            
            <div className="bg-pastel-blue/10 p-3 rounded-lg mb-4">
              <p 
                className="font-semibold text-gray-900"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {selectedFood.description}
              </p>
              <p 
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {selectedFood.calories} cal • {selectedFood.protein}g protein per 100g
              </p>
            </div>

            {/* Amount Input */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Amount
                </label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 1)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Unit
                </label>
                <Select value={selectedMeasurement} onValueChange={setSelectedMeasurement}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMeasurementOptions(selectedFood).map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meal Type Selection */}
            <div className="mb-4">
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Add to Meal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {mealZones.map((zone) => {
                  const IconComponent = zone.icon;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedMealType(zone.id as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedMealType === zone.id
                          ? `${zone.bgColor} ${zone.borderColor} ${zone.color}`
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent size={16} />
                        <span 
                          className="text-sm font-medium"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          {zone.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nutrition Preview */}
            {selectedFood && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p 
                  className="text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Nutrition Preview
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {(() => {
                    const nutrition = calculateNutrition(selectedFood, selectedAmount, selectedMeasurement);
                    return (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Calories</p>
                          <p className="font-bold text-sm">{nutrition.calories}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Protein</p>
                          <p className="font-bold text-sm">{nutrition.protein}g</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Carbs</p>
                          <p className="font-bold text-sm">{nutrition.carbs}g</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fat</p>
                          <p className="font-bold text-sm">{nutrition.fat}g</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Add Button */}
            <Button
              onClick={handleAddFood}
              className="w-full bg-gradient-to-r from-pastel-blue to-pastel-yellow text-black font-bold hover:opacity-90 transition-opacity"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!selectedFood && searchResults.length === 0 && !isSearching && (
          <Card className="p-8 text-center shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 
              className="text-lg font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Start Building Your Recipe
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Search for foods above to begin adding ingredients to your meals
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}