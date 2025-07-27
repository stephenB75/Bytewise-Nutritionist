import { useState } from 'react';
import { TrendingUp, Target, Calendar, Award, Plus, ChevronRight, Flame, Camera, Utensils, Coffee, Sunset, Moon, Star, Clock, Zap, Activity, Heart, Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DashboardProps {
  userName?: string;
  onNavigate?: (tab: string) => void;
}

export function Dashboard({ userName = 'User', onNavigate }: DashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('day');

  // Enhanced macro tracking data with better calculations based on realistic daily intake
  const macroGoals = {
    protein: { 
      current: 125, 
      target: 150, 
      percentage: Math.round((125 / 150) * 100), 
      color: '#4ecdc4',
      remaining: 150 - 125,
      sources: ['Chicken Breast (35g)', 'Greek Yogurt (17g)', 'Quinoa (8g)', 'Eggs (24g)', 'Salmon (42g)']
    },
    fat: { 
      current: 68, 
      target: 80, 
      percentage: Math.round((68 / 80) * 100), 
      color: '#45b7d1',
      remaining: 80 - 68,
      sources: ['Avocado (21g)', 'Olive Oil (14g)', 'Nuts (15g)', 'Salmon (18g)']
    },
    carbs: { 
      current: 210, 
      target: 250, 
      percentage: Math.round((210 / 250) * 100), 
      color: '#f9ca24',
      remaining: 250 - 210,
      sources: ['Oats (54g)', 'Quinoa (39g)', 'Sweet Potato (27g)', 'Rice (45g)', 'Banana (27g)', 'Berries (18g)']
    },
    calories: { 
      current: 1850, 
      target: 2200, 
      percentage: Math.round((1850 / 2200) * 100), 
      color: '#ff6b6b',
      remaining: 2200 - 1850
    }
  };

  // Enhanced micronutrient tracking based on consumed ingredients
  const micronutrients = {
    vitamins: [
      {
        name: 'Vitamin C',
        current: 85,
        target: 90,
        percentage: Math.round((85 / 90) * 100),
        unit: 'mg',
        color: '#ff6b6b',
        sources: ['Bell Peppers', 'Strawberries', 'Broccoli', 'Citrus Fruits'],
        benefits: 'Immune support, antioxidant'
      },
      {
        name: 'Vitamin D',
        current: 18,
        target: 20,
        percentage: Math.round((18 / 20) * 100),
        unit: 'μg',
        color: '#f9ca24',
        sources: ['Salmon', 'Fortified Foods', 'Mushrooms'],
        benefits: 'Bone health, immune function'
      },
      {
        name: 'Vitamin A',
        current: 720,
        target: 900,
        percentage: Math.round((720 / 900) * 100),
        unit: 'μg',
        color: '#f0932b',
        sources: ['Carrots', 'Sweet Potato', 'Spinach', 'Eggs'],
        benefits: 'Eye health, immune function'
      },
      {
        name: 'B12',
        current: 2.1,
        target: 2.4,
        percentage: Math.round((2.1 / 2.4) * 100),
        unit: 'μg',
        color: '#4ecdc4',
        sources: ['Salmon', 'Eggs', 'Greek Yogurt'],
        benefits: 'Energy metabolism, nerve function'
      }
    ],
    minerals: [
      {
        name: 'Iron',
        current: 14,
        target: 18,
        percentage: Math.round((14 / 18) * 100),
        unit: 'mg',
        color: '#dc3545',
        sources: ['Spinach', 'Quinoa', 'Chicken', 'Lentils'],
        benefits: 'Oxygen transport, energy'
      },
      {
        name: 'Calcium',
        current: 950,
        target: 1000,
        percentage: Math.round((950 / 1000) * 100),
        unit: 'mg',
        color: '#6c757d',
        sources: ['Greek Yogurt', 'Broccoli', 'Almonds'],
        benefits: 'Bone & teeth health'
      },
      {
        name: 'Magnesium',
        current: 310,
        target: 320,
        percentage: Math.round((310 / 320) * 100),
        unit: 'mg',
        color: '#28a745',
        sources: ['Quinoa', 'Spinach', 'Almonds', 'Avocado'],
        benefits: 'Muscle & nerve function'
      },
      {
        name: 'Potassium',
        current: 3200,
        target: 3500,
        percentage: Math.round((3200 / 3500) * 100),
        unit: 'mg',
        color: '#ffc107',
        sources: ['Banana', 'Sweet Potato', 'Salmon', 'Avocado'],
        benefits: 'Heart health, blood pressure'
      }
    ]
  };

  // Enhanced ingredient breakdown with detailed nutritional contributions
  const todaysIngredients = [
    {
      name: 'Greek Yogurt',
      amount: '200g',
      calories: 130,
      protein: 20,
      carbs: 9,
      fat: 0,
      fiber: 0,
      vitamins: { B12: 1.2, A: 78 },
      minerals: { Calcium: 200, Potassium: 240 },
      mealTime: 'breakfast',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Rolled Oats',
      amount: '80g',
      calories: 303,
      protein: 11,
      carbs: 54,
      fat: 6,
      fiber: 8,
      vitamins: { B12: 0, A: 0 },
      minerals: { Iron: 3.4, Magnesium: 110 },
      mealTime: 'breakfast',
      image: 'https://images.unsplash.com/photo-1517009808693-6ed6d9c5c785?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Strawberries',
      amount: '150g',
      calories: 48,
      protein: 1,
      carbs: 11.5,
      fat: 0.5,
      fiber: 2.4,
      vitamins: { C: 89, A: 18 },
      minerals: { Potassium: 230, Calcium: 24 },
      mealTime: 'breakfast',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Chicken Breast',
      amount: '150g',
      calories: 248,
      protein: 46,
      carbs: 0,
      fat: 5.4,
      fiber: 0,
      vitamins: { B12: 0.3, A: 21 },
      minerals: { Iron: 1.0, Potassium: 480 },
      mealTime: 'lunch',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Quinoa',
      amount: '100g (cooked)',
      calories: 120,
      protein: 4.4,
      carbs: 22,
      fat: 1.9,
      fiber: 2.8,
      vitamins: { A: 5 },
      minerals: { Iron: 1.5, Magnesium: 64 },
      mealTime: 'lunch',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Avocado',
      amount: '100g',
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 15,
      fiber: 7,
      vitamins: { C: 10, A: 7 },
      minerals: { Potassium: 485, Magnesium: 29 },
      mealTime: 'lunch',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Spinach',
      amount: '100g',
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      vitamins: { C: 28, A: 469 },
      minerals: { Iron: 2.7, Calcium: 99, Magnesium: 79 },
      mealTime: 'lunch',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Salmon',
      amount: '150g',
      calories: 231,
      protein: 31,
      carbs: 0,
      fat: 11,
      fiber: 0,
      vitamins: { D: 11, B12: 4.9, A: 59 },
      minerals: { Potassium: 628, Calcium: 15 },
      mealTime: 'dinner',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Sweet Potato',
      amount: '200g',
      calories: 172,
      protein: 3.8,
      carbs: 41,
      fat: 0.3,
      fiber: 6.6,
      vitamins: { A: 1730, C: 39 },
      minerals: { Potassium: 816, Magnesium: 54 },
      mealTime: 'dinner',
      image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    },
    {
      name: 'Broccoli',
      amount: '150g',
      calories: 51,
      protein: 5.4,
      carbs: 10,
      fat: 0.6,
      fiber: 3.8,
      vitamins: { C: 135, A: 120 },
      minerals: { Calcium: 70, Iron: 1.1, Magnesium: 32 },
      mealTime: 'dinner',
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
    }
  ];

  // Calculate totals from actual ingredients
  const actualTotals = todaysIngredients.reduce((totals, ingredient) => ({
    calories: totals.calories + ingredient.calories,
    protein: totals.protein + ingredient.protein,
    carbs: totals.carbs + ingredient.carbs,
    fat: totals.fat + ingredient.fat,
    fiber: totals.fiber + ingredient.fiber
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const todaysMeals = [
    {
      id: '1',
      type: 'breakfast',
      name: 'Overnight Oats Bowl',
      time: '7:30 AM',
      calories: todaysIngredients.filter(i => i.mealTime === 'breakfast').reduce((sum, i) => sum + i.calories, 0),
      protein: todaysIngredients.filter(i => i.mealTime === 'breakfast').reduce((sum, i) => sum + i.protein, 0),
      logged: true,
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80'
    },
    {
      id: '2',
      type: 'lunch',
      name: 'Quinoa Buddha Bowl',
      time: '12:30 PM',
      calories: todaysIngredients.filter(i => i.mealTime === 'lunch').reduce((sum, i) => sum + i.calories, 0),
      protein: todaysIngredients.filter(i => i.mealTime === 'lunch').reduce((sum, i) => sum + i.protein, 0),
      logged: true,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80'
    },
    {
      id: '3',
      type: 'dinner',
      name: 'Grilled Salmon Plate',
      time: '7:00 PM',
      calories: todaysIngredients.filter(i => i.mealTime === 'dinner').reduce((sum, i) => sum + i.calories, 0),
      protein: todaysIngredients.filter(i => i.mealTime === 'dinner').reduce((sum, i) => sum + i.protein, 0),
      logged: true,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80'
    }
  ];

  const recentIngredients = todaysIngredients.slice(0, 4);

  // Updated macro distribution with actual calculated values
  const macroDistribution = [
    { name: 'Protein', value: Math.round(actualTotals.protein), color: '#4ecdc4', calories: Math.round(actualTotals.protein * 4) },
    { name: 'Carbs', value: Math.round(actualTotals.carbs), color: '#f9ca24', calories: Math.round(actualTotals.carbs * 4) },
    { name: 'Fat', value: Math.round(actualTotals.fat), color: '#45b7d1', calories: Math.round(actualTotals.fat * 9) }
  ];

  // Enhanced weekly progress data with realistic nutritional tracking
  const weeklyProgressData = [
    {
      day: 'Mon',
      calories: 2150,
      target: 2200,
      proteinGoal: 88,
      carbGoal: 85,
      fatGoal: 92,
      overallScore: 88,
      mealsLogged: 3,
      waterIntake: 8,
      workoutCompleted: true,
      ingredientsTracked: 12
    },
    {
      day: 'Tue',
      calories: 2080,
      target: 2200,
      proteinGoal: 95,
      carbGoal: 78,
      fatGoal: 88,
      overallScore: 87,
      mealsLogged: 3,
      waterIntake: 9,
      workoutCompleted: false,
      ingredientsTracked: 11
    },
    {
      day: 'Wed',
      calories: 1950,
      target: 2200,
      proteinGoal: 82,
      carbGoal: 90,
      fatGoal: 85,
      overallScore: 86,
      mealsLogged: 3,
      waterIntake: 7,
      workoutCompleted: true,
      ingredientsTracked: 10
    },
    {
      day: 'Thu',
      calories: 2250,
      target: 2200,
      proteinGoal: 98,
      carbGoal: 88,
      fatGoal: 95,
      overallScore: 94,
      mealsLogged: 3,
      waterIntake: 10,
      workoutCompleted: true,
      ingredientsTracked: 14
    },
    {
      day: 'Fri',
      calories: 1890,
      target: 2200,
      proteinGoal: 75,
      carbGoal: 82,
      fatGoal: 78,
      overallScore: 78,
      mealsLogged: 2,
      waterIntake: 6,
      workoutCompleted: false,
      ingredientsTracked: 8
    },
    {
      day: 'Sat',
      calories: 2320,
      target: 2200,
      proteinGoal: 102,
      carbGoal: 95,
      fatGoal: 88,
      overallScore: 95,
      mealsLogged: 3,
      waterIntake: 11,
      workoutCompleted: true,
      ingredientsTracked: 15
    },
    {
      day: 'Sun',
      calories: actualTotals.calories,
      target: 2200,
      proteinGoal: Math.round((actualTotals.protein / macroGoals.protein.target) * 100),
      carbGoal: Math.round((actualTotals.carbs / macroGoals.carbs.target) * 100),
      fatGoal: Math.round((actualTotals.fat / macroGoals.fat.target) * 100),
      overallScore: Math.round(((actualTotals.protein / macroGoals.protein.target) + (actualTotals.carbs / macroGoals.carbs.target) + (actualTotals.fat / macroGoals.fat.target)) / 3 * 100),
      mealsLogged: todaysMeals.filter(m => m.logged).length,
      waterIntake: 8,
      workoutCompleted: true,
      ingredientsTracked: todaysIngredients.length
    }
  ];

  // Calculate weekly averages and trends
  const weeklyStats = {
    avgCalories: Math.round(weeklyProgressData.reduce((sum, day) => sum + day.calories, 0) / weeklyProgressData.length),
    avgProteinGoal: Math.round(weeklyProgressData.reduce((sum, day) => sum + day.proteinGoal, 0) / weeklyProgressData.length),
    avgCarbGoal: Math.round(weeklyProgressData.reduce((sum, day) => sum + day.carbGoal, 0) / weeklyProgressData.length),
    avgFatGoal: Math.round(weeklyProgressData.reduce((sum, day) => sum + day.fatGoal, 0) / weeklyProgressData.length),
    avgOverallScore: Math.round(weeklyProgressData.reduce((sum, day) => sum + day.overallScore, 0) / weeklyProgressData.length),
    totalMealsLogged: weeklyProgressData.reduce((sum, day) => sum + day.mealsLogged, 0),
    avgWaterIntake: Math.round(weeklyProgressData.reduce((sum, day) => sum + day.waterIntake, 0) / weeklyProgressData.length),
    workoutsCompleted: weeklyProgressData.filter(day => day.workoutCompleted).length,
    totalIngredientsTracked: weeklyProgressData.reduce((sum, day) => sum + day.ingredientsTracked, 0)
  };

  // Enhanced button functionality handlers with better UX
  const handleScanFood = () => {
    // Simulate camera scanning functionality
    const isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    if (isSupported) {
      alert('📸 Camera scanner would open here!\n\nThis would allow you to:\n• Scan food barcodes\n• Identify foods using AI\n• Quickly add nutrition data');
    } else {
      alert('📱 Camera scanning not supported on this device.\n\nTry using the "Add Food" button instead to manually search for foods.');
    }
  };

  const handleAddFood = () => {
    if (onNavigate) {
      onNavigate('calculator');
    } else {
      alert('🍽️ Opening food database...\n\nThis would take you to the ingredient library where you can search and add foods to track their nutrition.');
    }
  };

  const handleSetGoals = () => {
    if (onNavigate) {
      onNavigate('profile');
    } else {
      alert('🎯 Opening goal settings...\n\nThis would allow you to:\n• Set daily calorie targets\n• Adjust macro ratios\n• Configure personal preferences');
    }
  };

  const handleViewProgress = () => {
    if (onNavigate) {
      onNavigate('calendar');
    } else {
      alert('📊 Opening progress tracking...\n\nThis would show:\n• Weekly/monthly trends\n• Achievement tracking\n• Historical nutrition data');
    }
  };

  const handleAddMeal = (mealId: string) => {
    const meal = todaysMeals.find(m => m.id === mealId);
    if (onNavigate) {
      // Store the meal type in localStorage for the next screen
      localStorage.setItem('pendingMealType', meal?.type || 'lunch');
      onNavigate('calculator');
    } else {
      alert(`🍽️ Adding ${meal?.name || 'meal'}...\n\nThis would open the recipe builder to track this ${meal?.type} meal.`);
    }
  };

  const handleIngredientClick = (ingredient: any) => {
    // Store ingredient for quick add to calculator
    localStorage.setItem('quickAddIngredient', JSON.stringify(ingredient));
    if (onNavigate) {
      onNavigate('calculator');
    } else {
      alert(`🥗 Quick adding ${ingredient.name}...\n\nCalories: ${ingredient.calories}\nProtein: ${ingredient.protein}g\n\nThis would add it directly to your recipe builder.`);
    }
  };

  // Handle macro bar clicks for detailed view
  const handleMacroClick = (macroType: string) => {
    const macro = macroGoals[macroType as keyof typeof macroGoals];
    const actualValue = macroType === 'calories' ? actualTotals.calories : 
                       macroType === 'protein' ? actualTotals.protein :
                       macroType === 'carbs' ? actualTotals.carbs :
                       macroType === 'fat' ? actualTotals.fat : 0;
    
    const sources = macro.sources ? `\n\nTop Sources:\n${macro.sources.join('\n')}` : '';
    
    alert(`📊 ${macroType.charAt(0).toUpperCase() + macroType.slice(1)} Details\n\nCurrent: ${Math.round(actualValue)}${macroType === 'calories' ? ' kcal' : 'g'}\nTarget: ${macro.target}${macroType === 'calories' ? ' kcal' : 'g'}\nRemaining: ${macro.target - Math.round(actualValue)}${macroType === 'calories' ? ' kcal' : 'g'}\nProgress: ${Math.round((actualValue / macro.target) * 100)}%${sources}`);
  };

  // Handle micronutrient click for detailed view
  const handleMicronutrientClick = (nutrient: any) => {
    alert(`📊 ${nutrient.name} Details\n\nCurrent: ${nutrient.current}${nutrient.unit}\nTarget: ${nutrient.target}${nutrient.unit}\nProgress: ${nutrient.percentage}%\n\nBenefits: ${nutrient.benefits}\n\nTop Sources:\n${nutrient.sources.join('\n')}`);
  };

  // Handle weekly progress day click for detailed view
  const handleWeeklyDayClick = (dayData: any) => {
    alert(`📊 ${dayData.day} Progress Details\n\nCalories: ${dayData.calories}/${dayData.target} (${Math.round((dayData.calories/dayData.target)*100)}%)\nProtein Goal: ${dayData.proteinGoal}%\nCarb Goal: ${dayData.carbGoal}%\nFat Goal: ${dayData.fatGoal}%\n\nOverall Score: ${dayData.overallScore}%\nMeals Logged: ${dayData.mealsLogged}/3\nWater: ${dayData.waterIntake} glasses\nWorkout: ${dayData.workoutCompleted ? 'Completed ✅' : 'Skipped ❌'}\nIngredients Tracked: ${dayData.ingredientsTracked}`);
  };

  return (
    <div className="pb-24 max-w-md mx-auto animate-fade-in">
      {/* Hero Section with Large Photo Overlay */}
      <div className="relative -mx-4 mb-6">
        <div className="h-64 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Fresh healthy ingredients"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Text Overlay Content */}
          <div className="absolute bottom-6 left-4 right-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Welcome back</p>
                <h1 className="text-3xl font-bold">{userName}</h1>
                <p className="text-sm opacity-90 mt-1">Track every ingredient, master your nutrition</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Flame className="text-orange-400" size={16} />
                  <span className="text-2xl font-bold">7</span>
                </div>
                <p className="text-xs opacity-90">day streak</p>
              </div>
            </div>
            
            {/* Daily Progress Ring */}
            <div className="flex items-center justify-between">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#fef7cd"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - (actualTotals.calories / macroGoals.calories.target))}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold">{Math.round((actualTotals.calories / macroGoals.calories.target) * 100)}%</div>
                    <div className="text-xs opacity-75">today</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round(actualTotals.calories)}</div>
                <div className="text-sm opacity-90">of {macroGoals.calories.target} kcal</div>
                <div className="text-xs opacity-75">{macroGoals.calories.target - Math.round(actualTotals.calories)} remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Quick Actions with Enhanced Feedback */}
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={handleScanFood}
            className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Camera className="text-primary" size={24} />
            <span className="text-xs font-medium">Scan</span>
          </button>
          <button 
            onClick={handleAddFood}
            className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-chart-1/10 hover:bg-chart-1/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="text-chart-1" size={24} />
            <span className="text-xs font-medium">Add Food</span>
          </button>
          <button 
            onClick={handleSetGoals}
            className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-chart-2/10 hover:bg-chart-2/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Target className="text-chart-2" size={24} />
            <span className="text-xs font-medium">Goals</span>
          </button>
          <button 
            onClick={handleViewProgress}
            className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-chart-3/10 hover:bg-chart-3/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <TrendingUp className="text-chart-3" size={24} />
            <span className="text-xs font-medium">Progress</span>
          </button>
        </div>

        {/* Enhanced Visual Macro Tracking */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Today's Macros</h2>
          
          {/* Protein Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Protein</span>
              <span className="text-sm text-muted-foreground">{Math.round(actualTotals.protein)}g / {macroGoals.protein.target}g</span>
            </div>
            <button 
              onClick={() => handleMacroClick('protein')}
              className="w-full bg-muted/30 rounded-full h-3 overflow-hidden hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div 
                className="h-3 rounded-full transition-all duration-500 hover:brightness-110"
                style={{ 
                  width: `${Math.min((actualTotals.protein / macroGoals.protein.target) * 100, 100)}%`,
                  backgroundColor: macroGoals.protein.color 
                }}
              />
            </button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round((actualTotals.protein / macroGoals.protein.target) * 100)}% complete</span>
              <span>{Math.max(0, macroGoals.protein.target - Math.round(actualTotals.protein))}g remaining</span>
            </div>
          </div>

          {/* Carbs Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Carbs</span>
              <span className="text-sm text-muted-foreground">{Math.round(actualTotals.carbs)}g / {macroGoals.carbs.target}g</span>
            </div>
            <button 
              onClick={() => handleMacroClick('carbs')}
              className="w-full bg-muted/30 rounded-full h-3 overflow-hidden hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div 
                className="h-3 rounded-full transition-all duration-500 hover:brightness-110"
                style={{ 
                  width: `${Math.min((actualTotals.carbs / macroGoals.carbs.target) * 100, 100)}%`,
                  backgroundColor: macroGoals.carbs.color 
                }}
              />
            </button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round((actualTotals.carbs / macroGoals.carbs.target) * 100)}% complete</span>
              <span>{Math.max(0, macroGoals.carbs.target - Math.round(actualTotals.carbs))}g remaining</span>
            </div>
          </div>

          {/* Fat Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Fat</span>
              <span className="text-sm text-muted-foreground">{Math.round(actualTotals.fat)}g / {macroGoals.fat.target}g</span>
            </div>
            <button 
              onClick={() => handleMacroClick('fat')}
              className="w-full bg-muted/30 rounded-full h-3 overflow-hidden hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div 
                className="h-3 rounded-full transition-all duration-500 hover:brightness-110"
                style={{ 
                  width: `${Math.min((actualTotals.fat / macroGoals.fat.target) * 100, 100)}%`,
                  backgroundColor: macroGoals.fat.color 
                }}
              />
            </button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round((actualTotals.fat / macroGoals.fat.target) * 100)}% complete</span>
              <span>{Math.max(0, macroGoals.fat.target - Math.round(actualTotals.fat))}g remaining</span>
            </div>
          </div>

          {/* Fiber Tracking */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-600">Fiber</span>
              <span className="text-sm text-muted-foreground">{Math.round(actualTotals.fiber)}g / 25g</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-500 bg-green-500"
                style={{ 
                  width: `${Math.min((actualTotals.fiber / 25) * 100, 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round((actualTotals.fiber / 25) * 100)}% of daily fiber</span>
              <span>{Math.max(0, 25 - Math.round(actualTotals.fiber))}g remaining</span>
            </div>
          </div>
        </div>

        {/* Today's Meals with Photo Overlays */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today's Meals</h2>
            <span className="text-sm text-muted-foreground">
              {todaysMeals.filter(m => m.logged).length} of {todaysMeals.length} logged
            </span>
          </div>
          
          <div className="space-y-4">
            {todaysMeals.map((meal, index) => (
              <div key={meal.id} className="relative rounded-2xl overflow-hidden">
                <div className="h-32 relative">
                  <ImageWithFallback
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  
                  {/* Meal Info Overlay */}
                  <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {meal.type === 'breakfast' && <Coffee size={16} />}
                        {meal.type === 'lunch' && <Utensils size={16} />}
                        {meal.type === 'dinner' && <Sunset size={16} />}
                        <span className="text-xs uppercase tracking-wider">{meal.type}</span>
                      </div>
                      <h3 className="font-bold text-lg">{meal.name}</h3>
                      <p className="text-sm opacity-90">{meal.time}</p>
                    </div>
                    
                    {meal.logged && (
                      <div className="flex space-x-4 text-sm">
                        <span>{Math.round(meal.calories)} cal</span>
                        <span>{Math.round(meal.protein)}g protein</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {meal.logged ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white rounded-full bg-white"></div>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-white text-black hover:bg-white/90 transition-all duration-200 hover:scale-105"
                        onClick={() => handleAddMeal(meal.id)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Macro Distribution Chart with Detailed Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Macro Distribution</h2>
            <Badge variant="outline" className="text-xs">
              From {todaysIngredients.length} ingredients
            </Badge>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-3">
            {macroDistribution.map((macro) => {
              const percentage = Math.round((macro.calories / actualTotals.calories) * 100) || 0;
              return (
                <div key={macro.name} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: macro.color }}
                    />
                    <div>
                      <div className="font-medium">{macro.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {macro.value}g • {macro.calories} cal • {percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Micronutrient Tracking */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Key Micronutrients</h2>
            <div className="flex items-center space-x-1">
              <Activity size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">Today's intake</span>
            </div>
          </div>

          {/* Vitamins */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart size={16} className="text-red-500" />
              <h3 className="font-medium">Vitamins</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {micronutrients.vitamins.map((vitamin, index) => (
                <button
                  key={index}
                  onClick={() => handleMicronutrientClick(vitamin)}
                  className="p-3 bg-card rounded-lg border hover:bg-accent/5 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{vitamin.name}</span>
                    <Badge 
                      variant={vitamin.percentage >= 90 ? "default" : vitamin.percentage >= 70 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {vitamin.percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(vitamin.percentage, 100)}%`,
                        backgroundColor: vitamin.color 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vitamin.current}{vitamin.unit} / {vitamin.target}{vitamin.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Minerals */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap size={16} className="text-yellow-500" />
              <h3 className="font-medium">Minerals</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {micronutrients.minerals.map((mineral, index) => (
                <button
                  key={index}
                  onClick={() => handleMicronutrientClick(mineral)}
                  className="p-3 bg-card rounded-lg border hover:bg-accent/5 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{mineral.name}</span>
                    <Badge 
                      variant={mineral.percentage >= 90 ? "default" : mineral.percentage >= 70 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {mineral.percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(mineral.percentage, 100)}%`,
                        backgroundColor: mineral.color 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mineral.current}{mineral.unit} / {mineral.target}{mineral.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Ingredients Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ingredient Breakdown</h2>
            <Badge variant="outline" className="text-xs">
              {todaysIngredients.length} items logged
            </Badge>
          </div>
          
          <div className="space-y-3">
            {['breakfast', 'lunch', 'dinner'].map(mealType => {
              const mealIngredients = todaysIngredients.filter(i => i.mealTime === mealType);
              if (mealIngredients.length === 0) return null;
              
              return (
                <div key={mealType} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {mealType === 'breakfast' && <Coffee size={16} className="text-orange-500" />}
                    {mealType === 'lunch' && <Utensils size={16} className="text-blue-500" />}
                    {mealType === 'dinner' && <Sunset size={16} className="text-purple-500" />}
                    <h3 className="font-medium capitalize">{mealType}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({mealIngredients.reduce((sum, i) => sum + i.calories, 0)} cal)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {mealIngredients.map((ingredient, index) => (
                      <button
                        key={index}
                        onClick={() => handleIngredientClick(ingredient)}
                        className="p-2 bg-card rounded-lg border hover:bg-accent/5 transition-colors text-left"
                      >
                        <div className="font-medium text-sm">{ingredient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ingredient.amount} • {ingredient.calories} cal
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Ingredients with Clipping Paths */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Add Ingredients</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {recentIngredients.map((ingredient, index) => (
              <div 
                key={index} 
                className="relative rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => handleIngredientClick(ingredient)}
              >
                <div className="h-24 relative">
                  <ImageWithFallback
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                    style={{
                      clipPath: index % 2 === 0 
                        ? 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' 
                        : 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <h4 className="font-semibold text-sm">{ingredient.name}</h4>
                    <div className="flex justify-between text-xs mt-1">
                      <span>{ingredient.calories} cal</span>
                      <span>{ingredient.protein}g protein</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Weekly Progress with Comprehensive Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Weekly Progress</h2>
            <div className="flex items-center space-x-1">
              <TrendingUp size={16} className="text-primary" />
              <Badge variant="outline" className="text-xs">
                {weeklyStats.avgOverallScore}% avg score
              </Badge>
            </div>
          </div>

          {/* Weekly Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-card rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary">{weeklyStats.totalMealsLogged}</div>
              <div className="text-xs text-muted-foreground">Meals Logged</div>
            </div>
            <div className="p-3 bg-card rounded-lg border text-center">
              <div className="text-2xl font-bold text-chart-2">{weeklyStats.workoutsCompleted}</div>
              <div className="text-xs text-muted-foreground">Workouts Done</div>
            </div>
            <div className="p-3 bg-card rounded-lg border text-center">
              <div className="text-2xl font-bold text-chart-3">{weeklyStats.avgWaterIntake}</div>
              <div className="text-xs text-muted-foreground">Avg Water (glasses)</div>
            </div>
            <div className="p-3 bg-card rounded-lg border text-center">
              <div className="text-2xl font-bold text-chart-4">{weeklyStats.totalIngredientsTracked}</div>
              <div className="text-xs text-muted-foreground">Ingredients Tracked</div>
            </div>
          </div>
          
          {/* Main Weekly Chart */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyProgressData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11 }} 
                />
                <Bar 
                  dataKey="calories" 
                  fill="#a8dadc" 
                  radius={[2, 2, 0, 0]} 
                  opacity={0.8}
                />
                <Bar 
                  dataKey="target" 
                  fill="#fef7cd" 
                  radius={[2, 2, 0, 0]} 
                  opacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="overallScore" 
                  stroke="#ff6b6b" 
                  strokeWidth={2}
                  dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Daily Progress Bars */}
          <div className="space-y-3">
            <div className="text-sm font-medium mb-2">Daily Macro Achievement</div>
            {weeklyProgressData.map((day, index) => (
              <button
                key={day.day}
                onClick={() => handleWeeklyDayClick(day)}
                className="w-full p-3 bg-card rounded-lg border hover:bg-accent/5 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{day.day}</span>
                    {day.workoutCompleted && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {day.overallScore}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {day.mealsLogged}/3 meals
                    </span>
                  </div>
                </div>
                
                {/* Mini macro progress bars */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Protein</div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-chart-2 transition-all duration-300"
                        style={{ width: `${Math.min(day.proteinGoal, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium">{day.proteinGoal}%</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Carbs</div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-chart-4 transition-all duration-300"
                        style={{ width: `${Math.min(day.carbGoal, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium">{day.carbGoal}%</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Fat</div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-chart-3 transition-all duration-300"
                        style={{ width: `${Math.min(day.fatGoal, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium">{day.fatGoal}%</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Calories</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-background border-2 border-primary rounded-full"></div>
              <span>Target</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
              <span>Score</span>
            </div>
          </div>

          {/* Weekly Trends Summary */}
          <div className="p-4 bg-gradient-to-r from-primary/5 to-chart-2/5 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <Award size={16} className="text-primary" />
              <h3 className="font-medium">Weekly Insights</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Daily Score:</span>
                <span className="font-medium">{weeklyStats.avgOverallScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best Macro Balance:</span>
                <span className="font-medium">Protein ({weeklyStats.avgProteinGoal}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consistency Score:</span>
                <span className="font-medium">{Math.round((weeklyStats.totalMealsLogged / (weeklyProgressData.length * 3)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}