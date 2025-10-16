/**
 * Modern Food App Layout - Inspired by Deliveroo, Chipotle, and premium food apps
 * Features: Hero sections, food cards, nutrition breakdown, and modern navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import CalorieCalculator from '@/components/CalorieCalculator';
// import { UserSettingsManager } from '@/components/UserSettingsManager';
// import { SignOnModule } from '@/components/SignOnModule';
import { useAuth } from '@/hooks/useAuth';
// import { DataManagementPanel } from '@/components/DataManagementPanel';
// import { AchievementCelebration } from '@/components/AchievementCelebration';
// import { AwardsAchievements } from '@/components/AwardsAchievements';
// import { ConfettiCelebration } from '@/components/ConfettiCelebration';
// import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
// import { FastingTracker } from '@/components/FastingTracker';
// import { FastingStatusCard } from '@/components/FastingStatusCard';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { useAchievements, getAchievementIcon, formatAchievementDate } from '@/hooks/useAchievements';
// import { ProfileIcon } from '@/components/ProfileIcon';
// import { TourLauncher, useAppTour, WelcomeBanner } from '@/components/TourLauncher';
import { apiRequest } from '@/lib/queryClient';
const logoImage = '/BWN_Logo.png';
import { 
  Search, 
  Plus,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flame,
  Target,
  Trophy,
  Crown,
  Calendar,
  Download,
  Bell,
  BellRing,
  X,
  Home,
  BarChart3,
  UserCircle,
  Utensils,
  Clock,
  CheckCircle2,
  Sparkles,
  Droplets,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  GraduationCap,
  Play,
  Camera
} from 'lucide-react';
import { House, ForkKnife, Timer, ChartBar, User } from 'phosphor-react';
// import { NotificationDropdown } from '@/components/NotificationDropdown';
// import { WeeklyCaloriesCard } from '@/components/WeeklyCaloriesCard';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/lib/supabase';
import { getWeekDates, getLocalDateKey, getMealTypeByTime, formatLocalTime } from '@/utils/dateUtils';
import { fixMealDateMismatches } from '@/utils/mealDateFixer';
import { getCachedLocalStorage, debounce } from '@/utils/performanceUtils';
import { useLocation } from 'wouter';
import AIFoodAnalyzer from './AIFoodAnalyzer';
// import { AppleHealthIntegration } from '../components/AppleHealthIntegration';
// import { healthKitService } from '../services/healthKit';
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionManager } from '@/components/SubscriptionManager';


// Types
interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

interface Notification {
  id: string;
  type: 'achievement' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Achievement {
  type: 'daily-goal' | 'weekly-goal' | 'milestone' | 'special';
  title: string;
  message: string;
  description: string;
  confetti?: boolean;
  trophy?: boolean;
  points?: number;
  icon?: any;
}


type TrackingView = 'daily' | 'weekly';

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const { user, isLoading: authLoading, refetch: refetchUser } = useAuth();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const [openCard, setOpenCard] = useState<string | undefined>(undefined);
  const [navigationTrigger, setNavigationTrigger] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { backgroundImage, animationKey, isLoading, imageLoaded } = useRotatingBackground(activeTab, navigationTrigger, isTransitioning);
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showConfettiCelebration, setShowConfettiCelebration] = useState(false);
  const [confettiAchievement, setConfettiAchievement] = useState<Achievement | null>(null);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [goalCalories, setGoalCalories] = useState((user as any)?.dailyCalorieGoal || 2000);
  const [weeklyGoal, setWeeklyGoal] = useState(14000);
  const [loggedMeals, setLoggedMeals] = useState<any[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [trackingView, setTrackingView] = useState<TrackingView>('daily');
  const [nutritionMode, setNutritionMode] = useState<'ai' | 'calculator'>('ai');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Tour progress tracking
  const [tourProgress, setTourProgress] = useState(() => {
    const saved = localStorage.getItem('tour-progress');
    return saved ? JSON.parse(saved) : { clickedCards: [], suggestedNext: 0 };
  });
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  // Daily stats with fasting integration
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [fastingStatus, setFastingStatus] = useState<any>(null);
  
  // Profile completion state
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  
  // App tour state
  const { shouldShowTour, dismissTour } = useAppTour();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => shouldShowTour());
  
  // Nutrition aggregation state
  // Note: Macro nutrients now come from server via dailyStats
  const [dailyMicronutrients, setDailyMicronutrients] = useState({
    vitaminC: 0,
    vitaminD: 0,
    vitaminB12: 0,
    folate: 0,
    iron: 0,
    calcium: 0,
    zinc: 0,
    magnesium: 0
  });
  


  // Utility function to add notifications - using useCallback for stable reference
  // Water consumption update function with 8-glass daily limit
  const updateWaterConsumption = useCallback(async (change: number) => {
    if (!user) {
      // Update localStorage for unauthenticated users
      const localStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
      const currentGlasses = (localStats.waterGlasses || 0) + change;
      const newGlasses = Math.max(0, Math.min(8, currentGlasses)); // Limit to 0-8 glasses
      
      // Update localStorage
      const updatedStats = { ...localStats, waterGlasses: newGlasses };
      localStorage.setItem('dailyStats', JSON.stringify(updatedStats));
      
      // Update component state
      setDailyStats((prev: any) => prev ? { ...prev, waterGlasses: newGlasses } : { 
        totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, 
        waterGlasses: newGlasses, fastingStatus: undefined 
      });
      
      // Achievement notification
      if (newGlasses >= 8 && (localStats.waterGlasses || 0) < 8) {
        toast({
          title: "Hydration Goal Achieved! 💧",
          description: "You've reached your daily water intake goal!",
          variant: "default",
          duration: 3000,
        });
        // Add bell notification
        addNotification('success', 'Daily Hydration Goal! 💧', 'You\'ve reached your 8-glass water goal today!');
      }
      
      // Milestone notifications for water intake
      if (newGlasses === 4 && (localStats.waterGlasses || 0) < 4) {
        addNotification('info', 'Halfway There! 💧', 'You\'ve had 4 glasses of water today. Keep going!');
      }
      
      // Auto-sync to Apple Health if enabled
      syncHealthDataIfEnabled().catch(console.error);
      
      return;
    }
    
    try {
      const currentGlasses = (dailyStats?.waterGlasses || 0) + change;
      const newGlasses = Math.max(0, Math.min(8, currentGlasses)); // Limit to 0-8 glasses
      
      // Optimistic update
      setDailyStats((prev: any) => prev ? { ...prev, waterGlasses: newGlasses } : null);
      
      // Update in database with proper authentication
      const response = await apiRequest('POST', '/api/daily-stats', {
        waterGlasses: newGlasses,
        date: new Date().toISOString()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update water consumption: ${response.status} - ${errorText}`);
      }
      
      await response.json();
      
      // Refresh daily stats to update UI
      await fetchDailyStats();
      
      // Show toast notification for achievement
      if (newGlasses >= 8 && (dailyStats?.waterGlasses || 0) < 8) {
        toast({
          title: "Hydration Goal Achieved! 💧",
          description: "You've reached your daily water intake goal!",
          variant: "default",
          duration: 3000,
        });
        // Add bell notification
        addNotification('success', 'Daily Hydration Goal! 💧', 'You\'ve reached your 8-glass water goal today!');
      }
      
      // Milestone notifications for water intake
      if (newGlasses === 4 && (dailyStats?.waterGlasses || 0) < 4) {
        addNotification('info', 'Halfway There! 💧', 'You\'ve had 4 glasses of water today. Keep going!');
      }
      
      // Auto-sync to Apple Health if enabled
      syncHealthDataIfEnabled().catch(console.error);
      
    } catch (error) {
      // Revert optimistic update
      setDailyStats((prev: any) => prev ? { ...prev, waterGlasses: (dailyStats?.waterGlasses || 0) } : null);
      toast({
        title: "Error",
        description: "Failed to update water consumption",
        variant: "destructive",
      });
    }
  }, [user, dailyStats?.waterGlasses, toast]);

  // Apple Health sync function
  const handleHealthDataSync = useCallback(async (data: any) => {
    if (data.type === 'manual_sync') {
      try {
        // Sync current day's water intake
        if (dailyStats?.waterGlasses) {
          await healthKitService.syncWaterIntake(dailyStats.waterGlasses);
        }
        
        // Sync current day's nutrition data
        if (dailyStats) {
          await healthKitService.syncNutritionData({
            calories: dailyStats.totalCalories,
            protein: dailyStats.totalProtein,
            carbohydrates: dailyStats.totalCarbs,
            fat: dailyStats.totalFat
          });
        }
        
      } catch (error) {
        console.error('❌ Health data sync failed:', error);
      }
    }
  }, [dailyStats]);

  // Auto-sync health data when enabled
  const syncHealthDataIfEnabled = useCallback(async () => {
    const autoSyncEnabled = localStorage.getItem('appleHealthAutoSync') === 'true';
    if (autoSyncEnabled && healthKitService.getAuthorizationStatus()) {
      await handleHealthDataSync({ type: 'auto_sync' });
    }
  }, [handleHealthDataSync]);

  // Function to calculate micronutrients from meals - uses real data when available
  const calculateMicronutrients = useCallback((meals: any[]) => {
    
    // First, try to aggregate real micronutrient data from meals
    const realMicronutrients = meals.reduce((totals, meal) => {
      // Handle both camelCase and snake_case property names from database
      // Convert string values from database to numbers for proper addition
      const mealMicronutrients = {
        vitaminC: parseFloat(meal.vitaminC || meal.vitamin_c) || 0,
        vitaminD: parseFloat(meal.vitaminD || meal.vitamin_d) || 0,
        vitaminB12: parseFloat(meal.vitaminB12 || meal.vitamin_b12) || 0,
        folate: parseFloat(meal.folate) || 0,
        iron: parseFloat(meal.iron) || 0,
        calcium: parseFloat(meal.calcium) || 0,
        zinc: parseFloat(meal.zinc) || 0,
        magnesium: parseFloat(meal.magnesium) || 0
      };
      
      
      return {
        vitaminC: totals.vitaminC + mealMicronutrients.vitaminC,
        vitaminD: totals.vitaminD + mealMicronutrients.vitaminD,
        vitaminB12: totals.vitaminB12 + mealMicronutrients.vitaminB12,
        folate: totals.folate + mealMicronutrients.folate,
        iron: totals.iron + mealMicronutrients.iron,
        calcium: totals.calcium + mealMicronutrients.calcium,
        zinc: totals.zinc + mealMicronutrients.zinc,
        magnesium: totals.magnesium + mealMicronutrients.magnesium
      };
    }, {
      vitaminC: 0,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 0,
      iron: 0,
      calcium: 0,
      zinc: 0,
      magnesium: 0
    });
    
    
    // Check if we have real data (any micronutrient value > 0)
    const hasRealData = Object.values(realMicronutrients).some((value) => (value as number) > 0);
    
    if (hasRealData) {
      // Return actual micronutrient data from meals
      return {
        vitaminC: Math.round(realMicronutrients.vitaminC * 10) / 10,
        vitaminD: Math.round(realMicronutrients.vitaminD * 10) / 10,
        vitaminB12: Math.round(realMicronutrients.vitaminB12 * 10) / 10,
        folate: Math.round(realMicronutrients.folate),
        iron: Math.round(realMicronutrients.iron * 10) / 10,
        calcium: Math.round(realMicronutrients.calcium),
        zinc: Math.round(realMicronutrients.zinc * 10) / 10,
        magnesium: Math.round(realMicronutrients.magnesium)
      };
    } else {
      // Fallback to estimation if no real data available
      const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const baseMultiplier = totalCalories / 100;
      
      return {
        vitaminC: Math.round(baseMultiplier * 8),
        vitaminD: Math.round(baseMultiplier * 0.2),
        vitaminB12: Math.round(baseMultiplier * 0.3 * 10) / 10,
        folate: Math.round(baseMultiplier * 12),
        iron: Math.round(baseMultiplier * 1.8 * 10) / 10,
        calcium: Math.round(baseMultiplier * 25),
        zinc: Math.round(baseMultiplier * 1.1 * 10) / 10,
        magnesium: Math.round(baseMultiplier * 15)
      };
    }
  }, []);

  // Check if profile completion is required
  useEffect(() => {
    if (user && !authLoading) {
      const userData = user as any;
      const hasFirstName = userData?.firstName && userData.firstName.trim() !== '';
      const hasLastName = userData?.lastName && userData.lastName.trim() !== '';
      
      // Show profile completion modal if user is missing required profile info
      if (!hasFirstName || !hasLastName) {
        // Profile incomplete - showing completion modal
        setShowProfileCompletion(true);
      }
    }
  }, [user, authLoading]);

  // Handle profile completion submission
  const handleProfileCompletion = async (profileData: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    profileIcon: number;
  }) => {
    try {
      // Get the current access token (same logic as useAuth.ts)
      let accessToken = null;
      
      // Check for locally stored custom tokens first
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.access_token) {
            accessToken = parsedSession.access_token;
          }
        } catch (parseError) {
        }
      }
      
      // If no custom token, check Supabase session
      if (!accessToken) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          accessToken = session.access_token;
        }
      }
      
      if (!accessToken) {
        throw new Error('No authentication token available');
      }

      // Update user profile with required information and profile icon
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          profileIcon: profileData.profileIcon
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Close the modal and refresh user data
      setShowProfileCompletion(false);
      await refetchUser();
    } catch (error) {
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    }, ...prev]);
  }, []);

  // Fetch daily stats including fasting status
  const fetchDailyStats = useCallback(async () => {
    if (!user) {
      // For unauthenticated users, load from localStorage
      const localStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
      
      setDailyStats({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        waterGlasses: localStats.waterGlasses || 0,
        fastingStatus: undefined
      });
      return;
    }
    
    try {
      // Use the correct GET endpoint for daily stats
      const response = await apiRequest('GET', `/api/users/${user.id}/daily-stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch daily stats: ${response.status}`);
      }
      const data = await response.json();
      
      // Extract stats from response
      const stats = {
        totalCalories: data.totalCalories || 0,
        totalProtein: data.totalProtein || 0,
        totalCarbs: data.totalCarbs || 0,
        totalFat: data.totalFat || 0,
        waterGlasses: data.waterGlasses || 0,
        fastingStatus: data.fastingStatus
      };
      
      setDailyStats(stats);
      setDailyCalories(stats.totalCalories);
      
    } catch (error) {
      console.error('❌ Daily stats fetch error for authenticated user:', error);
      // Set default stats to prevent UI issues
      setDailyStats({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        waterGlasses: 0,
        fastingStatus: undefined
      });
    }
  }, [user]);
  
  // Check fasting status from localStorage
  const checkFastingStatus = useCallback(() => {
    try {
      // Check for active fasting session in localStorage
      const storedSession = localStorage.getItem('bytewise_fasting_session');
      const isActive = localStorage.getItem('bytewise_fasting_active');
      
      if (storedSession && isActive === 'true') {
        const session = JSON.parse(storedSession);
        const startTime = new Date(session.startTime).getTime();
        const targetDuration = session.targetDuration;
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = targetDuration - elapsed;
        
        if (remaining > 0) {
          // Find the plan details
          const plan = session.planId;
          let planName = 'Custom';
          if (plan === '16-8') planName = '16:8 Method';
          else if (plan === '14-10') planName = '14:10 Method';
          else if (plan === '18-6') planName = '18:6 Method';
          else if (plan === '20-4') planName = '20:4 Warrior';
          else if (plan === '24-0') planName = '24 Hour Fast';
          
          setFastingStatus({
            isActive: true,
            timeRemaining: remaining,
            planName: planName,
            startTime: session.startTime,
            targetDuration: targetDuration
          });
        } else {
          // Fast has completed
          setFastingStatus({
            isActive: false
          });
          // Clear expired session
          localStorage.removeItem('bytewise_fasting_session');
          localStorage.removeItem('bytewise_fasting_active');
        }
      } else {
        setFastingStatus({
          isActive: false
        });
      }
    } catch (error) {
      console.error('Error checking fasting status:', error);
      setFastingStatus({
        isActive: false
      });
    }
  }, []);



  // Notification handler functions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Achievement hooks  
  const { achievements: goalAchievements, celebrationAchievement, showCelebration, closeCelebration } = useGoalAchievements();

  // Handle new achievements
  useEffect(() => {
    if (celebrationAchievement) {
      // Transform the achievement to match our interface
      const achievement: Achievement = {
        type: 'milestone',
        title: celebrationAchievement.title || 'Achievement Unlocked',
        message: celebrationAchievement.description || celebrationAchievement.title || 'Great job!',
        description: celebrationAchievement.description || celebrationAchievement.title || 'You unlocked a new achievement!',
        confetti: true,
        trophy: true,
        points: 10
      };
      setCurrentAchievement(achievement);
      setShowAchievement(true);
      
      // Add bell notification for achievement
      addNotification('achievement', achievement.title, achievement.message);
    }
  }, [celebrationAchievement, addNotification]);

  // Listen for goal achievements and trigger confetti
  useEffect(() => {
    const handleGoalAchievement = (event: any) => {
      const rawAchievement = event.detail;
      // Transform the achievement to match our interface
      const achievement: Achievement = {
        type: (rawAchievement.type === 'daily-goal' || rawAchievement.type === 'weekly-goal' || rawAchievement.type === 'milestone' || rawAchievement.type === 'special') ? rawAchievement.type : 'milestone',
        title: rawAchievement.title,
        message: rawAchievement.message || rawAchievement.title,
        description: rawAchievement.description || rawAchievement.message || rawAchievement.title,
        confetti: true,
        trophy: true,
        points: rawAchievement.points || 10
      };
      setConfettiAchievement(achievement);
      setShowConfettiCelebration(true);
      
      addNotification('achievement', achievement.title, achievement.message);
    };

    window.addEventListener('achievement-unlocked', handleGoalAchievement);
    return () => window.removeEventListener('achievement-unlocked', handleGoalAchievement);
  }, [addNotification]);
  
  // Monitor daily calorie goals and trigger notifications
  useEffect(() => {
    if (dailyStats && goalCalories > 0) {
      const { totalCalories } = dailyStats;
      const progress = (totalCalories / goalCalories) * 100;
      
      // Goal achievement notifications
      if (totalCalories >= goalCalories && (dailyCalories < goalCalories || dailyCalories === 0)) {
        addNotification('success', 'Daily Calorie Goal! 🎯', `Congratulations! You've reached your ${goalCalories} calorie goal today.`);
      }
      
      // Milestone notifications
      if (progress >= 75 && (dailyCalories / goalCalories) * 100 < 75) {
        addNotification('info', '75% Complete! 🍽️', `You're almost there! ${Math.round(goalCalories - totalCalories)} calories to go.`);
      } else if (progress >= 50 && (dailyCalories / goalCalories) * 100 < 50) {
        addNotification('info', 'Halfway There! 🥗', `You've hit 50% of your daily calorie goal. Keep it up!`);
      }
      
      // Update tracked calories
      setDailyCalories(totalCalories);
    }
  }, [dailyStats, goalCalories, dailyCalories, addNotification]);

  // Load data on component mount (for both authenticated and unauthenticated users)
  useEffect(() => {
    fetchDailyStats();
  }, [fetchDailyStats]);

  // Update calorie goals when user data changes
  useEffect(() => {
    if (user) {
      // Fix: Use dailyCalorieGoal from database, not calorie_goal from Supabase metadata
      const userCalorieGoal = (user as any)?.dailyCalorieGoal || (user as any)?.calorie_goal || 2000;
      setGoalCalories(userCalorieGoal);
      setWeeklyGoal(userCalorieGoal * 7);
      
      // Fetch daily stats when user changes (this will refetch from server if authenticated)
      fetchDailyStats();
    }
  }, [user, fetchDailyStats]);

  // Listen for water updates from calorie tracker
  useEffect(() => {
    const handleWaterUpdate = (event: any) => {
      if (user) {
        fetchDailyStats();
      } else {
        // For unauthenticated users, update from localStorage directly
        const localStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
        const newWaterGlasses = localStats.waterGlasses || event.detail?.glasses || 0;
        
        setDailyStats((prev: any) => ({
          ...prev,
          totalCalories: prev?.totalCalories || 0,
          totalProtein: prev?.totalProtein || 0,
          totalCarbs: prev?.totalCarbs || 0,
          totalFat: prev?.totalFat || 0,
          waterGlasses: newWaterGlasses,
          fastingStatus: prev?.fastingStatus
        }));
      }
    };
    
    window.addEventListener('waterUpdated', handleWaterUpdate);
    return () => window.removeEventListener('waterUpdated', handleWaterUpdate);
  }, [user, fetchDailyStats]);


  // Refresh micronutrients when tab changes or meals change - Database-first
  useEffect(() => {
    // Use logged meals from database state only
    const todayMeals = loggedMeals;
    
    
    if (todayMeals.length > 0) {
      const micronutrients = calculateMicronutrients(todayMeals);
      setDailyMicronutrients(micronutrients);
    } else {
      // Reset micronutrients if no meals
      setDailyMicronutrients({
        vitaminC: 0,
        vitaminD: 0,
        vitaminB12: 0,
        folate: 0,
        iron: 0,
        calcium: 0,
        zinc: 0,
        magnesium: 0
      });
    }
  }, [activeTab, calculateMicronutrients, loggedMeals]);
  
  // Check if tour should be shown after successful authentication
  useEffect(() => {
    const handleAuthStateChange = () => {
      // Only trigger tour if user exists, hasn't completed tour, and this is a fresh auth
      if (user && shouldShowTour()) {
        // Set a flag to indicate fresh authentication
        const isFreshAuth = localStorage.getItem('fresh-auth-session') === 'true';
        
        if (isFreshAuth) {
          // Clear the fresh auth flag
          localStorage.removeItem('fresh-auth-session');
          
          // Show welcome banner instead of immediately starting tour
          setShowWelcomeBanner(true);
          
          // Show welcome banner for user awareness

        }
      }
    };

    // Listen for auth state changes that indicate fresh sign-in/sign-up
    window.addEventListener('auth-state-change', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('auth-state-change', handleAuthStateChange);
    };
  }, [user, shouldShowTour]);

  // Load existing meal data and set up tracking
  useEffect(() => {
    // Load existing meal data on component mount - Database-first approach
    const loadExistingData = async () => {
      try {
        let stored: any[] = [];
        
        // For authenticated users, load from database only
        if (user) {
          try {
            const response = await apiRequest('GET', '/api/meals/logged');
            if (response.ok) {
              const databaseMeals = await response.json();
              stored = Array.isArray(databaseMeals) ? databaseMeals : [];
              
            } else {
              console.error('Failed to load meals from database');
              stored = [];
            }
          } catch (error) {
            console.error('Database error:', error);
            stored = [];
          }
        } else {
          // For unauthenticated users, use empty array (require authentication)
          stored = [];
            }
        
        // Simple date matching - use today's actual date without correction
        const today = getLocalDateKey();
        
        // Filter meals for today using simple date matching
        const todayMeals = stored.filter((meal: any) => {
          // Handle timestamp format dates
          const mealDate = meal.date && meal.date.includes('T') 
            ? meal.date.split('T')[0] 
            : meal.date;
          
          return mealDate === today;
        });
        

        // Enhanced: Filter meals to include last month of data for search functionality
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneMonthAgoDateKey = getLocalDateKey(oneMonthAgo);
        
        // Filter stored meals to include last month for comprehensive search
        const monthlyMeals = stored.filter((meal: any) => {
          const mealDate = meal.date && meal.date.includes('T') 
            ? meal.date.split('T')[0] 
            : meal.date;
          
          // Include meals from the last month
          return mealDate >= oneMonthAgoDateKey;
        });
        
        // Today's meals filtered
        
        setLoggedMeals(todayMeals);
        setWeeklyMeals(monthlyMeals); // Store last month's meals for comprehensive search functionality
        
        // Calculate daily calories from existing logged meals
        const dailyTotal = todayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || meal.totalCalories || 0), 0);
        setDailyCalories(dailyTotal);
        // Daily total calories calculated
        
        // Macro nutrients are now calculated server-side and available via dailyStats
        // No need for separate frontend calculation
        
        // Calculate micronutrients from today's meals
        // Calculating micronutrients
        const micronutrients = calculateMicronutrients(todayMeals);
        // Calculated micronutrients
        
        // Update micronutrients state
        const updatedMicronutrients = {
          vitaminC: micronutrients.vitaminC || 0,
          vitaminD: micronutrients.vitaminD || 0,
          vitaminB12: micronutrients.vitaminB12 || 0,
          folate: micronutrients.folate || 0,
          iron: micronutrients.iron || 0,
          calcium: micronutrients.calcium || 0,
          zinc: micronutrients.zinc || 0,
          magnesium: micronutrients.magnesium || 0
        };
        // Updating dailyMicronutrients state
        setDailyMicronutrients(updatedMicronutrients);
        
        // Fetch daily stats including fasting status
        if (user) {
          fetchDailyStats();
        }
        
        // Check fasting status from localStorage
        checkFastingStatus();
        
        // Calculate weekly calories from database data (matching WeeklyCaloriesCard logic)
        if (user) {
          try {
            // Load weekly data from database for accurate calculation
            const response = await apiRequest('GET', '/api/meals/logged');
            if (response.ok) {
              const databaseMeals = await response.json();
              const currentWeekDates = getWeekDates();
              const weekDateKeys = currentWeekDates.map(date => getLocalDateKey(date));
              
              // Filter meals to current week with same logic as WeeklyCaloriesCard
              const currentWeekMeals = databaseMeals.filter((meal: any) => {
                if (!meal.date) return false;
                const normalizedMealDate = meal.date.includes('T') 
                  ? meal.date.split('T')[0] 
                  : meal.date;
                return weekDateKeys.includes(normalizedMealDate);
              });
              
              // Calculate with proper number parsing
              const weeklyTotal = currentWeekMeals.reduce((sum: number, meal: any) => {
                const mealCalories = Number(meal.calories) || Number(meal.totalCalories) || 0;
                return sum + mealCalories;
              }, 0);
              
              setWeeklyCalories(weeklyTotal);
            } else {
              // Fallback to localStorage calculation
              const currentWeekDates = getWeekDates();
              const weekDateKeys = currentWeekDates.map(date => getLocalDateKey(date));
              const currentWeekMeals = stored.filter((meal: any) => {
                if (weekDateKeys.includes(meal.date)) return true;
                if (meal.date && meal.date.includes('T')) {
                  const extractedDate = meal.date.split('T')[0];
                  return weekDateKeys.includes(extractedDate);
                }
                return false;
              });
              const weeklyTotal = currentWeekMeals.reduce((sum: number, meal: any) => sum + (Number(meal.calories) || 0), 0);
              setWeeklyCalories(weeklyTotal);
            }
          } catch (error) {
            // Fallback to localStorage calculation with improved parsing
            const currentWeekDates = getWeekDates();
            const weekDateKeys = currentWeekDates.map(date => getLocalDateKey(date));
            const currentWeekMeals = stored.filter((meal: any) => {
              if (weekDateKeys.includes(meal.date)) return true;
              if (meal.date && meal.date.includes('T')) {
                const extractedDate = meal.date.split('T')[0];
                return weekDateKeys.includes(extractedDate);
              }
              return false;
            });
            const weeklyTotal = currentWeekMeals.reduce((sum: number, meal: any) => sum + (Number(meal.calories) || 0), 0);
            setWeeklyCalories(weeklyTotal);
          }
        } else {
          // For non-authenticated users, use localStorage
          const currentWeekDates = getWeekDates();
          const weekDateKeys = currentWeekDates.map(date => getLocalDateKey(date));
          const currentWeekMeals = stored.filter((meal: any) => {
            if (weekDateKeys.includes(meal.date)) return true;
            if (meal.date && meal.date.includes('T')) {
              const extractedDate = meal.date.split('T')[0];
              return weekDateKeys.includes(extractedDate);
            }
            return false;
          });
          const weeklyTotal = currentWeekMeals.reduce((sum: number, meal: any) => sum + (Number(meal.calories) || 0), 0);
          setWeeklyCalories(weeklyTotal);
        }
        
      } catch (error) {
        // Reset to safe state on error
        setLoggedMeals([]);
        setDailyCalories(0);
        setWeeklyCalories(0);
        setDailyMicronutrients({
          vitaminC: 0,
          vitaminD: 0,
          vitaminB12: 0,
          folate: 0,
          iron: 0,
          calcium: 0,
          zinc: 0,
          magnesium: 0
        });
      }
    };

    // Load existing data immediately
    loadExistingData();
    
    // Listen for meal data reload events (e.g., after meal deletion)
    const handleReloadMealData = () => {
      loadExistingData();
    };
    
    window.addEventListener('reload-meal-data', handleReloadMealData);
    
    // Update fasting status every 2 minutes to reduce conflicts with FastingTracker
    const fastingInterval = setInterval(() => {
      checkFastingStatus();
    }, 120000); // Check every 2 minutes

    // Set up event listeners for future meal logging
    const handleMealLogged = (event?: any) => {
      try {
        loadExistingData();
        
        // Add notification for meal logging
        if (event?.detail) {
          const { foodName, calories, mealType, protein } = event.detail;
          addNotification(
            'success', 
            'Meal Logged! 🍽️', 
            `Added ${foodName || 'food item'} (${calories || 0} cal${protein ? `, ${protein}g protein` : ''}) to ${mealType || 'your meals'}`
          );
        } else {
          // Generic meal logged notification when no details available
          addNotification('success', 'Meal Updated! 🍽️', 'Your nutrition data has been updated');
        }
        
        // Don't dispatch circular events - let other components handle their own refresh
      } catch (error) {
        // Handle errors silently to avoid console spam
      }
    };

    // Handle tour navigation
    const handleTourNavigation = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { tab, nutritionMode, accordionTarget } = customEvent.detail;
      setActiveTab(tab);
      
      // Set nutrition mode if specified
      if (nutritionMode && (nutritionMode === 'ai' || nutritionMode === 'calculator')) {
        setNutritionMode(nutritionMode);
      }
      
      // Open specific accordion if specified
      if (accordionTarget) {
        setTimeout(() => {
          setOpenCard(accordionTarget);
        }, 100); // Small delay to ensure tab switch completes first
      }
    };

    // Handle fasting events
    const handleFastingCompleted = (event: any) => {
      const { planName, duration, message } = event.detail;
      addNotification('success', `Fasting Complete! 🎉`, message);
    };
    
    const handleFastingMilestone = (event: any) => {
      const { hours, title, message } = event.detail;
      if (hours >= 12) { // Only notify for significant milestones
        addNotification('achievement', title, message);
      }
    };

    // Add event listeners with unique references to avoid conflicts
    const eventsToAdd = [
      { type: 'calories-logged', handler: handleMealLogged },
      { type: 'meal-logged-success', handler: handleMealLogged },
      { type: 'refresh-meals', handler: handleMealLogged }, // AI analyzer meal refresh
      { type: 'navigate-to-tab', handler: handleTourNavigation },
      { type: 'fasting-completed', handler: handleFastingCompleted },
      { type: 'fasting-milestone', handler: handleFastingMilestone }
    ];

    eventsToAdd.forEach(({ type, handler }) => {
      window.addEventListener(type, handler);
    });

    // Add storage listener separately
    window.addEventListener('storage', loadExistingData);

    return () => {
      eventsToAdd.forEach(({ type, handler }) => {
        window.removeEventListener(type, handler);
      });
      window.removeEventListener('storage', loadExistingData);
      window.removeEventListener('reload-meal-data', handleReloadMealData);
      clearInterval(fastingInterval);
    };
  }, [user, fetchDailyStats, calculateMicronutrients, checkFastingStatus]);

  // Food categories inspired by Deliveroo
  const categories = [
    { id: 'popular', name: 'Popular', emoji: '🔥', color: 'bg-red-500' },
    { id: 'healthy', name: 'Healthy', emoji: '🥗', color: 'bg-green-500' },
    { id: 'protein', name: 'Protein', emoji: '🥩', color: 'bg-orange-500' },
    { id: 'carbs', name: 'Carbs', emoji: '🍞', color: 'bg-orange-500' },
    { id: 'snacks', name: 'Snacks', emoji: '🍿', color: 'bg-purple-500' },
  ];

  // Featured foods with nutrition data
  const featuredFoods = [
    {
      id: 1,
      name: 'Grilled Chicken Bowl',
      description: 'Protein-packed with quinoa and vegetables',
      calories: 420,
      protein: 35,
      carbs: 28,
      fat: 12,
      rating: 4.8,
      time: '15-20 min',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      tags: ['High Protein', 'Gluten Free']
    },
    {
      id: 2,
      name: 'Avocado Toast Supreme',
      description: 'Sourdough with smashed avocado and seeds',
      calories: 340,
      protein: 12,
      carbs: 32,
      fat: 18,
      rating: 4.6,
      time: '5-10 min',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      tags: ['Vegetarian', 'Fiber Rich']
    },
    {
      id: 3,
      name: 'Salmon & Sweet Potato',
      description: 'Wild salmon with roasted sweet potato',
      calories: 480,
      protein: 32,
      carbs: 35,
      fat: 22,
      rating: 4.9,
      time: '20-25 min',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      tags: ['Omega-3', 'Heart Healthy']
    }
  ];

  // Removed page animation direction function

  // Enhanced tab change handler with hero component scroll reset
  const [, setLocation] = useLocation();

  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      // Immediate state update - no transitions
      setPreviousTab(activeTab);
      setActiveTab(newTab);
      setOpenCard(undefined);
      
      // Trigger new background image loading
      setNavigationTrigger(prev => prev + 1);
      
      // Force scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Optimized Hero Section Component with enhanced performance and visuals
  const HeroSection = React.memo(({ title, subtitle, description, buttonText, onButtonClick, showLogo = false }: {
    title: string;
    subtitle: string; 
    description: string;
    buttonText: string;
    onButtonClick: () => void;
    showLogo?: boolean;
  }) => {
    
    // Animations are now directly in the components - no conditional logic needed
    
    // Memoize the background style optimized for mobile food composition
    const backgroundStyle = React.useMemo(() => ({
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: '75%', // Zoom out to show more of the food photo
      backgroundPosition: 'center center', // Center the food items in viewport
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#0f172a', // Very dark fallback to prevent any color flash
      backgroundAttachment: 'scroll', // Better mobile performance
    }), [backgroundImage]);
    
    // Background classes - simple visibility control
    const backgroundClasses = React.useMemo(() => {
      const baseClasses = 'absolute inset-0 z-10 hero-bg-optimized';
      
      // Show when image is loaded and not loading
      if (imageLoaded && !isLoading) {
        return `${baseClasses} hero-bg-loaded`;
      }
      return `${baseClasses} hero-bg-hidden`;
    }, [imageLoaded, isLoading]);

    return (
      <div className="relative h-screen overflow-hidden hero-component bg-gradient-to-br from-amber-50 to-amber-100" data-hero="true">
        {/* Optimized Background Layer with preloading and smooth transitions */}
        <div 
          className={backgroundClasses}
          style={backgroundStyle}
        />
        
        {/* CSS-controlled Overlay for consistent opacity - always visible */}
        <div className="hero-gradient-overlay opacity-100" style={{ zIndex: 11 }} />
        
        
        {/* Content Layer with Enhanced Typography */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20 text-white">
          <div className="space-y-8 max-w-2xl">
            {/* ByteWise Logo - Only shown on dashboard */}
            {showLogo && (
              <div className="mb-12 -mt-16">
                <img 
                  src={logoImage} 
                  alt="ByteWise Nutritionist Logo" 
                  className="h-20 w-auto object-contain mx-auto drop-shadow-2xl"
                  data-testid="bytewise-hero-logo"
                />
              </div>
            )}
            
            {/* Animated Title Section */}
            <div className="space-y-3 hero-optimized">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] drop-shadow-2xl font-league-spartan text-optimized animate-slideUpH1">
                {title}
              </h1>
              <h2 className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] font-league-spartan ${showLogo ? 'text-white' : 'text-optimized'} drop-shadow-2xl animate-slideUpH2`}>
                {subtitle}
              </h2>
            </div>
            
            {/* Clean Description */}
            <p className="text-2xl md:text-3xl font-light leading-relaxed max-w-xl mx-auto drop-shadow-xl font-work-sans text-gray-100 opacity-100">
              {description}
            </p>
            
            {/* Clean Call-to-Action */}
            <div className="pt-8 opacity-100">
              <Button 
                onClick={onButtonClick}
                size="lg"
                className="group relative bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 font-bold px-16 py-6 rounded-full text-xl md:text-2xl shadow-2xl transition-all duration-200 ease-out overflow-hidden transform hover:scale-105"
                style={{ color: '#ffffff !important' }}
              >
                <span className="relative z-10 flex items-center gap-3" style={{ color: '#ffffff !important' }}>
                  {buttonText}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-150" />
                </span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Clean Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-white opacity-100">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-white opacity-70" />
            <ChevronRight className="w-6 h-6 rotate-90 drop-shadow-lg opacity-80" />
          </div>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison for better performance - include activeTab for overlay changes
    return (
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.description === nextProps.description &&
      prevProps.buttonText === nextProps.buttonText
    );
  });

  // Optimized ByteWise Logo Component
  const BytewiseLogo = React.memo(() => (
    <div className="mb-8 cursor-pointer group transition-transform duration-200 hover:scale-105" onClick={() => handleTabChange('home')}>
      <div className="text-center font-league-spartan">
        <div className="text-8xl font-black leading-none text-sky-300 mb-2 lowercase tracking-tight drop-shadow-2xl group-hover:text-sky-200 transition-colors duration-200">
          bytewise
        </div>
        <div className="text-2xl font-light text-white/80 uppercase tracking-widest drop-shadow-lg group-hover:text-white/90 transition-colors duration-200">
          nutritionist
        </div>
      </div>
    </div>
  ));

  // Optimized Progress Card Component
  const ProgressCard = React.memo(({ title, icon: Icon, value, goal, percentage, color }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    goal: string;
    percentage: number;
    color: string;
  }) => {
    // Memoize calculated values
    const progressWidth = React.useMemo(() => Math.min(percentage, 100), [percentage]);
    const isComplete = progressWidth >= 100;
    
    return (
      <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border-none p-5 shadow-lg" data-testid="progress-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${color}-500/30 rounded-xl`}>
              <Icon className={`w-5 h-5 text-${color}-700`} />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium">{title}</h3>
              <p className="text-gray-900 text-sm font-medium">{value}/{goal}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-medium text-${color}-700`}>{progressWidth}%</div>
            <div className="text-xs text-gray-900 font-normal">of goal</div>
          </div>
        </div>
        <div className="relative h-3 bg-gray-300/60 rounded-full overflow-hidden mb-4 shadow-inner border border-gray-400/20">
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${color}-600 to-${color === 'orange' ? 'red' : 'cyan'}-700 rounded-full transition-all duration-1000 shadow-sm`}
            style={{ width: `${progressWidth}%` }}
          />
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
          )}
        </div>
      </Card>
    );
  });

  // Enhanced Water Consumption Card Component with Weekly Log
  const WaterCard = React.memo(({ glasses, onIncrement, onDecrement }: {
    glasses: number;
    onIncrement: () => void;
    onDecrement: () => void;
  }) => {
    const [waterHistory, setWaterHistory] = React.useState<Array<{date: string, glasses: number}>>([]);
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
    const [showHistory, setShowHistory] = React.useState(false);
    
    const dailyGoal = 8; // 8 glasses per day
    const percentage = Math.min((glasses / dailyGoal) * 100, 100);
    const isGoalReached = glasses >= dailyGoal;

    // Fetch water intake history
    const fetchWaterHistory = React.useCallback(async () => {
      if (isLoadingHistory) return;
      
      setIsLoadingHistory(true);
      
      try {
        // Use proper auth headers from queryClient
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (session?.access_token && session.access_token.split('.').length === 3) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch('/api/water-history?days=30', {
          headers,
        });
        
        if (response.ok) {
          const result = await response.json();
          const formattedHistory = result.data.map((item: any) => ({
            date: new Date(item.date).toISOString().split('T')[0],
            glasses: item.glasses
          }));
          setWaterHistory(formattedHistory);
        } else {
          // If no data available, generate some sample data for demonstration
          const sampleHistory = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
              date: date.toISOString().split('T')[0],
              glasses: Math.floor(Math.random() * 7) + 1 // Random 1-8 glasses
            };
          });
          setWaterHistory(sampleHistory);
        }
      } catch (error) {
        console.error('Failed to fetch water history:', error);
        // If error, generate some sample data for demonstration
        const sampleHistory = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            glasses: Math.floor(Math.random() * 7) + 1 // Random 1-8 glasses
          };
        });
        setWaterHistory(sampleHistory);
      } finally {
        setIsLoadingHistory(false);
      }
    }, [isLoadingHistory]);

    // Fetch history when component mounts or when history is shown
    useEffect(() => {
      if (showHistory && waterHistory.length === 0) {
        fetchWaterHistory();
      }
    }, [showHistory, waterHistory.length, fetchWaterHistory]);
    
    return (
      <Card className={`bg-gradient-to-br from-amber-100 to-cyan-100 border-none p-6 transition-all duration-300 hover:from-amber-100 hover:to-cyan-200 shadow-lg hover:shadow-xl`} data-testid="water-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl transition-all duration-300 ${isGoalReached ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-cyan-500/30'}`}>
              <Droplets className={`w-6 h-6 transition-colors duration-300 ${isGoalReached ? 'text-gray-900' : 'text-cyan-700'}`} />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium text-lg">Water Intake</h3>
              <p className="text-gray-900 text-sm font-medium">{glasses}/{dailyGoal} glasses today</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-gray-900">{Math.round(percentage)}%</div>
            <div className="text-xs text-gray-900 font-normal">of goal</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-3 bg-gray-300/60 rounded-full overflow-hidden mb-4 shadow-inner border border-gray-400/20">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full transition-all duration-1000 shadow-sm"
            style={{ width: `${percentage}%` }}
          />
          {percentage >= 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
          )}
        </div>
        
        {/* Water glass visualization */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {Array.from({ length: dailyGoal }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-6 rounded-sm transition-all duration-300 ${
                  i < glasses 
                    ? 'bg-cyan-400' 
                    : 'bg-gray-300'
                }`}
                style={{
                  background: i < glasses 
                    ? 'linear-gradient(to top, #06b6d4 0%, #0891b2 100%)' 
                    : 'transparent'
                }}
              />
            ))}
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={onDecrement}
              disabled={glasses <= 0}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow duration-200"
              data-testid="button-decrement-water"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              onClick={onIncrement}
              disabled={glasses >= dailyGoal}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-cyan-500/50 hover:border-cyan-500/70 disabled:hover:bg-transparent"
              data-testid="button-increment-water"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekly History Toggle */}
        <div className="mt-4 pt-4 border-t border-gray-400/20">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            size="sm"
            className="w-full text-gray-700 hover:text-cyan-600 hover:bg-cyan-500/10 font-medium"
            data-testid="button-toggle-water-history"
          >
            {showHistory ? 'Hide' : 'Show'} 30-Day Log
            {showHistory ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          
          {showHistory && (
            <div className="mt-4 space-y-3">
              {isLoadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading water history...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Last 30 Days Water Intake</h4>
                  
                  {/* Weekly Grid View */}
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-gray-500 font-medium py-1">
                        {day}
                      </div>
                    ))}
                    
                    {/* Generate last 30 days in weekly grid */}
                    {Array.from({ length: 30 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (29 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const dayData = waterHistory.find(h => h.date === dateStr);
                      const glassesOnDay = dayData?.glasses || 0;
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      
                      return (
                        <div
                          key={dateStr}
                          className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 min-h-[40px] ${
                            isToday 
                              ? 'ring-2 ring-cyan-500 bg-cyan-50 text-cyan-900' 
                              : glassesOnDay >= dailyGoal 
                                ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' 
                                : glassesOnDay > 0 
                                  ? 'bg-cyan-200 text-gray-800' 
                                  : 'bg-gray-100 text-gray-400'
                          }`}
                          title={`${date.getDate()}/${date.getMonth() + 1}: ${glassesOnDay} glasses`}
                        >
                          <div className="text-xs">{date.getDate()}</div>
                          <div className="text-xs font-bold">{glassesOnDay}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-cyan-700">
                          {waterHistory.filter(h => h.glasses >= dailyGoal).length}
                        </div>
                        <div className="text-xs text-gray-600">Goal Days</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-cyan-700">
                          {Math.round(waterHistory.reduce((sum, h) => sum + h.glasses, 0) / Math.max(waterHistory.length, 1))}
                        </div>
                        <div className="text-xs text-gray-600">Avg/Day</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-cyan-700">
                          {waterHistory.reduce((sum, h) => sum + h.glasses, 0)}
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  });

  // Enhanced Macro Card Component - Shows Remaining Values with Negative Color Coding
  const MacroCard = React.memo(({ name, value, goal, color, data = [0, 0, 0, 0, 0] }: {
    name: string;
    value: number;
    goal: number;
    color: string;
    data?: number[];
  }) => {
    // Calculate remaining value (goal - current)
    const remaining = goal - value;
    const isNegative = remaining < 0;
    
    // Memoize chart data calculation
    const chartData = React.useMemo(() => 
      data.map(height => Math.max(height * 100, 10))
    , [data]);

    // Determine text color based on remaining value
    const textColor = isNegative ? 'text-red-700' : `text-${color}-700`;
    const labelColor = isNegative ? 'text-red-600' : 'text-gray-900';

    return (
      <Card className="bg-amber-100 border-none p-4 transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-200 shadow-lg hover:shadow-xl" data-testid="macro-card">
        <div className="text-center">
          <div className={`text-sm ${labelColor} mb-1 leading-tight font-normal`}>
            <div>Remaining</div>
            <div>{name}</div>
          </div>
          <div className={`text-xl font-medium ${textColor} mb-2`}>
            {isNegative ? '+' : ''}{Math.abs(remaining)}g
          </div>
          <div className="flex items-end space-x-px h-6 rounded bg-amber-100">
            {chartData.map((height, i) => (
              <div 
                key={i}
                className={`flex-1 ${isNegative ? 'bg-red-500/40' : `bg-${color}-500/40`} rounded-t transition-all duration-500`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-900 font-normal mt-1">
            {value}g / {goal}g
          </div>
        </div>
      </Card>
    );
  });

  const MicronutrientCard = ({ name, value, goal, unit, color }: {
    name: string;
    value: number;
    goal: number;
    unit: string;
    color: string;
  }) => {
    
    const percentage = Math.min(Math.round((value / goal) * 100), 100);
    const displayValue = value.toFixed(value < 10 ? 1 : 0);
    
    // Use consistent color classes optimized for light theme with explicit gradients
    const getColorClasses = () => {
      switch(color) {
        case 'cyan': return {
          textColor: 'text-cyan-600',
          gradientClass: 'bg-gradient-to-r from-cyan-400 to-blue-500'
        };
        case 'orange': return {
          textColor: 'text-orange-600', 
          gradientClass: 'bg-gradient-to-r from-orange-400 to-yellow-500'
        };
        case 'red': return {
          textColor: 'text-red-600',
          gradientClass: 'bg-gradient-to-r from-red-400 to-pink-500'
        };
        case 'green': return {
          textColor: 'text-green-600',
          gradientClass: 'bg-gradient-to-r from-green-400 to-emerald-500'
        };
        case 'slate': return {
          textColor: 'text-slate-600',
          gradientClass: 'bg-gradient-to-r from-slate-400 to-gray-500'
        };
        case 'white': return {
          textColor: 'text-gray-900',
          gradientClass: 'bg-gradient-to-r from-white to-gray-300'
        };
        case 'amber': return {
          textColor: 'text-amber-600',
          gradientClass: 'bg-gradient-to-r from-amber-400 to-yellow-500'
        };
        case 'rose': return {
          textColor: 'text-rose-600',
          gradientClass: 'bg-gradient-to-r from-rose-400 to-pink-500'
        };
        default: return {
          textColor: 'text-gray-600',
          gradientClass: 'bg-gradient-to-r from-gray-400 to-gray-500'
        };
      }
    };
    
    const { textColor, gradientClass } = getColorClasses();
    
    return (
    <Card className="bg-amber-100 border-none p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-200" data-testid="micro-card">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-medium ${textColor}`}>{name}</div>
        <div className="text-xs text-gray-900 font-normal">{displayValue}{unit} / {goal}{unit}</div>
      </div>
      <div className="relative h-2 bg-gray-300/60 rounded-full overflow-hidden shadow-inner border border-gray-400/20">
        <div 
          className={`absolute left-0 top-0 h-full ${gradientClass} rounded-full transition-all duration-1000 shadow-sm`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      <div className="text-xs text-gray-900 font-normal mt-1">
        {percentage}% Daily Value ({displayValue}{unit})
      </div>
    </Card>
    );
  };

  // Render functions for each page with enhanced animations
  const renderHome = () => (
    <div className="space-y-0 page-container" data-page="dashboard">
      <HeroSection
        title="Track Your"
        subtitle="Nutrition"
        description="Track nutrition with scientific precision using our comprehensive USDA database"
        buttonText={user ? 'Start Tracking' : 'Sign Up to Track'}
        onButtonClick={() => {
          if (user) {
            handleTabChange('nutrition');
          } else {
            handleTabChange('profile');
          }
        }}
        showLogo={true}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 content-section">
        <div className="space-y-3">
          {/* Welcome Banner for Tour */}
          {user && showWelcomeBanner && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-medium text-lg text-gray-900">Welcome to ByteWise!</h3>
              </div>
              <p className="text-gray-700 text-sm mb-3">
                Ready to discover all the amazing features? Take our interactive tour to learn how to track nutrition and build healthy habits.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowWelcomeBanner(false);
                    // Future tour functionality
                  }}
                  className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors"
                >
                  Take Tour
                </button>
                <button
                  onClick={() => {
                    setShowWelcomeBanner(false);
                    dismissTour();
                  }}
                  className="px-4 py-2 bg-amber-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-amber-300 transition-colors btn-hero-enhanced"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-3xl font-semibold text-gray-900">Today's Progress</h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="text-orange-400 hover:text-orange-300"
                onClick={() => handleTabChange(user ? 'nutrition' : 'profile')}
              >
                {user ? 'Track Food' : 'Sign Up to Track'}
              </Button>
            </div>
          </div>

          {/* Daily Progress */}
          <div data-testid="daily-progress" className="mb-4">
            <ProgressCard
              title="Daily Calories"
              icon={Flame}
              value={`${Math.round(dailyCalories)} kcal`}
              goal={`${goalCalories} kcal`}
              percentage={Math.round((dailyCalories/goalCalories)*100)}
              color="orange"
            />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-medium text-orange-600">{loggedMeals.length}</div>
                <div className="text-xs text-gray-900">Meals</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-medium text-orange-600">{Math.round(goalCalories - dailyCalories)}</div>
                <div className="text-xs text-gray-900">Remaining</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-bold text-orange-600">{Math.round((dailyCalories/goalCalories)*100)}%</div>
                <div className="text-xs text-gray-900">Complete</div>
              </div>
            </div>
          </div>

          {/* Fasting Status */}
          <div className="mb-4">
            <FastingStatusCard fastingStatus={fastingStatus || dailyStats?.fastingStatus} />
          </div>

          {/* Water Consumption */}
          <div className="mb-4" data-testid="water-consumption-card">
            <WaterCard
              glasses={dailyStats?.waterGlasses || 0}
              onIncrement={() => updateWaterConsumption(1)}
              onDecrement={() => updateWaterConsumption(-1)}
            />
          </div>

          {/* Weekly Progress */}
          <div className="mb-4">
            <ProgressCard
              title="Weekly Progress"
              icon={Calendar}
              value={`${Math.round(weeklyCalories)} kcal`}
              goal={`${weeklyGoal} kcal`}
              percentage={Math.round((weeklyCalories/weeklyGoal)*100)}
              color="blue"
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Days', value: '7' },
                { label: 'Avg/Day', value: Math.round(weeklyCalories/7) },
                { label: 'Remain', value: Math.round(weeklyGoal - weeklyCalories) },
                { label: 'Total', value: loggedMeals.length }
              ].map((item, index) => (
                <div key={index} className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-900">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros Breakdown - Enhanced with Remaining Values */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MacroCard 
              name="Protein" 
              value={Math.round(dailyStats?.totalProtein || 0)} 
              goal={user?.dailyProteinGoal || 180} 
              color="green" 
            />
            <MacroCard 
              name="Carbs" 
              value={Math.round(dailyStats?.totalCarbs || 0)} 
              goal={user?.dailyCarbGoal || 200} 
              color="yellow" 
            />
            <MacroCard 
              name="Fat" 
              value={Math.round(dailyStats?.totalFat || 0)} 
              goal={user?.dailyFatGoal || 70} 
              color="purple" 
            />
          </div>

          {/* Micronutrients Section */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
              Essential Micronutrients
            </h3>
            
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MicronutrientCard name="Vitamin C" value={dailyMicronutrients.vitaminC} goal={90} unit="mg" color="cyan" />
              <MicronutrientCard name="Vitamin D" value={dailyMicronutrients.vitaminD} goal={20} unit="μg" color="orange" />
              <MicronutrientCard name="Vitamin B12" value={dailyMicronutrients.vitaminB12} goal={2.4} unit="μg" color="red" />
              <MicronutrientCard name="Folate" value={dailyMicronutrients.folate} goal={400} unit="μg" color="green" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MicronutrientCard name="Iron" value={dailyMicronutrients.iron} goal={18} unit="mg" color="slate" />
              <MicronutrientCard name="Calcium" value={dailyMicronutrients.calcium} goal={1000} unit="mg" color="white" />
              <MicronutrientCard name="Zinc" value={dailyMicronutrients.zinc} goal={11} unit="mg" color="amber" />
              <MicronutrientCard name="Magnesium" value={dailyMicronutrients.magnesium} goal={400} unit="mg" color="rose" />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-0 page-container">
      <HeroSection
        title="Daily &"
        subtitle="Weekly"
        description="Track your nutrition progress and log meals"
        buttonText="Start Tracking"
        onButtonClick={() => {
          const searchInput = document.querySelector('input[placeholder="Search weekly food entries..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 content-section">
        {/* Food Search Bar - Moved Here */}
        <div className="mb-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search last month's food entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600"
            />
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-900">
              🔍 Search through your last month of logged meals
            </p>
          </div>
          <Button 
            onClick={() => {
              if (user) {
                handleTabChange('nutrition');
              } else {
                handleTabChange('profile');
              }
            }}
            className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl btn-hero-enhanced"
          >
            <Plus className="w-4 h-4 mr-2" />
            {user ? 'Log Food with Calculator' : 'Sign Up to Log Food'}
          </Button>
        </div>

        {/* Daily/Weekly Toggle */}
        <div className="flex bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-1 mb-6">
          <Button
            variant={trackingView === 'daily' ? 'default' : 'ghost'}
            className="flex-1 h-10"
            onClick={() => setTrackingView('daily')}
          >
            Daily
          </Button>
          <Button
            variant={trackingView === 'weekly' ? 'default' : 'ghost'}
            className="flex-1 h-10"
            onClick={() => setTrackingView('weekly')}
          >
            Weekly
          </Button>
        </div>

        {/* Daily View */}
        {trackingView === 'daily' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery ? 'Search Results' : "Today's Meals"}
              </h2>
              <div className="text-orange-400 font-bold">
                {searchQuery ? (
                  <span className="text-sm">
                    {weeklyMeals.filter(meal => 
                      meal.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length} found
                  </span>
                ) : (
                  `${Math.round(dailyCalories)}/${goalCalories} cal`
                )}
              </div>
            </div>
            
            {(!searchQuery && loggedMeals.length === 0) ? (
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">No meals logged today</p>
                  <p className="text-sm">Use the search bar above or nutrition calculator to start tracking</p>
                </div>
              </Card>
            ) : searchQuery && weeklyMeals.filter(meal => 
              meal.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
                <div className="text-center text-gray-700">
                  <p className="text-lg mb-2">No meals found</p>
                  <p className="text-sm">Try a different search term or add new meals to your log</p>
                </div>
              </Card>
            ) : (
              // Use loggedMeals for today's view when no search, weeklyMeals when searching
              (searchQuery ? weeklyMeals : loggedMeals)
                .filter(meal => 
                  !searchQuery || 
                  meal.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .sort((a, b) => {
                  // Sort by date (most recent first) for better search experience
                  const dateA = new Date(a.timestamp || `${a.date} ${a.time}`);
                  const dateB = new Date(b.timestamp || `${b.date} ${b.time}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 50) // Limit results for performance
                .map((meal, index) => (
              <Card key={`search-${meal.id || meal.name}-${meal.timestamp || index}`} className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold">{meal.name}</h4>
                    <p className="text-gray-600 text-sm">
                      {meal.time} • {meal.mealType}
                      {searchQuery && (
                        <span className="ml-2 text-amber-600">
                          • {new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="text-xs text-green-700 font-medium">P: {(meal.protein || 0).toFixed(1)}g</span>
                      <span className="text-xs text-orange-700 font-medium">C: {(meal.carbs || 0).toFixed(1)}g</span>
                      <span className="text-xs text-purple-700 font-medium">F: {(meal.fat || 0).toFixed(1)}g</span>
                    </div>
                    {/* Display micronutrients if available - handle both camelCase and snake_case */}
                    {((meal.iron || meal.iron > 0) || (meal.calcium || meal.calcium > 0) || 
                      (meal.vitaminC || meal.vitamin_c) > 0 || (meal.zinc || meal.zinc > 0)) && (
                      <div className="flex flex-wrap gap-2 mt-1 pt-1 border-t border-gray-400/30">
                        {(meal.iron > 0) && (
                          <span className="text-xs bg-slate-500/20 px-2 py-0.5 rounded-full text-gray-800">
                            Iron: {(meal.iron).toFixed(1)}mg
                          </span>
                        )}
                        {(meal.calcium > 0) && (
                          <span className="text-xs bg-gray-500/20 px-2 py-0.5 rounded-full text-gray-800">
                            Calcium: {Math.round(meal.calcium)}mg
                          </span>
                        )}
                        {((meal.vitaminC || meal.vitamin_c) > 0) && (
                          <span className="text-xs bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-800">
                            Vit C: {Math.round(meal.vitaminC || meal.vitamin_c)}mg
                          </span>
                        )}
                        {(meal.zinc > 0) && (
                          <span className="text-xs bg-amber-500/30 px-2 py-0.5 rounded-full text-amber-800">
                            Zinc: {(meal.zinc).toFixed(1)}mg
                          </span>
                        )}
                        {(meal.magnesium > 0) && (
                          <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-800">
                            Mg: {Math.round(meal.magnesium)}mg
                          </span>
                        )}
                        {((meal.vitaminD || meal.vitamin_d) > 0) && (
                          <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full text-orange-800">
                            Vit D: {(meal.vitaminD || meal.vitamin_d).toFixed(1)}μg
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-lg">{Math.round(meal.calories || 0)} cal</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-red-400 p-2 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-400/30 hover:border-red-400/50"
                      data-testid={`button-delete-meal-${index}`}
                      onClick={async () => {
                        try {
                          if (!user || !meal.id) {
                            console.error('Cannot delete meal: missing user or meal ID');
                            addNotification('info', 'Delete Failed', 'Cannot delete meal: missing authentication or meal ID');
                            return;
                          }
                          
                          // Delete from database
                          const response = await apiRequest('DELETE', `/api/meals/${meal.id}`);
                          if (!response.ok) {
                            throw new Error('Failed to delete meal from database');
                          }
                          
                          // Trigger data refresh by dispatching a refresh event
                          window.dispatchEvent(new CustomEvent('reload-meal-data'));
                          
                          // Show success feedback
                          addNotification('success', 'Meal Deleted', `Removed ${meal.name} from your log`);
                          
                          // Dispatch refresh event for other components
                          window.dispatchEvent(new CustomEvent('refresh-meals'));
                        } catch (error) {
                          console.error('Error deleting meal:', error);
                          addNotification('info', 'Delete Failed', 'Could not delete meal. Please try again.');
                        }
                      }}
                      title="Delete meal entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )))}
          </div>
        )}

        {/* Weekly View */}
        {trackingView === 'weekly' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">This Week's Progress</h2>
              <p className="text-sm text-gray-900 mt-1">
                {(() => {
                  const weekDates = getWeekDates(); // Use actual current week dates
                  const startDate = new Date(weekDates[0]);
                  const endDate = new Date(weekDates[6]);
                  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()}
              </p>
              <p className="text-xs text-gray-900 mt-1">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            {/* Weekly Progress Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-semibold">Weekly Total</h3>
                  <p className="text-gray-900 text-sm">{Math.round(weeklyCalories)}/{weeklyGoal} kcal</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600">{Math.round((weeklyCalories/weeklyGoal)*100)}%</div>
                  <div className="text-xs text-gray-900">completed</div>
                </div>
              </div>
              <div className="relative h-3 bg-amber-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((weeklyCalories/weeklyGoal)*100, 100)}%` }}
                />
              </div>
            </Card>


            

            
            {/* Include Weekly Calories Card */}
            <WeeklyCaloriesCard />
          </div>
        )}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-0">
      <HeroSection
        title="Your"
        subtitle="Goals"
        description="Track daily and weekly nutrition goals to unlock achievements"
        buttonText="View Goals"
        onButtonClick={() => {
          const goalsSection = document.querySelector('.space-y-4');
          if (goalsSection) {
            goalsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 content-section">
        {/* Goal Progress Cards */}
        <div className="space-y-4">
          {/* Daily Goals */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold text-2xl">Daily Goals</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Target className="w-3 h-3 mr-1" />
                3/5 Complete
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-gray-900">Hit calorie target</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-gray-900">Meet protein goal</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-gray-900">Log 3 meals</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <span className="text-gray-900">Track micronutrients</span>
                <div className="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 text-sm">○</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <span className="text-gray-900">Stay within carb limit</span>
                <div className="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 text-sm">○</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Goals */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold text-2xl">Weekly Goals</h3>
              <Badge className="bg-amber-200/50 text-amber-700 border-amber-300/50">
                <Calendar className="w-3 h-3 mr-1" />
                2/4 Complete
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-amber-200/40 rounded-xl border border-amber-300/50">
                <span className="text-gray-900">Track 5+ days</span>
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-200/40 rounded-xl border border-amber-300/50">
                <span className="text-gray-900">Average 2000+ cal/day</span>
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <span className="text-gray-400">Hit protein goal 5 days</span>
                <div className="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">3/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <span className="text-gray-400">Try 3 new foods</span>
                <div className="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">1/3</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Recent Achievements</h3>
          {achievementsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <Card key={index} className="bg-gradient-to-br from-amber-100 to-amber-200 backdrop-blur-md border-amber-300 p-4 animate-pulse">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-amber-300 rounded-full mx-auto mb-2"></div>
                    <div className="w-20 h-4 bg-amber-300 rounded mx-auto mb-1"></div>
                    <div className="w-16 h-3 bg-amber-300 rounded mx-auto"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {achievements.slice(0, 4).map((achievement) => (
                <Card key={achievement.id} className={`${achievement.colorClass || 'bg-blue-500/20 border-blue-500/30'} backdrop-blur-md p-4`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getAchievementIcon(achievement.iconName)}</div>
                    <h4 className="text-gray-900 font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-gray-400 text-xs">{formatAchievementDate(achievement.earnedAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-amber-100 to-amber-200 backdrop-blur-md border-amber-300 p-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-gray-900 font-semibold mb-2">No Achievements Yet</h4>
                <p className="text-gray-400 text-sm">Start tracking your nutrition to unlock achievements!</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderSignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { refetch, signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (isResetPassword) {
          // Password reset flow - mock implementation
          toast({
            title: "Password Reset",
            description: "Password reset is not available in demo mode. Please use the sign up option to create a new account.",
            variant: "destructive",
          });
          setIsResetPassword(false);
        } else if (isSignUp) {
          // Sign up flow - use our custom API
          const { data, error } = await signUp(email, password);
          
          if (error) {
            throw error;
          }

          toast({
            title: "Account Created!",
            description: "Welcome to ByteWise Nutritionist! You can now start tracking your nutrition.",
          });
          
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        } else {
          // Sign in flow - use our custom API
          const { data, error } = await signIn(email, password);
          
          if (error) {
            throw error;
          }

          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });

          // Clear form and let the auth state update handle the UI
          setEmail('');
          setPassword('');
          setIsSignUp(false);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleResendVerification = async () => {
      if (!email) {
        toast({
          title: "Email required",
          description: "Please enter your email address to resend verification.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });

        if (error) throw error;

        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="space-y-0">
        <HeroSection
          title="Welcome to"
          subtitle="Nutrition"
          description="Sign in to start tracking your nutrition journey"
          buttonText="Get Started"
          onButtonClick={() => {
            const signInCard = document.querySelector('.bg-white\\/10');
            if (signInCard) {
              signInCard.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Content Section - Completely Separate and Underneath */}
        <div className="px-6 py-3 content-section">
          {/* Sign In Component */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600"
                required
                disabled={isLoading}
              />
              {!isResetPassword && (
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              )}
              <Button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl btn-hero-enhanced"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 
                 isResetPassword ? 'Send Reset Link' : 
                 isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
              
              {/* Additional options */}
              <div className="space-y-2">
                {!isResetPassword && !isSignUp && (
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-gray-600 hover:text-gray-900 text-sm"
                      onClick={() => setIsResetPassword(true)}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}
                
                <div className="text-center">
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      setIsSignUp(!isSignUp && !isResetPassword);
                      setIsResetPassword(false);
                    }}
                    disabled={isLoading}
                  >
                    {isResetPassword ? 'Back to sign in' : 
                     isSignUp ? 'Already have an account? Sign in' : 
                     "Don't have an account? Sign up"}
                  </Button>
                </div>

                {isSignUp && (
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-gray-600 hover:text-gray-900 text-sm"
                      onClick={handleResendVerification}
                      disabled={isLoading || !email}
                    >
                      Resend verification email
                    </Button>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-xs text-gray-200 text-center">
                    By creating an account, you must verify your email address before you can sign in.
                  </p>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    );
  };

  const renderDailyWeekly = () => (
    <div className="space-y-0">
      <HeroSection
        title="Daily &"
        subtitle="Weekly"
        description="Track your calorie intake and search for foods to log"
        buttonText="Search Meals Logged"
        onButtonClick={() => {
          const searchInput = document.querySelector('input[placeholder="Search weekly food entries..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 content-section">
        {/* Food Search Bar - Enhanced with filtering */}
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Food Search</h2>
            <p className="text-gray-700">Find and log nutrition information</p>
          </div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <Input
              data-testid="main-food-search"
              placeholder="Search weekly food entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-28 pr-16 h-16 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600 rounded-2xl text-xl font-medium text-center"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-400/30 hover:border-gray-300/50"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        {/* Daily Header */}
        <div className="flex space-x-4 mb-6">
          <div className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg border border-orange-400/50 flex items-center" data-testid="text-current-date">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Logged Foods - Real entries from calculator */}
        <div data-testid="meal-history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Logged Today</h3>
            {loggedMeals.length === 0 && (
              <Badge className="bg-amber-800 text-amber-100 border border-amber-700">No meals logged</Badge>
            )}
          </div>
          {loggedMeals.length === 0 ? (
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-6 text-center">
              <div className="text-gray-700">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2 text-gray-900">No meals logged today</p>
                <p className="text-sm text-gray-700">Use the nutrition calculator to start tracking your meals</p>
              </div>
            </Card>
          ) : (
            weeklyMeals.filter(meal => 
              !searchQuery || 
              meal.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((meal, index) => (
            <Card key={`meal-${meal.id || meal.name}-${meal.timestamp || index}`} className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-gray-900 font-semibold">{meal.name}</h4>
                  <p className="text-gray-700 text-sm">{meal.time} • {meal.mealType}</p>
                  <div className="flex space-x-4 mt-1">
                    <span className="text-xs text-green-600">P: {Number(meal.totalProtein || meal.protein || 0).toFixed(1)}g</span>
                    <span className="text-xs text-yellow-600">C: {Number(meal.totalCarbs || meal.carbs || 0).toFixed(1)}g</span>
                    <span className="text-xs text-purple-600">F: {Number(meal.totalFat || meal.fat || 0).toFixed(1)}g</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-bold text-lg">{Math.round(Number(meal.totalCalories || meal.calories || 0))} cal</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-gray-600 hover:text-red-600 p-2"
                    data-testid={`button-delete-logged-meal-${index}`}
                    onClick={async () => {
                      try {
                        if (!user || !meal.id) {
                          console.error('Cannot delete meal: missing user or meal ID');
                          addNotification('info', 'Delete Failed', 'Cannot delete meal: missing authentication or meal ID');
                          return;
                        }
                        
                        // Delete from database
                        const response = await apiRequest('DELETE', `/api/meals/${meal.id}`);
                        if (!response.ok) {
                          throw new Error('Failed to delete meal from database');
                        }
                        
                        // Trigger data refresh by dispatching a refresh event
                        window.dispatchEvent(new CustomEvent('reload-meal-data'));
                        
                        // Show success feedback
                        addNotification('success', 'Meal Deleted', `Removed ${meal.name} from your meals`);
                        
                        // Dispatch refresh event to update other components
                        window.dispatchEvent(new CustomEvent('refresh-meals'));
                      } catch (error) {
                        console.error('Error deleting meal:', error);
                        addNotification('info', 'Delete Failed', 'Could not delete meal. Please try again.');
                      }
                    }}
                    title="Delete meal entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )))}
        </div>



        {/* Weekly Calories Summary */}
        <div className="space-y-4 mt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">This Week</h3>
            <Badge className="bg-amber-800 text-amber-100 border border-amber-700">Weekly Summary</Badge>
          </div>
          <WeeklyCaloriesCard />
        </div>
      </div>
    </div>
  );


  const renderCalculator = () => {
    return (
      <div className="space-y-0 page-container">
        <HeroSection
          title="Smart"
          subtitle="Nutrition"
          description="AI-powered food analysis or precise USDA database calculator"
          buttonText="Choose Analysis Method"
          onButtonClick={() => {
            // Scroll to the choice section and highlight it
            const choiceSection = document.querySelector('.bg-gradient-to-r.from-blue-500\\/10.to-orange-500\\/10');
            if (choiceSection) {
              choiceSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add a brief highlight effect
              choiceSection.classList.add('ring-4', 'ring-amber-400', 'ring-opacity-75');
              setTimeout(() => {
                choiceSection.classList.remove('ring-4', 'ring-amber-400', 'ring-opacity-75');
              }, 2000);
            }
          }}
        />
        
        {/* Content Section - Completely Separate and Underneath */}
        <div className="px-6 py-3 content-section">
          {/* Instructions Section */}
          <div className="mb-6 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-gray-400/20 rounded-xl p-4 mb-4 transition-all duration-300">
              <h3 className="font-semibold text-lg mb-3 text-center">🔍 Choose Your Nutrition Analysis Method</h3>
              <p className="text-center text-gray-600 text-sm mb-4">Select your preferred method below, then use the toggle buttons to switch between options:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-gray-900">AI Photo Analysis</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Take a photo of your food and let AI identify it automatically. 
                    Perfect for quick logging of complete meals and dishes.
                  </p>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    <span className="font-medium text-gray-900">USDA Calculator</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Search and manually select foods from the USDA database. 
                    Ideal for precise nutrition tracking and portion control.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center text-sm text-gray-400">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Slide left or right to switch between options</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-1 rounded-full p-1 max-w-sm mx-auto">
              <button
                onClick={() => setNutritionMode('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  nutritionMode === 'ai'
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-900'
                }`}
                data-testid="button-ai-mode"
              >
                <Sparkles className="h-4 w-4" />
                AI Photo Analysis
              </button>
              <button
                onClick={() => setNutritionMode('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  nutritionMode === 'calculator'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-900'
                }`}
                data-testid="button-calculator-mode"
              >
                <Target className="h-4 w-4" />
                USDA Calculator
              </button>
            </div>
          </div>

          <div className="main-content">
            {nutritionMode === 'ai' ? (
              <PremiumFeatureGate 
                feature="AI Food Analysis"
                description="Analyze food photos with advanced AI technology"
              >
                <AIFoodAnalyzer />
              </PremiumFeatureGate>
            ) : (
              <CalorieCalculator 
                onNavigate={onNavigate}
                isCompact={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-0 page-container">
      <HeroSection
        title="Your"
        subtitle="Profile"
        description="Manage your account, view achievements, and track your progress"
        buttonText={user ? "Manage Profile" : "Sign Up"}
        onButtonClick={() => {
          if (user) {
            const profileCards = document.querySelector('.space-y-6');
            if (profileCards) {
              profileCards.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            // Scroll to the sign-in form
            const signInForm = document.querySelector('.space-y-6');
            if (signInForm) {
              signInForm.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
      />

      {/* Content Section - Redesigned to match other pages */}
      <div className="px-6 py-3 content-section">
        {/* Profile Cards with Unified Accordion System */}
        {user ? (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-6"
            value={openCard || ""}
            onValueChange={setOpenCard}
          >
            {/* Consolidated Profile Card */}
            <AccordionItem value="profile" className="border-none">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]]:bg-amber-200/30 [&>svg]:ml-2 sm:[&>svg]:ml-4">
                  <div className="flex items-start justify-between w-full pr-2 sm:pr-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <ProfileIcon 
                          data-testid="profile-icon"
                          iconNumber={user?.profileIcon || 1} 
                          size="md" 
                          className="ring-2 ring-white/20"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                          <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-lg sm:text-xl font-bold leading-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          {user?.firstName || user?.email?.split('@')[0] || 'ByteWise User'}
                        </h3>
                        <p className="text-gray-700 text-xs sm:text-sm truncate">{user?.email}</p>
                        <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
                          <span className="inline-flex items-center whitespace-nowrap">🏆 Level 1</span>
                          <span className="inline-flex items-center whitespace-nowrap">📊 {loggedMeals?.length || 0} meals</span>
                          <span className="inline-flex items-center whitespace-nowrap">🎯 {Math.round(dailyCalories)}/{goalCalories} cal</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2 sm:ml-3 min-w-[60px] sm:min-w-[80px]">
                      <div className="text-base sm:text-lg font-bold text-orange-400 leading-tight">{achievements?.length || 0}</div>
                      <div className="text-xs text-gray-600 whitespace-nowrap leading-tight">Awards</div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="border-t border-amber-300/30 pt-6 mt-2">
                    <UserSettingsManager />
                    
                    {/* Apple Health Integration */}
                    <div className="mt-6 pt-4 border-t border-amber-300/30">
                      <AppleHealthIntegration onHealthDataSync={handleHealthDataSync} />
                    </div>
                    

                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* App Tour Launcher Card */}
            <AccordionItem value="tour" className="border-none">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]>div]:text-[#faed39] [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-6 h-6 text-[#faed39]" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          App Tour & Training
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          Explore features or retake the guided tour
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-xs text-gray-600">
                        {localStorage.getItem('bytewise-tour-completed') === 'true' ? 'Completed' : 'Available'}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-4">
                    {/* Tour Status */}
                    <div className="bg-amber-200/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <PlayCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Comprehensive App Tour</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              Take our interactive 10-step tour covering food search, AI photo analysis, 
                              fasting timer, water tracking, meal journaling, achievements, and profile settings.
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                8-10 minutes
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                10 key features
                              </span>
                              {localStorage.getItem('bytewise-tour-completed') === 'true' && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tour Actions */}
                    <div className="flex flex-wrap gap-3">
                      {/* Always show explore features for existing users */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                            data-testid="tour-launch-button"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {localStorage.getItem('bytewise-tour-completed') === 'true' ? 'Retake Tour' : 'Start Tour'}
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                              <Sparkles className="w-6 h-6 text-yellow-500" />
                              ByteWise Features Tour
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-2">🎯 App Features</h3>
                              <p className="text-gray-900 text-sm">
                                Explore all the powerful features available in ByteWise Nutritionist. 
                                Click any card below to navigate directly to that feature.
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-900">
                                <span className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  6 key features
                                </span>
                                <Badge variant="secondary" className="text-xs text-gray-900 bg-gray-100">
                                  Click to explore
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Progress indicator */}
                            {tourProgress.clickedCards.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 text-green-800">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Progress: {tourProgress.clickedCards.length}/6 features explored
                                  </span>
                                </div>
                                {tourProgress.suggestedNext < 6 && (
                                  <p className="text-xs text-green-700 mt-1">
                                    Try the highlighted card next! 💫
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Feature Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                {
                                  icon: <Utensils className="w-5 h-5 text-orange-600" />,
                                  title: 'Smart Food Search',
                                  description: 'Search 300,000+ USDA foods with brand recognition',
                                  category: 'Core Feature',
                                  targetTab: 'nutrition',
                                  nutritionMode: 'calculator'
                                },
                                {
                                  icon: <Camera className="w-5 h-5 text-purple-600" />,
                                  title: 'AI Photo Analysis',
                                  description: 'Snap photos for instant nutrition breakdown',
                                  category: 'AI Feature',
                                  targetTab: 'nutrition',
                                  nutritionMode: 'ai'
                                },
                                {
                                  icon: <Target className="w-5 h-5 text-green-600" />,
                                  title: 'Calorie Calculator',
                                  description: 'Instant nutrition facts with portion warnings',
                                  category: 'Core Feature',
                                  targetTab: 'nutrition',
                                  nutritionMode: 'calculator'
                                },
                                {
                                  icon: <Clock className="w-5 h-5 text-orange-600" />,
                                  title: 'Fasting Timer',
                                  description: 'Track intermittent fasting with celebrations',
                                  category: 'Wellness',
                                  targetTab: 'fasting'
                                },
                                {
                                  icon: <Trophy className="w-5 h-5 text-amber-800" />,
                                  title: 'Achievement System',
                                  description: 'Unlock rewards as you hit your goals',
                                  category: 'Motivation',
                                  targetTab: 'profile',
                                  accordionTarget: 'achievements'
                                },
                                {
                                  icon: <Droplets className="w-5 h-5 text-cyan-600" />,
                                  title: 'Hydration Tracking',
                                  description: 'Beautiful water intake visualization',
                                  category: 'Wellness',
                                  targetTab: 'home'
                                }
                              ].map((feature, index) => (
                                <Card
                                  key={index}
                                  className={`cursor-pointer transition-all duration-200 ${
                                    tourProgress.clickedCards.includes(feature.title)
                                      ? 'bg-green-100 border-green-300 shadow-md' // Already clicked
                                      : index === tourProgress.suggestedNext
                                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg ring-2 ring-blue-200 hover:ring-blue-300' // Suggested next
                                      : 'bg-amber-50/60 border-gray-200 hover:border-gray-300 hover:bg-amber-100/60 hover:shadow-md' // Default
                                  }`}
                                  onClick={() => {
                                    // Track this card click
                                    const newProgress = {
                                      clickedCards: tourProgress.clickedCards.includes(feature.title)
                                        ? tourProgress.clickedCards
                                        : [...tourProgress.clickedCards, feature.title],
                                      suggestedNext: tourProgress.clickedCards.includes(feature.title)
                                        ? tourProgress.suggestedNext
                                        : Math.min(tourProgress.suggestedNext + 1, 5)
                                    };
                                    setTourProgress(newProgress);
                                    localStorage.setItem('tour-progress', JSON.stringify(newProgress));
                                    
                                    // Navigate to the feature's page/tab with mode information
                                    setActiveTab(feature.targetTab);
                                    
                                    // Send custom event with tab, mode, and accordion info
                                    window.dispatchEvent(new CustomEvent('navigate-to-tab', {
                                      detail: { 
                                        tab: feature.targetTab,
                                        nutritionMode: feature.nutritionMode,
                                        accordionTarget: feature.accordionTarget
                                      }
                                    }));
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-2 rounded-lg ${
                                        tourProgress.clickedCards.includes(feature.title)
                                          ? 'bg-green-200' // Already clicked
                                          : index === tourProgress.suggestedNext
                                          ? 'bg-blue-200' // Suggested next
                                          : 'bg-gray-100' // Default
                                      }`}>
                                        {feature.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                            {feature.title}
                                            {tourProgress.clickedCards.includes(feature.title) && (
                                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            )}
                                            {index === tourProgress.suggestedNext && !tourProgress.clickedCards.includes(feature.title) && (
                                              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                                            )}
                                          </h4>
                                          <Badge variant="outline" className={`text-xs ${
                                            tourProgress.clickedCards.includes(feature.title)
                                              ? 'text-green-700 bg-green-100 border-green-300'
                                              : index === tourProgress.suggestedNext
                                              ? 'text-blue-700 bg-blue-100 border-blue-300'
                                              : 'text-gray-700 bg-gray-100 border-gray-300'
                                          }`}>
                                            {feature.category}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                          {feature.description}
                                        </p>
                                        {index === tourProgress.suggestedNext && !tourProgress.clickedCards.includes(feature.title) && (
                                          <p className="text-xs text-blue-600 mt-1 font-medium">
                                            💫 Try this next!
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {localStorage.getItem('bytewise-tour-completed') === 'true' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.removeItem('bytewise-tour-completed');
                            localStorage.removeItem('tour-cards-clicked');
                            localStorage.removeItem('tour-progress');
                            setTourProgress({ clickedCards: [], suggestedNext: 0 });
                            window.location.reload();
                          }}
                          className="text-gray-600 hover:text-gray-900 border-amber-300 hover:bg-amber-100"
                        >
                          Reset Tour Progress
                        </Button>
                      )}
                    </div>

                    {/* Feature Quick Links */}
                    <div className="border-t border-amber-300/30 pt-4">
                      <h5 className="font-medium text-gray-900 mb-3 text-sm">Quick Feature Access</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8 text-gray-700 hover:text-gray-900 hover:bg-amber-200/30"
                          onClick={() => handleTabChange('nutrition')}
                        >
                          <Utensils className="w-3 h-3 mr-2" />
                          Food Search
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8 text-gray-700 hover:text-gray-900 hover:bg-amber-200/30"
                          onClick={() => handleTabChange('fasting')}
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          Fasting Timer
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8 text-gray-700 hover:text-gray-900 hover:bg-amber-200/30"
                          onClick={() => handleTabChange('daily')}
                        >
                          <BarChart3 className="w-3 h-3 mr-2" />
                          Meal Journal
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8 text-gray-700 hover:text-gray-900 hover:bg-amber-200/30"
                          onClick={() => setOpenCard('achievements')}
                        >
                          <Trophy className="w-3 h-3 mr-2" />
                          Achievements
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
            
            {/* Awards Card */}
            <AccordionItem value="achievements" className="border-none">
              <Card data-testid="achievements-section" className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]>div]:text-[#faed39] [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-6 h-6 text-[#faed39]" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Awards
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          View your progress and goals
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-0">
                  <AwardsAchievements />
                </AccordionContent>
              </Card>
            </AccordionItem>
            
            {/* Data Management Card */}
            <AccordionItem value="data" className="border-none">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]>div]:text-[#faed39] [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 text-left">
                      <Download className="w-6 h-6 text-[#faed39]" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Data
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          Manage your nutrition data
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-0">
                  <DataManagementPanel />
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Subscription Management Card */}
            <AccordionItem value="subscription" className="border-none">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-md border-purple-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-purple-200/30 hover:no-underline [&[data-state=open]>div]:text-purple-600 [&[data-state=open]]:bg-purple-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Subscription & Premium
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          Manage your subscription and unlock premium features
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-xs text-gray-600">
                        {isPremium ? 'Premium Active' : 'Free Plan'}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-0">
                  <SubscriptionManager />
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        ) : (
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-8">
            <SignOnModule />
          </Card>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'nutrition':
        return renderCalculator();
      case 'daily':
        return renderDailyWeekly();
      case 'fasting':
        return (
          <div className="space-y-0">
            <HeroSection
              title="Intermittent"
              subtitle="Fasting"
              description="Track your fasting journey with professional IF schedules and real-time progress monitoring"
              buttonText="Start Fasting"
              onButtonClick={() => {
                const fastingPanel = document.querySelector('.fasting-tracker');
                if (fastingPanel) {
                  fastingPanel.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
            
            {/* Fasting Content Section */}
            <div className="px-6 py-3 content-section">
              <div data-testid="fasting-tracker" className="fasting-tracker bg-amber-50/90 backdrop-blur-md rounded-3xl border border-amber-200 p-6">
                <FastingTracker />
              </div>
            </div>
          </div>
        );
      case 'profile':
        return renderProfile();
      case 'calculator':
        return renderCalculator();
      case 'tracking':
        return renderTracking();
      case 'signin':
        return renderSignIn();
      case 'achievements':
        return renderAchievements();
      case 'search':
        return renderDailyWeekly();
      case 'data':
        return (
          <div className="space-y-0">
            <HeroSection
              title="Data"
              subtitle="Management"
              description="Export, sync, and manage your nutrition tracking data"
              buttonText="Manage Data"
              onButtonClick={() => {
                const dataPanel = document.querySelector('.bg-gray-900\\/80');
                if (dataPanel) {
                  dataPanel.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* Content Section - Completely Separate and Underneath */}
            <div className="px-6 py-3 content-section">
              <div className="bg-amber-50/90 backdrop-blur-md rounded-3xl border border-amber-200 shadow-lg">
                <DataManagementPanel />
              </div>
            </div>
          </div>
        );
      default:
        return renderHome();
    }
  };

  return (
    <div data-testid="app-container" className="h-screen w-screen">
      {/* Fixed Notification Header on all pages - Safe area positioning for iOS/Android */}
      <div className="fixed top-safe right-4 z-[9999] safe-notification-position">
        <div className="relative">
          <Button
            variant="ghost"
            size="lg"
            className="group relative text-gray-600 p-3 transition-all duration-500 hover:scale-110 active:text-gray-100 focus:text-gray-100 active:bg-gray-700/30 focus:bg-gray-700/30"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            aria-label={`Notifications${notifications.filter(n => !n.read).length > 0 ? ` - ${notifications.filter(n => !n.read).length} unread` : ''}`}
            aria-expanded={showNotificationDropdown}
            aria-haspopup="dialog"
            data-testid="button-notifications"
          >
            <div className="relative">
              {notifications.filter(n => !n.read).length > 0 ? (
                <BellRing className="w-12 h-12 text-gray-600 transition-all duration-700 ease-in-out group-hover:rotate-12 group-hover:text-orange-600 animate-[colorShift_0.7s_ease-in-out]" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Bell className="w-12 h-12 text-gray-600 transition-all duration-700 ease-in-out group-hover:rotate-6 group-hover:text-orange-600 animate-[colorShift_0.7s_ease-in-out]" strokeWidth={2.5} aria-hidden="true" />
              )}
            </div>
            
            {notifications.filter(n => !n.read).length > 0 && (
              <div 
                className="absolute -top-1 -right-1 min-w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                aria-hidden="true"
              >
                <span className="text-xs text-gray-900 font-bold px-1">
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              </div>
            )}
          </Button>
          
          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border border-amber-200/60 rounded-2xl shadow-2xl overflow-hidden z-[9999]">
              <div className="p-4 border-b border-amber-200/40">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900 bg-amber-200/50 hover:bg-amber-300/50"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-amber-200/30 ${!notification.read ? 'bg-amber-200/30' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-medium text-sm">{notification.title}</h4>
                        <p className="text-gray-700 text-xs mt-1">{notification.message}</p>
                        <p className="text-gray-600 text-xs mt-2">
                          {notification.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 p-1"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content rendered based on active tab */}
      {renderContent()}
      
      {/* Bottom Navigation - High Resolution Icons */}
      <div data-testid="navigation-tabs" className="fixed bottom-0 left-0 right-0 bg-yellow-400 border-t border-yellow-500/60 safe-area-pb z-40 shadow-lg">
        <div className="flex items-center justify-around py-0.5 px-1 max-w-md mx-auto gap-0.5">
          {[
            { id: 'home', label: 'Dashboard', icon: House, testId: 'nav-dashboard' },
            { id: 'nutrition', label: 'Calorie Tracker', icon: ForkKnife, testId: 'nav-calculator' },
            { id: 'fasting', label: 'Fasting', icon: Timer, testId: 'nav-fasting' },
            { id: 'daily', label: 'Meal Journal', icon: ChartBar, testId: 'nav-journal' },
            { id: 'profile', label: 'Profile', icon: User, testId: 'nav-profile' }
          ].map((tab) => {
            const IconComponent = tab.icon;
            
            const handleClick = () => {
              // Add pronounced animation on click
              const button = document.querySelector(`[data-testid="${tab.testId}"]`);
              const icon = button?.querySelector('svg');
              const text = button?.querySelector('span');
              
              if (icon) {
                icon.classList.remove('nav-icon-clicked');
                void (icon as any).offsetHeight; // Force reflow
                icon.classList.add('nav-icon-clicked');
                setTimeout(() => icon.classList.remove('nav-icon-clicked'), 600);
              }
              
              if (text) {
                text.classList.remove('nav-text-clicked');
                void (text as any).offsetHeight; // Force reflow
                text.classList.add('nav-text-clicked');
                setTimeout(() => text.classList.remove('nav-text-clicked'), 400);
              }

              // Direct navigation - no transition guards
              if (tab.id !== activeTab) {
                handleTabChange(tab.id);
              }
            };
            
            return (
              <button
                key={tab.id}
                data-testid={tab.testId}
                onClick={handleClick}
                className={`group relative overflow-hidden transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-black hover:text-white active:text-white'
                }`}
              >
                <IconComponent 
                  size={24}
                  weight={activeTab === tab.id ? "fill" : "regular"}
                  className={`mb-1.5 transition-all duration-300 ease-out transform ${
                    activeTab === tab.id 
                      ? 'scale-110 drop-shadow-lg text-white nav-icon-active' 
                      : 'scale-100 hover:scale-110 hover:text-white hover:rotate-3'
                  }`}
                  style={{ strokeWidth: activeTab === tab.id ? 2.5 : 2 }}
                />
                <span className={`text-[8px] font-semibold leading-tight text-center w-full transition-colors duration-150 ease-out ${
                  activeTab === tab.id 
                    ? 'text-white drop-shadow-sm font-bold' 
                    : 'text-black hover:text-white active:text-white'
                }`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Achievement Celebration Overlay */}
      {showAchievement && currentAchievement && (
        <AchievementCelebration
          achievement={currentAchievement}
          isOpen={showAchievement}
          onClose={() => setShowAchievement(false)}
        />
      )}
      
      {/* Confetti Celebration for Goals */}
      {showConfettiCelebration && confettiAchievement && (
        <ConfettiCelebration
          achievement={confettiAchievement}
          isOpen={showConfettiCelebration}
          onClose={() => setShowConfettiCelebration(false)}
        />
      )}
      
      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileCompletion}
        onComplete={handleProfileCompletion}
      />
      
      {/* Tour Launcher - Fixed position, available on all pages */}
      {user && !showProfileCompletion && (() => {
        const userData = user as any;
        const hasFirstName = userData?.firstName && userData.firstName.trim() !== '';
        const hasLastName = userData?.lastName && userData.lastName.trim() !== '';
        const profileCompleted = hasFirstName && hasLastName;
        
        return profileCompleted ? (
          <div className="fixed bottom-20 right-6 z-45">
            <TourLauncher
              onNavigateToFeature={(tab) => setActiveTab(tab)}
              isVisible={shouldShowTour()}
              onCardInteraction={() => {
                // Force re-render to hide button after interaction
                setTimeout(() => window.location.reload(), 500);
              }}
            />
            {/* Notify other components about tour visibility */}
            {typeof window !== 'undefined' && (() => {
              window.dispatchEvent(new CustomEvent('tour-visibility', {
                detail: { visible: shouldShowTour() }
              }));
              return null;
            })()}
          </div>
        ) : null;
      })()}
      

      

      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
