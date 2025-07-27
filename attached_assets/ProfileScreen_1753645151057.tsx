import React, { useState, useEffect } from 'react';
import { User, Settings, Target, Activity, Award, LogOut, Heart, Star, Search, Database, Filter, ChevronDown, Bell, BellOff, Sun, Moon, Ruler, Globe, Lock, RotateCcw, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useFoodDatabase, FoodItem } from '../FoodDatabaseManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Remove the hardcoded food database - now using FoodDatabaseManager

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  // Database integration
  const {
    userProfile,
    updateUserProfile,
    foods,
    searchFoods,
    getDatabaseStats,
    exportData,
    importData,
    clearAllData,
    syncData,
    isLoading,
    lastSyncDate
  } = useFoodDatabase();

  const [activeTab, setActiveTab] = useState<'profile' | 'database'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Initialize settings from userProfile or defaults
  const [accountSettings, setAccountSettings] = useState({
    notifications: userProfile?.preferences.notifications ?? true,
    darkMode: userProfile?.preferences.darkMode ?? false,
    units: userProfile?.preferences.units ?? 'metric',
    privacy: userProfile?.preferences.privacy ?? 'public'
  });
  
  const [nutritionGoals, setNutritionGoals] = useState({
    dailyCalories: userProfile?.nutritionGoals.dailyCalories ?? 2200,
    protein: userProfile?.nutritionGoals.protein ?? 150,
    carbs: userProfile?.nutritionGoals.carbs ?? 275,
    fat: userProfile?.nutritionGoals.fat ?? 73,
    fiber: userProfile?.nutritionGoals.fiber ?? 25,
    water: userProfile?.nutritionGoals.water ?? 8
  });
  
  const [activityLevel, setActivityLevel] = useState({
    level: userProfile?.activityLevel.level ?? 'moderately_active',
    exerciseDays: userProfile?.activityLevel.exerciseDays ?? 4,
    workoutIntensity: userProfile?.activityLevel.workoutIntensity ?? 'medium',
    stepGoal: userProfile?.activityLevel.stepGoal ?? 10000
  });

  // User data from profile or defaults
  const userData = {
    name: userProfile?.name ?? 'Alex',
    email: userProfile?.email ?? 'alex@example.com',
    avatar: userProfile?.avatar ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    joinDate: userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    totalRecipes: userProfile?.stats.totalRecipes ?? 0,
    streakDays: userProfile?.stats.streakDays ?? 0,
    caloriesTracked: userProfile?.stats.caloriesTracked ?? 0
  };

  const achievements = userProfile?.achievements ?? [
    { id: 'welcome', title: 'Welcome!', icon: '🌟', description: 'Started your nutrition journey', dateEarned: new Date().toISOString(), progress: 100 }
  ];

  const categories = ['All', ...Array.from(new Set(foods.map(food => food.category)))];

  const filteredDatabaseItems = searchFoods(searchQuery, { 
    category: selectedCategory === 'All' ? undefined : selectedCategory 
  });

  // Database stats for UI
  const dbStats = getDatabaseStats();

  // Settings handlers with database integration
  const handleAccountSettingChange = async (settingKey: string, newValue: any) => {
    const updatedSettings = { ...accountSettings, [settingKey]: newValue };
    setAccountSettings(updatedSettings);
    
    try {
      // Update in database if userProfile exists
      if (userProfile) {
        await updateUserProfile({
          preferences: {
            ...userProfile.preferences,
            [settingKey]: newValue
          }
        });
      }
      
      // Also save to localStorage for backwards compatibility
      localStorage.setItem('bytewise-account-settings', JSON.stringify(updatedSettings));
      
      const settingNames = {
        notifications: 'Notifications',
        darkMode: 'Theme Mode',
        units: 'Units',
        privacy: 'Privacy'
      };
      
      const displayValue = {
        notifications: newValue ? 'Enabled' : 'Disabled',
        darkMode: newValue ? 'Dark Mode' : 'Light Mode',
        units: newValue === 'metric' ? 'Metric' : 'Imperial',
        privacy: newValue === 'public' ? 'Public' : 'Private'
      };
      
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { 
          message: `✅ ${settingNames[settingKey as keyof typeof settingNames]} updated to ${displayValue[settingKey as keyof typeof displayValue]}`, 
          duration: 3000 
        }
      }));
    } catch (error) {
      console.error('Failed to save account settings:', error);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '❌ Failed to save settings', duration: 3000 }
      }));
    }
  };

  const handleNutritionGoalChange = async (goalKey: string, action: string) => {
    if (action === 'reset') {
      const recommendedGoals = {
        dailyCalories: 2200,
        protein: 150,
        carbs: 275,
        fat: 73,
        fiber: 25,
        water: 8
      };
      
      setNutritionGoals(recommendedGoals);
      
      try {
        // Update in database if userProfile exists
        if (userProfile) {
          await updateUserProfile({
            nutritionGoals: recommendedGoals
          });
        }
        
        localStorage.setItem('bytewise-nutrition-goals', JSON.stringify(recommendedGoals));
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: '✅ Goals reset to recommended values', duration: 3000 }
        }));
      } catch (error) {
        console.error('Failed to save nutrition goals:', error);
      }
      return;
    }

    const goalNames = {
      dailyCalories: 'Daily Calories',
      protein: 'Protein',
      carbs: 'Carbohydrates',
      fat: 'Fat',
      fiber: 'Fiber',
      water: 'Water'
    };
    
    const goalUnits = {
      dailyCalories: 'kcal',
      protein: 'g',
      carbs: 'g',
      fat: 'g',
      fiber: 'g',
      water: 'glasses'
    };
    
    const currentValue = nutritionGoals[goalKey as keyof typeof nutritionGoals];
    const goalName = goalNames[goalKey as keyof typeof goalNames];
    const unit = goalUnits[goalKey as keyof typeof goalUnits];
    
    const newValue = prompt(`Enter new ${goalName} target (${unit}):\n\nCurrent: ${currentValue}${unit}`);
    
    if (newValue && !isNaN(Number(newValue))) {
      const numValue = Math.max(0, Number(newValue));
      const updatedGoals = {
        ...nutritionGoals,
        [goalKey]: numValue
      };
      
      setNutritionGoals(updatedGoals);
      
      try {
        // Update in database if userProfile exists
        if (userProfile) {
          await updateUserProfile({
            nutritionGoals: updatedGoals
          });
        }
        
        localStorage.setItem('bytewise-nutrition-goals', JSON.stringify(updatedGoals));
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: `✅ ${goalName} updated to ${numValue}${unit}`, duration: 3000 }
        }));
      } catch (error) {
        console.error('Failed to save nutrition goals:', error);
      }
    }
  };

  const handleActivityLevelChange = async (setting: string, value?: any) => {
    let updatedActivity = { ...activityLevel };
    
    switch (setting) {
      case 'level':
        updatedActivity.level = value;
        break;
      case 'exerciseDays':
        const days = prompt(`Exercise Days per Week:\n\nCurrent: ${activityLevel.exerciseDays} days\n\nEnter new value (0-7):`);
        if (days && !isNaN(Number(days))) {
          updatedActivity.exerciseDays = Math.max(0, Math.min(7, Number(days)));
        } else return;
        break;
      case 'workoutIntensity':
        updatedActivity.workoutIntensity = value;
        break;
      case 'stepGoal':
        const steps = prompt(`Daily Step Goal:\n\nCurrent: ${activityLevel.stepGoal.toLocaleString()} steps\n\nEnter new goal (suggested: 7500-15000):`);
        if (steps && !isNaN(Number(steps))) {
          updatedActivity.stepGoal = Math.max(1000, Number(steps));
        } else return;
        break;
      case 'preset':
        const presets = {
          beginner: { level: 'lightly_active', exerciseDays: 3, workoutIntensity: 'low', stepGoal: 7500 },
          intermediate: { level: 'moderately_active', exerciseDays: 4, workoutIntensity: 'medium', stepGoal: 10000 },
          advanced: { level: 'very_active', exerciseDays: 5, workoutIntensity: 'high', stepGoal: 12500 }
        };
        updatedActivity = presets[value as keyof typeof presets];
        break;
    }
    
    setActivityLevel(updatedActivity);
    
    try {
      // Update in database if userProfile exists
      if (userProfile) {
        await updateUserProfile({
          activityLevel: updatedActivity
        });
      }
      
      localStorage.setItem('bytewise-activity-level', JSON.stringify(updatedActivity));
      
      const messages = {
        level: '✅ Activity level updated',
        exerciseDays: `✅ Exercise days updated to ${updatedActivity.exerciseDays}`,
        workoutIntensity: '✅ Workout intensity updated',
        stepGoal: `✅ Step goal updated to ${updatedActivity.stepGoal.toLocaleString()}`,
        preset: `✅ ${value} preset applied successfully`
      };
      
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: messages[setting as keyof typeof messages], duration: 3000 }
      }));
    } catch (error) {
      console.error('Failed to save activity level:', error);
    }
  };

  // Database management functions
  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bytewise-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '✅ Data exported successfully', duration: 3000 }
      }));
    } catch (error) {
      console.error('Failed to export data:', error);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '❌ Failed to export data', duration: 3000 }
      }));
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const success = await importData(text);
          if (success) {
            window.dispatchEvent(new CustomEvent('bytewise-toast', {
              detail: { message: '✅ Data imported successfully', duration: 3000 }
            }));
            // Refresh page to reload imported data
            window.location.reload();
          } else {
            throw new Error('Import failed');
          }
        } catch (error) {
          console.error('Failed to import data:', error);
          window.dispatchEvent(new CustomEvent('bytewise-toast', {
            detail: { message: '❌ Failed to import data', duration: 3000 }
          }));
        }
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    const confirmed = confirm('⚠️ This will permanently delete all your data including recipes, meal logs, and settings. This action cannot be undone.\n\nAre you sure you want to continue?');
    if (confirmed) {
      try {
        const success = await clearAllData();
        if (success) {
          window.dispatchEvent(new CustomEvent('bytewise-toast', {
            detail: { message: '✅ All data cleared successfully', duration: 3000 }
          }));
          // Logout after clearing data
          setTimeout(() => {
            onLogout();
          }, 1000);
        } else {
          throw new Error('Clear failed');
        }
      } catch (error) {
        console.error('Failed to clear data:', error);
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: '❌ Failed to clear data', duration: 3000 }
        }));
      }
    }
  };

  // Sync settings when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setAccountSettings({
        notifications: userProfile.preferences.notifications,
        darkMode: userProfile.preferences.darkMode,
        units: userProfile.preferences.units,
        privacy: userProfile.preferences.privacy
      });
      
      setNutritionGoals(userProfile.nutritionGoals);
      setActivityLevel(userProfile.activityLevel);
    }
  }, [userProfile]);

  // Load settings from localStorage for backwards compatibility
  useEffect(() => {
    if (!userProfile) {
      try {
        const savedAccountSettings = localStorage.getItem('bytewise-account-settings');
        if (savedAccountSettings) {
          setAccountSettings(JSON.parse(savedAccountSettings));
        }

        const savedNutritionGoals = localStorage.getItem('bytewise-nutrition-goals');
        if (savedNutritionGoals) {
          setNutritionGoals(JSON.parse(savedNutritionGoals));
        }

        const savedActivityLevel = localStorage.getItem('bytewise-activity-level');
        if (savedActivityLevel) {
          setActivityLevel(JSON.parse(savedActivityLevel));
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    }
  }, [userProfile]);

  return (
    <div className="pb-24 max-w-md mx-auto animate-fade-in bg-background min-h-screen font-family-quicksand">
      
      {/* Profile Hero Header */}
      <div className="relative mb-8 -mx-4 overflow-hidden">
        <div className="relative h-64">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Profile background"
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
          
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-white/30 shadow-2xl">
              <ImageWithFallback
                src={userData.avatar}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-3xl font-bold text-center mb-2">{userData.name}</h1>
            <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-white/90 text-center mb-6">{userData.email}</p>
            
            {/* Quick Stats */}
            <div className="flex items-center brand-spacing-xl bg-black/30 backdrop-blur-md rounded-2xl brand-padding-xl">
              <div className="text-center">
                <div style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-xl font-bold text-white">{userData.totalRecipes}</div>
                <div style={{ fontFamily: "'Work Sans', sans-serif" }} className="text-xs text-white/70">recipes</div>
              </div>
              <div className="text-center">
                <div style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-xl font-bold text-primary">{userData.streakDays}</div>
                <div style={{ fontFamily: "'Work Sans', sans-serif" }} className="text-xs text-white/70">day streak</div>
              </div>
              <div className="text-center">
                <div style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-xl font-bold text-chart-2">{userData.caloriesTracked.toLocaleString()}</div>
                <div style={{ fontFamily: "'Work Sans', sans-serif" }} className="text-xs text-white/70">calories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="brand-padding-lg compact-layout">
        
        {/* Tab Navigation */}
        <div className="flex items-center brand-spacing-sm bg-muted/50 rounded-xl brand-padding-xs">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            className="flex-1 h-10 btn-animate"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            <User size={16} className="mr-2" />
            Profile
          </Button>
          <Button
            variant={activeTab === 'database' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('database')}
            className="flex-1 h-10 btn-animate"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            <Database size={16} className="mr-2" />
            Food Database
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {/* Achievements */}
            <div className="tight-spacing">
              <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-2xl font-bold text-foreground brand-margin-md">Achievements</h2>
              <div className="grid grid-cols-2 compact-layout">
                {achievements.map((achievement, index) => (
                  <div key={achievement.id || index} className="brand-card-compact card-gradient bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 animate-scale-in">
                    <div className="text-center">
                      <div className="text-3xl brand-margin-sm">{achievement.icon}</div>
                      <h3 style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold text-foreground brand-margin-xs">{achievement.title}</h3>
                      <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-xs text-muted-foreground leading-tight">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Settings */}
            <div className="tight-spacing">
              <h2 style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-2xl font-bold text-foreground brand-margin-md">Settings</h2>
              <div className="compact-layout">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="brand-card btn-animate flex items-center justify-between w-full h-auto hover:bg-primary/5 transition-all duration-200"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      <div className="flex items-center brand-spacing-md">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Settings size={18} className="text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold text-foreground">Account Settings</h3>
                          <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-xs text-muted-foreground">
                            {accountSettings.notifications ? '🔔' : '🔕'} • 
                            {accountSettings.darkMode ? '🌙' : '☀️'} • 
                            {accountSettings.units === 'metric' ? '📏' : '📐'} • 
                            {accountSettings.privacy === 'public' ? '🌐' : '🔒'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 card-gradient border-primary/20">
                    <DropdownMenuLabel style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold">Account Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => handleAccountSettingChange('notifications', !accountSettings.notifications)}
                      className="hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          {accountSettings.notifications ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Notifications</span>
                        </div>
                        <Badge variant={accountSettings.notifications ? "default" : "secondary"} className="font-medium">
                          {accountSettings.notifications ? 'On' : 'Off'}
                        </Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleAccountSettingChange('darkMode', !accountSettings.darkMode)}
                      className="hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          {accountSettings.darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-chart-4" />}
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Theme</span>
                        </div>
                        <Badge variant={accountSettings.darkMode ? "default" : "secondary"} className="font-medium">
                          {accountSettings.darkMode ? 'Dark' : 'Light'}
                        </Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleAccountSettingChange('units', accountSettings.units === 'metric' ? 'imperial' : 'metric')}
                      className="hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <Ruler className="w-4 h-4 text-chart-3" />
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Units</span>
                        </div>
                        <Badge variant="outline" className="border-primary/30 font-medium">
                          {accountSettings.units === 'metric' ? 'Metric' : 'Imperial'}
                        </Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleAccountSettingChange('privacy', accountSettings.privacy === 'public' ? 'private' : 'public')}
                      className="hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          {accountSettings.privacy === 'public' ? <Globe className="w-4 h-4 text-chart-2" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Privacy</span>
                        </div>
                        <Badge variant={accountSettings.privacy === 'public' ? "default" : "secondary"} className="font-medium">
                          {accountSettings.privacy === 'public' ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="brand-card btn-animate flex items-center justify-between w-full h-auto hover:bg-chart-2/5 transition-all duration-200"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      <div className="flex items-center brand-spacing-md">
                        <div className="w-10 h-10 bg-chart-2/20 rounded-full flex items-center justify-center">
                          <Target size={18} className="text-chart-2" />
                        </div>
                        <div className="text-left">
                          <h3 style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold text-foreground">Nutrition Goals</h3>
                          <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-xs text-muted-foreground">
                            🎯 {nutritionGoals.dailyCalories}kcal • 
                            💪 {nutritionGoals.protein}g • 
                            🌾 {nutritionGoals.carbs}g • 
                            🥑 {nutritionGoals.fat}g
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 card-gradient border-chart-2/20">
                    <DropdownMenuLabel style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold">Nutrition Goals</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('dailyCalories', 'edit')}
                      className="hover:bg-chart-2/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <span className="text-base">🎯</span>
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Daily Calories</span>
                        </div>
                        <Badge variant="outline" className="border-chart-2/30 font-medium">{nutritionGoals.dailyCalories} kcal</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('protein', 'edit')}
                      className="hover:bg-chart-2/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <span className="text-base">💪</span>
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Protein</span>
                        </div>
                        <Badge variant="outline" className="border-chart-2/30 font-medium">{nutritionGoals.protein}g</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('carbs', 'edit')}
                      className="hover:bg-chart-2/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <span className="text-base">🌾</span>
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Carbohydrates</span>
                        </div>
                        <Badge variant="outline" className="border-chart-2/30 font-medium">{nutritionGoals.carbs}g</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('fat', 'edit')}
                      className="hover:bg-chart-2/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <span className="text-base">🥑</span>
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Fat</span>
                        </div>
                        <Badge variant="outline" className="border-chart-2/30 font-medium">{nutritionGoals.fat}g</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('fiber', 'edit')}
                      className="hover:bg-chart-2/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <span className="text-base">🌿</span>
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Fiber</span>
                        </div>
                        <Badge variant="outline" className="border-chart-2/30 font-medium">{nutritionGoals.fiber}g</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('water', 'edit')}
                      className="hover:bg-chart-2/10 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center brand-spacing-sm">
                          <span className="text-base">💧</span>
                          <span style={{ fontFamily: "'Work Sans', sans-serif" }}>Water</span>
                        </div>
                        <Badge variant="outline" className="border-chart-2/30 font-medium">{nutritionGoals.water} glasses</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => handleNutritionGoalChange('reset', 'reset')}
                      className="hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center brand-spacing-sm text-primary">
                        <RotateCcw className="w-4 h-4" />
                        <span style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-medium">Reset to Recommended</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-border/50 hover:bg-muted/30 transition-colors w-full h-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-chart-3/20 rounded-full flex items-center justify-center">
                          <Activity size={18} className="text-chart-3" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-foreground">Activity Level</h3>
                          <p className="text-xs text-muted-foreground">
                            🏃‍♂️ {activityLevel.exerciseDays} days/week • 
                            💪 {activityLevel.workoutIntensity} • 
                            👟 {activityLevel.stepGoal.toLocaleString()} steps
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Activity Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => handleActivityLevelChange('level', 'sedentary')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🪑</span>
                          <span>Sedentary</span>
                        </div>
                        {activityLevel.level === 'sedentary' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('level', 'lightly_active')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🚶</span>
                          <span>Lightly Active</span>
                        </div>
                        {activityLevel.level === 'lightly_active' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('level', 'moderately_active')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🏃</span>
                          <span>Moderately Active</span>
                        </div>
                        {activityLevel.level === 'moderately_active' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('level', 'very_active')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🏋️</span>
                          <span>Very Active</span>
                        </div>
                        {activityLevel.level === 'very_active' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('level', 'extremely_active')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">💪</span>
                          <span>Extremely Active</span>
                        </div>
                        {activityLevel.level === 'extremely_active' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('exerciseDays')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">📅</span>
                          <span>Exercise Days/Week</span>
                        </div>
                        <Badge variant="outline">{activityLevel.exerciseDays} days</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('workoutIntensity', 'low')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🧘</span>
                          <span>Low Intensity</span>
                        </div>
                        {activityLevel.workoutIntensity === 'low' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('workoutIntensity', 'medium')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🚴</span>
                          <span>Medium Intensity</span>
                        </div>
                        {activityLevel.workoutIntensity === 'medium' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('workoutIntensity', 'high')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🏃‍♀️</span>
                          <span>High Intensity</span>
                        </div>
                        {activityLevel.workoutIntensity === 'high' && <Badge variant="default">Current</Badge>}
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('stepGoal')}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">👟</span>
                          <span>Daily Step Goal</span>
                        </div>
                        <Badge variant="outline">{activityLevel.stepGoal.toLocaleString()}</Badge>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('preset', 'beginner')}>
                      <div className="flex items-center space-x-2 text-chart-1">
                        <span className="text-base">🌱</span>
                        <span>Beginner Preset</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('preset', 'intermediate')}>
                      <div className="flex items-center space-x-2 text-chart-2">
                        <span className="text-base">🌿</span>
                        <span>Intermediate Preset</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleActivityLevelChange('preset', 'advanced')}>
                      <div className="flex items-center space-x-2 text-chart-3">
                        <span className="text-base">🌳</span>
                        <span>Advanced Preset</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Account</h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white border border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground">Member Since</h3>
                    <span className="text-sm text-muted-foreground">{userData.joinDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Thank you for being a valued member of the Bytewise community!
                  </p>
                </div>

                <Button 
                  onClick={onLogout} 
                  variant="destructive"
                  className="w-full h-12 rounded-xl"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Database Header */}
            <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-2xl p-6 border border-secondary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Database className="text-secondary-foreground" size={24} />
                  <h2 className="text-2xl font-bold text-foreground">Food Database</h2>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Browse our comprehensive database of verified food items with detailed nutrition information.
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="Search food database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="h-10 text-sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Database Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {filteredDatabaseItems.length} item{filteredDatabaseItems.length !== 1 ? 's' : ''} found
                </h3>
                <Badge variant="secondary">
                  {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                </Badge>
              </div>

              <div className="space-y-3 max-h-[29rem] overflow-y-auto hover-scroll-area">
                {filteredDatabaseItems.map((food) => (
                  <div key={food.id} className="brand-card hover:shadow-md transition-all duration-200 hover:bg-muted/30">
                    <div className="flex items-center brand-spacing-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 food-image">
                        <ImageWithFallback
                          src={food.image}
                          alt={food.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between brand-margin-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center brand-spacing-sm">
                              <h4 style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold text-foreground truncate">{food.name}</h4>
                              {food.verified && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 flex-shrink-0">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-sm text-muted-foreground truncate brand-margin-xs">
                              {food.brand} • {food.category}
                            </p>
                          </div>
                          
                          <div className="flex items-center brand-spacing-xs flex-shrink-0 ml-2">
                            <Star className="text-yellow-500 fill-current" size={14} />
                            <span style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-sm text-muted-foreground">{food.userRating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center brand-spacing-lg text-sm brand-margin-sm">
                          <div className="flex items-center brand-spacing-xs">
                            <span className="font-semibold text-chart-1">{food.calories}</span>
                            <span style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-muted-foreground">cal</span>
                          </div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <div className="flex items-center brand-spacing-xs">
                            <span className="font-semibold text-chart-2">{food.protein}g</span>
                            <span style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-muted-foreground">protein</span>
                          </div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <div className="flex items-center brand-spacing-xs">
                            <span className="font-semibold text-chart-3">{food.carbs}g</span>
                            <span style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-muted-foreground">carbs</span>
                          </div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <div className="flex items-center brand-spacing-xs">
                            <span className="font-semibold text-chart-4">{food.fat}g</span>
                            <span style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-muted-foreground">fat</span>
                          </div>
                        </div>
                        
                        <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-xs text-muted-foreground line-clamp-2 brand-margin-xs">
                          {food.description}
                        </p>
                        
                        <div className="flex items-center justify-between brand-margin-sm">
                          <Badge variant="outline" className="text-xs border-primary/30">
                            {food.servingSize}
                          </Badge>
                          <span style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-xs text-muted-foreground">
                            {food.source === 'external' ? 'Database' : 'Custom'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredDatabaseItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Database size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No food items found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}