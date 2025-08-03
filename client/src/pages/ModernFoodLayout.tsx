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
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Track Your Nutrition</h1>
          <p className="text-orange-100 mb-4">Discover healthy meals with precise calorie tracking</p>
          <Button 
            onClick={() => setActiveTab('calculator')}
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6"
          >
            Calculate Nutrition
          </Button>
        </div>
        <div className="absolute right-4 top-4 opacity-20">
          <Apple className="w-24 h-24" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search for foods, recipes, ingredients..."
          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 bg-gray-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="flex-shrink-0 h-12 px-4 rounded-xl border-gray-200 hover:bg-gray-50"
            >
              <span className="text-lg mr-2">{category.emoji}</span>
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Foods */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Popular This Week</h2>
          <Button variant="ghost" size="sm" className="text-orange-600">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {featuredFoods.map((food) => (
            <Card key={food.id} className="p-0 overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="flex">
                <div className="w-24 h-24 flex-shrink-0">
                  <img 
                    src={food.image} 
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{food.name}</h3>
                      <p className="text-sm text-gray-600">{food.description}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{food.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{food.time}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">{food.calories} cal</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {food.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCalculator = () => (
    <div className="space-y-4">
      {/* Header with nutrition focus */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">USDA Nutrition Calculator</h1>
        <p className="text-green-100">Get precise nutrition data for any ingredient</p>
      </div>
      
      {/* Calculator Component */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
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
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Favorites</h1>
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Start adding foods to your favorites</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Nutrition Tracker</h2>
                  <p className="text-gray-600">ByteWise Member</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2,100</div>
                  <div className="text-sm text-gray-600">Daily Goal</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">1,234</div>
                  <div className="text-sm text-gray-600">Today</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoBrand />
            <div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Nutrition Tracking</span>
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="relative">
            <ShoppingBag className="w-5 h-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs bg-orange-500">
              3
            </Badge>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
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
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600'
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