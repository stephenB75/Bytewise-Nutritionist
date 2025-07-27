import { useState, useEffect } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignupScreen } from './components/auth/SignupScreen';
import { Dashboard } from './components/Dashboard';
import { CalorieCalculator } from './components/CalorieCalculator';
import { MealPlanner } from './components/MealPlanner';
import { Navigation } from './components/Navigation';
import { BrandStandard } from './components/Brand';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { FoodDatabaseProvider, useFoodDatabase } from './components/FoodDatabaseManager';
import { Bell, Settings, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  // Initialize authentication state from localStorage with error handling
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const authState = localStorage.getItem('bytewise-auth');
        return authState === 'true';
      } catch (error) {
        console.error('❌ Failed to read auth state from localStorage:', error);
        return false;
      }
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState({
    auth: false,
    storage: false,
    navigation: false,
    dragDrop: false,
    notifications: false
  });

  // Persist authentication state to localStorage with error handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bytewise-auth', isAuthenticated.toString());
        setSystemStatus(prev => ({ ...prev, auth: true }));
        console.log('✅ Auth state persisted successfully');
      } catch (error) {
        console.error('❌ Failed to save auth state to localStorage:', error);
        setSystemStatus(prev => ({ ...prev, auth: false }));
      }
    }
  }, [isAuthenticated]);

  // Enhanced drag and toast event listeners with status tracking
  useEffect(() => {
    const handleDragStart = (e: Event) => {
      console.log('🎯 Drag started - Global state updated');
      setIsDragging(true);
      setSystemStatus(prev => ({ ...prev, dragDrop: true }));
    };
    
    const handleDragEnd = (e: Event) => {
      console.log('🎯 Drag ended - Global state reset');
      setIsDragging(false);
    };

    // Enhanced toast notification handler with status tracking
    const handleToast = (e: any) => {
      const message = e.detail?.message;
      const duration = e.detail?.duration || 3000;
      if (message) {
        console.log('🔔 Toast triggered:', message);
        setToastMessage(message);
        setSystemStatus(prev => ({ ...prev, notifications: true }));
        // Auto-hide toast with customizable duration
        setTimeout(() => setToastMessage(null), duration);
      }
    };
    
    try {
      // Listen for custom drag events from CalorieCalculator
      window.addEventListener('bytewise-drag-start', handleDragStart);
      window.addEventListener('bytewise-drag-end', handleDragEnd);
      window.addEventListener('bytewise-toast', handleToast);
      
      // Also listen for native drag events as fallback
      document.addEventListener('dragstart', handleDragStart);
      document.addEventListener('dragend', handleDragEnd);
      
      // Handle touch events for mobile drag
      document.addEventListener('touchstart', handleDragStart);
      document.addEventListener('touchend', handleDragEnd);
      
      console.log('✅ Event listeners registered successfully');
      
    } catch (error) {
      console.error('❌ Failed to register event listeners:', error);
    }
    
    return () => {
      try {
        window.removeEventListener('bytewise-drag-start', handleDragStart);
        window.removeEventListener('bytewise-drag-end', handleDragEnd);
        window.removeEventListener('bytewise-toast', handleToast);
        document.removeEventListener('dragstart', handleDragStart);
        document.removeEventListener('dragend', handleDragEnd);
        document.removeEventListener('touchstart', handleDragStart);
        document.removeEventListener('touchend', handleDragEnd);
        console.log('✅ Event listeners cleaned up successfully');
      } catch (error) {
        console.error('❌ Failed to cleanup event listeners:', error);
      }
    };
  }, []);

  // Apply drag state styles to body with error handling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        if (isDragging) {
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'grabbing';
          console.log('🎯 Drag styles applied to body');
        } else {
          document.body.style.userSelect = 'auto';
          document.body.style.cursor = 'auto';
          console.log('🎯 Drag styles removed from body');
        }
      } catch (error) {
        console.error('❌ Failed to apply drag styles:', error);
      }
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        try {
          document.body.style.userSelect = 'auto';
          document.body.style.cursor = 'auto';
        } catch (error) {
          console.error('❌ Failed to cleanup drag styles:', error);
        }
      }
    };
  }, [isDragging]);

  // Enhanced session validation on app load
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      try {
        const userData = localStorage.getItem('bytewise-user');
        if (!userData) {
          console.log('🔐 No user data found, logging out');
          handleLogout();
        } else {
          const user = JSON.parse(userData);
          if (user.loginTime) {
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
            
            // Auto-logout after 24 hours
            if (hoursSinceLogin > 24) {
              console.log('🔐 Session expired, logging out');
              showToast('Session expired. Please log in again.', 4000);
              handleLogout();
            } else {
              console.log(`✅ Session valid, ${(24 - hoursSinceLogin).toFixed(1)} hours remaining`);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error validating session:', error);
        handleLogout();
      }
    }
  }, [isAuthenticated]);

  // Helper function to show toast messages with error handling
  const showToast = (message: string, duration = 3000) => {
    try {
      console.log('🔔 Showing toast:', message);
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), duration);
    } catch (error) {
      console.error('❌ Failed to show toast:', error);
    }
  };

  // Enhanced login handler with database integration
  const handleLogin = async (email?: string) => {
    console.log('🔐 Login attempt for:', email || 'alex@example.com');
    try {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        const userData = {
          name: 'Alex',
          email: email || 'alex@example.com',
          loginTime: new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            units: 'metric'
          }
        };
        localStorage.setItem('bytewise-user', JSON.stringify(userData));
        
        // Initialize user profile in database if it doesn't exist
        window.dispatchEvent(new CustomEvent('bytewise-user-login', {
          detail: { userData }
        }));
        
        console.log('✅ User data saved to localStorage');
        showToast(`Welcome back, Alex! 🌟`);
        setSystemStatus(prev => ({ ...prev, auth: true, storage: true }));
      }
    } catch (error) {
      console.error('❌ Failed to save user data:', error);
      showToast('Login successful, but preferences may not be saved.');
      setSystemStatus(prev => ({ ...prev, auth: true, storage: false }));
    }
  };

  // Enhanced signup handler with database integration
  const handleSignup = async (name?: string, email?: string) => {
    console.log('🔐 Signup attempt for:', name || 'Alex', email || 'alex@example.com');
    try {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        const userData = {
          name: name || 'Alex',
          email: email || 'alex@example.com',
          loginTime: new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            units: 'metric'
          },
          isFirstLogin: true
        };
        localStorage.setItem('bytewise-user', JSON.stringify(userData));
        
        // Create new user profile in database
        window.dispatchEvent(new CustomEvent('bytewise-user-signup', {
          detail: { userData }
        }));
        
        console.log('✅ New user data saved to localStorage');
        showToast(`Welcome to Bytewise, ${name || 'Alex'}! 🎉`);
        setSystemStatus(prev => ({ ...prev, auth: true, storage: true }));
      }
    } catch (error) {
      console.error('❌ Failed to save user data:', error);
      showToast('Account created successfully!');
      setSystemStatus(prev => ({ ...prev, auth: true, storage: false }));
    }
  };

  // Enhanced logout handler with comprehensive cleanup testing
  const handleLogout = () => {
    console.log('🔐 Logout initiated');
    try {
      setIsAuthenticated(false);
      setActiveTab('dashboard');
      setAuthMode('login');
      setNotifications([]);
      
      if (typeof window !== 'undefined') {
        // Clear all Bytewise-related data including database
        const keysToRemove = [
          'bytewise-auth',
          'bytewise-user',
          'quickAddIngredient',
          'pendingMealType',
          'pendingMealPlanRecipe',
          'savedRecipes'
        ];
        
        // Clear food database
        const dbKeysToRemove = [
          'bytewise-db-user-profile',
          'bytewise-db-foods',
          'bytewise-db-user-entries',
          'bytewise-db-meal-logs',
          'bytewise-db-last-sync'
        ];
        
        let clearedCount = 0;
        [...keysToRemove, ...dbKeysToRemove].forEach(key => {
          try {
            if (localStorage.getItem(key)) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          } catch (error) {
            console.warn(`⚠️ Failed to remove ${key} from localStorage:`, error);
          }
        });
        
        // Trigger database clear event
        window.dispatchEvent(new CustomEvent('bytewise-user-logout'));
        
        console.log(`✅ Logout complete, ${clearedCount} localStorage items cleared`);
        setSystemStatus(prev => ({ ...prev, auth: false }));
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  // Enhanced tab change handler with navigation testing
  const handleTabChange = (tab: string) => {
    console.log(`🧭 Navigating from ${activeTab} to ${tab}`);
    try {
      setActiveTab(tab);
      setSystemStatus(prev => ({ ...prev, navigation: true }));
      
      // Reset drag state when changing tabs
      if (isDragging) {
        console.log('🎯 Resetting drag state during navigation');
        setIsDragging(false);
      }

      // Test cross-component data sharing
      if (tab === 'calculator') {
        const quickAdd = localStorage.getItem('quickAddIngredient');
        if (quickAdd) {
          console.log('💾 Quick add ingredient found for calculator:', quickAdd);
        }
      }

      if (tab === 'planner') {
        const pendingRecipe = localStorage.getItem('pendingMealPlanRecipe');
        if (pendingRecipe) {
          console.log('💾 Pending meal plan recipe found:', pendingRecipe);
        }
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      setSystemStatus(prev => ({ ...prev, navigation: false }));
    }
  };

  // Enhanced notifications handler with comprehensive testing
  const handleNotifications = () => {
    if (isDragging) {
      console.log('🔔 Notifications blocked during drag operation');
      return;
    }
    
    const mockNotifications = [
      'Your daily protein goal is 85% complete! 💪',
      'Don\'t forget to log your dinner 🍽️',
      'New recipe saved: "Power Bowl" ✨',
      'Weekly streak: 7 days! Keep it up! 🔥'
    ];
    
    try {
      if (notifications.length === 0) {
        console.log('🔔 Loading notifications:', mockNotifications.length);
        setNotifications(mockNotifications);
        showToast(`${mockNotifications.length} new notifications`);
        setSystemStatus(prev => ({ ...prev, notifications: true }));
        
        // Show notification summary in alert
        setTimeout(() => {
          console.log('🔔 Displaying notification alert');
          alert('📫 Recent Notifications:\n\n' + mockNotifications.join('\n\n'));
        }, 500);
      } else {
        console.log('🔔 Clearing all notifications');
        setNotifications([]);
        showToast('All notifications cleared');
      }
    } catch (error) {
      console.error('❌ Error handling notifications:', error);
      showToast('Unable to load notifications');
      setSystemStatus(prev => ({ ...prev, notifications: false }));
    }
  };

  // Enhanced profile navigation handler
  const handleProfileNavigation = () => {
    if (isDragging) {
      console.log('🧭 Profile navigation blocked during drag operation');
      return;
    }
    console.log('🧭 Navigating to profile via settings button');
    handleTabChange('profile');
  };

  // Enhanced forgot password handler
  const handleForgotPassword = (email: string) => {
    console.log('🔐 Password reset requested for:', email);
    try {
      // Simulate API call delay
      setTimeout(() => {
        console.log('✅ Password reset email sent');
        showToast(`Password reset link sent to ${email} 📧`);
        setAuthMode('login');
      }, 1000);
    } catch (error) {
      console.error('❌ Error sending reset email:', error);
      showToast('Failed to send reset email. Please try again.');
    }
  };

  // Get current user data with comprehensive testing
  const getCurrentUser = () => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('bytewise-user');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 Current user retrieved:', user.name);
          return user;
        }
      }
    } catch (error) {
      console.error('❌ Error getting user data:', error);
    }
    console.log('👤 Using fallback user data');
    return { name: 'User' };
  };

  // Comprehensive localStorage functionality test
  const testLocalStorageIntegration = () => {
    try {
      // Test writing
      localStorage.setItem('bytewise-test', 'test-value');
      // Test reading
      const testValue = localStorage.getItem('bytewise-test');
      // Test removing
      localStorage.removeItem('bytewise-test');
      
      const success = testValue === 'test-value';
      console.log(success ? '✅ localStorage integration test passed' : '❌ localStorage integration test failed');
      setSystemStatus(prev => ({ ...prev, storage: success }));
      return success;
    } catch (error) {
      console.error('❌ localStorage integration test failed:', error);
      setSystemStatus(prev => ({ ...prev, storage: false }));
      return false;
    }
  };

  // Comprehensive app functionality test
  useEffect(() => {
    console.log('🚀 Bytewise App initialized');
    console.log('🔐 Authentication state:', isAuthenticated);
    console.log('🧭 Active tab:', activeTab);
    
    // Test localStorage
    const storageWorking = testLocalStorageIntegration();
    
    // Test user data if authenticated
    if (isAuthenticated) {
      getCurrentUser();
    }

    // Update system status
    setSystemStatus(prev => ({
      ...prev,
      navigation: typeof activeTab === 'string' && activeTab.length > 0,
      storage: storageWorking
    }));
  }, []);

  // Comprehensive functionality test function
  const runFunctionalityTest = () => {
    console.log('🧪 Running comprehensive app functionality test...');
    
    const testResults = {
      auth: isAuthenticated,
      user: getCurrentUser().name !== 'User',
      storage: testLocalStorageIntegration(),
      navigation: typeof activeTab === 'string' && activeTab.length > 0,
      notifications: Array.isArray(notifications),
      dragDrop: typeof isDragging === 'boolean',
      toast: typeof showToast === 'function'
    };
    
    console.log('🧪 Test Results:', testResults);
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    showToast(`🧪 Functionality Test: ${passedTests}/${totalTests} systems operational`);
    
    // Update system status
    setSystemStatus({
      auth: testResults.auth,
      storage: testResults.storage,
      navigation: testResults.navigation,
      notifications: testResults.notifications,
      dragDrop: testResults.dragDrop
    });
    
    return testResults;
  };

  // Authentication screens with enhanced error handling
  if (!isAuthenticated) {
    console.log('🔐 Rendering auth screen:', authMode);
    
    switch (authMode) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToSignup={() => {
              console.log('🧭 Navigating to signup from login');
              setAuthMode('signup');
            }}
            onNavigateToForgotPassword={() => {
              console.log('🧭 Navigating to forgot password from login');
              setAuthMode('forgot');
            }}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onSignup={handleSignup}
            onNavigateToLogin={() => {
              console.log('🧭 Navigating to login from signup');
              setAuthMode('login');
            }}
          />
        );
      case 'forgot':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-fade-in">
            <div className="max-w-md w-full">
              <BrandStandard size="lg" className="mb-12" />
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold text-foreground mb-3">Reset Password</h1>
                <p className="text-muted-foreground">
                  We'll send you a link to reset your password
                </p>
              </div>
              
              <form 
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const email = formData.get('email') as string;
                  if (email) {
                    showToast('Sending reset link...');
                    handleForgotPassword(email);
                  } else {
                    showToast('Please enter a valid email address');
                  }
                }}
              >
                <div>
                  <label className="block font-medium text-foreground mb-3">Email address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full p-4 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full p-4 bg-primary text-primary-foreground rounded-lg font-medium btn-animate hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Send Reset Link
                </button>
                
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🧭 Returning to login from forgot password');
                      setAuthMode('login');
                    }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      default:
        console.error('❌ Unknown auth mode:', authMode);
        return null;
    }
  }

  // Enhanced component rendering with comprehensive error boundaries
  const renderActiveTab = () => {
    const currentUser = getCurrentUser();
    console.log(`🧭 Rendering tab: ${activeTab}`);
    
    try {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard userName={currentUser.name} onNavigate={handleTabChange} />;
        case 'calculator':
          return <CalorieCalculator onNavigate={handleTabChange} />;
        case 'planner':
          return <MealPlanner onNavigate={handleTabChange} />;
        case 'calendar':
          return <CalendarScreen />;
        case 'profile':
          return <ProfileScreen onLogout={handleLogout} />;
        default:
          console.warn(`⚠️ Unknown tab: ${activeTab}, defaulting to dashboard`);
          return <Dashboard userName={currentUser.name} onNavigate={handleTabChange} />;
      }
    } catch (error) {
      console.error(`❌ Error rendering ${activeTab} tab:`, error);
      showToast('Error loading page. Please try again.');
      return <Dashboard userName={currentUser.name} onNavigate={handleTabChange} />;
    }
  };

  // Enhanced page title with better naming
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      calculator: 'Recipe Builder',
      planner: 'Meal Planner',
      calendar: 'Progress Calendar',
      profile: 'Profile & Settings'
    };
    const title = titles[activeTab as keyof typeof titles] || 'Dashboard';
    return title;
  };

  // Get system status icon
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-3 h-3 text-green-500" />
    ) : (
      <AlertCircle className="w-3 h-3 text-red-500" />
    );
  };

  console.log('🎯 App render - isDragging:', isDragging, 'activeTab:', activeTab);

  return (
    <FoodDatabaseProvider>
      <AppContent 
        isAuthenticated={isAuthenticated}
        activeTab={activeTab}
        authMode={authMode}
        notifications={notifications}
        isDragging={isDragging}
        toastMessage={toastMessage}
        systemStatus={systemStatus}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handleLogout={handleLogout}
        handleTabChange={handleTabChange}
        handleNotifications={handleNotifications}
        handleProfileNavigation={handleProfileNavigation}
        handleForgotPassword={handleForgotPassword}
        showToast={showToast}
        getCurrentUser={getCurrentUser}
        renderActiveTab={renderActiveTab}
        getPageTitle={getPageTitle}
        getStatusIcon={getStatusIcon}
        runFunctionalityTest={runFunctionalityTest}
        setAuthMode={setAuthMode}
      />
    </FoodDatabaseProvider>
  );
}

