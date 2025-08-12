/**
 * Enhanced Calorie Calculator Component
 * 
 * USDA-powered ingredient analysis with offline capabilities
 * Provides detailed nutrition breakdown and measurement conversions
 */

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedIngredientDatabaseManager, type IngredientData } from '@/data/enhancedIngredientDatabase';
import { getLocalDateKey, formatLocalTime, getMealTypeByTime } from '@/utils/dateUtils';
import { getCorrectedDate, getCorrectedDateKey } from '@/utils/dateAdjustment';
import { 
  Search, 
  Calculator, 
  Flame, 
  Info, 
  CheckCircle,
  Plus,
  Sparkles,
  AlertCircle,
  Trophy,
  Scale,
  Beef,
  Wheat,
  Droplets,
  Calendar
} from 'lucide-react';
import { SimpleFoodSearch } from '@/components/SimpleFoodSearch';
import { LoggedFoodSuggestions } from '@/components/LoggedFoodSuggestions';

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
    // Micronutrients
    iron?: number;
    calcium?: number;
    zinc?: number;
    magnesium?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminB12?: number;
    folate?: number;
    vitaminA?: number;
    vitaminE?: number;
    potassium?: number;
    phosphorus?: number;
  };
  fdaServing?: string;
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

interface LoggedMealData {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // Micronutrients
  iron?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
  folate?: number;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
  source: string;
}

