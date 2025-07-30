/**
 * Bytewise Meal Planner Component
 * 
 * Advanced meal planning with quick meal suggestions
 * Features weekly planning and nutrition optimization
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  Shuffle, 
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Timer,
  Zap,
  Target
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';

interface MealTemplate {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  prepTime: number;
  image: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PlannedMeal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  prepTime: number;
  image: string;
}

interface DayPlan {
  date: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
}

interface MealPlannerProps {
  onNavigate: (page: string) => void;
}

export default function MealPlanner({ onNavigate }: MealPlannerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    return monday;
  });

  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [quickMeals, setQuickMeals] = useState<MealTemplate[]>([]);

  // Sample meal templates
  const mealTemplates: MealTemplate[] = [
    {
      id: '1',
      name: 'Greek Yogurt Berry Bowl',
      type: 'breakfast',
      calories: 320,
      protein: 20,
      prepTime: 5,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      tags: ['High Protein', 'Quick', 'Healthy'],
      difficulty: 'easy'
    },
    {
      id: '2',
      name: 'Quinoa Power Salad',
      type: 'lunch',
      calories: 485,
      protein: 18,
      prepTime: 15,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      tags: ['Vegetarian', 'Balanced', 'Filling'],
      difficulty: 'easy'
    },
    {
      id: '3',
      name: 'Grilled Chicken & Vegetables',
      type: 'dinner',
      calories: 425,
      protein: 35,
      prepTime: 25,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      tags: ['High Protein', 'Low Carb', 'Lean'],
      difficulty: 'medium'
    },
    {
      id: '4',
      name: 'Mixed Nuts & Fruit',
      type: 'snack',
      calories: 180,
      protein: 6,
      prepTime: 2,
      image: 'https://images.unsplash.com/photo-1605375669816-e8bb93e78d2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      tags: ['Quick', 'Portable', 'Energy'],
      difficulty: 'easy'
    }
  ];

  // Generate random quick meals
  useEffect(() => {
    const shuffled = [...mealTemplates].sort(() => 0.5 - Math.random());
    setQuickMeals(shuffled.slice(0, 8));
  }, []);

  // Generate week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const addMealToPlan = (meal: MealTemplate, dateStr: string) => {
    const newMeal: PlannedMeal = {
      id: `${meal.id}-${Date.now()}`,
      name: meal.name,
      type: meal.type,
      calories: meal.calories,
      protein: meal.protein,
      prepTime: meal.prepTime,
      image: meal.image
    };

    setWeeklyPlan(prev => {
      const existingDay = prev.find(day => day.date === dateStr);
      if (existingDay) {
        return prev.map(day => 
          day.date === dateStr 
            ? {
                ...day,
                meals: [...day.meals, newMeal],
                totalCalories: day.totalCalories + newMeal.calories,
                totalProtein: day.totalProtein + newMeal.protein
              }
            : day
        );
      } else {
        return [...prev, {
          date: dateStr,
          meals: [newMeal],
          totalCalories: newMeal.calories,
          totalProtein: newMeal.protein
        }];
      }
    });
  };

  const getCurrentDayPlan = () => {
    return weeklyPlan.find(day => day.date === selectedDay) || {
      date: selectedDay,
      meals: [],
      totalCalories: 0,
      totalProtein: 0
    };
  };

  const getMealsByType = (type: string) => {
    return getCurrentDayPlan().meals.filter(meal => meal.type === type);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const totalPlannedMeals = weeklyPlan.reduce((total, day) => total + day.meals.length, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1466637574441-749b8f19452f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
        backgroundAlt="Meal planning and preparation setup"
        title="Meal Planner"
        subtitle="Plan your week ahead"
        description="Smart meal suggestions for balanced nutrition"
        statCard={{
          icon: Calendar,
          value: totalPlannedMeals,
          label: "meals planned",
          iconColor: "green-400"
        }}
        progressRing={{
          percentage: Math.min((totalPlannedMeals / 21) * 100, 100),
          color: "#a8dadc",
          label: "week"
        }}
      />

      {/* Main Content */}
      <div className="px-4 space-y-6">
        {/* Week Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="text-brand-button"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <h3 className="text-lg font-semibold text-brand-subheading">
              Week of {currentWeekStart.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </h3>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('next')}
              className="text-brand-button"
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayPlan = weeklyPlan.find(plan => plan.date === dateStr);
              const isSelected = dateStr === selectedDay;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`
                    h-16 flex flex-col items-center justify-center relative
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setSelectedDay(dateStr)}
                >
                  <span className="text-xs text-brand-label">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-sm font-medium text-brand-subheading">
                    {day.getDate()}
                  </span>
                  {dayPlan && dayPlan.meals.length > 0 && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Daily Meal Plan */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-subheading">
              {new Date(selectedDay).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </h3>
            <div className="text-right">
              <p className="text-sm font-medium text-brand-heading">
                {getCurrentDayPlan().totalCalories} cal
              </p>
              <p className="text-xs text-muted-foreground text-brand-body">
                {getCurrentDayPlan().totalProtein}g protein
              </p>
            </div>
          </div>

          <Tabs defaultValue="breakfast" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breakfast" className="text-xs text-brand-label">
                Breakfast
              </TabsTrigger>
              <TabsTrigger value="lunch" className="text-xs text-brand-label">
                Lunch
              </TabsTrigger>
              <TabsTrigger value="dinner" className="text-xs text-brand-label">
                Dinner
              </TabsTrigger>
              <TabsTrigger value="snack" className="text-xs text-brand-label">
                Snacks
              </TabsTrigger>
            </TabsList>

            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
              <TabsContent key={mealType} value={mealType} className="mt-4">
                <div className="space-y-3">
                  {getMealsByType(mealType).map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={meal.image} 
                          alt={meal.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-brand-subheading">{meal.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="text-brand-body">{meal.calories} cal</span>
                            <span className="text-brand-body">•</span>
                            <span className="text-brand-body">{meal.prepTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getMealsByType(mealType).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-brand-body">No {mealType} planned yet</p>
                      <p className="text-xs text-brand-body">Add from quick suggestions below</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Quick Meal Suggestions */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-subheading">Quick Suggestions</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const shuffled = [...mealTemplates].sort(() => 0.5 - Math.random());
                setQuickMeals(shuffled.slice(0, 8));
              }}
              className="text-brand-button"
            >
              <Shuffle size={16} className="mr-1" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {quickMeals.map((meal) => (
              <div key={meal.id} className="border rounded-lg overflow-hidden">
                <img 
                  src={meal.image} 
                  alt={meal.name}
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs text-brand-label"
                    >
                      {meal.type}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span className="text-xs text-muted-foreground text-brand-body">
                        {meal.prepTime}m
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium mb-2 text-brand-subheading">
                    {meal.name}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span className="text-brand-body">{meal.calories} cal</span>
                      <span className="text-brand-body"> • {meal.protein}g protein</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => addMealToPlan(meal, selectedDay)}
                      className="h-6 px-2 text-xs text-brand-button"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Overview */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Weekly Overview</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 text-brand-heading">
                {totalPlannedMeals}
              </p>
              <p className="text-sm text-muted-foreground text-brand-body">Meals Planned</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600 text-brand-heading">
                {Math.round(weeklyPlan.reduce((total, day) => total + day.totalCalories, 0) / 7) || 0}
              </p>
              <p className="text-sm text-muted-foreground text-brand-body">Avg Daily Calories</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {weekDays.map((day, index) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayPlan = weeklyPlan.find(plan => plan.date === dateStr);
              const completionRate = dayPlan ? (dayPlan.meals.length / 3) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between p-2">
                  <span className="text-sm text-brand-body">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(completionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground text-brand-body">
                    {dayPlan ? dayPlan.meals.length : 0}/3
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-16 text-brand-button"
            onClick={() => onNavigate('recipe-builder')}
          >
            <Plus className="mr-2" size={20} />
            Create Recipe
          </Button>
          <Button 
            variant="outline" 
            className="h-16 text-brand-button"
            onClick={() => onNavigate('dashboard')}
          >
            <Target className="mr-2" size={20} />
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
}