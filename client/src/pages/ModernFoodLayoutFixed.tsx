/**
 * Modern Food App Layout - Fixed React useState implementation
 * Features: Hero sections, food cards, nutrition breakdown, sign-on module, and modern navigation
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
  RefreshCw,
  X
} from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';

interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

// Fixed useState implementation using class component pattern
class ModernFoodLayoutFixed extends React.Component<ModernFoodLayoutProps> {
  state = {
    activeTab: 'home',
    searchQuery: '',
    showAchievement: false,
    currentAchievement: null as any,
    dailyCalories: 1850,
    weeklyCalories: 12950,
    goalCalories: 2100,
    weeklyGoal: 14700,
    loggedMeals: [] as any[],
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
      },
      {
        id: '3',
        type: 'success' as const,
        title: 'Meal Logged Successfully',
        message: 'Your lunch has been added to today\'s nutrition tracking.',
        timestamp: new Date(Date.now() - 7200000),
        read: true
      }
    ]
  };

  handleTabChange = (tab: string) => {
    this.setState({ activeTab: tab });
  };

  handleSearch = (query: string) => {
    this.setState({ searchQuery: query });
  };

  handleNotificationClick = () => {
    this.setState(prevState => ({ 
      showNotificationDropdown: !prevState.showNotificationDropdown 
    }));
  };

  handleMarkAsRead = (notificationId: string) => {
    this.setState(prevState => ({
      notifications: prevState.notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    }));
  };

  render() {
    const { onNavigate } = this.props;
    const {
      activeTab,
      searchQuery,
      showAchievement,
      currentAchievement,
      dailyCalories,
      weeklyCalories,
      goalCalories,
      weeklyGoal,
      loggedMeals,
      showNotificationDropdown,
      trackingView,
      notifications
    } = this.state;

    const unreadCount = notifications.filter(n => !n.read).length;

    // Food background images
    const foodImages = [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&h=1080&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&h=1080&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&h=1080&fit=crop&crop=center'
    ];

    const backgroundImage = foodImages[0];

    // Render Home Tab
    if (activeTab === 'home') {
      return (
        <div className="min-h-screen bg-background">
          {/* Hero Section with Background */}
          <div 
            className="relative min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            {/* Header */}
            <header className="relative z-10 flex items-center justify-between p-6 text-white">
              <LogoBrand />
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 relative"
                  onClick={this.handleNotificationClick}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Sign In
                </Button>
              </div>
              
              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <NotificationDropdown 
                  notifications={notifications}
                  onMarkAsRead={this.handleMarkAsRead}
                  onClose={() => this.setState({ showNotificationDropdown: false })}
                />
              )}
            </header>

            {/* Hero Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center text-center px-6 min-h-[80vh]">
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
                    onClick={() => onNavigate?.('calculator')}
                  >
                    Start Tracking
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-4"
                    onClick={() => this.handleTabChange('tracking')}
                  >
                    View Progress
                  </Button>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
              <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white py-20">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
                Everything You Need
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Flame className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Calorie Tracking</h3>
                  <p className="text-gray-600">
                    Accurate USDA nutrition data with smart calorie calculations
                  </p>
                </Card>
                
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Progress Analytics</h3>
                  <p className="text-gray-600">
                    Weekly insights and goal tracking with visual progress
                  </p>
                </Card>
                
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Goal Achievement</h3>
                  <p className="text-gray-600">
                    Set and reach your nutrition goals with smart recommendations
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
            <div className="flex justify-around py-3">
              <Button 
                variant={activeTab === 'home' ? 'default' : 'ghost'}
                size="sm" 
                className="flex flex-col items-center gap-1"
                onClick={() => this.handleTabChange('home')}
              >
                <span className="text-lg">🏠</span>
                <span className="text-xs">Home</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center gap-1"
                onClick={() => onNavigate?.('calculator')}
              >
                <Flame className="w-4 h-4" />
                <span className="text-xs">Track</span>
              </Button>
              <Button 
                variant={activeTab === 'tracking' ? 'default' : 'ghost'}
                size="sm" 
                className="flex flex-col items-center gap-1"
                onClick={() => this.handleTabChange('tracking')}
              >
                <Activity className="w-4 h-4" />
                <span className="text-xs">Progress</span>
              </Button>
              <Button 
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                size="sm" 
                className="flex flex-col items-center gap-1"
                onClick={() => this.handleTabChange('profile')}
              >
                <User className="w-4 h-4" />
                <span className="text-xs">Profile</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Render other tabs with simplified content
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {activeTab === 'tracking' && 'Progress Tracking'}
            {activeTab === 'profile' && 'User Profile'}
          </h1>
          
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => this.handleTabChange('home')}
              className="mb-4"
            >
              ← Back to Home
            </Button>
          </div>

          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Daily Progress</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="text-2xl font-bold">{dailyCalories}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Goal</p>
                    <p className="text-2xl font-bold">{goalCalories}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full"
                >
                  Sign In to Access Profile
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
          <div className="flex justify-around py-3">
            <Button 
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              size="sm" 
              className="flex flex-col items-center gap-1"
              onClick={() => this.handleTabChange('home')}
            >
              <span className="text-lg">🏠</span>
              <span className="text-xs">Home</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex flex-col items-center gap-1"
              onClick={() => onNavigate?.('calculator')}
            >
              <Flame className="w-4 h-4" />
              <span className="text-xs">Track</span>
            </Button>
            <Button 
              variant={activeTab === 'tracking' ? 'default' : 'ghost'}
              size="sm" 
              className="flex flex-col items-center gap-1"
              onClick={() => this.handleTabChange('tracking')}
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs">Progress</span>
            </Button>
            <Button 
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              size="sm" 
              className="flex flex-col items-center gap-1"
              onClick={() => this.handleTabChange('profile')}
            >
              <User className="w-4 h-4" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ModernFoodLayoutFixed;