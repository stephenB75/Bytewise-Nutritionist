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
  Target,
  Lock,
  Shield
} from 'lucide-react';
import { SessionStatus } from './SessionStatus';

interface UserSettingsManagerProps {
  onClose?: () => void;
}

export function UserSettingsManager({ onClose }: UserSettingsManagerProps) {
  const { user, supabase, refetch } = useAuth();
  const { toast } = useToast();
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);


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
    console.log('🔄 UserSettingsManager: User data changed, updating form state:', {
      hasUser: !!user,
      userEmail: user?.email || 'none',
      userId: user?.id?.substring(0, 8) + '...' || 'none'
    });
    
    if (user) {
      const userData = user as any;
      const firstName = userData?.firstName || '';
      const lastName = userData?.lastName || '';
      const personalInfo = userData?.personalInfo || {};
      
      console.log('📝 UserSettingsManager: Extracted user data:', {
        firstName: firstName || '(empty)',
        lastName: lastName || '(empty)',
        personalInfoKeys: personalInfo ? Object.keys(personalInfo) : 'none',
        dailyCalorieGoal: userData?.dailyCalorieGoal || 'none'
      });
      
      // Create full name from available data
      // Check if firstName is actually an email address (common data issue)
      const isFirstNameEmail = firstName && firstName.includes('@');
      
      let fullName = '';
      if (!isFirstNameEmail && firstName && lastName) {
        // Normal case: we have proper first and last names
        fullName = `${firstName} ${lastName}`.trim();
      } else if (!isFirstNameEmail && firstName) {
        // We have a proper first name but no last name
        fullName = firstName.trim();
      } else {
        // Fallback logic: try other name sources or use email username
        fullName = personalInfo?.name || userData?.name || 
                   (userData?.email ? userData.email.split('@')[0] : '') || '';
      }
      
      console.log('🔍 UserSettingsManager: Name resolution logic:', {
        originalFirstName: firstName || '(empty)',
        originalLastName: lastName || '(empty)',
        isFirstNameEmail: isFirstNameEmail,
        finalFullName: fullName || '(empty)',
        fallbackFromEmail: userData?.email ? userData.email.split('@')[0] : 'none'
      });
      
      const newUserInfo = {
        // For display purposes, clear email-as-firstname and use proper name logic
        firstName: isFirstNameEmail ? '' : firstName,
        lastName: isFirstNameEmail ? '' : lastName, 
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
      };
      
      console.log('🎯 UserSettingsManager: Setting new form state:', {
        firstName: newUserInfo.firstName || '(empty)',
        lastName: newUserInfo.lastName || '(empty)', 
        phone: newUserInfo.phone || '(empty)',
        location: newUserInfo.location || '(empty)',
        calorieGoal: newUserInfo.calorieGoal
      });
      
      setUserInfo(newUserInfo);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Get the current access token (same logic as useAuth.ts)
      let accessToken = null;
      
      // Check for locally stored custom tokens first
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.access_token) {
            accessToken = parsedSession.access_token;
          }
        } catch (parseError) {
          console.log('Failed to parse stored session:', parseError);
        }
      }
      
      // If no custom token, check Supabase session
      if (!accessToken) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          accessToken = session.access_token;
        }
      }
      
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      // Ensure firstName and lastName are properly split from name if needed
      const [firstName = '', lastName = ''] = userInfo.name.split(' ');
      
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalInfo: {
          phone: userInfo.phone,
          location: userInfo.location,
          birth_date: userInfo.birthDate,
          height: userInfo.height,
          weight: userInfo.weight,
          activity_level: userInfo.activityLevel,
          dietary_preferences: userInfo.dietaryPreferences,
        }
      };
      
      console.log('📤 UserSettingsManager: Sending profile data:', {
        originalName: userInfo.name,
        splitFirstName: firstName.trim(),
        splitLastName: lastName.trim(),
        profileData: profileData
      });
      
      // Update user profile via backend API (database) instead of Supabase metadata
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile update failed:', response.status, errorText);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      // Update calorie goal separately via goals endpoint
      const goalsResponse = await fetch('/api/user/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          dailyCalorieGoal: userInfo.calorieGoal,
        })
      });

      if (!goalsResponse.ok) {
        const errorText = await goalsResponse.text();
        console.error('Goals update failed:', goalsResponse.status, errorText);
        throw new Error(`Failed to update calorie goal: ${goalsResponse.status}`);
      }

      // Both updates successful
      console.log('✅ Profile and goals updated successfully');

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      sonnerToast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Refetch user data to show updated information
      console.log('🔄 UserSettingsManager: Calling refetch to get updated user data...');
      const refetchResult = await refetch();
      console.log('✅ UserSettingsManager: Refetch completed, result:', {
        hasData: !!refetchResult.data,
        userEmail: refetchResult.data?.email || 'none',
        firstName: refetchResult.data?.firstName || '(empty)',
        lastName: refetchResult.data?.lastName || '(empty)'
      });

      // Force update form state with the fresh data (in case useEffect doesn't trigger)
      if (refetchResult.data) {
        const userData = refetchResult.data as any;
        const refreshedFirstName = userData?.firstName || '';
        const refreshedLastName = userData?.lastName || '';
        const refreshedPersonalInfo = userData?.personalInfo || {};
        
        // Apply same email-detection logic for refreshed data
        const isRefreshedFirstNameEmail = refreshedFirstName && refreshedFirstName.includes('@');
        
        let refreshedFullName = '';
        if (!isRefreshedFirstNameEmail && refreshedFirstName && refreshedLastName) {
          refreshedFullName = `${refreshedFirstName} ${refreshedLastName}`.trim();
        } else if (!isRefreshedFirstNameEmail && refreshedFirstName) {
          refreshedFullName = refreshedFirstName.trim();
        } else {
          refreshedFullName = refreshedPersonalInfo?.name || userData?.name || 
                             (userData?.email ? userData.email.split('@')[0] : '') || '';
        }
        
        console.log('🔄 UserSettingsManager: Force updating form state with fresh data:', {
          refreshedFirstName: refreshedFirstName || '(empty)',
          refreshedLastName: refreshedLastName || '(empty)', 
          isRefreshedFirstNameEmail: isRefreshedFirstNameEmail,
          refreshedFullName: refreshedFullName || '(empty)'
        });
        
        setUserInfo({
          firstName: isRefreshedFirstNameEmail ? '' : refreshedFirstName,
          lastName: isRefreshedFirstNameEmail ? '' : refreshedLastName, 
          name: refreshedFullName,
          email: userData?.email || '',
          phone: refreshedPersonalInfo?.phone || '',
          location: refreshedPersonalInfo?.location || '',
          birthDate: refreshedPersonalInfo?.birthDate || '',
          height: refreshedPersonalInfo?.height || '',
          weight: refreshedPersonalInfo?.weight || '',
          activityLevel: refreshedPersonalInfo?.activityLevel || 'Moderately Active',
          dietaryPreferences: refreshedPersonalInfo?.dietary_preferences || [],
          calorieGoal: userData?.dailyCalorieGoal || userData?.calorie_goal || 2000,
          joinDate: userData?.createdAt || new Date().toISOString(),
        });
      }
      
      // Dispatch custom event to notify dashboard of profile changes
      window.dispatchEvent(new CustomEvent('user-profile-updated', { 
        detail: { calorieGoal: userInfo.calorieGoal } 
      }));
    } catch (error: any) {
      console.error('❌ Profile save error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Update Failed", 
        description: error.message || "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      
      // Show more detailed error via sonner for debugging
      sonnerToast.error(`Profile save failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      // First, reauthenticate the user with current password
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.email) {
        throw new Error("User email not found");
      }

      // Try to sign in with current password to verify it's correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      sonnerToast.success("Password changed successfully!");
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Password Change Failed",
        description: error.message || "Unable to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 UserSettingsManager: Starting sign out process...');
      
      // Clear custom tokens first
      localStorage.removeItem('supabase.auth.token');
      console.log('✅ Cleared custom tokens');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('⚠️ Supabase signOut error:', error);
      } else {
        console.log('✅ Supabase session cleared');
      }
      
      // Call backend signout endpoint
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
        console.log('✅ Backend signout called');
      } catch (fetchError) {
        console.log('⚠️ Backend signout error:', fetchError);
      }
      
      // Clear all local storage data
      localStorage.removeItem('bytewise-auth');
      localStorage.removeItem('weeklyMeals');
      localStorage.removeItem('dailyStats');
      localStorage.removeItem('fastingStatus');
      
      // Clear session storage
      sessionStorage.clear();
      
      sonnerToast.success("Signed out successfully!");
      
      // Close modal if present
      if (onClose) onClose();
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('auth-state-change'));
      
      // Force page reload to reset all state and redirect to login
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('❌ Sign out error:', error);
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
            {/* Session Status Card */}
            <SessionStatus />
            
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

            {/* Password Change Section */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="profile-section-title flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-400" />
                  Security Settings
                </h4>
                {!showPasswordChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordChange(true)}
                    className="border-purple-400/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-400"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </div>

              {showPasswordChange && (
                <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300 font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-purple-400" />
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300 font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-purple-400" />
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300 font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-purple-400" />
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="border-white/30 text-gray-300 hover:border-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {changingPassword ? (
                        <>Changing Password...</>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
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