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
import { LogoBrand } from '@/components/LogoBrand';
import { UserProfile } from '@/components/UserProfile';
import { ProfileInfoCard } from '@/components/ProfileInfoCard';
import { DataManagementPanel } from '@/components/DataManagementPanel';
import { AchievementCelebration } from '@/components/AchievementCelebration';
import { UserAccountManagement } from '@/components/UserAccountManagement';
import { AwardsAchievements } from '@/components/AwardsAchievements';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { useAuth } from '@/hooks/useAuth';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { 
  Search, 
  Heart, 
  User, 
  Plus,
  ChevronRight,
  Flame,
  Target,
  Activity,
  Zap,
  Settings,
  Trophy,
  Calendar,
  Download,
  Bell,
  Shield,
  RefreshCw,
  X
} from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Navigation } from '@/components/Navigation';

interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [showConfettiCelebration, setShowConfettiCelebration] = useState(false);
  const [confettiAchievement, setConfettiAchievement] = useState<any>(null);
  const [dailyCalories, setDailyCalories] = useState(1850);
  const [weeklyCalories, setWeeklyCalories] = useState(12950);
  const [goalCalories, setGoalCalories] = useState(2100);
  const [weeklyGoal, setWeeklyGoal] = useState(14700);
  const [loggedMeals, setLoggedMeals] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [trackingView, setTrackingView] = useState('daily'); // 'daily' or 'weekly'
  const [profileSection, setProfileSection] = useState('overview'); // 'overview', 'account', 'achievements', 'data'
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'achievement' as const,
      title: 'Daily Goal Reached! 🏆',
      message: 'Congratulations! You\'ve reached your daily calorie goal.',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2', 
      type: 'info' as const,
      title: 'Weekly Summary Ready',
      message: 'Your weekly nutrition report is available for download.',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'achievement' as const,
      title: 'Weekly Goal Achievement! 🎉',
      message: 'Amazing! You\'ve completed your weekly nutrition goal.',
      timestamp: new Date(Date.now() - 86400000),
      read: false
    },
    {
      id: '3',
      type: 'success' as const,
      title: 'Meal Logged Successfully',
      message: 'Your lunch has been added to today\'s nutrition tracking.',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    }
  ]);

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
  
  // Auth and achievement hooks
  const { user, loading } = useAuth();
  const { achievements, celebrationAchievement, showCelebration, closeCelebration } = useGoalAchievements();
  const { backgroundImage } = useRotatingBackground(activeTab);

  // Handle new achievements
  useEffect(() => {
    if (celebrationAchievement) {
      setCurrentAchievement(celebrationAchievement);
      setShowAchievement(true);
    }
  }, [celebrationAchievement]);

  // Listen for goal achievements and trigger confetti
  useEffect(() => {
    const handleGoalAchievement = (event: any) => {
      const achievement = event.detail;
      setConfettiAchievement(achievement);
      setShowConfettiCelebration(true);
      
      // Add notification
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'achievement' as const,
        title: achievement.title,
        message: achievement.message,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    };

    window.addEventListener('achievement-unlocked', handleGoalAchievement);
    return () => window.removeEventListener('achievement-unlocked', handleGoalAchievement);
  }, []);

  // Load logged meals from localStorage
  useEffect(() => {
    const loadLoggedMeals = () => {
      const stored = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = stored.filter((meal: any) => meal.date === today);
      setLoggedMeals(todayMeals);
      
      // Calculate daily calories from logged meals
      const totalCalories = todayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
      setDailyCalories(totalCalories);
    };

    loadLoggedMeals();

    // Listen for meal logging events
    const handleMealLogged = () => {
      loadLoggedMeals();
    };

    window.addEventListener('calories-logged', handleMealLogged);
    window.addEventListener('meal-logged-success', handleMealLogged);
    window.addEventListener('refresh-weekly-data', handleMealLogged);

    return () => {
      window.removeEventListener('calories-logged', handleMealLogged);
      window.removeEventListener('meal-logged-success', handleMealLogged);
      window.removeEventListener('refresh-weekly-data', handleMealLogged);
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



  // Render functions for each page
  const renderHome = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        


        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-8 max-w-2xl">
            {/* CSS Logo - Hero Size */}
            <div className="mb-8">
              <div 
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setActiveTab('home')}
                style={{
                  fontFamily: "'League Spartan', sans-serif",
                  textAlign: 'center'
                }}
              >
                <div 
                  style={{
                    fontSize: '4.5rem',
                    fontWeight: '900', 
                    lineHeight: '0.9',
                    color: '#7dd3fc',
                    marginBottom: '0.5rem',
                    textTransform: 'lowercase',
                    letterSpacing: '-0.02em'
                  }}
                >
                  bytewise
                </div>
                <div 
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '300',
                    color: 'rgba(255,255,255,0.8)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                  }}
                >
                  nutritionist
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Track Your
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Nutrition
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Track nutrition with scientific precision using our comprehensive USDA database
            </p>
            
            <div className="pt-8">
              <Button 
                onClick={() => setActiveTab('calculator')}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black px-16 py-6 rounded-full text-2xl shadow-2xl transform hover:scale-105 transition-all duration-500 border-2 border-orange-400/30"
              >
                Start Tracking
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-8 bg-black">
        {/* Enhanced Daily Progress Metrics with Graphs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Today's Progress</h2>
            <Button 
              variant="ghost" 
              className="text-orange-400 hover:text-orange-300"
              onClick={() => {
                // Check calorie calculator functionality
                setActiveTab('calculator');
                console.log('Navigating to calculator for nutrition tracking');
              }}
            >
              Track Food
            </Button>
          </div>

          {/* Daily Calorie Progress Card with Graph */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Daily Calories</h3>
                  <p className="text-gray-400 text-sm">{Math.round(dailyCalories)}/{goalCalories} kcal</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-400">{Math.round((dailyCalories/goalCalories)*100)}%</div>
                <div className="text-xs text-gray-400">of goal</div>
              </div>
            </div>
            {/* Progress Bar Graph */}
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((dailyCalories/goalCalories)*100, 100)}%` }}
              />
              {dailyCalories >= goalCalories && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
              )}
            </div>
            {/* Detailed metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-orange-400">{loggedMeals.length}</div>
                <div className="text-xs text-gray-400">Meals</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-orange-400">{Math.round(dailyCalories - goalCalories)}</div>
                <div className="text-xs text-gray-400">Remaining</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-orange-400">{Math.round((dailyCalories/goalCalories)*100)}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
          </Card>

          {/* Weekly Progress Card with Trend Line */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Weekly Progress</h3>
                  <p className="text-gray-400 text-sm">{Math.round(weeklyCalories)}/{weeklyGoal} kcal</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{Math.round((weeklyCalories/weeklyGoal)*100)}%</div>
                <div className="text-xs text-gray-400">completed</div>
              </div>
            </div>
            {/* Weekly Progress Bar */}
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((weeklyCalories/weeklyGoal)*100, 100)}%` }}
              />
            </div>
            {/* Detailed weekly metrics */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-blue-400">7</div>
                <div className="text-xs text-gray-400">Days</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-blue-400">{Math.round(weeklyCalories/7)}</div>
                <div className="text-xs text-gray-400">Avg/Day</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-blue-400">{Math.round(weeklyGoal - weeklyCalories)}</div>
                <div className="text-xs text-gray-400">Remain</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-bold text-blue-400">{loggedMeals.length * 7}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </Card>

          {/* Macros Breakdown with Mini Graphs */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Protein</div>
                <div className="text-xl font-bold text-green-400 mb-2">140g</div>
                <div className="flex items-end space-x-px h-6">
                  {[0.4, 0.6, 0.8, 0.7, 0.9].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-green-400/30 rounded-t"
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Carbs</div>
                <div className="text-xl font-bold text-yellow-400 mb-2">180g</div>
                <div className="flex items-end space-x-px h-6">
                  {[0.5, 0.7, 0.6, 0.8, 0.85].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-yellow-400/30 rounded-t"
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Fat</div>
                <div className="text-xl font-bold text-purple-400 mb-2">65g</div>
                <div className="flex items-end space-x-px h-6">
                  {[0.6, 0.4, 0.7, 0.9, 0.8].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-purple-400/30 rounded-t"
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Goal Achievement Check */}
          {dailyCalories >= goalCalories && (
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">Daily Goal Achieved!</h3>
                  <p className="text-green-200">You've reached your calorie target for today. Keep it up!</p>
                </div>
                <Button 
                  onClick={() => {
                    setShowAchievement(true);
                    setCurrentAchievement({
                      title: "Daily Goal Achieved!",
                      description: "You've hit your calorie target for today"
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Celebrate
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Daily &
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  Weekly
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Track your nutrition progress and log meals
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-8 bg-black">
        {/* Food Search Bar - Moved Here */}
        <div className="mb-6">
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
            onClick={() => setActiveTab('calculator')}
            className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Food with Calculator
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
                        console.log('Delete meal clicked:', meal);
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
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

            {/* Daily Breakdown */}
            <div className="grid grid-cols-1 gap-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const dayCalories = Math.round(dailyCalories * (0.7 + Math.random() * 0.6)); // Simulated data
                const isToday = index === new Date().getDay();
                return (
                  <Card key={day} className={`bg-white/10 backdrop-blur-md border-white/20 p-4 ${isToday ? 'border-orange-500/50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-orange-500' : 'bg-gray-600'}`} />
                        <span className="text-white font-medium">{day}</span>
                        {isToday && <span className="text-xs text-orange-400">(Today)</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{dayCalories} cal</span>
                        <div className="text-xs text-gray-400">{Math.round((dayCalories/goalCalories)*100)}% of goal</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Your
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Goals
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Track daily and weekly nutrition goals to unlock achievements
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-8 bg-black">
        {/* Goal Progress Cards */}
        <div className="space-y-6 mb-8">
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
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Welcome to
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Nutrition
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Sign in to start tracking your nutrition journey
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-8 bg-black">
        {/* Sign In Component */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h3>
          <div className="space-y-4">
            <Input
              placeholder="Email"
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
            <Input
              type="password"
              placeholder="Password"
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400"
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
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Daily &
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Weekly
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Track your calorie intake and search for foods to log
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-8 bg-black">
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
              className="pl-28 pr-16 h-16 bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-md rounded-2xl text-xl font-medium"
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
        {/* Daily/Weekly Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl">
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
          <Button 
            variant="outline" 
            className="border-green-500/50 text-green-400 bg-green-500/10 hover:bg-green-500/20 font-semibold px-6 py-3 rounded-xl"
            onClick={() => {
              console.log('This Week clicked - functionality activated');
              // Show weekly data
              const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
              const totalWeeklyCalories = weeklyMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
              const toast = document.createElement('div');
              toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = `This week: ${Math.round(totalWeeklyCalories)} calories logged`;
              document.body.appendChild(toast);
              setTimeout(() => document.body.removeChild(toast), 3000);
            }}
          >
            This Week
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
                      console.log('Edit meal clicked:', meal);
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
      </div>
    </div>
  );


  const renderCalculator = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                USDA
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Calculator
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Precise nutrition data for every ingredient using comprehensive USDA database
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>
      
      {/* Content Section - Completely Separate and Underneath */}
      <div className="bg-white">
        <CalorieCalculator 
          onNavigate={onNavigate}
          isCompact={false}
        />
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
          }}
        />
        
        {/* Hero Content - ONLY TEXT OVERLAY */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Your
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>
            </div>
            
            <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
              Manage your account, view achievements, and track your progress
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Content Section - Completely Separate and Underneath */}
      <div className="px-6 py-8 bg-black min-h-screen">
        {/* Profile Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', name: 'Overview', icon: User },
            { id: 'account', name: 'Account', icon: Settings },
            { id: 'achievements', name: 'Awards', icon: Trophy },
            { id: 'data', name: 'Data', icon: Download }
          ].map((section) => {
            const IconComponent = section.icon;
            return (
              <Button
                key={section.id}
                variant={profileSection === section.id ? "default" : "outline"}
                size="sm"
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  profileSection === section.id 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => setProfileSection(section.id)}
              >
                <IconComponent className="w-4 h-4" />
                <span>{section.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Profile Content - Stacked Vertically */}
        <div className="space-y-6">
          {profileSection === 'overview' && (
            <>
              <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6">
                <UserProfile />
              </div>
              <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6">
                <ProfileInfoCard />
              </div>
            </>
          )}
          
          {profileSection === 'account' && (
            <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6">
              <UserAccountManagement onClose={() => setProfileSection('overview')} />
            </div>
          )}
          
          {profileSection === 'achievements' && (
            <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6">
              <AwardsAchievements onClose={() => setProfileSection('overview')} />
            </div>
          )}
          
          {profileSection === 'data' && (
            <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6">
              <DataManagementPanel />
            </div>
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
      case 'data':
        return (
          <div className="space-y-0">
            {/* Full-Screen Hero Section */}
            <div className="relative h-screen overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${backgroundImage}')`
                }}
              />
              
              {/* Hero Content - ONLY TEXT OVERLAY */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                      Data
                    </h1>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                        Management
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
                    Export, sync, and manage your nutrition tracking data
                  </p>
                </div>
              </div>
              
              {/* Scroll indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
                <div className="animate-bounce">
                  <ChevronRight className="w-6 h-6 rotate-90" />
                </div>
              </div>
            </div>

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
    <div className="min-h-screen bg-black">
      {/* Fixed Notification Header on all pages */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full p-3 border-0 shadow-lg"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
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
      
      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
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
    </div>
  );
}
