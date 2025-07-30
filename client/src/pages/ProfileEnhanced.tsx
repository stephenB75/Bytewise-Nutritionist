/**
 * Enhanced Profile Screen Component
 * 
 * Comprehensive user profile and account management interface
 * Features achievements, settings, privacy controls, and app information
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/UserProfile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  Database,
  Award,
  Settings,
  Info,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Star,
  Trophy,
  Target,
  Flame,
  Calendar,
  Download,
  Trash2,
  RefreshCw,
  Globe,
  Smartphone
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { AchievementCelebration } from '@/components/AchievementCelebration';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  personalInfo?: {
    age?: number;
    height?: number;
    weight?: number;
    activityLevel?: string;
    gender?: string;
  };
  privacySettings?: {
    profileVisibility: string;
    dataSharing: boolean;
    analytics: boolean;
  };
  notificationSettings?: {
    mealReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
    appUpdates: boolean;
  };
  displaySettings?: {
    theme: string;
    units: string;
    language: string;
  };
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
  earnedAt: string;
  achievementType: string;
}

function ProfileEnhanced({ onNavigate }: ProfileProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAchievement, setCelebrationAchievement] = useState<any>(null);
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  // Fetch user profile
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use auth user data as fallback
  const user = userProfile || authUser;

  // Fetch user achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/achievements'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sample user stats
  const userStats = {
    totalMealsLogged: 156,
    currentStreak: 12,
    caloriesTracked: 78543,
    favoriteFood: "Greek Yogurt",
    joinedDate: "January 2024"
  };

  const profileSections = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display Settings', icon: Palette },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'about', label: 'About Bytewise', icon: Info },
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input 
                defaultValue={(user as any)?.firstName || ''}
                placeholder="Enter your first name"
                className="text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input 
                defaultValue={(user as any)?.lastName || ''}
                placeholder="Enter your last name"
                className="text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Input 
                defaultValue={(user as any)?.email || ''}
                placeholder="Enter your email"
                className="flex-1 text-base"
              />
              {(user as any)?.emailVerified ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setCelebrationAchievement({
                      title: 'Email Sent!',
                      description: 'Please check your inbox to confirm your email address.',
                      icon: Mail
                    });
                    setShowCelebration(true);
                  }}
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Confirm Email
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <Input 
                type="number"
                placeholder="25"
                className="text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (ft'in")
              </label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  placeholder="5"
                  className="text-base flex-1"
                />
                <span className="text-sm text-gray-500 self-center">ft</span>
                <Input 
                  type="number"
                  placeholder="8"
                  className="text-base flex-1"
                />
                <span className="text-sm text-gray-500 self-center">in</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <Input 
                type="number"
                placeholder="154"
                className="text-base"
              />
            </div>
          </div>
        </div>

        <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </Card>

      {/* Stats Overview */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Journey</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Flame className="w-6 h-6 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{userStats.currentStreak}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{userStats.totalMealsLogged}</p>
            <p className="text-sm text-gray-600">Meals Logged</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Target className="w-6 h-6 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{userStats.caloriesTracked.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Calories Tracked</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Star className="w-6 h-6 mx-auto text-purple-500 mb-2" />
            <p className="text-lg font-bold text-gray-900">{userStats.favoriteFood}</p>
            <p className="text-sm text-gray-600">Top Food</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // Sample achievements with detailed information
  const sampleAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Logged your first meal and started your nutrition journey",
      icon: Target,
      colorClass: "bg-green-100 text-green-600",
      trophyType: "Bronze",
      earnedAt: "2025-01-15",
      points: 50,
      category: "Getting Started"
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Maintained consistent logging for 7 consecutive days",
      icon: Calendar,
      colorClass: "bg-blue-100 text-blue-600",
      trophyType: "Silver",
      earnedAt: "2025-01-22",
      points: 100,
      category: "Consistency"
    },
    {
      id: 3,
      title: "Calorie Master",
      description: "Successfully tracked 10,000 total calories",
      icon: Flame,
      colorClass: "bg-orange-100 text-orange-600",
      trophyType: "Gold",
      earnedAt: "2025-01-28",
      points: 200,
      category: "Tracking"
    }
  ];

  const renderAchievements = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Achievement Gallery</h3>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Star className="w-3 h-3 mr-1" />
            {sampleAchievements.reduce((sum, a) => sum + a.points, 0)} Points
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {sampleAchievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <div 
                key={achievement.id} 
                className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setCelebrationAchievement({
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon
                  });
                  setShowCelebration(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${achievement.colorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {achievement.trophyType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Category: {achievement.category}</span>
                      <span>{achievement.points} points</span>
                      <span>Earned {new Date(achievement.earnedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            );
          })}
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => {
              setCelebrationAchievement({
                title: "Keep Going!",
                description: "Continue tracking your nutrition to unlock more achievements!",
                icon: Trophy
              });
              setShowCelebration(true);
            }}
          >
            <Trophy className="w-4 h-4 mr-2" />
            View All Achievements
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy & Security</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Control who can see your profile information</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Data Sharing</h4>
              <p className="text-sm text-gray-600">Allow anonymized data to improve app features</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-600">Help us understand how you use the app</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Account Security</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Meal Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded to log your meals</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Achievement Alerts</h4>
              <p className="text-sm text-gray-600">Celebrate when you earn new achievements</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Reports</h4>
              <p className="text-sm text-gray-600">Receive your weekly nutrition summary</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">App Updates</h4>
              <p className="text-sm text-gray-600">Stay informed about new features</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Display Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="justify-start">
                <Smartphone className="w-4 h-4 mr-2" />
                Auto
              </Button>
              <Button variant="outline" className="justify-start">
                Light
              </Button>
              <Button variant="outline" className="justify-start">
                Dark
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start">
                <Globe className="w-4 h-4 mr-2" />
                Metric (kg, cm)
              </Button>
              <Button variant="outline" className="justify-start">
                Imperial (lb, ft)
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <Button variant="outline" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              English (US)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 mb-3">Download all your nutrition data</p>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export All Data (CSV)
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sync & Backup</h4>
            <p className="text-sm text-gray-600 mb-3">Keep your data safe and synchronized</p>
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-red-700 mb-2">Danger Zone</h4>
            <p className="text-sm text-gray-600 mb-3">Permanently delete all your data</p>
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAboutBytewise = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">About Bytewise Nutritionist</h3>
        
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Bytewise</h4>
            <p className="text-gray-600">Your Personal Nutrition Companion</p>
          </div>

          <Separator />

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>App Version</span>
              <span className="font-medium">2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="font-medium">2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span>Database</span>
              <span className="font-medium">USDA FoodData Central</span>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-gray-600">
            <p>© 2024 Bytewise Nutritionist</p>
            <p>Developed with ❤️ for healthy living</p>
            <p className="mt-2">
              Powered by USDA FoodData Central and designed for mobile-first nutrition tracking
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Privacy Policy
            </Button>
            <Button variant="outline" className="flex-1">
              Terms of Service
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderPersonalInfo();
      case 'achievements': return renderAchievements();
      case 'privacy': return renderPrivacySettings();
      case 'notifications': return renderNotificationSettings();
      case 'display': return renderDisplaySettings();
      case 'data': return renderDataManagement();
      case 'about': return renderAboutBytewise();
      default: return renderPersonalInfo();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Hero Section */}
      <HeroSection
        title={`Welcome, ${(user as any)?.firstName || 'User'}!`}
        subtitle="Manage your profile and app preferences"
        caloriesConsumed={userStats.caloriesTracked}
        caloriesGoal={userStats.totalMealsLogged}
        currentStreak={userStats.currentStreak}
      />

      {/* Navigation Tabs */}
      <div className="px-4 py-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="grid grid-cols-3 md:grid-cols-7 gap-1">
            {profileSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col h-auto py-2 px-1 ${
                    activeSection === section.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mb-1" />
                  <span className="text-xs font-medium">{section.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6">
        {renderSection()}
      </div>

      {/* Achievement Celebration Modal */}
      <AchievementCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        achievement={celebrationAchievement}
      />
    </div>
  );
}

export default ProfileEnhanced;