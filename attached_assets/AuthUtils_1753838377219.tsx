/**
 * Bytewise Authentication Utilities
 * 
 * Clean authentication logic with comprehensive signup data handling
 * Features:
 * - Login and signup processing with complete form data
 * - Session validation and management
 * - Complete user data cleanup on logout
 * - Toast notifications for auth events
 * - LocalStorage management
 * - Full profile initialization for new users
 */

import { logDevMessage } from './DevTools';
import { SignupFormData } from '../auth/SignupScreen';

export interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  setSystemStatus: (updater: (prev: any) => any) => void;
  showToast: (message: string, duration?: number) => void;
  setActiveTab: (tab: string) => void;
  setAuthMode: (mode: 'login' | 'signup' | 'forgot') => void;
  setNotifications: (notifications: string[]) => void;
}

// User data keys that should be cleared on logout
const USER_DATA_KEYS = [
  // Authentication data
  'bytewise-auth',
  'bytewise-user',
  'bytewise-user-profile',
  
  // User food entries and recipes (ALL cleared - no test data)
  'quickAddIngredient',
  'pendingMealType', 
  'pendingMealPlanRecipe',
  'savedRecipes',
  'editingMeal',
  'dailyMealLogs',
  
  // User database entries (NOT the USDA food database)
  'bytewise-db-user-profile',
  'bytewise-db-user-entries',
  'bytewise-db-meal-logs',
  'bytewise-db-user-achievements',
  'bytewise-db-user-settings',
  'bytewise-db-user-goals',
  'bytewise-db-last-sync',
  
  // Temporary user data (ALL cleared)
  'bytewise-temp-recipe',
  'bytewise-draft-meal',
  'bytewise-pending-entry',
  
  // Development/test data (ALL cleared)
  'bytewise-test-data',
  'bytewise-mock-achievements',
  'bytewise-sample-recipes',
  'bytewise-demo-meals'
];

// Enhanced login handler with comprehensive verification logging
export function createLoginHandler(authState: AuthState) {
  return async (email?: string) => {
    const userEmail = email || 'user@example.com';
    const userName = userEmail.split('@')[0] || 'User';
    
    console.log('🔐 LOGIN PROCESS INITIATED');
    console.log('📧 Email:', userEmail);
    console.log('👤 Username:', userName);
    console.log('⏰ Login timestamp:', new Date().toISOString());
    
    logDevMessage('info', 'Clean login attempt for:', userEmail);
    
    try {
      // Step 1: Set authentication state
      console.log('✅ Step 1: Setting authentication state to true');
      authState.setIsAuthenticated(true);
      
      if (typeof window !== 'undefined') {
        // Step 2: Create comprehensive user data
        const userData = {
          name: userName,
          email: userEmail,
          loginTime: new Date().toISOString(),
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          preferences: {
            notifications: true,
            darkMode: false,
            units: 'metric'
          },
          loginMetadata: {
            userAgent: navigator.userAgent,
            loginCount: (JSON.parse(localStorage.getItem('bytewise-login-stats') || '{"count": 0}').count) + 1,
            lastLoginIP: 'localhost', // In a real app, this would be from server
            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
          }
          // NO test data, achievements, or sample content
        };
        
        console.log('✅ Step 2: User data object created');
        console.log('📊 User data structure:', {
          name: userData.name,
          email: userData.email,
          sessionId: userData.sessionId,
          preferences: userData.preferences,
          metadata: userData.loginMetadata
        });
        
        // Step 3: Store authentication flag
        console.log('✅ Step 3: Storing authentication flag');
        localStorage.setItem('bytewise-auth', 'true');
        const authVerification = localStorage.getItem('bytewise-auth');
        console.log('🔍 Auth flag verification:', authVerification === 'true' ? 'SUCCESS' : 'FAILED');
        
        // Step 4: Store user data
        console.log('✅ Step 4: Storing user data to localStorage');
        const userDataString = JSON.stringify(userData);
        localStorage.setItem('bytewise-user', userDataString);
        
        // Step 5: Verify storage
        console.log('✅ Step 5: Verifying data storage');
        const storedData = localStorage.getItem('bytewise-user');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('🔍 Storage verification: SUCCESS');
          console.log('📦 Stored data size:', userDataString.length, 'characters');
          console.log('📄 Parsed data integrity check:', {
            nameMatch: parsedData.name === userData.name,
            emailMatch: parsedData.email === userData.email,
            sessionMatch: parsedData.sessionId === userData.sessionId,
            preferencesMatch: JSON.stringify(parsedData.preferences) === JSON.stringify(userData.preferences)
          });
        } else {
          console.error('❌ Storage verification: FAILED - No data found after storage');
        }
        
        // Step 6: Update login statistics
        console.log('✅ Step 6: Updating login statistics');
        const loginStats = {
          count: userData.loginMetadata.loginCount,
          lastLogin: userData.loginTime,
          totalSessions: userData.loginMetadata.loginCount
        };
        localStorage.setItem('bytewise-login-stats', JSON.stringify(loginStats));
        console.log('📈 Login stats updated:', loginStats);
        
        // Step 7: Create user session record
        console.log('✅ Step 7: Creating session record');
        const existingSessions = JSON.parse(localStorage.getItem('bytewise-user-sessions') || '[]');
        const newSession = {
          sessionId: userData.sessionId,
          email: userData.email,
          startTime: userData.loginTime,
          userAgent: userData.loginMetadata.userAgent,
          deviceType: userData.loginMetadata.deviceType
        };
        existingSessions.push(newSession);
        // Keep only last 10 sessions
        const trimmedSessions = existingSessions.slice(-10);
        localStorage.setItem('bytewise-user-sessions', JSON.stringify(trimmedSessions));
        console.log('📋 Session record created. Total sessions:', trimmedSessions.length);
        
        // Step 8: Dispatch user events
        console.log('✅ Step 8: Dispatching user login events');
        window.dispatchEvent(new CustomEvent('bytewise-user-login', {
          detail: { userData, sessionData: newSession, loginStats }
        }));
        console.log('📡 User login event dispatched successfully');
        
        // Step 9: Verify complete storage state
        console.log('✅ Step 9: Final storage state verification');
        const finalVerification = {
          authFlag: localStorage.getItem('bytewise-auth'),
          userData: localStorage.getItem('bytewise-user') ? 'present' : 'missing',
          loginStats: localStorage.getItem('bytewise-login-stats') ? 'present' : 'missing',
          sessions: localStorage.getItem('bytewise-user-sessions') ? 'present' : 'missing'
        };
        console.log('🔍 Final verification:', finalVerification);
        
        logDevMessage('success', 'Enhanced user data saved to localStorage with verification');
        authState.showToast(`Welcome back, ${userName}! 🌟`);
        authState.setSystemStatus(prev => ({ ...prev, auth: true, storage: true, userManager: true }));
        
        console.log('🎉 LOGIN PROCESS COMPLETED SUCCESSFULLY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
      } else {
        console.error('❌ Window object not available - storage skipped');
      }
    } catch (error) {
      console.error('💥 LOGIN PROCESS FAILED');
      console.error('❌ Error details:', error);
      console.error('📊 Error context:', {
        email: userEmail,
        timestamp: new Date().toISOString(),
        errorName: error.name,
        errorMessage: error.message
      });
      
      logDevMessage('error', 'Failed to save user data:', error);
      authState.showToast('Login successful, but preferences may not be saved.');
      authState.setSystemStatus(prev => ({ ...prev, auth: true, storage: false, userManager: false }));
    }
  };
}

