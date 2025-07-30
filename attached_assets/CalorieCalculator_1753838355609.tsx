/**
 * Bytewise Visual Recipe Builder
 * 
 * Modern visual recipe building system with click-to-add interface
 * Features:
 * - Visual two-column layout with equal heights
 * - High-resolution food icons with category-based organization
 * - Enhanced quantity selection with comprehensive measurement options
 * - Real-time USDA food database integration with visual search
 * - Brand-compliant design with seamless header-hero integration
 * - Mobile-first responsive design with touch-friendly interactions
 * - Advanced measurement system: oz, ml, qt, piece, 1/2, 1/4, custom portions
 * - Visual feedback for selection states
 * - Auto-save functionality with enhanced notification system
 * - Nutritional calculations with real-time totals display
 * - Click-to-add functionality replacing drag and drop
 * - Popup selection for meal categories, quantities, and measurements
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Search, ChefHat, Calendar, RotateCcw, Trash2, Calculator, Clock, Users, Target, ArrowRight, X, Loader, AlertCircle, ChevronLeft, ChevronRight, Save, CheckCircle, Edit3, Filter, Utensils, BookmarkCheck, Grip, Scale, Coffee, Sandwich, Utensils as DinnerIcon, Apple } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useFoodDatabase, LocalFoodItem, FoodPortion } from './FoodDatabaseManager';
import { 
  NotificationSystem, 
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
    { id: 'base-serving', name: '1 serving', value: 'serving', gramWeight: 100, type: 'piece', source: 'base', symbol: 'srv' },
    { id: 'base-portion', name: '1 portion', value: 'portion', gramWeight: 150, type: 'piece', source: 'base', symbol: 'portion' },
    { id: 'base-plate', name: '1 plate', value: 'plate', gramWeight: 200, type: 'piece', source: 'base', symbol: 'plate' },
    { id: 'base-bowl', name: '1 bowl', value: 'bowl', gramWeight: 180, type: 'piece', source: 'base', symbol: 'bowl' }
  ];

  // Process USDA custom portions
  let customMeasurements: MeasurementOption[] = [];
  const portions = safeArray(food.portions);
  
  if (portions.length > 0) {
    customMeasurements = portions.map((portion, index) => {
      const portionName = portion?.name || `Portion ${index + 1}`;
      const gramWeight = portion?.gramWeight || 100;
      
      return {
        id: `custom-${food.fdcId}-${index}`,
        name: portionName,
        value: `custom-${food.fdcId}-${portionName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
        gramWeight: gramWeight,
        type: 'custom' as const,
        source: 'custom' as const,
        symbol: portionName.length > 10 ? portionName.substring(0, 8) + '...' : portionName
      };
    }).filter(Boolean);
  }

  return [...customMeasurements, ...baseMeasurements];
};

// Enhanced food icon component with high-resolution display
const FoodIcon = React.memo(({ food, size = 'md' }: { food: LocalFoodItem; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Get category-based icon
  const getCategoryIcon = (food: LocalFoodItem) => {
    const description = (food.description || '').toLowerCase();
    
    if (description.includes('milk') || description.includes('cheese') || description.includes('yogurt')) {
      return '🥛';
    }
    if (description.includes('meat') || description.includes('beef') || description.includes('chicken') || description.includes('turkey')) {
      return '🥩';
    }
    if (description.includes('fish') || description.includes('salmon') || description.includes('tuna')) {
      return '🐟';
    }
    if (description.includes('bread') || description.includes('rice') || description.includes('pasta') || description.includes('cereal')) {
      return '🍞';
    }
    if (description.includes('apple') || description.includes('banana') || description.includes('orange')) {
      return '🍎';
    }
    if (description.includes('carrot') || description.includes('broccoli') || description.includes('spinach')) {
      return '🥕';
    }
    if (description.includes('egg')) {
      return '🥚';
    }
    if (description.includes('oil') || description.includes('butter')) {
      return '🧈';
    }
    
    return '🍽️'; // Default food icon
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 flex items-center justify-center text-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-200`}>
      <div className="text-center">
        <div className="text-lg mb-1">{getCategoryIcon(food)}</div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div 
            className="text-white text-xs p-1 truncate"
            style={{ 
              fontFamily: "'Quicksand', sans-serif", 
              fontSize: "0.625rem", 
              fontWeight: 500 
            }}
          >
            {food.description?.split(',')[0] || 'Food Item'}
          </div>
        </div>
      </div>
    </div>
  );
});

FoodIcon.displayName = 'FoodIcon';

// Enhanced quantity selector component with wider input for multi-digit numbers
const QuantitySelector = React.memo(({ 
  amount, 
  unit, 
  measurements, 
  onAmountChange, 
  onUnitChange 
}: {
  amount: number;
  unit: string;
  measurements: MeasurementOption[];
  onAmountChange: (amount: number) => void;
  onUnitChange: (unit: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Input
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
        className="w-20 text-center mobile-safe-input quantity-input"
        style={{ 
          fontFamily: "'Work Sans', sans-serif", 
          fontSize: "16px !important", 
          fontWeight: 500,
          minWidth: '80px !important',
          minHeight: '44px !important',
          padding: '0.5rem 0.25rem !important'
        }}
        min="0.1"
        step="0.1"
        placeholder="1"
      />
      <Select value={unit} onValueChange={onUnitChange}>
        <SelectTrigger className="w-32 mobile-safe-input unit-select" style={{ fontSize: "16px !important", minHeight: "44px !important" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {measurements.map((measurement) => (
            <SelectItem key={measurement.id} value={measurement.value}>
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs opacity-70"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {measurement.symbol}
                </span>
                <span 
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem" }}
                >
                  {measurement.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

QuantitySelector.displayName = 'QuantitySelector';

export function CalorieCalculator({ onNavigate }: CalorieCalculatorProps) {
  // Enhanced notification system
  const { 
    notifications, 
    addNotification, 
    dismissNotification, 
    clearAllNotifications 
  } = useNotificationSystem();

  // Database integration
  const { 
    searchFoods, 
    getFoodById, 
    getPopularFoods, 
    isLoading: dbLoading, 
    isInitialized, 
    error: dbError,
    getDatabaseStats 
  } = useFoodDatabase();
  
  // Date and meal logging state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [currentMealLog, setCurrentMealLog] = useState<DailyMealLog | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocalFoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Selection state (replacing drag state)
  const [selectedFood, setSelectedFood] = useState<LocalFoodItem | null>(null);
  const [quickAddAmount, setQuickAddAmount] = useState(1);
  const [quickAddUnit, setQuickAddUnit] = useState('serving');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  
  // Save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // Drop zones for meals (now click zones)
  const [dropZones, setDropZones] = useState<DropZone[]>([
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
      emoji: '🥗'
    },
    {
      id: 'dinner',
      name: 'Dinner',
      icon: DinnerIcon,
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
  ]);

  // Enhanced search with debouncing
  const searchFoodsDebounced = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      
      if (!isInitialized) {
        setSearchError('Database not ready');
        return;
      }
      
      setIsSearching(true);
      setSearchError(null);
      
      try {
        const results = await searchFoods(query, 20);
        const safeResults = safeArray(results);
        setSearchResults(safeResults);
        
        if (safeResults.length === 0) {
          setSearchError(`No foods found for "${query}"`);
        } else {
          addNotification(createSearchResultNotification(query, safeResults.length));
        }
        
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
        
        addNotification({
          type: 'error',
          message: 'Search failed. Please try again.',
          duration: 3000
        });
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchFoods, isInitialized, addNotification]
  );
  
  useEffect(() => {
    searchFoodsDebounced(searchQuery);
  }, [searchQuery, searchFoodsDebounced]);

  // Load popular foods when search is empty
  useEffect(() => {
    if (!searchQuery.trim() && isInitialized && searchResults.length === 0) {
      const loadPopularFoods = async () => {
        try {
          const popular = await getPopularFoods();
          const safePopular = safeArray(popular);
          setSearchResults(safePopular);
        } catch (error) {
          console.error('Failed to load popular foods:', error);
        }
      };
      
      loadPopularFoods();
    }
  }, [searchQuery, isInitialized, getPopularFoods, searchResults.length]);

  // Calculate nutritional values for ingredient
  const calculateNutrition = useCallback((food: LocalFoodItem, amount: number, unit: string) => {
    const measurements = getMeasurementOptions(food);
    const selectedMeasurement = measurements.find(m => m.value === unit);
    const gramWeight = selectedMeasurement?.gramWeight || 100;
    const totalGrams = (amount * gramWeight) / 100;

    return {
      calories: Math.round((getNutrientValue(food.nutrients, 208) || 0) * totalGrams),
      protein: Math.round((getNutrientValue(food.nutrients, 203) || 0) * totalGrams * 10) / 10,
      carbs: Math.round((getNutrientValue(food.nutrients, 205) || 0) * totalGrams * 10) / 10,
      fat: Math.round((getNutrientValue(food.nutrients, 204) || 0) * totalGrams * 10) / 10,
      fiber: Math.round((getNutrientValue(food.nutrients, 291) || 0) * totalGrams * 10) / 10,
      sugar: Math.round((getNutrientValue(food.nutrients, 269) || 0) * totalGrams * 10) / 10,
      sodium: Math.round((getNutrientValue(food.nutrients, 307) || 0) * totalGrams)
    };
  }, []);

  // Handle food item click (replacing drag start)
  const handleFoodClick = useCallback((food: LocalFoodItem) => {
    setSelectedFood(food);
    setQuickAddAmount(1);
    setQuickAddUnit('serving');
    setSelectedMealType('breakfast');
    setShowQuickAdd(true);
  }, []);

  // Handle adding ingredient to meal (replacing drop)
  const handleAddIngredient = useCallback(() => {
    if (!selectedFood) return;
    
    const nutrition = calculateNutrition(selectedFood, quickAddAmount, quickAddUnit);
    
    const newIngredient: LoggedIngredient = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fdcId: selectedFood.fdcId,
      name: selectedFood.description || 'Unknown Food',
      amount: quickAddAmount,
      unit: quickAddUnit,
      ...nutrition,
      category: selectedFood.category,
      portions: selectedFood.portions,
      availableMeasurements: getMeasurementOptions(selectedFood),
      loggedAt: new Date().toISOString(),
      mealType: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    };

    setDropZones(prev => prev.map(zone => 
      zone.id === selectedMealType 
        ? { ...zone, ingredients: [...zone.ingredients, newIngredient] }
        : zone
    ));

    // Reset selection state
    setShowQuickAdd(false);
    setSelectedFood(null);

    // Show notification
    addNotification(createMealLogNotification(
      selectedMealType,
      newIngredient.name,
      newIngredient.calories,
      newIngredient.protein,
      'added'
    ));

    // Auto-save
    setTimeout(() => {
      saveMealLog();
    }, 500);
  }, [selectedFood, quickAddAmount, quickAddUnit, selectedMealType, calculateNutrition, addNotification]);

  // Save meal log
  const saveMealLog = useCallback(() => {
    if (isAutoSaving) return;
    
    setSaveStatus('saving');
    setIsAutoSaving(true);
    
    try {
      const updatedMealLog: DailyMealLog = {
        date: selectedDate,
        meals: {
          breakfast: dropZones.find(z => z.id === 'breakfast')?.ingredients || [],
          lunch: dropZones.find(z => z.id === 'lunch')?.ingredients || [],
          dinner: dropZones.find(z => z.id === 'dinner')?.ingredients || [],
          snack: dropZones.find(z => z.id === 'snack')?.ingredients || []
        },
        totals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        lastModified: new Date().toISOString(),
        version: '3.0'
      };

      // Calculate totals
      const allIngredients = Object.values(updatedMealLog.meals).flat();
      updatedMealLog.totals = allIngredients.reduce(
        (acc, ingredient) => ({
          calories: acc.calories + (ingredient.calories || 0),
          protein: acc.protein + (ingredient.protein || 0),
          carbs: acc.carbs + (ingredient.carbs || 0),
          fat: acc.fat + (ingredient.fat || 0),
          fiber: acc.fiber + (ingredient.fiber || 0),
          sugar: acc.sugar + (ingredient.sugar || 0),
          sodium: acc.sodium + (ingredient.sodium || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      );

      // Save to localStorage
      let savedMealLogs = {};
      try {
        const existingData = localStorage.getItem('dailyMealLogs');
        savedMealLogs = existingData ? JSON.parse(existingData) : {};
      } catch (error) {
        savedMealLogs = {};
      }

      savedMealLogs[selectedDate] = updatedMealLog;
      localStorage.setItem('dailyMealLogs', JSON.stringify(savedMealLogs));
      
      setCurrentMealLog(updatedMealLog);
      setSaveStatus('saved');

      // Dispatch event for dashboard
      window.dispatchEvent(new CustomEvent('bytewise-meal-log-updated', {
        detail: {
          date: selectedDate,
          mealLog: updatedMealLog,
          saveTime: Date.now()
        }
      }));

      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsAutoSaving(false);
    }
  }, [selectedDate, dropZones, isAutoSaving]);

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const allIngredients = dropZones.flatMap(zone => zone.ingredients);
    return allIngredients.reduce(
      (acc, ingredient) => ({
        calories: acc.calories + (ingredient.calories || 0),
        protein: acc.protein + (ingredient.protein || 0),
        carbs: acc.carbs + (ingredient.carbs || 0),
        fat: acc.fat + (ingredient.fat || 0),
        fiber: acc.fiber + (ingredient.fiber || 0),
        sugar: acc.sugar + (ingredient.sugar || 0),
        sodium: acc.sodium + (ingredient.sodium || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  }, [dropZones]);

  // Remove ingredient from meal
  const removeIngredient = useCallback((zoneId: string, ingredientId: string) => {
    setDropZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { ...zone, ingredients: zone.ingredients.filter(ing => ing.id !== ingredientId) }
        : zone
    ));
    
    setTimeout(() => {
      saveMealLog();
    }, 300);
  }, [saveMealLog]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero Section - Brand Guidelines Compliant with Dashboard Style */}
      <div className="relative -mx-3 mb-6">
        <div className="h-64 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Fresh cooking ingredients and kitchen workspace for recipe building"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-x-4 bottom-3 top-16 flex flex-col justify-end text-white">
            {/* Three-Column Layout - Brand Guidelines Standard */}
            <div className="flex items-center justify-between mb-3">
              {/* Left Column - Title & Description */}
              <div>
                <p 
                  className="text-sm opacity-90 mb-1" 
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
                >
                  Build your perfect meal
                </p>
                <h1 
                  style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.2 }}
                >
                  Recipe Builder
                </h1>
                <p 
                  className="text-sm opacity-90 mt-1" 
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
                >
                  Click ingredients to add to your meals
                </p>
              </div>

              {/* Right Column - Statistics Card */}
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 mb-1">
                  <ChefHat className="text-yellow-400" size={16} />
                  <span 
                    className="text-2xl font-bold" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    {dropZones.reduce((sum, zone) => sum + zone.ingredients.length, 0)}
                  </span>
                </div>
                <p 
                  className="text-xs opacity-90" 
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                >
                  ingredients
                </p>
              </div>
            </div>
            
            {/* Bottom Row - Daily Summary */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-md rounded-2xl px-3 py-2.5 flex-1 min-w-0">
                <div className="text-center">
                  <div 
                    className="text-lg font-bold" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    {dailyTotals.calories}
                  </div>
                  <div 
                    className="text-xs text-white/80" 
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    Calories
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div 
                    className="text-lg font-bold" 
                    style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    {Math.round(dailyTotals.protein)}g
                  </div>
                  <div 
                    className="text-xs text-white/80" 
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    Protein
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-0 text-white text-center mobile-safe-input focus:outline-none"
                    style={{ 
                      fontFamily: "'Work Sans', sans-serif", 
                      fontSize: "0.875rem", 
                      fontWeight: 500,
                      width: "auto"
                    }}
                  />
                </div>
              </div>
              
              {/* Save Status Indicator */}
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-1 text-white/80">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Saved</span>
                  </div>
                )}
                <Button
                  onClick={saveMealLog}
                  disabled={isAutoSaving}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 space-y-4">
        {/* Enhanced Two-Column Layout with Equal Heights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto">
          {/* Left Column: Food Database with Visual Search */}
          <Card className="p-4 h-full min-h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                  Food Database
                </h3>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  Click to add ingredients
                </p>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative mb-4 search-input-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 mobile-safe-input search-input"
                style={{ 
                  fontFamily: "'Work Sans', sans-serif", 
                  fontSize: "16px !important", 
                  fontWeight: 500,
                  minHeight: '44px !important'
                }}
              />
              {isSearching && (
                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" size={16} />
              )}
            </div>

            {/* Database Status */}
            <div className="mb-4">
              {!isInitialized && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading food database...</span>
                </div>
              )}
              
              {dbError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Database error: {dbError}</span>
                </div>
              )}
            </div>

            {/* Search Results with Click-to-Add */}
            <div className="flex-1 overflow-y-auto hover-scroll-area food-database-list" data-recipe-builder>
              {searchError && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-sm text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    {searchError}
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((food) => (
                    <div
                      key={food.fdcId}
                      onClick={() => handleFoodClick(food)}
                      className="group cursor-pointer hover-scroll-item food-database-item flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-sm transition-all duration-200 mobile-safe-input"
                      style={{ minHeight: '44px' }}
                    >
                      <FoodIcon food={food} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 
                              className="line-clamp-1 text-brand-subheading" 
                              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}
                            >
                              {food.description || 'Unknown Food'}
                            </h4>
                            {food.brandName && (
                              <p 
                                className="text-xs text-muted-foreground text-brand-body" 
                                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                              >
                                {food.brandName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="text-right">
                              <div 
                                className="text-sm font-medium text-brand-subheading" 
                                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 600 }}
                              >
                                {Math.round(getNutrientValue(food.nutrients, 208) || 0)} cal
                              </div>
                              <div 
                                className="text-xs text-muted-foreground text-brand-body" 
                                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
                              >
                                per 100g
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Right Column: Meal Categories with Click-to-View */}
          <Card className="p-4 h-full min-h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center border-2 border-secondary">
                <Utensils className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                  Today's Meals
                </h3>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Meal Categories Grid */}
            <div className="flex-1 space-y-3 overflow-y-auto hover-scroll-area">
              {dropZones.map((zone) => {
                const IconComponent = zone.icon;
                return (
                  <div
                    key={zone.id}
                    className={`p-4 rounded-xl border-2 border-dashed ${zone.borderColor} ${zone.bgColor} transition-all duration-200 min-h-[120px]`}
                    data-meal-category
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${zone.bgColor} border ${zone.borderColor} flex items-center justify-center`}>
                          <IconComponent size={16} className={zone.color} />
                        </div>
                        <div>
                          <h4 
                            className={`text-brand-subheading ${zone.color}`} 
                            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 600 }}
                          >
                            {zone.name}
                          </h4>
                          <p 
                            className="text-xs text-muted-foreground text-brand-body" 
                            style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                          >
                            {zone.ingredients.length} ingredients
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className={`text-lg font-bold ${zone.color}`} 
                          style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                        >
                          {zone.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0)}
                        </div>
                        <div 
                          className="text-xs text-muted-foreground text-brand-body" 
                          style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                        >
                          calories
                        </div>
                      </div>
                    </div>

                    {/* Ingredients List */}
                    {zone.ingredients.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-2xl mb-2">{zone.emoji}</div>
                        <p 
                          className="text-sm text-muted-foreground text-brand-body" 
                          style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
                        >
                          No ingredients added yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {zone.ingredients.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30"
                          >
                            <div className="flex-1 min-w-0">
                              <h5 
                                className="line-clamp-1 text-brand-subheading" 
                                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}
                              >
                                {ingredient.name}
                              </h5>
                              <p 
                                className="text-xs text-muted-foreground text-brand-body" 
                                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                              >
                                {ingredient.amount} {ingredient.unit} • {ingredient.calories} cal
                              </p>
                            </div>
                            <Button
                              onClick={() => removeIngredient(zone.id, ingredient.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Enhanced Nutrition Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                Daily Nutrition Summary
              </h3>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Calculated from logged ingredients
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-orange-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {dailyTotals.calories}
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Calories
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-blue-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {Math.round(dailyTotals.protein)}g
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Protein
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-green-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {Math.round(dailyTotals.carbs)}g
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Carbs
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-purple-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {Math.round(dailyTotals.fat)}g
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Fat
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-yellow-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {Math.round(dailyTotals.fiber)}g
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Fiber
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-pink-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {Math.round(dailyTotals.sugar)}g
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Sugar
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold text-red-600" 
                style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
              >
                {Math.round(dailyTotals.sodium)}mg
              </div>
              <div 
                className="text-xs text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
              >
                Sodium
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Food Selection Popup */}
      {showQuickAdd && selectedFood && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
                Add to Meal
              </h3>
              <Button
                onClick={() => setShowQuickAdd(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Food Preview */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FoodIcon food={selectedFood} size="sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="line-clamp-1 text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
                    {selectedFood.description}
                  </h4>
                  {selectedFood.brandName && (
                    <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                      {selectedFood.brandName}
                    </p>
                  )}
                </div>
              </div>

              {/* Meal Type Selection */}
              <div>
                <label className="text-brand-label block mb-2" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  Add to:
                </label>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger className="mobile-safe-input" style={{ fontSize: "16px !important", minHeight: "44px !important" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dropZones.map((zone) => {
                      const IconComponent = zone.icon;
                      return (
                        <SelectItem key={zone.id} value={zone.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent size={16} className={zone.color} />
                            <span>{zone.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity and Unit Selection */}
              <div>
                <label className="text-brand-label block mb-2" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  Quantity & Unit:
                </label>
                <QuantitySelector
                  amount={quickAddAmount}
                  unit={quickAddUnit}
                  measurements={getMeasurementOptions(selectedFood)}
                  onAmountChange={setQuickAddAmount}
                  onUnitChange={setQuickAddUnit}
                />
              </div>

              {/* Nutrition Preview */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h5 className="text-brand-subheading mb-2" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>
                  Nutrition Preview:
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(() => {
                    const nutrition = calculateNutrition(selectedFood, quickAddAmount, quickAddUnit);
                    return (
                      <>
                        <div className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                          Calories: <span className="font-medium">{nutrition.calories}</span>
                        </div>
                        <div className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                          Protein: <span className="font-medium">{nutrition.protein}g</span>
                        </div>
                        <div className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                          Carbs: <span className="font-medium">{nutrition.carbs}g</span>
                        </div>
                        <div className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                          Fat: <span className="font-medium">{nutrition.fat}g</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQuickAdd(false)}
                  variant="outline"
                  className="flex-1 text-brand-button mobile-safe-input"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "16px !important", fontWeight: 500, minHeight: "44px !important" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddIngredient}
                  className="flex-1 text-brand-button mobile-safe-input"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "16px !important", fontWeight: 500, minHeight: "44px !important" }}
                >
                  <Plus size={16} className="mr-2" />
                  Add to {dropZones.find(z => z.id === selectedMealType)?.name}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
      />
    </div>
  );
}