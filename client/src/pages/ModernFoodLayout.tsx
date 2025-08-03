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
  Zap
} from 'lucide-react';

interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');

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
          <div className="space-y-6 px-4">
            <h1 className="text-2xl font-bold text-white">Your Favorites</h1>
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Start adding foods to your favorites</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 px-4">
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Nutrition Tracker</h2>
                  <p className="text-gray-400">ByteWise Member</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-xl">
                  <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">2,100</div>
                  <div className="text-sm text-gray-400">Daily Goal</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-xl">
                  <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <div className="text-sm text-gray-400">Today</div>
                </div>
              </div>
            </Card>
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
            <div className="text-white text-sm font-medium">Nutrition</div>
          </div>
          <Button size="sm" variant="ghost" className="relative text-white hover:bg-white/10 rounded-full p-2">
            <ShoppingBag className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">3</span>
            </div>
          </Button>
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
            { id: 'profile', label: 'Profile', icon: User },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex-col h-16 space-y-1 ${
                activeTab === item.id 
                  ? 'text-orange-500 bg-orange-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}