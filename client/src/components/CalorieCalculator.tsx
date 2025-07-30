/**
 * Enhanced Calorie Calculator Component
 * 
 * USDA-powered ingredient analysis with offline capabilities
 * Provides detailed nutrition breakdown and measurement conversions
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Calendar
} from 'lucide-react';

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
  const [recentAnalyses, setRecentAnalyses] = useState<IngredientAnalysis[]>([]);
  const queryClient = useQueryClient();

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
    
    // Enhanced measurement validation
    const cleanIngredient = ingredient.trim();
    const cleanMeasurement = measurement.trim();
    
    if (!cleanIngredient || !cleanMeasurement) {
      return;
    }
    
    // Validate measurement format
    const measurementValidation = validateMeasurement(cleanMeasurement);
    if (!measurementValidation.isValid) {
      // Show validation error notification
      const event = new CustomEvent('show-notification', {
        detail: {
          type: 'warning',
          title: 'Invalid Measurement',
          message: measurementValidation.suggestion || 'Please use format like "1 cup", "100g", "2 tbsp", "1 medium"'
        }
      });
      window.dispatchEvent(event);
      return;
    }
    
    calculateCalories.mutate({ ingredient: cleanIngredient, measurement: cleanMeasurement });
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

  const handleLogToWeekly = (analysis: IngredientAnalysis) => {
    if (onLogToWeekly) {
      const now = new Date();
      const hour = now.getHours();
      let category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      
      // Enhanced category assignment logic based on time
      if (hour >= 5 && hour < 11) category = 'breakfast';
      else if (hour >= 11 && hour < 16) category = 'lunch';  
      else if (hour >= 16 && hour < 21) category = 'dinner';
      else category = 'snack';

      // Log to weekly tracker with proper categorization
      onLogToWeekly({
        name: `${analysis.ingredient} (${analysis.measurement})`,
        calories: analysis.estimatedCalories,
        protein: analysis.nutritionPer100g?.protein || 0,
        carbs: analysis.nutritionPer100g?.carbs || 0,
        fat: analysis.nutritionPer100g?.fat || 0,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        category
      });
      
      console.log(`Logging to ${category}: ${analysis.ingredient} - ${analysis.estimatedCalories} cal`);
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
                  {onLogToWeekly && (
                    <Button
                      size="sm"
                      onClick={() => handleLogToWeekly(analysis)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Log to Weekly Tracker
                    </Button>
                  )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredient Name
              </label>
              <Input
                placeholder="e.g., chicken breast, Greek yogurt, banana"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use simple, common ingredient names for best results
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement
              </label>
              <Input
                placeholder="e.g., 1 cup, 100g, 1 medium, 2 tablespoons"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports cups, grams, ounces, pieces, and more
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || !measurement.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
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