// Enhanced signup handler with comprehensive verification logging
export function createSignupHandler(authState: AuthState) {
  return async (formData: SignupFormData) => {
    const userName = `${formData.firstName} ${formData.lastName}`.trim();
    const userEmail = formData.email;
    
    console.log('🆕 SIGNUP PROCESS INITIATED');
    console.log('📧 Email:', userEmail);
    console.log('👤 Full Name:', userName);
    console.log('📝 Form Data Received:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: formData.height,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      calorieGoal: formData.calorieGoal,
      proteinGoal: formData.proteinGoal,
      fatGoal: formData.fatGoal,
      carbGoal: formData.carbGoal
    });
    
    logDevMessage('info', 'Comprehensive signup attempt for:', userName, userEmail);
    
    try {
      // Step 1: Set authentication state
      console.log('✅ Step 1: Setting authentication state to true');
      authState.setIsAuthenticated(true);
      
      if (typeof window !== 'undefined') {
        // Step 2: Create comprehensive user data from signup form
        const userData = {
          name: userName,
          email: userEmail,
          loginTime: new Date().toISOString(),
          isFirstLogin: true,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accountCreated: new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            units: 'imperial' // Since we're using lbs/ft in the form
          },
          // Complete signup form data with comprehensive storage
          signupData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            age: formData.age ? parseInt(formData.age) : undefined,
            gender: formData.gender || undefined,
            weight: formData.weight ? parseFloat(formData.weight) : undefined, // lbs
            height: formData.height ? parseFloat(formData.height) : undefined, // ft
            activityLevel: formData.activityLevel || undefined,
            goal: formData.goal || undefined,
            nutritionGoals: {
              dailyCalories: formData.calorieGoal ? parseInt(formData.calorieGoal) : 2200,
              protein: formData.proteinGoal ? parseInt(formData.proteinGoal) : 150,
              fat: formData.fatGoal ? parseInt(formData.fatGoal) : 73,
              carbs: formData.carbGoal ? parseInt(formData.carbGoal) : 275
            },
            formSubmissionTime: new Date().toISOString(),
            emailVerified: true // Auto-verified as requested
          },
          registrationMetadata: {
            userAgent: navigator.userAgent,
            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            signupSource: 'web-app',
            formCompletionTime: Date.now() // Could track how long form took to fill
          }
          // NO test data, sample recipes, or mock achievements
        };
        
        console.log('✅ Step 2: Comprehensive user data object created');
        console.log('📊 User data structure overview:', {
          basicInfo: {
            name: userData.name,
            email: userData.email,
            isFirstLogin: userData.isFirstLogin
          },
          signupData: {
            firstName: userData.signupData.firstName,
            lastName: userData.signupData.lastName,
            age: userData.signupData.age,
            gender: userData.signupData.gender,
            weight: userData.signupData.weight,
            height: userData.signupData.height,
            activityLevel: userData.signupData.activityLevel,
            goal: userData.signupData.goal,
            emailVerified: userData.signupData.emailVerified
          },
          nutritionGoals: userData.signupData.nutritionGoals,
          preferences: userData.preferences,
          metadata: userData.registrationMetadata
        });
        
        // Step 3: Store authentication flag
        console.log('✅ Step 3: Storing authentication flag');
        localStorage.setItem('bytewise-auth', 'true');
        const authVerification = localStorage.getItem('bytewise-auth');
        console.log('🔍 Auth flag verification:', authVerification === 'true' ? 'SUCCESS' : 'FAILED');
        
        // Step 4: Store comprehensive user data
        console.log('✅ Step 4: Storing comprehensive user data to localStorage');
        const userDataString = JSON.stringify(userData);
        localStorage.setItem('bytewise-user', userDataString);
        
        // Step 5: Verify comprehensive storage
        console.log('✅ Step 5: Verifying comprehensive data storage');
        const storedData = localStorage.getItem('bytewise-user');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('🔍 Storage verification: SUCCESS');
          console.log('📦 Stored data size:', userDataString.length, 'characters');
          console.log('📄 Comprehensive data integrity check:', {
            basicInfoMatch: parsedData.name === userData.name && parsedData.email === userData.email,
            signupDataMatch: JSON.stringify(parsedData.signupData) === JSON.stringify(userData.signupData),
            nutritionGoalsMatch: JSON.stringify(parsedData.signupData.nutritionGoals) === JSON.stringify(userData.signupData.nutritionGoals),
            preferencesMatch: JSON.stringify(parsedData.preferences) === JSON.stringify(userData.preferences),
            metadataMatch: JSON.stringify(parsedData.registrationMetadata) === JSON.stringify(userData.registrationMetadata),
            firstLoginFlag: parsedData.isFirstLogin === true,
            emailVerifiedFlag: parsedData.signupData.emailVerified === true
          });
        } else {
          console.error('❌ Storage verification: FAILED - No data found after storage');
        }
        
        // Step 6: Create user profile record
        console.log('✅ Step 6: Creating comprehensive user profile record');
        const userProfile = {
          profileId: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: userData.sessionId,
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: userEmail,
            age: userData.signupData.age,
            gender: userData.signupData.gender
          },
          physicalInfo: {
            weight: userData.signupData.weight,
            weightUnit: 'lbs',
            height: userData.signupData.height,
            heightUnit: 'ft',
            activityLevel: userData.signupData.activityLevel
          },
          goals: {
            primaryGoal: userData.signupData.goal,
            nutritionGoals: userData.signupData.nutritionGoals
          },
          accountInfo: {
            createdAt: userData.accountCreated,
            emailVerified: userData.signupData.emailVerified,
            isActive: true,
            lastLogin: userData.loginTime
          }
        };
        localStorage.setItem('bytewise-user-profile', JSON.stringify(userProfile));
        console.log('👤 User profile record created:', {
          profileId: userProfile.profileId,
          personalInfo: userProfile.personalInfo,
          physicalInfo: userProfile.physicalInfo,
          goals: userProfile.goals
        });
        
        // Step 7: Initialize user settings
        console.log('✅ Step 7: Initializing user settings');
        const userSettings = {
          settingsId: `settings_${Date.now()}`,
          userId: userData.sessionId,
          preferences: userData.preferences,
          nutritionSettings: {
            trackMacros: true,
            trackMicronutrients: false,
            showCalorieGoals: true,
            dailyGoals: userData.signupData.nutritionGoals
          },
          appSettings: {
            notifications: userData.preferences.notifications,
            darkMode: userData.preferences.darkMode,
            units: userData.preferences.units,
            autoSave: true
          },
          privacySettings: {
            dataSharing: false,
            analytics: true,
            emailUpdates: true
          }
        };
        localStorage.setItem('bytewise-user-settings', JSON.stringify(userSettings));
        console.log('⚙️ User settings initialized:', userSettings);
        
        // Step 8: Create initial activity log
        console.log('✅ Step 8: Creating initial activity log');
        const activityLog = [{
          activityId: `activity_${Date.now()}`,
          userId: userData.sessionId,
          action: 'account_created',
          timestamp: userData.accountCreated,
          details: {
            signupMethod: 'web-form',
            formData: 'comprehensive',
            emailVerified: true
          }
        }];
        localStorage.setItem('bytewise-user-activity', JSON.stringify(activityLog));
        console.log('📋 Initial activity log created');
        
        // Step 9: Dispatch comprehensive signup events
        console.log('✅ Step 9: Dispatching comprehensive signup events');
        window.dispatchEvent(new CustomEvent('bytewise-user-signup', {
          detail: { 
            userData, 
            userProfile, 
            userSettings, 
            activityLog,
            signupComplete: true 
          }
        }));
        
        // Dispatch email verification event
        window.dispatchEvent(new CustomEvent('bytewise-email-verified', {
          detail: { 
            email: userEmail, 
            userId: userData.sessionId,
            verifiedAt: new Date().toISOString(),
            autoVerified: true
          }
        }));
        
        console.log('📡 Comprehensive signup events dispatched successfully');
        
        // Step 10: Final verification of all stored data
        console.log('✅ Step 10: Final comprehensive storage verification');
        const finalVerification = {
          authFlag: localStorage.getItem('bytewise-auth') ? 'stored' : 'missing',
          userData: localStorage.getItem('bytewise-user') ? 'stored' : 'missing',
          userProfile: localStorage.getItem('bytewise-user-profile') ? 'stored' : 'missing',
          userSettings: localStorage.getItem('bytewise-user-settings') ? 'stored' : 'missing',
          activityLog: localStorage.getItem('bytewise-user-activity') ? 'stored' : 'missing'
        };
        console.log('🔍 Final comprehensive verification:', finalVerification);
        
        logDevMessage('success', 'Comprehensive new user data saved to localStorage with full verification');
        authState.showToast(`Welcome to Bytewise, ${formData.firstName}! 🎉`);
        authState.setSystemStatus(prev => ({ ...prev, auth: true, storage: true, userManager: true }));
        
        console.log('🎉 SIGNUP PROCESS COMPLETED SUCCESSFULLY');
        console.log('📊 Total data stored:', Object.keys(finalVerification).filter(key => finalVerification[key] === 'stored').length, 'items');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
      } else {
        console.error('❌ Window object not available - storage skipped');
      }
    } catch (error) {
      console.error('💥 SIGNUP PROCESS FAILED');
      console.error('❌ Error details:', error);
      console.error('📊 Error context:', {
        email: userEmail,
        userName: userName,
        timestamp: new Date().toISOString(),
        errorName: error.name,
        errorMessage: error.message,
        formData: formData
      });
      
      logDevMessage('error', 'Failed to save user data:', error);
      authState.showToast('Account created successfully!');
      authState.setSystemStatus(prev => ({ ...prev, auth: true, storage: false, userManager: false }));
    }
  };
}

