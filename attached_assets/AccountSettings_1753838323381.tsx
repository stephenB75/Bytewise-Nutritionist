import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  User, 
  Lock, 
  Shield, 
  Bell, 
  Download, 
  Trash2, 
  Edit,
  Check,
  X,
  Camera,
  RefreshCw,
  Database,
  FileText,
  Archive,
  Eye,
  Palette,
  Globe,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { useUser } from './UserManager';

// Import and re-export AccountActionsButtons for ProfileScreen compatibility
export { AccountActionsButtons } from './AccountActionsComponents';

// Mock achievement triggers hook
const useAchievementTriggers = () => ({
  triggerProfileUpdated: () => {
    console.log('Profile updated achievement triggered');
  }
});

// Personal Information Settings Component
export function PersonalInfoSettings() {
  const { user, updatePersonalInfo, verifyEmail, isLoading } = useUser();
  const { triggerProfileUpdated } = useAchievementTriggers();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    timezone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.personalInfo.firstName,
        lastName: user.personalInfo.lastName,
        email: user.personalInfo.email,
        dateOfBirth: user.personalInfo.dateOfBirth || '',
        gender: user.personalInfo.gender || '',
        height: user.personalInfo.height?.toString() || '',
        weight: user.personalInfo.weight?.toString() || '',
        timezone: user.personalInfo.timezone
      });
    }
  }, [user]);

  const handleSave = async () => {
    const success = await updatePersonalInfo({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender as any || undefined,
      height: formData.height ? parseInt(formData.height) : undefined,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
      timezone: formData.timezone
    });

    if (success) {
      // If email was changed, show message about verification requirement
      if (formData.email && formData.email !== user?.personalInfo.email && isValidEmail(formData.email)) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: '📧 Email updated! Please verify your new email address.' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Personal information updated successfully! ✅' }
        }));
      }
      
      setIsEditing(false);
      triggerProfileUpdated();
    }
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Manual email verification function
  const handleManualVerifyEmail = async () => {
    if (!verificationToken || verificationToken.length < 6) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '❌ Please enter a valid verification code (at least 6 characters)' }
      }));
      return;
    }
    
    try {
      setIsVerifyingEmail(true);
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the email with the provided token
      const verificationSuccess = await verifyEmail(verificationToken);
      
      if (verificationSuccess) {
        setShowVerificationForm(false);
        setVerificationToken('');
        
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: '✅ Email verified successfully!' }
        }));
        
        // Trigger profile completion achievement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('bytewise-check-achievements', {
            detail: { 
              type: 'email_verified',
              data: { email: user?.personalInfo.email, manuallyVerified: true }
            }
          }));
        }, 500);
      } else {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: '❌ Invalid verification code. Please try again.' }
        }));
      }
    } catch (error) {
      console.error('Email verification error:', error);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '❌ Verification failed. Please try again.' }
      }));
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Send verification email (mock function)
  const handleSendVerificationEmail = async () => {
    if (!user?.personalInfo.email || !isValidEmail(user.personalInfo.email)) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '❌ Please enter a valid email address first' }
      }));
      return;
    }

    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 800));
      
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '📧 Verification email sent! Check your inbox and enter the code below.' }
      }));
      
      setShowVerificationForm(true);
      console.log('📧 Verification email sent to:', user.personalInfo.email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: '❌ Failed to send verification email. Please try again.' }
      }));
    }
  };

  // Handle email change without auto-verification
  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.personalInfo.firstName,
        lastName: user.personalInfo.lastName,
        email: user.personalInfo.email,
        dateOfBirth: user.personalInfo.dateOfBirth || '',
        gender: user.personalInfo.gender || '',
        height: user.personalInfo.height?.toString() || '',
        weight: user.personalInfo.weight?.toString() || '',
        timezone: user.personalInfo.timezone
      });
    }
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Please select a valid image file' }
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Image size must be less than 5MB' }
      }));
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        const success = await updatePersonalInfo({
          avatar: imageUrl
        });

        if (success) {
          triggerProfileUpdated();
          
          window.dispatchEvent(new CustomEvent('bytewise-toast', {
            detail: { message: 'Profile photo updated successfully! 📸' }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('bytewise-toast', {
            detail: { message: 'Failed to update profile photo' }
          }));
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Error uploading photo. Please try again.' }
      }));
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-pastel-yellow/30 to-white border-2 border-pastel-blue/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pastel-blue/20 flex items-center justify-center border-2 border-pastel-blue/30">
            <User className="w-5 h-5 text-pastel-blue-dark" />
          </div>
          <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
            Personal Information
          </h3>
        </div>
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-brand-button border-pastel-blue/50 hover:bg-pastel-blue/10"
            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="text-brand-button border-red-300 hover:bg-red-50"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isLoading}
              className="text-brand-button bg-pastel-blue hover:bg-pastel-blue-dark text-black"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <Check size={16} className="mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-white/80 rounded-lg border border-pastel-blue/20">
          <div className="relative">
            <Avatar className="w-20 h-20 border-3 border-pastel-blue/30">
              <AvatarImage src={user.personalInfo.avatar} alt={user.personalInfo.firstName} />
              <AvatarFallback 
                className="bg-pastel-blue/20 text-pastel-blue-dark" 
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}
              >
                {user.personalInfo.firstName.charAt(0)}{user.personalInfo.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
              Profile Photo
            </h4>
            <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              Upload a new avatar to personalize your profile
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-brand-button border-pastel-blue/50 hover:bg-pastel-blue/10"
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
              >
                <Camera size={16} className="mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-pastel-blue/20" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-foreground mb-2 text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
              First Name
            </label>
            {isEditing ? (
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
                className="text-brand-body border-pastel-blue/30 focus:border-pastel-blue"
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
              />
            ) : (
              <p className="p-3 bg-muted/50 rounded-md text-brand-body border border-pastel-blue/20" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                {user.personalInfo.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-foreground mb-2 text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
              Last Name
            </label>
            {isEditing ? (
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
                className="text-brand-body border-pastel-blue/30 focus:border-pastel-blue"
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
              />
            ) : (
              <p className="p-3 bg-muted/50 rounded-md text-brand-body border border-pastel-blue/20" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                {user.personalInfo.lastName || 'Not set'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-foreground mb-2 text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
              Email Address
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 text-brand-body border-pastel-blue/30 focus:border-pastel-blue"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
                  />
                ) : (
                  <p className="flex-1 p-3 bg-muted/50 rounded-md text-brand-body border border-pastel-blue/20" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                    {user.personalInfo.email}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {isVerifyingEmail && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-pastel-blue/20 border border-pastel-blue/40 rounded-full animate-pulse">
                      <RefreshCw className="w-3 h-3 text-pastel-blue-dark animate-spin" />
                      <span className="text-xs text-pastel-blue-dark text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 600 }}>
                        Verifying...
                      </span>
                    </div>
                  )}
                  <Badge 
                    variant={user.accountInfo.emailVerified ? "default" : "secondary"} 
                    className={`text-brand-body transition-all duration-500 flex items-center gap-1.5 px-3 py-1.5 ${
                      user.accountInfo.emailVerified 
                        ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-300 shadow-sm' 
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-300'
                    }`}
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {user.accountInfo.emailVerified ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Verified
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Unverified
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              
              {/* Email Verification Section */}
              {!isEditing && !user.accountInfo.emailVerified && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-brand-subheading text-yellow-800" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                        Email Verification Required
                      </h4>
                      <p className="text-sm text-yellow-700 text-brand-body mt-1" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
                        Please verify your email address to secure your account and enable all features.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendVerificationEmail}
                          disabled={isVerifyingEmail}
                          className="text-brand-button border-yellow-300 hover:bg-yellow-100 text-yellow-700"
                          style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
                        >
                          Send Verification Email
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVerificationForm(!showVerificationForm)}
                          className="text-brand-button hover:bg-yellow-100 text-yellow-700"
                          style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
                        >
                          Enter Code
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Verification Code Form */}
                  {showVerificationForm && (
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-yellow-800 mb-1 text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}>
                            Verification Code
                          </label>
                          <Input
                            type="text"
                            value={verificationToken}
                            onChange={(e) => setVerificationToken(e.target.value)}
                            placeholder="Enter 6-digit code from email"
                            className="text-brand-body border-yellow-300 focus:border-yellow-500 bg-white"
                            style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
                            maxLength={8}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleManualVerifyEmail}
                            disabled={isVerifyingEmail || !verificationToken}
                            className="text-brand-button bg-yellow-600 hover:bg-yellow-700 text-white"
                            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            {isVerifyingEmail ? 'Verifying...' : 'Verify Email'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowVerificationForm(false);
                              setVerificationToken('');
                            }}
                            className="text-brand-button hover:bg-yellow-100 text-yellow-700"
                            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Privacy & Security Settings Component
export function PrivacySecuritySettings() {
  const { user, updatePrivacySettings, changePassword, enableTwoFactor, disableTwoFactor } = useUser();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePrivacyChange = async (key: string, value: any) => {
    const success = await updatePrivacySettings({ [key]: value });
    if (success) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Privacy settings updated! 🔒' }
      }));
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'New passwords do not match' }
      }));
      return;
    }

    const success = await changePassword(passwordData.current, passwordData.new);
    if (success) {
      setShowPasswordForm(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Password changed successfully! 🔐' }
      }));
    }
  };

  const handleTwoFactorToggle = async () => {
    if (user?.accountInfo.twoFactorEnabled) {
      const success = await disableTwoFactor('123456');
      if (success) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Two-factor authentication disabled 🔓' }
        }));
      }
    } else {
      try {
        const { qrCode, secret } = await enableTwoFactor();
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Two-factor authentication setup initiated 🔐' }
        }));
      } catch (error) {
        console.error('Two-factor authentication setup error:', error);
      }
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-2 border-red-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-200">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
          Privacy & Security
        </h3>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-white/80 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
                Password
              </h4>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Last changed: {user.accountInfo.lastPasswordChange ? new Date(user.accountInfo.lastPasswordChange).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-brand-button border-red-300 hover:bg-red-50"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <Lock size={16} className="mr-2" />
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <div className="space-y-4 p-4 bg-red-50/50 rounded-lg border border-red-200">
              <Input
                type="password"
                placeholder="Current password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                className="text-brand-body border-red-200 focus:border-red-400"
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
              />
              <Input
                type="password"
                placeholder="New password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="text-brand-body border-red-200 focus:border-red-400"
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="text-brand-body border-red-200 focus:border-red-400"
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handlePasswordChange}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                  className="text-brand-button bg-red-500 hover:bg-red-600 text-white"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Update Password
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordForm(false)}
                  className="text-brand-button border-red-300 hover:bg-red-50"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-red-200" />

        <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-red-200">
          <div>
            <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.accountInfo.twoFactorEnabled ? "default" : "secondary"} className="text-brand-body">
              {user.accountInfo.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Switch 
              checked={user.accountInfo.twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
        </div>

        <Separator className="bg-red-200" />

        <div className="space-y-4">
          <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
            Privacy Settings
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-red-200">
              <div>
                <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                  Profile Visibility
                </p>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  Control who can see your profile information
                </p>
              </div>
              <Select 
                value={user.preferences.privacy.profileVisibility} 
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
              >
                <SelectTrigger className="w-32 border-red-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-red-200">
              <div>
                <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                  Data Sharing
                </p>
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                  Allow anonymized data sharing for research
                </p>
              </div>
              <Switch 
                checked={user.preferences.privacy.dataSharing}
                onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Notification Settings Component
export function NotificationSettings() {
  const { user, updatePreferences } = useUser();

  const handleNotificationChange = async (key: string, value: boolean) => {
    const success = await updatePreferences({
      notifications: {
        ...user?.preferences.notifications,
        [key]: value
      }
    });

    if (success) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Notification settings updated! 🔔' }
      }));
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
          Notification Preferences
        </h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-blue-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Email Notifications
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Receive notifications via email
              </p>
            </div>
            <Switch 
              checked={user.preferences.notifications.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-blue-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Push Notifications
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Receive push notifications on your device
              </p>
            </div>
            <Switch 
              checked={user.preferences.notifications.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-blue-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Achievement Notifications
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Get notified when you unlock achievements
              </p>
            </div>
            <Switch 
              checked={user.preferences.notifications.achievementAlerts}
              onCheckedChange={(checked) => handleNotificationChange('achievementAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-blue-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Weekly Summary
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Receive weekly nutrition summary reports
              </p>
            </div>
            <Switch 
              checked={user.preferences.notifications.weeklyReports}
              onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Display Settings Component
export function DisplaySettings() {
  const { user, updatePreferences } = useUser();

  const handleDisplayChange = async (key: string, value: any) => {
    const success = await updatePreferences({
      display: {
        ...user?.preferences.display,
        [key]: value
      }
    });

    if (success) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Display settings updated! 🎨' }
      }));
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
          Display Settings
        </h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-purple-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Theme
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Choose your preferred color theme
              </p>
            </div>
            <Select 
              value={user.preferences.display.theme} 
              onValueChange={(value) => handleDisplayChange('theme', value)}
            >
              <SelectTrigger className="w-32 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-purple-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Units
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Choose your preferred measurement units
              </p>
            </div>
            <Select 
              value={user.preferences.display.units} 
              onValueChange={(value) => handleDisplayChange('units', value)}
            >
              <SelectTrigger className="w-32 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-purple-200">
            <div>
              <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
                Time Format
              </p>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Choose how time is displayed
              </p>
            </div>
            <Select 
              value={user.preferences.display.timeFormat} 
              onValueChange={(value) => handleDisplayChange('timeFormat', value)}
            >
              <SelectTrigger className="w-32 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12 Hour</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}

// NEW: Data Management Settings Component
export function DataManagementSettings() {
  const { user, exportUserData, downloadDataArchive, getDataUsageReport, validateData } = useUser();
  const [dataReport, setDataReport] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const success = await downloadDataArchive();
      if (success) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Data exported successfully! 📥' }
        }));
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Failed to export data. Please try again.' }
      }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataReport = async () => {
    try {
      const report = await getDataUsageReport();
      setDataReport(report);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Data usage report generated! 📊' }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Failed to generate report. Please try again.' }
      }));
    }
  };

  const handleValidateData = async () => {
    setIsValidating(true);
    try {
      const result = await validateData();
      setValidationResult(result);
      
      if (result.isValid) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Data validation passed! ✅' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: `Data validation found ${result.errors.length} issues` }
        }));
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Failed to validate data. Please try again.' }
      }));
    } finally {
      setIsValidating(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
          <Database className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
          Data Management
        </h3>
      </div>

      <div className="space-y-6">
        {/* Export Data */}
        <div className="p-4 bg-white/80 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
                Export Data
              </h4>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Download a complete copy of your Bytewise data
              </p>
            </div>
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              className="text-brand-button bg-green-500 hover:bg-green-600 text-white"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <Download size={16} className="mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        <Separator className="bg-green-200" />

        {/* Data Usage Report */}
        <div className="p-4 bg-white/80 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
                Data Usage Report
              </h4>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                View detailed information about your data usage
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleDataReport}
              className="text-brand-button border-green-300 hover:bg-green-50"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <FileText size={16} className="mr-2" />
              Generate Report
            </Button>
          </div>

          {dataReport && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    Profile Data: {dataReport.dataPoints.profileData}
                  </p>
                  <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    Achievements: {dataReport.dataPoints.achievements}
                  </p>
                </div>
                <div>
                  <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    Recipes: {dataReport.dataPoints.recipesCreated}
                  </p>
                  <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    Storage: {Math.round(dataReport.storageUsed / 1024)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-green-200" />

        {/* Data Validation */}
        <div className="p-4 bg-white/80 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 500 }}>
                Data Validation
              </h4>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Check your data for consistency and completeness
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleValidateData}
              disabled={isValidating}
              className="text-brand-button border-green-300 hover:bg-green-50"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <AlertCircle size={16} className="mr-2" />
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>

          {validationResult && (
            <div className={`mt-4 p-3 rounded-lg border ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className={validationResult.isValid ? 'text-green-600' : 'text-red-600'} />
                <span className="font-medium text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  {validationResult.isValid ? 'Validation Passed' : 'Validation Issues Found'}
                </span>
              </div>
              {!validationResult.isValid && validationResult.errors.length > 0 && (
                <ul className="text-sm text-red-600 space-y-1">
                  {validationResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                      • {error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}