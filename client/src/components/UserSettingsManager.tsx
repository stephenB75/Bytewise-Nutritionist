/**
 * Unified User Settings Manager Component
 * Consolidates Overview and Account functionality into one comprehensive user settings interface
 * Features: Profile editing, account preferences, privacy settings, and data management
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile editing states (remove tab navigation since we're combining everything)
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
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
    try {
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
          title: "Settings updated",
          description: "Your profile information has been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your settings. Please try again.",
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
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>User Settings</h2>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Manage your profile, account, and privacy settings</p>
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

        {/* Combined Profile & Account Section */}
        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
            {/* Profile Header */}
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] flex items-center justify-center text-white text-xl font-bold shadow-2xl border-2 border-white/50 backdrop-blur-sm">
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
                      <h4 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                        Profile Information
                      </h4>
                      {user?.emailVerified && (
                        <Badge className="text-xs bg-[#45c73e] text-white border-0 shadow-md">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 font-medium">Manage your personal information</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/20 hover:shadow-md transition-all duration-200 rounded-xl"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4 text-[#1f4aa6]" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/20 hover:shadow-md transition-all duration-200 rounded-xl"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#faed39]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#faed39]" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Basic Profile Info - Always Visible */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="p-2 bg-[#1f4aa6]/20 rounded-full">
                    <User className="w-4 h-4 text-[#1f4aa6]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Name</p>
                    <p className="text-white font-semibold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                      {userInfo.name || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="p-2 bg-[#45c73e]/20 rounded-full">
                    <Mail className="w-4 h-4 text-[#45c73e]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Email</p>
                    <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                      {userInfo.email || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Profile Details */}
              {isExpanded && (
                <div className="mt-6 space-y-6">
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">First Name</label>
                          <Input
                            value={userInfo.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">Last Name</label>
                          <Input
                            value={userInfo.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">Age</label>
                          <Input
                            type="number"
                            value={userInfo.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">Phone</label>
                          <Input
                            value={userInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Location</label>
                        <Input
                          value={userInfo.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="bg-white/20 border-white/30 text-white text-center placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39]"
                          placeholder="City, State"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Bio</label>
                        <textarea
                          value={userInfo.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          className="w-full p-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-gray-400 focus:border-[#faed39] focus:ring-[#faed39] resize-none"
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Save/Cancel Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSave}
                          className="bg-[#45c73e] hover:bg-[#3ab82e] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="border-white/30 text-gray-300 hover:bg-white/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <div className="p-2 bg-[#faed39]/20 rounded-full">
                          <Phone className="w-4 h-4 text-[#faed39]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Phone</p>
                          <p className="text-white font-semibold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            {userInfo.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <div className="p-2 bg-[#1f4aa6]/20 rounded-full">
                          <MapPin className="w-4 h-4 text-[#1f4aa6]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Location</p>
                          <p className="text-white font-semibold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            {userInfo.location || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {userInfo.bio && (
                        <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Bio</p>
                          <p className="text-white" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            {userInfo.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Account Settings */}
            {/* Personal Information */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  <User className="w-5 h-5 mr-2 text-[#faed39]" />
                  Personal Information
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
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white flex items-center mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                <Bell className="w-5 h-5 mr-2 text-[#45c73e]" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-400">
                        {key === 'mealReminders' && 'Get reminded to log your meals'}
                        {key === 'goalAlerts' && 'Receive notifications about goal progress'}
                        {key === 'weeklyReports' && 'Weekly nutrition and health summaries'}
                        {key === 'achievements' && 'Celebrate your achievements and milestones'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white flex items-center mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                <Settings className="w-5 h-5 mr-2 text-[#1f4aa6]" />
                Account Actions
              </h3>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </Card>
          {/* Privacy & Security Settings */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white flex items-center mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              <Shield className="w-5 h-5 mr-2 text-[#45c73e]" />
              Privacy & Security
            </h3>

            <div className="space-y-4">
              {Object.entries(preferences.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-400">
                      {key === 'profileVisible' && 'Make your profile visible to other users'}
                      {key === 'shareProgress' && 'Allow sharing of your progress and achievements'}
                      {key === 'dataAnalytics' && 'Help improve our services with anonymous usage data'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', key, checked)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}