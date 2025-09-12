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

import { EnhancedIngredientDatabaseManager, type IngredientData } from '@/data/enhancedIngredientDatabase';
import { getLocalDateKey, formatLocalTime, getMealTypeByTime } from '@/utils/dateUtils';
import { validatePortionSize as validateFDAPortionSize, convertToGrams, getVisualReference } from '@/data/servingSizesDatabase';
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
  Calendar,
  Copy
} from 'lucide-react';
import { FoodSearchWithHistory } from '@/components/FoodSearchWithHistory';


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
  portionInfo?: {
    isRealistic?: boolean;
    warning?: string;
    suggestion?: string;
    recommendedServing?: string;
    recommendedCalories?: number;
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
  const [recentAnalyses, setRecentAnalyses] = useState<IngredientAnalysis[]>([]);
  const [showLoggedAnimation, setShowLoggedAnimation] = useState(false);
  const [loggedData, setLoggedData] = useState<any>(null);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<Array<{category: string; key: string; data: IngredientData}>>([]);
  const [portionWarning, setPortionWarning] = useState<{warning: string; suggestion: string} | null>(null);

  // Achievement system hook
  const checkAchievements = useCheckAchievements();

  // Search ingredients as user types
  useEffect(() => {
    if (ingredient.length >= 2 && !isCompact) {
      const customSuggestions = EnhancedIngredientDatabaseManager.searchIngredients(ingredient);
      setIngredientSuggestions(customSuggestions.slice(0, 6));
    } else {
      setIngredientSuggestions([]);
    }
  }, [ingredient, isCompact]);

  // Check portion size as user types
  useEffect(() => {
    if (ingredient.trim() && measurement.trim()) {
      const warning = validatePortionSize(ingredient, measurement);
      setPortionWarning(warning);
    } else {
      setPortionWarning(null);
    }
  }, [ingredient, measurement]);



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
      console.log('API Response:', data);
      console.log('Portion Info:', data.portionInfo);
      
      // Also set any API-provided portion warnings for display
      if (data.portionInfo?.warning && data.portionInfo.warning !== 'No warning') {
        console.log('Setting portion warning from API:', data.portionInfo);
        // Don't reset form immediately if there's a warning to show
        setRecentAnalyses(prev => [data, ...prev.slice(0, 4)]);
      } else {
        setRecentAnalyses(prev => [data, ...prev.slice(0, 4)]);
        resetForm();
      }
      
      // Calculate scaling factor for the actual serving size
      const caloriesPer100g = data.nutritionPer100g?.calories || 100;
      const scalingFactor = caloriesPer100g > 0 ? data.estimatedCalories / caloriesPer100g : 1;
      
      // Send calculated calories to tracking hook with properly scaled macros AND micronutrients
      if (onCaloriesCalculated) {
        onCaloriesCalculated({
          name: `${data.ingredient} (${data.measurement})`,
          calories: data.estimatedCalories,
          protein: (data.nutritionPer100g?.protein || 0) * scalingFactor,
          carbs: (data.nutritionPer100g?.carbs || 0) * scalingFactor,
          fat: (data.nutritionPer100g?.fat || 0) * scalingFactor,
          // Include properly scaled micronutrients from USDA data
          iron: (data.nutritionPer100g?.iron || 0) * scalingFactor,
          calcium: (data.nutritionPer100g?.calcium || 0) * scalingFactor,
          zinc: (data.nutritionPer100g?.zinc || 0) * scalingFactor,
          magnesium: (data.nutritionPer100g?.magnesium || 0) * scalingFactor,
          vitaminC: (data.nutritionPer100g?.vitaminC || 0) * scalingFactor,
          vitaminD: (data.nutritionPer100g?.vitaminD || 0) * scalingFactor,
          vitaminB12: (data.nutritionPer100g?.vitaminB12 || 0) * scalingFactor,
          folate: (data.nutritionPer100g?.folate || 0) * scalingFactor,
          vitaminA: (data.nutritionPer100g?.vitaminA || 0) * scalingFactor,
          vitaminE: (data.nutritionPer100g?.vitaminE || 0) * scalingFactor,
          potassium: (data.nutritionPer100g?.potassium || 0) * scalingFactor,
          phosphorus: (data.nutritionPer100g?.phosphorus || 0) * scalingFactor,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          ingredients: [data.ingredient]
        });
      }
    },
  });

  // Client-side portion validation using FDA RACC data
  const validatePortionSize = (ingredient: string, measurement: string) => {
    const cleanIngredient = ingredient.toLowerCase().trim();
    const cleanMeasurement = measurement.toLowerCase().trim();
    
    // Convert measurement to grams using FDA database
    const grams = convertToGrams(cleanMeasurement, cleanIngredient);
    
    if (grams === 0) {
      console.log(`Could not convert measurement "${cleanMeasurement}" to grams for validation`);
      return null; // Skip validation if we can't convert
    }
    
    console.log(`FDA Validation - Ingredient: "${cleanIngredient}", Measurement: "${cleanMeasurement}", Converted grams: ${grams}`);
    
    // Use FDA RACC database for validation
    const validation = validateFDAPortionSize(cleanIngredient, grams);
    const visualRef = getVisualReference(cleanIngredient);
    
    if (!validation.isReasonable) {
      return {
        warning: validation.warning || 'Portion size may not be accurate',
        suggestion: validation.recommendation || `FDA Standard: ${validation.fdaServing || 'check serving size'}`
      };
    }
    
    return null; // No warning needed
  };

  // Helper functions
  const resetForm = () => {
    setIngredient('');
    setMeasurement('');
    setPortionWarning(null);
  };



  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ingredient.trim()) return;
    if (!measurement.trim()) return; // Require measurement input, no defaults

    calculateCalories.mutate({ ingredient: ingredient.trim(), measurement: measurement.trim() });
  };

  const logToWeeklyTracker = async (analysis: IngredientAnalysis) => {
    const now = new Date(); // Use actual current date
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
        date: mealData.date, // Use local date key (YYYY-MM-DD) for proper date handling
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
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-amber-200/40 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Quick Calorie Calculator</h3>
        </div>
        
        <form onSubmit={handleCalculate} className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <FoodSearchWithHistory
              onSelectFood={async (food) => {
                // Quick re-log from history
                const now = new Date(); // Use actual current date
                const mealType = getMealTypeByTime(now);
                
                const mealData: LoggedMealData = {
                  id: `relogged-${Date.now()}`,
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                  date: getLocalDateKey(now),
                  time: formatLocalTime(now),
                  mealType,
                  category: mealType,
                  timestamp: now.toISOString(),
                  source: 'history'
                };
                
                const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
                weeklyMeals.push(mealData);
                localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
                
                window.dispatchEvent(new CustomEvent('calories-logged'));
                window.dispatchEvent(new CustomEvent('meals-updated'));
                
                // Show toast
                window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { 
                    message: `✅ Re-logged ${food.name}!`,
                    type: 'success'
                  }
                }));
              }}
              onSearchChange={(query) => setIngredient(query)}
              placeholder="Search Meal's"
              className="text-base bg-amber-50/90 border-2 border-amber-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg pr-4 py-3 text-gray-950 placeholder-gray-700"
            />
            <Input
              placeholder="Measurement (e.g., 1 cup, 100g, 1 medium)"
              value={measurement}
              onChange={(e) => setMeasurement(e.target.value)}
              className="text-base bg-white/80 border-2 border-amber-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-4 py-3 text-gray-950 placeholder-gray-700"
              data-testid="input-measurement-compact"
            />
          </div>
          
          {/* Portion Warning Alert */}
          {portionWarning && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Portion Size Check
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {portionWarning.warning}
                  </p>
                  <p className="text-xs text-orange-600 mt-1 font-medium">
                    {portionWarning.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || !measurement.trim()}
            className="w-full"
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
              <div key={index} className="p-3 bg-amber-50/60 rounded-lg">
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
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 mx-4 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Trophy className="w-10 h-10 text-amber-600" />
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
                  <div className="text-gray-900">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-bold">{loggedData.carbs?.toFixed(1)}g</div>
                  <div className="text-gray-900">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-600 font-bold">{loggedData.fat?.toFixed(1)}g</div>
                  <div className="text-gray-900">Fat</div>
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

      {/* User Guide Card - Moved Above */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-amber-200/40 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Food Entry</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Search your meal history</p>
              <p>• Enter any food name</p>
              <p>• Get instant calorie estimates</p>
              <p>• Track detailed nutrition</p>
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
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-amber-200/40 shadow-lg" data-testid="calorie-calculator">
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
            {/* Enhanced Food Search with History */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Food
              </label>
              <FoodSearchWithHistory
                onSelectFood={async (food) => {
                  // For historical meals, we can directly log them
                  const now = new Date(); // Use actual current date
                  const mealType = getMealTypeByTime(now);
                  
                  // Create the logged meal data
                  const mealData: LoggedMealData = {
                    id: `relogged-${Date.now()}`,
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    date: getLocalDateKey(now),
                    time: formatLocalTime(now),
                    mealType,
                    category: mealType,
                    timestamp: now.toISOString(),
                    source: 'history'
                  };
                  
                  // Store in localStorage
                  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
                  weeklyMeals.push(mealData);
                  localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
                  
                  // Save to database
                  try {
                    await apiRequest('POST', '/api/meals/logged', {
                      name: mealData.name,
                      date: mealData.timestamp,
                      mealType: mealData.mealType,
                      totalCalories: mealData.calories,
                      totalProtein: mealData.protein,
                      totalCarbs: mealData.carbs,
                      totalFat: mealData.fat
                    });
                    
                    // Show success animation
                    setLoggedData(mealData);
                    setShowLoggedAnimation(true);
                    setTimeout(() => setShowLoggedAnimation(false), 3000);
                    
                    // Dispatch events for other components
                    window.dispatchEvent(new CustomEvent('calories-logged'));
                    window.dispatchEvent(new CustomEvent('meals-updated'));
                    
                    // Check achievements
                    checkAchievements.mutate();
                  } catch (error) {
                    // Silent fail - meal is already saved to localStorage
                  }
                }}
                onSearchChange={(query) => {
                  setIngredient(query);
                  // Clear USDA suggestions for historical search
                  setIngredientSuggestions([]);
                }}
                placeholder="Search Meal's"
                className="text-base bg-amber-50/90 border-2 border-amber-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg pr-4 py-3 text-gray-950 placeholder-gray-700"
              />
              
              <p className="text-xs text-gray-900 mt-1">
                Search your meal history or enter new food items
              </p>
            </div>
            
            {/* Measurement Input - Simplified */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement
              </label>
              <Input
                placeholder="e.g., 1 cup, 100g, 1 medium, 2 tablespoons, 1 slice"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="text-base bg-white/80 border-2 border-amber-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-4 py-3 text-gray-950 placeholder-gray-700"
                data-testid="input-measurement"
              />
              <p className="text-xs text-gray-900 mt-1">
                Any measurement works - the system will provide the best estimate
              </p>
            </div>
          </div>

          {/* Real-time Portion Warning */}
          {portionWarning && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    ⚠️ Portion Size Check
                  </p>
                  <p className="text-xs text-orange-700 mb-1">
                    {portionWarning.warning}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">
                    {portionWarning.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={calculateCalories.isPending || !ingredient.trim() || !measurement.trim()}
            className="w-full text-lg py-6"
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
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-amber-200/40 shadow-lg">
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
                    <Badge variant="default" className="bg-orange-600 text-white text-lg px-3 py-1 mb-1">
                      <Flame className="w-4 h-4 mr-1" />
                      {analysis.estimatedCalories} kcal
                    </Badge>
                    <p className="text-xs text-gray-900">Total for this portion</p>
                  </div>
                </div>

                {/* Portion Warning Display */}
                {(() => {
                  console.log(`Analysis ${index} portionInfo:`, analysis.portionInfo);
                  return analysis.portionInfo?.warning && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-yellow-800 font-medium mb-1">
                            {analysis.portionInfo.warning}
                          </p>
                          {analysis.portionInfo.suggestion && (
                            <p className="text-xs text-yellow-700">
                              {analysis.portionInfo.suggestion}
                            </p>
                          )}
                          {analysis.portionInfo.recommendedServing && (
                            <p className="text-xs text-yellow-700 mt-1">
                              <strong>Suggested:</strong> {analysis.portionInfo.recommendedServing}
                              {analysis.portionInfo.recommendedCalories && (
                                <span> ({analysis.portionInfo.recommendedCalories} cal)</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

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

                {/* Portion Size Warnings from API */}
                {analysis.portionInfo && analysis.portionInfo.warning && analysis.portionInfo.warning !== 'No warning' && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-yellow-600">⚠️</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          {analysis.portionInfo.warning}
                        </p>
                        {analysis.portionInfo.suggestion && analysis.portionInfo.suggestion !== 'No suggestion' && (
                          <p className="text-sm text-yellow-700 mt-1">
                            {analysis.portionInfo.suggestion}
                          </p>
                        )}
                        {analysis.portionInfo.recommendedServing && (
                          <p className="text-sm text-yellow-700 mt-1">
                            Suggested serving: {analysis.portionInfo.recommendedServing} 
                            {analysis.portionInfo.recommendedCalories && (
                              <span> ({analysis.portionInfo.recommendedCalories} cal)</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {analysis.nutritionPer100g && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-900 mb-2 font-medium">Nutrition per 100g (for comparison):</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-amber-50/60 rounded">
                        <Beef className="w-4 h-4 mx-auto text-red-500 mb-1" />
                        <p className="text-xs text-gray-600">Protein</p>
                        <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.protein)}g</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50/60 rounded">
                        <Wheat className="w-4 h-4 mx-auto text-[#faed39] mb-1" />
                        <p className="text-xs text-gray-600">Carbs</p>
                        <p className="font-bold text-gray-900">{Math.round(analysis.nutritionPer100g.carbs)}g</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50/60 rounded">
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
                      className="w-full bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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

      {/* Simple User Food Suggestions - One line text only */}
      <UserFoodTextSuggestions onSuggestionClick={(foodName) => setIngredient(foodName)} />
    </div>
  );
}

// Enhanced food suggestions with nutritional info
interface UserFoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  iron?: number;
  calcium?: number;
  vitaminC?: number;
  zinc?: number;
  magnesium?: number;
  vitaminD?: number;
  vitaminB12?: number;
  folate?: number;
}

function UserFoodTextSuggestions({ onSuggestionClick }: { onSuggestionClick: (foodName: string) => void }) {
  const [userFoods, setUserFoods] = useState<UserFoodData[]>([]);
  const [copiedFood, setCopiedFood] = useState<string | null>(null);

  // Add food directly to meal log
  const addFoodToMeal = (food: UserFoodData) => {
    try {
      // Get current meal type based on time
      const mealType = getMealTypeByTime(new Date());
      
      // Dispatch calories-logged event to add to meal tracker
      window.dispatchEvent(new CustomEvent('calories-logged', {
        detail: {
          source: 'calculator',
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          mealType: mealType,
          timestamp: new Date().toISOString(),
          // Include micronutrients
          iron: food.iron || 0,
          calcium: food.calcium || 0,
          zinc: food.zinc || 0,
          magnesium: food.magnesium || 0,
          vitaminC: food.vitaminC || 0,
          vitaminD: food.vitaminD || 0,
          vitaminB12: food.vitaminB12 || 0,
          folate: food.folate || 0
        }
      }));

      // Show success toast
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: `✅ Added "${food.name}" to ${mealType}`,
          type: 'success'
        }
      }));

      console.log(`🍽️ Added food to meal: ${food.name}`);
    } catch (error) {
      console.error('❌ Failed to add food to meal:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: `❌ Failed to add ${food.name}`,
          type: 'error'
        }
      }));
    }
  };

  // Copy food name to clipboard
  const copyFoodInfo = async (food: UserFoodData) => {
    try {
      // Set visual feedback immediately
      setCopiedFood(food.name);
      
      // Copy only the food name
      await navigator.clipboard.writeText(food.name);
      
      // Show simple success confirmation
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: `✅ Copied "${food.name}" to clipboard`,
          type: 'success'
        }
      }));

      // Log successful copy
      console.log(`📋 Food name copied to clipboard: ${food.name}`);

      // Reset visual feedback after 2 seconds
      setTimeout(() => {
        setCopiedFood(null);
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to copy food entry:', error);
      setCopiedFood(null);
      
      // Show error toast
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: `❌ Failed to copy ${food.name}`,
          type: 'error'
        }
      }));
    }
  };

  useEffect(() => {
    const loadUserFoods = () => {
      try {
        const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        
        // Calculate one week ago from current date
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Extract unique foods with their nutritional data from last week only
        const userEnteredFoods = weeklyMeals
          .filter((meal: any) => {
            // Only include user-entered meals
            if (meal.source !== 'user-suggestion' && meal.source !== 'calculator') {
              return false;
            }
            
            // Only include meals from the last week
            if (meal.date) {
              const mealDate = new Date(meal.date);
              return mealDate >= oneWeekAgo;
            }
            
            // If no date, check if it has a dateKey in the last week
            if (meal.dateKey) {
              const mealDate = new Date(meal.dateKey);
              return mealDate >= oneWeekAgo;
            }
            
            // If no date info, exclude it (likely old data)
            return false;
          })
          .reduce((unique: UserFoodData[], meal: any) => {
            const foodName = meal.name.split(' (')[0]; // Remove measurement part
            
            // Check if this food already exists
            const existing = unique.find(f => f.name === foodName);
            if (!existing) {
              unique.push({
                name: foodName,
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                carbs: meal.carbs || 0,
                fat: meal.fat || 0,
                iron: meal.iron || 0,
                calcium: meal.calcium || 0,
                vitaminC: meal.vitaminC || 0,
                zinc: meal.zinc || 0,
                magnesium: meal.magnesium || 0,
                vitaminD: meal.vitaminD || 0,
                vitaminB12: meal.vitaminB12 || 0,
                folate: meal.folate || 0
              });
            }
            return unique;
          }, [])
          .slice(0, 6); // Limit to 6 suggestions for space
        
        setUserFoods(userEnteredFoods);
      } catch (error) {
        // Silent fail - just set empty array
        setUserFoods([]);
      }
    };

    loadUserFoods();

    // Listen for meal updates
    const handleMealUpdate = () => loadUserFoods();
    window.addEventListener('meals-updated', handleMealUpdate);
    window.addEventListener('calories-logged', handleMealUpdate);

    return () => {
      window.removeEventListener('meals-updated', handleMealUpdate);
      window.removeEventListener('calories-logged', handleMealUpdate);
    };
  }, []);

  if (userFoods.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-amber-200">
      <p className="text-xs text-gray-900 mb-3">Quick suggestions (last 7 days):</p>
      <div className="space-y-3">
        {userFoods.map((food) => (
          <div key={food.name} className="text-sm bg-amber-50/80 border border-amber-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  {food.name}
                </div>
                
                {/* Macronutrients */}
                <div className="flex flex-wrap gap-3 mb-2 text-xs">
                  <span className="text-orange-600 font-medium">{Math.round(food.calories || 0)} cal</span>
                  <span className="text-green-600">P: {(food.protein || 0).toFixed(1)}g</span>
                  <span className="text-yellow-600">C: {(food.carbs || 0).toFixed(1)}g</span>
                  <span className="text-purple-600">F: {(food.fat || 0).toFixed(1)}g</span>
                </div>
                
                {/* Micronutrients - organized by category */}
                {((food.iron || 0) > 0 || (food.calcium || 0) > 0 || (food.vitaminC || 0) > 0 || (food.zinc || 0) > 0 || (food.magnesium || 0) > 0 || (food.vitaminD || 0) > 0) && (
                  <div className="mt-2 space-y-2">
                    {/* Minerals Section */}
                    {((food.iron || 0) > 0 || (food.calcium || 0) > 0 || (food.zinc || 0) > 0 || (food.magnesium || 0) > 0) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Minerals</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(food.iron || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-slate-700 border-2 border-slate-500 hover:border-slate-600 hover:text-slate-800 transition-colors">
                              Fe {(food.iron || 0).toFixed(1)}mg
                            </span>
                          )}
                          {(food.calcium || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-stone-700 border-2 border-stone-500 hover:border-stone-600 hover:text-stone-800 transition-colors">
                              Ca {Math.round(food.calcium || 0)}mg
                            </span>
                          )}
                          {(food.zinc || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-gray-700 border-2 border-gray-500 hover:border-gray-600 hover:text-gray-800 transition-colors">
                              Zn {(food.zinc || 0).toFixed(1)}mg
                            </span>
                          )}
                          {(food.magnesium || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-neutral-700 border-2 border-neutral-500 hover:border-neutral-600 hover:text-neutral-800 transition-colors">
                              Mg {Math.round(food.magnesium || 0)}mg
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Vitamins Section */}
                    {((food.vitaminC || 0) > 0 || (food.vitaminD || 0) > 0 || (food.vitaminB12 || 0) > 0 || (food.folate || 0) > 0) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vitamins</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(food.vitaminC || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-orange-700 border-2 border-orange-500 hover:border-orange-600 hover:text-orange-800 transition-colors">
                              C {Math.round(food.vitaminC || 0)}mg
                            </span>
                          )}
                          {(food.vitaminD || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-amber-700 border-2 border-amber-500 hover:border-amber-600 hover:text-amber-800 transition-colors">
                              D {(food.vitaminD || 0).toFixed(1)}μg
                            </span>
                          )}
                          {(food.vitaminB12 || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-red-700 border-2 border-red-500 hover:border-red-600 hover:text-red-800 transition-colors">
                              B12 {(food.vitaminB12 || 0).toFixed(1)}μg
                            </span>
                          )}
                          {(food.folate || 0) > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-green-700 border-2 border-green-500 hover:border-green-600 hover:text-green-800 transition-colors">
                              Folate {Math.round(food.folate || 0)}μg
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Add Button */}
              <button
                onClick={() => addFoodToMeal(food)}
                className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                title={`Add ${food.name} to meal`}
                data-testid={`button-add-food-${food.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                Add
              </button>
              
              {/* Copy Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('📋 Copy button clicked for:', food.name);
                  copyFoodInfo(food);
                }}
                className={`ml-2 p-1.5 rounded-md transition-all duration-200 ${
                  copiedFood === food.name 
                    ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={copiedFood === food.name ? 'Copied to clipboard!' : `Copy food name: ${food.name}`}
                data-testid={`button-copy-food-${food.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {copiedFood === food.name ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalorieCalculator;