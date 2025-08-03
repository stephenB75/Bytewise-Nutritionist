/**
 * Modern Food App Layout - Inspired by Deliveroo, Chipotle, and premium food apps
 * Features: Hero sections, food cards, nutrition breakdown, and modern navigation
 */

import { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [dailyCalories, setDailyCalories] = useState(1850);
  const [weeklyCalories, setWeeklyCalories] = useState(12950);
  const [goalCalories] = useState(2100);
  const [weeklyGoal] = useState(14700);
  
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
          <div className="space-y-6 max-w-2xl">
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
                  <p className="text-gray-400 text-sm">{dailyCalories}/{goalCalories} kcal</p>
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
            {/* Mini Graph Line */}
            <div className="flex items-end space-x-1 h-8">
              {[0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.88].map((height, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-orange-400/30 rounded-t"
                  style={{ height: `${height * 100}%` }}
                />
              ))}
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
                  <p className="text-gray-400 text-sm">{weeklyCalories}/{weeklyGoal} kcal</p>
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
            {/* Weekly Trend Graph */}
            <div className="flex items-end space-x-1 h-12">
              {[0.3, 0.5, 0.7, 0.6, 0.8, 0.9, 0.88].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div 
                    className="bg-blue-400/40 rounded-t mb-1"
                    style={{ height: `${height * 70}%` }}
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </div>
                </div>
              ))}
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
        {/* Food Search Bar - Moved here from home page */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search foods to log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-md rounded-2xl text-lg"
          />
        </div>
        {/* Daily/Weekly Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl">
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl">
            This Week
          </Button>
        </div>

        {/* Logged Foods */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Logged Today</h3>
          {[
            { name: 'Breakfast: Oatmeal with Berries', calories: 320, time: '8:30 AM' },
            { name: 'Lunch: Grilled Chicken Salad', calories: 450, time: '1:15 PM' },
            { name: 'Snack: Greek Yogurt', calories: 150, time: '3:45 PM' },
          ].map((meal, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{meal.name}</h4>
                  <p className="text-gray-400 text-sm">{meal.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold">{meal.calories} cal</p>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSignIn = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600&h=1200&fit=crop')`
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

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return renderCalculator();
      case 'home':
        return renderHome();
      case 'daily':
        return renderDailyWeekly();
      case 'signin':
        return renderSignIn();
      case 'achievements':
        return (
          <div className="space-y-0">
            {/* Full-Screen Hero Section */}
            <div className="relative h-screen overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1600&h=1200&fit=crop')`
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
                        Achievements
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

              {/* Earned Achievements */}
              {achievements && achievements.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Earned Achievements</h3>
                  {achievements.map((achievement, index) => (
                    <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{achievement.title}</h4>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-0">
            {/* Full-Screen Hero Section */}
            <div className="relative h-screen overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=1200&fit=crop')`
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
      case 'profile':
        return (
          <div className="space-y-0">
            {/* Full-Screen Hero Section */}
            <div className="relative h-screen overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1600&h=1200&fit=crop')`
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
                      <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Profile
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-2xl text-gray-200 font-light leading-relaxed max-w-xl mx-auto">
                    Manage your account, settings, and nutrition data
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
              {/* User Info Card */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-3 border-orange-500"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center border-3 border-orange-500">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Nutrition Tracker'}
                    </h2>
                    <p className="text-gray-400 text-sm">{user?.email || 'member@nutrition.app'}</p>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mt-2">
                      <Trophy className="w-3 h-3 mr-1" />
                      Pro Member
                    </Badge>
                  </div>
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400 mb-1">2100</div>
                    <div className="text-xs text-blue-300">Daily Goal</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400 mb-1">{achievements?.length || 0}</div>
                    <div className="text-xs text-green-300">Achievements</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-400 mb-1">47</div>
                    <div className="text-xs text-purple-300">Days Tracked</div>
                  </div>
                </div>
              </Card>

              {/* Account Settings */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-blue-400" />
                      <span className="text-white">Push Notifications</span>
                    </div>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-white">Privacy Settings</span>
                    </div>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-orange-400" />
                      <span className="text-white">Nutrition Goals</span>
                    </div>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Data Management */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-12 bg-green-600 border-green-500 text-white hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Data
                    </Button>
                  </div>
                  
                  {/* Data Overview */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                      <div className="text-lg font-bold text-white">156</div>
                      <div className="text-xs text-gray-400">Meals Logged</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                      <div className="text-lg font-bold text-white">2.4 MB</div>
                      <div className="text-xs text-gray-400">Data Size</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden overflow-y-auto">


      {/* Minimal Dark Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LogoBrand 
              size="sm" 
              clickable 
              onClick={() => setActiveTab('home')}
            />
          </div>
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="relative text-white hover:bg-white/10 rounded-full p-2"
              onClick={() => {
                console.log('Notification clicked - checking functionality');
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('ByteWise Nutrition', {
                    body: 'Daily goal reminder: Stay on track with your nutrition!',
                    icon: '/icon-192.svg'
                  });
                } else if ('Notification' in window) {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification('ByteWise Nutrition', {
                        body: 'Notifications enabled! You\'ll get goal reminders.',
                        icon: '/icon-192.svg'
                      });
                    }
                  });
                }
              }}
            >
              <Bell className="w-5 h-5" />
              {achievements && achievements.length > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{achievements.length}</span>
                </div>
              )}
            </Button>
            
            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-2 ml-2">
                <UserProfile size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Content with Vertical Scroll */}
      <div className="bg-black min-h-screen pt-16 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Dark Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'home', label: 'Home', icon: Search },
            { id: 'calculator', label: 'Nutrition', icon: Zap },
            { id: 'daily', label: 'Daily', icon: Calendar },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex-col h-16 space-y-1 relative ${
                activeTab === item.id 
                  ? 'text-orange-500 bg-orange-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* Achievement badge */}
              {item.id === 'achievements' && achievements && achievements.length > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{achievements.length}</span>
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Achievement Celebration Modal */}
      {(showAchievement || showCelebration) && (
        <AchievementCelebration
          isOpen={showAchievement || showCelebration}
          onClose={() => {
            setShowAchievement(false);
            if (showCelebration) {
              closeCelebration();
            }
          }}
          achievement={currentAchievement || celebrationAchievement}
        />
      )}
    </div>
  );
}