/**
 * Bytewise User Management System
 * 
 * Centralized user data management with enhanced signup integration
 * Features:
 * - Complete user profile creation from signup form data
 * - Account settings and preferences
 * - Nutrition goals and activity tracking
 * - Achievement and progress systems (starts empty)
 * - Privacy and notification controls
 * - Data export and account management
 * - Comprehensive signup data handling
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// User Management Types
export interface UserProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    height?: number; // ft for imperial
    weight?: number; // lbs for imperial
    timezone: string;
  };
  accountInfo: {
    joinDate: string;
    lastLoginDate: string;
    accountType: 'free' | 'premium' | 'professional';
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      mealReminders: boolean;
      goalReminders: boolean;
      weeklyReports: boolean;
      achievementAlerts: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      dataSharing: boolean;
      analyticsOptOut: boolean;
      marketingOptOut: boolean;
    };
    display: {
      theme: 'light' | 'dark' | 'system';
      units: 'metric' | 'imperial';
      language: string;
      timeFormat: '12h' | '24h';
      firstDayOfWeek: 'sunday' | 'monday';
    };
    features: {
      advancedNutrition: boolean;
      recipeRecommendations: boolean;
      socialFeatures: boolean;
      dataExport: boolean;
    };
  };
  nutritionGoals: {
    dailyCalories: number;
    macros: {
      protein: number; // grams
      carbohydrates: number; // grams
      fat: number; // grams
      fiber: number; // grams
    };
    micronutrients: {
      sodium: number; // mg
      sugar: number; // grams
      cholesterol: number; // mg
      calcium: number; // mg
      iron: number; // mg
      vitaminC: number; // mg
      vitaminD: number; // IU
    };
    hydration: {
      dailyWater: number; // ml
      caffeineLimit: number; // mg
    };
    restrictions: {
      allergies: string[];
      dietaryRestrictions: string[];
      dislikes: string[];
    };
  };
  activityLevel: {
    level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    exerciseDays: number;
    workoutIntensity: 'low' | 'medium' | 'high';
    stepGoal: number;
    activeMinutesGoal: number;
    occupation: 'desk_job' | 'standing' | 'physical' | 'other';
  };
  healthMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
      date: string;
    };
    restingHeartRate?: number;
    healthConditions: string[];
    medications: string[];
  };
  achievements: Achievement[];
  stats: {
    totalRecipes: number;
    totalMeals: number;
    streakDays: number;
    caloriesTracked: number;
    weightsRecorded: number;
    goalsCompleted: number;
    weeklyGoalsMet: number;
    monthlyGoalsMet: number;
    favoriteIngredients: string[];
    totalCookingTime: number; // minutes
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'cooking' | 'consistency' | 'health' | 'social';
  dateEarned: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'meal_logged' | 'recipe_created' | 'goal_completed' | 'weight_recorded' | 'achievement_earned';
  data: any;
  timestamp: string;
}

export interface UserSettings {
  notifications: UserProfile['preferences']['notifications'];
  privacy: UserProfile['preferences']['privacy'];
  display: UserProfile['preferences']['display'];
  features: UserProfile['preferences']['features'];
}

export interface UserContextType {
  // User State
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Profile Management
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updatePersonalInfo: (info: Partial<UserProfile['personalInfo']>) => Promise<boolean>;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => Promise<boolean>;
  updateNutritionGoals: (goals: Partial<UserProfile['nutritionGoals']>) => Promise<boolean>;
  updateActivityLevel: (activity: Partial<UserProfile['activityLevel']>) => Promise<boolean>;
  updateHealthMetrics: (metrics: Partial<UserProfile['healthMetrics']>) => Promise<boolean>;
  
  // Account Management
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  changeEmail: (newEmail: string, password: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  enableTwoFactor: () => Promise<{ qrCode: string; secret: string }>;
  disableTwoFactor: (code: string) => Promise<boolean>;
  
  // Data Management
  exportUserData: () => Promise<Blob>;
  deleteAccount: (password: string, feedback?: string) => Promise<boolean>;
  downloadDataArchive: () => Promise<boolean>;
  
  // Privacy & Security
  updatePrivacySettings: (settings: Partial<UserProfile['preferences']['privacy']>) => Promise<boolean>;
  getDataUsageReport: () => Promise<any>;
  revokeAllSessions: () => Promise<boolean>;
  
  // Achievements & Stats
  addAchievement: (achievement: Omit<Achievement, 'id' | 'dateEarned'>) => Promise<boolean>;
  updateStats: (stats: Partial<UserProfile['stats']>) => Promise<boolean>;
  getActivityHistory: (limit?: number) => Promise<UserActivity[]>;
  
  // Utility Functions
  resetToDefaults: () => Promise<boolean>;
  validateData: () => Promise<{ isValid: boolean; errors: string[] }>;
  syncWithDatabase: () => Promise<boolean>;
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Convert activity level string to enum
const mapActivityLevel = (level: string): UserProfile['activityLevel']['level'] => {
  switch (level) {
    case 'sedentary': return 'sedentary';
    case 'lightly_active': return 'lightly_active';
    case 'moderately_active': return 'moderately_active';
    case 'very_active': return 'very_active';
    case 'extremely_active': return 'extremely_active';
    default: return 'moderately_active';
  }
};

// Calculate BMI from height (ft) and weight (lbs)
const calculateBMI = (heightFt?: number, weightLbs?: number): number | undefined => {
  if (!heightFt || !weightLbs) return undefined;
  
  // Convert feet to inches, then to meters
  const heightInches = heightFt * 12;
  const heightM = heightInches * 0.0254;
  
  // Convert lbs to kg
  const weightKg = weightLbs * 0.453592;
  
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
};

// Enhanced profile creation with comprehensive signup data integration
const createProfileFromSignupData = (personalInfo: Partial<UserProfile['personalInfo']>, signupData?: any): UserProfile => {
  console.log('🔨 Creating profile from signup data:', { personalInfo, signupData });
  
  const profile: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    personalInfo: {
      firstName: personalInfo.firstName || signupData?.firstName || 'User',
      lastName: personalInfo.lastName || signupData?.lastName || '',
      email: personalInfo.email || '',
      avatar: personalInfo.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      // Enhanced data from signup form
      gender: signupData?.gender as UserProfile['personalInfo']['gender'] || undefined,
      height: signupData?.height ? parseFloat(signupData.height) : undefined, // ft
      weight: signupData?.weight ? parseFloat(signupData.weight) : undefined, // lbs
      ...personalInfo
    },
    accountInfo: {
      joinDate: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      accountType: 'free',
      emailVerified: false, // Email verification required for all new accounts
      twoFactorEnabled: false
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        mealReminders: true,
        goalReminders: true,
        weeklyReports: true,
        achievementAlerts: true
      },
      privacy: {
        profileVisibility: 'private',
        dataSharing: false,
        analyticsOptOut: false,
        marketingOptOut: false
      },
      display: {
        theme: 'light',
        units: 'imperial', // Use imperial since signup form uses lbs/ft
        language: 'en',
        timeFormat: '12h',
        firstDayOfWeek: 'sunday'
      },
      features: {
        advancedNutrition: true,
        recipeRecommendations: true,
        socialFeatures: false,
        dataExport: true
      }
    },
    nutritionGoals: {
      // Use signup form nutrition goals or defaults
      dailyCalories: signupData?.nutritionGoals?.dailyCalories || 2200,
      macros: {
        protein: signupData?.nutritionGoals?.protein || 150,
        carbohydrates: signupData?.nutritionGoals?.carbs || 275,
        fat: signupData?.nutritionGoals?.fat || 73,
        fiber: 25
      },
      micronutrients: {
        sodium: 2300,
        sugar: 50,
        cholesterol: 300,
        calcium: 1000,
        iron: 18,
        vitaminC: 65,
        vitaminD: 600
      },
      hydration: {
        dailyWater: 2000,
        caffeineLimit: 400
      },
      restrictions: {
        allergies: [], // EMPTY - no test data
        dietaryRestrictions: [], // EMPTY - no test data
        dislikes: [] // EMPTY - no test data
      }
    },
    activityLevel: {
      level: signupData?.activityLevel ? mapActivityLevel(signupData.activityLevel) : 'moderately_active',
      exerciseDays: 4,
      workoutIntensity: 'medium',
      stepGoal: 10000,
      activeMinutesGoal: 150,
      occupation: 'desk_job'
    },
    healthMetrics: {
      // Calculate BMI if height and weight are available
      bmi: calculateBMI(signupData?.height, signupData?.weight),
      healthConditions: [], // EMPTY - no test data
      medications: [] // EMPTY - no test data
    },
    achievements: [], // COMPLETELY EMPTY - no test achievements
    stats: {
      // ALL ZEROS - no fake progress
      totalRecipes: 0,
      totalMeals: 0,
      streakDays: 0,
      caloriesTracked: 0,
      weightsRecorded: 0,
      goalsCompleted: 0,
      weeklyGoalsMet: 0,
      monthlyGoalsMet: 0,
      favoriteIngredients: [], // EMPTY - no test data
      totalCookingTime: 0 // ZERO - no fake data
    }
  };

  console.log('✅ Profile created with comprehensive data:', profile);
  return profile;
};

// Clean Default User Profile Template - NO TEST DATA
const createCleanProfile = (personalInfo: Partial<UserProfile['personalInfo']>): UserProfile => {
  return createProfileFromSignupData(personalInfo);
};

// User Manager Provider Component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize user from localStorage
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (typeof window !== 'undefined') {
          const authState = localStorage.getItem('bytewise-auth');
          if (authState === 'true') {
            const userData = localStorage.getItem('bytewise-user');
            if (userData) {
              const basicUserData = JSON.parse(userData);
              
              // Check if we have a full profile in localStorage
              const profileData = localStorage.getItem('bytewise-user-profile');
              if (profileData) {
                const fullProfile = JSON.parse(profileData);
                setUser(fullProfile);
                console.log('✅ User profile loaded from storage');
              } else {
                // Create profile from basic user data (including signup data if available)
                const profile = createProfileFromSignupData({
                  firstName: basicUserData.signupData?.firstName || basicUserData.name?.split(' ')[0] || 'User',
                  lastName: basicUserData.signupData?.lastName || basicUserData.name?.split(' ').slice(1).join(' ') || '',
                  email: basicUserData.email || '',
                }, basicUserData.signupData);
                
                // Save the complete profile
                localStorage.setItem('bytewise-user-profile', JSON.stringify(profile));
                setUser(profile);
                console.log('✅ Complete user profile created from signup data');
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize user:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      try {
        localStorage.setItem('bytewise-user-profile', JSON.stringify(user));
        console.log('✅ User profile saved to storage');
      } catch (error) {
        console.error('❌ Failed to save user profile:', error);
      }
    }
  }, [user]);

  // Listen for user login/signup events from App.tsx
  useEffect(() => {
    const handleUserLogin = (e: any) => {
      const { userData } = e.detail;
      
      if (!user) {
        // Create profile from existing data (might include signup data)
        const profile = createProfileFromSignupData({
          firstName: userData.signupData?.firstName || userData.name?.split(' ')[0] || 'User',
          lastName: userData.signupData?.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
        }, userData.signupData);
        
        setUser(profile);
        console.log('✅ Complete user profile created on login');
      }
    };

    const handleUserSignup = (e: any) => {
      const { userData } = e.detail;
      
      // Create comprehensive profile from complete signup data
      const profile = createProfileFromSignupData({
        firstName: userData.signupData?.firstName || userData.name?.split(' ')[0] || 'User',
        lastName: userData.signupData?.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
      }, userData.signupData);
      
      setUser(profile);
      console.log('✅ Comprehensive user profile created from complete signup data');
    };

    const handleSignupEmailEntered = (e: any) => {
      const { email } = e.detail;
      console.log('📧 Email entered during signup:', email);
      
      // Email verification will be required - no auto-verification
      if (email && /\S+@\S+\.\S+/.test(email)) {
        console.log('📧 Email verification will be required for:', email);
      }
    };

    const handleClearUserData = () => {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bytewise-user-profile');
      }
      console.log('✅ User profile cleared');
    };

    window.addEventListener('bytewise-user-login', handleUserLogin);
    window.addEventListener('bytewise-user-signup', handleUserSignup);
    window.addEventListener('bytewise-signup-email-entered', handleSignupEmailEntered);
    window.addEventListener('bytewise-clear-user-data', handleClearUserData);

    return () => {
      window.removeEventListener('bytewise-user-login', handleUserLogin);
      window.removeEventListener('bytewise-user-signup', handleUserSignup);
      window.removeEventListener('bytewise-signup-email-entered', handleSignupEmailEntered);
      window.removeEventListener('bytewise-clear-user-data', handleClearUserData);
    };
  }, [user]);

  // Profile Management Functions
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      console.log('✅ User profile updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      setError('Failed to update profile');
      return false;
    }
  }, [user]);

  const updatePersonalInfo = useCallback(async (info: Partial<UserProfile['personalInfo']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        personalInfo: { ...user.personalInfo, ...info }
      };
      
      // Recalculate BMI if height or weight changed
      if (info.height !== undefined || info.weight !== undefined) {
        const newHeight = info.height ?? user.personalInfo.height;
        const newWeight = info.weight ?? user.personalInfo.weight;
        const newBMI = calculateBMI(newHeight, newWeight);
        
        if (newBMI !== undefined) {
          updatedUser.healthMetrics = {
            ...updatedUser.healthMetrics,
            bmi: newBMI
          };
        }
      }
      
      setUser(updatedUser);
      console.log('✅ Personal info updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update personal info:', error);
      setError('Failed to update personal information');
      return false;
    }
  }, [user]);

  const updatePreferences = useCallback(async (prefs: Partial<UserProfile['preferences']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...prefs }
      };
      setUser(updatedUser);
      console.log('✅ Preferences updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      setError('Failed to update preferences');
      return false;
    }
  }, [user]);

  const updateNutritionGoals = useCallback(async (goals: Partial<UserProfile['nutritionGoals']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        nutritionGoals: { ...user.nutritionGoals, ...goals }
      };
      setUser(updatedUser);
      console.log('✅ Nutrition goals updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update nutrition goals:', error);
      setError('Failed to update nutrition goals');
      return false;
    }
  }, [user]);

  const updateActivityLevel = useCallback(async (activity: Partial<UserProfile['activityLevel']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        activityLevel: { ...user.activityLevel, ...activity }
      };
      setUser(updatedUser);
      console.log('✅ Activity level updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update activity level:', error);
      setError('Failed to update activity level');
      return false;
    }
  }, [user]);

  const updateHealthMetrics = useCallback(async (metrics: Partial<UserProfile['healthMetrics']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        healthMetrics: { ...user.healthMetrics, ...metrics }
      };
      setUser(updatedUser);
      console.log('✅ Health metrics updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update health metrics:', error);
      setError('Failed to update health metrics');
      return false;
    }
  }, [user]);

  // Account Management Functions
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // In a real app, this would make an API call
      console.log('🔐 Password change requested');
      
      if (!user) return false;

      // Simulate password validation
      if (currentPassword.length < 8 || newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }

      const updatedUser = {
        ...user,
        accountInfo: {
          ...user.accountInfo,
          lastPasswordChange: new Date().toISOString()
        }
      };
      setUser(updatedUser);
      
      console.log('✅ Password changed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      setError('Failed to change password');
      return false;
    }
  }, [user]);

  const changeEmail = useCallback(async (newEmail: string, password: string): Promise<boolean> => {
    try {
      if (!user) return false;

      // Validate password before changing email
      if (!password || password.length < 8) {
        setError('Password is required to change email address');
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        setError('Please enter a valid email address');
        return false;
      }

      const updatedUser = {
        ...user,
        personalInfo: { ...user.personalInfo, email: newEmail },
        accountInfo: { ...user.accountInfo, emailVerified: false }
      };
      setUser(updatedUser);
      
      console.log('✅ Email changed successfully - verification required');
      return true;
    } catch (error) {
      console.error('❌ Failed to change email:', error);
      setError('Failed to change email');
      return false;
    }
  }, [user]);

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    try {
      if (!user) return false;

      // Validate verification token (in real app, this would be validated server-side)
      if (!token || token.length < 6) {
        setError('Invalid verification token');
        return false;
      }
      
      const updatedUser = {
        ...user,
        accountInfo: { 
          ...user.accountInfo, 
          emailVerified: true,
          lastPasswordChange: user.accountInfo.lastPasswordChange || new Date().toISOString() 
        }
      };
      setUser(updatedUser);
      
      console.log('✅ Email verified successfully with token');
      return true;
    } catch (error) {
      console.error('❌ Failed to verify email:', error);
      setError('Failed to verify email');
      return false;
    }
  }, [user]);

  const enableTwoFactor = useCallback(async (): Promise<{ qrCode: string; secret: string }> => {
    try {
      // In a real app, this would generate actual 2FA codes
      const secret = 'BYTEWISE2FA' + Math.random().toString(36).substr(2, 16).toUpperCase();
      const qrCode = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="monospace" font-size="12">2FA QR Code</text></svg>`;
      
      console.log('🔐 Two-factor authentication setup initiated');
      return { qrCode, secret };
    } catch (error) {
      console.error('❌ Failed to enable 2FA:', error);
      setError('Failed to enable two-factor authentication');
      throw error;
    }
  }, []);

  const disableTwoFactor = useCallback(async (code: string): Promise<boolean> => {
    try {
      if (!user) return false;

      const updatedUser = {
        ...user,
        accountInfo: { ...user.accountInfo, twoFactorEnabled: false }
      };
      setUser(updatedUser);
      
      console.log('✅ Two-factor authentication disabled');
      return true;
    } catch (error) {
      console.error('❌ Failed to disable 2FA:', error);
      setError('Failed to disable two-factor authentication');
      return false;
    }
  }, [user]);

  // Data Management Functions
  const exportUserData = useCallback(async (): Promise<Blob> => {
    try {
      if (!user) throw new Error('No user data to export');

      const exportData = {
        exportDate: new Date().toISOString(),
        userData: user,
        version: '1.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      console.log('✅ User data exported');
      return blob;
    } catch (error) {
      console.error('❌ Failed to export user data:', error);
      setError('Failed to export user data');
      throw error;
    }
  }, [user]);

  const deleteAccount = useCallback(async (password: string, feedback?: string): Promise<boolean> => {
    try {
      console.log('🗑️ Account deletion requested');
      
      // In a real app, this would validate password and delete from server
      if (password.length < 8) {
        setError('Please enter your password to confirm deletion');
        return false;
      }

      // Clear all user data
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bytewise-user-profile');
        localStorage.removeItem('bytewise-user');
        localStorage.removeItem('bytewise-auth');
      }

      console.log('✅ Account deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete account:', error);
      setError('Failed to delete account');
      return false;
    }
  }, []);

  const downloadDataArchive = useCallback(async (): Promise<boolean> => {
    try {
      const blob = await exportUserData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bytewise-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Data archive downloaded');
      return true;
    } catch (error) {
      console.error('❌ Failed to download data archive:', error);
      setError('Failed to download data archive');
      return false;
    }
  }, [exportUserData]);

  // Privacy & Security Functions
  const updatePrivacySettings = useCallback(async (settings: Partial<UserProfile['preferences']['privacy']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          privacy: { ...user.preferences.privacy, ...settings }
        }
      };
      setUser(updatedUser);
      console.log('✅ Privacy settings updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update privacy settings:', error);
      setError('Failed to update privacy settings');
      return false;
    }
  }, [user]);

  const getDataUsageReport = useCallback(async (): Promise<any> => {
    try {
      if (!user) return null;

      const report = {
        dataPoints: {
          profileData: 1,
          nutritionGoals: 1,
          achievements: user.achievements.length,
          recipesCreated: user.stats.totalRecipes,
          mealsLogged: user.stats.totalMeals
        },
        storageUsed: JSON.stringify(user).length,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Data usage report generated');
      return report;
    } catch (error) {
      console.error('❌ Failed to generate data usage report:', error);
      setError('Failed to generate data usage report');
      return null;
    }
  }, [user]);

  const revokeAllSessions = useCallback(async (): Promise<boolean> => {
    try {
      // In a real app, this would revoke all sessions on the server
      console.log('🔐 All sessions revoked');
      return true;
    } catch (error) {
      console.error('❌ Failed to revoke sessions:', error);
      setError('Failed to revoke sessions');
      return false;
    }
  }, []);

  // Achievements & Stats Functions
  const addAchievement = useCallback(async (achievementData: Omit<Achievement, 'id' | 'dateEarned'>): Promise<boolean> => {
    if (!user) return false;

    try {
      const achievement: Achievement = {
        ...achievementData,
        id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateEarned: new Date().toISOString()
      };

      const updatedUser = {
        ...user,
        achievements: [...user.achievements, achievement]
      };
      setUser(updatedUser);
      
      console.log('✅ Achievement added');
      return true;
    } catch (error) {
      console.error('❌ Failed to add achievement:', error);
      setError('Failed to add achievement');
      return false;
    }
  }, [user]);

  const updateStats = useCallback(async (stats: Partial<UserProfile['stats']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        stats: { ...user.stats, ...stats }
      };
      setUser(updatedUser);
      console.log('✅ Stats updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update stats:', error);
      setError('Failed to update stats');
      return false;
    }
  }, [user]);

  const getActivityHistory = useCallback(async (limit: number = 50): Promise<UserActivity[]> => {
    try {
      // Return empty array for clean users (no test data)
      const activities: UserActivity[] = [];
      console.log(`✅ Activity history retrieved (${activities.length} items)`);
      return activities;
    } catch (error) {
      console.error('❌ Failed to get activity history:', error);
      setError('Failed to get activity history');
      return [];
    }
  }, []);

  // Utility Functions
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const defaultProfile = createCleanProfile(user.personalInfo);
      const resetUser = {
        ...defaultProfile,
        id: user.id,
        personalInfo: user.personalInfo, // Keep personal info
        accountInfo: user.accountInfo,   // Keep account info
      };
      
      setUser(resetUser);
      console.log('✅ Profile reset to clean defaults');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset profile:', error);
      setError('Failed to reset profile');
      return false;
    }
  }, [user]);

  const validateData = useCallback(async (): Promise<{ isValid: boolean; errors: string[] }> => {
    try {
      const errors: string[] = [];

      if (!user) {
        errors.push('No user data found');
        return { isValid: false, errors };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.personalInfo.email)) {
        errors.push('Invalid email format');
      }

      // Validate age (if date of birth is provided)
      if (user.personalInfo.dateOfBirth) {
        const birthDate = new Date(user.personalInfo.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 13 || age > 120) {
          errors.push('Invalid age');
        }
      }

      // Validate nutrition goals
      if (user.nutritionGoals.dailyCalories < 800 || user.nutritionGoals.dailyCalories > 5000) {
        errors.push('Daily calorie goal should be between 800-5000');
      }

      console.log(`✅ Data validation completed: ${errors.length} errors found`);
      return { isValid: errors.length === 0, errors };
    } catch (error) {
      console.error('❌ Failed to validate data:', error);
      setError('Failed to validate user data');
      return { isValid: false, errors: ['Validation failed'] };
    }
  }, [user]);

  const syncWithDatabase = useCallback(async (): Promise<boolean> => {
    try {
      // In a real app, this would sync with a backend database
      console.log('🔄 Database sync simulated');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync with database:', error);
      setError('Failed to sync with database');
      return false;
    }
  }, []);

  const contextValue: UserContextType = {
    user,
    isLoading,
    error,
    isAuthenticated,
    updateProfile,
    updatePersonalInfo,
    updatePreferences,
    updateNutritionGoals,
    updateActivityLevel,
    updateHealthMetrics,
    changePassword,
    changeEmail,
    verifyEmail,
    enableTwoFactor,
    disableTwoFactor,
    exportUserData,
    deleteAccount,
    downloadDataArchive,
    updatePrivacySettings,
    getDataUsageReport,
    revokeAllSessions,
    addAchievement,
    updateStats,
    getActivityHistory,
    resetToDefaults,
    validateData,
    syncWithDatabase
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the User Manager
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}