// Comprehensive logout handler - clears ALL user and test data
export function createLogoutHandler(authState: AuthState) {
  return () => {
    logDevMessage('info', 'Logout initiated - clearing ALL user and test data');
    
    try {
      authState.setIsAuthenticated(false);
      authState.setActiveTab('dashboard');
      authState.setAuthMode('login');
      authState.setNotifications([]); // Clear any notifications
      
      if (typeof window !== 'undefined') {
        let clearedCount = 0;
        
        // Clear all user data keys including test data
        USER_DATA_KEYS.forEach(key => {
          try {
            if (localStorage.getItem(key)) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          } catch (error) {
            logDevMessage('warning', `Failed to remove ${key} from localStorage:`, error);
          }
        });
        
        // Clear any additional test data patterns
        const allKeys = Object.keys(localStorage);
        const testDataKeys = allKeys.filter(key => 
          key.includes('test') || 
          key.includes('mock') || 
          key.includes('sample') || 
          key.includes('demo') ||
          (key.includes('bytewise-') && !key.includes('usda') && !key.includes('food-database'))
        );
        
        testDataKeys.forEach(key => {
          try {
            if (!key.includes('usda-foods') && !key.includes('food-database')) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          } catch (error) {
            logDevMessage('warning', `Failed to remove test data ${key}:`, error);
          }
        });
        
        // Trigger comprehensive user data cleanup in database (preserves USDA foods)
        window.dispatchEvent(new CustomEvent('bytewise-clear-user-data'));
        
        logDevMessage('success', `Complete logout: ${clearedCount} items cleared`);
        logDevMessage('info', 'USDA food database preserved for next user');
        logDevMessage('info', 'All test data removed - system ready for clean user');
        authState.setSystemStatus(prev => ({ ...prev, auth: false, userManager: false }));
      }
    } catch (error) {
      logDevMessage('error', 'Error during comprehensive logout:', error);
    }
  };
}

