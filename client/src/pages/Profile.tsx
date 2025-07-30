/**
 * Bytewise Profile Component
 * 
 * User profile and account management interface
 * Features achievement tracking and settings
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Trophy,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  Award,
  Edit,
  Save,
  Eye,
  LogOut,
  Smartphone,
  Palette,
  Database
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

interface ProfileProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export default function Profile({ onNavigate, onLogout }: ProfileProps) {
  const [userProfile, setUserProfile] = useState({
    name: "Alex Chen",
    email: "alex.chen@example.com",
    joinDate: "2024-01-15",
    avatar: "",
    stats: {
      totalMealsLogged: 156,
      currentStreak: 7,
      totalRecipes: 12,
      daysActive: 45,
      calorieGoal: 2200,
      proteinGoal: 120
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);

  // Sample achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Week',
      description: 'Log meals for 7 consecutive days',
      icon: Calendar,
      earned: true,
      earnedDate: '2024-01-22',
      progress: 7,
      maxProgress: 7
    },
    {
      id: '2',
      title: 'Recipe Creator',
      description: 'Create your first custom recipe',
      icon: Trophy,
      earned: true,
      earnedDate: '2024-01-25',
      progress: 1,
      maxProgress: 1
    },
    {
      id: '3',
      title: 'Consistency King',
      description: 'Maintain a 30-day streak',
      icon: Flame,
      earned: false,
      progress: 7,
      maxProgress: 30
    },
    {
      id: '4',
      title: 'Nutrition Master',
      description: 'Hit protein goal 50 times',
      icon: Target,
      earned: false,
      progress: 23,
      maxProgress: 50
    }
  ]);

  const saveProfile = () => {
    setUserProfile(tempProfile);
    setIsEditingProfile(false);
    // In real app, save to backend
  };

  const saveGoals = () => {
    setUserProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        calorieGoal: tempProfile.stats.calorieGoal,
        proteinGoal: tempProfile.stats.proteinGoal
      }
    }));
    setIsEditingGoals(false);
    // In real app, save to backend
  };

  const getDaysSinceJoining = () => {
    const joinDate = new Date(userProfile.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProfileCompletion = () => {
    let completed = 0;
    const total = 6;
    
    if (userProfile.name) completed++;
    if (userProfile.email) completed++;
    if (userProfile.avatar) completed++;
    if (userProfile.stats.calorieGoal > 0) completed++;
    if (userProfile.stats.proteinGoal > 0) completed++;
    if (userProfile.stats.totalMealsLogged > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <HeroSection
        component="profile"
        title={`${userProfile.name}'s Profile`}
        subtitle="Your nutrition journey"
        description="Track progress and manage your account"
        statCard={{
          icon: Trophy,
          value: achievements.filter(a => a.earned).length,
          label: "achievements",
          iconColor: "yellow-400"
        }}
        progressRing={{
          percentage: getProfileCompletion(),
          color: "#a8dadc",
          label: "complete"
        }}
      />

      {/* Main Content */}
      <div className="px-4 space-y-6">
        {/* Profile Overview - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Profile Overview</h4>
              <p className="text-sm text-gray-600">Manage your personal information and settings</p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <User className="w-3 h-3 mr-1" />
              {getProfileCompletion()}% Complete
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setTempProfile(userProfile);
              }}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Edit size={16} className="mr-1" />
              {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>

          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                {isEditingProfile ? (
                  <div className="space-y-2">
                    <Input
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="text-brand-body"
                    />
                    <Input
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                      type="email"
                      className="text-brand-body"
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold text-brand-subheading">{userProfile.name}</h4>
                    <p className="text-sm text-muted-foreground text-brand-body">{userProfile.email}</p>
                    <p className="text-xs text-muted-foreground text-brand-body">
                      Member since {new Date(userProfile.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={saveProfile}
                  className="text-brand-button"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-brand-button"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Grid - Data Management Card Style */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-heading">
                  {getDaysSinceJoining()}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">days active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-heading">
                  {userProfile.stats.totalMealsLogged}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">meals logged</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-heading">
                  {userProfile.stats.currentStreak}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">day streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-heading">
                  {userProfile.stats.totalRecipes}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">recipes created</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Nutrition Goals - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-subheading">Nutrition Goals</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsEditingGoals(!isEditingGoals);
                setTempProfile(userProfile);
              }}
              className="text-brand-button"
            >
              <Edit size={16} className="mr-1" />
              {isEditingGoals ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {isEditingGoals ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-label">Daily Calorie Goal</label>
                <Input
                  type="number"
                  value={tempProfile.stats.calorieGoal}
                  onChange={(e) => setTempProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, calorieGoal: parseInt(e.target.value) || 0 }
                  }))}
                  className="text-brand-body"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-label">Daily Protein Goal (g)</label>
                <Input
                  type="number"
                  value={tempProfile.stats.proteinGoal}
                  onChange={(e) => setTempProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, proteinGoal: parseInt(e.target.value) || 0 }
                  }))}
                  className="text-brand-body"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={saveGoals}
                  className="text-brand-button"
                >
                  <Save size={16} className="mr-1" />
                  Save Goals
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingGoals(false)}
                  className="text-brand-button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600 text-brand-heading">
                  {userProfile.stats.calorieGoal}
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">Daily Calories</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600 text-brand-heading">
                  {userProfile.stats.proteinGoal}g
                </p>
                <p className="text-sm text-muted-foreground text-brand-body">Daily Protein</p>
              </div>
            </div>
          )}
        </Card>

        {/* Achievements - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Achievements</h4>
              <p className="text-sm text-gray-600">Track your progress and unlock rewards</p>
            </div>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Trophy className="w-3 h-3 mr-1" />
              {achievements.filter(a => a.earned).length}/{achievements.length} Earned
            </Badge>
          </div>
          
          <div className="space-y-2">
            {achievements.slice(0, 3).map((achievement) => (
              <div 
                key={achievement.id}
                className={`
                  p-3 rounded-lg border transition-all
                  ${achievement.earned 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-lg
                      ${achievement.earned ? 'bg-green-200' : 'bg-gray-200'}
                    `}>
                      <achievement.icon 
                        size={16} 
                        className={achievement.earned ? 'text-green-600' : 'text-gray-500'} 
                      />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">{achievement.title}</h5>
                      <p className="text-xs text-gray-600">
                        {achievement.description}
                      </p>
                      {achievement.earnedDate && (
                        <p className="text-xs text-green-600">
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {achievement.earned ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      ✓ Earned
                    </Badge>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                      <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Show all achievements modal or navigate to achievements page
                console.log('Showing all achievements');
                setShowAllAchievements(true);
              }}
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
            >
              <Trophy className="w-4 h-4 mr-1" />
              View All Achievements ({achievements.length})
            </Button>
          </div>
        </Card>

        {/* Settings Tabs - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="display" className="text-xs text-brand-label">
                Display
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs text-brand-label">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs text-brand-label">
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="display" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-subheading">Dark Mode</p>
                  <p className="text-sm text-muted-foreground text-brand-body">Switch to dark theme</p>
                </div>
                <Button variant="outline" size="sm" className="text-brand-button">
                  <Palette size={16} className="mr-1" />
                  Theme
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-subheading">Language</p>
                  <p className="text-sm text-muted-foreground text-brand-body">App language preference</p>
                </div>
                <Badge variant="outline" className="text-brand-label">English</Badge>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-subheading">Meal Reminders</p>
                  <p className="text-sm text-muted-foreground text-brand-body">Get reminded to log meals</p>
                </div>
                <Button variant="outline" size="sm" className="text-brand-button">
                  <Bell size={16} />
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-subheading">Goal Achievements</p>
                  <p className="text-sm text-muted-foreground text-brand-body">Celebrate your progress</p>
                </div>
                <Button variant="outline" size="sm" className="text-brand-button">
                  <Award size={16} />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-subheading">Data Export</p>
                  <p className="text-sm text-muted-foreground text-brand-body">Download your data</p>
                </div>
                <Button variant="outline" size="sm" className="text-brand-button">
                  <Database size={16} />
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-subheading">Account Security</p>
                  <p className="text-sm text-muted-foreground text-brand-body">Manage security settings</p>
                </div>
                <Button variant="outline" size="sm" className="text-brand-button">
                  <Shield size={16} />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Account Actions - Data Management Card Style */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-brand-subheading">Account Actions</h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-brand-button"
              onClick={() => onNavigate('dashboard')}
            >
              <TrendingUp className="mr-2" size={16} />
              View Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-brand-button"
              onClick={() => onNavigate('planner')}
            >
              <Calendar className="mr-2" size={16} />
              Meal Planner
            </Button>
            
            <Separator />
            
            {onLogout && (
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={onLogout}
              >
                <LogOut className="mr-2" size={16} />
                Sign Out
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}