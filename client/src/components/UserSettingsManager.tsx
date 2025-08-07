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
  const [accordionValue, setAccordionValue] = useState<string>("");

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
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update calorie goal separately via goals endpoint
      const goalsResponse = await fetch('/api/user/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          dailyCalorieGoal: userInfo.calorieGoal,
        })
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
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
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

      {/* Profile Card with Accordion */}
      <Accordion 
        type="single" 
        collapsible 
        value={accordionValue} 
        onValueChange={setAccordionValue}
        className="w-full space-y-6"
      >
        <AccordionItem value="profile" className="border-none">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 hover:border-white/30">
            <AccordionTrigger className="px-6 py-6 hover:bg-white/5 hover:no-underline [&[data-state=open]>div>div:last-child]:rotate-180 [&[data-state=open]]:bg-white/5">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden text-left">
                  <h3 className="text-xl font-bold text-white mb-1 truncate" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    {userInfo.name || user?.email?.split('@')[0] || 'ByteWise User'}
                  </h3>
                  <p className="text-gray-300 text-sm truncate">{userInfo.email || user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="transition-transform duration-200 text-gray-300">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 pt-0">
              <div className="space-y-6">
            {/* Edit Button */}
            {!isEditing && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-white/30 text-gray-300 hover:border-white/50 hover:text-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
            
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
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
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
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
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
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
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
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
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
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
                  {userInfo.activityLevel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium flex items-center">
                <Target className="w-4 h-4 mr-2 text-orange-400" />
                Daily Calorie Goal
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={userInfo.calorieGoal}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, calorieGoal: parseInt(e.target.value) || 2000 }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
                  placeholder="Enter daily calorie goal"
                  min="1200"
                  max="5000"
                />
              ) : (
                <p className="text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10 break-words">
                  {userInfo.calorieGoal} calories/day
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
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}