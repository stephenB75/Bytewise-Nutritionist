/**
 * Unified User Settings Manager Component - Redesigned for dark theme
 * Single consolidated card for profile and personal information management
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';
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
  Activity,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';

interface UserSettingsManagerProps {
  onClose?: () => void;
}

export function UserSettingsManager({ onClose }: UserSettingsManagerProps) {
  const { user, supabase, refetch } = useAuth();
  const { toast } = useToast();
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  // User information state - consolidated from both components
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    birthDate: '',
    height: '',
    weight: '',
    activityLevel: 'Moderately Active',
    dietaryPreferences: [],
    calorieGoal: 2000,
    joinDate: new Date().toISOString(),
  });

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      const userData = user as any;
      const firstName = userData?.firstName || '';
      const lastName = userData?.lastName || '';
      const personalInfo = userData?.personalInfo || {};
      
      // Create full name from available data
      const fullName = firstName && lastName ? `${firstName} ${lastName}`.trim() : 
                       personalInfo?.name || userData?.name || firstName || userData?.email?.split('@')[0] || '';
      
      setUserInfo({
        firstName,
        lastName, 
        name: fullName,
        email: userData?.email || '',
        phone: personalInfo?.phone || '',
        location: personalInfo?.location || '',
        birthDate: personalInfo?.birthDate || '',
        height: personalInfo?.height || '',
        weight: personalInfo?.weight || '',
        activityLevel: personalInfo?.activityLevel || 'Moderately Active',
        dietaryPreferences: personalInfo?.dietary_preferences || [],
        calorieGoal: userData?.dailyCalorieGoal || userData?.calorie_goal || 2000,
        joinDate: userData?.createdAt || new Date().toISOString(),
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Ensure firstName and lastName are properly split from name if needed
      const [firstName = '', lastName = ''] = userInfo.name.split(' ');
      
      // Update user profile via backend API (database) instead of Supabase metadata
      const response = await apiRequest('PUT', '/api/user/profile', {
        firstName: userInfo.firstName || firstName.trim(),
        lastName: userInfo.lastName || lastName.trim(),
        personalInfo: {
          phone: userInfo.phone,
          location: userInfo.location,
          birth_date: userInfo.birthDate,
          height: userInfo.height,
          weight: userInfo.weight,
          activity_level: userInfo.activityLevel,
          dietary_preferences: userInfo.dietaryPreferences,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update calorie goal separately via goals endpoint
      const goalsResponse = await apiRequest('PUT', '/api/user/goals', {
        dailyCalorieGoal: userInfo.calorieGoal,
      });

      if (!goalsResponse.ok) {
        throw new Error('Failed to update calorie goal');
      }

      // Both updates successful

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      sonnerToast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Refetch user data to show updated information
      await refetch();
      
      // Debug logging for profile update verification
      
      // Dispatch custom event to notify dashboard of profile changes
      window.dispatchEvent(new CustomEvent('user-profile-updated', { 
        detail: { calorieGoal: userInfo.calorieGoal } 
      }));
    } catch (error) {
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
      
      // Clear all user-related local storage data
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('userMeals');
      localStorage.removeItem('dailyGoals');
      localStorage.removeItem('waterIntake');
      localStorage.removeItem('fastingState');
      
      // Redirect to home page after sign out
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
            
            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="profile-section-title">
                  Personal Information
                </h4>
            
            <div className="space-y-2">
              <label className="profile-label">
                <User className="w-4 h-4 mr-2 text-blue-400" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.name}
                  onChange={(e) => {
                    const fullName = e.target.value;
                    const [firstName = '', lastName = ''] = fullName.split(' ');
                    setUserInfo(prev => ({ 
                      ...prev, 
                      name: fullName,
                      firstName: firstName.trim(),
                      lastName: lastName.trim()
                    }));
                  }}
                  className="profile-input-field"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="profile-display-text">
                  {userInfo.name || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="profile-label">
                <Phone className="w-4 h-4 mr-2 text-blue-400" />
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="profile-input-field"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="profile-display-text">
                  {userInfo.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="profile-label">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                Location
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.location}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, location: e.target.value }))}
                  className="profile-input-field"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="profile-display-text">
                  {userInfo.location || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="profile-label">
                <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                Birth Date
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={userInfo.birthDate}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="profile-input-field"
                />
              ) : (
                <p className="profile-display-text">
                  {userInfo.birthDate || 'Not provided'}
                </p>
              )}
            </div>
          </div>

              {/* Health Information Fields */}
              <div className="space-y-4">
                <h4 className="profile-section-title">
                  Health & Fitness
                </h4>
                
                <div className="space-y-2">
              <label className="profile-label">
                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                Height (ft/in)
              </label>
              {isEditing ? (
                <Input
                  value={userInfo.height}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, height: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                  placeholder="e.g., 5'8&quot; or 5 ft 8 in"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
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
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                  placeholder="Enter your weight in pounds"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
                  {userInfo.weight ? `${Math.round(parseFloat(userInfo.weight) * 2.20462)} lbs` : 'Not provided'}
                </p>
              )}
            </div>

                <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                Email Address
              </label>
              <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-all">
                {userInfo.email || 'Not provided'}
              </p>
            </div>
              </div>
            </div>

            {/* Action Buttons - Always visible */}
            <div className="flex justify-between items-center pt-6 border-t border-white/20 mt-8">
              {/* Sign Out Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-red-400/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              
              {/* Save/Edit Buttons */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="border-white/30 text-gray-300 hover:border-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-white/30 text-gray-300 hover:border-white/50 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
    </div>
  );
}