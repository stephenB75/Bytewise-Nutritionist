/**
 * Bytewise Dashboard Component
 * 
 * Main dashboard with nutrition overview and daily progress
 * Features seamless hero integration and real-time data
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  TrendingUp, 
  Target, 
  Flame, 
  Clock,
  Utensils,
  BarChart3,
  Award,
  Apple,
  Beef,
  Wheat,
  Droplets
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  // Sample data - in real app this would come from API
  const [userStats, setUserStats] = useState({
    name: "Alex",
    currentStreak: 7,
    caloriesConsumed: 1847,
    caloriesGoal: 2200,
    proteinConsumed: 89,
    proteinGoal: 120,
    waterConsumed: 6,
    waterGoal: 8
  });

  const [todayMeals, setTodayMeals] = useState([
    {
      name: "Greek Yogurt Bowl",
      time: "8:30 AM",
      calories: 320,
      type: "breakfast",
      color: "from-orange-100 to-orange-200"
    },
    {
      name: "Quinoa Salad",
      time: "12:45 PM", 
      calories: 485,
      type: "lunch",
      color: "from-green-100 to-green-200"
    },
    {
      name: "Almonds",
      time: "3:20 PM",
      calories: 164,
      type: "snack", 
      color: "from-purple-100 to-purple-200"
    }
  ]);

  const calorieProgress = (userStats.caloriesConsumed / userStats.caloriesGoal) * 100;
  const proteinProgress = (userStats.proteinConsumed / userStats.proteinGoal) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
        backgroundAlt="Fresh healthy ingredients"
        title={`Welcome, ${userStats.name}`}
        subtitle="Today's progress"
        description="Track every ingredient, master your nutrition"
        containerClass="-mx-4"
        statCard={{
          icon: Flame,
          value: userStats.currentStreak,
          label: "day streak",
          iconColor: "orange-400"
        }}
        progressRing={{
          percentage: calorieProgress,
          color: "#a8dadc",
          label: "calories"
        }}
      />

      {/* Main Content */}
      <div className="px-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-heading">
                  {userStats.caloriesConsumed}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">
                  of {userStats.caloriesGoal} cal
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Beef className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-heading">
                  {userStats.proteinConsumed}g
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">
                  of {userStats.proteinGoal}g protein
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Meals */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-subheading">Today's Meals</h3>
            <Button 
              size="sm" 
              onClick={() => onNavigate('recipe-builder')}
              className="text-brand-button"
            >
              <Plus size={16} className="mr-1" />
              Add Meal
            </Button>
          </div>
          
          <div className="space-y-3">
            {todayMeals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Utensils size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-subheading">{meal.name}</p>
                    <p className="text-sm text-muted-foreground text-brand-body">{meal.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-heading">{meal.calories}</p>
                  <p className="text-xs text-muted-foreground text-brand-body">calories</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Nutrition Progress */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Nutrition Goals</h3>
          
          <div className="space-y-4">
            {/* Calories Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-brand-label">Calories</span>
                <span className="text-sm text-muted-foreground text-brand-body">
                  {userStats.caloriesConsumed}/{userStats.caloriesGoal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Protein Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-brand-label">Protein</span>
                <span className="text-sm text-muted-foreground text-brand-body">
                  {userStats.proteinConsumed}g/{userStats.proteinGoal}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Water Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-brand-label">Water</span>
                <span className="text-sm text-muted-foreground text-brand-body">
                  {userStats.waterConsumed}/{userStats.waterGoal} glasses
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(userStats.waterConsumed / userStats.waterGoal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-16 text-brand-button"
            onClick={() => onNavigate('planner')}
          >
            <BarChart3 className="mr-2" size={20} />
            Plan Meals
          </Button>
          <Button 
            variant="outline" 
            className="h-16 text-brand-button"
            onClick={() => onNavigate('profile')}
          >
            <Award className="mr-2" size={20} />
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
}