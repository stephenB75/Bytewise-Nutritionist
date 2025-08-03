/**
 * Enhanced Calorie Calculator Component
 * 
 * USDA-powered ingredient analysis with offline capabilities
 * Provides detailed nutrition breakdown and measurement conversions
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EnhancedIngredientDatabaseManager, type IngredientData } from '@/data/enhancedIngredientDatabase';
import { 
  enhancedFoodDatabase, 
  searchEnhancedFoods, 
  calculateNutritionForPortion,
  type EnhancedFoodItem 
} from '@/data/enhancedFoodDatabase';
import { 
  Search, 
  Calculator, 
  Flame, 
  Info, 
  CheckCircle,
  Plus,
  Sparkles,
  Scale,
  AlertCircle,
  Trophy,
  Beef,
  Wheat,
  Droplets,
  Calendar
} from 'lucide-react';

interface USDAFoodResult {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  brandOwner?: string;
  brandName?: string;
}

interface IngredientAnalysis {
  ingredient: string;
  measurement: string;
  estimatedCalories: number;
  equivalentMeasurement?: string;
  note?: string;
  nutritionPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface CalorieCalculatorProps {
  onAddToMeal?: (ingredient: IngredientAnalysis) => void;
  onNavigate?: (page: string) => void;
  onCaloriesCalculated?: (calories: any) => void;
  onLogToWeekly?: (logData: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
    time: string;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }) => void;
  isCompact?: boolean;
}

function CalorieCalculator({ onAddToMeal, onNavigate, onCaloriesCalculated, onLogToWeekly, isCompact = false }: CalorieCalculatorProps) {
  const [ingredient, setIngredient] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [amount, setAmount] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState<IngredientAnalysis[]>([]);
  const [showLoggedAnimation, setShowLoggedAnimation] = useState(false);
  const [loggedData, setLoggedData] = useState<any>(null);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<Array<{category: string; key: string; data: IngredientData}>>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<{category: string; key: string; data: IngredientData} | null>(null);
  const [usdaFoodSuggestions, setUsdaFoodSuggestions] = useState<EnhancedFoodItem[]>([]);
  const [selectedUSDAFood, setSelectedUSDAFood] = useState<EnhancedFoodItem | null>(null);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [selectedVerifiedFood, setSelectedVerifiedFood] = useState<USDAFoodResult | null>(null);
  const queryClient = useQueryClient();

  // Search USDA foods query
  const { data: usdaSearchResults, isLoading: isSearchingUSDA } = useQuery({
    queryKey: ['/api/search-foods', ingredient],
    enabled: ingredient.length >= 2,
    retry: false,
  }) as { data: { foods: USDAFoodResult[] } | undefined; isLoading: boolean };

  // Search ingredients as user types - both custom and USDA
  useEffect(() => {
    if (ingredient.length >= 2) {
      const customSuggestions = EnhancedIngredientDatabaseManager.searchIngredients(ingredient);
      setIngredientSuggestions(customSuggestions.slice(0, 6)); // Limit to 6 custom suggestions
      
      // Search USDA database
      const usdaSuggestions = searchEnhancedFoods(ingredient);
      setUsdaFoodSuggestions(usdaSuggestions.slice(0, 8)); // Limit to 8 USDA suggestions
    } else {
      setIngredientSuggestions([]);
      setUsdaFoodSuggestions([]);
    }
  }, [ingredient]);

  // Update available units when ingredient is selected
  useEffect(() => {
    if (selectedIngredient) {
      const units = EnhancedIngredientDatabaseManager.getAvailableUnits(
        selectedIngredient.category, 
        selectedIngredient.key
      );
      setAvailableUnits(units);
      if (units.length > 0 && !selectedUnit) {
        setSelectedUnit(units[0]); // Set first unit as default
      }
    }
  }, [selectedIngredient]);

  // Select ingredient from suggestions
  const handleSelectIngredient = (suggestion: {category: string; key: string; data: IngredientData}) => {
    setSelectedIngredient(suggestion);
    setSelectedUSDAFood(null); // Clear USDA selection
    setIngredient(suggestion.data.displayName);
    setIngredientSuggestions([]);
    setUsdaFoodSuggestions([]);
  };

  // Select USDA food from suggestions
  const handleSelectUSDAFood = (food: EnhancedFoodItem) => {
    setSelectedUSDAFood(food);
    setSelectedIngredient(null); // Clear custom ingredient selection
    setIngredient(food.name);
    setIngredientSuggestions([]);
    setUsdaFoodSuggestions([]);
    
    // Set available portions as units
    const portions = food.portions.map(p => p.name);
    setAvailableUnits(portions);
    if (portions.length > 0) {
      setSelectedUnit(portions[0]); // Set first portion as default
    }
  };

  // Calculate calories mutation
  const calculateCalories = useMutation({
    mutationFn: async ({ ingredient, measurement }: { ingredient: string; measurement: string }) => {
      const response = await fetch('/api/calculate-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient, measurement }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate calories');
      }
      
      return response.json();
    },
    onSuccess: (data: IngredientAnalysis) => {
      setRecentAnalyses(prev => [data, ...prev.slice(0, 4)]);
      setIngredient('');
      setMeasurement('');
      setAmount('');
      setSelectedUnit('');
      setSelectedIngredient(null);
      
      // Send calculated calories to tracking hook
      if (onCaloriesCalculated) {
        onCaloriesCalculated({
          name: `${data.ingredient} (${data.measurement})`,
          calories: data.estimatedCalories,
          protein: data.nutritionPer100g?.protein || 0,
          carbs: data.nutritionPer100g?.carbs || 0,
          fat: data.nutritionPer100g?.fat || 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          ingredients: [data.ingredient]
        });
      }
    },
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ingredient.trim()) {
      return;
    }

    // Use the USDA API to calculate calories for the selected verified food
    if (selectedVerifiedFood && measurement.trim()) {
      calculateCalories.mutate({ 
        ingredient: selectedVerifiedFood.description, 
        measurement: measurement.trim() 
      });
    } else if (measurement.trim()) {
      // Fallback to regular ingredient search
      calculateCalories.mutate({ 
        ingredient: ingredient.trim(), 
        measurement: measurement.trim() 
      });
    }
  };

  // Measurement validation function
  const validateMeasurement = (measurement: string): { isValid: boolean; suggestion?: string } => {
    const measurementLower = measurement.toLowerCase();
    
    // Common valid patterns
    const validPatterns = [
      /^\d+(\.\d+)?\s*(g|gram|grams)$/,
      /^\d+(\.\d+)?\s*(oz|ounce|ounces)$/,
      /^\d+(\.\d+)?\s*(lb|lbs|pound|pounds)$/,
      /^\d+(\.\d+)?\s*(cup|cups)$/,
      /^\d+(\.\d+)?\s*(tbsp|tablespoon|tablespoons)$/,
      /^\d+(\.\d+)?\s*(tsp|teaspoon|teaspoons)$/,
      /^\d+(\.\d+)?\s*(piece|pieces)$/,
      /^\d+(\.\d+)?\s*(slice|slices)$/,
      /^\d+(\.\d+)?\s*(small|medium|large)$/,
      /^\d+(\.\d+)?\s*(ml|milliliter|milliliters)$/,
      /^\d+(\.\d+)?\s*(liter|liters|l)$/
    ];
    
    const isValid = validPatterns.some(pattern => pattern.test(measurementLower));
    
    if (!isValid) {
      // Suggest corrections
      if (/^\d+/.test(measurementLower)) {
        return { 
          isValid: false, 
          suggestion: 'Add a unit like "g", "cup", "tbsp", "medium", etc.' 
        };
      } else if (/^(small|medium|large)$/.test(measurementLower)) {
        return { 
          isValid: false, 
          suggestion: 'Add a number like "1 medium", "2 large", etc.' 
        };
      } else {
        return { 
          isValid: false, 
          suggestion: 'Use format like "100g", "1 cup", "2 tbsp", "1 medium"' 
        };
      }
    }
    
    return { isValid: true };
  };

  const handleAddToMeal = (analysis: IngredientAnalysis) => {
    if (onAddToMeal) {
      onAddToMeal(analysis);
    }
  };

  const handleLogToWeekly = async (analysis: IngredientAnalysis) => {
    const now = new Date();
    const hour = now.getHours();
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    
    // Enhanced category assignment logic based on time
    if (hour >= 5 && hour < 11) mealType = 'breakfast';
    else if (hour >= 11 && hour < 16) mealType = 'lunch';  
    else if (hour >= 16 && hour < 21) mealType = 'dinner';
    else mealType = 'snack';

    const mealData = {
      id: `calc-${Date.now()}`,
      name: `${analysis.ingredient} (${analysis.measurement})`,
      calories: analysis.estimatedCalories,
      protein: analysis.nutritionPer100g?.protein || 0,
      carbs: analysis.nutritionPer100g?.carbs || 0,
      fat: analysis.nutritionPer100g?.fat || 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      mealType,
      category: mealType,
      timestamp: now.toISOString(),
      source: 'calculator'
    };

    // Store in localStorage for weekly logger to access  
    const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    weeklyMeals.push(mealData);
    localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
    
    // Successfully logged to weekly tracker
    
    // Dispatch comprehensive events for weekly logger refresh
    window.dispatchEvent(new CustomEvent('calories-logged', {
      detail: mealData
    }));
    window.dispatchEvent(new CustomEvent('meal-logged-success', {
      detail: mealData
    }));
    window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
    
    // Store logged data and show animation
    setLoggedData({
      name: mealData.name,
      calories: mealData.calories,
      mealType,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat
    });
    setShowLoggedAnimation(true);
    
    // Auto-hide animation after 3 seconds
    setTimeout(() => {
      setShowLoggedAnimation(false);
      setLoggedData(null);
    }, 3000);
    
    // Show success toast notification
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `✅ Logged ${analysis.ingredient} to ${mealType}!`,
        type: 'success'
      }
    }));

    // Also call the original callback if it exists
    if (onLogToWeekly) {
      onLogToWeekly({
        name: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        date: mealData.date,
        time: mealData.time,
        category: mealType
      });
    }
  };

  if (isCompact) {
    return (
      <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Quick Calorie Calculator</h3>
        </div>
        
        <form onSubmit={handleCalculate} className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Input
              placeholder="Ingredient (e.g., chicken breast, apple)"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="text-base"
            />
            <Input
              placeholder="Measurement (e.g., 1 cup, 100g, 1 medium)"
              value={measurement}
              onChange={(e) => setMeasurement(e.target.value)}
              className="text-base"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || !measurement.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {calculateCalories.isPending ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculate
              </>
            )}
          </Button>
        </form>

        {calculateCalories.isError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">
                Could not analyze ingredient. Please check spelling or try a simpler description.
              </span>
            </div>
          </div>
        )}

        {recentAnalyses.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recent Analysis</h4>
            {recentAnalyses.slice(0, 2).map((analysis, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{analysis.ingredient}</p>
                    <p className="text-sm text-gray-600">{analysis.measurement}</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <Flame className="w-3 h-3 mr-1" />
                    {analysis.estimatedCalories} cal
                  </Badge>
                </div>
                
                <div className="mt-2 space-y-2">
                  {onAddToMeal && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToMeal(analysis)}
                      className="w-full"
                    >
                      Add to Meal
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      // Logging meal data
                      handleLogToWeekly(analysis);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Log to Weekly Tracker
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Animated Success Dialog */}
      {showLoggedAnimation && loggedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Successfully Logged!</h3>
                <p className="text-gray-600 font-medium">{loggedData.name}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{loggedData.calories} calories</p>
              </div>
              
              <div className="flex justify-around text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-bold">{loggedData.protein?.toFixed(1)}g</div>
                  <div className="text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-bold">{loggedData.carbs?.toFixed(1)}g</div>
                  <div className="text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-600 font-bold">{loggedData.fat?.toFixed(1)}g</div>
                  <div className="text-gray-500">Fat</div>
                </div>
              </div>
              
              <div className="pt-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Added to {loggedData.mealType}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Calculator */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">USDA Calorie Calculator</h2>
            <p className="text-sm text-gray-600">Get precise nutrition data with measurement conversions</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* USDA Food Search with Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Search USDA Verified Foods
                </div>
              </label>
              
              <Popover open={showFoodSearch} onOpenChange={setShowFoodSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showFoodSearch}
                    className="w-full justify-between text-left font-normal"
                    data-testid="food-search-trigger"
                  >
                    {selectedVerifiedFood ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="truncate">{selectedVerifiedFood.description}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Search className="w-4 h-4" />
                        <span>Search for verified foods...</span>
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search USDA foods..." 
                      value={ingredient}
                      onValueChange={setIngredient}
                      data-testid="food-search-input"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isSearchingUSDA ? (
                          <div className="flex items-center justify-center py-6">
                            <Search className="w-4 h-4 mr-2 animate-spin" />
                            Searching USDA database...
                          </div>
                        ) : ingredient.length < 2 ? (
                          "Type at least 2 characters to search"
                        ) : (
                          "No verified foods found. Try a different search term."
                        )}
                      </CommandEmpty>
                      
                      {usdaSearchResults?.foods && usdaSearchResults.foods.length > 0 && (
                        <CommandGroup heading="✓ USDA Verified Foods">
                          {usdaSearchResults.foods.map((food: USDAFoodResult) => (
                            <CommandItem
                              key={food.fdcId}
                              onSelect={() => {
                                setSelectedVerifiedFood(food);
                                setIngredient(food.description);
                                setShowFoodSearch(false);
                              }}
                              className="flex items-start gap-3 p-3"
                              data-testid={`food-option-${food.fdcId}`}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {food.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    {food.dataType}
                                  </Badge>
                                  {food.foodCategory && (
                                    <span className="text-xs text-gray-500 truncate">
                                      {food.foodCategory}
                                    </span>
                                  )}
                                </div>
                                {food.brandOwner && (
                                  <span className="text-xs text-gray-400 truncate block">
                                    {food.brandOwner}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              

              
              <p className="text-xs text-gray-500 mt-1">
                Select from thousands of USDA verified foods with accurate nutritional data
              </p>
            </div>
            
            {/* Measurement Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Measurement
                </div>
              </label>
              <Input
                placeholder="e.g., 1 cup, 100g, 1 medium, 2 tablespoons"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="text-base"
                data-testid="measurement-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedVerifiedFood 
                  ? `Enter amount for: ${selectedVerifiedFood.description}`
                  : "Supports fractions, decimals, cups, grams, ounces, pieces, and more"
                }
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || !measurement.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            data-testid="calculate-button"
          >
            {calculateCalories.isPending ? (
              <>
                <Search className="w-5 h-5 mr-2 animate-spin" />
                Analyzing with USDA Database...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Calories
              </>
            )}
          </Button>
        </form>

        {calculateCalories.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700">Analysis Failed</p>
                <p className="text-sm text-red-600">
                  Could not find nutrition data for this ingredient. Try using a more common name or check spelling.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {recentAnalyses.length > 0 && (
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Analyses</h3>
          
          <div className="space-y-4">
            {recentAnalyses.map((analysis, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{analysis.ingredient}</h4>
                    <p className="text-gray-600">{analysis.measurement}</p>
                  </div>
                  <Badge variant="default" className="bg-orange-500 text-white text-lg px-3 py-1">
                    <Flame className="w-4 h-4 mr-1" />
                    {analysis.estimatedCalories} kcal
                  </Badge>
                </div>

                {analysis.equivalentMeasurement && (
                  <div className="mb-3">
                    <p className="text-sm text-blue-600 font-medium">
                      <Scale className="w-4 h-4 inline mr-1" />
                      {analysis.equivalentMeasurement}
                    </p>
                  </div>
                )}

                {analysis.nutritionPer100g && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.calories)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Beef className="w-4 h-4 mx-auto text-red-500 mb-1" />
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.protein)}g</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Wheat className="w-4 h-4 mx-auto text-[#faed39] mb-1" />
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.carbs)}g</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Droplets className="w-4 h-4 mx-auto text-[#1f4aa6] mb-1" />
                      <p className="text-xs text-gray-600">Fat</p>
                      <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.fat)}g</p>
                    </div>
                  </div>
                )}

                {analysis.note && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-700">{analysis.note}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {onAddToMeal && (
                    <Button
                      onClick={() => handleAddToMeal(analysis)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Add to Current Meal
                    </Button>
                  )}
                  <Button
                    onClick={() => handleLogToWeekly(analysis)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Log to Weekly Tracker
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Guide Card */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Ingredient Entry</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Type any food name to search</p>
              <p>• Use USDA database for accuracy</p>
              <p>• Select from custom ingredients</p>
              <p>• Get detailed nutrition breakdowns</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Measurement Examples</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Weight: 100g, 2 oz, 1 lb</p>
              <p>• Volume: 1 cup, 2 tbsp, 1 tsp</p>
              <p>• Pieces: 1 medium, 1 slice, 1 whole</p>
              <p>• Portions: 1 serving, handful, bunch</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CalorieCalculator;