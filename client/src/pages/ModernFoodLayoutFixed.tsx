/**
 * Modern Food App Layout - Fixed version without problematic React hooks
 * Features: Hero sections, food cards, nutrition breakdown, and modern navigation
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CalorieCalculator from '@/components/CalorieCalculator';
import { LogoBrand } from '@/components/LogoBrand';
import { UserProfile } from '@/components/UserProfile';
import { ProfileInfoCard } from '@/components/ProfileInfoCard';
import { DataManagementPanel } from '@/components/DataManagementPanel';
import { useAuth } from '@/hooks/useAuth';
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

interface ModernFoodLayoutFixedProps {
  onNavigate?: (page: string) => void;
}

// Use class component to avoid hooks issues
class ModernFoodLayoutFixed extends React.Component<ModernFoodLayoutFixedProps> {
  state = {
    activeTab: 'home',
    searchQuery: '',
    showAchievement: false,
    currentAchievement: null,
    dailyCalories: 1850,
    weeklyCalories: 12950,
    goalCalories: 2100,
    weeklyGoal: 14700,
    loggedMeals: [],
    showNotificationDropdown: false,
    trackingView: 'daily',
    notifications: [
      {
        id: '1',
        type: 'achievement' as const,
        title: 'Daily Goal Reached!',
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
      }
    ]
  };

  componentDidMount() {
    // Set up background rotation without hooks
    this.backgroundImages = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop'
    ];
    this.currentImageIndex = 0;
    
    // Auto-rotate background every 30 seconds
    this.backgroundInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.backgroundImages.length;
      this.forceUpdate();
    }, 30000);
  }

  componentWillUnmount() {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
  }

  backgroundImages = [];
  currentImageIndex = 0;
  backgroundInterval = null;

  handleTabChange = (tab: string) => {
    this.setState({ activeTab: tab });
  };

  handleSearchChange = (query: string) => {
    this.setState({ searchQuery: query });
  };

  getCurrentBackground = () => {
    return this.backgroundImages[this.currentImageIndex];
  };

  renderHeroSection = () => {
    const backgroundImage = this.getCurrentBackground();
    
    return (
      <div 
        className="relative min-h-screen flex flex-col"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("${backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-6 text-white z-10">
          <LogoBrand />
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 relative"
              onClick={() => this.setState({ showNotificationDropdown: !this.state.showNotificationDropdown })}
            >
              <Bell className="w-5 h-5" />
              {this.state.notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center text-center px-6 z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
              Track Your
              <br />
              <span className="text-yellow-300">Nutrition</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Modern food tracking with real USDA nutrition data. 
              Simplified, beautiful, and effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-white/90 text-lg px-8 py-4"
                onClick={() => this.props.onNavigate?.('calculator')}
              >
                <Flame className="w-5 h-5 mr-2" />
                Start Tracking
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-4"
                onClick={() => this.props.onNavigate?.('logger')}
              >
                <Activity className="w-5 h-5 mr-2" />
                View Progress
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce z-10">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    );
  };

  renderNutritionCards = () => {
    const dailyProgress = (this.state.dailyCalories / this.state.goalCalories) * 100;
    
    return (
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Today's Nutrition
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Calories */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-orange-500 text-white">
                  {Math.round(dailyProgress)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Calories</h3>
                <div className="text-2xl font-bold text-orange-600">
                  {this.state.dailyCalories}
                </div>
                <div className="text-sm text-gray-600">
                  of {this.state.goalCalories} goal
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Protein */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  85%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Protein</h3>
                <div className="text-2xl font-bold text-blue-600">128g</div>
                <div className="text-sm text-gray-600">of 150g goal</div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[85%] transition-all"></div>
                </div>
              </div>
            </Card>

            {/* Carbs */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-500 text-white">
                  92%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Carbs</h3>
                <div className="text-2xl font-bold text-green-600">184g</div>
                <div className="text-sm text-gray-600">of 200g goal</div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-[92%] transition-all"></div>
                </div>
              </div>
            </Card>

            {/* Fat */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-purple-500 text-white">
                  78%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Fat</h3>
                <div className="text-2xl font-bold text-purple-600">58g</div>
                <div className="text-sm text-gray-600">of 75g goal</div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-[78%] transition-all"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  renderBottomNavigation = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
        <div className="flex justify-around py-3">
          <Button 
            variant={this.state.activeTab === 'home' ? 'default' : 'ghost'}
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => {
              this.handleTabChange('home');
              this.props.onNavigate?.('redesigned');
            }}
          >
            <span className="text-lg">🏠</span>
            <span className="text-xs">Home</span>
          </Button>
          <Button 
            variant={this.state.activeTab === 'track' ? 'default' : 'ghost'}
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => {
              this.handleTabChange('track');
              this.props.onNavigate?.('calculator');
            }}
          >
            <Flame className="w-4 h-4" />
            <span className="text-xs">Track</span>
          </Button>
          <Button 
            variant={this.state.activeTab === 'progress' ? 'default' : 'ghost'}
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => {
              this.handleTabChange('progress');
              this.props.onNavigate?.('logger');
            }}
          >
            <Activity className="w-4 h-4" />
            <span className="text-xs">Progress</span>
          </Button>
          <Button 
            variant={this.state.activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => {
              this.handleTabChange('profile');
              this.props.onNavigate?.('profile');
            }}
          >
            <User className="w-4 h-4" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Notification Dropdown */}
        {this.state.showNotificationDropdown && (
          <NotificationDropdown
            notifications={this.state.notifications}
            onClose={() => this.setState({ showNotificationDropdown: false })}
            onMarkAsRead={(id) => {
              const updatedNotifications = this.state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              );
              this.setState({ notifications: updatedNotifications });
            }}
          />
        )}

        {/* Hero Section */}
        {this.renderHeroSection()}

        {/* Nutrition Cards */}
        {this.renderNutritionCards()}

        {/* Quick Actions */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => this.props.onNavigate?.('calculator')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Log Meal</h3>
                    <p className="text-gray-600">Add calories with USDA data</p>
                  </div>
                </div>
                <Button className="w-full">
                  Start Logging <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => this.props.onNavigate?.('logger')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">View Progress</h3>
                    <p className="text-gray-600">Weekly insights and trends</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Analytics <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        {this.renderBottomNavigation()}

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>
      </div>
    );
  }
}

export default ModernFoodLayoutFixed;