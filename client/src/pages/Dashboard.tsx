/**
 * Bytewise Dashboard Component
 * 
 * Main dashboard with nutrition overview and daily progress
 * Features seamless hero integration and real-time data
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Target, 
  Flame, 
  Utensils,
  BarChart3,
  Award,
  Beef,
  Droplets,
  Calendar
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
  // Sample data - in real app this would come from API
  const [userStats] = useState({
    name: "Alex",
    currentStreak: 7,
    caloriesConsumed: 1847,
    caloriesGoal: 2200,
    proteinConsumed: 89,
    proteinGoal: 120,
    waterConsumed: 6,
    waterGoal: 8
  });

  const [todayMeals] = useState([
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
      name: "Grilled Chicken",
      time: "7:20 PM",
      calories: 520,
      type: "dinner",
      color: "from-blue-100 to-blue-200"
    }
  ]);

  const [achievements] = useState([
    { id: 1, title: "7 Day Streak", icon: Flame, color: "text-orange-500" },
    { id: 2, title: "Goal Crusher", icon: Target, color: "text-green-500" },
    { id: 3, title: "Meal Master", icon: Award, color: "text-purple-500" }
  ]);

  // Calculate progress percentages
  const calorieProgress = Math.round((userStats.caloriesConsumed / userStats.caloriesGoal) * 100);
  const proteinProgress = Math.round((userStats.proteinConsumed / userStats.proteinGoal) * 100);
  const waterProgress = Math.round((userStats.waterConsumed / userStats.waterGoal) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <HeroSection
        title={`Good morning, ${userStats.name}!`}
        subtitle="Keep up your amazing progress"
        caloriesConsumed={userStats.caloriesConsumed}
        caloriesGoal={userStats.caloriesGoal}
        currentStreak={userStats.currentStreak}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Beef className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-lg font-bold text-gray-900">
                  {userStats.proteinConsumed}g / {userStats.proteinGoal}g
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Water</p>
                <p className="text-lg font-bold text-gray-900">
                  {userStats.waterConsumed} / {userStats.waterGoal} cups
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(waterProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Meals */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Today's Meals</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('recipe-builder')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Meal
            </Button>
          </div>
          
          <div className="space-y-3">
            {todayMeals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Utensils className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{meal.name}</p>
                    <p className="text-sm text-gray-600">{meal.time}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white">
                  {meal.calories} cal
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div key={achievement.id} className="text-center">
                  <div className="p-3 bg-gray-50 rounded-lg mb-2 mx-auto w-fit">
                    <IconComponent className={`w-6 h-6 ${achievement.color}`} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{achievement.title}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => onNavigate('planner')} 
            className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Plan Meals
          </Button>
          <Button 
            onClick={() => onNavigate('profile')} 
            variant="outline"
            className="h-16 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;