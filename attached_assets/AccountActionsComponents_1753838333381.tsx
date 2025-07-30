/**
 * Bytewise Account Actions Components
 * 
 * Extracted account action components with achievement integration
 * Features:
 * - Achievement triggers for user actions
 * - Brand-consistent styling
 * - Interactive buttons with real functionality
 */

import React from 'react';
import { Button } from '../ui/button';
import { Target, Activity, Heart, Trash2, Download, Database } from 'lucide-react';
import { useUser } from './UserManager';
import { useAchievementTriggers } from '../AchievementSystem';

interface AccountActionsButtonsProps {
  onNavigate?: (page: string) => void;
}

export function AccountActionsButtons({ onNavigate }: AccountActionsButtonsProps) {
  const { user, updateNutritionGoals, updateActivityLevel, updateHealthMetrics, updateStats } = useUser();
  const { triggerGoalCompleted, triggerProfileUpdated, triggerCaloriesTracked } = useAchievementTriggers();
  
  const handleNutritionGoals = async () => {
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: { message: 'Opening nutrition goals settings... 🎯' }
    }));
    
    // Example: Set default goals based on user profile and trigger achievement
    if (user) {
      const defaultGoals = {
        dailyCalories: user.personalInfo.weight ? Math.round(user.personalInfo.weight * 25) : 2200,
        macros: {
          protein: user.personalInfo.weight ? Math.round(user.personalInfo.weight * 1.6) : 150,
          carbohydrates: 275,
          fat: 73,
          fiber: 25
        }
      };
      
      const success = await updateNutritionGoals(defaultGoals);
      if (success) {
        // Trigger achievement for setting goals
        triggerGoalCompleted();
        triggerProfileUpdated();
        
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Nutrition goals updated successfully! 🎯' }
        }));
      }
      
      console.log('🎯 Nutrition goals updated:', defaultGoals);
    }
  };

  const handleActivitySettings = async () => {
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: { message: 'Opening activity level settings... 🏃‍♀️' }
    }));
    
    // Example: Update activity level and trigger achievement
    if (user) {
      const activityUpdate = {
        level: 'moderately_active' as const,
        exerciseDays: 4,
        workoutIntensity: 'medium' as const,
        stepGoal: 10000,
        activeMinutesGoal: 150
      };
      
      const success = await updateActivityLevel(activityUpdate);
      if (success) {
        // Trigger achievement for updating activity level
        triggerProfileUpdated();
        
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Activity level updated successfully! 🏃‍♀️' }
        }));
      }
      
      console.log('🏃‍♀️ Activity level updated:', activityUpdate);
    }
  };

  const handleHealthMetrics = async () => {
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: { message: 'Opening health metrics tracking... 📊' }
    }));
    
    // Example: Calculate and update BMI if height and weight are available
    if (user && user.personalInfo.height && user.personalInfo.weight) {
      const heightInMeters = user.personalInfo.height / 100;
      const bmi = user.personalInfo.weight / (heightInMeters * heightInMeters);
      
      const healthUpdate = {
        bmi: Math.round(bmi * 10) / 10,
        healthConditions: user.healthMetrics.healthConditions || [],
        medications: user.healthMetrics.medications || []
      };
      
      const success = await updateHealthMetrics(healthUpdate);
      if (success) {
        // Trigger achievement for health tracking
        await updateStats({ weightsRecorded: user.stats.weightsRecorded + 1 });
        triggerProfileUpdated();
        
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Health metrics updated successfully! 📊' }
        }));
      }
      
      console.log('📊 Health metrics updated:', healthUpdate);
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start text-brand-button border-pastel-blue/50 hover:bg-pastel-blue/10 p-4 h-auto"
        style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
        onClick={handleNutritionGoals}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Target size={20} className="text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>
              Nutrition Goals
            </p>
            <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Set and customize your daily nutrition targets
            </p>
          </div>
        </div>
      </Button>

      <Button 
        variant="outline" 
        className="w-full justify-start text-brand-button border-pastel-blue/50 hover:bg-pastel-blue/10 p-4 h-auto"
        style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
        onClick={handleActivitySettings}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Activity size={20} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>
              Activity Level
            </p>
            <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Configure your exercise and daily activity
            </p>
          </div>
        </div>
      </Button>

      <Button 
        variant="outline" 
        className="w-full justify-start text-brand-button border-pastel-blue/50 hover:bg-pastel-blue/10 p-4 h-auto"
        style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
        onClick={handleHealthMetrics}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Heart size={20} className="text-purple-600" />
          </div>
          <div className="text-left">
            <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>
              Health Metrics
            </p>
            <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Track weight, BMI, and health conditions
            </p>
          </div>
        </div>
      </Button>
    </div>
  );
}

// Account management actions
export function AccountManagementActions() {
  const { exportUserData, downloadDataArchive, deleteAccount } = useUser();

  const handleExportData = async () => {
    try {
      const success = await downloadDataArchive();
      if (success) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { message: 'Data export downloaded successfully! 📥' }
        }));
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Failed to export data. Please try again.' }
      }));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      const password = window.prompt('Please enter your password to confirm:');
      if (password) {
        const success = await deleteAccount(password);
        if (success) {
          window.dispatchEvent(new CustomEvent('bytewise-toast', {
            detail: { message: 'Account deleted successfully. Thank you for using Bytewise.' }
          }));
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start text-brand-button border-green-300 hover:bg-green-50 p-4 h-auto"
        style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
        onClick={handleExportData}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Download size={20} className="text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>
              Export Data
            </p>
            <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Download a complete copy of your Bytewise data
            </p>
          </div>
        </div>
      </Button>

      <Button 
        variant="outline" 
        className="w-full justify-start text-brand-button border-red-300 hover:bg-red-50 p-4 h-auto"
        style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
        onClick={handleDeleteAccount}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>
              Delete Account
            </p>
            <p className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Permanently remove your account and all data
            </p>
          </div>
        </div>
      </Button>
    </div>
  );
}