function CalorieCalculator({ 
  onAddToMeal, 
  onNavigate, 
  onCaloriesCalculated, 
  onLogToWeekly, 
  isCompact = false 
}: CalorieCalculatorProps) {
  // State management
  const [ingredient, setIngredient] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [amount, setAmount] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState<IngredientAnalysis[]>([]);
  const [showLoggedAnimation, setShowLoggedAnimation] = useState(false);
  const [loggedData, setLoggedData] = useState<any>(null);

  const [selectedIngredient, setSelectedIngredient] = useState<{category: string; key: string; data: IngredientData} | null>(null);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  // Achievement system hook
  const checkAchievements = useCheckAchievements();

  // Removed ingredient suggestions - using simple search only

  // Update available units when ingredient is selected
  useEffect(() => {
    if (selectedIngredient) {
      const units = EnhancedIngredientDatabaseManager.getAvailableUnits(
        selectedIngredient.category, 
        selectedIngredient.key
      );
      setAvailableUnits(units);
      if (units.length > 0 && !selectedUnit) {
        setSelectedUnit(units[0]);
      }
    }
  }, [selectedIngredient]);

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
      resetForm();
      
      // Calculate scaling factor for the actual serving size
      const caloriesPer100g = data.nutritionPer100g?.calories || 100;
      const scalingFactor = caloriesPer100g > 0 ? data.estimatedCalories / caloriesPer100g : 1;
      
      // Send calculated calories to tracking hook with properly scaled macros
      if (onCaloriesCalculated) {
        onCaloriesCalculated({
          name: `${data.ingredient} (${data.measurement})`,
          calories: data.estimatedCalories,
          protein: (data.nutritionPer100g?.protein || 0) * scalingFactor,
          carbs: (data.nutritionPer100g?.carbs || 0) * scalingFactor,
          fat: (data.nutritionPer100g?.fat || 0) * scalingFactor,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          ingredients: [data.ingredient]
        });
      }
    },
  });

  // Helper functions
  const resetForm = () => {
    setIngredient('');
    setMeasurement('');
    setAmount('');
    setSelectedUnit('');
    setSelectedIngredient(null);
  };



  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ingredient.trim()) return;

    let measurementText = '';
    if (selectedIngredient && amount && selectedUnit) {
      measurementText = `${amount} ${selectedUnit}`;
      calculateCalories.mutate({ 
        ingredient: selectedIngredient.data.usdaQuery || ingredient.trim(), 
        measurement: measurementText 
      });
    } else if (measurement.trim()) {
      calculateCalories.mutate({ ingredient: ingredient.trim(), measurement: measurement.trim() });
    } else {
      calculateCalories.mutate({ ingredient: ingredient.trim(), measurement: '100g' });
    }
  };

  const logToWeeklyTracker = async (analysis: IngredientAnalysis) => {
    const now = getCorrectedDate(); // Use corrected date (Monday 11th)
    const mealType = getMealTypeByTime(now);

    // Calculate scaling factor based on actual serving vs 100g
    // The estimatedCalories is already scaled for the actual serving
    // So we can derive the scaling factor from calories
    const caloriesPer100g = analysis.nutritionPer100g?.calories || 100;
    const scalingFactor = caloriesPer100g > 0 ? analysis.estimatedCalories / caloriesPer100g : 1;

    const mealData: LoggedMealData = {
      id: `calc-${Date.now()}`,
      name: `${analysis.ingredient} (${analysis.measurement})`,
      calories: analysis.estimatedCalories,
      // Scale macronutrients based on actual serving size
      protein: (analysis.nutritionPer100g?.protein || 0) * scalingFactor,
      carbs: (analysis.nutritionPer100g?.carbs || 0) * scalingFactor,
      fat: (analysis.nutritionPer100g?.fat || 0) * scalingFactor,
      // Scale micronutrients based on actual serving size (real data from USDA when available)
      iron: (analysis.nutritionPer100g?.iron || 0) * scalingFactor,
      calcium: (analysis.nutritionPer100g?.calcium || 0) * scalingFactor,
      zinc: (analysis.nutritionPer100g?.zinc || 0) * scalingFactor,
      magnesium: (analysis.nutritionPer100g?.magnesium || 0) * scalingFactor,
      vitaminC: (analysis.nutritionPer100g?.vitaminC || 0) * scalingFactor,
      vitaminD: (analysis.nutritionPer100g?.vitaminD || 0) * scalingFactor,
      vitaminB12: (analysis.nutritionPer100g?.vitaminB12 || 0) * scalingFactor,
      folate: (analysis.nutritionPer100g?.folate || 0) * scalingFactor,
      date: getLocalDateKey(now),
      time: formatLocalTime(now),
      mealType,
      category: mealType,
      timestamp: now.toISOString(),
      source: 'calculator'
    };



    // Store in localStorage for weekly logger to access  
    const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    weeklyMeals.push(mealData);
    localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
    
    // CRITICAL FIX: Also save meal to database for achievement system
    try {
      const response = await apiRequest('POST', '/api/meals/logged', {
        name: mealData.name,
        date: mealData.timestamp, // Use ISO timestamp for proper date handling
        mealType: mealData.mealType,
        totalCalories: mealData.calories,
        totalProtein: mealData.protein,
        totalCarbs: mealData.carbs,
        totalFat: mealData.fat,
        // Include micronutrients in API request
        iron: mealData.iron,
        calcium: mealData.calcium,
        zinc: mealData.zinc,
        magnesium: mealData.magnesium,
        vitaminC: mealData.vitaminC,
        vitaminD: mealData.vitaminD,
        vitaminB12: mealData.vitaminB12,
        folate: mealData.folate
      });
      
      const result = await response.json();
      
      // If achievements were earned from the database call, trigger UI notifications
      if (result.newAchievements && result.newAchievements.length > 0) {
        
        // Dispatch achievement notifications for each new achievement
        result.newAchievements.forEach((achievement: any) => {
          // Dispatch event that ModernFoodLayout is listening for
          window.dispatchEvent(new CustomEvent('achievement-unlocked', {
            detail: {
              type: 'milestone',
              title: achievement.title,
              message: achievement.description || achievement.title,
              description: achievement.description || achievement.title,
              points: 10,
              icon: achievement.iconName || 'trophy'
            }
          }));
        });
      }
      
    } catch (error) {
      // Meal save error handled by user feedback system
      // Still check achievements even if database save fails (fallback)
      checkAchievements.mutate();
    }
    
    // Dispatch events for weekly logger refresh
    window.dispatchEvent(new CustomEvent('calories-logged', { detail: mealData }));
    window.dispatchEvent(new CustomEvent('meal-logged-success', { detail: mealData }));
    window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
    
    // Show success animation
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

    // Call the original callback if it exists
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

  // Compact view for smaller spaces
  if (isCompact) {
    return (
      <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Quick Calorie Calculator</h3>
        </div>
        
        <form onSubmit={handleCalculate} className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <FoodSearchWithHistory
              value={ingredient}
              onSelectFood={(food) => {
                console.log('CalorieCalculator - onSelectFood called with:', food.name);
                console.log('Current ingredient state before:', ingredient);
                // Just populate the search field with the food name
                // Don't log it automatically - wait for user to set portion and calculate
                setIngredient(food.name);
                console.log('Setting ingredient to:', food.name);
                // Optionally pre-fill a standard serving size
                if (!measurement) {
                  setMeasurement('1 serving');
                }
              }}
              onSearchChange={(query) => setIngredient(query)}
              placeholder="Search meals or add new..."
              className="w-full"
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
                      onClick={() => onAddToMeal(analysis)}
                      className="w-full"
                    >
                      Add to Meal
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => logToWeeklyTracker(analysis)}
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

  // Full view
  return (
    <div className="space-y-6 relative">
      {/* Success Animation Modal */}
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

      {/* User Guide Card */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
        
        <p className="text-sm text-gray-700 mb-4">
          To use the calorie calculator enter exactly what you ate and add the portion size. The calorie calculator will correctly provide the macro and micro breakdown of your meal showing the calorie amount.
        </p>
        
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

      {/* Main Calculator */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Universal Calorie Calculator</h2>
            <p className="text-sm text-gray-600">Calculate calories for any food item with smart nutrition estimates</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Simple Food Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Ingredient
              </label>
              <SimpleFoodSearch
                onSearchChange={(query) => {
                  setIngredient(query);
                }}
                placeholder="Enter food name..."
                className="w-full"
              />
              
              <p className="text-xs text-gray-500 mt-1">
                Enter any food item to calculate calories
              </p>
            </div>
            
            {/* Measurement Input */}
            {selectedIngredient ? (
              // Enhanced mode with unit selection
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    step="0.25"
                    placeholder="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.replace('_', ' ')}
                        </SelectItem>
                      ))}
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
                  placeholder="e.g., 1 cup, 100g, 1 medium, 2 tablespoons, 1 slice"
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  className="text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Any measurement works - the system will provide the best estimate
                </p>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || (!measurement.trim() && !(selectedIngredient && amount && selectedUnit))}
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
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{analysis.ingredient}</h4>
                    <p className="text-gray-600 text-sm">{analysis.measurement}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-orange-500 text-white text-lg px-3 py-1 mb-1">
                      <Flame className="w-4 h-4 mr-1" />
                      {analysis.estimatedCalories} kcal
                    </Badge>
                    <p className="text-xs text-gray-500">Total for this portion</p>
                  </div>
                </div>

                {analysis.equivalentMeasurement && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700 font-medium">
                      <Scale className="w-4 h-4 inline mr-1" />
                      Reference: {analysis.equivalentMeasurement}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      This shows nutritional density for comparison
                    </p>
                  </div>
                )}

                {analysis.fdaServing && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700 font-medium">
                      <Droplets className="w-4 h-4 inline mr-1" />
                      FDA Standard Serving: {analysis.fdaServing}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Based on FDA Reference Amounts Customarily Consumed (RACC)
                    </p>
                  </div>
                )}

                {analysis.nutritionPer100g && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Nutrition per 100g (for comparison):</p>
                    <div className="grid grid-cols-3 gap-3">
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
                      onClick={() => onAddToMeal(analysis)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Add to Current Meal
                    </Button>
                  )}
                  <Button
                    onClick={() => logToWeeklyTracker(analysis)}
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

      {/* Logged Food Suggestions */}
      <LoggedFoodSuggestions 
        onSelectFood={(food) => {
          // Set the ingredient and measurement fields when a suggestion is clicked
          setIngredient(food.name);
          setMeasurement('1 serving');
          // Optionally, you could auto-calculate or provide quick-add functionality
        }}
      />
    </div>
  );
}

export default CalorieCalculator;