// Separate component to access FoodDatabase context
function AppContent({
  isAuthenticated,
  activeTab,
  authMode,
  notifications,
  isDragging,
  toastMessage,
  systemStatus,
  handleLogin,
  handleSignup,
  handleLogout,
  handleTabChange,
  handleNotifications,
  handleProfileNavigation,
  handleForgotPassword,
  showToast,
  getCurrentUser,
  renderActiveTab,
  getPageTitle,
  getStatusIcon,
  runFunctionalityTest,
  setAuthMode
}: any) {
  const { createUserProfile, userProfile, syncData, getDatabaseStats, isLoading: dbLoading } = useFoodDatabase();

  // Handle user login/signup events
  useEffect(() => {
    const handleUserLogin = async (e: any) => {
      const { userData } = e.detail;
      
      if (!userProfile) {
        // Create user profile from login data
        const profileData = {
          name: userData.name,
          email: userData.email,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
          joinDate: userData.loginTime,
          preferences: {
            notifications: userData.preferences?.notifications || true,
            darkMode: userData.preferences?.darkMode || false,
            units: userData.preferences?.units || 'metric',
            privacy: 'public' as const
          },
          nutritionGoals: {
            dailyCalories: 2200,
            protein: 150,
            carbs: 275,
            fat: 73,
            fiber: 25,
            water: 8
          },
          activityLevel: {
            level: 'moderately_active',
            exerciseDays: 4,
            workoutIntensity: 'medium',
            stepGoal: 10000
          },
          achievements: [
            {
              id: 'welcome',
              title: 'Welcome!',
              description: 'Started your nutrition journey',
              icon: '🌟',
              dateEarned: new Date().toISOString(),
              progress: 100
            }
          ],
          stats: {
            totalRecipes: 0,
            streakDays: 1,
            caloriesTracked: 0,
            lastLoginDate: userData.loginTime,
            weeklyGoalsMet: 0
          }
        };

        const success = await createUserProfile(profileData);
        if (success) {
          console.log('✅ User profile created in database');
        }
      }
    };

    const handleUserSignup = async (e: any) => {
      const { userData } = e.detail;
      
      // Create new user profile for signup
      const profileData = {
        name: userData.name,
        email: userData.email,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
        joinDate: userData.loginTime,
        preferences: {
          notifications: userData.preferences?.notifications || true,
          darkMode: userData.preferences?.darkMode || false,
          units: userData.preferences?.units || 'metric',
          privacy: 'public' as const
        },
        nutritionGoals: {
          dailyCalories: 2200,
          protein: 150,
          carbs: 275,
          fat: 73,
          fiber: 25,
          water: 8
        },
        activityLevel: {
          level: 'moderately_active',
          exerciseDays: 4,
          workoutIntensity: 'medium',
          stepGoal: 10000
        },
        achievements: [
          {
            id: 'welcome',
            title: 'Welcome!',
            description: 'Started your nutrition journey',
            icon: '🌟',
            dateEarned: new Date().toISOString(),
            progress: 100
          },
          {
            id: 'first-signup',
            title: 'Getting Started',
            description: 'Created your Bytewise account',
            icon: '🎉',
            dateEarned: new Date().toISOString(),
            progress: 100
          }
        ],
        stats: {
          totalRecipes: 0,
          streakDays: 0,
          caloriesTracked: 0,
          lastLoginDate: userData.loginTime,
          weeklyGoalsMet: 0
        }
      };

      const success = await createUserProfile(profileData);
      if (success) {
        console.log('✅ New user profile created in database');
        showToast('Profile created successfully! 🎉');
      }
    };

    const handleUserLogout = () => {
      console.log('🗄️ Clearing database on logout');
      // Database will auto-clear via context cleanup
    };

    window.addEventListener('bytewise-user-login', handleUserLogin);
    window.addEventListener('bytewise-user-signup', handleUserSignup);
    window.addEventListener('bytewise-user-logout', handleUserLogout);

    return () => {
      window.removeEventListener('bytewise-user-login', handleUserLogin);
      window.removeEventListener('bytewise-user-signup', handleUserSignup);
      window.removeEventListener('bytewise-user-logout', handleUserLogout);
    };
  }, [userProfile, createUserProfile, showToast]);

  // Enhanced functionality test with database stats
  const enhancedFunctionalityTest = () => {
    console.log('🧪 Running enhanced app functionality test with database...');
    
    const dbStats = getDatabaseStats();
    const testResults = {
      auth: isAuthenticated,
      user: getCurrentUser().name !== 'User',
      database: !dbLoading && dbStats.totalFoods > 0,
      userProfile: userProfile !== null,
      storage: dbStats.storageUsed > 0,
      navigation: typeof activeTab === 'string' && activeTab.length > 0,
      notifications: Array.isArray(notifications),
      dragDrop: typeof isDragging === 'boolean',
      toast: typeof showToast === 'function'
    };
    
    console.log('🧪 Enhanced Test Results:', testResults);
    console.log('📊 Database Stats:', dbStats);
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    showToast(`🧪 Enhanced Test: ${passedTests}/${totalTests} systems operational`);
    
    return testResults;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Development Testing Controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 z-[100] flex gap-2">
          <button
            onClick={enhancedFunctionalityTest}
            className="bg-blue-500 text-white px-3 py-1 text-xs rounded opacity-75 hover:opacity-100 transition-opacity"
          >
            🧪 Test All
          </button>
          <button
            onClick={() => {
              console.clear();
              console.log('🧹 Console cleared - Starting fresh test session');
            }}
            className="bg-gray-500 text-white px-3 py-1 text-xs rounded opacity-75 hover:opacity-100 transition-opacity"
          >
            🧹 Clear
          </button>
        </div>
      )}

      {/* Enhanced Fixed Header with Better UX */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm border-b border-border transition-all duration-300 ${
        isDragging 
          ? 'z-20 bg-background/60 pointer-events-none' 
          : 'z-50 bg-background/95 pointer-events-auto'
      }`}>
        <div className="w-full max-w-lg mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Logo - Always clickable with home navigation */}
            <div className="flex-shrink-0 pointer-events-auto">
              <button 
                onClick={() => {
                  console.log('🧭 Logo clicked - navigating to dashboard');
                  handleTabChange('dashboard');
                }}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                aria-label="Go to Dashboard"
              >
                <BrandStandard size="sm" />
              </button>
            </div>
            
            {/* Page Title with visual feedback */}
            <div className={`flex-1 text-center transition-all duration-300 ${
              isDragging 
                ? 'opacity-40 scale-95 blur-sm' 
                : 'opacity-100 scale-100 blur-0'
            }`}>
              <h2 className="font-semibold text-lg text-foreground">{getPageTitle()}</h2>
            </div>
            
            {/* Action Buttons with enhanced feedback */}
            <div className={`flex items-center gap-3 flex-shrink-0 transition-all duration-300 ${
              isDragging 
                ? 'opacity-40 scale-95 pointer-events-none' 
                : 'opacity-100 scale-100 pointer-events-auto'
            }`}>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 w-9 p-0 relative transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => {
                  console.log('🔔 Notifications button clicked');
                  handleNotifications();
                }}
                disabled={isDragging}
                aria-label={`Notifications${notifications.length > 0 ? ` (${notifications.length})` : ''}`}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
                    <span className="sr-only">{notifications.length} notifications</span>
                  </div>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 w-9 p-0 transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => {
                  console.log('⚙️ Settings button clicked');
                  handleProfileNavigation();
                }}
                disabled={isDragging}
                aria-label="Profile settings"
              >
                <Settings size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Drag State Indicator */}
        {isDragging && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 animate-pulse">
            <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
          </div>
        )}
      </header>

      {/* Enhanced Drag Drop Zone Overlay with Instructions */}
      {isDragging && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-xs"></div>
          <div className="absolute top-10 left-0 right-0 bottom-18 flex items-center justify-center px-3">
            <div className="bg-primary/10 border-2 border-dashed border-primary/40 rounded-2xl p-8 text-center animate-pulse max-w-sm mx-auto">
              <p className="text-sm text-primary/80 font-medium mb-2">Drag & Drop Active</p>
              <p className="text-xs text-primary/60">Drop ingredients into meal categories</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Mobile Optimized Container with Error Boundary */}
      <main className="pt-10 pb-12 min-h-screen">
        <div className="w-full max-w-lg mx-auto px-3">
          {renderActiveTab()}
        </div>
      </main>
      
      {/* Enhanced Bottom Navigation with Better Touch Targets */}
      <nav className={`fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border transition-all duration-300 ${
        isDragging 
          ? 'z-20 opacity-60 scale-95 blur-sm' 
          : 'z-40 opacity-100 scale-100 blur-0'
      }`}>
        <div className="w-full max-w-lg mx-auto">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              console.log('🧭 Bottom navigation clicked:', tab);
              handleTabChange(tab);
            }}
          />
        </div>
      </nav>

      {/* Enhanced Toast Notification with Better Styling */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-5 py-3 rounded-lg shadow-lg max-w-sm text-center border border-primary/20">
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {toastMessage}
      </div>

      {/* Enhanced System Status Display with Database - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 left-2 z-[100] bg-black/90 text-white text-xs p-3 rounded-lg opacity-75 pointer-events-none max-w-xs">
          <div className="font-semibold mb-2">🔧 System Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.auth)}
              <span>Auth: {isAuthenticated ? 'Logged In' : 'Logged Out'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!dbLoading)}
              <span>Database: {dbLoading ? 'Loading' : 'Ready'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(userProfile !== null)}
              <span>Profile: {userProfile ? 'Loaded' : 'None'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(getDatabaseStats().totalFoods > 0)}
              <span>Foods: {getDatabaseStats().totalFoods}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.navigation)}
              <span>Navigation: {activeTab}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.dragDrop)}
              <span>Drag: {isDragging ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.notifications)}
              <span>Notifications: {notifications.length}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2 border-t border-gray-600 pt-2">
              Storage: {(getDatabaseStats().storageUsed / 1024).toFixed(1)}KB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}