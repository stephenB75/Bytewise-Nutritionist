import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ProgressRing';
import { MealCard } from '@/components/MealCard';
import { TrendingUp, Calendar, Calculator, Bell, Droplets, Utensils, Trophy } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { data: stats } = useQuery<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    waterGlasses: number;
  }>({
    queryKey: ['/api/stats', today],
    enabled: !!user,
  });

  const { data: recentMeals } = useQuery<Array<any>>({
    queryKey: ['/api/meals'],
    enabled: !!user,
  });

  const userStats = stats || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    waterGlasses: 0,
  };

  const goals = {
    calories: user?.dailyCalorieGoal || 2000,
    protein: user?.dailyProteinGoal || 150,
    carbs: user?.dailyCarbGoal || 200,
    fat: user?.dailyFatGoal || 70,
    water: user?.dailyWaterGoal || 8,
  };

  const calorieProgress = Math.round((userStats.totalCalories / goals.calories) * 100);
  const proteinProgress = Math.round((userStats.totalProtein / goals.protein) * 100);

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar safe-area-top">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName || 'there'}
              </p>
              <p className="text-xs opacity-90">Ready to track your nutrition?</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-10 h-10 bg-white/20 rounded-full p-0 text-white hover:bg-white/30"
          >
            <Bell size={16} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Daily Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Progress</h2>
            <Badge 
              variant={calorieProgress >= 80 ? "default" : "secondary"}
              className="text-xs"
            >
              {calorieProgress >= 80 ? 'On Track' : 'Keep Going'}
            </Badge>
          </div>
          
          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <ProgressRing
              value={userStats.totalCalories}
              max={goals.calories}
              size={128}
              color="hsl(var(--primary))"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(userStats.totalCalories)}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {goals.calories} cal
                </div>
              </div>
            </ProgressRing>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-chart-2 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium">Protein</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(userStats.totalProtein)}g / {goals.protein}g
              </p>
            </div>
            <div className="text-center">
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-chart-4 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((userStats.totalCarbs / goals.carbs) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium">Carbs</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(userStats.totalCarbs)}g / {goals.carbs}g
              </p>
            </div>
            <div className="text-center">
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-chart-3 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((userStats.totalFat / goals.fat) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium">Fat</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(userStats.totalFat)}g / {goals.fat}g
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-start space-x-3 p-4 h-auto touch-target"
              onClick={() => onNavigate('meals')}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Log Meal</p>
                <p className="text-xs text-muted-foreground">Add food to diary</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-start space-x-3 p-4 h-auto touch-target"
              onClick={() => onNavigate('recipe-builder')}
            >
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Create Recipe</p>
                <p className="text-xs text-muted-foreground">Build & analyze</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Water Intake */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Water Intake</h3>
            </div>
            <span className="text-sm font-medium">
              {userStats.waterGlasses} / {goals.water}
            </span>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: goals.water }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < userStats.waterGlasses ? 'bg-blue-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Recent Meals */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Meals</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('meals')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentMeals && recentMeals.length > 0 ? (
              recentMeals.slice(0, 3).map((meal: any) => (
                <MealCard 
                  key={meal.id} 
                  meal={meal}
                />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No meals logged yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onNavigate('meals')}
                >
                  Log Your First Meal
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Nutrition Tip */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Today's Tip</h4>
              <p className="text-xs text-muted-foreground">
                Try adding more colorful vegetables to your meals for a wider range of nutrients and antioxidants.
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
