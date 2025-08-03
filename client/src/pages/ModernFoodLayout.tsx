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
      {/* Full-Screen Hero Section with Food Image */}
      <div className="relative h-80 overflow-hidden rounded-none -mx-4 -mt-6">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop')`
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
          <h1 className="text-4xl font-bold mb-3">Every Bite a</h1>
          <h1 className="text-4xl font-bold mb-4 text-orange-400">Better Choice!</h1>
          <p className="text-lg text-gray-200 mb-6 max-w-sm">Track nutrition with precision using our USDA database</p>
          <Button 
            onClick={() => setActiveTab('calculator')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full text-lg shadow-lg"
          >
            Calculate Nutrition
          </Button>
        </div>
      </div>

      {/* Search Bar - Dark theme */}
      <div className="relative px-4 py-4 -mx-4">
        <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search foods, meals, ingredients..."
          className="pl-12 pr-12 h-14 rounded-2xl border-gray-700 bg-gray-800 text-white placeholder-gray-400 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button size="sm" className="absolute right-6 top-1/2 transform -translate-y-1/2 rounded-xl bg-orange-500 hover:bg-orange-600">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Visual Categories Grid */}
      <div className="space-y-4 px-4">
        <h2 className="text-xl font-bold text-white">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`relative overflow-hidden rounded-2xl h-24 ${category.color} hover:scale-105 transition-transform duration-300 cursor-pointer`}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl mb-1">{category.emoji}</div>
                  <div className="font-bold text-sm">{category.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Foods */}
      <div className="space-y-4 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Popular This Week</h2>
          <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {featuredFoods.map((food) => (
            <div key={food.id} className="relative overflow-hidden rounded-2xl h-48 hover:scale-105 transition-transform duration-300">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('${food.image}')`
                }}
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="flex space-x-2">
                    {food.tags.map((tag) => (
                      <Badge key={tag} className="bg-orange-500/80 text-white text-xs border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="ghost" className="text-white hover:text-red-400 hover:bg-white/20">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">{food.name}</h3>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{food.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{food.time}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-orange-300">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{food.calories} cal</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-300">
                      P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 rounded-full">
                      Add to Cart
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
    <div className="min-h-screen bg-black">
      {/* Dark Header with minimal design */}
      <div className="bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoBrand />
            <div className="text-white">
              <div className="flex items-center space-x-1 text-sm text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>Nutrition Hub</span>
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="relative text-white hover:bg-gray-800">
            <ShoppingBag className="w-5 h-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs bg-orange-500 text-white">
              3
            </Badge>
          </Button>
        </div>
      </div>

      {/* Main Content with dark theme */}
      <div className="bg-gray-900 min-h-screen px-4 py-6 pb-20">
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