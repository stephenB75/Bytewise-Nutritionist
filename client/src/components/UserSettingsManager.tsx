/**
 * Unified User Settings Manager Component - Redesigned for dark theme
 * Single consolidated card for profile and personal information management
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  LogOut,
  Phone,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

interface UserSettingsManagerProps {
  onClose?: () => void;
}

export function UserSettingsManager({ onClose }: UserSettingsManagerProps) {
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
    
    console.log('Save button clicked, starting save process...');
    setIsSaving(true);
    
    try {
      // Split the name field into firstName and lastName for validation
      const [firstName = '', lastName = ''] = (userInfo.name || '').split(' ');
      
      // Validate required fields
      if (!userInfo.name?.trim()) {
        console.log('Validation failed: Name is required');
        toast({
          title: "Validation Error", 
          description: "Name is required",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Get current session for authentication
      console.log('Getting authentication session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('No authentication session found');
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your profile",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      console.log('Sending profile update request...');
      // Save to database via API endpoint with proper authentication
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          personalInfo: {
            phone: userInfo.phone || '',
            birthDate: userInfo.birthDate || '',
            location: userInfo.location || '',
            height: userInfo.height || '',
            weight: userInfo.weight || '',
            age: userInfo.age || '',
            bio: userInfo.bio || '',
            activityLevel: userInfo.activityLevel || 'Moderately Active',
            goals: userInfo.goals || [],
          }
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API error:', errorData);
        throw new Error(errorData.message || 'Failed to save profile to database');
      }

      const savedData = await response.json();
      console.log('Profile saved successfully:', savedData);
      
      // Also update Supabase auth metadata
      await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }
      });

      setIsEditing(false);
      
      console.log('Showing success toast notification');
      
      // Use both toast systems to ensure notification shows
      toast({
        title: "Profile Saved Successfully",
        description: `Your profile has been saved. ${savedData.itemsUpdated || 0} items updated.`,
      });
      
      sonnerToast.success("Profile Saved", {
        description: `Your profile has been saved. ${savedData.itemsUpdated || 0} items updated.`,
      });
      
      // Force a brief delay to ensure toast is visible
      setTimeout(() => {
        console.log('Save operation completed successfully');
      }, 100);
      
    } catch (error: any) {
      console.error('Profile save error:', error);
      
      // Use both toast systems to ensure error notification shows
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save profile. Please try again.",
        variant: "destructive",
      });
      
      sonnerToast.error("Save Failed", {
        description: error.message || "Unable to save profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Failed",
        description: "Unable to sign out. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate" style={{ fontFamily: "'League Spartan', sans-serif" }}>Personal Profile</h2>
            <p className="text-gray-300 text-sm truncate" style={{ fontFamily: "'Work Sans', sans-serif" }}>Manage your account and personal information</p>
          </div>
        </div>
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-white/30 text-gray-300 hover:border-white/50 hover:text-white flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex-1 sm:flex-none"
            >
              {isSaving ? (
                <>Loading...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                <CheckCircle className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-1 truncate" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {userInfo.name || user?.email?.split('@')[0] || 'ByteWise User'}
              </h3>
              <p className="text-gray-300 text-sm truncate">{userInfo.email || user?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="border-white/30 text-gray-300 hover:border-white/50 hover:text-white w-full sm:w-auto"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Personal Information
            </h4>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-400" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.name || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-400" />
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                Location
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.location}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.location || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                Birth Date
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={userInfo.birthDate}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.birthDate || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Health Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Health & Fitness
            </h4>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                Height (ft/in)
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={Math.floor((parseInt(userInfo.height) || 0) / 12)}
                    onChange={(e) => {
                      const feet = parseInt(e.target.value) || 0;
                      const inches = (parseInt(userInfo.height) || 0) % 12;
                      setUserInfo(prev => ({ ...prev, height: (feet * 12 + inches).toString() }));
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 flex-1"
                    placeholder="Feet"
                  />
                  <Input
                    type="number"
                    value={(parseInt(userInfo.height) || 0) % 12}
                    onChange={(e) => {
                      const inches = parseInt(e.target.value) || 0;
                      const feet = Math.floor((parseInt(userInfo.height) || 0) / 12);
                      setUserInfo(prev => ({ ...prev, height: (feet * 12 + inches).toString() }));
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 flex-1"
                    placeholder="Inches"
                  />
                </div>
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.height ? `${Math.floor(parseInt(userInfo.height) / 12)}'${parseInt(userInfo.height) % 12}"` : 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                Weight (lbs)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={userInfo.weight ? Math.round(parseFloat(userInfo.weight) * 2.20462) : ''}
                  onChange={(e) => {
                    const lbs = parseFloat(e.target.value) || 0;
                    const kg = lbs / 2.20462;
                    setUserInfo(prev => ({ ...prev, weight: kg.toFixed(1) }));
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  placeholder="Enter your weight in pounds"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.weight ? `${Math.round(parseFloat(userInfo.weight) * 2.20462)} lbs` : 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                Activity Level
              </label>
              {isEditing ? (
                <select
                  value={userInfo.activityLevel}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, activityLevel: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                  <option value="Extremely Active">Extremely Active</option>
                </select>
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                  {userInfo.activityLevel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                Email Address
              </label>
              <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                {userInfo.email || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-end pt-6 border-t border-white/20 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-red-400/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}