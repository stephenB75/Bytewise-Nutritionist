import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users, ChefHat, Target, Save, Share, Utensils, Coffee, Sunset, Moon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PlannedMeal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: any[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  image: string;
  servings: number;
}

interface DayPlan {
  date: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  targetCalories: number;
  targetProtein: number;
}

interface MealPlannerProps {
  onNavigate?: (tab: string) => void;
}

export function MealPlanner({ onNavigate }: MealPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);

  // Sample meal templates with photo overlays
  const mealTemplates = [
    {
      id: 'template_001',
      name: 'Protein Power Bowl',
      type: 'lunch' as const,
      calories: 520,
      protein: 35,
      carbs: 28,
      fat: 22,
      prepTime: 15,
      servings: 1,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: [
        { name: 'Quinoa', amount: 100, calories: 123, protein: 4.4 },
        { name: 'Grilled Chicken', amount: 150, calories: 248, protein: 46.5 },
        { name: 'Avocado', amount: 50, calories: 80, protein: 1 },
        { name: 'Mixed Greens', amount: 50, calories: 11, protein: 1.5 }
      ],
      tags: ['High Protein', 'Balanced', 'Filling']
    },
    {
      id: 'template_002',
      name: 'Overnight Oats Delight',
      type: 'breakfast' as const,
      calories: 380,
      protein: 18,
      carbs: 52,
      fat: 12,
      prepTime: 5,
      servings: 1,
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: [
        { name: 'Oats', amount: 50, calories: 190, protein: 6.7 },
        { name: 'Greek Yogurt', amount: 100, calories: 100, protein: 17 },
        { name: 'Blueberries', amount: 80, calories: 46, protein: 0.6 },
        { name: 'Almonds', amount: 15, calories: 87, protein: 3.2 }
      ],
      tags: ['Quick Prep', 'High Fiber', 'Antioxidants']
    },
    {
      id: 'template_003',
      name: 'Grilled Salmon Dinner',
      type: 'dinner' as const,
      calories: 580,
      protein: 42,
      carbs: 35,
      fat: 28,
      prepTime: 25,
      servings: 1,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: [
        { name: 'Salmon Fillet', amount: 180, calories: 374, protein: 45 },
        { name: 'Sweet Potato', amount: 150, calories: 129, protein: 2.3 },
        { name: 'Asparagus', amount: 100, calories: 20, protein: 2.2 },
        { name: 'Olive Oil', amount: 10, calories: 88, protein: 0 }
      ],
      tags: ['Omega-3', 'Heart Healthy', 'Complete Meal']
    },
    {
      id: 'template_004',
      name: 'Energy Smoothie Bowl',
      type: 'snack' as const,
      calories: 285,
      protein: 12,
      carbs: 45,
      fat: 8,
      prepTime: 10,
      servings: 1,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: [
        { name: 'Banana', amount: 100, calories: 89, protein: 1.1 },
        { name: 'Protein Powder', amount: 30, calories: 120, protein: 24 },
        { name: 'Spinach', amount: 30, calories: 7, protein: 0.9 },
        { name: 'Almond Milk', amount: 200, calories: 26, protein: 1 }
      ],
      tags: ['Post-Workout', 'Energy Boost', 'Nutrient Dense']
    },
    {
      id: 'template_005',
      name: 'Mediterranean Wrap',
      type: 'lunch' as const,
      calories: 450,
      protein: 25,
      carbs: 40,
      fat: 22,
      prepTime: 12,
      servings: 1,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: [
        { name: 'Whole Wheat Tortilla', amount: 60, calories: 180, protein: 6 },
        { name: 'Hummus', amount: 40, calories: 100, protein: 4 },
        { name: 'Grilled Chicken', amount: 80, calories: 132, protein: 25 },
        { name: 'Vegetables', amount: 100, calories: 38, protein: 2 }
      ],
      tags: ['Mediterranean', 'Portable', 'Fiber Rich']
    },
    {
      id: 'template_006',
      name: 'Berry Yogurt Parfait',
      type: 'snack' as const,
      calories: 220,
      protein: 15,
      carbs: 28,
      fat: 6,
      prepTime: 5,
      servings: 1,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: [
        { name: 'Greek Yogurt', amount: 150, calories: 150, protein: 25 },
        { name: 'Mixed Berries', amount: 80, calories: 40, protein: 1 },
        { name: 'Granola', amount: 20, calories: 80, protein: 2 }
      ],
      tags: ['Antioxidants', 'Quick', 'Probiotics']
    }
  ];

  // Weekly meal plan data with localStorage persistence
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem('mealPlan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved meal plan:', error);
      }
    }
    return [
      {
        date: '2024-01-29',
        targetCalories: 2200,
        targetProtein: 150,
        totalCalories: 1950,
        totalProtein: 142,
        meals: [
          {
            id: 'meal_001',
            name: 'Overnight Oats Delight',
            type: 'breakfast',
            calories: 380,
            protein: 18,
            carbs: 52,
            fat: 12,
            prepTime: 5,
            servings: 1,
            image: mealTemplates[1].image,
            ingredients: mealTemplates[1].ingredients
          },
          {
            id: 'meal_002',
            name: 'Protein Power Bowl',
            type: 'lunch',
            calories: 520,
            protein: 35,
            carbs: 28,
            fat: 22,
            prepTime: 15,
            servings: 1,
            image: mealTemplates[0].image,
            ingredients: mealTemplates[0].ingredients
          },
          {
            id: 'meal_003',
            name: 'Grilled Salmon Dinner',
            type: 'dinner',
            calories: 580,
            protein: 42,
            carbs: 35,
            fat: 28,
            prepTime: 25,
            servings: 1,
            image: mealTemplates[2].image,
            ingredients: mealTemplates[2].ingredients
          }
        ]
      }
    ];
  });

  // Check for pending meal plan recipe from calculator
  useEffect(() => {
    const pendingRecipe = localStorage.getItem('pendingMealPlanRecipe');
    if (pendingRecipe) {
      try {
        const recipe = JSON.parse(pendingRecipe);
        // Auto-add the recipe to today's plan
        addCustomRecipeToPlan(recipe);
        localStorage.removeItem('pendingMealPlanRecipe');
      } catch (error) {
        console.error('Error parsing pending recipe:', error);
      }
    }
  }, []);

  // Save meal plan to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  const mealTypeIcons = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Sunset,
    snack: Moon
  };

  const mealTypeColors = {
    breakfast: 'from-orange-400 to-orange-600',
    lunch: 'from-green-400 to-green-600',
    dinner: 'from-blue-400 to-blue-600',
    snack: 'from-purple-400 to-purple-600'
  };

  // Helper function to render meal type icon
  const getMealTypeIcon = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const IconComponent = mealTypeIcons[type];
    return <IconComponent size={14} />;
  };

  const addMealToPlan = (template: any) => {
    const newMeal: PlannedMeal = {
      id: `meal_${Date.now()}`,
      name: template.name,
      type: template.type,
      calories: template.calories,
      protein: template.protein,
      carbs: template.carbs,
      fat: template.fat,
      prepTime: template.prepTime,
      servings: template.servings,
      image: template.image,
      ingredients: template.ingredients
    };

    setWeeklyPlan(prevPlan => {
      const updatedPlan = [...prevPlan];
      const dayIndex = updatedPlan.findIndex(day => day.date === selectedDate);
      
      if (dayIndex >= 0) {
        // Update existing day
        const updatedDay = { ...updatedPlan[dayIndex] };
        updatedDay.meals = [...updatedDay.meals, newMeal];
        updatedDay.totalCalories += newMeal.calories;
        updatedDay.totalProtein += newMeal.protein;
        updatedPlan[dayIndex] = updatedDay;
      } else {
        // Create new day
        const newDay: DayPlan = {
          date: selectedDate,
          targetCalories: 2200,
          targetProtein: 150,
          totalCalories: newMeal.calories,
          totalProtein: newMeal.protein,
          meals: [newMeal]
        };
        updatedPlan.push(newDay);
      }
      
      return updatedPlan;
    });

    setIsCreatingMeal(false);
    alert(`${template.name} added to your meal plan for ${new Date(selectedDate).toLocaleDateString()}!`);
  };

  const addCustomRecipeToPlan = (recipe: any) => {
    const newMeal: PlannedMeal = {
      id: `meal_${Date.now()}`,
      name: recipe.name,
      type: 'lunch', // Default to lunch for custom recipes
      calories: Math.round(recipe.totals.calories / recipe.servings),
      protein: Math.round(recipe.totals.protein / recipe.servings),
      carbs: Math.round(recipe.totals.carbs / recipe.servings),
      fat: Math.round(recipe.totals.fat / recipe.servings),
      prepTime: 20, // Default prep time
      servings: 1,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      ingredients: recipe.ingredients
    };

    setWeeklyPlan(prevPlan => {
      const updatedPlan = [...prevPlan];
      const dayIndex = updatedPlan.findIndex(day => day.date === selectedDate);
      
      if (dayIndex >= 0) {
        const updatedDay = { ...updatedPlan[dayIndex] };
        updatedDay.meals = [...updatedDay.meals, newMeal];
        updatedDay.totalCalories += newMeal.calories;
        updatedDay.totalProtein += newMeal.protein;
        updatedPlan[dayIndex] = updatedDay;
      } else {
        const newDay: DayPlan = {
          date: selectedDate,
          targetCalories: 2200,
          targetProtein: 150,
          totalCalories: newMeal.calories,
          totalProtein: newMeal.protein,
          meals: [newMeal]
        };
        updatedPlan.push(newDay);
      }
      
      return updatedPlan;
    });

    alert(`Custom recipe "${recipe.name}" added to your meal plan!`);
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const editMeal = (mealId: string) => {
    const meal = getCurrentDayPlan().meals.find(m => m.id === mealId);
    if (meal) {
      // Store meal data for editing in calculator
      const mealForCalculator = {
        name: meal.name,
        ingredients: meal.ingredients,
        servings: meal.servings
      };
      localStorage.setItem('editingMeal', JSON.stringify({ mealId, ...mealForCalculator }));
      
      if (onNavigate) {
        onNavigate('calculator');
      }
    }
  };

  const removeMeal = (mealId: string) => {
    if (confirm('Are you sure you want to remove this meal from your plan?')) {
      setWeeklyPlan(prevPlan => {
        const updatedPlan = [...prevPlan];
        const dayIndex = updatedPlan.findIndex(day => day.date === selectedDate);
        
        if (dayIndex >= 0) {
          const updatedDay = { ...updatedPlan[dayIndex] };
          const mealToRemove = updatedDay.meals.find(m => m.id === mealId);
          
          if (mealToRemove) {
            updatedDay.meals = updatedDay.meals.filter(m => m.id !== mealId);
            updatedDay.totalCalories -= mealToRemove.calories;
            updatedDay.totalProtein -= mealToRemove.protein;
            updatedPlan[dayIndex] = updatedDay;
          }
        }
        
        return updatedPlan;
      });
    }
  };

  const saveMealPlan = () => {
    const planData = JSON.stringify(weeklyPlan, null, 2);
    
    // Create downloadable file
    const blob = new Blob([planData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Meal plan saved successfully!');
  };

  const shareMealPlan = () => {
    const dayPlan = getCurrentDayPlan();
    const shareText = `
My Meal Plan for ${new Date(selectedDate).toLocaleDateString()}:

${dayPlan.meals.map(meal => 
  `${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}: ${meal.name} (${meal.calories} cal, ${meal.protein}g protein)`
).join('\n')}

Total: ${dayPlan.totalCalories} calories, ${dayPlan.totalProtein}g protein
Target: ${dayPlan.targetCalories} calories, ${dayPlan.targetProtein}g protein

Created with Bytewise Nutritionist
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'My Meal Plan',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Meal plan copied to clipboard!');
      });
    }
  };

  const setNutritionGoals = () => {
    const newCalorieTarget = prompt('Enter your daily calorie target:', '2200');
    const newProteinTarget = prompt('Enter your daily protein target (grams):', '150');
    
    if (newCalorieTarget && newProteinTarget) {
      const calories = parseInt(newCalorieTarget);
      const protein = parseInt(newProteinTarget);
      
      if (!isNaN(calories) && !isNaN(protein)) {
        setWeeklyPlan(prevPlan => {
          return prevPlan.map(day => ({
            ...day,
            targetCalories: calories,
            targetProtein: protein
          }));
        });
        
        alert(`Goals updated! Daily target: ${calories} calories, ${protein}g protein`);
      } else {
        alert('Please enter valid numbers for your goals.');
      }
    }
  };

  const getCurrentDayPlan = () => {
    return weeklyPlan.find(day => day.date === selectedDate) || {
      date: selectedDate,
      targetCalories: 2200,
      targetProtein: 150,
      totalCalories: 0,
      totalProtein: 0,
      meals: []
    };
  };

  // Comprehensive weekly analytics function
  const showWeeklyAnalytics = () => {
    const today = new Date();
    const weekDays = [];
    
    // Generate current week dates
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + 1 + i);
      weekDays.push(date.toISOString().split('T')[0]);
    }
    
    // Calculate comprehensive weekly stats
    const weeklyStats = {
      totalCalories: 0,
      totalProtein: 0,
      totalMeals: 0,
      daysWithMeals: 0,
      goalAchievementDays: 0,
      averageCalories: 0,
      averageProtein: 0,
      calorieRange: { min: Infinity, max: 0 },
      proteinRange: { min: Infinity, max: 0 },
      mealTypeDistribution: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      streak: 0,
      weeklyGoalProgress: 0,
      topIngredients: {},
      prepTimeTotal: 0,
      weeklyTrends: []
    };
    
    let consecutiveDays = 0;
    let maxStreak = 0;
    
    weekDays.forEach((dateStr, index) => {
      const dayPlan = weeklyPlan.find(d => d.date === dateStr);
      
      if (dayPlan && dayPlan.meals.length > 0) {
        weeklyStats.totalCalories += dayPlan.totalCalories;
        weeklyStats.totalProtein += dayPlan.totalProtein;
        weeklyStats.totalMeals += dayPlan.meals.length;
        weeklyStats.daysWithMeals++;
        
        // Track calorie and protein ranges
        if (dayPlan.totalCalories > 0) {
          weeklyStats.calorieRange.min = Math.min(weeklyStats.calorieRange.min, dayPlan.totalCalories);
          weeklyStats.calorieRange.max = Math.max(weeklyStats.calorieRange.max, dayPlan.totalCalories);
        }
        
        if (dayPlan.totalProtein > 0) {
          weeklyStats.proteinRange.min = Math.min(weeklyStats.proteinRange.min, dayPlan.totalProtein);
          weeklyStats.proteinRange.max = Math.max(weeklyStats.proteinRange.max, dayPlan.totalProtein);
        }
        
        // Goal achievement tracking
        const calorieGoalMet = dayPlan.totalCalories >= dayPlan.targetCalories * 0.8 && 
                               dayPlan.totalCalories <= dayPlan.targetCalories * 1.2;
        const proteinGoalMet = dayPlan.totalProtein >= dayPlan.targetProtein * 0.8;
        
        if (calorieGoalMet && proteinGoalMet) {
          weeklyStats.goalAchievementDays++;
          consecutiveDays++;
          maxStreak = Math.max(maxStreak, consecutiveDays);
        } else {
          consecutiveDays = 0;
        }
        
        // Meal type distribution
        dayPlan.meals.forEach(meal => {
          weeklyStats.mealTypeDistribution[meal.type]++;
          weeklyStats.prepTimeTotal += meal.prepTime || 0;
          
          // Track ingredient frequency
          meal.ingredients?.forEach(ingredient => {
            const name = ingredient.name?.toLowerCase();
            if (name) {
              weeklyStats.topIngredients[name] = (weeklyStats.topIngredients[name] || 0) + 1;
            }
          });
        });
        
        weeklyStats.weeklyTrends.push({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
          calories: dayPlan.totalCalories,
          protein: dayPlan.totalProtein,
          meals: dayPlan.meals.length
        });
      } else {
        consecutiveDays = 0;
        weeklyStats.weeklyTrends.push({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
          calories: 0,
          protein: 0,
          meals: 0
        });
      }
    });
    
    weeklyStats.streak = maxStreak;
    weeklyStats.averageCalories = weeklyStats.daysWithMeals > 0 ? 
      Math.round(weeklyStats.totalCalories / weeklyStats.daysWithMeals) : 0;
    weeklyStats.averageProtein = weeklyStats.daysWithMeals > 0 ? 
      Math.round(weeklyStats.totalProtein / weeklyStats.daysWithMeals) : 0;
    weeklyStats.weeklyGoalProgress = Math.round((weeklyStats.goalAchievementDays / 7) * 100);
    
    // Fix infinite values
    if (weeklyStats.calorieRange.min === Infinity) {
      weeklyStats.calorieRange.min = 0;
    }
    if (weeklyStats.proteinRange.min === Infinity) {
      weeklyStats.proteinRange.min = 0;
    }
    
    // Get top 3 ingredients
    const topIngredientsList = Object.entries(weeklyStats.topIngredients)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `${name.charAt(0).toUpperCase() + name.slice(1)} (${count}x)`);
    
    // Generate insights
    const insights = [];
    
    if (weeklyStats.goalAchievementDays >= 5) {
      insights.push("🌟 Excellent week! You hit your nutrition goals most days.");
    } else if (weeklyStats.goalAchievementDays >= 3) {
      insights.push("💪 Good progress! Keep building those healthy habits.");
    } else {
      insights.push("🎯 Room for improvement - try planning more balanced meals.");
    }
    
    if (weeklyStats.streak >= 3) {
      insights.push(`🔥 Amazing ${weeklyStats.streak}-day goal streak!`);
    }
    
    if (weeklyStats.mealTypeDistribution.breakfast < 5) {
      insights.push("🥐 Consider adding more breakfast meals for better energy.");
    }
    
    if (weeklyStats.averageProtein < 100) {
      insights.push("🥩 Try adding more protein-rich foods to your meals.");
    }
    
    if (weeklyStats.totalMeals < 14) {
      insights.push("📅 Planning more meals ahead can help achieve your goals.");
    }
    
    // Create comprehensive analytics display
    const analyticsDisplay = `
📊 WEEKLY NUTRITION ANALYTICS
Week of ${new Date(weekDays[0]).toLocaleDateString()} - ${new Date(weekDays[6]).toLocaleDateString()}

🎯 GOAL ACHIEVEMENT
• Goal Success Rate: ${weeklyStats.weeklyGoalProgress}%
• Days with Complete Nutrition: ${weeklyStats.goalAchievementDays}/7
• Current Streak: ${weeklyStats.streak} days
• Meals Planned: ${weeklyStats.totalMeals}

📈 NUTRITION SUMMARY
• Total Calories: ${weeklyStats.totalCalories.toLocaleString()}
• Average Daily: ${weeklyStats.averageCalories} cal
• Range: ${weeklyStats.calorieRange.min} - ${weeklyStats.calorieRange.max} cal

• Total Protein: ${weeklyStats.totalProtein}g
• Average Daily: ${weeklyStats.averageProtein}g
• Range: ${weeklyStats.proteinRange.min}g - ${weeklyStats.proteinRange.max}g

🍽️ MEAL BREAKDOWN
• Breakfast: ${weeklyStats.mealTypeDistribution.breakfast} meals
• Lunch: ${weeklyStats.mealTypeDistribution.lunch} meals  
• Dinner: ${weeklyStats.mealTypeDistribution.dinner} meals
• Snacks: ${weeklyStats.mealTypeDistribution.snack} meals

⏱️ PREP INSIGHTS
• Total Prep Time: ${Math.round(weeklyStats.prepTimeTotal / 60)} hours ${weeklyStats.prepTimeTotal % 60} min
• Average per Meal: ${weeklyStats.totalMeals > 0 ? Math.round(weeklyStats.prepTimeTotal / weeklyStats.totalMeals) : 0} min

🥗 TOP INGREDIENTS
${topIngredientsList.length > 0 ? topIngredientsList.join('\n') : 'No data available'}

💡 PERSONAL INSIGHTS
${insights.join('\n')}

📅 DAILY TREND
${weeklyStats.weeklyTrends.map(day => 
  `${day.day}: ${day.calories} cal, ${day.protein}g protein, ${day.meals} meals`
).join('\n')}

Keep up the great work! 🌟
    `.trim();
    
    // Show analytics in a more visual format
    console.log('📊 Weekly Analytics Generated:', weeklyStats);
    alert(analyticsDisplay);
    
    // Optional: Store analytics for future reference
    try {
      localStorage.setItem('weeklyAnalytics', JSON.stringify({
        weekOf: weekDays[0],
        generatedAt: new Date().toISOString(),
        stats: weeklyStats,
        insights: insights
      }));
    } catch (error) {
      console.warn('Could not save analytics to storage:', error);
    }
  };

  const dayPlan = getCurrentDayPlan();

  return (
    <div className="space-y-6 brand-padding-md">
      {/* Hero Section - Brand Compliant Header */}
      <div className="relative mb-8 -mx-3 overflow-hidden">
        <div className="relative h-64">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=256&q=80"
            alt="Meal planning background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          
          <div className="absolute inset-0 flex flex-col justify-between items-center text-white brand-padding-xl py-8">
            {/* Top Section - Icon and Text */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30 shadow-2xl">
                <ChefHat className="text-white" size={28} />
              </div>
              <h1 style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-3xl font-bold text-center mb-2">Meal Planner</h1>
              <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-white/90 text-center max-w-sm">
                Plan your weekly meals with perfectly balanced nutrition and custom recipes
              </p>
            </div>
            
            {/* Bottom Section - Quick Stats */}
            <div className="flex items-center brand-spacing-xl bg-black/30 backdrop-blur-md rounded-2xl brand-padding-xl">
              <div className="text-center">
                <div className="text-lg font-bold">{dayPlan.totalCalories}</div>
                <div className="text-xs text-white/80">Calories</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold">{dayPlan.totalProtein}g</div>
                <div className="text-xs text-white/80">Protein</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold">{dayPlan.meals.length}</div>
                <div className="text-xs text-white/80">Meals</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.round((dayPlan.totalCalories / dayPlan.targetCalories) * 100)}%</div>
                <div className="text-xs text-white/80">Goal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Visual Week Calendar */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-pastel-yellow/20">
          <div className="absolute inset-0 bg-gradient-to-br from-pastel-blue/5 to-pastel-yellow/10"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center brand-spacing-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pastel-blue to-pastel-blue-dark flex items-center justify-center">
                  <Calendar className="text-white" size={20} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg">Plan Your Week</h2>
                  <p className="text-sm text-muted-foreground">Select a day to plan your meals</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={setToday} className="btn-animate">
                Today
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + 1 + index);
                const dateStr = date.toISOString().split('T')[0];
                const dayPlanData = weeklyPlan.find(d => d.date === dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative p-3 rounded-xl transition-all duration-200 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'bg-white/60 hover:bg-white/80 hover:scale-102'
                    }`}
                  >
                    {isToday && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-chart-4 rounded-full animate-pulse"></div>
                    )}
                    <div className="font-semibold text-sm">{day}</div>
                    <div className="text-xs mt-1">
                      <div className="text-xs opacity-75">{date.getDate()}</div>
                      {dayPlanData && (
                        <div className="flex space-x-1 mt-1">
                          {dayPlanData.meals.map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-current rounded-full opacity-60"></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Daily Progress Rings */}
        <div className="relative overflow-hidden rounded-2xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
            alt="Nutrition progress background"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pastel-blue/10 via-white/60 to-pastel-yellow/10"></div>
          <div className="relative p-6">
            <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg mb-6 text-center">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Calories Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted/30"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-chart-4"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min((dayPlan.totalCalories / dayPlan.targetCalories) * 100, 100)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">🔥</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{dayPlan.totalCalories}</div>
                  <div className="text-xs text-muted-foreground">of {dayPlan.targetCalories} cal</div>
                </div>
              </div>

              {/* Protein Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted/30"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-chart-2"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min((dayPlan.totalProtein / dayPlan.targetProtein) * 100, 100)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">💪</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{dayPlan.totalProtein}g</div>
                  <div className="text-xs text-muted-foreground">of {dayPlan.targetProtein}g protein</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Meal Type Selector with Food Images */}
        <div className="space-y-4">
          <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg brand-padding-sm">Choose Your Meal</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
              const Icon = mealTypeIcons[type];
              const isSelected = selectedMealType === type;
              
              const mealImages = {
                breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120&q=80',
                lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120&q=80',
                dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120&q=80',
                snack: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120&q=80'
              };
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-primary shadow-lg scale-105'
                      : 'hover:scale-102 shadow-sm'
                  }`}
                >
                  <div className="h-20 relative">
                    <ImageWithFallback
                      src={mealImages[type]}
                      alt={`${type} meal`}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 ${
                      isSelected 
                        ? 'bg-primary/20' 
                        : 'bg-gradient-to-t from-black/40 to-transparent'
                    }`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Icon size={16} className="mx-auto mb-1 drop-shadow-lg" />
                        <div className="text-xs font-medium capitalize drop-shadow-lg">{type}</div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <Button 
            className="w-full btn-animate bg-gradient-to-r from-primary to-pastel-blue-dark hover:from-primary/90 hover:to-pastel-blue-dark/90"
            onClick={() => setIsCreatingMeal(true)}
            size="lg"
          >
            <Plus size={16} className="mr-2" />
            Explore {selectedMealType} Recipes
          </Button>
        </div>

        {/* Today's Visual Meal Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between brand-padding-sm">
            <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg">Today's Meal Plan</h2>
            <div className="flex items-center brand-spacing-sm">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {dayPlan.meals.length} meals
              </Badge>
              <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                {dayPlan.totalCalories} cal
              </Badge>
            </div>
          </div>
          
          {dayPlan.meals.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/20 to-pastel-blue/10">
              <div className="absolute inset-0 bg-gradient-to-br from-pastel-yellow/5 to-white/40"></div>
              <div className="relative text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pastel-blue/20 to-pastel-yellow/20 flex items-center justify-center">
                  <Utensils className="text-primary" size={32} />
                </div>
                <h3 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg mb-2">Ready to Plan?</h3>
                <p className="text-muted-foreground mb-4">Start building your perfect day of nutrition</p>
                <Button 
                  onClick={() => setIsCreatingMeal(true)} 
                  className="btn-animate bg-gradient-to-r from-primary to-pastel-blue-dark"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Meal
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dayPlan.meals.map((meal, index) => {
                const mealTimes = { breakfast: '08:00', lunch: '12:30', dinner: '18:00', snack: '15:00' };
                return (
                  <div key={meal.id} className="relative">
                    {/* Timeline Connector */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gradient-to-b from-primary/30 to-transparent"></div>
                    )}
                    
                    <div className="flex items-center brand-spacing-lg">
                      {/* Time Badge */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pastel-blue-dark flex items-center justify-center text-white font-medium text-xs">
                        {mealTimes[meal.type]}
                      </div>
                      
                      {/* Meal Card */}
                      <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm">
                        <div className="h-24 relative">
                          <ImageWithFallback
                            src={meal.image}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-r ${mealTypeColors[meal.type]} opacity-50`} />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                          
                          {/* Enhanced Meal Info Overlay */}
                          <div className="absolute inset-0 flex items-center justify-between brand-padding-lg">
                            <div className="flex-1">
                              <div className="flex items-center brand-spacing-sm mb-1">
                                {getMealTypeIcon(meal.type)}
                                <span className="text-xs uppercase tracking-wider text-white/80">{meal.type}</span>
                              </div>
                              <h3 className="font-bold text-white mb-1">{meal.name}</h3>
                              <div className="flex items-center brand-spacing-lg text-xs text-white/80">
                                <span className="flex items-center brand-spacing-xs">
                                  <Clock size={10} />
                                  <span>{meal.prepTime}min</span>
                                </span>
                                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                                  {meal.calories} cal
                                </span>
                                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                                  {meal.protein}g protein
                                </span>
                              </div>
                            </div>
                            
                            {/* Compact Action Buttons */}
                            <div className="flex flex-col brand-spacing-xs">
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => editMeal(meal.id)}
                                className="w-16 h-6 text-xs bg-white/20 hover:bg-white/30 text-white border-white/20"
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => removeMeal(meal.id)}
                                className="w-16 h-6 text-xs bg-destructive/80 hover:bg-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Visual Recipe Gallery (when creating) */}
        {isCreatingMeal && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between brand-padding-sm">
              <div>
                <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg capitalize">{selectedMealType} Recipes</h2>
                <p className="text-sm text-muted-foreground">Handpicked healthy options for you</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setIsCreatingMeal(false)}
                className="btn-animate"
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {mealTemplates
                .filter(template => template.type === selectedMealType)
                .map((template, index) => (
                  <div 
                    key={template.id} 
                    className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-40 relative">
                      <ImageWithFallback
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      
                      {/* Enhanced Recipe Info Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-between brand-padding-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => addMealToPlan(template)}
                            className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg btn-animate backdrop-blur-sm"
                          >
                            <Plus size={14} className="mr-1" />
                            Add Recipe
                          </Button>
                        </div>
                        
                        <div className="text-white">
                          <h3 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-bold text-xl mb-2">{template.name}</h3>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                              <Clock size={14} className="mx-auto mb-1 text-chart-4" />
                              <div className="text-xs font-medium">{template.prepTime}min</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                              <span className="block text-lg mb-1">🔥</span>
                              <div className="text-xs font-medium">{template.calories} cal</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                              <span className="block text-lg mb-1">💪</span>
                              <div className="text-xs font-medium">{template.protein}g</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Quick Add Custom Recipe */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pastel-blue/10 to-pastel-yellow/10 border border-primary/20">
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-pastel-blue-dark flex items-center justify-center">
                  <ChefHat className="text-white" size={24} />
                </div>
                <h3 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg mb-2">Create Custom Recipe</h3>
                <p className="text-sm text-muted-foreground mb-4">Build your own recipe with our ingredient calculator</p>
                <Button 
                  onClick={() => onNavigate?.('calculator')}
                  variant="outline"
                  className="btn-animate border-primary/30 hover:bg-primary/10"
                >
                  Open Recipe Builder
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Weekly Stats Overview */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-pastel-yellow/20">
          <div className="absolute inset-0 bg-gradient-to-br from-pastel-blue/5 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="font-semibold text-lg">Weekly Progress</h2>
                <p className="text-sm text-muted-foreground">Your nutrition journey this week</p>
              </div>
              <div className="flex brand-spacing-sm">
                <Button size="sm" variant="outline" onClick={shareMealPlan} className="btn-animate">
                  <Share size={14} className="mr-1" />
                  Share
                </Button>
                <Button size="sm" variant="outline" onClick={saveMealPlan} className="btn-animate">
                  <Save size={14} className="mr-1" />
                  Save
                </Button>
              </div>
            </div>
            
            {/* Visual Week Progress Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + 1 + index);
                const dateStr = date.toISOString().split('T')[0];
                const dayPlanData = weeklyPlan.find(d => d.date === dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const completionRate = dayPlanData ? Math.min((dayPlanData.totalCalories / dayPlanData.targetCalories) * 100, 100) : 0;
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative p-3 rounded-xl transition-all duration-200 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'bg-white/60 hover:bg-white/80 hover:scale-102'
                    }`}
                  >
                    {isToday && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-chart-4 rounded-full animate-pulse shadow-lg"></div>
                    )}
                    
                    <div className="text-xs font-semibold">{day}</div>
                    <div className="text-xs mt-1">{date.getDate()}</div>
                    
                    {/* Mini Progress Ring */}
                    <div className="mt-2 mx-auto">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          opacity="0.2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${completionRate * 0.5} 50`}
                          transform="rotate(-90 12 12)"
                          className="text-chart-4"
                        />
                      </svg>
                    </div>
                    
                    {dayPlanData && (
                      <div className="text-xs mt-1 space-y-1">
                        <div className="font-medium">{Math.round(completionRate)}%</div>
                        <div className="opacity-60">{dayPlanData.meals.length} meals</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Quick Action Center */}
            <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-gradient-to-r from-primary to-pastel-blue-dark hover:from-primary/90 hover:to-pastel-blue-dark/90 btn-animate"
                  onClick={setNutritionGoals}
                >
                  <Target size={14} className="mr-2" />
                  Nutrition Goals
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary/30 hover:bg-primary/10 btn-animate"
                  onClick={() => showWeeklyAnalytics()}
                >
                  <Calendar size={14} className="mr-2" />
                  Week Stats
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}