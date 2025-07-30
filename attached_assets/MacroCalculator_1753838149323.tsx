import { useState } from 'react';
import { Search, Plus, Minus, Scale, Calculator, Target, Zap, Droplets, Activity, ChevronDown, BookOpen, Save, Sparkles, TrendingUp, Award } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  amount: number;
  unit: string;
  image?: string;
  brand?: string;
  category?: string;
}

export function MacroCalculator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [showNutritionFacts, setShowNutritionFacts] = useState(false);

  const commonUnits = ['g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'ml'];

  const ingredientDatabase = [
    {
      id: '1',
      name: 'Grilled Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      baseAmount: 100,
      baseUnit: 'g',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      brand: 'Fresh',
      category: 'Protein'
    },
    {
      id: '2',
      name: 'Quinoa (Cooked)',
      calories: 123,
      protein: 4.4,
      carbs: 22,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9,
      sodium: 7,
      baseAmount: 100,
      baseUnit: 'g',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      brand: 'Organic',
      category: 'Grain'
    },
    {
      id: '3',
      name: 'Fresh Avocado',
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      sodium: 7,
      baseAmount: 100,
      baseUnit: 'g',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      brand: 'Fresh Market',
      category: 'Healthy Fat'
    },
    {
      id: '4',
      name: 'Extra Virgin Olive Oil',
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0,
      sugar: 0,
      sodium: 2,
      baseAmount: 100,
      baseUnit: 'ml',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      brand: 'Premium',
      category: 'Oil'
    },
    {
      id: '5',
      name: 'Baby Spinach',
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79,
      baseAmount: 100,
      baseUnit: 'g',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      brand: 'Organic',
      category: 'Vegetable'
    },
    {
      id: '6',
      name: 'Sweet Potato',
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fat: 0.1,
      fiber: 3,
      sugar: 4.2,
      sodium: 5,
      baseAmount: 100,
      baseUnit: 'g',
      image: 'https://images.unsplash.com/photo-1551516580-8834406b3e7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      brand: 'Farm Fresh',
      category: 'Vegetable'
    }
  ];

  const nutritionGoals = [
    { label: 'Calories', current: 0, target: 2200, unit: 'kcal', color: 'text-chart-1' },
    { label: 'Protein', current: 0, target: 150, unit: 'g', color: 'text-chart-2' },
    { label: 'Carbs', current: 0, target: 250, unit: 'g', color: 'text-chart-4' },
    { label: 'Fat', current: 0, target: 80, unit: 'g', color: 'text-chart-3' }
  ];

  const recipeInsights = [
    { icon: Award, label: 'High Protein', description: 'Great for muscle building', color: 'text-blue-600' },
    { icon: Sparkles, label: 'Nutrient Dense', description: 'Rich in vitamins & minerals', color: 'text-green-600' },
    { icon: TrendingUp, label: 'Balanced Macros', description: 'Well distributed nutrition', color: 'text-purple-600' },
    { icon: Target, label: 'Goal Aligned', description: 'Fits your daily targets', color: 'text-orange-600' }
  ];

  const calculateTotals = () => {
    return selectedIngredients.reduce(
      (totals, ingredient) => {
        const multiplier = ingredient.amount / 100;
        return {
          calories: totals.calories + ingredient.calories * multiplier,
          protein: totals.protein + ingredient.protein * multiplier,
          carbs: totals.carbs + ingredient.carbs * multiplier,
          fat: totals.fat + ingredient.fat * multiplier,
          fiber: totals.fiber + ingredient.fiber * multiplier,
          sugar: totals.sugar + ingredient.sugar * multiplier,
          sodium: totals.sodium + ingredient.sodium * multiplier
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  };

  const addIngredient = (ingredient: any) => {
    const newIngredient: Ingredient = {
      ...ingredient,
      amount: ingredient.baseAmount,
      unit: ingredient.baseUnit
    };
    setSelectedIngredients([...selectedIngredients, newIngredient]);
  };

  const updateIngredientAmount = (id: string, amount: number) => {
    setSelectedIngredients(
      selectedIngredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, amount } : ingredient
      )
    );
  };

  const removeIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter(ingredient => ingredient.id !== id));
  };

  const totals = calculateTotals();
  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#4ecdc4', percentage: 0 },
    { name: 'Carbs', value: totals.carbs, color: '#f9ca24', percentage: 0 },
    { name: 'Fat', value: totals.fat, color: '#45b7d1', percentage: 0 }
  ];

  // Calculate percentages for macro distribution
  const totalMacroGrams = totals.protein + totals.carbs + totals.fat;
  if (totalMacroGrams > 0) {
    macroData[0].percentage = (totals.protein / totalMacroGrams) * 100;
    macroData[1].percentage = (totals.carbs / totalMacroGrams) * 100;
    macroData[2].percentage = (totals.fat / totalMacroGrams) * 100;
  }

  const filteredIngredients = ingredientDatabase.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update nutrition goals with current values
  const updatedGoals = nutritionGoals.map(goal => ({
    ...goal,
    current: goal.label === 'Calories' ? totals.calories :
              goal.label === 'Protein' ? totals.protein :
              goal.label === 'Carbs' ? totals.carbs :
              goal.label === 'Fat' ? totals.fat : 0
  }));

  return (
    <div className="pb-24 max-w-md mx-auto animate-fade-in">
      {/* Hero Header */}
      <div className="relative -mx-4 mb-6">
        <div className="h-32 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"
            alt="Fresh ingredients background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-bold mb-1">Macro Calculator</h1>
            <p className="text-sm opacity-90">Build recipes with precise nutrition</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Nutrition Goals Metrics */}
        <div className="grid grid-cols-4 gap-2">
          {updatedGoals.map((goal, index) => (
            <Card key={index} className="p-3 text-center card-gradient">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{goal.label}</p>
                <h3 className={`text-lg font-bold ${goal.color}`}>
                  {goal.label === 'Calories' ? Math.round(goal.current) : goal.current.toFixed(1)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  of {goal.target}{goal.unit}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Search Ingredients */}
        <Card className="p-5 card-gradient">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Add Ingredients</h2>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search fresh ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-white/70"
            />
          </div>

          {searchQuery && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 hover:bg-white/90 transition-colors cursor-pointer"
                  onClick={() => addIngredient(ingredient)}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{ingredient.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {ingredient.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {ingredient.brand} • {ingredient.calories} cal per 100{ingredient.baseUnit}
                    </p>
                    <div className="flex space-x-3 text-xs">
                      <span className="text-chart-2 font-medium">{ingredient.protein}g protein</span>
                      <span className="text-chart-4 font-medium">{ingredient.carbs}g carbs</span>
                    </div>
                  </div>
                  <Plus size={16} className="text-primary" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <Card className="p-5 card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Recipe</h2>
              <Button size="sm" variant="outline">
                <Save size={14} className="mr-1" />
                Save Recipe
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedIngredients.map((ingredient, index) => (
                <div key={`${ingredient.id}-${index}`} className="p-4 rounded-xl bg-white/70 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden">
                        <ImageWithFallback
                          src={ingredient.image}
                          alt={ingredient.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{ingredient.name}</h4>
                        <p className="text-sm text-muted-foreground">{ingredient.brand}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Minus size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => updateIngredientAmount(ingredient.id, Math.max(1, ingredient.amount - 10))}
                    >
                      <Minus size={12} />
                    </Button>
                    
                    <Input
                      value={ingredient.amount}
                      onChange={(e) => updateIngredientAmount(ingredient.id, Number(e.target.value) || 0)}
                      className="h-8 text-center flex-1 border-0 bg-white/50"
                      type="number"
                    />
                    
                    <Select value={ingredient.unit}>
                      <SelectTrigger className="h-8 w-16 border-0 bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => updateIngredientAmount(ingredient.id, ingredient.amount + 10)}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center p-2 rounded-lg bg-white/50">
                      <div className="font-bold text-chart-1">
                        {Math.round(ingredient.calories * (ingredient.amount / 100))}
                      </div>
                      <div className="text-muted-foreground">cal</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/50">
                      <div className="font-bold text-chart-2">
                        {(ingredient.protein * (ingredient.amount / 100)).toFixed(1)}g
                      </div>
                      <div className="text-muted-foreground">protein</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/50">
                      <div className="font-bold text-chart-4">
                        {(ingredient.carbs * (ingredient.amount / 100)).toFixed(1)}g
                      </div>
                      <div className="text-muted-foreground">carbs</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/50">
                      <div className="font-bold text-chart-3">
                        {(ingredient.fat * (ingredient.amount / 100)).toFixed(1)}g
                      </div>
                      <div className="text-muted-foreground">fat</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Macro Summary */}
        {selectedIngredients.length > 0 && (
          <Card className="p-5 card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nutrition Summary</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNutritionFacts(!showNutritionFacts)}
              >
                <BookOpen size={14} className="mr-1" />
                {showNutritionFacts ? 'Hide' : 'Show'} Facts
              </Button>
            </div>
            
            {/* Main Macros */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-chart-1/20 to-chart-1/10">
                <div className="text-3xl font-bold text-chart-1 mb-1">{Math.round(totals.calories)}</div>
                <div className="text-sm text-muted-foreground">Total Calories</div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/50">
                  <div className="text-lg font-bold text-chart-2">{totals.protein.toFixed(1)}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/50">
                    <div className="text-sm font-bold text-chart-4">{totals.carbs.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/50">
                    <div className="text-sm font-bold text-chart-3">{totals.fat.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe Insights */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Recipe Insights</h3>
              <div className="grid grid-cols-2 gap-3">
                {recipeInsights.slice(0, 4).map((insight, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg bg-white/50">
                    <insight.icon className={`${insight.color}`} size={16} />
                    <div>
                      <p className="text-xs font-semibold">{insight.label}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Distribution Chart */}
            {totalMacroGrams > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Macro Distribution</h3>
                <div className="h-32 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {macroData.map((macro) => (
                    <div key={macro.name} className="text-center p-3 rounded-lg bg-white/50">
                      <div className="flex items-center justify-center mb-2">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className="text-sm font-semibold">{macro.name}</span>
                      </div>
                      <div className="text-lg font-bold">{macro.percentage.toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Nutrition Facts */}
            {showNutritionFacts && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-semibold">Additional Nutrients</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-white/50">
                    <div className="font-bold text-green-600">{totals.fiber.toFixed(1)}g</div>
                    <div className="text-sm text-muted-foreground">Fiber</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/50">
                    <div className="font-bold text-orange-600">{totals.sugar.toFixed(1)}g</div>
                    <div className="text-sm text-muted-foreground">Sugar</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/50">
                    <div className="font-bold text-red-600">{Math.round(totals.sodium)}mg</div>
                    <div className="text-sm text-muted-foreground">Sodium</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/50">
                    <div className="font-bold text-blue-600">{(totals.calories / 4).toFixed(0)}g</div>
                    <div className="text-sm text-muted-foreground">Sugar Equiv.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-6">
              <Button className="flex-1">
                <Plus size={16} className="mr-2" />
                Add to {new Date().getHours() < 12 ? 'Breakfast' : new Date().getHours() < 17 ? 'Lunch' : 'Dinner'}
              </Button>
              <Button variant="outline">
                <Target size={16} />
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {selectedIngredients.length === 0 && !searchQuery && (
          <Card className="p-8 text-center card-gradient">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80"
                alt="Fresh ingredients"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold mb-2">Start Building Your Recipe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Search and add fresh ingredients to calculate precise nutrition
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Zap className="text-chart-2" size={12} />
                <span>Protein tracking</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="text-chart-1" size={12} />
                <span>Calorie precision</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}