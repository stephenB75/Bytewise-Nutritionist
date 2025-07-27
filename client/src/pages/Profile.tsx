import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Target, Award, FileDown, HelpCircle, LogOut, Edit } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goals, setGoals] = useState({
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    dailyProteinGoal: user?.dailyProteinGoal || 150,
    dailyCarbGoal: user?.dailyCarbGoal || 200,
    dailyFatGoal: user?.dailyFatGoal || 70,
    dailyWaterGoal: user?.dailyWaterGoal || 8,
  });

  // Update goals mutation
  const updateGoalsMutation = useMutation({
    mutationFn: async (goalsData: any) => {
      const response = await apiRequest('PATCH', '/api/user/goals', goalsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditingGoals(false);
      toast({
        title: "Goals updated",
        description: "Your nutrition goals have been updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error updating goals",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user recipes for stats
  const { data: userRecipes } = useQuery({
    queryKey: ['/api/recipes'],
    enabled: !!user,
  });

  // Get user stats
  const today = new Date().toISOString().split('T')[0];
  const { data: todayStats } = useQuery({
    queryKey: ['/api/stats', today],
    enabled: !!user,
  });

  const handleSaveGoals = async () => {
    await updateGoalsMutation.mutateAsync(goals);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const calculateGoalProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const userStats = todayStats || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    waterGlasses: 0,
  };

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email
              }
            </h1>
            <p className="text-sm opacity-90">Nutrition enthusiast</p>
            <p className="text-xs opacity-75">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 bg-white/20 rounded-full p-0 text-white hover:bg-white/30"
            onClick={() => setIsEditingGoals(!isEditingGoals)}
          >
            <Settings size={16} />
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold">47</div>
            <div className="text-xs opacity-80">Days Active</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{userRecipes?.length || 0}</div>
            <div className="text-xs opacity-80">Recipes Created</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold">
              {calculateGoalProgress(userStats.totalCalories, goals.dailyCalorieGoal)}%
            </div>
            <div className="text-xs opacity-80">Goals Hit</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Nutrition Goals */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Daily Goals</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingGoals(!isEditingGoals)}
            >
              <Edit size={16} />
            </Button>
          </div>

          {isEditingGoals ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Calories</label>
                  <Input
                    type="number"
                    value={goals.dailyCalorieGoal}
                    onChange={(e) => setGoals(prev => ({ 
                      ...prev, 
                      dailyCalorieGoal: parseInt(e.target.value) || 0 
                    }))}
                    className="touch-target"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Protein (g)</label>
                  <Input
                    type="number"
                    value={goals.dailyProteinGoal}
                    onChange={(e) => setGoals(prev => ({ 
                      ...prev, 
                      dailyProteinGoal: parseInt(e.target.value) || 0 
                    }))}
                    className="touch-target"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Carbs (g)</label>
                  <Input
                    type="number"
                    value={goals.dailyCarbGoal}
                    onChange={(e) => setGoals(prev => ({ 
                      ...prev, 
                      dailyCarbGoal: parseInt(e.target.value) || 0 
                    }))}
                    className="touch-target"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Fat (g)</label>
                  <Input
                    type="number"
                    value={goals.dailyFatGoal}
                    onChange={(e) => setGoals(prev => ({ 
                      ...prev, 
                      dailyFatGoal: parseInt(e.target.value) || 0 
                    }))}
                    className="touch-target"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Water (glasses)</label>
                <Input
                  type="number"
                  value={goals.dailyWaterGoal}
                  onChange={(e) => setGoals(prev => ({ 
                    ...prev, 
                    dailyWaterGoal: parseInt(e.target.value) || 0 
                  }))}
                  className="touch-target"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveGoals}
                  disabled={updateGoalsMutation.isPending}
                  className="flex-1 touch-target"
                >
                  {updateGoalsMutation.isPending ? 'Saving...' : 'Save Goals'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingGoals(false)}
                  className="flex-1 touch-target"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Calories</p>
                  <p className="text-xs text-muted-foreground">Target: {goals.dailyCalorieGoal} cal</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${calculateGoalProgress(userStats.totalCalories, goals.dailyCalorieGoal)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {calculateGoalProgress(userStats.totalCalories, goals.dailyCalorieGoal)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Protein</p>
                  <p className="text-xs text-muted-foreground">Target: {goals.dailyProteinGoal}g</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-chart-2 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${calculateGoalProgress(userStats.totalProtein, goals.dailyProteinGoal)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {calculateGoalProgress(userStats.totalProtein, goals.dailyProteinGoal)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Water</p>
                  <p className="text-xs text-muted-foreground">Target: {goals.dailyWaterGoal} glasses</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${calculateGoalProgress(userStats.waterGlasses, goals.dailyWaterGoal)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {calculateGoalProgress(userStats.waterGlasses, goals.dailyWaterGoal)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Achievements */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Achievements</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">7-Day Streak</p>
                <p className="text-xs text-muted-foreground">Logged meals for 7 consecutive days</p>
              </div>
              <Badge className="text-xs bg-yellow-500 text-white">New!</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Protein Master</p>
                <p className="text-xs text-muted-foreground">Hit protein goal 20 times</p>
              </div>
              <div className="text-xs text-green-600 font-medium">5 days ago</div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl touch-target transition-all">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🔔</span>
                <span className="font-medium text-sm">Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl touch-target transition-all">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🌙</span>
                <span className="font-medium text-sm">Dark Mode</span>
              </div>
              <Switch />
            </div>
            
            <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl touch-target transition-all">
              <div className="flex items-center space-x-3">
                <FileDown className="w-5 h-5" />
                <span className="font-medium text-sm">Export Data</span>
              </div>
              <span className="text-lg">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl touch-target transition-all">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium text-sm">Help & Support</span>
              </div>
              <span className="text-lg">→</span>
            </button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full touch-target"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Card>

        {/* App Info */}
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h3 className="font-semibold mb-1">Bytewise Nutritionist</h3>
          <p className="text-xs text-muted-foreground mb-2">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">Made with ❤️ for your health journey</p>
        </Card>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
