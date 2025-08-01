/**
 * Enhanced Calorie Calculator Component
 * 
 * USDA-powered ingredient analysis with structured food database
 * Provides detailed nutrition breakdown and smart unit conversions
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Calculator, 
  Flame, 
  Info, 
  CheckCircle,
  AlertCircle,
  Beef,
  Wheat,
  Droplets,
  Apple,
  Scale,
  Calendar,
  Plus,
  Sparkles,
  ChefHat,
  BookOpen
} from 'lucide-react';
import EnhancedFoodDatabaseService, { ENHANCED_FOOD_DATABASE, type FoodItem } from '@/lib/enhancedFoodDatabase';

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
  foodKey?: string;
  category?: string;
  isEnhanced?: boolean;
}

interface FoodSuggestion {
  key: string;
  category: string;
  food: FoodItem;
  matchType: 'exact' | 'alias' | 'partial';
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
  const [selectedAmount, setSelectedAmount] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState<IngredientAnalysis[]>([]);
  const [foodSuggestions, setFoodSuggestions] = useState<FoodSuggestion[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const queryClient = useQueryClient();

  // Search for food suggestions as user types
  useEffect(() => {
    if (ingredient.length > 2) {
      const suggestions = EnhancedFoodDatabaseService.searchFoods(ingredient);
      setFoodSuggestions(suggestions.slice(0, 10)); // Limit to top 10 matches
      setShowSuggestions(suggestions.length > 0);
    } else {
      setFoodSuggestions([]);
      setShowSuggestions(false);
    }
  }, [ingredient]);

  // Update available units when food is selected
  useEffect(() => {
    if (selectedFood) {
      const availableUnits = EnhancedFoodDatabaseService.getAvailableUnits(
        selectedFood.key, 
        selectedFood.category
      );
      if (availableUnits.length > 0 && !selectedUnit) {
        setSelectedUnit(availableUnits[0]);
      }
    }
  }, [selectedFood, selectedUnit]);

  // Enhanced calorie calculation with structured food database support
  const calculateCalories = useMutation({
    mutationFn: async ({ ingredient, measurement, foodKey, category }: { 
      ingredient: string; 
      measurement: string;
      foodKey?: string;
      category?: string;
    }) => {
      // If we have enhanced food data, use it for accurate calculations
      if (foodKey && category) {
        const food = ENHANCED_FOOD_DATABASE.categories[category]?.[foodKey];
        const parsedMeasurement = EnhancedFoodDatabaseService.parseMeasurement(
          measurement, foodKey, category
        );
        
        if (food && parsedMeasurement.isValid && parsedMeasurement.amount && parsedMeasurement.unit) {
          // Use enhanced database for calculation
          const gramsEquivalent = food.units[parsedMeasurement.unit] * parsedMeasurement.amount;
          
          // Still call USDA API for nutrition data but use our accurate measurement
          const response = await fetch('/api/calculate-calories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ingredient: food.usdaQuery, 
              measurement: `${gramsEquivalent}g`
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            return {
              ...data,
              ingredient: food.displayName,
              measurement: `${parsedMeasurement.amount} ${parsedMeasurement.unit} (~${Math.round(gramsEquivalent)}g)`,
              isEnhanced: true,
              foodKey,
              category
            };
          }
        }
      }
      
      // Fallback to standard USDA API call
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
      setSelectedAmount('1');
      setSelectedUnit('');
      setSelectedFood(null);
      setValidationMessage('');
      
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
    onError: () => {
      setValidationMessage('Calculation failed. Please try again.');
    }
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanIngredient = ingredient.trim();
    
    if (!cleanIngredient) {
      setValidationMessage('Please enter a food item');
      return;
    }
    
    // If using enhanced database with selected food and units
    if (selectedFood && selectedAmount && selectedUnit) {
      const measurementStr = `${selectedAmount} ${selectedUnit}`;
      const parsedMeasurement = EnhancedFoodDatabaseService.parseMeasurement(
        measurementStr, selectedFood.key, selectedFood.category
      );
      
      if (!parsedMeasurement.isValid) {
        setValidationMessage(parsedMeasurement.suggestions?.join('. ') || 'Invalid measurement');
        return;
      }
      
      calculateCalories.mutate({
        ingredient: selectedFood.food.displayName,
        measurement: measurementStr,
        foodKey: selectedFood.key,
        category: selectedFood.category
      });
      return;
    }
    
    // Fallback to manual measurement input
    const cleanMeasurement = measurement.trim();
    if (!cleanMeasurement) {
      setValidationMessage('Please enter an amount (e.g., "1 cup", "100g")');
      return;
    }
    
    // Validate measurement format for manual input
    const measurementValidation = validateMeasurement(cleanMeasurement);
    if (!measurementValidation.isValid) {
      setValidationMessage(measurementValidation.suggestion || 'Please use format like "1 cup", "100g", "2 tbsp"');
      return;
    }
    
    calculateCalories.mutate({ ingredient: cleanIngredient, measurement: cleanMeasurement });
  };

  const handleFoodSelect = (suggestion: FoodSuggestion) => {
    setSelectedFood(suggestion);
    setIngredient(suggestion.food.displayName);
    setShowSuggestions(false);
    
    // Set default unit and clear any previous unit selection
    const availableUnits = EnhancedFoodDatabaseService.getAvailableUnits(
      suggestion.key, 
      suggestion.category
    );
    if (availableUnits.length > 0) {
      setSelectedUnit(availableUnits[0]);
    }
    setValidationMessage('');
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
      source: 'calculator'
    };

    try {
      // Direct API call to log meal
      const response = await fetch('/api/meals/logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
        credentials: 'include',
      });

      if (response.ok) {
        console.log(`✅ Successfully logged to ${mealType}: ${analysis.ingredient} - ${analysis.estimatedCalories} cal`);
        
        // Trigger multiple events for comprehensive UI updates
        const logEvent = new CustomEvent('calories-logged', {
          detail: { ...mealData, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(logEvent);

        // Trigger success event for immediate refresh
        const successEvent = new CustomEvent('meal-logged-success', {
          detail: { ...mealData, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(successEvent);
        
        // Show success toast
        const toastEvent = new CustomEvent('show-toast', {
          detail: { 
            message: `✅ Logged ${analysis.ingredient} to ${mealType}!`,
            type: 'success'
          }
        });
        window.dispatchEvent(toastEvent);
      } else {
        throw new Error('Failed to log meal');
      }
    } catch (error) {
      console.error('❌ Failed to log to weekly:', error);
      
      // Show error toast
      const toastEvent = new CustomEvent('show-toast', {
        detail: { 
          message: `Failed to log meal. Please try again.`,
          type: 'error'
        }
      });
      window.dispatchEvent(toastEvent);
    }

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
                      console.log('Log to Weekly button clicked for:', analysis);
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
    <div className="space-y-6">
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
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredient Name
              </label>
              <Input
                type="text"
                placeholder="e.g., chicken breast, apple, olive oil"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="text-base"
              />
              
              {/* Enhanced Food Suggestions */}
              {showSuggestions && foodSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {foodSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.category}-${suggestion.key}`}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 focus:outline-none focus:bg-blue-50"
                      onClick={() => handleFoodSelect(suggestion)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{suggestion.food.displayName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: suggestion.food.tags.categoryColor + '40' }}
                            >
                              {suggestion.category}
                            </Badge>
                            <span>•</span>
                            <span>{suggestion.food.tags.dietType.join(', ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {suggestion.matchType === 'exact' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {suggestion.food.tags.isCommon && (
                            <Sparkles className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Measurement Section */}
            {selectedFood ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1"
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(e.target.value)}
                    className="text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFood && EnhancedFoodDatabaseService.getAvailableUnits(selectedFood.key, selectedFood.category).map((unit) => {
                        const gramWeight = selectedFood.food.units[unit];
                        const volumeConversion = selectedFood.food.volumeConversions?.[unit];
                        return (
                          <SelectItem key={unit} value={unit}>
                            {unit} 
                            {gramWeight && gramWeight !== 1 && ` (≈${gramWeight}g)`}
                            {volumeConversion && selectedFood.food.tags.densityType === 'liquid' && ` (${volumeConversion}ml)`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Measurement
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 1 cup, 100g, 2 tbsp, 1 medium"
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  className="text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Or select a food above for precise measurements
                </p>
              </div>
            )}
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">{validationMessage}</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || 
              (selectedFood ? (!selectedAmount || !selectedUnit) : !measurement.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
          >
            {calculateCalories.isPending ? (
              <>
                <Search className="w-5 h-5 mr-2 animate-spin" />
                {selectedFood ? 'Enhanced Analysis...' : 'Analyzing with USDA Database...'}
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                {selectedFood ? 'Calculate with Enhanced Data' : 'Calculate Calories'}
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

      {/* Professional Conversion Helper */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ChefHat className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Professional Culinary Conversions</h3>
            <p className="text-sm text-gray-600">Shamrock Foods & KTT conversion standards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Liquid Measures */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Liquid Measures
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>1 cup = 8 fl oz = 237ml</div>
              <div>1/2 cup = 4 fl oz = 118ml</div>
              <div>1/4 cup = 2 fl oz = 59ml</div>
              <div>1 tbsp = 1/2 fl oz = 15ml</div>
              <div>1 tsp = 1/6 fl oz = 5ml</div>
            </div>
          </div>

          {/* Butter to Oil Conversions */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-yellow-500" />
              Butter → Olive Oil (Baking)
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>1 cup butter → 3/4 cup oil</div>
              <div>1/2 cup butter → 1/4 cup + 2 tbsp oil</div>
              <div>1/4 cup butter → 3 tbsp oil</div>
              <div>1 tbsp butter → 2 1/4 tsp oil</div>
            </div>
          </div>

          {/* Temperature Conversions */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              Oven Temperatures
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>250°F = 120°C = Gas Mark 1/2</div>
              <div>350°F = 175°C = Gas Mark 4</div>
              <div>375°F = 190°C = Gas Mark 5</div>
              <div>400°F = 200°C = Gas Mark 6</div>
              <div>425°F = 220°C = Gas Mark 7</div>
              <div>450°F = 230°C = Gas Mark 8</div>
            </div>
          </div>

          {/* Common Substitutions */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Common Substitutions
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>1 cup milk → 1/2 cup evap milk + 1/2 cup water</div>
              <div>1 egg → 2 egg yolks (for richness)</div>
              <div>1 tsp baking powder → 1/4 tsp baking soda + 1/2 tsp cream of tartar</div>
              <div>1 cup butter → 3/4 cup olive oil (healthier)</div>
              <div>1 cup all-purpose flour → 1 cup + 2 tbsp cake flour</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {recentAnalyses.length > 0 && (
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Analyses</h3>
          
          <div className="space-y-4">
            {recentAnalyses.map((analysis, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg">{analysis.ingredient}</h4>
                      {analysis.isEnhanced && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Enhanced
                        </Badge>
                      )}
                    </div>
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
                      <Wheat className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.carbs)}g</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
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

                {/* Professional Conversion Information */}
                {analysis.isEnhanced && analysis.foodKey && analysis.category && (
                  <div className="mb-3 space-y-2">
                    {/* Butter to Olive Oil Conversion for Butter */}
                    {analysis.foodKey === 'butter' && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <div className="font-medium text-green-800">🧄 Baking Substitution</div>
                        <div className="text-green-700">
                          For healthier baking: Use ¾ the amount of olive oil
                        </div>
                      </div>
                    )}
                    
                    {/* Drain Weight for Canned Goods */}
                    {EnhancedFoodDatabaseService.getDrainWeight(analysis.foodKey, analysis.category) && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                        <div className="font-medium text-amber-800">📦 Canned Food Info</div>
                        <div className="text-amber-700">
                          Drain weight: {EnhancedFoodDatabaseService.getDrainWeight(analysis.foodKey, analysis.category)?.drainWeight}oz 
                          (#{EnhancedFoodDatabaseService.getDrainWeight(analysis.foodKey, analysis.category)?.canSize} can)
                        </div>
                      </div>
                    )}
                    
                    {/* Available Units Display */}
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="font-medium text-blue-800">📏 Available Units</div>
                      <div className="text-blue-700">
                        {EnhancedFoodDatabaseService.getAvailableUnits(analysis.foodKey, analysis.category).join(', ')}
                      </div>
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

      {/* Examples Card */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Example Calculations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Common Ingredients</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">1 large egg</span>
                <span className="font-medium">~70 kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1 cup cooked rice</span>
                <span className="font-medium">~205 kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1 medium banana</span>
                <span className="font-medium">~105 kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1 tablespoon olive oil</span>
                <span className="font-medium">~120 kcal</span>
              </div>
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