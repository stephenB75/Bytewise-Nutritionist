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
import { 
  Search, 
  Heart, 
  User, 
  MapPin,
  Clock,
  Star,
  Plus,
  Filter,
  ShoppingBag,
  ChevronRight,
  Flame,
  Target,
  Activity,
  Apple,
  Zap,
  Settings,
  Trophy,
  Calendar,
  Download,
  Bell,
  Shield,
  ChevronDown
} from 'lucide-react';

interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  
  // Auth and achievement hooks
  const { user, loading } = useAuth();
  const { achievements, newAchievement } = useGoalAchievements();

  // Handle new achievements
  useEffect(() => {
    if (newAchievement) {
      setCurrentAchievement(newAchievement);
      setShowAchievement(true);
    }
  }, [newAchievement]);

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

  const renderDiscover = () => (
    <div className="space-y-0">
      {/* Full-Screen Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1600&h=1200&fit=crop')`
          }}
        />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Every Bite a
              </h1>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Better Choice!
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

      {/* Search Section */}
      <div className="px-6 py-8 bg-black/50">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <Input
            placeholder="Search foods, meals, ingredients..."
            className="pl-16 pr-16 h-16 rounded-3xl border-gray-600 bg-gray-900/80 backdrop-blur-md text-white placeholder-gray-400 text-xl font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-orange-500 hover:bg-orange-600 p-4">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-6 py-8 bg-gray-900/50">
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Browse Categories</h2>
        <div className="grid grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`relative overflow-hidden rounded-3xl h-40 ${category.color} hover:scale-105 transition-all duration-700 cursor-pointer shadow-2xl group`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60" />
              <div className="absolute inset-0 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                <div className="text-center space-y-3">
                  <div className="text-5xl drop-shadow-2xl">{category.emoji}</div>
                  <div className="font-black text-xl tracking-wide drop-shadow-lg">{category.name}</div>
                </div>
              </div>
              
              {/* Hover effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Featured Foods Section */}
      <div className="px-6 py-8 bg-black">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">Popular This Week</h2>
          <Button variant="ghost" className="text-orange-400 hover:text-orange-300 font-semibold">
            See all <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        <div className="space-y-8">
          {featuredFoods.map((food) => (
            <div key={food.id} className="relative overflow-hidden rounded-3xl h-80 hover:scale-[1.02] transition-all duration-700 shadow-2xl group">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('${food.image}')`
                }}
              />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <div className="flex space-x-3">
                    {food.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} className="bg-orange-500/90 backdrop-blur-sm text-white text-sm font-bold border-0 px-4 py-2 rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button size="lg" variant="ghost" className="text-white hover:text-red-400 hover:bg-white/20 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-7 h-7" />
                  </Button>
                </div>
                
                {/* Bottom Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-4xl font-black mb-3 tracking-tight leading-tight">{food.name}</h3>
                    <p className="text-xl text-gray-200 font-medium leading-relaxed">{food.description}</p>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-sm px-4 py-3 rounded-full">
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      <span className="text-xl font-black">{food.rating}</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-sm px-4 py-3 rounded-full">
                      <Clock className="w-6 h-6" />
                      <span className="text-xl font-bold">{food.time}</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-orange-500/90 backdrop-blur-sm px-5 py-3 rounded-full">
                      <Flame className="w-6 h-6" />
                      <span className="text-xl font-black">{food.calories} cal</span>
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <div className="text-xl text-orange-300 font-black">Nutrition Breakdown</div>
                      <div className="text-lg text-white font-bold">
                        Protein {food.protein}g • Carbs {food.carbs}g • Fat {food.fat}g
                      </div>
                    </div>
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black px-10 py-4 rounded-full text-xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      Add ${((food.calories / 100) * 2.5).toFixed(2)}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCalculator = () => (
    <div className="space-y-0 -mx-4 -mt-6">
      {/* Full-screen nutrition hero */}
      <div className="relative h-64 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(34,197,94,0.9), rgba(59,130,246,0.8)), url('https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=400&fit=crop')`
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
          <h1 className="text-3xl font-bold mb-3">USDA Nutrition</h1>
          <h1 className="text-3xl font-bold mb-4 text-yellow-300">Calculator</h1>
          <p className="text-lg text-green-100 mb-2">Precise nutrition data</p>
          <p className="text-sm text-green-200">for every ingredient</p>
        </div>
      </div>
      
      {/* Calculator Component */}
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
      case 'favorites':
        return (
          <div className="space-y-6 px-6 py-8 bg-black min-h-screen">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-white tracking-tight">Your Favorites</h1>
              <Button variant="ghost" className="text-orange-400 hover:text-orange-300">
                <Plus className="w-5 h-5 mr-2" />
                Add New
              </Button>
            </div>
            
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No favorites yet</h3>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Start adding foods to your favorites by tapping the heart icon on any food card
              </p>
              <Button 
                onClick={() => setActiveTab('discover')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full"
              >
                Discover Foods
              </Button>
            </div>
          </div>
        );
      case 'achievements':
        return (
          <div className="space-y-6 px-6 py-8 bg-black min-h-screen">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-white tracking-tight">Achievements</h1>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {achievements?.length || 0} Earned
              </Badge>
            </div>
            
            {achievements && achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="p-6 bg-gray-900/80 backdrop-blur-md border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{achievement.title}</h3>
                        <p className="text-gray-400 mb-2">{achievement.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No achievements yet</h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  Start tracking your nutrition to unlock achievements and celebrate your progress
                </p>
                <Button 
                  onClick={() => setActiveTab('calculator')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full"
                >
                  Start Tracking
                </Button>
              </div>
            )}
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6 px-6 py-8 bg-black min-h-screen">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-white tracking-tight">Data Management</h1>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <Shield className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700">
              <DataManagementPanel />
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 px-6 py-8 bg-black min-h-screen">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-white tracking-tight">Your Profile</h1>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* User Profile Card */}
            <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 border border-gray-700">
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-orange-500"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center border-4 border-orange-500">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.firstName || user?.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : 'Nutrition Tracker'}
                  </h2>
                  <p className="text-gray-400 mb-2">{user?.email || 'member@bytewise.com'}</p>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Pro Member
                  </Badge>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-800/60 rounded-2xl border border-gray-700">
                  <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">
                    {user?.dailyCalorieGoal || 2100}
                  </div>
                  <div className="text-sm text-gray-400">Daily Goal (kcal)</div>
                </div>
                <div className="text-center p-6 bg-gray-800/60 rounded-2xl border border-gray-700">
                  <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">
                    {achievements?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
              </div>

              {/* Nutrition Goals */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Nutrition Goals</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {user?.dailyProteinGoal || 150}g
                    </div>
                    <div className="text-xs text-blue-300">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {user?.dailyCarbGoal || 200}g
                    </div>
                    <div className="text-xs text-green-300">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/20 rounded-xl border border-orange-500/30">
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      {user?.dailyFatGoal || 70}g
                    </div>
                    <div className="text-xs text-orange-300">Fats</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-14 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setActiveTab('achievements')}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View Achievements
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setActiveTab('data')}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return renderDiscover();
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Minimal Dark Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LogoBrand />
            <div className="text-white text-sm font-medium">ByteWise</div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button size="sm" variant="ghost" className="relative text-white hover:bg-white/10 rounded-full p-2">
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

      {/* Full-Screen Content */}
      <div className="bg-black min-h-screen pt-16">
        {renderContent()}
      </div>

      {/* Dark Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'discover', label: 'Discover', icon: Search },
            { id: 'calculator', label: 'Nutrition', icon: Zap },
            { id: 'favorites', label: 'Favorites', icon: Heart },
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
      <AchievementCelebration
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        achievement={currentAchievement}
      />
    </div>
  );
}