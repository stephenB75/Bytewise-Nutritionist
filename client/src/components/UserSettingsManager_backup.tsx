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
    phone: (user as any)?.phone || '',
    location: (user as any)?.location || '',
    birthDate: (user as any)?.birth_date || '',
    height: (user as any)?.height || '',
    weight: (user as any)?.weight || '',
    activityLevel: (user as any)?.activity_level || 'Moderately Active',
    dietaryPreferences: (user as any)?.dietary_preferences || [],
    joinDate: (user as any)?.created_at || new Date().toISOString(),
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone,
          location: userInfo.location,
          birth_date: userInfo.birthDate,
          height: userInfo.height,
          weight: userInfo.weight,
          activity_level: userInfo.activityLevel,
          dietary_preferences: userInfo.dietaryPreferences,
        }
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      sonnerToast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed", 
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      sonnerToast.success("Signed out successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Buttons when editing */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>
          User Profile
        </h2>
        
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
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

      {/* Profile Card - Redesigned */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
        {/* Header Section with Background */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 p-6 pb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-300 font-medium">Active User</span>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-white/30 text-white/90 hover:border-white/50 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* User Avatar and Info Section */}
        <div className="relative px-6 -mt-10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white/20">
                <User className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white/30 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-2">
              <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {userInfo.name || user?.email?.split('@')[0] || 'ByteWise User'}
              </h3>
              <p className="text-gray-300 text-sm mb-2">{userInfo.email || user?.email}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-300">
                    Joined {userInfo.joinDate ? new Date(userInfo.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-300">
                    {userInfo.location || 'Location not set'}
                  </span>
                </div>
                {userInfo.activityLevel && (
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-300">{userInfo.activityLevel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="px-6 pb-6">
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
                  <Input
                    value={userInfo.height}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, height: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    placeholder="e.g., 5'8&quot; or 5 ft 8 in"
                  />
                ) : (
                  <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                    {userInfo.height || 'Not provided'}
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
        </div>

        {/* Sign Out Button */}
        <div className="px-6 pb-6">
          <div className="flex justify-end pt-6 border-t border-white/20">
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
        </div>
      </Card>
    </div>
  );
}