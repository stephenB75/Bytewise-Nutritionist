/**
 * Unified User Settings Manager Component
 * Single consolidated card for profile and personal information management
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
  Mail, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  LogOut
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

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Modern Header - Consistent with other pages */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-[#1f4aa6] to-[#45c73e] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-white/20 rounded-xl shadow-lg">
                    <User className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#faed39] rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    Personal Profile
                  </h2>
                  <p className="text-white/90 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Content Card - White background like other pages */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl overflow-hidden">
          <div className="p-6">
            {/* Profile Header with Enhanced Visuals */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-6">
              <div className="flex flex-col items-center lg:items-start gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] flex items-center justify-center text-white text-2xl lg:text-3xl font-black shadow-lg group-hover:scale-105 transition-all duration-300">
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
                  {(user as any)?.emailVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#45c73e] rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                      <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 mb-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                      {userInfo.name || 'User Profile'}
                    </h3>
                    {(user as any)?.emailVerified && (
                      <Badge className="text-xs bg-gradient-to-r from-[#45c73e] to-[#3ab82e] text-white border-0 shadow-md px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" strokeWidth={2.5} />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {userInfo.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Modern Design */}
              <div className="flex-1 flex flex-col items-center lg:items-end gap-3">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={isSaving}
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 border-2 border-[#1f4aa6] text-[#1f4aa6] hover:bg-[#1f4aa6] hover:text-white bg-white hover:shadow-lg rounded-xl transition-all duration-300 font-semibold"
                  >
                    <Edit3 className="w-4 h-4 mr-2" strokeWidth={2.5} />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      size="lg"
                      disabled={isSaving}
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-[#45c73e] to-[#3ab82e] hover:from-[#3ab82e] hover:to-[#2d8f26] text-white shadow-lg disabled:opacity-50 border-0 rounded-xl transition-all duration-300 font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-white hover:shadow-lg rounded-xl transition-all duration-300 font-semibold"
                    >
                      <X className="w-4 h-4 mr-2" strokeWidth={2.5} />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information Fields - Modern Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  <User className="w-4 h-4 mr-2 text-[#1f4aa6]" strokeWidth={2.5} />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={userInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white border-2 border-gray-200 text-gray-900 focus:border-[#1f4aa6] focus:ring-2 focus:ring-[#1f4aa6]/20 rounded-lg py-2 px-3 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {userInfo.name || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  <Mail className="w-4 h-4 mr-2 text-[#1f4aa6]" strokeWidth={2.5} />
                  Email Address
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {userInfo.email || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
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