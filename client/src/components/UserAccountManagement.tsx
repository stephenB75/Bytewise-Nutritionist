/**
 * User Account Management Component
 * Comprehensive account settings and user information management with ByteWise brand styling
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Target, 
  Activity, 
  Bell, 
  Lock, 
  Edit3, 
  Save, 
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserAccountManagementProps {
  onClose?: () => void;
}

export function UserAccountManagement({ onClose }: UserAccountManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : '',
    email: (user as any)?.email || '',
    phone: (user as any)?.personalInfo?.phone || '',
    birthDate: (user as any)?.personalInfo?.birthDate || '',
    location: (user as any)?.personalInfo?.location || '',
    height: (user as any)?.personalInfo?.height || '',
    weight: (user as any)?.personalInfo?.weight || '',
    activityLevel: (user as any)?.personalInfo?.activityLevel || 'Moderately Active',
    goals: (user as any)?.personalInfo?.goals || [],
    joinDate: (user as any)?.createdAt ? new Date((user as any).createdAt).toISOString().split('T')[0] : ''
  });

  const [preferences, setPreferences] = useState({
    units: 'imperial',
    notifications: {
      mealReminders: true,
      goalAlerts: true,
      weeklyReports: true,
      achievements: true
    },
    privacy: {
      profileVisible: false,
      shareProgress: false,
      dataAnalytics: true
    }
  });

  const handleSave = async () => {
    try {
      // Save user info to backend
      const response = await fetch('/api/auth/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      if (response.ok) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your account information has been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category: string, field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as Record<string, boolean>),
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-black min-h-screen px-6 py-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-[#faed39] to-[#1f4aa6] rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>Account Management</h2>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Manage your profile and account settings</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Profile Information */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            <User className="w-5 h-5 mr-2 text-[#faed39]" />
            Profile Information
          </h3>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={isEditing ? "bg-[#45c73e] hover:bg-[#3ab82e] text-white" : "border-[#1f4aa6] text-[#1f4aa6] hover:bg-[#1f4aa6] hover:text-white"}
          >
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Full Name</label>
            {isEditing ? (
              <Input
                value={userInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
              />
            ) : (
              <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Email</label>
            {isEditing ? (
              <Input
                value={userInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
              />
            ) : (
              <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Phone</label>
            {isEditing ? (
              <Input
                value={userInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                placeholder="(555) 123-4567"
              />
            ) : (
              <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Location</label>
            {isEditing ? (
              <Input
                value={userInfo.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="border-gray-300 focus:border-[#1f4aa6] focus:ring-[#1f4aa6] text-center"
                placeholder="City, State"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded border text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.location || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Height</label>
            {isEditing ? (
              <Input
                value={userInfo.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                placeholder="5'10&quot;"
              />
            ) : (
              <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.height || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Weight</label>
            {isEditing ? (
              <Input
                value={userInfo.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                placeholder="170 lbs"
              />
            ) : (
              <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.weight || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Activity Level</label>
            <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.activityLevel}</p>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>
          <Bell className="w-5 h-5 mr-2 text-[#faed39]" />
          Notification Preferences
        </h3>

        <div className="space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
              <div>
                <p className="text-white capitalize font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {key === 'mealReminders' && 'Get reminders to log your meals'}
                  {key === 'goalAlerts' && 'Notifications when you reach goals'}
                  {key === 'weeklyReports' && 'Weekly nutrition summary reports'}
                  {key === 'achievements' && 'Celebrate your accomplishments'}
                </p>
              </div>
              <Button
                variant={value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePreferenceChange('notifications', key, !value)}
                className={value ? "bg-[#45c73e] hover:bg-[#3ab82e] text-white" : "border-white/30 text-white hover:bg-white/20"}
              >
                {value ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>
          <Shield className="w-5 h-5 mr-2 text-[#1f4aa6]" />
          Privacy & Security
        </h3>

        <div className="space-y-4">
          {Object.entries(preferences.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
              <div>
                <p className="text-white capitalize font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {key === 'profileVisible' && 'Make your profile visible to other users'}
                  {key === 'shareProgress' && 'Share your progress with friends'}
                  {key === 'dataAnalytics' && 'Help improve the app with anonymous data'}
                </p>
              </div>
              <Button
                variant={value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePreferenceChange('privacy', key, !value)}
                className={value ? "bg-[#1f4aa6] hover:bg-[#1850a0] text-white" : "border-white/30 text-white hover:bg-white/20"}
              >
                {value ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>Account Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div>
              <p className="text-white font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Sign Out</p>
              <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>Sign out of your account</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="border-white/30 text-white hover:bg-white/20"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}