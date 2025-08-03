/**
 * Enhanced Meal Planner Component
 * 
 * Intelligent meal planning with habit analysis and personalized suggestions
 * Focuses on user food habits and provides improvement recommendations
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  ChefHat,
  TrendingUp,
  Lightbulb,
  Target,
  Utensils,
  Plus,
  Star,
  Clock,
  Flame,
  Apple,
  Beef,
  Wheat,
  Heart,
  Brain,
  CheckCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import CalorieCalculator from '@/components/CalorieCalculator';

interface MealPlannerProps {
  onNavigate: (page: string) => void;
}

interface FoodSuggestion {
  id: number;
  suggestionType: string;
  title: string;
  description: string;
  recommendedFoods: any[];
  priority: number;
  reasoning: string;
}

interface MealEntry {
  id: number;
  name: string;
  calories: number;
  mealType: string;
  time: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

function MealPlannerEnhanced({ onNavigate }: MealPlannerProps) {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [activeView, setActiveView] = useState('suggestions');
  const queryClient = useQueryClient();

  // Fetch personalized suggestions based on user habits
  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/food-suggestions'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sample meal history analysis
  const habitAnalysis = {
    commonMeals: [
      { name: "Greek Yogurt Bowl", frequency: 15, avgCalories: 320 },
      { name: "Grilled Chicken Salad", frequency: 12, avgCalories: 450 },
      { name: "Oatmeal with Berries", frequency: 10, avgCalories: 280 }
    ],
    nutritionTrends: {
      proteinAvg: 95, // below goal of 120g
      carbsAvg: 180, // within goal of 200g
      fatAvg: 65, // within goal of 70g
      caloriesAvg: 1950, // slightly below goal of 2200
    },
    improvementAreas: [
      "Increase protein intake by 25g daily",
      "Add more variety to breakfast options", 
      "Include more fiber-rich vegetables",
      "Consider healthy snacks between meals"
    ]
  };

  const intelligentSuggestions = [
    {
      type: 'protein_boost',
      title: 'Boost Your Protein',
      description: 'You\'re averaging 95g protein daily. Try these high-protein foods to reach your 120g goal.',
      foods: [
        { name: 'Greek Yogurt (1 cup)', protein: '20g', calories: 130 },
        { name: 'Chicken Breast (100g)', protein: '31g', calories: 165 },
        { name: 'Lentils (1 cup cooked)', protein: '18g', calories: 230 },
        { name: 'Cottage Cheese (1/2 cup)', protein: '14g', calories: 90 }
      ],
      priority: 1,
      color: 'from-red-100 to-red-200'
    },
    {
      type: 'breakfast_variety',
      title: 'Breakfast Variety',
      description: 'Mix up your morning routine with these nutritious alternatives to your usual oatmeal.',
      foods: [
        { name: 'Avocado Toast', protein: '8g', calories: 220 },
        { name: 'Smoothie Bowl', protein: '15g', calories: 280 },
        { name: 'Veggie Omelet', protein: '20g', calories: 250 },
        { name: 'Chia Pudding', protein: '6g', calories: 200 }
      ],
      priority: 2,
      color: 'from-yellow-100 to-yellow-200'
    },
    {
      type: 'fiber_focus',
      title: 'Fiber-Rich Additions',
      description: 'Boost your digestive health and satiety with these fiber-packed vegetables.',
      foods: [
        { name: 'Broccoli (1 cup)', protein: '3g', calories: 25 },
        { name: 'Brussels Sprouts (1 cup)', protein: '3g', calories: 38 },
        { name: 'Artichoke (1 medium)', protein: '4g', calories: 60 },
        { name: 'Black Beans (1/2 cup)', protein: '8g', calories: 115 }
      ],
      priority: 3,
      color: 'from-green-100 to-green-200'
    },
    {
      type: 'healthy_snacks',
      title: 'Smart Snacking',
      description: 'Bridge the gap between meals with these nutrient-dense snack options.',
      foods: [
        { name: 'Mixed Nuts (1 oz)', protein: '6g', calories: 170 },
        { name: 'Apple with Almond Butter', protein: '4g', calories: 190 },
        { name: 'Hard-Boiled Egg', protein: '6g', calories: 70 },
        { name: 'Hummus with Veggies', protein: '4g', calories: 120 }
      ],
      priority: 4,
      color: 'from-purple-100 to-purple-200'
    }
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 1 + i);
    return date;
  });

  const renderHabitAnalysis = () => (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Your Nutrition Habits</h3>
          <p className="text-sm text-gray-600">Based on your recent meal entries</p>
        </div>
      </div>

      {/* Nutrition Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Beef className="w-5 h-5 mx-auto text-red-500 mb-1" />
          <p className="text-sm text-gray-600">Protein</p>
          <p className="text-lg font-bold text-gray-900">{habitAnalysis.nutritionTrends.proteinAvg}g</p>
          <p className="text-xs text-red-600">Need +25g</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Wheat className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
          <p className="text-sm text-gray-600">Carbs</p>
          <p className="text-lg font-bold text-gray-900">{habitAnalysis.nutritionTrends.carbsAvg}g</p>
          <p className="text-xs text-green-600">On track</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Apple className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <p className="text-sm text-gray-600">Fat</p>
          <p className="text-lg font-bold text-gray-900">{habitAnalysis.nutritionTrends.fatAvg}g</p>
          <p className="text-xs text-green-600">Good</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-sm text-gray-600">Calories</p>
          <p className="text-lg font-bold text-gray-900">{habitAnalysis.nutritionTrends.caloriesAvg}</p>
          <p className="text-xs text-yellow-600">Need +250</p>
        </div>
      </div>

      {/* Common Meals */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Your Most Frequent Meals</h4>
        <div className="space-y-2">
          {habitAnalysis.commonMeals.map((meal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{meal.name}</p>
                  <p className="text-sm text-gray-600">{meal.frequency} times this month</p>
                </div>
              </div>
              <Badge variant="secondary">{meal.avgCalories} cal</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Improvement Opportunities</h4>
        <div className="space-y-2">
          {habitAnalysis.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-gray-700">{area}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderIntelligentSuggestions = () => (
    <div className="space-y-4">
      {intelligentSuggestions.map((suggestion, index) => (
        <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className={`p-4 bg-gradient-to-r ${suggestion.color} rounded-lg mb-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-lg">
                {suggestion.type === 'protein_boost' && <Beef className="w-5 h-5 text-red-600" />}
                {suggestion.type === 'breakfast_variety' && <ChefHat className="w-5 h-5 text-yellow-600" />}
                {suggestion.type === 'fiber_focus' && <Heart className="w-5 h-5 text-green-600" />}
                {suggestion.type === 'healthy_snacks' && <Star className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{suggestion.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  Priority {suggestion.priority}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-700">{suggestion.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestion.foods.map((food, foodIndex) => (
              <div key={foodIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{food.name}</p>
                  <p className="text-sm text-gray-600">{food.protein} protein • {food.calories} cal</p>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Apply These Suggestions
          </Button>
        </Card>
      ))}
    </div>
  );

  const renderWeeklyPlanner = () => (
    <div className="space-y-4">
      {/* Week Navigation */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Weekly Meal Plan</h3>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            This Week
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {currentWeek.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(date)}
              className={`p-3 rounded-lg text-center ${
                date.toDateString() === selectedDay.toDateString()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <p className="text-xs font-medium">{weekDays[index]}</p>
              <p className="text-sm font-bold">{date.getDate()}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Daily Meal Plan */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Plan Day
          </Button>
        </div>

        <div className="space-y-4">
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => (
            <div key={mealType} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{mealType}</h4>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Utensils className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No meals planned</p>
                <p className="text-xs text-gray-400">Tap to add a meal or use suggestions</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const views = [
    { id: 'suggestions', label: 'Smart Suggestions', icon: Lightbulb },
    { id: 'analysis', label: 'Habit Analysis', icon: TrendingUp },
    { id: 'planner', label: 'Weekly Planner', icon: Calendar },
    { id: 'calculator', label: 'Calorie Calculator', icon: Target }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'suggestions': return renderIntelligentSuggestions();
      case 'analysis': return renderHabitAnalysis();
      case 'planner': return renderWeeklyPlanner();
      case 'calculator': return <CalorieCalculator isCompact={false} />;
      default: return renderIntelligentSuggestions();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Hero Section */}
      <HeroSection
        title="Smart Meal Planning"
        subtitle="Personalized suggestions based on your habits"
        caloriesConsumed={habitAnalysis.nutritionTrends.caloriesAvg}
        caloriesGoal={2200}
        currentStreak={7}
      />

      {/* Navigation Tabs */}
      <div className="px-4 py-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {views.map((view) => {
              const IconComponent = view.icon;
              return (
                <Button
                  key={view.id}
                  variant={activeView === view.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(view.id)}
                  className={`flex flex-col h-auto py-3 px-2 ${
                    activeView === view.id 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium text-center">{view.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6">
        {renderContent()}
      </div>
    </div>
  );
}

export default MealPlannerEnhanced;