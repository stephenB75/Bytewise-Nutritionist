/**
 * Combined Profile Info Component
 * 
 * Consolidated user profile and personal info in a single dropdown
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User,
  Mail,
  Edit,
  Save,
  X,
  CheckCircle,
  Scale,
  Calendar,
  Activity,
  Heart,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CombinedProfileInfoProps {
  user: any;
}

export function CombinedProfileInfo({ user }: CombinedProfileInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    age: user?.personalInfo?.age || '',
    heightFeet: user?.personalInfo?.height ? Math.floor(user.personalInfo.height / 12) : '',
    heightInches: user?.personalInfo?.height ? user.personalInfo.height % 12 : '',
    weight: user?.personalInfo?.weight || '',
    activityLevel: user?.personalInfo?.activityLevel || 'moderate',
    gender: user?.personalInfo?.gender || ''
  });

  const handleSave = () => {
    // Saving profile data
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      age: user?.personalInfo?.age || '',
      heightFeet: user?.personalInfo?.height ? Math.floor(user.personalInfo.height / 12) : '',
      heightInches: user?.personalInfo?.height ? user.personalInfo.height % 12 : '',
      weight: user?.personalInfo?.weight || '',
      activityLevel: user?.personalInfo?.activityLevel || 'moderate',
      gender: user?.personalInfo?.gender || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      {/* Header with Profile Info */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{user?.email}</span>
              {user?.emailVerified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Target className="w-5 h-5 mx-auto text-blue-600 mb-1" />
          <p className="text-xs text-gray-600">Age</p>
          <p className="font-bold text-gray-900">{formData.age || 'Not set'}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Scale className="w-5 h-5 mx-auto text-green-600 mb-1" />
          <p className="text-xs text-gray-600">Weight</p>
          <p className="font-bold text-gray-900">{formData.weight ? `${formData.weight} lbs` : 'Not set'}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <TrendingUp className="w-5 h-5 mx-auto text-purple-600 mb-1" />
          <p className="text-xs text-gray-600">Height</p>
          <p className="font-bold text-gray-900">
            {formData.heightFeet && formData.heightInches 
              ? `${formData.heightFeet}'${formData.heightInches}"` 
              : 'Not set'}
          </p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Activity className="w-5 h-5 mx-auto text-orange-600 mb-1" />
          <p className="text-xs text-gray-600">Activity</p>
          <p className="font-bold text-gray-900 capitalize">{formData.activityLevel}</p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          <Separator className="my-4" />
          
          {isEditing ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Physical Details</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <Input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Enter weight in pounds"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.heightFeet}
                        onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                        placeholder="Feet"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={formData.heightInches}
                        onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                        placeholder="Inches"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Level
                    </label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="light">Light (light exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                      <option value="active">Active (hard exercise 6-7 days/week)</option>
                      <option value="very-active">Very Active (very hard exercise/physical job)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Account ID:</span>
                  <span className="ml-2 font-medium">{user?.id?.slice(0, 8)}...</span>
                </div>
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <span className="ml-2 font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Profile status:</span>
                  <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                    Active
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Email verified:</span>
                  <span className="ml-2">
                    {user?.emailVerified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Pending
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Moved buttons to bottom of card */}
      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Less Info
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              More Info
            </>
          )}
        </Button>
        
        {!isEditing ? (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2 flex-1">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}