import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Target, LogOut, Edit, Save, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

interface ProfileProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function Profile({ onNavigate, showToast, notifications, setNotifications }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbGoal: 200,
    dailyFatGoal: 70,
    dailyWaterGoal: 8,
  });

  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest('PATCH', '/api/auth/user', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      showToast('Profile updated successfully!');
    },
    onError: () => {
      showToast('Failed to update profile. Please try again.', 'destructive');
    },
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dailyCalorieGoal: user.dailyCalorieGoal || 2000,
        dailyProteinGoal: user.dailyProteinGoal || 150,
        dailyCarbGoal: user.dailyCarbGoal || 200,
        dailyFatGoal: user.dailyFatGoal || 70,
        dailyWaterGoal: user.dailyWaterGoal || 8,
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dailyCalorieGoal: user.dailyCalorieGoal || 2000,
        dailyProteinGoal: user.dailyProteinGoal || 150,
        dailyCarbGoal: user.dailyCarbGoal || 200,
        dailyFatGoal: user.dailyFatGoal || 70,
        dailyWaterGoal: user.dailyWaterGoal || 8,
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold brand-text-primary mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and nutrition goals</p>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Personal Information</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="touch-target"
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user.firstName || user.lastName ? 
                      `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                      'User'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    Member since {formatDate(new Date(user.createdAt))}
                  </Badge>
                </div>
              </div>

              {/* Editable Fields */}
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="touch-target"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="touch-target"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="touch-target"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1 touch-target"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 touch-target btn-animate"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Goals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Daily Nutrition Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
              <Input
                id="calorieGoal"
                type="number"
                value={formData.dailyCalorieGoal}
                onChange={(e) => handleInputChange('dailyCalorieGoal', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="touch-target"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="proteinGoal">Protein (g)</Label>
                <Input
                  id="proteinGoal"
                  type="number"
                  value={formData.dailyProteinGoal}
                  onChange={(e) => handleInputChange('dailyProteinGoal', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  className="touch-target"
                />
              </div>
              <div>
                <Label htmlFor="carbGoal">Carbs (g)</Label>
                <Input
                  id="carbGoal"
                  type="number"
                  value={formData.dailyCarbGoal}
                  onChange={(e) => handleInputChange('dailyCarbGoal', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  className="touch-target"
                />
              </div>
              <div>
                <Label htmlFor="fatGoal">Fat (g)</Label>
                <Input
                  id="fatGoal"
                  type="number"
                  value={formData.dailyFatGoal}
                  onChange={(e) => handleInputChange('dailyFatGoal', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  className="touch-target"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="waterGoal">Daily Water Goal (glasses)</Label>
              <Input
                id="waterGoal"
                type="number"
                value={formData.dailyWaterGoal}
                onChange={(e) => handleInputChange('dailyWaterGoal', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="touch-target"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>App Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get reminders for meal logging</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Receive weekly nutrition summaries</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-muted-foreground">Download your nutrition data</p>
              </div>
              <Button variant="outline" size="sm" className="touch-target">
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start touch-target"
              onClick={() => showToast('Privacy settings coming soon!')}
            >
              Privacy Settings
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start touch-target"
              onClick={() => showToast('Help center coming soon!')}
            >
              Help & Support
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start touch-target"
              onClick={() => showToast('About page coming soon!')}
            >
              About Bytewise
            </Button>
            
            <Button
              variant="destructive"
              className="w-full justify-start touch-target"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}