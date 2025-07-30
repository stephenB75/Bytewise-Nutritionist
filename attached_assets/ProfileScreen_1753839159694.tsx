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
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useUser } from '../user/UserManager';
import { useVersionManager, VersionHistoryEntry } from '../utils/VersionManager';
import { DataClearingPanel } from '../utils/DataClearingUtils';
import { 
  PersonalInfoSettings, 
  PrivacySecuritySettings, 
  NotificationSettings, 
  DisplaySettings, 
  DataManagementSettings,
  AccountActionsButtons
} from '../user/AccountSettings';

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { user, isLoading, updateStats, updateNutritionGoals } = useUser();
  const { 
    currentVersion, 
    versionHistory, 
    isLoading: versionLoading,
    checkForUpdates,
    getVersionHistory,
    getVersionStats,
    formatVersionDisplay
  } = useVersionManager();
  
  const [activeSettingsTab, setActiveSettingsTab] = useState('personal');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDataClearing, setShowDataClearing] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  
  // Calorie goal editing state
  const [isEditingCalories, setIsEditingCalories] = useState(false);
  const [editCaloriesValue, setEditCaloriesValue] = useState('');
  const [calorieEditError, setCalorieEditError] = useState('');

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let completed = 0;
    const total = 10;
    
    if (user.personalInfo.firstName) completed++;
    if (user.personalInfo.lastName) completed++;
    if (user.personalInfo.email) completed++;
    if (user.personalInfo.dateOfBirth) completed++;
    if (user.personalInfo.gender) completed++;
    if (user.personalInfo.height) completed++;
    if (user.personalInfo.weight) completed++;
    if (user.nutritionGoals.dailyCalories > 0) completed++;
    if (user.activityLevel.level) completed++;
    if (user.personalInfo.avatar) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Calculate days since joining
  const getDaysSinceJoining = () => {
    if (!user) return 0;
    const joinDate = new Date(user.accountInfo.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get recent achievements
  const getRecentAchievements = () => {
    if (!user) return [];
    return user.achievements
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime())
      .slice(0, 3);
  };

  // Handle calorie goal editing
  const handleEditCaloriesStart = () => {
    if (!user) return;
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
    if (!user) return;

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
      const success = await updateNutritionGoals({
        dailyCalories: newCalories
      });

      if (success) {
        setIsEditingCalories(false);
        setEditCaloriesValue('');
        setCalorieEditError('');
        
        // Show success notification
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: {
            message: `✅ Daily calorie goal updated to ${newCalories} calories!`,
            duration: 3000
          }
        }));
        
        console.log('✅ Calorie goal updated successfully');
      } else {
        setCalorieEditError('Failed to update calorie goal');
      }
    } catch (error) {
      console.error('❌ Failed to update calorie goal:', error);
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

  // Handle update check
  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const update = await checkForUpdates();
      if (update) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: {
            message: `🚀 Update available: v${update.version}`,
            duration: 4000
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: {
            message: '✅ You\'re running the latest version!',
            duration: 3000
          }
        }));
      }
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: {
          message: '❌ Failed to check for updates',
          duration: 3000
        }
      }));
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Handle data clearing completion
  const handleDataCleared = () => {
    setShowDataClearing(false);
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: {
        message: '🧹 Data cleared successfully! The app will reload shortly.',
        duration: 4000
      }
    }));
    
    // Auto-reload after data clearing
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Get version statistics
  const versionStats = getVersionStats();
  const recentVersionHistory = getVersionHistory().slice(0, 5);

  const profileCompletion = calculateProfileCompletion();
  const daysSinceJoining = getDaysSinceJoining();
  const recentAchievements = getRecentAchievements();

  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              No user profile found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Hero Section with Seamless Header Integration */}
      <div className="relative -mx-3 mb-3">
        <div className="h-64 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Personal wellness and nutrition tracking dashboard"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <div className="absolute inset-x-4 bottom-3 top-16 flex flex-col justify-end text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white/30">
                  <AvatarImage src={user.personalInfo.avatar} alt={user.personalInfo.firstName} />
                  <AvatarFallback className="text-black bg-white/80" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.5rem", fontWeight: 600 }}>
                    {user.personalInfo.firstName.charAt(0)}{user.personalInfo.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm opacity-90 mb-1 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>Welcome back</p>
                  <h1 className="text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.2 }}>
                    {user.personalInfo.firstName} {user.personalInfo.lastName}
                  </h1>
                  <p className="text-sm opacity-90 mt-1 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    Member for {daysSinceJoining} days
                  </p>
                </div>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Trophy className="text-yellow-400" size={16} />
                  <span className="text-2xl font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
                    {user.achievements.length}
                  </span>
                </div>
                <p className="text-xs opacity-90 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>achievements</p>
              </div>
            </div>
            
            {/* Profile Stats and Completion Progress Ring */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-md rounded-2xl px-4 py-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                    {user.stats.streakDays}
                  </div>
                  <div className="text-xs text-white/80 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>Streak</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                    {user.stats.totalRecipes}
                  </div>
                  <div className="text-xs text-white/80 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>Recipes</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                    {user.stats.totalMeals}
                  </div>
                  <div className="text-xs text-white/80 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>Meals</div>
                </div>
              </div>
              
              {/* Profile Completion Ring */}
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
                    stroke="#a8dadc" 
                    strokeWidth="6" 
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - profileCompletion / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                      {profileCompletion}%
                    </div>
                    <div className="text-xs opacity-75 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 space-y-3">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Editable Calorie Goal Card */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 relative">
            {!isEditingCalories ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-blue-900 text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                    {user.nutritionGoals.dailyCalories}
                  </p>
                  <p className="text-xs text-blue-700 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                    Daily Goal (cal)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCaloriesStart}
                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-200/50"
                  aria-label="Edit calorie goal"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={editCaloriesValue}
                      onChange={(e) => setEditCaloriesValue(e.target.value)}
                      onKeyDown={handleCalorieInputKeyPress}
                      className="text-lg font-bold text-blue-900 bg-white/80 border-blue-300 h-8 px-2 text-brand-heading"
                      style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}
                      placeholder="Enter calories"
                      min="800"
                      max="5000"
                      autoFocus
                    />
                    <p className="text-xs text-blue-700 text-brand-body mt-1" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                      Daily Goal (cal)
                    </p>
                  </div>
                </div>
                
                {calorieEditError && (
                  <p className="text-xs text-red-600 text-brand-body px-1" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                    {calorieEditError}
                  </p>
                )}
                
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditCaloriesCancel}
                    className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-200/50"
                    aria-label="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditCaloriesSave}
                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-200/50"
                    aria-label="Save calorie goal"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-900 text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                  {user.activityLevel.exerciseDays}
                </p>
                <p className="text-xs text-green-700 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                  Exercise Days
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-200">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                  Recent Achievements
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAchievements(!showAchievements)}
                className="text-brand-button hover:bg-yellow-100"
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
              >
                {showAchievements ? 'Hide' : 'View All'}
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-yellow-200">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                      {achievement.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs text-brand-body border-yellow-300 text-yellow-700">
                    {achievement.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Enhanced Account Settings Tabs */}
        <Card className="p-0 bg-gradient-to-br from-pastel-yellow/30 to-white border-2 border-pastel-blue/20">
          <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
            <div className="p-4 pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-pastel-blue/20 flex items-center justify-center border-2 border-pastel-blue/30">
                  <Settings className="w-5 h-5 text-pastel-blue-dark" />
                </div>
                <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
                  Account Settings
                </h3>
              </div>
              
              {/* Enhanced Horizontal Tabs with Icons Above Text */}
              <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-pastel-blue/10 border border-pastel-blue/20">
                <TabsTrigger 
                  value="personal" 
                  className="flex flex-col items-center gap-1 py-3 px-2 text-brand-button data-[state=active]:bg-pastel-blue/20 data-[state=active]:text-pastel-blue-dark"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}
                >
                  <User size={18} />
                  <span className="text-xs" style={{ fontSize: "0.75rem" }}>Personal</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex flex-col items-center gap-1 py-3 px-2 text-brand-button data-[state=active]:bg-pastel-blue/20 data-[state=active]:text-pastel-blue-dark"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}
                >
                  <Shield size={18} />
                  <span className="text-xs" style={{ fontSize: "0.75rem" }}>Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex flex-col items-center gap-1 py-3 px-2 text-brand-button data-[state=active]:bg-pastel-blue/20 data-[state=active]:text-pastel-blue-dark"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}
                >
                  <Bell size={18} />
                  <span className="text-xs" style={{ fontSize: "0.75rem" }}>Alerts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="display" 
                  className="flex flex-col items-center gap-1 py-3 px-2 text-brand-button data-[state=active]:bg-pastel-blue/20 data-[state=active]:text-pastel-blue-dark"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}
                >
                  <Palette size={18} />
                  <span className="text-xs" style={{ fontSize: "0.75rem" }}>Display</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex flex-col items-center gap-1 py-3 px-2 text-brand-button data-[state=active]:bg-pastel-blue/20 data-[state=active]:text-pastel-blue-dark"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}
                >
                  <Database size={18} />
                  <span className="text-xs" style={{ fontSize: "0.75rem" }}>Data</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4">
              <TabsContent value="personal" className="mt-0">
                <PersonalInfoSettings />
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <PrivacySecuritySettings />
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <NotificationSettings />
              </TabsContent>
              
              <TabsContent value="display" className="mt-0">
                <DisplaySettings />
              </TabsContent>
              
              <TabsContent value="data" className="mt-0">
                <div className="space-y-4">
                  <DataManagementSettings />
                  
                  {/* Data Clearing Section */}
                  <Separator className="bg-pastel-blue/20" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}>
                          Data Clearing
                        </h4>
                        <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                          Clear stored data for testing or fresh start
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDataClearing(!showDataClearing)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-brand-button border-red-300"
                        style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {showDataClearing ? 'Hide' : 'Manage Data'}
                      </Button>
                    </div>
                    
                    {showDataClearing && (
                      <div className="animate-fade-in">
                        <DataClearingPanel onDataCleared={handleDataCleared} />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Enhanced Account Actions */}
        <Card className="p-4 bg-gradient-to-br from-pastel-blue/20 to-white border-2 border-pastel-blue/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-pastel-blue/30 flex items-center justify-center border-2 border-pastel-blue/50">
              <Settings className="w-5 h-5 text-pastel-blue-dark" />
            </div>
            <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
              Account Actions
            </h3>
          </div>

          <AccountActionsButtons />

          <Separator className="my-4 bg-pastel-blue/20" />

          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-brand-button border-red-300 p-4 h-auto"
            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                onLogout();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <LogOut size={20} className="text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}>
                  Log Out
                </p>
                <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                  Sign out of your account
                </p>
              </div>
            </div>
          </Button>
        </Card>

        {/* Account Status */}
        <Card className="p-4 bg-gradient-to-r from-pastel-yellow/20 to-pastel-blue/20 border-2 border-pastel-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
                Account Status
              </h4>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                {user.accountInfo.accountType.charAt(0).toUpperCase() + user.accountInfo.accountType.slice(1)} Account
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant={user.accountInfo.emailVerified ? "default" : "secondary"} 
                className={`text-brand-body ${user.accountInfo.emailVerified ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}
              >
                {user.accountInfo.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                Joined {new Date(user.accountInfo.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Enhanced About App Section with Version Management */}
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
              <Info className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
              About Bytewise
            </h3>
          </div>

          <div className="space-y-4">
            {/* Enhanced App Version with Dynamic Data */}
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                      App Version
                    </p>
                    <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                      {versionLoading ? 'Loading...' : formatVersionDisplay(currentVersion)}
                    </p>
                    {!versionLoading && currentVersion.isPrerelease && (
                      <Badge className="mt-1 text-xs bg-orange-100 text-orange-700 border-orange-300">
                        Beta
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVersionHistory(!showVersionHistory)}
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                      aria-label="Show version history"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCheckForUpdates}
                      disabled={isCheckingUpdates}
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
                      aria-label="Check for updates"
                    >
                      <RefreshCw className={`w-4 h-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Version History Expandable Section */}
            {showVersionHistory && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}>
                    Version History
                  </h4>
                  <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                    {versionStats.totalInstalls} installs
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recentVersionHistory.map((entry, index) => (
                    <div key={`${entry.version}-${entry.installedAt}`} className="flex items-center justify-between p-2 bg-white/60 rounded border border-slate-200">
                      <div>
                        <p className="text-sm text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                          v{entry.version} ({entry.build})
                        </p>
                        <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                          {new Date(entry.installedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.isFirstInstall && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                            First Install
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Version Statistics */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center p-2 bg-white/60 rounded border border-slate-200">
                    <div className="text-lg font-bold text-brand-heading text-slate-700" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1rem", fontWeight: 700 }}>
                      {versionStats.daysSinceFirstInstall}
                    </div>
                    <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.65rem", fontWeight: 400 }}>
                      days since install
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/60 rounded border border-slate-200">
                    <div className="text-lg font-bold text-brand-heading text-slate-700" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1rem", fontWeight: 700 }}>
                      {versionStats.versionCount}
                    </div>
                    <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.65rem", fontWeight: 400 }}>
                      versions used
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Copyright Information */}
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Copyright className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  Copyright
                </p>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  © 2024 Bytewise. All rights reserved.
                </p>
              </div>
            </div>

            {/* App Owner/Developer */}
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  Developed by
                </p>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  Bytewise Nutrition Technologies
                </p>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* App Description */}
            <div className="p-3 bg-white/80 rounded-lg border border-slate-200">
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.6 }}>
                Bytewise is a comprehensive nutrition tracking application that helps you monitor your dietary intake at the ingredient level. 
                Track macronutrients, micronutrients, build custom recipes, and achieve your health goals with precision and ease.
              </p>
            </div>

            {/* Technical Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/60 rounded-lg border border-slate-200">
                <div className="text-lg font-bold text-brand-heading text-slate-700" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                  React
                </div>
                <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                  Frontend
                </div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg border border-slate-200">
                <div className="text-lg font-bold text-brand-heading text-slate-700" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>
                  USDA
                </div>
                <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                  Food Data
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                For support and feedback, please contact us through the app settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}