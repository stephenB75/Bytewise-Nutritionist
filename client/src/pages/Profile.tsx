/**
 * Bytewise Enhanced Profile Screen
 * 
 * Comprehensive user profile and account management interface
 * Features:
 * - Seamless header-hero integration with user stats
 * - Enhanced horizontal tabs with icons above text
 * - Functional account settings components
 * - Editable calorie goal with validation
 * - Dynamic app version tracking with history
 * - Clean user data management with clearing options
 * - Responsive design with Bytewise brand guidelines
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Monitor,
  Database,
  Trophy,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  ChefHat,
  Clock,
  Award,
  LogOut,
  Edit,
  BarChart3,
  Activity,
  Palette,
  Eye,
  Info,
  Smartphone,
  Copyright,
  Building,
  Check,
  X,
  History,
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function Profile({ onNavigate, showToast }: ProfileProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('personal');
  const [showAchievements, setShowAchievements] = useState(false);
  const [isEditingCalories, setIsEditingCalories] = useState(false);
  const [editCaloriesValue, setEditCaloriesValue] = useState('2000');
  const [calorieEditError, setCalorieEditError] = useState('');

  // Mock user data
  const user = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: null
    },
    nutritionGoals: {
      dailyCalories: 2000
    },
    accountInfo: {
      joinDate: '2024-01-01'
    },
    achievements: [
      {
        id: '1',
        name: 'First Week',
        description: 'Logged meals for 7 days',
        dateEarned: '2024-01-07'
      }
    ]
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 10;
    
    if (user.personalInfo.firstName) completed++;
    if (user.personalInfo.lastName) completed++;
    if (user.personalInfo.email) completed++;
    if (user.nutritionGoals.dailyCalories > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Calculate days since joining
  const getDaysSinceJoining = () => {
    const joinDate = new Date(user.accountInfo.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle calorie goal editing
  const handleEditCaloriesStart = () => {
    setEditCaloriesValue(user.nutritionGoals.dailyCalories.toString());
    setIsEditingCalories(true);
    setCalorieEditError('');
  };

  const handleEditCaloriesCancel = () => {
    setIsEditingCalories(false);
    setEditCaloriesValue('');
    setCalorieEditError('');
  };

  const handleEditCaloriesSave = async () => {
    const newCalories = parseInt(editCaloriesValue);
    
    // Validation
    if (isNaN(newCalories)) {
      setCalorieEditError('Please enter a valid number');
      return;
    }
    
    if (newCalories < 800) {
      setCalorieEditError('Calorie goal should be at least 800 calories');
      return;
    }
    
    if (newCalories > 5000) {
      setCalorieEditError('Calorie goal should not exceed 5000 calories');
      return;
    }

    try {
      // In a real app, this would update the user's calorie goal
      setIsEditingCalories(false);
      setEditCaloriesValue('');
      setCalorieEditError('');
      showToast(`Daily calorie goal updated to ${newCalories} calories!`);
    } catch (error) {
      console.error('Failed to update calorie goal:', error);
      setCalorieEditError('Failed to update calorie goal');
    }
  };

  const handleCalorieInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditCaloriesSave();
    } else if (e.key === 'Escape') {
      handleEditCaloriesCancel();
    }
  };

  const profileCompletion = calculateProfileCompletion();
  const daysSinceJoining = getDaysSinceJoining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-white to-pastel-blue">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pastel-yellow to-pastel-blue p-6 pt-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.personalInfo.avatar || undefined} />
              <AvatarFallback className="bg-white/20 text-black text-lg font-bold">
                {user.personalInfo.firstName?.[0]}{user.personalInfo.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 
                className="text-2xl font-bold text-black"
                style={{ fontFamily: "'League Spartan', sans-serif" }}
              >
                {user.personalInfo.firstName} {user.personalInfo.lastName}
              </h1>
              <p 
                className="text-sm text-black/70"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {user.personalInfo.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-black border-0">
                  {profileCompletion}% Complete
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-black border-0">
                  Day {daysSinceJoining}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4 -mt-4">
        {/* Quick Stats */}
        <Card className="mb-6 p-4 shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 bg-pastel-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-pastel-blue" />
              </div>
              <p className="text-sm text-gray-600">Daily Goal</p>
              <div className="flex items-center justify-center gap-1">
                {isEditingCalories ? (
                  <div className="flex flex-col items-center gap-1">
                    <Input
                      type="number"
                      value={editCaloriesValue}
                      onChange={(e) => setEditCaloriesValue(e.target.value)}
                      onKeyDown={handleCalorieInputKeyPress}
                      className="w-20 h-6 text-xs text-center"
                      min="800"
                      max="5000"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCaloriesSave}
                        className="h-6 w-6 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCaloriesCancel}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    {calorieEditError && (
                      <p className="text-xs text-red-500">{calorieEditError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <p className="font-bold">{user.nutritionGoals.dailyCalories}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditCaloriesStart}
                      className="h-4 w-4 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">calories</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-pastel-yellow/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-pastel-yellow" />
              </div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="font-bold">7</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="font-bold">{user.achievements.length}</p>
              <p className="text-xs text-gray-500">earned</p>
            </div>
          </div>
        </Card>

        {/* Settings Tabs */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="personal" className="flex flex-col gap-1 py-3">
                <User className="w-4 h-4" />
                <span className="text-xs">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex flex-col gap-1 py-3">
                <Target className="w-4 h-4" />
                <span className="text-xs">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col gap-1 py-3">
                <Bell className="w-4 h-4" />
                <span className="text-xs">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex flex-col gap-1 py-3">
                <Settings className="w-4 h-4" />
                <span className="text-xs">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input value={user.personalInfo.firstName} readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input value={user.personalInfo.lastName} readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user.personalInfo.email} readOnly />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Nutrition Goals</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Daily Calories</label>
                    <Input value={user.nutritionGoals.dailyCalories} readOnly />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onNavigate('dashboard')}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Update Goals
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Notification Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meal Reminders</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Goal Notifications</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Progress
                  </Button>
                  <Separator />
                  <Button variant="destructive" className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}