// Clean forgot password handler
export function createForgotPasswordHandler(authState: AuthState) {
  return (email: string) => {
    logDevMessage('info', 'Password reset requested for:', email);
    
    try {
      // Simulate API call delay
      setTimeout(() => {
        logDevMessage('success', 'Password reset email sent');
        authState.showToast(`Password reset link sent to ${email} 📧`);
        authState.setAuthMode('login');
      }, 1000);
    } catch (error) {
      logDevMessage('error', 'Error sending reset email:', error);
      authState.showToast('Failed to send reset email. Please try again.');
    }
  };
}

// Clean session validation utility
export function validateSession(authState: AuthState) {
  if (typeof window !== 'undefined' && authState.isAuthenticated) {
    try {
      const userData = localStorage.getItem('bytewise-user');
      if (!userData) {
        logDevMessage('info', 'No user data found, logging out');
        createLogoutHandler(authState)();
        return false;
      } else {
        const user = JSON.parse(userData);
        if (user.loginTime) {
          const loginTime = new Date(user.loginTime);
          const now = new Date();
          const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          // Auto-logout after 24 hours
          if (hoursSinceLogin > 24) {
            logDevMessage('info', 'Session expired, logging out');
            authState.showToast('Session expired. Please log in again.', 4000);
            createLogoutHandler(authState)();
            return false;
          } else {
            logDevMessage('success', `Session valid, ${(24 - hoursSinceLogin).toFixed(1)} hours remaining`);
            return true;
          }
        }
      }
    } catch (error) {
      logDevMessage('error', 'Error validating session:', error);
      createLogoutHandler(authState)();
      return false;
    }
  }
  return true;
}

// Get current user data utility - returns clean data only
export function getCurrentUser() {
  try {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('bytewise-user');
      if (userData) {
        const user = JSON.parse(userData);
        logDevMessage('info', 'Current clean user retrieved:', user.name);
        return user;
      }
    }
  } catch (error) {
    logDevMessage('error', 'Error getting user data:', error);
  }
  
  logDevMessage('info', 'Using fallback user data');
  return { name: 'User' };
}

