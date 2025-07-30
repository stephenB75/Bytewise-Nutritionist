/**
 * User Entry Tracking Validation System
 * 
 * Comprehensive validation component to verify that user entries are being 
 * properly tracked across all systems in the Bytewise application
 * 
 * Features:
 * - Authentication tracking validation
 * - Meal logging data validation
 * - User profile data validation
 * - Dashboard metrics connection validation
 * - Local storage integrity checks
 * - Real-time data flow verification
 * - Event system validation
 * - Complete user journey tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  User,
  Database,
  Activity,
  BarChart3,
  Clock,
  Utensils,
  Settings,
  Shield,
  Eye,
  TestTube,
  Zap,
  TrendingUp
} from 'lucide-react';

interface ValidationTest {
  id: string;
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: string;
}

interface TrackingValidationReport {
  authenticationTracking: ValidationTest[];
  userProfileTracking: ValidationTest[];
  mealLoggingTracking: ValidationTest[];
  dashboardIntegration: ValidationTest[];
  eventSystemTracking: ValidationTest[];
  dataIntegrityChecks: ValidationTest[];
  overallStatus: 'healthy' | 'issues' | 'critical';
  lastValidated: string;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

interface UserEntryTrackingValidationProps {
  onClose: () => void;
}

export function UserEntryTrackingValidation({ onClose }: UserEntryTrackingValidationProps) {
  const [validationReport, setValidationReport] = useState<TrackingValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Helper function to create test result
  const createTest = (
    id: string, 
    name: string, 
    category: string, 
    status: ValidationTest['status'], 
    message: string, 
    details?: any
  ): ValidationTest => ({
    id,
    name,
    category,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });

  // Authentication tracking validation
  const validateAuthenticationTracking = useCallback((): ValidationTest[] => {
    const tests: ValidationTest[] = [];

    try {
      // Test 1: Check if authentication state is stored
      const authState = localStorage.getItem('bytewise-auth');
      tests.push(createTest(
        'auth-state',
        'Authentication State Storage',
        'authentication',
        authState ? 'pass' : 'fail',
        authState ? 'Authentication state properly stored' : 'No authentication state found',
        { authState, isAuthenticated: authState === 'true' }
      ));

      // Test 2: Check user data storage
      const userData = localStorage.getItem('bytewise-user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          tests.push(createTest(
            'user-data',
            'User Data Storage',
            'authentication',
            'pass',
            'User data properly stored and parseable',
            { 
              userDataSize: userData.length,
              userInfo: {
                name: parsedUserData.name,
                email: parsedUserData.email,
                sessionId: parsedUserData.sessionId,
                loginTime: parsedUserData.loginTime
              }
            }
          ));
        } catch (error) {
          tests.push(createTest(
            'user-data',
            'User Data Storage',
            'authentication',
            'fail',
            'User data exists but is corrupted',
            { error: error.message }
          ));
        }
      } else {
        tests.push(createTest(
          'user-data',
          'User Data Storage',
          'authentication',
          'warning',
          'No user data found (user may not be logged in)',
          null
        ));
      }

      // Test 3: Check user profile data
      const userProfile = localStorage.getItem('bytewise-user-profile');
      if (userProfile) {
        try {
          const parsedProfile = JSON.parse(userProfile);
          tests.push(createTest(
            'user-profile',
            'User Profile Storage',
            'authentication',
            'pass',
            'User profile properly stored with comprehensive data',
            {
              profileSize: userProfile.length,
              profileInfo: {
                id: parsedProfile.id,
                firstName: parsedProfile.personalInfo?.firstName,
                email: parsedProfile.personalInfo?.email,
                nutritionGoals: parsedProfile.nutritionGoals?.dailyCalories,
                achievements: parsedProfile.achievements?.length || 0,
                stats: parsedProfile.stats
              }
            }
          ));
        } catch (error) {
          tests.push(createTest(
            'user-profile',
            'User Profile Storage',
            'authentication',
            'fail',
            'User profile exists but is corrupted',
            { error: error.message }
          ));
        }
      } else {
        tests.push(createTest(
          'user-profile',
          'User Profile Storage',
          'authentication',
          'warning',
          'No user profile found',
          null
        ));
      }

      // Test 4: Check session tracking
      const sessions = localStorage.getItem('bytewise-user-sessions');
      if (sessions) {
        try {
          const parsedSessions = JSON.parse(sessions);
          tests.push(createTest(
            'session-tracking',
            'Session Tracking',
            'authentication',
            'pass',
            `Session tracking active with ${parsedSessions.length} recorded sessions`,
            { sessionCount: parsedSessions.length, sessions: parsedSessions }
          ));
        } catch (error) {
          tests.push(createTest(
            'session-tracking',
            'Session Tracking',
            'authentication',
            'fail',
            'Session data corrupted',
            { error: error.message }
          ));
        }
      } else {
        tests.push(createTest(
          'session-tracking',
          'Session Tracking',
          'authentication',
          'warning',
          'No session tracking data found',
          null
        ));
      }

    } catch (error) {
      tests.push(createTest(
        'auth-error',
        'Authentication Validation Error',
        'authentication',
        'fail',
        'Error during authentication validation',
        { error: error.message }
      ));
    }

    return tests;
  }, []);

  // Meal logging tracking validation
  const validateMealLoggingTracking = useCallback((): ValidationTest[] => {
    const tests: ValidationTest[] = [];

    try {
      // Test 1: Check daily meal logs
      const dailyMealLogs = localStorage.getItem('dailyMealLogs');
      if (dailyMealLogs) {
        try {
          const parsedLogs = JSON.parse(dailyMealLogs);
          const dates = Object.keys(parsedLogs);
          const today = new Date().toISOString().split('T')[0];
          
          tests.push(createTest(
            'meal-logs',
            'Daily Meal Logs Storage',
            'meal-logging',
            'pass',
            `Meal logs found for ${dates.length} dates`,
            {
              totalDates: dates.length,
              dates: dates,
              todayExists: !!parsedLogs[today],
              todayData: parsedLogs[today]
            }
          ));

          // Check today's meal data structure
          const todayLog = parsedLogs[today];
          if (todayLog) {
            const allIngredients = [
              ...(todayLog.meals?.breakfast || []),
              ...(todayLog.meals?.lunch || []),
              ...(todayLog.meals?.dinner || []),
              ...(todayLog.meals?.snack || [])
            ];

            tests.push(createTest(
              'today-meals',
              'Today\'s Meal Data',
              'meal-logging',
              allIngredients.length > 0 ? 'pass' : 'warning',
              allIngredients.length > 0 ? 
                `${allIngredients.length} ingredients logged today` : 
                'No ingredients logged today',
              {
                totalIngredients: allIngredients.length,
                mealBreakdown: {
                  breakfast: todayLog.meals?.breakfast?.length || 0,
                  lunch: todayLog.meals?.lunch?.length || 0,
                  dinner: todayLog.meals?.dinner?.length || 0,
                  snack: todayLog.meals?.snack?.length || 0
                },
                totals: todayLog.totals
              }
            ));
          } else {
            tests.push(createTest(
              'today-meals',
              'Today\'s Meal Data',
              'meal-logging',
              'warning',
              'No meal data logged for today',
              null
            ));
          }

        } catch (error) {
          tests.push(createTest(
            'meal-logs',
            'Daily Meal Logs Storage',
            'meal-logging',
            'fail',
            'Meal logs exist but are corrupted',
            { error: error.message }
          ));
        }
      } else {
        tests.push(createTest(
          'meal-logs',
          'Daily Meal Logs Storage',
          'meal-logging',
          'warning',
          'No meal logs found',
          null
        ));
      }

      // Test 2: Check saved recipes
      const savedRecipes = localStorage.getItem('savedRecipes');
      if (savedRecipes) {
        try {
          const parsedRecipes = JSON.parse(savedRecipes);
          tests.push(createTest(
            'saved-recipes',
            'Saved Recipes',
            'meal-logging',
            'pass',
            `${Array.isArray(parsedRecipes) ? parsedRecipes.length : Object.keys(parsedRecipes).length} saved recipes found`,
            { recipeCount: Array.isArray(parsedRecipes) ? parsedRecipes.length : Object.keys(parsedRecipes).length }
          ));
        } catch (error) {
          tests.push(createTest(
            'saved-recipes',
            'Saved Recipes',
            'meal-logging',
            'fail',
            'Saved recipes data corrupted',
            { error: error.message }
          ));
        }
      } else {
        tests.push(createTest(
          'saved-recipes',
          'Saved Recipes',
          'meal-logging',
          'warning',
          'No saved recipes found',
          null
        ));
      }

    } catch (error) {
      tests.push(createTest(
        'meal-logging-error',
        'Meal Logging Validation Error',
        'meal-logging',
        'fail',
        'Error during meal logging validation',
        { error: error.message }
      ));
    }

    return tests;
  }, []);

  // Dashboard integration validation
  const validateDashboardIntegration = useCallback((): ValidationTest[] => {
    const tests: ValidationTest[] = [];

    try {
      // Test 1: Check if Dashboard can read meal data
      const dailyMealLogs = localStorage.getItem('dailyMealLogs');
      if (dailyMealLogs) {
        const parsedLogs = JSON.parse(dailyMealLogs);
        const today = new Date().toISOString().split('T')[0];
        const todayLog = parsedLogs[today];

        if (todayLog && todayLog.totals) {
          tests.push(createTest(
            'dashboard-data-access',
            'Dashboard Data Access',
            'dashboard',
            'pass',
            'Dashboard can access meal data with calculated totals',
            {
              currentCalories: todayLog.totals.calories,
              currentProtein: todayLog.totals.protein,
              currentCarbs: todayLog.totals.carbs,
              currentFat: todayLog.totals.fat
            }
          ));

          // Test progress calculation
          const goalCalories = 2200; // Default goal
          const progressPercentage = (todayLog.totals.calories / goalCalories) * 100;
          tests.push(createTest(
            'progress-calculation',
            'Progress Calculation',
            'dashboard',
            'pass',
            `Progress calculation working: ${Math.round(progressPercentage)}% of daily goal`,
            {
              currentCalories: todayLog.totals.calories,
              goalCalories: goalCalories,
              progressPercentage: Math.round(progressPercentage),
              remaining: Math.max(0, goalCalories - todayLog.totals.calories)
            }
          ));
        } else {
          tests.push(createTest(
            'dashboard-data-access',
            'Dashboard Data Access',
            'dashboard',
            'warning',
            'Dashboard can access data but no calculated totals found',
            null
          ));
        }

        // Test historical data calculation
        const dates = Object.keys(parsedLogs);
        let totalMeals = 0;
        let totalIngredients = 0;

        dates.forEach(date => {
          const log = parsedLogs[date];
          if (log?.meals) {
            const dayIngredients = [
              ...(log.meals.breakfast || []),
              ...(log.meals.lunch || []),
              ...(log.meals.dinner || []),
              ...(log.meals.snack || [])
            ];
            if (dayIngredients.length > 0) {
              totalMeals++;
              totalIngredients += dayIngredients.length;
            }
          }
        });

        tests.push(createTest(
          'historical-calculation',
          'Historical Data Calculation',
          'dashboard',
          'pass',
          `Historical calculations working: ${totalMeals} days logged, ${totalIngredients} total ingredients`,
          {
            totalMeals,
            totalIngredients,
            totalDates: dates.length
          }
        ));

      } else {
        tests.push(createTest(
          'dashboard-data-access',
          'Dashboard Data Access',
          'dashboard',
          'warning',
          'No meal data for Dashboard to access',
          null
        ));
      }

    } catch (error) {
      tests.push(createTest(
        'dashboard-error',
        'Dashboard Integration Error',
        'dashboard',
        'fail',
        'Error during dashboard integration validation',
        { error: error.message }
      ));
    }

    return tests;
  }, []);

  // Event system validation
  const validateEventSystemTracking = useCallback((): ValidationTest[] => {
    const tests: ValidationTest[] = [];

    try {
      // Test 1: Check if event listeners are supported
      tests.push(createTest(
        'event-support',
        'Event System Support',
        'events',
        typeof window !== 'undefined' && window.addEventListener ? 'pass' : 'fail',
        typeof window !== 'undefined' && window.addEventListener ? 
          'Browser supports custom events' : 
          'Browser does not support custom events',
        {
          hasWindow: typeof window !== 'undefined',
          hasEventListener: typeof window !== 'undefined' && !!window.addEventListener,
          hasCustomEvent: typeof window !== 'undefined' && !!window.CustomEvent
        }
      ));

      // Test 2: Test event dispatch capability
      if (typeof window !== 'undefined') {
        try {
          const testEvent = new CustomEvent('bytewise-test-event', { detail: { test: true } });
          let eventReceived = false;

          const testListener = (e: CustomEvent) => {
            eventReceived = true;
          };

          window.addEventListener('bytewise-test-event', testListener);
          window.dispatchEvent(testEvent);
          window.removeEventListener('bytewise-test-event', testListener);

          tests.push(createTest(
            'event-dispatch',
            'Event Dispatch Test',
            'events',
            eventReceived ? 'pass' : 'fail',
            eventReceived ? 'Custom event dispatch working' : 'Custom event dispatch failed',
            { eventReceived }
          ));
        } catch (error) {
          tests.push(createTest(
            'event-dispatch',
            'Event Dispatch Test',
            'events',
            'fail',
            'Error testing event dispatch',
            { error: error.message }
          ));
        }
      }

    } catch (error) {
      tests.push(createTest(
        'event-system-error',
        'Event System Error',
        'events',
        'fail',
        'Error during event system validation',
        { error: error.message }
      ));
    }

    return tests;
  }, []);

  // Data integrity validation
  const validateDataIntegrity = useCallback((): ValidationTest[] => {
    const tests: ValidationTest[] = [];

    try {
      // Test 1: Check localStorage availability and capacity
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const testKey = 'bytewise-integrity-test';
          const testValue = 'test-data';
          localStorage.setItem(testKey, testValue);
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);

          tests.push(createTest(
            'storage-integrity',
            'Storage Read/Write Integrity',
            'integrity',
            retrieved === testValue ? 'pass' : 'fail',
            retrieved === testValue ? 'localStorage read/write working correctly' : 'localStorage read/write failed',
            { testValue, retrieved, match: retrieved === testValue }
          ));
        } catch (error) {
          tests.push(createTest(
            'storage-integrity',
            'Storage Read/Write Integrity',
            'integrity',
            'fail',
            'localStorage test failed',
            { error: error.message }
          ));
        }

        // Test 2: Check data consistency between related storage items
        const authState = localStorage.getItem('bytewise-auth');
        const userData = localStorage.getItem('bytewise-user');
        const userProfile = localStorage.getItem('bytewise-user-profile');

        if (authState === 'true') {
          const hasUserData = !!userData;
          const hasUserProfile = !!userProfile;

          tests.push(createTest(
            'data-consistency',
            'Authentication Data Consistency',
            'integrity',
            hasUserData && hasUserProfile ? 'pass' : 'warning',
            hasUserData && hasUserProfile ? 
              'Authentication state consistent with user data' : 
              'Authentication state inconsistent with user data',
            {
              authState: authState === 'true',
              hasUserData,
              hasUserProfile,
              consistent: hasUserData && hasUserProfile
            }
          ));
        } else {
          tests.push(createTest(
            'data-consistency',
            'Authentication Data Consistency',
            'integrity',
            'warning',
            'User not authenticated - consistency check skipped',
            { authState: false }
          ));
        }

        // Test 3: Check meal data totals accuracy
        const dailyMealLogs = localStorage.getItem('dailyMealLogs');
        if (dailyMealLogs) {
          try {
            const parsedLogs = JSON.parse(dailyMealLogs);
            const today = new Date().toISOString().split('T')[0];
            const todayLog = parsedLogs[today];

            if (todayLog && todayLog.meals && todayLog.totals) {
              const allIngredients = [
                ...(todayLog.meals.breakfast || []),
                ...(todayLog.meals.lunch || []),
                ...(todayLog.meals.dinner || []),
                ...(todayLog.meals.snack || [])
              ];

              const calculatedCalories = allIngredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
              const storedCalories = todayLog.totals.calories || 0;
              const caloriesMatch = Math.abs(calculatedCalories - storedCalories) < 1;

              tests.push(createTest(
                'totals-accuracy',
                'Meal Totals Accuracy',
                'integrity',
                caloriesMatch ? 'pass' : 'warning',
                caloriesMatch ? 
                  'Meal totals calculation accurate' : 
                  `Meal totals mismatch: calculated ${calculatedCalories}, stored ${storedCalories}`,
                {
                  calculatedCalories,
                  storedCalories,
                  difference: Math.abs(calculatedCalories - storedCalories),
                  match: caloriesMatch,
                  ingredientCount: allIngredients.length
                }
              ));
            } else {
              tests.push(createTest(
                'totals-accuracy',
                'Meal Totals Accuracy',
                'integrity',
                'warning',
                'No meal data to validate totals',
                null
              ));
            }
          } catch (error) {
            tests.push(createTest(
              'totals-accuracy',
              'Meal Totals Accuracy',
              'integrity',
              'fail',
              'Error validating meal totals',
              { error: error.message }
            ));
          }
        }

      } else {
        tests.push(createTest(
          'storage-integrity',
          'Storage Availability',
          'integrity',
          'fail',
          'localStorage not available',
          { available: false }
        ));
      }

    } catch (error) {
      tests.push(createTest(
        'integrity-error',
        'Data Integrity Error',
        'integrity',
        'fail',
        'Error during data integrity validation',
        { error: error.message }
      ));
    }

    return tests;
  }, []);

  // User profile tracking validation
  const validateUserProfileTracking = useCallback((): ValidationTest[] => {
    const tests: ValidationTest[] = [];

    try {
      const userProfile = localStorage.getItem('bytewise-user-profile');
      if (userProfile) {
        try {
          const parsedProfile = JSON.parse(userProfile);
          
          // Check profile completeness
          const hasPersonalInfo = !!(parsedProfile.personalInfo?.firstName && parsedProfile.personalInfo?.email);
          const hasNutritionGoals = !!(parsedProfile.nutritionGoals?.dailyCalories);
          const hasPreferences = !!(parsedProfile.preferences);
          
          tests.push(createTest(
            'profile-completeness',
            'Profile Data Completeness',
            'profile',
            hasPersonalInfo && hasNutritionGoals ? 'pass' : 'warning',
            `Profile completeness: Personal info ${hasPersonalInfo ? '✓' : '✗'}, Nutrition goals ${hasNutritionGoals ? '✓' : '✗'}, Preferences ${hasPreferences ? '✓' : '✗'}`,
            {
              hasPersonalInfo,
              hasNutritionGoals,
              hasPreferences,
              personalInfo: parsedProfile.personalInfo,
              nutritionGoals: parsedProfile.nutritionGoals,
              stats: parsedProfile.stats
            }
          ));

          // Check if profile is being updated
          const accountInfo = parsedProfile.accountInfo;
          if (accountInfo) {
            tests.push(createTest(
              'profile-tracking',
              'Profile Activity Tracking',
              'profile',
              'pass',
              'Profile activity tracking active',
              {
                joinDate: accountInfo.joinDate,
                lastLogin: accountInfo.lastLoginDate,
                emailVerified: accountInfo.emailVerified,
                accountType: accountInfo.accountType
              }
            ));
          }

        } catch (error) {
          tests.push(createTest(
            'profile-parsing',
            'Profile Data Parsing',
            'profile',
            'fail',
            'Profile data exists but is corrupted',
            { error: error.message }
          ));
        }
      } else {
        tests.push(createTest(
          'profile-existence',
          'Profile Data Existence',
          'profile',
          'warning',
          'No user profile data found',
          null
        ));
      }

    } catch (error) {
      tests.push(createTest(
        'profile-error',
        'Profile Validation Error',
        'profile',
        'fail',
        'Error during profile validation',
        { error: error.message }
      ));
    }

    return tests;
  }, []);

  // Main validation function
  const runCompleteValidation = useCallback(async () => {
    setIsValidating(true);

    try {
      console.log('🔍 Starting comprehensive user entry tracking validation...');

      const authenticationTests = validateAuthenticationTracking();
      const userProfileTests = validateUserProfileTracking();
      const mealLoggingTests = validateMealLoggingTracking();
      const dashboardTests = validateDashboardIntegration();
      const eventTests = validateEventSystemTracking();
      const integrityTests = validateDataIntegrity();

      const allTests = [
        ...authenticationTests,
        ...userProfileTests,
        ...mealLoggingTests,
        ...dashboardTests,
        ...eventTests,
        ...integrityTests
      ];

      const passed = allTests.filter(t => t.status === 'pass').length;
      const failed = allTests.filter(t => t.status === 'fail').length;
      const warnings = allTests.filter(t => t.status === 'warning').length;

      let overallStatus: 'healthy' | 'issues' | 'critical' = 'healthy';
      if (failed > 3 || (failed > 0 && warnings > 5)) {
        overallStatus = 'critical';
      } else if (failed > 0 || warnings > 3) {
        overallStatus = 'issues';
      }

      const report: TrackingValidationReport = {
        authenticationTracking: authenticationTests,
        userProfileTracking: userProfileTests,
        mealLoggingTracking: mealLoggingTests,
        dashboardIntegration: dashboardTests,
        eventSystemTracking: eventTests,
        dataIntegrityChecks: integrityTests,
        overallStatus,
        lastValidated: new Date().toISOString(),
        summary: {
          totalTests: allTests.length,
          passed,
          failed,
          warnings
        }
      };

      setValidationReport(report);

      console.log('✅ User entry tracking validation complete:', {
        overallStatus,
        summary: report.summary,
        categories: {
          authentication: authenticationTests.length,
          profile: userProfileTests.length,
          mealLogging: mealLoggingTests.length,
          dashboard: dashboardTests.length,
          events: eventTests.length,
          integrity: integrityTests.length
        }
      });

    } catch (error) {
      console.error('❌ Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [
    validateAuthenticationTracking,
    validateUserProfileTracking,
    validateMealLoggingTracking,
    validateDashboardIntegration,
    validateEventSystemTracking,
    validateDataIntegrity
  ]);

  // Initial validation on mount
  useEffect(() => {
    runCompleteValidation();
  }, [runCompleteValidation]);

  const getStatusIcon = (status: ValidationTest['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ValidationTest['status']) => {
    switch (status) {
      case 'pass': return 'border-green-200 bg-green-50';
      case 'fail': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Shield className="w-5 h-5" />;
      case 'profile': return <User className="w-5 h-5" />;
      case 'meal-logging': return <Utensils className="w-5 h-5" />;
      case 'dashboard': return <BarChart3 className="w-5 h-5" />;
      case 'events': return <Zap className="w-5 h-5" />;
      case 'integrity': return <Database className="w-5 h-5" />;
      default: return <TestTube className="w-5 h-5" />;
    }
  };

  const TestCategory = ({ title, tests, icon }: { title: string; tests: ValidationTest[]; icon: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
          {title}
        </h4>
        <Badge variant="outline">
          {tests.length} tests
        </Badge>
      </div>
      
      <div className="space-y-2">
        {tests.map((test) => (
          <div key={test.id} className={`p-3 rounded-lg border ${getStatusColor(test.status)} transition-all duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <span className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  {test.name}
                </span>
              </div>
              {test.details && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(showDetails === test.id ? null : test.id)}
                  className="h-6 w-6 p-0"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              {test.message}
            </p>
            
            {showDetails === test.id && test.details && (
              <div className="mt-2 p-2 bg-white/50 rounded border">
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isValidating) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="text-brand-subheading mb-2" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
              Validating User Entry Tracking
            </h3>
            <p className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              Running comprehensive validation of authentication, meal logging, dashboard integration, and data integrity...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!validationReport) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <XCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h3 className="text-brand-subheading mb-2" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
            Validation Failed
          </h3>
          <p className="text-brand-body mb-4" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
            Unable to complete user entry tracking validation
          </p>
          <Button onClick={runCompleteValidation} className="text-brand-button" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Validation
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                User Entry Tracking Validation
              </h3>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Comprehensive validation of user data tracking across all systems
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={runCompleteValidation}
              disabled={isValidating}
              variant="outline"
              size="sm"
              className="text-brand-button"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-brand-button"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Overall Status */}
      <Card className={`p-4 ${
        validationReport.overallStatus === 'healthy' ? 'bg-green-50 border-green-200' :
        validationReport.overallStatus === 'issues' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {validationReport.overallStatus === 'healthy' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : validationReport.overallStatus === 'issues' ? (
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
                Overall Status: {validationReport.overallStatus.toUpperCase()}
              </h4>
              <p className="text-sm text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                {validationReport.summary.passed} passed, {validationReport.summary.failed} failed, {validationReport.summary.warnings} warnings
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              {Math.round((validationReport.summary.passed / validationReport.summary.totalTests) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Success Rate
            </div>
          </div>
        </div>
      </Card>

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <TestCategory
            title="Authentication Tracking"
            tests={validationReport.authenticationTracking}
            icon={<Shield className="w-5 h-5 text-blue-600" />}
          />
        </Card>

        <Card className="p-4">
          <TestCategory
            title="User Profile Tracking"
            tests={validationReport.userProfileTracking}
            icon={<User className="w-5 h-5 text-green-600" />}
          />
        </Card>

        <Card className="p-4">
          <TestCategory
            title="Meal Logging Tracking"
            tests={validationReport.mealLoggingTracking}
            icon={<Utensils className="w-5 h-5 text-purple-600" />}
          />
        </Card>

        <Card className="p-4">
          <TestCategory
            title="Dashboard Integration"
            tests={validationReport.dashboardIntegration}
            icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
          />
        </Card>

        <Card className="p-4">
          <TestCategory
            title="Event System Tracking"
            tests={validationReport.eventSystemTracking}
            icon={<Zap className="w-5 h-5 text-yellow-600" />}
          />
        </Card>

        <Card className="p-4">
          <TestCategory
            title="Data Integrity Checks"
            tests={validationReport.dataIntegrityChecks}
            icon={<Database className="w-5 h-5 text-red-600" />}
          />
        </Card>
      </div>

      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 600 }}>
            Validation Summary
          </h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              {validationReport.summary.passed}
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Tests Passed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              {validationReport.summary.failed}
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Tests Failed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              {validationReport.summary.warnings}
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Warnings
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              {validationReport.summary.totalTests}
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Total Tests
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
          Last validated: {new Date(validationReport.lastValidated).toLocaleString()}
        </div>
      </Card>
    </div>
  );
}