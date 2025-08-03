/**
 * User Account Management Component
 * Comprehensive account settings and user information management
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
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
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1 (555) 123-4567',
    birthDate: '1990-05-15',
    location: 'San Francisco, CA',
    height: '5\'10"',
    weight: '165 lbs',
    activityLevel: 'Moderately Active',
    goals: ['Weight Maintenance', 'Muscle Gain', 'Better Nutrition'],
    joinDate: '2024-01-15'
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

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Saving user info:', userInfo);
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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'League Spartan', sans-serif" }}>Account Management</h2>
              <p className="text-gray-600">Manage your profile and account settings</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Information */}
        <Card className="bg-white border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Profile Information
            </h3>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={isEditing ? "bg-green-600 hover:bg-green-700" : "border-gray-300"}
            >
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block font-medium">Full Name</label>
              {isEditing ? (
                <Input
                  value={userInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-gray-300"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-2 rounded border">{userInfo.name}</p>
              )}
            </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            {isEditing ? (
              <Input
                value={userInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            ) : (
              <p className="text-white">{userInfo.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Phone</label>
            {isEditing ? (
              <Input
                value={userInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            ) : (
              <p className="text-white">{userInfo.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Location</label>
            {isEditing ? (
              <Input
                value={userInfo.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            ) : (
              <p className="text-white">{userInfo.location}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Height</label>
            {isEditing ? (
              <Input
                value={userInfo.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            ) : (
              <p className="text-white">{userInfo.height}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Weight</label>
            {isEditing ? (
              <Input
                value={userInfo.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            ) : (
              <p className="text-white">{userInfo.weight}</p>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Account Statistics</h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">47</div>
              <div className="text-sm text-gray-400">Days Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">152</div>
              <div className="text-sm text-gray-400">Meals Logged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">23</div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">89%</div>
              <div className="text-sm text-gray-400">Goal Success</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center mb-6">
          <Bell className="w-5 h-5 mr-2 text-yellow-400" />
          Notification Preferences
        </h3>

        <div className="space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-gray-400">
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
                className={value ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {value ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center mb-6">
          <Shield className="w-5 h-5 mr-2 text-red-400" />
          Privacy & Security
        </h3>

        <div className="space-y-4">
          {Object.entries(preferences.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-gray-400">
                  {key === 'profileVisible' && 'Make your profile visible to other users'}
                  {key === 'shareProgress' && 'Share your progress with friends'}
                  {key === 'dataAnalytics' && 'Help improve the app with anonymous data'}
                </p>
              </div>
              <Button
                variant={value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePreferenceChange('privacy', key, !value)}
                className={value ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {value ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </div>

        {/* Password Change */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Change Password</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Current Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className="bg-white/10 border-white/20 text-white pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Lock className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-500/10 backdrop-blur-md border-red-500/20 p-6">
        <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Delete Account</p>
              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}