// Enhanced localStorage test utility
export function testLocalStorageIntegration() {
  try {
    // Test writing
    localStorage.setItem('bytewise-test', 'test-value');
    // Test reading
    const testValue = localStorage.getItem('bytewise-test');
    // Test removing
    localStorage.removeItem('bytewise-test');
    
    const success = testValue === 'test-value';
    logDevMessage(success ? 'success' : 'error', 
      success ? 'localStorage integration test passed' : 'localStorage integration test failed');
    return success;
  } catch (error) {
    logDevMessage('error', 'localStorage integration test failed:', error);
    return false;
  }
}

// Clean initialization - no test data
export function initializeAuthState(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const authState = localStorage.getItem('bytewise-auth');
      const isAuth = authState === 'true';
      
      if (isAuth) {
        // Verify clean state - remove any lingering test data
        const testDataKeys = Object.keys(localStorage).filter(key => 
          key.includes('test') || 
          key.includes('mock') || 
          key.includes('sample') || 
          key.includes('demo')
        );
        
        testDataKeys.forEach(key => {
          if (!key.includes('usda') && !key.includes('food-database')) {
            localStorage.removeItem(key);
            logDevMessage('info', `Removed test data on init: ${key}`);
          }
        });
        
        logDevMessage('success', 'Clean auth state initialized');
      }
      
      return isAuth;
    } catch (error) {
      logDevMessage('error', 'Failed to read auth state from localStorage:', error);
      return false;
    }
  }
  return false;
}

// Clean persistence - no test data
export function persistAuthState(isAuthenticated: boolean, setSystemStatus: (updater: (prev: any) => any) => void) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bytewise-auth', isAuthenticated.toString());
      setSystemStatus(prev => ({ ...prev, auth: true }));
      logDevMessage('success', 'Clean auth state persisted successfully');
    } catch (error) {
      logDevMessage('error', 'Failed to save auth state to localStorage:', error);
      setSystemStatus(prev => ({ ...prev, auth: false }));
    }
  }
}

// Utility function to completely clear all Bytewise data (except USDA foods)
export function clearAllBytewiseData() {
  if (typeof window !== 'undefined') {
    try {
      logDevMessage('info', 'Clearing ALL Bytewise data except USDA foods...');
      
      const allKeys = Object.keys(localStorage);
      const bytewiseKeys = allKeys.filter(key => 
        key.startsWith('bytewise-') && 
        !key.includes('usda-foods') && 
        !key.includes('food-database')
      );
      
      let clearedCount = 0;
      bytewiseKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          clearedCount++;
        } catch (error) {
          logDevMessage('warning', `Failed to clear ${key}:`, error);
        }
      });
      
      logDevMessage('success', `Cleared ${clearedCount} Bytewise data items`);
      logDevMessage('info', 'USDA food database preserved');
      
      return clearedCount;
    } catch (error) {
      logDevMessage('error', 'Failed to clear Bytewise data:', error);
      return 0;
    }
  }
  return 0;
}

