/**
 * Modern Food App Layout - Inspired by Deliveroo, Chipotle, and premium food apps
 * Features: Hero sections, food cards, nutrition breakdown, and modern navigation
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CalorieCalculator from '@/components/CalorieCalculator';
import { UserSettingsManager } from '@/components/UserSettingsManager';
import { SignOnModule } from '@/components/SignOnModule';
import { useAuth } from '@/hooks/useAuth';
import { DataManagementPanel } from '@/components/DataManagementPanel';
import { AchievementCelebration } from '@/components/AchievementCelebration';
import { AwardsAchievements } from '@/components/AwardsAchievements';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { 
  Search, 
  User,
  Plus,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  Calendar,
  Download,
  Bell,
  X,
  Home,
  BarChart3,
  UserCircle,
  Utensils,
  CheckCircle2
} from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { WeeklyCaloriesCard } from '@/components/WeeklyCaloriesCard';
import { Toaster } from '@/components/ui/toaster';

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

type ProfileSection = 'profile' | 'achievements' | 'data';
type TrackingView = 'daily' | 'weekly';

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const { backgroundImage, animationKey } = useRotatingBackground(activeTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showConfettiCelebration, setShowConfettiCelebration] = useState(false);
  const [confettiAchievement, setConfettiAchievement] = useState<Achievement | null>(null);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [weeklyGoal, setWeeklyGoal] = useState(14000);
  const [loggedMeals, setLoggedMeals] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [trackingView, setTrackingView] = useState<TrackingView>('daily');
  const [profileSection, setProfileSection] = useState<ProfileSection>('profile');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Validation functions for profile sections
  const validateProfileSection = (sectionId: string): boolean => {
    const validSections: ProfileSection[] = ['profile', 'achievements', 'data'];
    if (!validSections.includes(sectionId as ProfileSection)) {
      return false;
    }
    
    if ((sectionId === 'profile' || sectionId === 'data') && !user) {
      addNotification('info', 'Authentication Required', `Please sign in to access the ${sectionId} section`);
      return false;
    }
    
    return true;
  };

  // Utility function to add notifications - using useCallback for stable reference
  const addNotification = React.useCallback((type: Notification['type'], title: string, message: string) => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    }, ...prev]);
  }, []);

  const handleProfileSectionChange = (sectionId: string) => {
    if (authLoading || !validateProfileSection(sectionId)) return;
    
    setProfileSection(sectionId as ProfileSection);
    
    const notificationMessages = {
      achievements: { type: 'success' as const, title: 'Awards & Achievements', message: 'Track your progress and unlock new achievements' },
      data: { type: 'info' as const, title: 'Data Management', message: 'Export, sync, and manage your nutrition data securely' },
      profile: { type: 'success' as const, title: 'Profile & Account', message: 'Manage your personal information and account settings' }
    };
    
    const notification = notificationMessages[sectionId as ProfileSection];
    if (notification) {
      addNotification(notification.type, notification.title, notification.message);
    }
  };

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
  const { achievements, celebrationAchievement, showCelebration, closeCelebration } = useGoalAchievements();

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

  // Load existing meal data and set up tracking
  useEffect(() => {
    // Load existing meal data on component mount
    const loadExistingData = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = stored.filter((meal: any) => meal.date === today);
        setLoggedMeals(todayMeals);
        
        // Calculate daily calories from existing logged meals
        const dailyTotal = todayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        setDailyCalories(dailyTotal);
        
        // Calculate weekly calories from all stored meals
        const weeklyTotal = stored.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
        setWeeklyCalories(weeklyTotal);
        
        console.log('📊 ModernFoodLayout: Loaded data - Daily:', dailyTotal, 'Weekly:', weeklyTotal);
      } catch (error) {
        console.error('❌ ModernFoodLayout: Error loading existing data:', error);
        // Reset to safe state on error
        setLoggedMeals([]);
        setDailyCalories(0);
        setWeeklyCalories(0);
      }
    };

    // Load existing data immediately
    loadExistingData();

    // Set up event listeners for future meal logging
    const handleMealLogged = () => {
      try {
        console.log('🔄 ModernFoodLayout: Handling meal logged event');
        loadExistingData();
        // Don't dispatch circular events - let other components handle their own refresh
      } catch (error) {
        console.error('❌ ModernFoodLayout: Error handling meal logged event:', error);
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
    };
  }, []);

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
    const tabOrder = ['home', 'nutrition', 'daily', 'profile', 'search', 'tracking', 'achievements', 'data'];
    const currentIndex = tabOrder.indexOf(currentTab);
    const prevIndex = tabOrder.indexOf(prevTab);
    
    if (currentIndex > prevIndex) {
      return 'slide-in-from-right-4';
    } else if (currentIndex < prevIndex) {
      return 'slide-in-from-left-4';
    }
    return 'slide-in-from-bottom-4';
  };

  // Enhanced tab change handler with animation direction
  const handleTabChange = (newTab: string) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  // Optimized Hero Section Component with enhanced performance and visuals
  const HeroSection = React.memo(({ title, subtitle, description, buttonText, onButtonClick }: {
    title: string;
    subtitle: string; 
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  }) => {
    // Memoize the background style to prevent recalculation
    const backgroundStyle = React.useMemo(() => ({
      backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('${backgroundImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      willChange: 'transform',
    }), [backgroundImage]);

    return (
      <div className="relative h-screen overflow-hidden">
        {/* Optimized Background Layer */}
        <div 
          key={animationKey}
          className="absolute inset-0 z-10 hero-bg-optimized"
          style={backgroundStyle}
        />
        
        {/* Enhanced Pattern Overlay */}
        <div className="absolute inset-0 z-15 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(251,146,60,0.15),transparent_50%)]" />
        </div>
        
        {/* Content Layer with Enhanced Typography */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6 z-20">
          <div className="space-y-8 max-w-2xl">
            {/* Enhanced Title Section */}
            <div className="space-y-3 hero-optimized">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-white drop-shadow-2xl animate-fadeInUp [animation-delay:0.2s] font-league-spartan text-optimized">
                {title}
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] animate-fadeInUp [animation-delay:0.4s] font-league-spartan text-optimized">
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-[text-shimmer_3s_ease-in-out_infinite]">
                  {subtitle}
                </span>
              </h1>
            </div>
            
            {/* Enhanced Description */}
            <p className="text-xl md:text-2xl text-gray-100 font-light leading-relaxed max-w-xl mx-auto drop-shadow-xl animate-fadeInUp [animation-delay:0.6s] font-work-sans opacity-95">
              {description}
            </p>
            
            {/* Enhanced Call-to-Action */}
            <div className="pt-8 animate-fadeInUp [animation-delay:0.8s]">
              <Button 
                onClick={onButtonClick}
                size="lg"
                className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black px-16 py-6 rounded-full text-xl md:text-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-2 border-orange-400/40 hover:border-orange-300/60 overflow-hidden btn-hero-enhanced"
              >
                <span className="relative z-10 flex items-center gap-3 text-optimized">
                  {buttonText}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 z-30 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/50" />
            <ChevronRight className="w-6 h-6 rotate-90 drop-shadow-lg" />
          </div>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.description === nextProps.description &&
      prevProps.buttonText === nextProps.buttonText
    );
  });

  // Optimized ByteWise Logo Component
  const BytewiseLogo = React.memo(() => (
    <div className="mb-8 cursor-pointer group transition-all duration-300 hover:scale-105" onClick={() => setActiveTab('home')}>
      <div className="text-center font-league-spartan">
        <div className="text-7xl font-black leading-none text-sky-300 mb-2 lowercase tracking-tight drop-shadow-2xl group-hover:text-sky-200 transition-colors duration-300">
          bytewise
        </div>
        <div className="text-xl font-light text-white/80 uppercase tracking-widest drop-shadow-lg group-hover:text-white/90 transition-colors duration-300">
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
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 transition-all duration-300 hover:bg-white/15 hover:border-white/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${color}-500/20 rounded-xl`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <div>
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="text-gray-400 text-sm">{value}/{goal}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold text-${color}-400`}>{progressWidth}%</div>
            <div className="text-xs text-gray-400">of goal</div>
          </div>
        </div>
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${color}-400 to-${color === 'orange' ? 'red' : 'cyan'}-500 rounded-full transition-all duration-1000`}
            style={{ width: `${progressWidth}%` }}
          />
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
          )}
        </div>
      </Card>
    );
  });

  // Optimized Macro Card Component
  const MacroCard = React.memo(({ name, value, color, data = [0, 0, 0, 0, 0] }: {
    name: string;
    value: number;
    color: string;
    data?: number[];
  }) => {
    // Memoize chart data calculation
    const chartData = React.useMemo(() => 
      data.map(height => Math.max(height * 100, 10))
    , [data]);

    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 transition-all duration-300 hover:bg-white/15 hover:border-white/30">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">{name}</div>
          <div className={`text-xl font-bold text-${color}-400 mb-2`}>{value}g</div>
          <div className="flex items-end space-x-px h-6">
            {chartData.map((height, i) => (
              <div 
                key={i}
                className={`flex-1 bg-${color}-400/10 rounded-t transition-all duration-500`}
                style={{ height: `${height}%` }}
              />
            ))}
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
    const percentage = Math.round((value / goal) * 100);
    return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-semibold text-${color}-400`}>{name}</div>
        <div className="text-xs text-gray-400">{value}/{goal}{unit}</div>
      </div>
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${color}-400 to-${color === 'cyan' ? 'blue' : color === 'orange' ? 'yellow' : color === 'red' ? 'pink' : 'emerald'}-500 rounded-full transition-all duration-1000`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage}% DV</div>
    </Card>
    );
  };

  // Render functions for each page with enhanced animations
  const renderHome = () => (
    <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('home', previousTab)} duration-700 ease-out`}>
      <div className="relative h-screen overflow-hidden">
        <div 
          key={`home-bg-${animationKey}`}
          className="absolute inset-0 bg-cover bg-center z-10 hero-bg-slide"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6 z-20">
          <div className="space-y-8 max-w-2xl">
            <div className="animate-fadeInUp [animation-delay:0.2s]">
              <BytewiseLogo />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none text-white drop-shadow-2xl animate-fadeInUp [animation-delay:0.4s]">Track Your</h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none animate-fadeInUp [animation-delay:0.6s]">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">Nutrition</span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto drop-shadow-xl animate-fadeInUp [animation-delay:0.8s]">
              Track nutrition with scientific precision using our comprehensive USDA database
            </p>
            
            <div className="pt-8 animate-fadeInUp [animation-delay:1.0s]">
              <Button 
                onClick={() => {
                  if (user) {
                    setActiveTab('calculator');
                  } else {
                    setActiveTab('profile');
                  }
                }}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black px-16 py-6 rounded-full text-2xl shadow-2xl hover:scale-105 transition-all duration-500 border-2 border-orange-400/30"
              >
                {user ? 'Start Tracking' : 'Sign Up to Track'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 z-30 animate-bounce">
          <ChevronRight className="w-6 h-6 rotate-90 drop-shadow-lg" />
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 bg-black content-section">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black text-white">Today's Progress</h2>
            <Button 
              variant="ghost" 
              className="text-orange-400 hover:text-orange-300"
              onClick={() => setActiveTab(user ? 'calculator' : 'profile')}
            >
              {user ? 'Track Food' : 'Sign Up to Track'}
            </Button>
          </div>

          {/* Daily Progress */}
          <div className="mb-4">
            <ProgressCard
              title="Daily Calories"
              icon={Flame}
              value={`${Math.round(dailyCalories)} kcal`}
              goal={`${goalCalories} kcal`}
              percentage={Math.round((dailyCalories/goalCalories)*100)}
              color="orange"
            />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-orange-400">{loggedMeals.length}</div>
                <div className="text-xs text-gray-400">Meals</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-orange-400">{Math.round(goalCalories - dailyCalories)}</div>
                <div className="text-xs text-gray-400">Remaining</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-orange-400">{Math.round((dailyCalories/goalCalories)*100)}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
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
                <div key={index} className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-sm font-bold text-blue-400">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MacroCard name="Protein" value={0} color="green" />
            <MacroCard name="Carbs" value={0} color="yellow" />
            <MacroCard name="Fat" value={0} color="purple" />
          </div>

          {/* Micronutrients Section */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
              Essential Micronutrients
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MicronutrientCard name="Vitamin C" value={0} goal={90} unit="mg" color="cyan" />
              <MicronutrientCard name="Vitamin D" value={0} goal={20} unit="μg" color="orange" />
              <MicronutrientCard name="Vitamin B12" value={0} goal={2.4} unit="μg" color="red" />
              <MicronutrientCard name="Folate" value={0} goal={400} unit="μg" color="green" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MicronutrientCard name="Iron" value={0} goal={18} unit="mg" color="slate" />
              <MicronutrientCard name="Calcium" value={0} goal={1000} unit="mg" color="white" />
              <MicronutrientCard name="Zinc" value={0} goal={11} unit="mg" color="amber" />
              <MicronutrientCard name="Magnesium" value={0} goal={400} unit="mg" color="rose" />
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
          const searchInput = document.querySelector('input[placeholder="Search foods to log..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 bg-black content-section">
        {/* Food Search Bar - Moved Here */}
        <div className="mb-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search foods to log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <Button 
            onClick={() => {
              if (user) {
                setActiveTab('calculator');
              } else {
                setActiveTab('profile');
              }
            }}
            className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            {user ? 'Log Food with Calculator' : 'Sign Up to Log Food'}
          </Button>
        </div>

        {/* Daily/Weekly Toggle */}
        <div className="flex bg-gray-800/50 rounded-xl p-1 mb-6">
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
              <h2 className="text-2xl font-bold text-white">Today's Meals</h2>
              <div className="text-orange-400 font-bold">
                {Math.round(dailyCalories)}/{goalCalories} cal
              </div>
            </div>
            
            {loggedMeals.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">No meals logged today</p>
                  <p className="text-sm">Use the search bar above or nutrition calculator to start tracking</p>
                </div>
              </Card>
            ) : (
              loggedMeals.filter(meal => 
                !searchQuery || 
                meal.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((meal, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{meal.name}</h4>
                    <p className="text-gray-400 text-sm">{meal.time} • {meal.mealType}</p>
                    <div className="flex space-x-4 mt-1">
                      <span className="text-xs text-green-400">P: {(meal.protein || 0).toFixed(1)}g</span>
                      <span className="text-xs text-yellow-400">C: {(meal.carbs || 0).toFixed(1)}g</span>
                      <span className="text-xs text-purple-400">F: {(meal.fat || 0).toFixed(1)}g</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-lg">{Math.round(meal.calories || 0)} cal</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        // Delete meal action
                        // Remove meal from storage
                        const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
                        const updated = stored.filter((m: any) => m.id !== meal.id);
                        localStorage.setItem('weeklyMeals', JSON.stringify(updated));
                        
                        // Refresh meal list
                        const today = new Date().toISOString().split('T')[0];
                        const todayMeals = updated.filter((m: any) => m.date === today);
                        setLoggedMeals(todayMeals);
                        
                        // Update daily calories
                        const totalCalories = todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
                        setDailyCalories(totalCalories);
                        
                        // Dispatch events
                        window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
                      }}
                    >
                      Delete
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
            <h2 className="text-2xl font-bold text-white mb-4">This Week's Progress</h2>
            
            {/* Weekly Progress Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">Weekly Total</h3>
                  <p className="text-gray-400 text-sm">{Math.round(weeklyCalories)}/{weeklyGoal} kcal</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{Math.round((weeklyCalories/weeklyGoal)*100)}%</div>
                  <div className="text-xs text-gray-400">completed</div>
                </div>
              </div>
              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
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
      <div className="px-6 py-3 bg-black content-section">
        {/* Goal Progress Cards */}
        <div className="space-y-4">
          {/* Daily Goals */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-xl">Daily Goals</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Target className="w-3 h-3 mr-1" />
                3/5 Complete
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-white">Hit calorie target</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-white">Meet protein goal</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-white">Log 3 meals</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                <span className="text-gray-400">Track micronutrients</span>
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">○</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                <span className="text-gray-400">Stay within carb limit</span>
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">○</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Goals */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-xl">Weekly Goals</h3>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Calendar className="w-3 h-3 mr-1" />
                2/4 Complete
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <span className="text-white">Track 5+ days</span>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <span className="text-white">Average 2000+ cal/day</span>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                <span className="text-gray-400">Hit protein goal 5 days</span>
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">3/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                <span className="text-gray-400">Try 3 new foods</span>
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">1/3</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Recent Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "First Day Complete", icon: "🎯", date: "Today", bg: "bg-green-500/20", border: "border-green-500/30" },
              { title: "5 Day Streak", icon: "🔥", date: "Yesterday", bg: "bg-orange-500/20", border: "border-orange-500/30" },
              { title: "Perfect Week", icon: "⭐", date: "Last Week", bg: "bg-blue-500/20", border: "border-blue-500/30" },
              { title: "Protein Goal", icon: "💪", date: "3 days ago", bg: "bg-purple-500/20", border: "border-purple-500/30" }
            ].map((achievement, index) => (
              <Card key={index} className={`${achievement.bg} backdrop-blur-md ${achievement.border} p-4`}>
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="text-white font-semibold text-sm">{achievement.title}</h4>
                  <p className="text-gray-400 text-xs">{achievement.date}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignIn = () => (
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
      <div className="px-6 py-3 bg-black content-section">
        {/* Sign In Component */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h3>
          <div className="space-y-4">
            <Input
              placeholder="Email"
              className="h-12 bg-white/95 border-white/20 text-gray-900 placeholder-gray-500"
            />
            <Input
              type="password"
              placeholder="Password"
              className="h-12 bg-white/95 border-white/20 text-gray-900 placeholder-gray-500"
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl">
              Sign In
            </Button>
            <div className="text-center">
              <Button variant="link" className="text-gray-300 hover:text-white">
                Don't have an account? Sign up
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDailyWeekly = () => (
    <div className={`space-y-0 animate-in fade-in ${getAnimationDirection('daily', previousTab)} duration-700 ease-out`}>
      <HeroSection
        title="Daily &"
        subtitle="Weekly"
        description="Track your calorie intake and search for foods to log"
        buttonText="Start Logging"
        onButtonClick={() => {
          const searchInput = document.querySelector('input[placeholder="Search foods to log..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }}
      />

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-3 bg-black content-section">
        {/* Food Search Bar - Enhanced with filtering */}
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Food Search</h2>
            <p className="text-gray-400">Find and log nutrition information</p>
          </div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search foods to log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-28 pr-16 h-16 bg-white/95 border-white/20 text-gray-900 placeholder-gray-500 backdrop-blur-md rounded-2xl text-xl font-medium text-center"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        {/* Daily Header */}
        <div className="flex space-x-4 mb-6">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl">
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>

        {/* Logged Foods - Real entries from calculator */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Logged Today</h3>
            {loggedMeals.length === 0 && (
              <Badge className="bg-gray-600 text-gray-300">No meals logged</Badge>
            )}
          </div>
          {loggedMeals.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 text-center">
              <div className="text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">No meals logged today</p>
                <p className="text-sm">Use the nutrition calculator to start tracking your meals</p>
              </div>
            </Card>
          ) : (
            loggedMeals.filter(meal => 
              !searchQuery || 
              meal.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((meal, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{meal.name}</h4>
                  <p className="text-gray-400 text-sm">{meal.time} • {meal.mealType}</p>
                  <div className="flex space-x-4 mt-1">
                    <span className="text-xs text-green-400">P: {(meal.protein || 0).toFixed(1)}g</span>
                    <span className="text-xs text-yellow-400">C: {(meal.carbs || 0).toFixed(1)}g</span>
                    <span className="text-xs text-purple-400">F: {(meal.fat || 0).toFixed(1)}g</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-lg">{Math.round(meal.calories || 0)} cal</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      // Remove meal from storage
                      const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
                      const updated = stored.filter((m: any) => m.id !== meal.id);
                      localStorage.setItem('weeklyMeals', JSON.stringify(updated));
                      
                      // Refresh meal list
                      const today = new Date().toISOString().split('T')[0];
                      const todayMeals = updated.filter((m: any) => m.date === today);
                      setLoggedMeals(todayMeals);
                      
                      // Update daily calories
                      const totalCalories = todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
                      setDailyCalories(totalCalories);
                      
                      // Dispatch events
                      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          )))}
        </div>

        {/* Weekly Calories Summary */}
        <div className="space-y-4 mt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">This Week</h3>
            <Badge className="bg-blue-600 text-white">Weekly Summary</Badge>
          </div>
          <WeeklyCaloriesCard />
        </div>
      </div>
    </div>
  );


  const renderCalculator = () => (
    <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('nutrition', previousTab)} duration-700 ease-out`}>
      <HeroSection
        title="USDA"
        subtitle="Calculator"
        description="Precise nutrition data for every ingredient using comprehensive USDA database"
        buttonText="Start Calculating"
        onButtonClick={() => {
          const calculatorElement = document.querySelector('.main-content');
          if (calculatorElement) {
            calculatorElement.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      
      {/* Content Section - Completely Separate and Underneath */}
      <div className="bg-white content-section">
        <div className="main-content">
          <CalorieCalculator 
            onNavigate={onNavigate}
            isCompact={false}
          />
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className={`space-y-0 page-container animate-in fade-in ${getAnimationDirection('profile', previousTab)} duration-700 ease-out`}>
      <HeroSection
        title="Your"
        subtitle="Profile"
        description="Manage your account, view achievements, and track your progress"
        buttonText={user ? "Manage Profile" : "Sign Up"}
        onButtonClick={() => {
          if (user) {
            const profileNav = document.querySelector('.flex.flex-col.sm\\:flex-row');
            if (profileNav) {
              profileNav.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            setProfileSection('profile');
          }
        }}
      />

      {/* Content Section - Redesigned to match other pages */}
      <div className="px-6 py-3 bg-black content-section">
        {user && (
          <div className="mb-8">
            {/* User Info Card - Profile Picture and Quick Info */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    {user?.email?.split('@')[0] || 'ByteWise User'}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">{user?.email}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>🏆 Level 1</span>
                    <span>📊 0 meals logged</span>
                    <span>🎯 Getting started</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-400">0</div>
                  <div className="text-xs text-gray-400">Total Points</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Profile Navigation - Redesigned Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { 
              id: 'profile', 
              name: 'Personal Profile', 
              shortName: 'Profile', 
              icon: User,
              description: 'Edit your personal information',
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              id: 'achievements', 
              name: 'Awards & Achievements', 
              shortName: 'Awards', 
              icon: Trophy,
              description: 'View your progress and goals',
              color: 'from-yellow-500 to-orange-500'
            },
            { 
              id: 'data', 
              name: 'Data & Export', 
              shortName: 'Data', 
              icon: Download,
              description: 'Manage your nutrition data',
              color: 'from-green-500 to-emerald-500'
            }
          ].map((section) => {
            const IconComponent = section.icon;
            const isActive = profileSection === section.id;
            return (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? 'bg-white/20 border-white/40 shadow-2xl ring-2 ring-orange-400/30' 
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                } backdrop-blur-md`}
                onClick={() => handleProfileSectionChange(section.id)}
              >
                <div className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    {section.shortName}
                  </h3>
                  <p className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {section.description}
                  </p>
                  {isActive && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Profile Content - Redesigned Container */}
        <div className="min-h-[600px]">
          {profileSection === 'profile' && (
            <div className="space-y-4">
              {user ? (
                <UserSettingsManager 
                  onClose={() => setProfileSection('profile')} 
                />
              ) : (
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
                  <SignOnModule />
                </Card>
              )}
            </div>
          )}
          
          {profileSection === 'achievements' && (
            user ? (
              <AwardsAchievements onClose={() => setProfileSection('profile')} />
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
                <SignOnModule />
              </Card>
            )
          )}
          
          {profileSection === 'data' && (
            user ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <DataManagementPanel />
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
                <SignOnModule />
              </Card>
            )
          )}
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
            <div className="px-6 py-8 bg-black min-h-screen">
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
    <div className="h-screen w-screen bg-black">
      {/* Fixed Notification Header on all pages - Enhanced visibility */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            variant="ghost"
            size="lg"
            className="bg-transparent text-white hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 hover:scale-105"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
          >
            <Bell className="w-8 h-8 drop-shadow-lg" strokeWidth={2.5} />
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-3 border-white shadow-xl animate-pulse ring-2 ring-red-400/50">
                <span className="text-sm text-white font-bold drop-shadow-lg">
                  {notifications.filter(n => !n.read).length}
                </span>
              </div>
            )}
          </Button>
          
          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-40">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Notifications</h3>
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
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 safe-area-pb z-50">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {[
            { id: 'home', label: 'Dashboard', icon: Home },
            { id: 'nutrition', label: 'Nutrition', icon: Utensils },
            { id: 'daily', label: 'Daily', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: UserCircle }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center py-1.5 px-1.5 rounded-md transition-all duration-200 min-w-[50px] flex-1 active:bg-yellow-400/20 ${
                  activeTab === tab.id
                    ? 'text-yellow-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <IconComponent 
                  size={18} 
                  className={`mb-0.5 ${activeTab === tab.id ? 'drop-shadow-lg' : ''}`}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
                <span className="text-[9px] font-medium leading-tight text-center">{tab.label}</span>
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
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
