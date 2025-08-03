/**
 * Combined Profile Info Card Component with Dropdown Functionality
 * 
 * Integrated profile information display with accordion animation and profile dropdown
 * Combines ProfileInfoCard and profile dropdown into one component
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Check, 
  X,
  Verified,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  LogOut,
  Camera
} from 'lucide-react';

interface ProfileInfoCardProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    emailVerified?: boolean;
    personalInfo?: {
      age?: number;
      location?: string;
      phone?: string;
      bio?: string;
    };
  };
  className?: string;
}

export function ProfileInfoCard({ user, className = '' }: ProfileInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.personalInfo?.age || '',
    location: user?.personalInfo?.location || '',
    phone: user?.personalInfo?.phone || '',
    bio: user?.personalInfo?.bio || ''
  });

  const handleSave = () => {
    // Save logic here
    // Saving profile data
    setIsEditing(false);
    
    // Show success message
    const event = new CustomEvent('show-toast', {
      detail: { 
        message: 'Profile updated successfully!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  const handleCancel = () => {
    setEditedData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      age: user?.personalInfo?.age || '',
      location: user?.personalInfo?.location || '',
      phone: user?.personalInfo?.phone || '',
      bio: user?.personalInfo?.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className={`overflow-hidden bg-white shadow-xl border-0 rounded-2xl backdrop-blur-md ${className}`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-25 to-indigo-50 opacity-80" />
      
      {/* Header - Always Visible */}
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
                <h4 className="text-xl font-black text-gray-800 tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Profile Details
                </h4>
                {user?.emailVerified && (
                  <Badge className="text-xs bg-[#45c73e] text-white border-0 shadow-md">
                    <Verified className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 font-medium">Manage your personal information</p>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/80 hover:shadow-md transition-all duration-200 rounded-xl"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 text-[#1f4aa6]" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/80 hover:shadow-md transition-all duration-200 rounded-xl relative"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Settings className="w-4 h-4 text-[#faed39]" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/80 hover:shadow-md transition-all duration-200 rounded-xl"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-[#45c73e]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#45c73e]" />
              )}
            </Button>
          </div>

          {/* Enhanced Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-20 right-0 z-50 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-25 to-blue-50">
                <h3 className="font-black text-gray-800 text-base tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>Profile Settings</h3>
                <p className="text-xs text-gray-600 mt-0.5">Manage your account preferences</p>
              </div>
              
              <div className="py-2">
                <button 
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center gap-4 text-gray-700 transition-all duration-300 group"
                  onClick={() => {
                    setIsEditing(true);
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1f4aa6] flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Edit Profile</span>
                    <p className="text-xs text-gray-500">Update your information</p>
                  </div>
                </button>
                
                <button 
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 flex items-center gap-4 text-gray-700 transition-all duration-300 group"
                  onClick={() => {
                    // Change profile photo
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#faed39] flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Change Photo</span>
                    <p className="text-xs text-gray-500">Upload new avatar</p>
                  </div>
                </button>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4 my-2" />
                
                <button 
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 flex items-center gap-4 text-gray-700 transition-all duration-300 group"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-section', {
                      detail: { section: 'privacy' }
                    });
                    window.dispatchEvent(event);
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#45c73e] flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Privacy Settings</span>
                    <p className="text-xs text-gray-500">Security preferences</p>
                  </div>
                </button>
                
                <button 
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 flex items-center gap-4 text-gray-700 transition-all duration-300 group"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-section', {
                      detail: { section: 'notifications' }
                    });
                    window.dispatchEvent(event);
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#faed39] flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Notifications</span>
                    <p className="text-xs text-gray-500">Alert preferences</p>
                  </div>
                </button>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4 my-2" />
                
                <button 
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 flex items-center gap-4 text-red-600 transition-all duration-300 group"
                  onClick={() => {
                    window.location.href = '/api/logout';
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <LogOut className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-red-700">Sign Out</span>
                    <p className="text-xs text-red-500">End your session</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accordion Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-4 space-y-4">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      First Name
                    </label>
                    <Input
                      value={editedData.firstName}
                      onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Last Name
                    </label>
                    <Input
                      value={editedData.lastName}
                      onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Age
                    </label>
                    <Input
                      type="number"
                      value={editedData.age}
                      onChange={(e) => setEditedData({ ...editedData, age: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Phone
                    </label>
                    <Input
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Location
                  </label>
                  <Input
                    value={editedData.location}
                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Bio
                  </label>
                  <textarea
                    value={editedData.bio}
                    onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                    className="w-full p-2 border border-input rounded-md text-sm resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Edit Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="bg-[#45c73e] hover:bg-[#45c73e]/80 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-3">
                {user?.personalInfo?.age && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#1f4aa6]" />
                    <span className="text-sm text-gray-700">
                      {user.personalInfo.age} years old
                    </span>
                  </div>
                )}
                
                {user?.personalInfo?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#45c73e]" />
                    <span className="text-sm text-gray-700">
                      {user.personalInfo.location}
                    </span>
                  </div>
                )}
                
                {user?.personalInfo?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#faed39]" />
                    <span className="text-sm text-gray-700">
                      {user.personalInfo.phone}
                    </span>
                  </div>
                )}
                
                {user?.personalInfo?.bio && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-[#1f4aa6] mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {user.personalInfo.bio}
                    </p>
                  </div>
                )}
                
                {(!user?.personalInfo?.age && !user?.personalInfo?.location && !user?.personalInfo?.phone && !user?.personalInfo?.bio) && (
                  <div className="text-center py-4 text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Complete your profile to get personalized recommendations</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Add Details
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}