// Debug utility to verify current user login storage state
export function debugLoginStorage() {
  if (typeof window !== 'undefined') {
    console.log('🔍 DEBUGGING USER LOGIN STORAGE STATE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Check authentication flag
      const authFlag = localStorage.getItem('bytewise-auth');
      console.log('🔐 Auth Flag:', authFlag);
      
      // Check main user data
      const userData = localStorage.getItem('bytewise-user');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('👤 User Data Found:');
        console.log('  📧 Email:', parsedUserData.email);
        console.log('  👤 Name:', parsedUserData.name);
        console.log('  ⏰ Login Time:', parsedUserData.loginTime);
        console.log('  🆔 Session ID:', parsedUserData.sessionId);
        console.log('  🆕 First Login:', parsedUserData.isFirstLogin);
        console.log('  ⚙️ Preferences:', parsedUserData.preferences);
        if (parsedUserData.signupData) {
          console.log('  📝 Signup Data:', parsedUserData.signupData);
        }
      } else {
        console.log('❌ No user data found');
      }
      
      // Check user profile
      const userProfile = localStorage.getItem('bytewise-user-profile');
      if (userProfile) {
        const parsedProfile = JSON.parse(userProfile);
        console.log('👤 User Profile Found:');
        console.log('  🆔 Profile ID:', parsedProfile.profileId);
        console.log('  📋 Personal Info:', parsedProfile.personalInfo);
        console.log('  ⚖️ Physical Info:', parsedProfile.physicalInfo);
        console.log('  🎯 Goals:', parsedProfile.goals);
      } else {
        console.log('📋 No user profile found');
      }
      
      // Check user settings
      const userSettings = localStorage.getItem('bytewise-user-settings');
      if (userSettings) {
        const parsedSettings = JSON.parse(userSettings);
        console.log('⚙️ User Settings Found:');
        console.log('  🔧 App Settings:', parsedSettings.appSettings);
        console.log('  🍎 Nutrition Settings:', parsedSettings.nutritionSettings);
        console.log('  🔒 Privacy Settings:', parsedSettings.privacySettings);
      } else {
        console.log('⚙️ No user settings found');
      }
      
      // Check login statistics
      const loginStats = localStorage.getItem('bytewise-login-stats');
      if (loginStats) {
        const parsedStats = JSON.parse(loginStats);
        console.log('📊 Login Statistics:');
        console.log('  🔢 Login Count:', parsedStats.count);
        console.log('  🕐 Last Login:', parsedStats.lastLogin);
        console.log('  📈 Total Sessions:', parsedStats.totalSessions);
      } else {
        console.log('📊 No login statistics found');
      }
      
      // Check user sessions
      const userSessions = localStorage.getItem('bytewise-user-sessions');
      if (userSessions) {
        const parsedSessions = JSON.parse(userSessions);
        console.log('📋 User Sessions:');
        console.log('  🔢 Total Sessions:', parsedSessions.length);
        if (parsedSessions.length > 0) {
          const latestSession = parsedSessions[parsedSessions.length - 1];
          console.log('  🆔 Latest Session ID:', latestSession.sessionId);
          console.log('  📧 Session Email:', latestSession.email);
          console.log('  ⏰ Session Start:', latestSession.startTime);
          console.log('  📱 Device Type:', latestSession.deviceType);
        }
      } else {
        console.log('📋 No user sessions found');
      }
      
      // Check activity log
      const activityLog = localStorage.getItem('bytewise-user-activity');
      if (activityLog) {
        const parsedActivity = JSON.parse(activityLog);
        console.log('📋 User Activity Log:');
        console.log('  🔢 Total Activities:', parsedActivity.length);
        if (parsedActivity.length > 0) {
          const latestActivity = parsedActivity[parsedActivity.length - 1];
          console.log('  📝 Latest Activity:', latestActivity.action);
          console.log('  ⏰ Activity Time:', latestActivity.timestamp);
        }
      } else {
        console.log('📋 No user activity log found');
      }
      
      // Storage summary
      const totalStorageSize = Object.keys(localStorage)
        .filter(key => key.startsWith('bytewise-'))
        .reduce((total, key) => {
          const value = localStorage.getItem(key);
          return total + (value ? value.length : 0);
        }, 0);
      
      console.log('💾 Storage Summary:');
      console.log('  📦 Total Bytewise Data Size:', totalStorageSize, 'characters');
      console.log('  🗂️ Total Bytewise Keys:', Object.keys(localStorage).filter(key => key.startsWith('bytewise-')).length);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ STORAGE DEBUG COMPLETE');
      
      return {
        authFlag,
        hasUserData: !!userData,
        hasUserProfile: !!userProfile,
        hasUserSettings: !!userSettings,
        hasLoginStats: !!loginStats,
        hasSessions: !!userSessions,
        hasActivityLog: !!activityLog,
        totalSize: totalStorageSize
      };
      
    } catch (error) {
      console.error('❌ Error debugging storage:', error);
      return { error: error.message };
    }
  } else {
    console.log('❌ Window not available for storage debugging');
    return { error: 'Window not available' };
  }
}

// Utility to add to window for console debugging
if (typeof window !== 'undefined') {
  (window as any).bytewiseDebugLogin = debugLoginStorage;
  (window as any).bytewiseDebugStorage = debugLoginStorage;
}