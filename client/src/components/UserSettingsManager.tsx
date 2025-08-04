/**
 * Unified User Settings Manager Component
 * Single consolidated card for profile and personal information management
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
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
  EyeOff,
  ChevronDown,
  ChevronUp,
  Verified,
  Camera,
  LogOut,
  Palette,
  Globe
} from 'lucide-react';

interface UserSettingsManagerProps {
  onClose?: () => void;
  initialSection?: 'profile' | 'account' | 'privacy';
}

export function UserSettingsManager({ onClose, initialSection = 'profile' }: UserSettingsManagerProps) {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // User information state - consolidated from both components
  const [userInfo, setUserInfo] = useState({
    firstName: (user as any)?.firstName || '',
    lastName: (user as any)?.lastName || '',
    name: user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : '',
    email: (user as any)?.email || '',
    phone: (user as any)?.personalInfo?.phone || '',
    birthDate: (user as any)?.personalInfo?.birthDate || '',
    location: (user as any)?.personalInfo?.location || '',
    height: (user as any)?.personalInfo?.height || '',
    weight: (user as any)?.personalInfo?.weight || '',
    age: (user as any)?.personalInfo?.age || '',
    bio: (user as any)?.personalInfo?.bio || '',
    activityLevel: (user as any)?.personalInfo?.activityLevel || 'Moderately Active',
    goals: (user as any)?.personalInfo?.goals || [],
    joinDate: (user as any)?.createdAt ? new Date((user as any).createdAt).toISOString().split('T')[0] : ''
  });

  // Preferences and settings
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

  // Handlers
  const handleSave = async () => {
    if (isSaving) return; // Prevent double-clicking
    
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!userInfo.name?.trim()) {
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to save your profile",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/auth/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(userInfo),
      });

      if (response.ok) {
        const result = await response.json();
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your personal information has been saved successfully.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  const handleCancel = () => {
    setUserInfo({
      firstName: (user as any)?.firstName || '',
      lastName: (user as any)?.lastName || '',
      name: user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : '',
      email: (user as any)?.email || '',
      phone: (user as any)?.personalInfo?.phone || '',
      birthDate: (user as any)?.personalInfo?.birthDate || '',
      location: (user as any)?.personalInfo?.location || '',
      height: (user as any)?.personalInfo?.height || '',
      weight: (user as any)?.personalInfo?.weight || '',
      age: (user as any)?.personalInfo?.age || '',
      bio: (user as any)?.personalInfo?.bio || '',
      activityLevel: (user as any)?.personalInfo?.activityLevel || 'Moderately Active',
      goals: (user as any)?.personalInfo?.goals || [],
      joinDate: (user as any)?.createdAt ? new Date((user as any).createdAt).toISOString().split('T')[0] : ''
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-black min-h-screen px-6 py-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-[#faed39] to-[#1f4aa6] rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>Profile & Settings</h2>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Manage your personal information and account preferences</p>
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

        {/* Unified Profile & Personal Information Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] flex items-center justify-center text-white text-xl font-bold shadow-2xl border-2 border-white/50 backdrop-blur-sm">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="drop-shadow-lg">{(user?.firstName?.[0] || 'U').toUpperCase()}</span>
                  )}
                </div>
                {user?.emailVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#45c73e] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Verified className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    {userInfo.name || 'User Profile'}
                  </h3>
                  {user?.emailVerified && (
                    <Badge className="text-xs bg-[#45c73e] text-white border-0 shadow-md">
                      <Verified className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-300 font-medium">{userInfo.email}</p>
              </div>
            </div>

            {/* Action Buttons - Improved Mobile Layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="lg"
                disabled={isSaving}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className={`flex-1 sm:flex-none px-6 py-3 ${isEditing 
                  ? "bg-gradient-to-r from-[#45c73e] to-[#3ab82e] hover:from-[#3ab82e] hover:to-[#2d8f26] text-white shadow-lg disabled:opacity-50 border-0" 
                  : "border-2 border-[#1f4aa6] text-[#1f4aa6] hover:bg-[#1f4aa6] hover:text-white bg-white/90 hover:shadow-lg"
                } rounded-xl transition-all duration-300`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="font-semibold">Saving...</span>
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-5 h-5 mr-2" strokeWidth={2.5} />
                    <span className="font-semibold">Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-5 h-5 mr-2" strokeWidth={2.5} />
                    <span className="font-semibold">Edit Profile</span>
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-400 text-gray-300 hover:bg-gray-600 hover:text-white bg-white/90 hover:shadow-lg rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 mr-2" strokeWidth={2.5} />
                  <span className="font-semibold">Cancel</span>
                </Button>
              )}
            </div>
          </div>

          {/* Personal Information Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Full Name</label>
              {isEditing ? (
                <Input
                  value={userInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                />
              ) : (
                <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.name || 'Not provided'}</p>
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
                <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.email || 'Not provided'}</p>
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
              <label className="text-sm text-gray-300 mb-2 block font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>Location</label>
              {isEditing ? (
                <Input
                  value={userInfo.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                  placeholder="City, State"
                />
              ) : (
                <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.location || 'Not provided'}</p>
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
                  placeholder="150 lbs"
                />
              ) : (
                <p className="text-white bg-white/10 p-3 rounded border border-white/20 text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>{userInfo.weight || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Account Management Section */}
          <div className="border-t border-white/20 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              <Settings className="w-5 h-5 mr-2 text-[#faed39]" />
              Account Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Notification Preferences */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  <Bell className="w-4 h-4 inline mr-2 text-[#45c73e]" />
                  Notifications
                </h5>
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications', key, checked)}
                    />
                  </div>
                ))}
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  <Shield className="w-4 h-4 inline mr-2 text-[#1f4aa6]" />
                  Privacy
                </h5>
                {Object.entries(preferences.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange('privacy', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}