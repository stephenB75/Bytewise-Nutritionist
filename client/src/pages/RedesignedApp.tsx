/**
 * Complete App Redesign - Modern Nutrition Tracker
 * Clean, minimalist design keeping the powerful calorie calculator functionality
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import CalorieCalculator from '@/components/CalorieCalculator';
import { LogoBrand } from '@/components/LogoBrand';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { 
  Home,
  Calculator, 
  User,
  Settings,
  Search,
  Plus,
  Target,
  TrendingUp,
  Clock,
  Bell,
  ChefHat,
  Activity,
  Apple,
  Flame,
  Scale,
  Heart,
  Menu,
  X
} from 'lucide-react';

interface RedesignedAppProps {
  onNavigate?: (page: string) => void;
}

export default function RedesignedApp({ onNavigate }: RedesignedAppProps) {
  const [activeTab, setActiveTab] = useState('calculator'); // Start with calculator as main focus
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Use rotating background hook
  const { backgroundImage } = useRotatingBackground(activeTab);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const menuItems = [
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const quickStats = [
    { label: 'Daily Goal', value: '2,100', unit: 'cal', color: 'bg-blue-500', icon: Target },
    { label: 'Consumed', value: '1,234', unit: 'cal', color: 'bg-green-500', icon: Flame },
    { label: 'Remaining', value: '866', unit: 'cal', color: 'bg-orange-500', icon: Clock },
    { label: 'Water', value: '6', unit: 'cups', color: 'bg-cyan-500', icon: Heart },
  ];

  const recentMeals = [
    { name: 'Grilled Chicken Salad', calories: 450, time: '12:30 PM', type: 'lunch' },
    { name: 'Greek Yogurt', calories: 150, time: '10:00 AM', type: 'snack' },
    { name: 'Oatmeal with Berries', calories: 320, time: '8:00 AM', type: 'breakfast' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Nutrition Calculator</h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                USDA Database
              </Badge>
            </div>
            {/* Direct calculator integration without extra wrapper */}
            <CalorieCalculator 
              onNavigate={onNavigate}
              isCompact={false}
            />
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
            
            {/* Weekly Progress */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">This Week</h3>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-500 mb-1 font-medium">{day}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                      index < 4 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">Goal Achievement</span>
                <span className="font-bold text-green-600">85%</span>
              </div>
            </Card>

            {/* Monthly Trends */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Monthly Trends</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Average Daily Calories</span>
                  <span className="font-bold text-blue-600">1,987 cal</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Weight Change</span>
                  <span className="font-bold text-green-600">-2.1 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Consistency Score</span>
                  <span className="font-bold text-purple-600">92%</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            
            {/* User Info Card */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Nutrition Tracker</h3>
                  <p className="text-gray-600 font-medium">Health Goals: Active</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">28</div>
                  <div className="text-sm text-gray-700 font-medium">Days Tracked</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">15</div>
                  <div className="text-sm text-gray-700 font-medium">Goals Achieved</div>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-700">Notifications</span>
                  <div className="w-12 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-1 shadow-sm">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm transition-transform"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-700">Dark Mode</span>
                  <div className="w-12 h-6 bg-gray-300 rounded-full p-1 shadow-sm">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-700">Units</span>
                  <span className="text-blue-600 font-medium">Metric</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome message and quick access to calculator */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Welcome to ByteWise</h3>
              <p className="text-gray-600 mb-4">Your comprehensive nutrition tracking companion with USDA database integration.</p>
              <Button 
                onClick={() => setActiveTab('calculator')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Start Calculating Nutrition
              </Button>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-gray-600" />
                    <Badge variant="secondary" className="text-xs">
                      {stat.unit}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        // Default to calculator as main feature
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Nutrition Calculator</h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                USDA Database
              </Badge>
            </div>
            <CalorieCalculator 
              onNavigate={onNavigate}
              isCompact={false}
            />
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(248, 250, 252, 0.92), rgba(239, 246, 255, 0.88), rgba(238, 242, 255, 0.85)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <LogoBrand size="sm" className="scale-90" />
            <div>
              <p className="text-sm text-gray-600 font-medium">{greeting}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-blue-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
            <div className="grid grid-cols-4 gap-1 p-4">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  className={`flex-col h-16 space-y-1 transition-all duration-200 ${
                    activeTab === item.id 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                      : "hover:bg-blue-50 hover:scale-105"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex-col h-16 space-y-1 rounded-none transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-gradient-to-t from-blue-500/20 to-purple-500/20 text-blue-600 border-t-2 border-blue-500" 
                  : "hover:bg-blue-50 text-gray-600"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}