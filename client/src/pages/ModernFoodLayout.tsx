/**
 * Modern Food App Layout - Inspired by Deliveroo, Chipotle, and premium food apps
 * Features: Hero sections, food cards, nutrition breakdown, and modern navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CalorieCalculator from '@/components/CalorieCalculator';
import { UserSettingsManager } from '@/components/UserSettingsManager';
import { SignOnModule } from '@/components/SignOnModule';
import { useAuth } from '@/hooks/useAuth';
import { DataManagementPanel } from '@/components/DataManagementPanel';
import { AchievementCelebration } from '@/components/AchievementCelebration';
import { AwardsAchievements } from '@/components/AwardsAchievements';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import { FastingTracker } from '@/components/FastingTracker';
import { FastingStatusCard } from '@/components/FastingStatusCard';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { useAchievements, getAchievementIcon, formatAchievementDate } from '@/hooks/useAchievements';
import { ProfileIcon } from '@/components/ProfileIcon';
import { TourLauncher, useAppTour } from '@/components/TourLauncher';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, 
  Plus,
  ChevronRight,
  Flame,
  Target,
  Trophy,
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
  ArrowRight
} from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { WeeklyCaloriesCard } from '@/components/WeeklyCaloriesCard';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getWeekDates, getLocalDateKey, getMealTypeByTime, formatLocalTime } from '@/utils/dateUtils';
import { fixMealDateMismatches } from '@/utils/mealDateFixer';
import { getCachedLocalStorage, debounce } from '@/utils/performanceUtils';
import { useLocation } from 'wouter';
import AIFoodAnalyzer from './AIFoodAnalyzer';
import { AppleHealthIntegration } from '../components/AppleHealthIntegration';
import { healthKitService } from '../services/healthKit';


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
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const [openCard, setOpenCard] = useState<string | undefined>(undefined);
  const { backgroundImage, animationKey } = useRotatingBackground(activeTab);
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
  const [dailyMacros, setDailyMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
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
  // Water consumption update function
  const updateWaterConsumption = useCallback(async (change: number) => {
    if (!user) {
      // Update localStorage for unauthenticated users
      const localStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
      const currentGlasses = (localStats.waterGlasses || 0) + change;
      const newGlasses = Math.max(0, currentGlasses);
      
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
      }
      
      // Auto-sync to Apple Health if enabled
      syncHealthDataIfEnabled().catch(console.error);
      
      return;
    }
    
    try {
      const currentGlasses = (dailyStats?.waterGlasses || 0) + change;
      const newGlasses = Math.max(0, currentGlasses); // Prevent negative values
      
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
        
        console.log('✅ Manual health data sync completed');
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
      return {
        vitaminC: totals.vitaminC + (meal.vitaminC || 0),
        vitaminD: totals.vitaminD + (meal.vitaminD || 0),
        vitaminB12: totals.vitaminB12 + (meal.vitaminB12 || 0),
        folate: totals.folate + (meal.folate || 0),
        iron: totals.iron + (meal.iron || 0),
        calcium: totals.calcium + (meal.calcium || 0),
        zinc: totals.zinc + (meal.zinc || 0),
        magnesium: totals.magnesium + (meal.magnesium || 0)
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
          console.log('Failed to parse stored session:', parseError);
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
      
      console.log('✅ Profile completion successful:', profileData);
    } catch (error) {
      console.error('❌ Profile completion failed:', error);
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
      const response = await apiRequest('GET', `/api/users/${user.id}/daily-stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch daily stats: ${response.status}`);
      }
      const stats = await response.json();
      setDailyStats(stats);
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
    }
  }, [celebrationAchievement]);

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


  // Refresh micronutrients when tab changes or on mount
  useEffect(() => {
    // Always refresh micronutrients from localStorage
    const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = stored.filter((meal: any) => meal.date === today);
    
    if (todayMeals.length > 0) {
      const micronutrients = calculateMicronutrients(todayMeals);
      setDailyMicronutrients(micronutrients);
    }
  }, [activeTab, calculateMicronutrients]);
  
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
    // Load existing meal data on component mount
    const loadExistingData = () => {
      try {
        // DISABLED: Automatic meal date fixing to prevent meals moving between days
        // Use cached localStorage for better performance
        const stored = getCachedLocalStorage('weeklyMeals', 5000) || [];
        
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
        
        setLoggedMeals(todayMeals);
        setWeeklyMeals(monthlyMeals); // Store last month's meals for comprehensive search functionality
        
        // Calculate daily calories from existing logged meals
        const dailyTotal = todayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        setDailyCalories(dailyTotal);
        
        // Calculate daily macros from today's meals
        const dailyMacroTotals = todayMeals.reduce((totals: any, meal: any) => ({
          protein: totals.protein + (meal.protein || 0),
          carbs: totals.carbs + (meal.carbs || 0),
          fat: totals.fat + (meal.fat || 0)
        }), { protein: 0, carbs: 0, fat: 0 });
        setDailyMacros(dailyMacroTotals);
        
        // Calculate micronutrients from today's meals
        const micronutrients = calculateMicronutrients(todayMeals);
        
        // Update micronutrients state
        setDailyMicronutrients({
          vitaminC: micronutrients.vitaminC || 0,
          vitaminD: micronutrients.vitaminD || 0,
          vitaminB12: micronutrients.vitaminB12 || 0,
          folate: micronutrients.folate || 0,
          iron: micronutrients.iron || 0,
          calcium: micronutrients.calcium || 0,
          zinc: micronutrients.zinc || 0,
          magnesium: micronutrients.magnesium || 0
        });
        
        // Fetch daily stats including fasting status
        if (user) {
          fetchDailyStats();
        }
        
        // Check fasting status from localStorage
        checkFastingStatus();
        
        // Calculate weekly calories from current week's meals only
        const currentWeekDates = getWeekDates(); // Use actual current week
        const weekDateKeys = currentWeekDates.map(date => getLocalDateKey(date));
        
        // Filter meals to only include those from the current week with timestamp parsing
        const currentWeekMeals = stored.filter((meal: any) => {
          // Direct exact match
          if (weekDateKeys.includes(meal.date)) return true;
          
          // Timestamp parsing for ISO format dates
          if (meal.date && meal.date.includes('T')) {
            const extractedDate = meal.date.split('T')[0];
            return weekDateKeys.includes(extractedDate);
          }
          
          return false;
        });
        
        const weeklyTotal = currentWeekMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        setWeeklyCalories(weeklyTotal);
        
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
    
    // Update fasting status every minute
    const fastingInterval = setInterval(() => {
      checkFastingStatus();
    }, 60000); // Check every minute

    // Set up event listeners for future meal logging
    const handleMealLogged = () => {
      try {
        loadExistingData();
        // Don't dispatch circular events - let other components handle their own refresh
      } catch (error) {
        // Handle errors silently to avoid console spam
      }
    };

    // Add event listeners with unique references to avoid conflicts
    const eventsToAdd = [
      { type: 'calories-logged', handler: handleMealLogged },
      { type: 'meal-logged-success', handler: handleMealLogged }
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
      clearInterval(fastingInterval);
    };
  }, [user, fetchDailyStats, calculateMicronutrients, checkFastingStatus]);

  // Food categories inspired by Deliveroo
  const categories = [
    { id: 'popular', name: 'Popular', emoji: '🔥', color: 'bg-red-500' },
    { id: 'healthy', name: 'Healthy', emoji: '🥗', color: 'bg-green-500' },
    { id: 'protein', name: 'Protein', emoji: '🥩', color: 'bg-blue-500' },
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

  // Get animation direction based on tab transition
  const getAnimationDirection = (currentTab: string, prevTab: string) => {
    const tabOrder = ['home', 'nutrition', 'fasting', 'daily', 'profile', 'search', 'tracking', 'achievements', 'data'];
    const currentIndex = tabOrder.indexOf(currentTab);
    const prevIndex = tabOrder.indexOf(prevTab);
    
    if (currentIndex > prevIndex) {
      return 'slide-in-from-right-4';
    } else if (currentIndex < prevIndex) {
      return 'slide-in-from-left-4';
    }
    return 'slide-in-from-bottom-4';
  };

  // Enhanced tab change handler with hero component scroll reset
  const [, setLocation] = useLocation();

  const handleTabChange = (newTab: string) => {
    // Temporarily disable smooth scrolling to force instant scroll
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    // Update state first
    setPreviousTab(activeTab);
    setActiveTab(newTab);
    
    // Function to scroll to hero component
    const scrollToHero = () => {
      // First, try to scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Then look for hero component and scroll to it specifically
      const heroElement = document.querySelector('.hero-component, .relative.h-screen, [data-hero]');
      if (heroElement) {
        heroElement.scrollIntoView({ 
          behavior: 'auto',
          block: 'start',
          inline: 'nearest'
        });
      }
      
      // Final safety scroll to ensure we're at the very top
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    };
    
    // Immediate scroll attempt
    scrollToHero();
    
    // Additional scroll attempts with different timing to ensure consistency
    setTimeout(scrollToHero, 0);
    setTimeout(scrollToHero, 10);
    
    // Wait for content to render, then scroll to hero
    setTimeout(() => {
      scrollToHero();
      
      // Restore smooth scrolling after hero scroll is complete
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
        document.body.style.scrollBehavior = originalScrollBehavior;
      }, 100);
    }, 50);
    
    // Final scroll with requestAnimationFrame for next paint cycle
    requestAnimationFrame(() => {
      scrollToHero();
    });
  };

  // Optimized Hero Section Component with enhanced performance and visuals
  const HeroSection = React.memo(({ title, subtitle, description, buttonText, onButtonClick }: {
    title: string;
    subtitle: string; 
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  }) => {
    // Determine if current page is dashboard
    const isDashboard = activeTab === 'home';
    
    // Memoize the background style to prevent recalculation
    const backgroundStyle = React.useMemo(() => ({
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      willChange: 'transform',
    }), [backgroundImage]);

    return (
      <div className="relative h-screen overflow-hidden hero-component" data-hero="true">
        {/* Optimized Background Layer */}
        <div 
          key={animationKey}
          className="absolute inset-0 z-10 hero-bg-optimized"
          style={backgroundStyle}
        />
        
        {/* CSS-controlled Overlay for consistent opacity */}
        <div className="hero-gradient-overlay" style={{ zIndex: 11 }} />
        
        
        {/* Content Layer with Enhanced Typography */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20 text-white">
          <div className="space-y-8 max-w-2xl">
            {/* Enhanced Title Section */}
            <div className="space-y-3 hero-optimized">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] drop-shadow-2xl animate-fadeInUp [animation-delay:0.9s] font-league-spartan text-optimized">
                {title}
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] animate-fadeInUp [animation-delay:1.1s] font-league-spartan text-optimized">
                {subtitle}
              </h1>
            </div>
            
            {/* Enhanced Description */}
            <p className="text-2xl md:text-3xl font-light leading-relaxed max-w-xl mx-auto drop-shadow-xl animate-fadeInUp [animation-delay:1.3s] font-work-sans text-gray-100">
              {description}
            </p>
            
            {/* Enhanced Call-to-Action */}
            <div className="pt-8 animate-fadeInUp [animation-delay:1.5s]">
              <Button 
                onClick={onButtonClick}
                size="lg"
                className="group relative bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 font-bold px-16 py-6 rounded-full text-xl md:text-2xl shadow-2xl transition-all duration-300 overflow-hidden btn-hero-enhanced"
                style={{ color: '#ffffff !important' }}
              >
                <span className="relative z-10 flex items-center gap-3" style={{ color: '#ffffff !important' }}>
                  {buttonText}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce text-white">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-white" />
            <ChevronRight className="w-6 h-6 rotate-90 drop-shadow-lg" />
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
    <div className="mb-8 cursor-pointer group transition-all duration-300 hover:scale-105" onClick={() => handleTabChange('home')}>
      <div className="text-center font-league-spartan">
        <div className="text-8xl font-black leading-none text-sky-300 mb-2 lowercase tracking-tight drop-shadow-2xl group-hover:text-sky-200 transition-colors duration-300">
          bytewise
        </div>
        <div className="text-2xl font-light text-white/80 uppercase tracking-widest drop-shadow-lg group-hover:text-white/90 transition-colors duration-300">
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
      <Card className="bg-amber-100 border-none p-5 transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-200 shadow-lg hover:shadow-xl" data-testid="progress-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${color}-500/30 rounded-xl`}>
              <Icon className={`w-5 h-5 text-${color}-700`} />
            </div>
            <div>
              <h3 className="text-white font-bold">{title}</h3>
              <p className="text-white text-sm font-medium">{value}/{goal}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold text-${color}-700`}>{progressWidth}%</div>
            <div className="text-xs text-gray-900 font-semibold">of goal</div>
          </div>
        </div>
        <div className="relative h-3 bg-amber-200 rounded-full overflow-hidden mb-4 shadow-inner">
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${color}-500 to-${color === 'orange' ? 'red' : 'cyan'}-600 rounded-full transition-all duration-1000 shadow-sm`}
            style={{ width: `${progressWidth}%` }}
          />
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
          )}
        </div>
      </Card>
    );
  });

  // Enhanced Water Consumption Card Component
  const WaterCard = React.memo(({ glasses, onIncrement, onDecrement }: {
    glasses: number;
    onIncrement: () => void;
    onDecrement: () => void;
  }) => {
    const dailyGoal = 8; // 8 glasses per day
    const percentage = Math.min((glasses / dailyGoal) * 100, 100);
    const isGoalReached = glasses >= dailyGoal;
    
    return (
      <Card className={`bg-gradient-to-br from-amber-100 to-cyan-100 border-none p-6 transition-all duration-300 hover:from-amber-100 hover:to-cyan-200 shadow-lg hover:shadow-xl`} data-testid="water-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl transition-all duration-300 ${isGoalReached ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-cyan-500/30'}`}>
              <Droplets className={`w-6 h-6 transition-colors duration-300 ${isGoalReached ? 'text-gray-900' : 'text-cyan-700'}`} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Water Intake</h3>
              <p className="text-white text-sm font-medium">{glasses}/{dailyGoal} glasses today</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
            <div className="text-xs text-gray-900 font-semibold">of goal</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-3 bg-amber-200 rounded-full overflow-hidden mb-4 shadow-inner">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 shadow-sm"
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
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-cyan-500/50 hover:border-cyan-500/70"
              data-testid="button-increment-water"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
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
          <div className={`text-sm ${labelColor} mb-1 leading-tight font-semibold`}>
            <div>Remaining</div>
            <div>{name}</div>
          </div>
          <div className={`text-xl font-bold ${textColor} mb-2`}>
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
          <div className="text-xs text-gray-900 font-semibold mt-1">
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
    
    // Use consistent color classes optimized for light theme
    const getColorClasses = () => {
      switch(color) {
        case 'cyan': return 'text-cyan-600 from-cyan-400 to-blue-500';
        case 'orange': return 'text-orange-600 from-orange-400 to-yellow-500';
        case 'red': return 'text-red-600 from-red-400 to-pink-500';
        case 'green': return 'text-green-600 from-green-400 to-emerald-500';
        case 'slate': return 'text-slate-600 from-slate-400 to-gray-500';
        case 'white': return 'text-gray-900 from-white to-gray-300';
        case 'amber': return 'text-amber-600 from-amber-400 to-yellow-500';
        case 'rose': return 'text-rose-600 from-rose-400 to-pink-500';
        default: return 'text-gray-600 from-gray-400 to-gray-500';
      }
    };
    
    const colorClasses = getColorClasses();
    const [textColor, gradientColors] = colorClasses.split(' from-');
    
    return (
    <Card className="bg-amber-100 border-none p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-200" data-testid="micro-card">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-bold ${textColor}`}>{name}</div>
        <div className="text-xs text-gray-900 font-bold">{displayValue}{unit} / {goal}{unit}</div>
      </div>
      <div className="relative h-2 bg-amber-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${gradientColors} rounded-full transition-all duration-1000 shadow-sm`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      <div className="text-xs text-gray-900 font-bold mt-1">{percentage}% Daily Value</div>
    </Card>
    );
  };

  // Render functions for each page with enhanced animations
  const renderHome = () => (
    <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('home', previousTab)} duration-700 ease-out`} data-page="dashboard">
      <HeroSection
        title="Track Your"
        subtitle="Nutrition"
        description="Track nutrition with scientific precision using our comprehensive USDA database"
        buttonText={user ? 'Start Tracking' : 'Sign Up to Track'}
        onButtonClick={() => {
          if (user) {
            handleTabChange('calculator');
          } else {
            handleTabChange('profile');
          }
        }}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 content-section">
        <div className="space-y-3">
          {/* Welcome Banner for Tour */}
          {user && showWelcomeBanner && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-semibold text-lg text-gray-900">Welcome to ByteWise!</h3>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
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
            <h2 className="text-3xl font-black text-gray-900">Today's Progress</h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="text-orange-400 hover:text-orange-300"
                onClick={() => handleTabChange(user ? 'calculator' : 'profile')}
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
                <div className="text-sm font-bold text-orange-600">{loggedMeals.length}</div>
                <div className="text-xs text-gray-900">Meals</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-bold text-orange-600">{Math.round(goalCalories - dailyCalories)}</div>
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
                  <div className="text-sm font-bold text-blue-700">{item.value}</div>
                  <div className="text-xs text-gray-900">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros Breakdown - Enhanced with Remaining Values */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MacroCard 
              name="Protein" 
              value={Math.round(dailyMacros.protein)} 
              goal={user?.dailyProteinGoal || 180} 
              color="green" 
            />
            <MacroCard 
              name="Carbs" 
              value={Math.round(dailyMacros.carbs)} 
              goal={user?.dailyCarbGoal || 200} 
              color="yellow" 
            />
            <MacroCard 
              name="Fat" 
              value={Math.round(dailyMacros.fat)} 
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
    <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('tracking', previousTab)} duration-700 ease-out`}>
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
              className="h-12 pl-10 bg-white/80 border-amber-300 text-gray-900 placeholder-gray-500"
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
                handleTabChange('calculator');
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
                <div className="text-center text-gray-400">
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
                    <p className="text-gray-400 text-sm">
                      {meal.time} • {meal.mealType}
                      {searchQuery && (
                        <span className="ml-2 text-blue-400">
                          • {new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="text-xs text-green-400">P: {(meal.protein || 0).toFixed(1)}g</span>
                      <span className="text-xs text-yellow-400">C: {(meal.carbs || 0).toFixed(1)}g</span>
                      <span className="text-xs text-purple-400">F: {(meal.fat || 0).toFixed(1)}g</span>
                    </div>
                    {/* Display micronutrients if available */}
                    {(meal.iron > 0 || meal.calcium > 0 || meal.vitaminC > 0 || meal.zinc > 0) && (
                      <div className="flex flex-wrap gap-2 mt-1 pt-1 border-t border-white/10">
                        {meal.iron > 0 && (
                          <span className="text-xs bg-slate-500/20 px-2 py-0.5 rounded-full text-slate-300">
                            Iron: {meal.iron.toFixed(1)}mg
                          </span>
                        )}
                        {meal.calcium > 0 && (
                          <span className="text-xs bg-gray-500/20 px-2 py-0.5 rounded-full text-gray-300">
                            Calcium: {Math.round(meal.calcium)}mg
                          </span>
                        )}
                        {meal.vitaminC > 0 && (
                          <span className="text-xs bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300">
                            Vit C: {Math.round(meal.vitaminC)}mg
                          </span>
                        )}
                        {meal.zinc > 0 && (
                          <span className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">
                            Zinc: {meal.zinc.toFixed(1)}mg
                          </span>
                        )}
                        {meal.magnesium > 0 && (
                          <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-300">
                            Mg: {Math.round(meal.magnesium)}mg
                          </span>
                        )}
                        {meal.vitaminD > 0 && (
                          <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full text-orange-300">
                            Vit D: {meal.vitaminD.toFixed(1)}μg
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
                      onClick={() => {
                        // Delete meal action
                        // Remove meal from storage using robust identification
                        const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
                        
                        // Find the exact meal to remove using multiple criteria
                        const mealIndex = stored.findIndex((m: any, idx: number) => {
                          // Try multiple ways to identify the meal for robust deletion
                          if (meal.id && m.id === meal.id) return true;
                          if (m.name === meal.name && m.time === meal.time && m.date === meal.date) return true;
                          if (idx === index && m.name === meal.name && Math.abs(m.calories - meal.calories) < 1) return true;
                          return false;
                        });
                        
                        if (mealIndex === -1) {
                          return;
                        }
                        
                        // Remove the specific meal
                        const updated = [...stored];
                        updated.splice(mealIndex, 1);
                        localStorage.setItem('weeklyMeals', JSON.stringify(updated));
                        
                        // Refresh meal list using today's actual date
                        const today = getLocalDateKey();
                        
                        const todayMeals = updated.filter((m: any) => {
                          // Handle timestamp format dates
                          const mealDate = m.date && m.date.includes('T') 
                            ? m.date.split('T')[0] 
                            : m.date;
                          
                          return mealDate === today;
                        });
                        // Update all meal-related states  
                        setLoggedMeals(todayMeals);
                        setWeeklyMeals(updated); // Update weekly meals state too
                        
                        // Update daily calories and nutrition
                        const totalCalories = todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
                        setDailyCalories(totalCalories);
                        
                        // Recalculate macros and micronutrients after deletion
                        const updatedMacros = todayMeals.reduce((totals: any, meal: any) => ({
                          protein: totals.protein + (meal.protein || 0),
                          carbs: totals.carbs + (meal.carbs || 0),
                          fat: totals.fat + (meal.fat || 0)
                        }), { protein: 0, carbs: 0, fat: 0 });
                        setDailyMacros(updatedMacros);
                        
                        const updatedMicronutrients = calculateMicronutrients(todayMeals);
                        setDailyMicronutrients(updatedMicronutrients);
                        
                        // Force immediate re-render with React state update
                        // Use functional state update to ensure latest state
                        setWeeklyMeals(prevWeeklyMeals => {
                          return [...updated]; // Force new array reference
                        });
                        
                        setLoggedMeals(prevLoggedMeals => {
                          return [...todayMeals]; // Force new array reference
                        });
                        
                        // Dispatch events
                        window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
                        
                        // Show success message
                        window.dispatchEvent(new CustomEvent('show-toast', {
                          detail: { 
                            message: `✅ Deleted ${meal.name}`,
                            type: 'success'
                          }
                        }));
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
              <p className="text-sm text-gray-400 mt-1">
                {(() => {
                  const weekDates = getWeekDates(); // Use actual current week dates
                  const startDate = new Date(weekDates[0]);
                  const endDate = new Date(weekDates[6]);
                  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            {/* Weekly Progress Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-semibold">Weekly Total</h3>
                  <p className="text-gray-400 text-sm">{Math.round(weeklyCalories)}/{weeklyGoal} kcal</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{Math.round((weeklyCalories/weeklyGoal)*100)}%</div>
                  <div className="text-xs text-gray-400">completed</div>
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
    <div className={`space-y-0 animate-in fade-in ${getAnimationDirection('achievements', previousTab)} duration-700 ease-out`}>
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
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-gray-900">Meet protein goal</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-gray-900">Log 3 meals</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <span className="text-gray-400">Track micronutrients</span>
                <div className="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">○</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <span className="text-gray-400">Stay within carb limit</span>
                <div className="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">○</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Goals */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-2xl">Weekly Goals</h3>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Calendar className="w-3 h-3 mr-1" />
                2/4 Complete
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <span className="text-gray-900">Track 5+ days</span>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <span className="text-gray-900">Average 2000+ cal/day</span>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
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
                    <h4 className="text-white font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-gray-400 text-xs">{formatAchievementDate(achievement.earnedAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-amber-100 to-amber-200 backdrop-blur-md border-amber-300 p-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">No Achievements Yet</h4>
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
    const { refetch } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (isResetPassword) {
          // Password reset flow
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;

          toast({
            title: "Check your email",
            description: "We've sent you a password reset link. Please check your email.",
          });
          setIsResetPassword(false);
        } else if (isSignUp) {
          // Sign up flow with email verification requirement
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                email_verified: false
              }
            }
          });

          if (error) throw error;

          if (data?.user?.identities?.length === 0) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
          } else {
            toast({
              title: "Verify your email",
              description: "We've sent you a verification link. You must verify your email before you can sign in.",
            });
            setIsSignUp(false);
            setEmail('');
            setPassword('');
          }
        } else {
          // Sign in flow with email verification check
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            // Check if error is due to unverified email
            if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
              toast({
                title: "Email not verified",
                description: "Please verify your email before signing in. Check your inbox for the verification link.",
                variant: "destructive",
              });
              return;
            }
            throw error;
          }

          // Additional check for email verification
          if (data?.user && !data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            toast({
              title: "Email not verified",
              description: "Please verify your email before signing in. Check your inbox for the verification link.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });

          // Refetch user data and reload
          await refetch();
          window.location.reload();
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
      <div className="space-y-0 animate-in fade-in slide-in-from-top-4 duration-500">
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
                className="h-12 bg-white/80 border-amber-300 text-gray-900 placeholder-gray-500"
                required
                disabled={isLoading}
              />
              {!isResetPassword && (
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/80 border-amber-300 text-gray-900 placeholder-gray-500"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              )}
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl btn-hero-enhanced"
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
                      className="text-gray-300 hover:text-white text-sm"
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
                    className="text-gray-300 hover:text-white"
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
                      className="text-gray-300 hover:text-white text-sm"
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
    <div className={`space-y-0 animate-in fade-in ${getAnimationDirection('daily', previousTab)} duration-700 ease-out`}>
      <HeroSection
        title="Daily &"
        subtitle="Weekly"
        description="Track your calorie intake and search for foods to log"
        buttonText="Start Logging"
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
              className="pl-28 pr-16 h-16 bg-white/90 border-amber-300 text-gray-900 placeholder-gray-600 rounded-2xl text-xl font-medium text-center"
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
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-orange-400/50 hover:border-orange-300/70 btn-hero-enhanced">
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
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
                    <span className="text-xs text-green-600">P: {(meal.protein || 0).toFixed(1)}g</span>
                    <span className="text-xs text-yellow-600">C: {(meal.carbs || 0).toFixed(1)}g</span>
                    <span className="text-xs text-purple-600">F: {(meal.fat || 0).toFixed(1)}g</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-bold text-lg">{Math.round(meal.calories || 0)} cal</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-gray-600 hover:text-red-600 p-2"
                    data-testid={`button-delete-logged-meal-${index}`}
                    onClick={() => {
                      // Remove meal from storage using index and multiple identifiers for safety
                      const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
                      
                      // Find the exact meal to remove using multiple criteria
                      const mealIndex = stored.findIndex((m: any, idx: number) => {
                        // Try multiple ways to identify the meal for robust deletion
                        if (meal.id && m.id === meal.id) return true;
                        if (m.name === meal.name && m.time === meal.time && m.date === meal.date) return true;
                        if (idx === index && m.name === meal.name && Math.abs(m.calories - meal.calories) < 1) return true;
                        return false;
                      });
                      
                      if (mealIndex !== -1) {
                        // Remove the specific meal
                        const updated = [...stored];
                        updated.splice(mealIndex, 1);
                        localStorage.setItem('weeklyMeals', JSON.stringify(updated));
                        
                        // Refresh meal list using today's actual date
                        const today = getLocalDateKey();
                        
                        const todayMeals = updated.filter((m: any) => {
                          // Handle timestamp format dates
                          const mealDate = m.date && m.date.includes('T') 
                            ? m.date.split('T')[0] 
                            : m.date;
                          
                          return mealDate === today;
                        });
                        // Update all meal-related states
                        setLoggedMeals(todayMeals);
                        setWeeklyMeals(updated); // Update weekly meals state too
                        
                        // Update daily calories and nutrition  
                        const totalCalories = todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
                        setDailyCalories(totalCalories);
                        
                        // Recalculate macros and micronutrients after deletion
                        const updatedMacros = todayMeals.reduce((totals: any, meal: any) => ({
                          protein: totals.protein + (meal.protein || 0),
                          carbs: totals.carbs + (meal.carbs || 0),
                          fat: totals.fat + (meal.fat || 0)
                        }), { protein: 0, carbs: 0, fat: 0 });
                        setDailyMacros(updatedMacros);
                        
                        const updatedMicronutrients = calculateMicronutrients(todayMeals);
                        setDailyMicronutrients(updatedMicronutrients);
                        
                        // Force immediate re-render with React state update
                        // Use functional state update to ensure latest state
                        setWeeklyMeals(prevWeeklyMeals => {
                          return [...updated]; // Force new array reference
                        });
                        
                        setLoggedMeals(prevLoggedMeals => {
                          return [...todayMeals]; // Force new array reference
                        });
                        
                        // Dispatch events
                        window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
                        
                        // Show success message
                        window.dispatchEvent(new CustomEvent('show-toast', {
                          detail: { 
                            message: `✅ Deleted ${meal.name}`,
                            type: 'success'
                          }
                        }));
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
      <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('nutrition', previousTab)} duration-700 ease-out`}>
        <HeroSection
          title="Smart"
          subtitle="Nutrition"
          description="AI-powered food analysis or precise USDA database calculator"
          buttonText="Start Analyzing"
          onButtonClick={() => {
            const contentElement = document.querySelector('.main-content');
            if (contentElement) {
              contentElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
        
        {/* Content Section - Completely Separate and Underneath */}
        <div className="px-6 py-3 content-section">
          {/* Instructions Section */}
          <div className="mb-6 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-white/10 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-lg mb-3">Choose Your Nutrition Analysis Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-blue-300">AI Photo Analysis</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Take a photo of your food and let AI identify it automatically. 
                    Perfect for quick logging of complete meals and dishes.
                  </p>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    <span className="font-medium text-orange-300">USDA Calculator</span>
                  </div>
                  <p className="text-gray-300 text-sm">
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
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
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
                    : 'text-gray-400 hover:text-white'
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
              <AIFoodAnalyzer />
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
    <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('profile', previousTab)} duration-700 ease-out`}>
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
          <div className={`space-y-0 animate-in fade-in ${getAnimationDirection('fasting', previousTab)} duration-700 ease-out`}>
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
              <div data-testid="fasting-tracker" className="fasting-tracker bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6">
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
          <div className={`space-y-0 animate-in fade-in ${getAnimationDirection('data', previousTab)} duration-700 ease-out`}>
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
              <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700">
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
      <div className="fixed top-safe right-4 z-50 safe-notification-position">
        <div className="relative">
          <Button
            variant="ghost"
            size="lg"
            className="group relative text-gray-900 p-3 transition-all duration-500 hover:scale-110"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            aria-label={`Notifications${notifications.filter(n => !n.read).length > 0 ? ` - ${notifications.filter(n => !n.read).length} unread` : ''}`}
            aria-expanded={showNotificationDropdown}
            aria-haspopup="dialog"
            data-testid="button-notifications"
          >
            <div className="relative">
              {notifications.filter(n => !n.read).length > 0 ? (
                <BellRing className="w-10 h-10 transition-all duration-300 group-hover:rotate-12 group-hover:text-gray-700" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Bell className="w-10 h-10 transition-all duration-300 group-hover:rotate-6 group-hover:text-gray-700" strokeWidth={2.5} aria-hidden="true" />
              )}
            </div>
            
            {notifications.filter(n => !n.read).length > 0 && (
              <div 
                className="absolute -top-1 -right-1 min-w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                aria-hidden="true"
              >
                <span className="text-xs text-white font-bold px-1">
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              </div>
            )}
          </Button>
          
          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-40">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
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
                    className={`p-4 border-b border-white/5 ${!notification.read ? 'bg-blue-500/10' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                        <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {notification.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1"
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
      <div data-testid="navigation-tabs" className="fixed bottom-0 left-0 right-0 bg-yellow-400 border-t border-yellow-500/60 safe-area-pb z-50 shadow-lg">
        <div className="flex items-center justify-around py-0.5 px-1 max-w-md mx-auto gap-0.5">
          {[
            { id: 'home', label: 'Dashboard', icon: Home, testId: 'nav-dashboard' },
            { id: 'nutrition', label: 'Calorie Tracker', icon: Utensils, testId: 'nav-calculator' },
            { id: 'fasting', label: 'Fasting', icon: Clock, testId: 'nav-fasting' },
            { id: 'daily', label: 'Meal Journal', icon: BarChart3, testId: 'nav-journal' },
            { id: 'profile', label: 'Profile', icon: UserCircle, testId: 'nav-profile' }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const [isClicked, setIsClicked] = React.useState(false);
            
            const handleClick = () => {
              setIsClicked(true);
              setTimeout(() => setIsClicked(false), 300);
              handleTabChange(tab.id);
            };
            
            return (
              <button
                key={tab.id}
                data-testid={tab.testId}
                onClick={handleClick}
                className={`group ${
                  activeTab === tab.id
                    ? 'text-yellow-600'
                    : 'text-gray-600 hover:text-white active:text-gray-900'
                }`}
              >
                <IconComponent 
                  size={20} 
                  className={`mb-1.5 transition-all duration-300 ease-out transform ${
                    activeTab === tab.id 
                      ? 'scale-110 drop-shadow-lg text-yellow-600' 
                      : 'scale-100 hover:scale-105 hover:text-white active:scale-125 active:text-gray-900'
                  } ${isClicked ? 'nav-icon-clicked' : ''}`}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
                <span className={`text-[8px] font-semibold leading-tight text-center w-full transition-all duration-300 ease-out ${
                  activeTab === tab.id 
                    ? 'text-white transform scale-105 drop-shadow-md' 
                    : 'text-gray-600 hover:text-white active:text-gray-900'
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
      {user && (
        <div className="fixed bottom-20 right-6 z-50">
          <TourLauncher
            onStartTour={() => {
              console.log('Starting ByteWise tour...');
              // Mark tour as started
              localStorage.setItem('tour-started', 'true');
            }}
            isVisible={shouldShowTour()}
          />
        </div>
      )}
      

      

      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
