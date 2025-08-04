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
  Camera,
  LogOut,
  Palette,
  Globe,
  CheckCircle
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
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen px-6 py-3">
      <div className="space-y-8">
        {/* Enhanced Visual Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] p-1">
          <div className="bg-black/80 backdrop-blur-sm rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-[#faed39] to-[#1f4aa6] rounded-2xl shadow-2xl">
                    <Settings className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#45c73e] rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    Personal Profile
                  </h2>
                  <p className="text-gray-300 text-lg" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={onClose}
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Visual Profile Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f4aa6]/20 via-[#45c73e]/10 to-[#faed39]/20 p-1">
          <Card className="bg-black/90 backdrop-blur-xl border-0 p-8 rounded-3xl">
            {/* Profile Header with Enhanced Visuals */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8">
              <div className="flex flex-col items-center lg:items-start gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] flex items-center justify-center text-white text-3xl lg:text-4xl font-black shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-105 transition-all duration-300">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full rounded-3xl object-cover"
                      />
                    ) : (
                      <span className="drop-shadow-2xl">{(user?.firstName?.[0] || 'U').toUpperCase()}</span>
                    )}
                  </div>
                  {(user as any)?.emailVerified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#45c73e] rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                      <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#faed39]/20 to-[#1f4aa6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-3 mb-2">
                    <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                      {userInfo.name || 'User Profile'}
                    </h3>
                    {(user as any)?.emailVerified && (
                      <Badge className="text-sm bg-gradient-to-r from-[#45c73e] to-[#3ab82e] text-white border-0 shadow-xl px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2.5} />
                        Verified Account
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-300 font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {userInfo.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Enhanced Visual Design */}
              <div className="flex-1 flex flex-col items-center lg:items-end gap-4">
                {!isEditing ? (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={isSaving}
                      onClick={() => setIsEditing(true)}
                      className="px-10 py-5 border-3 border-[#1f4aa6] text-[#1f4aa6] hover:bg-[#1f4aa6] hover:text-white bg-white/95 hover:shadow-2xl rounded-2xl transition-all duration-300 font-bold text-lg backdrop-blur-sm hover:scale-105"
                    >
                      <Edit3 className="w-6 h-6 mr-4" strokeWidth={2.5} />
                      Edit Profile Information
                    </Button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1f4aa6]/20 to-[#45c73e]/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    <div className="relative">
                      <Button
                        variant="default"
                        size="lg"
                        disabled={isSaving}
                        onClick={handleSave}
                        className="w-full px-8 py-5 bg-gradient-to-r from-[#45c73e] to-[#3ab82e] hover:from-[#3ab82e] hover:to-[#2d8f26] text-white shadow-2xl disabled:opacity-50 border-0 rounded-2xl transition-all duration-300 font-bold text-lg hover:scale-105"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-6 h-6 mr-4 animate-spin rounded-full border-3 border-white border-t-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-6 h-6 mr-4" strokeWidth={2.5} />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        className="w-full px-8 py-5 border-3 border-gray-400 text-gray-300 hover:bg-gray-600 hover:text-white bg-white/95 hover:shadow-2xl rounded-2xl transition-all duration-300 font-bold text-lg hover:scale-105"
                      >
                        <X className="w-6 h-6 mr-4" strokeWidth={2.5} />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Visual Personal Information Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative group">
              <label className="text-sm text-gray-300 mb-3 block font-bold flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <User className="w-4 h-4 mr-2 text-[#1f4aa6]" strokeWidth={2.5} />
                Full Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <Input
                    value={userInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gradient-to-r from-white/20 to-white/10 border-2 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-2 focus:ring-[#faed39]/50 rounded-xl py-3 px-4 backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#faed39]/10 to-[#1f4aa6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-white bg-gradient-to-r from-white/15 to-white/5 p-4 rounded-xl border border-white/20 text-center font-medium backdrop-blur-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {userInfo.name || 'Not provided'}
                  </p>
                </div>
              )}
            </div>

            <div className="relative group">
              <label className="text-sm text-gray-300 mb-3 block font-bold flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <Mail className="w-4 h-4 mr-2 text-[#45c73e]" strokeWidth={2.5} />
                Email Address
              </label>
              {isEditing ? (
                <div className="relative">
                  <Input
                    value={userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gradient-to-r from-white/20 to-white/10 border-2 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#45c73e] focus:ring-2 focus:ring-[#45c73e]/50 rounded-xl py-3 px-4 backdrop-blur-sm transition-all duration-300"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#45c73e]/10 to-[#faed39]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-white bg-gradient-to-r from-white/15 to-white/5 p-4 rounded-xl border border-white/20 text-center font-medium backdrop-blur-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {userInfo.email || 'Not provided'}
                  </p>
                </div>
              )}
            </div>

            <div className="relative group">
              <label className="text-sm text-gray-300 mb-3 block font-bold flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <Phone className="w-4 h-4 mr-2 text-[#faed39]" strokeWidth={2.5} />
                Phone Number
              </label>
              {isEditing ? (
                <div className="relative">
                  <Input
                    value={userInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gradient-to-r from-white/20 to-white/10 border-2 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-2 focus:ring-[#faed39]/50 rounded-xl py-3 px-4 backdrop-blur-sm transition-all duration-300"
                    placeholder="(555) 123-4567"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#faed39]/10 to-[#1f4aa6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-white bg-gradient-to-r from-white/15 to-white/5 p-4 rounded-xl border border-white/20 text-center font-medium backdrop-blur-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {userInfo.phone || 'Not provided'}
                  </p>
                </div>
              )}
            </div>

            <div className="relative group">
              <label className="text-sm text-gray-300 mb-3 block font-bold flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <MapPin className="w-4 h-4 mr-2 text-[#45c73e]" strokeWidth={2.5} />
                Location
              </label>
              {isEditing ? (
                <div className="relative">
                  <Input
                    value={userInfo.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gradient-to-r from-white/20 to-white/10 border-2 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#45c73e] focus:ring-2 focus:ring-[#45c73e]/50 rounded-xl py-3 px-4 backdrop-blur-sm transition-all duration-300"
                    placeholder="City, State"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#45c73e]/10 to-[#faed39]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-white bg-gradient-to-r from-white/15 to-white/5 p-4 rounded-xl border border-white/20 text-center font-medium backdrop-blur-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {userInfo.location || 'Not provided'}
                  </p>
                </div>
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
    </div>
  );
}