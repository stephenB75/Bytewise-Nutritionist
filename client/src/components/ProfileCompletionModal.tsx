/**
 * Profile Completion Modal - Required for first-time users
 * Ensures users complete essential profile information before using the app
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileIcon } from './ProfileIcon';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: (profileData: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    profileIcon: number;
  }) => void;
}

export function ProfileCompletionModal({ isOpen, onComplete }: ProfileCompletionModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '' as 'male' | 'female' | ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      toast({
        title: "First Name Required",
        description: "Please enter your first name to continue.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Last Name Required", 
        description: "Please enter your last name to continue.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!formData.gender) {
      toast({
        title: "Gender Selection Required",
        description: "Please select your preferred avatar style.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Assign profile icon based on gender selection
      const profileIcon = formData.gender === 'female' ? 2 : 1;
      
      await onComplete({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        profileIcon
      });

      toast({
        title: "Profile Completed!",
        description: "Welcome to ByteWise Nutritionist! Your profile has been set up.",
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
      setIsSubmitting(false);
    }
  };

  const selectedIcon = formData.gender ? (formData.gender === 'female' ? 2 : 1) : 1;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-amber-100">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <ProfileIcon 
                iconNumber={selectedIcon}
                size="lg"
                className="border-4 border-orange-400/50 shadow-lg"
              />
              {formData.gender && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let's get your profile set up so we can personalize your experience
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name *
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter your first name"
                className="mt-1 bg-white/80 border-amber-300"
                data-testid="input-firstName"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter your last name"
                className="mt-1 bg-white/80 border-amber-300"
                data-testid="input-lastName"
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Avatar Style *
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.gender === 'male'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-400'
                  }`}
                  data-testid="button-select-male"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">👨</div>
                    <div className="text-sm font-medium">Male Avatar</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.gender === 'female'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-400'
                  }`}
                  data-testid="button-select-female"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">👩</div>
                    <div className="text-sm font-medium">Female Avatar</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 mt-6"
            data-testid="button-complete-profile"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Setting up profile...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Complete Profile
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          * Required fields
        </p>
      </DialogContent>
    </Dialog>
  );
}