/**
 * Modern Food App Layout - Inspired by Deliveroo, Chipotle, and premium food apps
 * Features: Hero sections, food cards, nutrition breakdown, and modern navigation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SignOnModule } from '@/components/SignOnModule';
import { useAuth } from '@/hooks/useAuth';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { AchievementCelebration } from '@/components/AchievementCelebration';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import { SaveAccountPrompt } from '@/components/SaveAccountPrompt';
import { FastingStatusCard } from '@/components/FastingStatusCard';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { useAchievements, getAchievementIcon, formatAchievementDate } from '@/hooks/useAchievements';
import { ProfileIcon } from '@/components/ProfileIcon';
import { KEY_TOOLS, useAppTour } from '@/components/TourLauncher';
import { AppTour } from '@/components/AppTour';
import { mealTypeForNow } from '@/components/UserFoodSuggestions';
import { JournalHealthSuggestions } from '@/components/JournalHealthSuggestions';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { ACTIVE_FAST_QUERY_KEY, fetchActiveFast } from '@/lib/fastingApi';
import { refreshAppData } from '@/lib/appRefresh';
import { AppVersionInfo } from '@/components/AppVersionInfo';
const logoImage = '/BWN_Logo.png';
import { 
  Search, 
  Plus,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  HeartPulse,
  Users,
  Calendar,
  Download,
  Bell,
  BellRing,
  X,
  Home,
  UserCircle,
  Utensils,
  CheckCircle2,
  Compass,
  Droplets,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { House, ForkKnife, Timer, ChartBar, User } from 'phosphor-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { WeeklyCaloriesCard } from '@/components/WeeklyCaloriesCard';
import {
  WaterCard,
  changeWaterContainers,
  clampWaterGlasses,
  readLocalWaterContainers,
  readLocalWaterGlasses,
  reconcileWaterContainers,
  writeLocalWaterContainers,
  writeLocalWaterGlasses,
} from '@/components/WaterCard';
import { GuestSaveHint } from '@/components/GuestSaveHint';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { deleteLoggedMeal, listLoggedMeals, logMeal, saveUserProfile } from '@/lib/mealsApi';
import { clearProfileCompletionPrompt, resendVerificationEmail, resetPasswordForEmail, shouldShowProfileCompletion, signInWithEmail, signUpWithEmail } from '@/lib/authActions';
import { getWeekDates, getWeekStartKey, getLocalDateKey, getMealDateKey, getMealTypeByTime, formatLocalTime } from '@/utils/dateUtils';
import { clearGuestNutritionStorage } from '@/lib/guestStorage';
import { AppleFitnessCard } from '@/components/AppleFitnessCard';
import { ExerciseMinutesCard } from '@/components/ExerciseMinutesCard';
import { AppleHealthIntegration } from '@/components/AppleHealthIntegration';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { FriendsPanel } from '@/components/FriendsPanel';
import { FRIENDS_QUERY_KEY, useFriendUpdates } from '@/hooks/useFriendUpdates';
import { refreshPushIfPermitted, registerForPush } from '@/services/pushNotifications';
import {
  OS_NOTIFICATIONS_PREF_EVENT,
  areOsNotificationsEnabled,
  APP_ALERT_EVENT,
  notifyInternalAlert,
  syncDailyReminders,
  usesNativeNotifications,
  watchLocalNotificationTaps,
} from '@/services/localNotifications';
import { NutritionTrendsCard } from '@/components/NutritionTrendsCard';
import { FoodTypeTrendsCard } from '@/components/FoodTypeTrendsCard';
import { AINutritionAnalyzer } from '@/components/AINutritionAnalyzer';
import { fixMealDateMismatches } from '@/utils/mealDateFixer';
import { getCachedLocalStorage, debounce } from '@/utils/performanceUtils';
import { useLocation } from 'wouter';

function lazySection<C extends React.ComponentType<any>>(load: () => Promise<{ default: C }>) {
  const Lazy = React.lazy(load);
  return function LazySection(props: React.ComponentProps<C>) {
    return (
      <React.Suspense
        fallback={
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        }
      >
        <Lazy {...(props as any)} />
      </React.Suspense>
    );
  };
}

const CalorieCalculator = lazySection(() => import('@/components/CalorieCalculator'));
const UserSettingsManager = lazySection(() =>
  import('@/components/UserSettingsManager').then((m) => ({ default: m.UserSettingsManager }))
);
const DataManagementPanel = lazySection(() =>
  import('@/components/DataManagementPanel').then((m) => ({ default: m.DataManagementPanel }))
);
const AwardsAchievements = lazySection(() =>
  import('@/components/AwardsAchievements').then((m) => ({ default: m.AwardsAchievements }))
);
const FastingTracker = lazySection(() =>
  import('@/components/FastingTracker').then((m) => ({ default: m.FastingTracker }))
);
const RecipeManager = lazySection(() =>
  import('@/components/RecipeManager').then((m) => ({ default: m.RecipeManager }))
);


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

const JOURNAL_SEARCH_DAYS = 14;
const NOTIFICATIONS_KEY = 'bytewise_notifications';
const MAX_NOTIFICATIONS = 50;

// iOS can discard the web view whenever the app is backgrounded, so the bell list lives in localStorage.
function loadStoredNotifications(): Notification[] {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored
      .map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }))
      .filter((n: Notification) => n.id && n.title && !n.read && !Number.isNaN(n.timestamp.getTime()));
  } catch {
    return [];
  }
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

const HeroSection = React.memo(function HeroSection({
  title,
  subtitle,
  description,
  buttonText,
  onButtonClick,
  showLogo = false,
  backgroundImage,
}: {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  showLogo?: boolean;
  backgroundImage: string;
}) {
  const [visibleSrc, setVisibleSrc] = React.useState(backgroundImage);
  const [underlaySrc, setUnderlaySrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (backgroundImage === visibleSrc) return;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setUnderlaySrc(visibleSrc);
      setVisibleSrc(backgroundImage);
      window.setTimeout(() => {
        if (!cancelled) setUnderlaySrc(null);
      }, 700);
    };
    img.onerror = () => {
      if (!cancelled) setVisibleSrc(backgroundImage);
    };
    img.src = backgroundImage;

    return () => {
      cancelled = true;
    };
  }, [backgroundImage, visibleSrc]);

  return (
    <div className="relative min-h-[100svh] md:min-h-screen w-full overflow-hidden hero-component bg-[#0f172a]" data-hero="true">
      {underlaySrc && (
        <img
          src={underlaySrc}
          alt=""
          aria-hidden
          className="absolute inset-0 z-[9] h-full w-full object-cover brightness-[0.85]"
          decoding="async"
        />
      )}
      <img
        src={visibleSrc}
        alt=""
        className="hero-bg-optimized hero-bg-loaded absolute inset-0 z-10 h-full w-full object-cover brightness-[0.85]"
        decoding="async"
        fetchPriority="high"
      />
      <div className="hero-gradient-overlay opacity-100" style={{ zIndex: 11 }} />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center text-white pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.75rem))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-16 sm:pb-24">
        <div className="w-full max-w-2xl space-y-4 sm:space-y-8">
          {showLogo && (
            <div className="mb-1 sm:mb-12 sm:-mt-16">
              <img
                src={logoImage}
                alt="ByteWise Nutritionist Logo"
                className="mx-auto h-12 w-auto object-contain drop-shadow-2xl sm:h-20"
                data-testid="bytewise-hero-logo"
              />
            </div>
          )}

          <div className="space-y-2 hero-optimized sm:space-y-3">
            <h1 className="hero-title text-6xl font-black leading-[0.85] tracking-tighter drop-shadow-2xl font-league-spartan text-optimized opacity-100 md:text-7xl lg:text-8xl">
              {title}
            </h1>
            <h2 className={`hero-title text-6xl font-black leading-[0.85] tracking-tighter font-league-spartan md:text-7xl lg:text-8xl ${showLogo ? 'text-white' : 'text-optimized'} drop-shadow-2xl opacity-100`}>
              {subtitle}
            </h2>
          </div>

          <p className="mx-auto max-w-xl text-2xl font-light leading-relaxed text-gray-100 opacity-100 drop-shadow-xl font-work-sans md:text-3xl">
            {description}
          </p>

          <div className="pt-1 opacity-100 sm:pt-8">
            <Button
              onClick={onButtonClick}
              size="lg"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-8 py-3 text-base font-bold shadow-2xl transition-all duration-200 ease-out hover:from-orange-700 hover:to-red-700 hover:scale-105 sm:px-16 sm:py-6 sm:text-xl md:text-2xl"
              style={{ color: '#ffffff !important' }}
            >
              <span className="relative z-10 flex items-center gap-2 sm:gap-3" style={{ color: '#ffffff !important' }}>
                {buttonText}
                <ChevronRight className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 text-white opacity-100 pointer-events-none"
        style={{ bottom: 'calc(66px + env(safe-area-inset-bottom, 0px) + 20px)' }}
        aria-hidden
      >
        <div className="flex flex-col items-center gap-1">
          <div className="hero-scroll-line w-px h-8 bg-gradient-to-b from-transparent to-white" />
          <div className="hero-scroll-arrow">
            <ChevronRight className="w-7 h-7 rotate-90 drop-shadow-lg" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const { user, isLoading: authLoading, refetch: refetchUser } = useAuth();
  const { photoUrl: profilePhotoUrl } = useProfilePhoto();
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const [openCard, setOpenCard] = useState<string | undefined>(undefined);
  const [navigationTrigger, setNavigationTrigger] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { backgroundImage } = useRotatingBackground(activeTab, navigationTrigger);
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements(!!user);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showConfettiCelebration, setShowConfettiCelebration] = useState(false);
  const [confettiAchievement, setConfettiAchievement] = useState<Achievement | null>(null);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [weeklyDaysLogged, setWeeklyDaysLogged] = useState(0);
  const [weeklyMealCount, setWeeklyMealCount] = useState(0);
  const [goalCalories, setGoalCalories] = useState((user as any)?.dailyCalorieGoal || 2000);
  const [weeklyGoal, setWeeklyGoal] = useState(14000);
  const [loggedMeals, setLoggedMeals] = useState<any[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [trackingView, setTrackingView] = useState<TrackingView>('daily');
  const [notifications, setNotifications] = useState<Notification[]>(loadStoredNotifications);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    } catch {
      // Storage full or unavailable; the list still works for this session.
    }
  }, [notifications]);

  useEffect(() => {
    if (!showNotificationDropdown) return;
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideTap);
    return () => document.removeEventListener('pointerdown', closeOnOutsideTap);
  }, [showNotificationDropdown]);
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  // Daily stats with fasting integration
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [fastingStatus, setFastingStatus] = useState<any>(null);
  
  // Profile completion state
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showSaveAccountPrompt, setShowSaveAccountPrompt] = useState(false);
  
  // App tour state
  const { shouldShowTour, dismissTour, startTour } = useAppTour();
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
  


  // Water consumption update function with 8-glass daily limit.
  // The ref holds the latest count so rapid taps build on each other instead of a stale render value.
  const waterGlassesRef = useRef(0);
  const waterDayRef = useRef(getLocalDateKey());
  const pendingWaterSavesRef = useRef(0);
  const lastWaterWriteAtRef = useRef(0);
  const waterSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    waterGlassesRef.current = dailyStats?.waterGlasses || 0;
  }, [dailyStats?.waterGlasses]);

  const updateWaterConsumption = useCallback((change: number, containerOz = 8) => {
    const dateKey = getLocalDateKey();
    if (waterDayRef.current !== dateKey) {
      // First tap after midnight: build on today's count, not yesterday's.
      waterDayRef.current = dateKey;
      waterGlassesRef.current = readLocalWaterGlasses();
    }
    const previousGlasses = Math.max(
      readLocalWaterGlasses(),
      clampWaterGlasses(dailyStats?.waterGlasses ?? 0),
    );
    waterGlassesRef.current = previousGlasses;
    const newGlasses = clampWaterGlasses(previousGlasses + change);
    if (newGlasses === previousGlasses) return;

    const previousContainers = reconcileWaterContainers(readLocalWaterContainers(dateKey), previousGlasses);
    const newContainers = changeWaterContainers(previousContainers, previousGlasses, newGlasses, containerOz);
    waterGlassesRef.current = newGlasses;
    lastWaterWriteAtRef.current = Date.now();
    writeLocalWaterGlasses(newGlasses);
    writeLocalWaterContainers(newContainers, dateKey);
    setDailyStats((prev: any) => prev ? { ...prev, waterGlasses: newGlasses } : {
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
      waterGlasses: newGlasses, fastingStatus: undefined
    });

    if (newGlasses >= 8 && previousGlasses < 8) {
      addNotification('success', 'Daily Hydration Goal! 💧', 'You\'ve reached your 64 oz water goal today!');
      if (!usesNativeNotifications()) {
        toast({
          title: 'Hydration Goal Achieved! 💧',
          description: "You've reached your daily water intake goal!",
          variant: 'default',
          duration: 3000,
        });
      }
    }
    if (newGlasses >= 4 && newGlasses < 8 && previousGlasses < 4) {
      addNotification('info', 'Halfway There! 💧', `You've had ${newGlasses * 8} oz of water today. Keep going!`);
    }
    if (!user) return;

    // Saves run one at a time so a slow earlier request can't overwrite a newer count.
    pendingWaterSavesRef.current += 1;
    waterSaveQueueRef.current = waterSaveQueueRef.current.then(async () => {
      try {
        await apiRequest('POST', '/api/daily-stats', {
          waterGlasses: newGlasses,
          containers: newContainers,
          date: dateKey
        });
      } catch (error) {
        console.error('Failed to save water intake:', error);
        toast({
          title: "Error",
          description: "Water is saved on this device. Sync will retry next time you're online.",
          variant: "destructive",
        });
      } finally {
        pendingWaterSavesRef.current -= 1;
      }
    });
  }, [user, toast, dailyStats?.waterGlasses]);

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
    
    
    // Only show micronutrients actually present on logged meals — never invent
    // values from calories (that looked populated but was not real food data).
    return {
      vitaminC: Math.round(realMicronutrients.vitaminC * 10) / 10,
      vitaminD: Math.round(realMicronutrients.vitaminD * 10) / 10,
      vitaminB12: Math.round(realMicronutrients.vitaminB12 * 10) / 10,
      folate: Math.round(realMicronutrients.folate),
      iron: Math.round(realMicronutrients.iron * 10) / 10,
      calcium: Math.round(realMicronutrients.calcium),
      zinc: Math.round(realMicronutrients.zinc * 10) / 10,
      magnesium: Math.round(realMicronutrients.magnesium),
    };
  }, []);

  // Only after a new signup — never on later sign-ins
  useEffect(() => {
    if (user && !authLoading) {
      setShowProfileCompletion(shouldShowProfileCompletion());
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
      await saveUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profileIcon: profileData.profileIcon,
      });
      clearProfileCompletionPrompt();
      setShowProfileCompletion(false);
      await refetchUser();
    } catch (error) {
      throw error;
    }
  };

  // Collapse duplicate bell/OS alerts when the same meal/event fires multiple window events.
  const recentNotificationKeysRef = useRef<Map<string, number>>(new Map());
  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const key = `${type}|${title}|${message}`;
    const now = Date.now();
    const lastAt = recentNotificationKeysRef.current.get(key) || 0;
    if (now - lastAt < 8_000) return;
    recentNotificationKeysRef.current.set(key, now);
    // Prune old keys so the map stays small.
    recentNotificationKeysRef.current.forEach((at, k) => {
      if (now - at > 60_000) recentNotificationKeysRef.current.delete(k);
    });

    setNotifications(prev => [{
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    }, ...prev].slice(0, MAX_NOTIFICATIONS));

    // Every internal alert → iOS/Android Local Notification banner (no-op on web).
    const lower = title.toLowerCase();
    const tab =
      type === 'achievement' || lower.includes('friend') || lower.includes('request')
        ? 'profile'
        : lower.includes('fast')
          ? 'fasting'
          : lower.includes('meal') || lower.includes('calorie') || lower.includes('lunch') || lower.includes('dinner')
            ? 'nutrition'
            : 'home';
    void notifyInternalAlert(title, message, tab);
  }, []);

  const { data: friendsData } = useFriendUpdates(user?.id, addNotification);

  // Toast helpers on native fire APP_ALERT_EVENT — turn them into bell + OS banners.
  useEffect(() => {
    const onAppAlert = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string; title?: string; message?: string }>).detail;
      if (!detail?.title) return;
      const type: Notification['type'] =
        detail.type === 'success' || detail.type === 'achievement' ? detail.type : 'info';
      addNotification(type, detail.title, detail.message || detail.title);
    };
    window.addEventListener(APP_ALERT_EVENT, onAppAlert);
    return () => window.removeEventListener(APP_ALERT_EVENT, onAppAlert);
  }, [addNotification]);

  // iOS asks for push permission only once friends are involved; afterwards the token is refreshed quietly.
  const hasFriendConnections = !!friendsData
    && friendsData.friends.length + friendsData.incoming.length + friendsData.outgoing.length > 0;
  useEffect(() => {
    if (!user?.id || !areOsNotificationsEnabled()) return;
    void registerForPush({
      prompt: hasFriendConnections,
      // The friends poll turns the change into the in-app toast and bell entry.
      onReceived: () => queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEY }),
      onOpened: (type) => {
        queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEY });
        if (type === 'friend_request' || type === 'friend_accepted') {
          setActiveTab('profile');
          setTimeout(() => setOpenCard('friends'), 100);
        }
      },
    });
  }, [user?.id, hasFriendConnections]);
  const friendsStatusLine = (() => {
    if (!friendsData) return 'Share your activity with people you invite';
    const parts = [
      friendsData.incoming.length ? `${friendsData.incoming.length} request${friendsData.incoming.length === 1 ? '' : 's'} for you` : null,
      friendsData.outgoing.length ? `${friendsData.outgoing.length} waiting to accept` : null,
      friendsData.friends.length ? `${friendsData.friends.length} connected` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Share your activity with people you invite';
  })();

  // Fetch daily stats including fasting status
  const fetchDailyStats = useCallback(async () => {
    if (!user) {
      const meals = await listLoggedMeals();
      const today = getLocalDateKey();
      const todayMeals = meals.filter((meal) => {
        const mealDate = meal.date?.includes('T') ? meal.date.split('T')[0] : meal.date;
        return mealDate === today;
      });
      const totals = todayMeals.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + (Number(meal.totalCalories) || Number(meal.calories) || 0),
        totalProtein: acc.totalProtein + (Number(meal.totalProtein) || Number(meal.protein) || 0),
        totalCarbs: acc.totalCarbs + (Number(meal.totalCarbs) || Number(meal.carbs) || 0),
        totalFat: acc.totalFat + (Number(meal.totalFat) || Number(meal.fat) || 0),
        totalSugar: acc.totalSugar + (Number(meal.totalSugar) || Number(meal.sugar) || 0),
      }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalSugar: 0 });

      setDailyStats({
        ...totals,
        waterGlasses: readLocalWaterGlasses(),
        fastingStatus: undefined,
      });
      setDailyCalories(totals.totalCalories);
      return;
    }
    
    try {
      // Use the correct GET endpoint for daily stats
      const requestedDay = getLocalDateKey();
      const response = await apiRequest('GET', `/api/users/${user.id}/daily-stats?date=${requestedDay}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch daily stats: ${response.status}`);
      }
      const data = await response.json();

      // While a water save is in flight the server still has the older count.
      const keepLocalWater = waterDayRef.current === requestedDay && (
        pendingWaterSavesRef.current > 0 ||
        Date.now() - lastWaterWriteAtRef.current < 8000
      );
      const stats = {
        totalCalories: data.totalCalories || 0,
        totalProtein: data.totalProtein || 0,
        totalCarbs: data.totalCarbs || 0,
        totalFat: data.totalFat || 0,
        totalSugar: data.totalSugar || 0,
        waterGlasses: keepLocalWater ? waterGlassesRef.current : clampWaterGlasses(data.waterGlasses || 0),
        fastingStatus: data.fastingStatus
      };

      if (!keepLocalWater && getLocalDateKey() === requestedDay) {
        waterDayRef.current = requestedDay;
        waterGlassesRef.current = stats.waterGlasses;
        writeLocalWaterGlasses(stats.waterGlasses);
        if (data.waterContainers) {
          writeLocalWaterContainers(reconcileWaterContainers(data.waterContainers, stats.waterGlasses), requestedDay);
        }
      }
      setDailyStats(stats);
      setDailyCalories(stats.totalCalories);
      
    } catch (error) {
      console.error('❌ Daily stats fetch error for authenticated user:', error);
      // Keep what we already know instead of resetting to zero.
      setDailyStats((prev: any) => prev ?? {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalSugar: 0,
        waterGlasses: readLocalWaterGlasses(),
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

  // Mirror the account's active fast into this device so the dashboard matches the other device.
  const { data: serverActiveFast, isSuccess: serverActiveFastLoaded, dataUpdatedAt: serverActiveFastAt } = useQuery({
    queryKey: ACTIVE_FAST_QUERY_KEY,
    queryFn: fetchActiveFast,
    enabled: !!user,
    retry: false,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!serverActiveFastLoaded) return;
    let local: { id?: string; startTime?: string } | null = null;
    try {
      local = JSON.parse(localStorage.getItem('bytewise_fasting_session') || 'null');
    } catch {
      local = null;
    }
    const serverRemaining = serverActiveFast
      ? serverActiveFast.targetDuration - (Date.now() - new Date(serverActiveFast.startTime).getTime())
      : 0;

    if (serverActiveFast && serverRemaining > 0) {
      if (local?.id !== serverActiveFast.id) {
        localStorage.setItem('bytewise_fasting_session', JSON.stringify({
          id: serverActiveFast.id,
          planId: serverActiveFast.planId,
          startTime: serverActiveFast.startTime,
          targetDuration: serverActiveFast.targetDuration,
          status: 'active',
        }));
        localStorage.setItem('bytewise_fasting_active', 'true');
      }
    } else if (local?.id && Date.now() - new Date(local.startTime || 0).getTime() > 60_000) {
      localStorage.removeItem('bytewise_fasting_session');
      localStorage.removeItem('bytewise_fasting_active');
    }
    checkFastingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverActiveFastAt, serverActiveFastLoaded]);



  // Notification handler functions
  // Read notifications are removed rather than kept in the list.
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications([]);
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
      
      // Bell + iOS banner for achievement
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
      // Only announce when calories actually cross the goal this session (avoid reopen spam).
      if (totalCalories >= goalCalories && dailyCalories > 0 && dailyCalories < goalCalories) {
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

  // Water and meal reminders for iOS/Android when the app is backgrounded.
  useEffect(() => {
    const sync = () => {
      void syncDailyReminders({
        waterGlasses: dailyStats?.waterGlasses ?? 0,
        mealsLoggedToday: loggedMeals.length,
      }).then(() => {
        if (user?.id && areOsNotificationsEnabled()) void refreshPushIfPermitted();
      });
    };
    sync();
    window.addEventListener(OS_NOTIFICATIONS_PREF_EVENT, sync);
    return () => window.removeEventListener(OS_NOTIFICATIONS_PREF_EVENT, sync);
  }, [dailyStats?.waterGlasses, loggedMeals.length, user?.id]);

  useEffect(() => {
    void watchLocalNotificationTaps((tab) => {
      if (!tab) return;
      setActiveTab(tab);
      if (tab === 'profile') {
        setTimeout(() => setOpenCard('achievements'), 100);
      }
    });
  }, []);

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
    // The sender has already written the new count locally (and saves it to the server itself),
    // so refetching here would race that save and can show the old value.
    const handleWaterUpdate = () => {
      const newWaterGlasses = readLocalWaterGlasses();
      waterGlassesRef.current = newWaterGlasses;
      setDailyStats((prev: any) => ({
        ...prev,
        totalCalories: prev?.totalCalories || 0,
        totalProtein: prev?.totalProtein || 0,
        totalCarbs: prev?.totalCarbs || 0,
        totalFat: prev?.totalFat || 0,
        waterGlasses: newWaterGlasses,
        fastingStatus: prev?.fastingStatus
      }));
    };
    
    window.addEventListener('waterUpdated', handleWaterUpdate);
    return () => window.removeEventListener('waterUpdated', handleWaterUpdate);
  }, []);

  // Start a fresh day at local midnight (or when the app is reopened on a new day).
  // When the week rolls (Sunday), clear weekly progress immediately so last week doesn't linger.
  useEffect(() => {
    let dayKey = getLocalDateKey();
    let weekKey = getWeekStartKey();
    const checkForNewDay = () => {
      const nowKey = getLocalDateKey();
      const nowWeekKey = getWeekStartKey();
      const weekChanged = nowWeekKey !== weekKey;
      const dayChanged = nowKey !== dayKey;
      if (weekChanged) {
        weekKey = nowWeekKey;
        setWeeklyCalories(0);
        setWeeklyDaysLogged(0);
        setWeeklyMealCount(0);
      }
      if (dayChanged || weekChanged) {
        dayKey = nowKey;
        void refreshAppData();
      }
    };
    const interval = window.setInterval(checkForNewDay, 60 * 1000);
    document.addEventListener('visibilitychange', checkForNewDay);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', checkForNewDay);
    };
  }, []);


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
  
  useEffect(() => {
    const handleGuestSavePrompt = () => {
      if (user || sessionStorage.getItem('guest-save-prompt-dismissed') === 'true') {
        return;
      }
      setShowSaveAccountPrompt(true);
    };

    window.addEventListener('guest-save-prompt', handleGuestSavePrompt);
    return () => window.removeEventListener('guest-save-prompt', handleGuestSavePrompt);
  }, [user]);

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

  useEffect(() => {
    const hideWelcome = () => setShowWelcomeBanner(false);
    window.addEventListener('tour-completed', hideWelcome);
    return () => window.removeEventListener('tour-completed', hideWelcome);
  }, []);

  // Signed-out users must not keep or display persisted meal data on this device
  useEffect(() => {
    if (authLoading || user) {
      return;
    }
    clearGuestNutritionStorage();
    setLoggedMeals([]);
    setWeeklyMeals([]);
    setDailyCalories(0);
    setWeeklyCalories(0);
    setWeeklyDaysLogged(0);
    setWeeklyMealCount(0);
  }, [user, authLoading]);

  // Load existing meal data and set up tracking
  useEffect(() => {
    // Load existing meal data on component mount - Database-first approach
    const loadExistingData = async () => {
      if (authLoading || !user) {
        clearGuestNutritionStorage();
        setLoggedMeals([]);
        setWeeklyMeals([]);
        setDailyCalories(0);
        return;
      }

      try {
        let stored: any[] = [];
        
        try {
          stored = await listLoggedMeals();
        } catch (error) {
          console.error('Failed to load meals; keeping the last loaded data:', error);
          const todayKey = getLocalDateKey();
          setLoggedMeals((prev) => prev.filter((meal: any) => {
            const mealDate = meal.date?.includes('T') ? meal.date.split('T')[0] : meal.date;
            return mealDate === todayKey;
          }));
          await fetchDailyStats();
          checkFastingStatus();
          return;
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
        
        await fetchDailyStats();
        
        // Check fasting status from localStorage
        checkFastingStatus();
        
        // Current Sun–Sat week only — last week drops off when getWeekDates() rolls.
        const weekDateKeys = getWeekDates().map((date) => getLocalDateKey(date));
        const currentWeekMeals = stored.filter((meal: any) => {
          const key = getMealDateKey(meal?.date);
          return key !== '' && weekDateKeys.includes(key);
        });
        const weeklyTotal = currentWeekMeals.reduce((sum: number, meal: any) => {
          return sum + (Number(meal.calories) || Number(meal.totalCalories) || 0);
        }, 0);
        const daysWithMeals = new Set(
          currentWeekMeals.map((meal: any) => getMealDateKey(meal?.date)).filter(Boolean),
        ).size;
        setWeeklyCalories(weeklyTotal);
        setWeeklyDaysLogged(daysWithMeals);
        setWeeklyMealCount(currentWeekMeals.length);
        
      } catch (error) {
        // Keep what's on screen: zeroing it here would make a failed refresh look like lost data.
        console.error('Failed to refresh dashboard data:', error);
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

    // Data refresh only — never notify. Meal logging used to fire calories-logged,
    // meal-logged-success, and refresh-meals together, which tripled the bell/OS alert.
    const handleMealDataRefresh = () => {
      try {
        loadExistingData();
      } catch {
        // Ignore refresh errors
      }
    };

    // Single notify path for meal logs (detail required so refresh-only events stay quiet).
    const handleMealLoggedNotify = (event?: any) => {
      try {
        loadExistingData();
        if (!event?.detail) return;
        const { foodName, name, calories, mealType, protein, totalCalories, totalProtein } = event.detail;
        const cal = calories ?? totalCalories ?? 0;
        const prot = protein ?? totalProtein;
        addNotification(
          'success',
          'Meal Logged! 🍽️',
          `Added ${foodName || name || 'food item'} (${cal || 0} cal${prot ? `, ${prot}g protein` : ''}) to ${mealType || 'your meals'}`,
        );
      } catch {
        // Ignore notification errors
      }
    };

    // Handle tour navigation
    const handleTourNavigation = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { tab, accordionTarget, scrollTo } = customEvent.detail || {};
      if (tab) setActiveTab(tab);

      if (accordionTarget) {
        window.setTimeout(() => {
          setOpenCard(accordionTarget);
        }, 100);
      }

      if (scrollTo) {
        window.setTimeout(() => {
          const el = document.querySelector(`[data-testid="${scrollTo}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 450);
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

    // Notify only on calories-logged (emitted once by logMeal). Other events refresh UI only.
    const eventsToAdd = [
      { type: 'calories-logged', handler: handleMealLoggedNotify },
      { type: 'meal-logged-success', handler: handleMealDataRefresh },
      { type: 'refresh-meals', handler: handleMealDataRefresh },
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
  }, [user, authLoading, fetchDailyStats, calculateMicronutrients, checkFastingStatus]);

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

  const scrollToTestId = (testId: string, options?: { focus?: boolean }) => {
    const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (options?.focus) {
      el.focus();
    }
  };

  const handleTabChange = (newTab: string) => {
    // Every nav click swaps the hero photo, even when re-tapping the active tab.
    setNavigationTrigger(prev => prev + 1);

    if (newTab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(newTab);
      setOpenCard(undefined);

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

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
    // Full class names so Tailwind can generate them
    const palette = color === 'orange'
      ? { tile: 'bg-orange-500/30', text: 'text-orange-700', fill: 'bg-gradient-to-r from-orange-500 to-red-600' }
      : { tile: 'bg-blue-500/30', text: 'text-blue-700', fill: 'bg-gradient-to-r from-blue-600 to-cyan-600' };
    
    return (
      <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border-none p-5 shadow-lg" data-testid="progress-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${palette.tile} rounded-xl`}>
              <Icon className={`w-5 h-5 ${palette.text}`} />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium">{title}</h3>
              <p className="text-gray-900 text-sm font-medium">{value}/{goal}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-medium ${palette.text}`}>{progressWidth}%</div>
            <div className="text-xs text-gray-900 font-normal">of goal</div>
          </div>
        </div>
        <div className="relative h-3 bg-gray-300/60 rounded-full overflow-hidden mb-4 shadow-inner border border-gray-400/20">
          <div 
            className={`absolute left-0 top-0 h-full ${palette.fill} rounded-full transition-all duration-1000 shadow-sm`}
            style={{ width: `${progressWidth}%` }}
          />
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
          )}
        </div>
      </Card>
    );
  });

  // Macro card — remaining vs goal, with a real progress bar from logged totals
  const MacroCard = React.memo(({ name, value, goal, color }: {
    name: string;
    value: number;
    goal: number;
    color: string;
  }) => {
    const remaining = goal - value;
    const isOver = remaining < 0;
    const progress = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;

    const macroPalette: Record<string, { text: string; bar: string }> = {
      green: { text: 'text-green-700', bar: 'bg-green-500' },
      yellow: { text: 'text-yellow-700', bar: 'bg-yellow-500' },
      purple: { text: 'text-purple-700', bar: 'bg-purple-500' },
      pink: { text: 'text-pink-700', bar: 'bg-pink-500' },
    };
    const swatch = macroPalette[color] ?? macroPalette.green;
    const textColor = isOver ? 'text-red-700' : swatch.text;
    const labelColor = isOver ? 'text-red-600' : 'text-gray-900';

    return (
      <Card className="bg-amber-100 border-none p-4 transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-200 shadow-lg hover:shadow-xl" data-testid="macro-card">
        <div className="text-center">
          <div className={`text-sm ${labelColor} mb-1 leading-tight font-normal`}>
            <div>{isOver ? 'Over' : 'Remaining'}</div>
            <div>{name}</div>
          </div>
          <div className={`text-xl font-medium ${textColor} mb-2`}>
            {isOver ? '+' : ''}{Math.abs(Math.round(remaining))}g
          </div>
          <div className="relative h-2 rounded-full bg-amber-200/80 overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : swatch.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-900 font-normal mt-1">
            {Math.round(value)}g / {goal}g
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
        case 'violet': return {
          textColor: 'text-violet-600',
          gradientClass: 'bg-gradient-to-r from-violet-400 to-purple-600'
        };
        case 'amber': return {
          textColor: 'text-amber-700',
          gradientClass: 'bg-gradient-to-r from-amber-500 to-orange-600'
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
        backgroundImage={backgroundImage}
        title="Track Your"
        subtitle="Nutrition"
        description="Track nutrition with scientific precision using the comprehensive Bytewise Food Database"
        buttonText="View Progress"
        onButtonClick={() => scrollToTestId('progress-section')}
        showLogo={true}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-4 sm:px-6 py-3 content-section">
        <div className="space-y-3">
          {!user && (
            <div className="guest-hint-banner rounded-xl border border-amber-300/50 bg-amber-100/95 px-4 py-2.5 text-center shadow-sm">
              <GuestSaveHint onCreateAccount={() => handleTabChange('profile')} />
            </div>
          )}
          {user && showWelcomeBanner && (
            <div
              className="mb-4 rounded-2xl border border-amber-300/80 bg-amber-50 p-4 shadow-sm"
              data-testid="welcome-tour-banner"
            >
              <h3 className="text-lg font-semibold text-gray-900">Your tools, in one place</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                Scan a barcode, look up a meal, pick a restaurant item, log water, or start a fast. A short tour shows each one.
              </p>
              <div className="mt-3 flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  className="w-full bg-amber-500 text-gray-900 hover:bg-amber-600 min-[400px]:w-auto"
                  onClick={() => {
                    setShowWelcomeBanner(false);
                    startTour();
                  }}
                  data-testid="welcome-start-tour"
                >
                  Start tour
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-300 bg-white text-gray-800 hover:bg-amber-100 min-[400px]:w-auto"
                  onClick={() => {
                    setShowWelcomeBanner(false);
                    dismissTour();
                  }}
                  data-testid="welcome-dismiss-tour"
                >
                  Maybe later
                </Button>
              </div>
            </div>
          )}
          <div data-testid="progress-section" className="mb-3">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">Today's Progress</h2>
          </div>

          {/* Daily Progress — prefer the larger of server stats vs today’s meal sum */}
          <div data-testid="daily-progress" className="mb-4">
            {(() => {
              const mealsCal = loggedMeals.reduce(
                (sum, meal) => sum + (Number(meal.totalCalories) || Number(meal.calories) || 0),
                0,
              );
              const statsCal = Number(dailyStats?.totalCalories) || 0;
              const todayCal = Math.round(Math.max(dailyCalories, mealsCal, statsCal));
              const pct = Math.round((todayCal / Math.max(goalCalories, 1)) * 100);
              const over = todayCal > goalCalories;
              return (
                <>
            <ProgressCard
              title="Daily Calories"
              icon={Flame}
              value={`${todayCal} cal`}
              goal={`${goalCalories} cal`}
              percentage={pct}
              color="orange"
            />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-medium text-orange-600">{loggedMeals.length}</div>
                <div className="text-xs text-gray-900">Meals</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className={`text-sm font-medium ${over ? 'text-red-700' : 'text-orange-600'}`}>
                  {over
                    ? `+${Math.round(todayCal - goalCalories)}`
                    : Math.round(Math.max(0, goalCalories - todayCal))}
                </div>
                <div className="text-xs text-gray-900">
                  {over ? 'Over' : 'Remaining'}
                </div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-bold text-orange-600">{pct}%</div>
                <div className="text-xs text-gray-900">Complete</div>
              </div>
            </div>
                </>
              );
            })()}
          </div>

          {/* Fasting Status */}
          <div className="mb-4">
            <FastingStatusCard fastingStatus={fastingStatus || dailyStats?.fastingStatus} />
          </div>

          <div className="mb-4">
            <AppleFitnessCard
              onConnect={() => {
                handleTabChange('profile');
                // After the tab switch renders (it closes any open section), open Apple Health.
                setTimeout(() => {
                  setOpenCard('apple-health');
                  setTimeout(() => scrollToTestId('apple-health-card'), 250);
                }, 100);
              }}
            />
          </div>

          <div className="mb-4">
            <ExerciseMinutesCard
              onConnect={() => {
                handleTabChange('profile');
                setTimeout(() => {
                  setOpenCard('apple-health');
                  setTimeout(() => scrollToTestId('apple-health-card'), 250);
                }, 100);
              }}
            />
          </div>

          {/* Water Consumption */}
          <div className="mb-4" data-testid="water-consumption-card">
            <WaterCard
              glasses={Math.max(dailyStats?.waterGlasses ?? 0, readLocalWaterGlasses())}
              onIncrement={(glasses, containerOz) => updateWaterConsumption(glasses, containerOz)}
              onDecrement={(glasses, containerOz) => updateWaterConsumption(-glasses, containerOz)}
            />
          </div>

          {/* Weekly Progress */}
          <div className="mb-4">
            <ProgressCard
              title="Weekly Progress"
              icon={Calendar}
              value={`${Math.round(weeklyCalories)} cal`}
              goal={`${weeklyGoal} cal`}
              percentage={Math.round((weeklyCalories/weeklyGoal)*100)}
              color="blue"
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Days', value: weeklyDaysLogged },
                { label: 'Avg/Day', value: Math.round(weeklyCalories / 7) },
                { label: 'Remain', value: Math.max(0, Math.round(weeklyGoal - weeklyCalories)) },
                { label: 'Meals', value: weeklyMealCount },
              ].map((item, index) => (
                <div key={index} className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-900">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros — server dailyStats when present, else sum of today’s logged meals */}
          <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-4">
            {([
              { name: 'Protein', key: 'totalProtein', alt: 'protein', goal: user?.dailyProteinGoal || 180, color: 'green' },
              { name: 'Carbs', key: 'totalCarbs', alt: 'carbs', goal: user?.dailyCarbGoal || 200, color: 'yellow' },
              { name: 'Fat', key: 'totalFat', alt: 'fat', goal: user?.dailyFatGoal || 70, color: 'purple' },
              { name: 'Sugar', key: 'totalSugar', alt: 'sugar', goal: 50, color: 'pink' },
            ] as const).map((macro) => {
              const fromStats = Number(dailyStats?.[macro.key]) || 0;
              const fromMeals = loggedMeals.reduce(
                (sum, meal) => sum + (Number(meal[macro.key] ?? meal[macro.alt]) || 0),
                0,
              );
              // Prefer the larger of server totals vs today’s meal sum so a slow
              // daily-stats refresh can’t blank out macros just after logging.
              const value = Math.round(Math.max(fromStats, fromMeals));
              return (
                <MacroCard
                  key={macro.name}
                  name={macro.name}
                  value={value}
                  goal={macro.goal}
                  color={macro.color}
                />
              );
            })}
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
              <MicronutrientCard name="Calcium" value={dailyMicronutrients.calcium} goal={1000} unit="mg" color="violet" />
              <MicronutrientCard name="Zinc" value={dailyMicronutrients.zinc} goal={11} unit="mg" color="amber" />
              <MicronutrientCard name="Magnesium" value={dailyMicronutrients.magnesium} goal={400} unit="mg" color="rose" />
            </div>
            
          </div>

          <div className="mb-4">
            <NutritionTrendsCard meals={weeklyMeals} calorieGoal={goalCalories} />
          </div>

          <div className="mb-4">
            <AINutritionAnalyzer isSignedIn={!!user} onCreateAccount={() => handleTabChange('profile')} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-0 page-container">
      <HeroSection
        backgroundImage={backgroundImage}
        title="Daily &"
        subtitle="Weekly"
        description="Track your nutrition progress and log meals"
        buttonText="Start Tracking"
        onButtonClick={() => scrollToTestId('journal-search', { focus: true })}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-4 sm:px-6 py-3 content-section">
        {!user && (
          <GuestSaveHint
            variant="journal"
            onCreateAccount={() => handleTabChange('profile')}
          />
        )}
        {/* Food Search Bar - Moved Here */}
        <div className="mb-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              data-testid="journal-search"
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
            onClick={() => handleTabChange('nutrition')}
            className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl btn-hero-enhanced"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Food with Calculator
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
                          <span className="text-xs bg-slate-500/20 px-2 py-0.5 rounded-md whitespace-nowrap text-gray-800">
                            Iron: {(meal.iron).toFixed(1)}mg
                          </span>
                        )}
                        {(meal.calcium > 0) && (
                          <span className="text-xs bg-gray-500/20 px-2 py-0.5 rounded-md whitespace-nowrap text-gray-800">
                            Calcium: {Math.round(meal.calcium)}mg
                          </span>
                        )}
                        {((meal.vitaminC || meal.vitamin_c) > 0) && (
                          <span className="text-xs bg-cyan-500/20 px-2 py-0.5 rounded-md whitespace-nowrap text-cyan-800">
                            Vit C: {Math.round(meal.vitaminC || meal.vitamin_c)}mg
                          </span>
                        )}
                        {(meal.zinc > 0) && (
                          <span className="text-xs bg-amber-500/30 px-2 py-0.5 rounded-md whitespace-nowrap text-amber-800">
                            Zinc: {(meal.zinc).toFixed(1)}mg
                          </span>
                        )}
                        {(meal.magnesium > 0) && (
                          <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded-md whitespace-nowrap text-rose-800">
                            Mg: {Math.round(meal.magnesium)}mg
                          </span>
                        )}
                        {((meal.vitaminD || meal.vitamin_d) > 0) && (
                          <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-md whitespace-nowrap text-orange-800">
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
                          if (!meal.id) {
                            addNotification('info', 'Delete Failed', 'Cannot delete meal: missing meal ID');
                            return;
                          }

                          await deleteLoggedMeal(meal.id);
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
                  <p className="text-gray-900 text-sm">{Math.round(weeklyCalories)}/{weeklyGoal} cal</p>
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
    <div className="space-y-0 page-container">
      <HeroSection
        backgroundImage={backgroundImage}
        title="Your"
        subtitle="Goals"
        description="Track daily and weekly nutrition goals to unlock achievements"
        buttonText="View Goals"
        onButtonClick={() => scrollToTestId('goals-section')}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-4 sm:px-6 py-3 content-section">
        {/* Goal Progress Cards */}
        <div className="space-y-4" data-testid="goals-section">
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
    const [showPassword, setShowPassword] = useState(false);
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
          const result = await resetPasswordForEmail(email);
          if (!result.ok) throw new Error(result.message);

          toast({
            title: "Check your email",
            description: "We've sent you a password reset link. Please check your email.",
          });
          setIsResetPassword(false);
        } else if (isSignUp) {
          const result = await signUpWithEmail(email, password);
          if (!result.ok) {
            if (result.code === 'ACCOUNT_EXISTS') {
              toast({
                title: "Account exists",
                description: result.message,
                variant: "destructive",
              });
              setIsSignUp(false);
              return;
            }
            throw new Error(result.message);
          }

          if (result.kind === 'verification_required') {
            toast({
              title: "Verify your email",
              description: "We've sent you a verification link. You must verify your email before you can sign in.",
            });
            setIsSignUp(false);
            setEmail('');
            setPassword('');
          } else {
            toast({
              title: "Welcome back!",
              description: "You've successfully signed in.",
            });
            await refetch();
          }
        } else {
          const result = await signInWithEmail(email, password);
          if (!result.ok) {
            if (result.code === 'EMAIL_NOT_VERIFIED') {
              toast({
                title: "Email not verified",
                description: result.message,
                variant: "destructive",
              });
              return;
            }
            throw new Error(result.message);
          }

          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });

          await refetch();
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
        const result = await resendVerificationEmail(email);
        if (!result.ok) throw new Error(result.message);

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
      <div className="space-y-0 page-container">
        <HeroSection
          backgroundImage={backgroundImage}
          title="Welcome to"
          subtitle="Nutrition"
          description="Create an account to save your meals and keep them after you leave"
          buttonText="Get Started"
          onButtonClick={() => scrollToTestId('signin-form')}
        />

        {/* Content Section - Completely Separate and Underneath */}
        <div className="px-4 sm:px-6 py-3 content-section">
          {/* Sign In Component */}
          <Card data-testid="signin-form" className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md p-6">
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
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-11 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600"
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="guest-inline-link absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                    data-testid="button-toggle-password-visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
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

  const mealDayKey = (meal: any): string =>
    meal.date && String(meal.date).includes('T') ? String(meal.date).split('T')[0] : String(meal.date || '');

  const mealSortTime = (meal: any): number =>
    (meal.loggedAt && Date.parse(meal.loggedAt)) || Date.parse(`${mealDayKey(meal)}T12:00:00`) || 0;

  const formatJournalDay = (dayKey: string): string => {
    const today = getLocalDateKey();
    const yesterday = getLocalDateKey(new Date(Date.now() - 86400000));
    if (dayKey === today) return 'Today';
    if (dayKey === yesterday) return 'Yesterday';
    return new Date(`${dayKey}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatLoggedTime = (meal: any): string | null =>
    meal.loggedAt ? new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null;

  const addMealToToday = async (meal: any, mealType: string) => {
    if (!user) {
      addNotification('info', 'Sign in to save', 'Create an account on Profile to add food to your log.');
      return;
    }
    try {
      await logMeal({
        name: meal.name,
        date: getLocalDateKey(),
        mealType,
        totalCalories: meal.totalCalories ?? meal.calories,
        totalProtein: meal.totalProtein ?? meal.protein,
        totalCarbs: meal.totalCarbs ?? meal.carbs,
        totalFat: meal.totalFat ?? meal.fat,
        totalSugar: meal.totalSugar ?? meal.sugar,
        iron: meal.iron,
        calcium: meal.calcium,
        zinc: meal.zinc,
        magnesium: meal.magnesium,
        vitaminC: meal.vitaminC,
        vitaminD: meal.vitaminD,
        vitaminB12: meal.vitaminB12,
        folate: meal.folate,
      });
    } catch (error) {
      console.error('Error adding meal:', error);
      addNotification('info', 'Not added', error instanceof Error ? error.message : 'Could not add this food. Please try again.');
    }
  };

  const deleteJournalMeal = async (meal: any) => {
    try {
      if (!meal.id) {
        addNotification('info', 'Delete Failed', 'Cannot delete meal: missing meal ID');
        return;
      }
      await deleteLoggedMeal(meal.id);
      addNotification('success', 'Meal Deleted', `Removed ${meal.name} from your meals`);
      window.dispatchEvent(new CustomEvent('refresh-meals'));
    } catch (error) {
      console.error('Error deleting meal:', error);
      addNotification('info', 'Delete Failed', 'Could not delete meal. Please try again.');
    }
  };

  const renderJournalMeal = (meal: any, index: number, mode: 'today' | 'search') => {
    const time = formatLoggedTime(meal);
    const when = mode === 'today' ? time : [formatJournalDay(mealDayKey(meal)), time].filter(Boolean).join(' · ');
    return (
      <Card key={`${mode}-${meal.id || meal.name}-${index}`} className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-gray-900 font-semibold truncate">{meal.name}</h4>
            <p className="text-gray-700 text-sm capitalize">{[when, meal.mealType].filter(Boolean).join(' • ')}</p>
            <div className="flex space-x-4 mt-1">
              <span className="text-xs text-green-600">P: {Number(meal.totalProtein || meal.protein || 0).toFixed(1)}g</span>
              <span className="text-xs text-yellow-600">C: {Number(meal.totalCarbs || meal.carbs || 0).toFixed(1)}g</span>
              <span className="text-xs text-purple-600">F: {Number(meal.totalFat || meal.fat || 0).toFixed(1)}g</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-orange-600 font-bold text-lg">{Math.round(Number(meal.totalCalories || meal.calories || 0))} cal</p>
            {mode === 'search' ? (
              <Button
                size="sm"
                className="on-color mt-1 h-8 bg-orange-700 hover:bg-orange-800"
                data-testid={`button-add-search-meal-${index}`}
                onClick={() => addMealToToday(meal, mealTypeForNow())}
                title="Add this food to today's log"
              >
                <Plus className="w-4 h-4 mr-1" /> Add to today
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-red-600 p-2"
                data-testid={`button-delete-logged-meal-${index}`}
                onClick={() => deleteJournalMeal(meal)}
                title="Delete meal entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderDailyWeekly = () => {
    const todayKey = getLocalDateKey();
    const searchFromKey = getLocalDateKey(new Date(Date.now() - (JOURNAL_SEARCH_DAYS - 1) * 86400000));
    const query = searchQuery.trim().toLowerCase();
    const todaysMeals = loggedMeals
      .filter(meal => mealDayKey(meal) === todayKey)
      .sort((a, b) => mealSortTime(b) - mealSortTime(a));
    const searchResults = query
      ? weeklyMeals
          .filter(meal => mealDayKey(meal) >= searchFromKey)
          .filter(meal => `${meal.name} ${meal.mealType}`.toLowerCase().includes(query))
          .sort((a, b) => mealSortTime(b) - mealSortTime(a))
      : [];
    const resultDays = Array.from(new Set(searchResults.map(mealDayKey)));

    return (
    <div className="space-y-0">
      <HeroSection
        backgroundImage={backgroundImage}
        title="Daily &"
        subtitle="Weekly"
        description="Track your calorie intake and search for foods to log"
        buttonText="Search Meals Logged"
        onButtonClick={() => scrollToTestId('main-food-search', { focus: true })}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-4 sm:px-6 py-3 content-section">
        {/* Food Search Bar - Enhanced with filtering */}
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Food Search</h2>
            <p className="text-gray-700">Search what you've logged in the past 2 weeks and add it again</p>
          </div>
          <div className="relative" data-testid="journal-search">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <Input
              data-testid="main-food-search"
              placeholder="Search the last 2 weeks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 sm:h-14 md:h-16 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600 rounded-2xl text-base md:text-xl font-medium text-center"
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
        {query && (
          <div data-testid="journal-search-results" className="space-y-3 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Search results</h3>
              <Badge className="bg-amber-800 text-amber-100 border border-amber-700">
                {searchResults.length} in the last 2 weeks
              </Badge>
            </div>
            {searchResults.length === 0 ? (
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-6 text-center">
                <p className="text-gray-900">Nothing called "{searchQuery.trim()}" in the last 2 weeks.</p>
                <Button
                  onClick={() => handleTabChange('nutrition')}
                  className="on-color mt-3 bg-orange-600 hover:bg-orange-700"
                >
                  Look it up in the Tracker
                </Button>
              </Card>
            ) : (
              resultDays.map(day => (
                <div key={day} className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">{formatJournalDay(day)}</p>
                  {searchResults
                    .filter(meal => mealDayKey(meal) === day)
                    .map(meal => renderJournalMeal(meal, searchResults.indexOf(meal), 'search'))}
                </div>
              ))
            )}
          </div>
        )}

        <JournalHealthSuggestions
          className="mb-6"
          meals={weeklyMeals}
          dailyStats={dailyStats}
          calorieGoal={goalCalories}
          proteinGoal={(user as any)?.dailyProteinGoal || 150}
        />
        {/* Daily Header */}
        <div className="flex space-x-4 mb-6">
          <div className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg border border-orange-400/50 flex items-center" data-testid="text-current-date">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Only entries dated today; past days are reached through search */}
        <div data-testid="meal-history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Logged Today</h3>
            {todaysMeals.length === 0 ? (
              <Badge className="bg-amber-800 text-amber-100 border border-amber-700">No meals logged</Badge>
            ) : (
              <Badge className="bg-amber-800 text-amber-100 border border-amber-700">
                {todaysMeals.length} {todaysMeals.length === 1 ? 'entry' : 'entries'} · {Math.round(todaysMeals.reduce((sum, meal) => sum + Number(meal.totalCalories || meal.calories || 0), 0))} cal
              </Badge>
            )}
          </div>
          {todaysMeals.length === 0 ? (
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-6 text-center">
              <div className="text-gray-700">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2 text-gray-900">No meals logged today</p>
                <p className="text-sm text-gray-700 mb-4">Use the nutrition calculator to start tracking your meals</p>
                <Button
                  onClick={() => handleTabChange('nutrition')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Log Food
                </Button>
              </div>
            </Card>
          ) : (
            todaysMeals.map((meal, index) => renderJournalMeal(meal, index, 'today'))
          )}
        </div>

        {/* Weekly Calories Summary */}
        <div className="space-y-4 mt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">This Week</h3>
            <Badge className="bg-amber-800 text-amber-100 border border-amber-700">Weekly Summary</Badge>
          </div>
          <WeeklyCaloriesCard />
          <FoodTypeTrendsCard meals={weeklyMeals} />
        </div>
      </div>
    </div>
    );
  };


  const renderCalculator = () => {
    return (
      <div className="space-y-0 page-container">
        <HeroSection
          backgroundImage={backgroundImage}
          title="Smart"
          subtitle="Nutrition"
          description="Search foods and get precise nutrition with the Bytewise Calculator"
          buttonText="Start Calculating"
          onButtonClick={() => scrollToTestId('nutrition-food-search')}
        />
        
        {/* Content Section - Completely Separate and Underneath */}
        <div className="px-4 sm:px-6 py-3 content-section">
          <div className="main-content" data-testid="calorie-calculator-section">
            <CalorieCalculator 
              onNavigate={onNavigate}
              isCompact={false}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-0 page-container">
      <HeroSection
        backgroundImage={backgroundImage}
        title="Your"
        subtitle="Profile"
        description={user
          ? "Manage your account, view achievements, and track your progress"
          : "Create an account to save your meals and keep them after you leave this device"}
        buttonText={user ? "Manage Profile" : "Create Account"}
        onButtonClick={() => scrollToTestId('profile-content')}
      />

      {/* Content Section - Redesigned to match other pages */}
      <div className="px-4 sm:px-6 py-3 content-section" data-testid="profile-content">
        {/* Profile Cards with Unified Accordion System */}
        {authLoading ? (
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-8 text-center text-gray-700">
            Checking your session…
          </Card>
        ) : user ? (
          <div className="w-full space-y-6">
          <NotificationPreferences />
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
                          imageUrl={profilePhotoUrl}
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
                    
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="tour" className="border-none">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-4 py-5 sm:px-6 sm:py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]>div]:text-[#faed39] [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="flex min-w-0 items-center space-x-3">
                      <Compass className="h-6 w-6 shrink-0 text-[#faed39]" />
                      <div className="min-w-0 text-left">
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          App tour
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          Key tools and a short walkthrough
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-gray-700">
                      Jump to a tool, or start the guided tour. It highlights calories, water, barcode scan, the calculator, fast food, fasting, and your journal.
                    </p>
                    <Button
                      className="w-full bg-amber-600 text-white hover:bg-amber-700"
                      onClick={() => startTour()}
                      data-testid="tour-launch-button"
                    >
                      {localStorage.getItem('bytewise-tour-completed') === 'true' ? 'Retake tour' : 'Start tour'}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      {KEY_TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            className="flex min-w-0 items-start gap-2 rounded-xl border border-amber-200 bg-white/80 p-2.5 text-left hover:bg-amber-50 sm:p-3"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('navigate-to-tab', {
                                detail: { tab: tool.tab, scrollTo: tool.scrollTo },
                              }));
                            }}
                            data-testid={`key-tool-${tool.id}`}
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold leading-tight text-gray-900">{tool.title}</span>
                              <span className="block text-xs leading-snug text-gray-600">{tool.description}</span>
                            </span>
                          </button>
                        );
                      })}
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

            {/* Recipe Library */}
            <AccordionItem value="recipes" className="border-none">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]>div]:text-[#faed39] [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <Utensils className="w-6 h-6 text-[#faed39]" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Recipes
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          Save meals and log them in one tap
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-0">
                  <RecipeManager />
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
                
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
                  <DataManagementPanel embedded />
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Apple Health Card */}
            <AccordionItem value="apple-health" className="border-none" data-testid="apple-health-card">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 text-left">
                      <HeartPulse className="w-6 h-6 text-rose-600" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Apple Health
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                          Show your steps, move calories, distance, sleep, and workouts
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-0">
                  <AppleHealthIntegration />
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Friends & Family Card */}
            <AccordionItem value="friends" className="border-none" data-testid="friends-card">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300/50">
                <AccordionTrigger className="px-6 py-6 hover:bg-amber-200/30 hover:no-underline [&[data-state=open]]:bg-amber-200/30">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 text-left">
                      <Users className="w-6 h-6 text-orange-700" />
                      <div>
                        <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Friends & Family
                        </h3>
                        <p className="text-sm text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }} data-testid="text-friends-status">
                          {friendsStatusLine}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-0">
                  <FriendsPanel />
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-8">
              <SignOnModule />
            </Card>
            <NotificationPreferences />
          </div>
        )}
        <div className="mt-6">
          <AppVersionInfo />
        </div>
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
          <div className="space-y-0 page-container">
            <HeroSection
              backgroundImage={backgroundImage}
              title="Intermittent"
              subtitle="Fasting"
              description="Track your fasting journey with professional IF schedules and real-time progress monitoring"
              buttonText="Start Fasting"
              onButtonClick={() => scrollToTestId('fasting-tracker')}
            />
            
            {/* Fasting Content Section */}
            <div className="px-4 sm:px-6 py-3 content-section">
              <div data-testid="fasting-tracker" className="fasting-tracker bg-amber-50/90 backdrop-blur-md rounded-3xl border border-amber-200 p-4 sm:p-6">
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
          <div className="space-y-0 page-container">
            <HeroSection
              backgroundImage={backgroundImage}
              title="Data"
              subtitle="Management"
              description="Export, sync, and manage your nutrition tracking data"
              buttonText="Manage Data"
              onButtonClick={() => scrollToTestId('data-management-panel')}
            />

            {/* Content Section - Completely Separate and Underneath */}
            <div className="px-4 sm:px-6 py-3 content-section">
              <div data-testid="data-management-panel" className="bg-amber-50/90 backdrop-blur-md rounded-3xl border border-amber-200 shadow-lg">
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
    <div data-testid="app-container" className="min-h-[100dvh] w-full overflow-x-hidden">
      {/* Fixed notification control — safe area aware (status bar / Dynamic Island) */}
      <div className="app-notification-anchor">
        <div className="relative" ref={notificationPanelRef}>
          <Button
            variant="ghost"
            size="icon"
            className="app-notification-button group relative shrink-0 bg-transparent text-red-600 shadow-none hover:bg-transparent hover:text-red-500 focus-visible:ring-red-500/40"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            aria-label={`Notifications${notifications.filter(n => !n.read).length > 0 ? ` - ${notifications.filter(n => !n.read).length} unread` : ''}`}
            aria-expanded={showNotificationDropdown}
            aria-haspopup="dialog"
            data-testid="button-notifications"
          >
            {notifications.filter(n => !n.read).length > 0 ? (
              <BellRing className="app-notification-icon text-red-600 h-6 w-6 transition-transform duration-200 group-hover:rotate-12" strokeWidth={2.25} aria-hidden="true" />
            ) : (
              <Bell className="app-notification-icon text-red-600 h-6 w-6 transition-transform duration-200 group-hover:rotate-6" strokeWidth={2.25} aria-hidden="true" />
            )}

            {notifications.filter(n => !n.read).length > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white"
                aria-hidden="true"
              >
                {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
              </span>
            )}
          </Button>
          
          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute top-full right-0 mt-2 w-[min(20rem,calc(100vw-1.25rem))] bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border border-amber-200/60 rounded-2xl shadow-2xl overflow-hidden z-[9999]">
              <div className="p-4 border-b border-amber-200/40">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {notifications.length > 0 && <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900 bg-amber-200/50 hover:bg-amber-300/50"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>}
                </div>
              </div>
              <div className="max-h-[min(20rem,60dvh)] overflow-y-auto overscroll-contain">
                {notifications.length === 0 && (
                  <p className="p-6 text-center text-sm text-gray-600">You're all caught up. Goals, achievements and fasting updates will appear here.</p>
                )}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-amber-200/30 ${!notification.read ? 'bg-amber-200/30' : ''}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-medium text-sm">{notification.title}</h4>
                        <p className="text-gray-700 text-xs mt-1">{notification.message}</p>
                        <p className="text-gray-600 text-xs mt-2">
                          {notification.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 p-1"
                        aria-label="Delete notification"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
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
        <div className="flex items-stretch justify-around py-1 px-1 max-w-lg mx-auto gap-0.5">
          {[
            { id: 'home', label: 'Dashboard', icon: House, testId: 'nav-dashboard' },
            { id: 'nutrition', label: 'Tracker', icon: ForkKnife, testId: 'nav-calculator' },
            { id: 'fasting', label: 'Fasting', icon: Timer, testId: 'nav-fasting' },
            { id: 'daily', label: 'Journal', icon: ChartBar, testId: 'nav-journal' },
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

              handleTabChange(tab.id);
            };
            
            return (
              <button
                key={tab.id}
                data-testid={tab.testId}
                onClick={handleClick}
                className={`group relative flex flex-1 min-w-0 flex-col items-center justify-center px-0.5 py-1 transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-black hover:text-white active:text-white'
                }`}
              >
                <IconComponent 
                  size={22}
                  weight={activeTab === tab.id ? "fill" : "regular"}
                  className={`mb-1 transition-all duration-300 ease-out transform ${
                    activeTab === tab.id 
                      ? 'scale-110 drop-shadow-lg text-white nav-icon-active' 
                      : 'scale-100 hover:scale-110 hover:text-white hover:rotate-3'
                  }`}
                  style={{ strokeWidth: activeTab === tab.id ? 2.5 : 2 }}
                />
                <span className={`text-[10px] font-semibold leading-tight text-center w-full px-0.5 transition-colors duration-150 ease-out ${
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
        onDismiss={() => {
          clearProfileCompletionPrompt();
          setShowProfileCompletion(false);
        }}
      />

      <SaveAccountPrompt
        isOpen={showSaveAccountPrompt}
        onCreateAccount={() => {
          sessionStorage.setItem('guest-save-prompt-dismissed', 'true');
          sessionStorage.setItem('open-signup', 'true');
          setShowSaveAccountPrompt(false);
          handleTabChange('profile');
          window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent('open-signup'));
          }, 50);
        }}
        onKeepLocal={() => {
          sessionStorage.setItem('guest-save-prompt-dismissed', 'true');
          setShowSaveAccountPrompt(false);
        }}
      />
      
      <AppTour />
      {/* Toaster lives in App.tsx — avoid a second instance that doubles toast UI */}
    </div>
  );
}
