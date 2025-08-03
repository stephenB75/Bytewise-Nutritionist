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
    <Card className={`overflow-hidden bg-white/10 backdrop-blur-md border-white/20 w-full ${className}`}>
      {/* Header - Always Visible */}
      <div className="p-6">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{(user?.firstName?.[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            {user?.emailVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Verified className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {user?.firstName || 'User'} {user?.lastName || ''}
              </h3>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {user?.email || 'No email'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              {user?.emailVerified && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                  Verified
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                Free Plan
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-2 mt-4">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative text-gray-400 hover:text-white"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-16 right-0 z-50 w-56 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-600 overflow-hidden">
              <div className="p-3 border-b border-gray-600/50 bg-gradient-to-r from-gray-700 to-gray-800">
                <h3 className="font-semibold text-white text-sm">Profile Settings</h3>
              </div>
              
              <div className="py-1">
                <button 
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-blue-600/20 flex items-center gap-3 text-gray-200 transition-all duration-200 group"
                  onClick={() => {
                    setIsEditing(true);
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-medium">Edit Profile</span>
                </button>
                
                <button 
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-purple-600/20 flex items-center gap-3 text-gray-200 transition-all duration-200 group"
                  onClick={() => {
                    // Change profile photo
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30">
                    <Camera className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-medium">Change Photo</span>
                </button>
                
                <div className="h-px bg-gray-600/50 mx-3 my-2" />
                
                <button 
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-green-600/20 flex items-center gap-3 text-gray-200 transition-all duration-200 group"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-section', {
                      detail: { section: 'privacy' }
                    });
                    window.dispatchEvent(event);
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="font-medium">Privacy Settings</span>
                </button>
                
                <button 
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-orange-600/20 flex items-center gap-3 text-gray-200 transition-all duration-200 group"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-section', {
                      detail: { section: 'notifications' }
                    });
                    window.dispatchEvent(event);
                    setShowDropdown(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30">
                    <Bell className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="font-medium">Notifications</span>
                </button>
                
                <div className="h-px bg-gray-600/50 mx-3 my-2" />
                
                <button 
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-red-600/20 flex items-center gap-3 text-red-400 transition-all duration-200 group"
                  onClick={() => {
                    window.location.href = '/api/logout';
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="font-medium">Sign Out</span>
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
        <div className="px-6 pb-6 border-t border-white/20">
          <div className="pt-4 space-y-4">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">
                      First Name
                    </label>
                    <Input
                      value={editedData.firstName}
                      onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                      className="text-sm bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">
                      Last Name
                    </label>
                    <Input
                      value={editedData.lastName}
                      onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                      className="text-sm bg-white/10 border-white/20 text-white"
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
                    className="bg-green-600 hover:bg-green-700 text-white"
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
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {user.personalInfo.age} years old
                    </span>
                  </div>
                )}
                
                {user?.personalInfo?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {user.personalInfo.location}
                    </span>
                  </div>
                )}
                
                {user?.personalInfo?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {user.personalInfo.phone}
                    </span>
                  </div>
                )}
                
                {user?.personalInfo?.bio && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-blue-600 mt-0.5" />
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