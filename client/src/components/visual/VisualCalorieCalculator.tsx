/**
 * Visual Calorie Calculator with ADHD-friendly Design
 * Enhanced version of the original calculator with visual elements
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FoodImageClipping } from './FoodImageClipping';
import { InteractiveProgressRing } from './InteractiveProgressRing';
import { SwipeActionCard, commonSwipeActions } from './SwipeActionCard';
import { ADHDFriendlyToggle } from './ADHDFriendlyToggle';
import { Search, Plus, Minus, Calculator, Flame, ChefHat, Target } from 'lucide-react';

interface IngredientItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

interface VisualCalorieCalculatorProps {
  onCalculationComplete?: (result: any) => void;
  className?: string;
}

export function VisualCalorieCalculator({ 
  onCalculationComplete, 
  className = '' 
}: VisualCalorieCalculatorProps) {
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [showResults, setShowResults] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Sample food database with images for visual appeal
  const foodDatabase = [
    {
      id: '1',
      name: 'Banana',
      caloriesPer100g: 89,
      proteinPer100g: 1.1,
      carbsPer100g: 23,
      fatPer100g: 0.3,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDJDNDQgMiA1NCA2IDU0IDMyQzU0IDU4IDQ0IDYyIDMyIDYyQzIwIDYyIDEwIDU4IDEwIDMyQzEwIDYgMjAgMiAzMiAyWiIgZmlsbD0iI0ZCRDA0MSIvPgo8cGF0aCBkPSJNMzIgNkM0MCA2IDQ2IDEwIDQ2IDMyQzQ2IDU0IDQwIDU4IDMyIDU4QzI0IDU4IDE4IDU0IDE4IDMyQzE4IDEwIDI0IDYgMzIgNloiIGZpbGw9IiNGRkY3MzMiLz4KPC9zdmc+',
      units: ['piece', 'g', 'cup']
    },
    {
      id: '2',
      name: 'Chicken Breast',
      caloriesPer100g: 165,
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEwSDU0VjU0SDEwVjEwWiIgZmlsbD0iI0Y5QzJCQSIvPgo8cGF0aCBkPSJNMTYgMTZINDhWNDhIMTZWMTZaIiBmaWxsPSIjRkRCN0EzIi8+Cjwvc3ZnPg==',
      units: ['g', 'oz', 'piece']
    },
    {
      id: '3',
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjQiIGZpbGw9IiNGRkY3RkYiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjAiIGZpbGw9IiNGOUY5RjkiLz4KPC9zdmc+',
      units: ['g', 'cup', 'oz']
    }
  ];

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredient = () => {
    if (!selectedIngredient || !amount) return;

    const numAmount = parseFloat(amount);
    const factor = numAmount / 100; // Convert to per 100g

    const ingredient: IngredientItem = {
      id: Date.now().toString(),
      name: selectedIngredient.name,
      amount: numAmount,
      unit,
      calories: Math.round(selectedIngredient.caloriesPer100g * factor),
      protein: Math.round(selectedIngredient.proteinPer100g * factor * 10) / 10,
      carbs: Math.round(selectedIngredient.carbsPer100g * factor * 10) / 10,
      fat: Math.round(selectedIngredient.fatPer100g * factor * 10) / 10,
      image: selectedIngredient.image
    };

    setIngredients([...ingredients, ingredient]);
    setAmount('');
    setSelectedIngredient(null);
    setSearchTerm('');
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredientAmount = (id: string, newAmount: number) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === id) {
        const factor = newAmount / 100;
        const food = foodDatabase.find(f => f.name === ing.name);
        if (food) {
          return {
            ...ing,
            amount: newAmount,
            calories: Math.round(food.caloriesPer100g * factor),
            protein: Math.round(food.proteinPer100g * factor * 10) / 10,
            carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
            fat: Math.round(food.fatPer100g * factor * 10) / 10
          };
        }
      }
      return ing;
    }));
  };

  const totalNutrition = ingredients.reduce(
    (total, ing) => ({
      calories: total.calories + ing.calories,
      protein: total.protein + ing.protein,
      carbs: total.carbs + ing.carbs,
      fat: total.fat + ing.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calculateResults = () => {
    if (ingredients.length === 0) return;
    
    setShowResults(true);
    onCalculationComplete?.(totalNutrition);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Toggle */}
      <Card className="p-4 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Visual Calculator</h2>
              <p className="text-sm text-gray-600">Build your meal visually</p>
            </div>
          </div>
          <ADHDFriendlyToggle
            checked={isCompactMode}
            onChange={setIsCompactMode}
            label="Compact"
            size="sm"
            variant="default"
          />
        </div>

        {/* Food Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Food Results */}
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-2"
            >
              {filteredFoods.map((food) => (
                <motion.button
                  key={food.id}
                  onClick={() => setSelectedIngredient(food)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedIngredient?.id === food.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FoodImageClipping
                    src={food.image}
                    alt={food.name}
                    size="sm"
                    clipPath="circle"
                  />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{food.name}</div>
                    <div className="text-xs text-gray-600">
                      {food.caloriesPer100g} cal/100g
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Amount Input */}
          {selectedIngredient && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-2"
            >
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              >
                {selectedIngredient.units.map((u: string) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <Button onClick={addIngredient} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Ingredients List */}
      {ingredients.length > 0 && (
        <Card className="p-4 bg-white/90 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Ingredients</h3>
          <div className="space-y-3">
            {ingredients.map((ingredient) => (
              <SwipeActionCard
                key={ingredient.id}
                leftActions={[{
                  ...commonSwipeActions.delete,
                  action: () => removeIngredient(ingredient.id)
                }]}
                className="p-0"
              >
                <div className="flex items-center gap-3 p-4">
                  <FoodImageClipping
                    src={ingredient.image || ''}
                    alt={ingredient.name}
                    size="sm"
                    clipPath="organic"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{ingredient.name}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{ingredient.amount}{ingredient.unit}</span>
                      <Badge variant="outline" className="text-xs">
                        {ingredient.calories} cal
                      </Badge>
                    </div>
                  </div>
                  {!isCompactMode && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateIngredientAmount(ingredient.id, Math.max(0, ingredient.amount - 10))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateIngredientAmount(ingredient.id, ingredient.amount + 10)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </SwipeActionCard>
            ))}
          </div>
        </Card>
      )}

      {/* Nutrition Summary */}
      {ingredients.length > 0 && (
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nutrition Summary</h3>
            <Badge className="bg-green-100 text-green-800">
              {ingredients.length} ingredients
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <InteractiveProgressRing
              value={totalNutrition.calories}
              max={600}
              size={80}
              strokeWidth={6}
              label="Calories"
              showValue={true}
              color="#10b981"
            />
            <InteractiveProgressRing
              value={totalNutrition.protein}
              max={50}
              size={80}
              strokeWidth={6}
              label="Protein"
              unit="g"
              showValue={true}
              color="#ef4444"
            />
            <InteractiveProgressRing
              value={totalNutrition.carbs}
              max={80}
              size={80}
              strokeWidth={6}
              label="Carbs"
              unit="g"
              showValue={true}
              color="#f59e0b"
            />
            <InteractiveProgressRing
              value={totalNutrition.fat}
              max={30}
              size={80}
              strokeWidth={6}
              label="Fat"
              unit="g"
              showValue={true}
              color="#3b82f6"
            />
          </div>

          <Button
            onClick={calculateResults}
            className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            <Target className="w-5 h-5 mr-2" />
            Calculate & Save Results
          </Button>
        </Card>
      )}

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowResults(false)}
          >
            <Card className="p-6 bg-white max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Calculation Complete!</h3>
                <p className="text-gray-600 mb-4">Your meal has been calculated and saved</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-medium ml-2">{totalNutrition.calories}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-medium ml-2">{totalNutrition.protein}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-medium ml-2">{totalNutrition.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fat:</span>
                      <span className="font-medium ml-2">{totalNutrition.fat}g</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowResults(false)}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}