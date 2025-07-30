/**
 * Profile Info Card Component with Accordion Animation
 * 
 * Interactive profile information display with smooth accordion dropdown
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Verified
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
    console.log('Saving profile data:', editedData);
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
    <Card className={`overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 ${className}`}>
      {/* Header - Always Visible */}
      <div className="p-6">
        <div className="flex items-center gap-4">
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {user?.firstName || 'User'} {user?.lastName || ''}
              </h3>
              {user?.emailVerified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                {user?.email || 'No email'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 border-t border-blue-200/50">
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