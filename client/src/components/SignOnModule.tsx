/**
 * User Sign-On Module
 * Authentication component for the profile page
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LogIn, 
  User, 
  Shield, 
  Github, 
  Chrome,
  Zap,
  Mail,
  Lock,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AuthPopupNotification, useAuthPopupNotification } from './AuthPopupNotification';

interface SignOnModuleProps {
  onClose?: () => void;
}

export function SignOnModule({ onClose }: SignOnModuleProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { toast } = useToast();
  const { supabase, refetch } = useAuth();
  const { notification, showNotification, closeNotification } = useAuthPopupNotification();

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character');
    }
    return errors;
  };

  // Update password validation on change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (isSignUp) {
      setPasswordErrors(validatePassword(value));
    } else {
      setPasswordErrors([]);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showNotification({
        type: 'error',
        title: "Missing Information",
        description: "Please enter both email and password.",
        duration: 5000
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification({
        type: 'error',
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        duration: 5000
      });
      return;
    }

    // Validate password for sign-up
    if (isSignUp && passwordErrors.length > 0) {
      showNotification({
        type: 'error',
        title: "Password Requirements Not Met",
        description: `Password needs: ${passwordErrors.join(', ')}`,
        duration: 6000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      


      if (response.ok) {
        // Check if email verification is required
        if (data.requiresVerification) {
          setVerificationRequired(true);
          setVerificationEmail(data.email || email);
          setConfirmingEmail(false);
          
          showNotification({
            type: 'info',
            title: isSignUp ? "Account Created!" : "Email Verification Required",
            description: data.message || "Please check your email and click the verification link to activate your account.",
            duration: 10000
          });
          if (isSignUp) {
            // Switch to sign-in mode after successful signup
            setIsSignUp(false);
            setPassword(''); // Clear password for security
          }
        } else if (data.session) {
          // Successfully signed in with verified email
          
          try {
            // Always use proper Supabase session setting (no more custom tokens)
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            
            if (sessionError) {
              console.error('❌ Session setting error:', sessionError);
              throw sessionError;
            }
            
            console.log('✅ Supabase session set successfully');
            
            // Verify session was set by checking current session
            const { data: currentSession } = await supabase.auth.getSession();
            
            console.log('🔄 Refreshing auth state...');
            
            // Force refresh the auth state
            await refetch();
            
            // Trigger custom event for auth state change
            window.dispatchEvent(new CustomEvent('auth-state-change'));
            
            // Wait for state propagation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showNotification({
              type: 'success',
              title: "Welcome back!",
              description: "You've been signed in successfully.",
              duration: 4000
            });
            
            console.log('🚪 Closing modal after successful sign-in');
            
            // Close modal after successful authentication
            if (onClose) {
              console.log('🚪 Closing authentication modal');
              onClose();
            } else {
              console.log('⚠️ No onClose function provided');
            }
            
          } catch (err) {
            console.log('❌ Session setting failed, using page reload fallback:', err);
            // Fallback to page reload if session setting fails
            showNotification({
              type: 'info',
              title: "Signing in...",
              description: "Refreshing page to complete sign-in.",
              duration: 3000
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } else {
        // Handle different types of authentication errors with specific prompts
        console.log('🚨 ENTERING ERROR HANDLING BRANCH');
        const errorCode = data.code;
        const errorMessage = data.message || "Please try again.";
        
        console.log('🔍 Handling authentication error:', { errorCode, errorMessage, isSignUp });
        console.log('🔍 Full error response data:', data);
        
        if (data.requiresVerification || errorCode === 'EMAIL_NOT_VERIFIED') {
          // Email verification required
          setVerificationRequired(true);
          setVerificationEmail(data.email || email);
          showNotification({
            type: 'warning',
            title: "Email Verification Required",
            description: errorMessage,
            duration: 12000
          });
        } else if (errorCode === 'ACCOUNT_NOT_FOUND') {
          // No account found - suggest signing up
          console.log('🔥 Showing ACCOUNT_NOT_FOUND popup notification');
          showNotification({
            type: 'warning',
            title: "Account Not Found",
            description: errorMessage + " Would you like to create a new account?",
            duration: 10000,
            actionText: "Create Account",
            onAction: () => {
              setIsSignUp(true);
              setPassword('');
              setPasswordErrors([]);
            }
          });
          // Auto-switch to sign-up mode for user convenience
          console.log('🔄 Will switch to sign-up mode in 2 seconds');
          setTimeout(() => {
            console.log('🔄 Switching to sign-up mode now');
            setIsSignUp(true);
            setPassword('');
            setPasswordErrors([]);
          }, 3000);
        } else if (errorCode === 'INVALID_CREDENTIALS') {
          // Wrong password or credentials
          console.log('🚨 Showing INVALID_CREDENTIALS popup notification');
          showNotification({
            type: 'error',
            title: "Incorrect Credentials",
            description: errorMessage + " You can reset your password if needed.",
            duration: 8000,
            actionText: "Reset Password",
            onAction: () => {
              setShowResetPassword(true);
            }
          });
        } else if (errorCode === 'SERVICE_ERROR') {
          // Service temporarily unavailable
          showNotification({
            type: 'error',
            title: "Service Unavailable",
            description: errorMessage,
            duration: 6000
          });
        } else {
          // Handle password validation errors and general errors
          let displayMessage = errorMessage;
          if (displayMessage.includes("Password should contain")) {
            displayMessage = "Password must include: uppercase letter, lowercase letter, number, and special character (!@#$%^&* etc.)";
          }
          
          showNotification({
            type: 'error',
            title: "Authentication Failed",
            description: displayMessage,
            duration: 6000
          });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showNotification({
        type: 'error',
        title: "Error",
        description: "Something went wrong. Please try again.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) {
      showNotification({
        type: 'error',
        title: "No email address",
        description: "Please try signing up again.",
        duration: 5000
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/verify-email`
        }
      });

      if (error) {
        throw error;
      }

      showNotification({
        type: 'success',
        title: "Verification Email Sent",
        description: "A new verification email has been sent. Please check your inbox and click the link.",
        duration: 8000
      });
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: "Failed to Resend",
        description: error.message || "Unable to resend verification email. Please try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return; // Prevent double clicks
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // OAuth will redirect automatically, so we don't need to do anything else here
      showNotification({
        type: 'info',
        title: "Redirecting to Google",
        description: "You'll be redirected to Google to complete sign-in.",
        duration: 3000
      });
    } catch (error: any) {
      setLoading(false);
      let errorMessage = error.message;
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to Google authentication. Please try again.';
      } else if (error.message.includes('oauth')) {
        errorMessage = 'Google authentication is not properly configured. Please contact support.';
      }
      
      showNotification({
        type: 'error',
        title: "Google Sign-In Failed",
        description: errorMessage,
        duration: 6000
      });
    }
  };

  const handleGitHubSignIn = async () => {
    if (loading) return; // Prevent double clicks
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        throw error;
      }

      // OAuth will redirect automatically, so we don't need to do anything else here
      showNotification({
        type: 'info',
        title: "Redirecting to GitHub",
        description: "You'll be redirected to GitHub to complete sign-in.",
        duration: 3000
      });
    } catch (error: any) {
      setLoading(false);
      let errorMessage = error.message;
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to GitHub authentication. Please try again.';
      } else if (error.message.includes('oauth')) {
        errorMessage = 'GitHub authentication is not properly configured. Please contact support.';
      }
      
      showNotification({
        type: 'error',
        title: "GitHub Sign-In Failed",
        description: errorMessage,
        duration: 6000
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification({
        type: 'error',
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        duration: 5000
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      showNotification({
        type: 'success',
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link. It may take a few minutes to arrive.",
        duration: 8000
      });
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: "Password Reset Failed",
        description: error.message || "Unable to send password reset email. Please try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 inline-block">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-950 mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            {isSignUp ? 'Join bytewise nutritionist' : 'Welcome Back'}
          </h2>
          <p className="text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {isSignUp ? 'Start your nutrition tracking journey today' : 'Access your nutrition tracking and progress'}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-8">
        <div className="space-y-6">
          {/* Benefits */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-950 mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Your <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Nutrition</span> Journey Awaits
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-amber-100/50 rounded-xl border border-amber-200/40">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-950 text-sm">Track Your Progress</div>
                <div className="text-xs text-gray-900">Monitor daily goals and achievements</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-amber-100/50 rounded-xl border border-amber-200/40">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-950 text-sm">Secure Data Sync</div>
                <div className="text-xs text-gray-900">Your data stays safe across devices</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-amber-100/50 rounded-xl border border-amber-200/40">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-950 text-sm">Personal Profile</div>
                <div className="text-xs text-gray-900">Customize goals and preferences</div>
              </div>
            </div>
          </div>

          {/* Email Authentication Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEmailAuth(e);
            }}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-950">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 bg-white/60 border-amber-300/60 text-gray-950 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-950">
                    Password
                    {isSignUp && (
                      <span className="text-xs text-gray-400 ml-2">
                        (Must include: A-Z, a-z, 0-9, special chars)
                      </span>
                    )}
                  </Label>
                  {!isSignUp && !showResetPassword && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowResetPassword(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline cursor-pointer"
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 bg-white/60 border-amber-300/60 text-gray-950 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    required={!showResetPassword}
                  />
                </div>
                {/* Password requirements indicator */}
                {isSignUp && password && (
                  <div className="mt-2 text-xs">
                    {passwordErrors.length > 0 ? (
                      <div className="text-red-400">
                        <div className="font-medium">Password needs:</div>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-green-400 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Password meets all requirements
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {verificationRequired ? (
              <div className="space-y-4">
                {/* Email Verification Required Message */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-1">Email Verification Required</div>
                      <div className="text-xs text-gray-300 mb-3">
                        We sent a verification link to <span className="text-white font-medium">{verificationEmail}</span>.
                        Please check your inbox (including spam folder) and click the link to activate your account.
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mr-2" />
                              Resending...
                            </div>
                          ) : (
                            'Resend Verification Email'
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setVerificationRequired(false);
                            setVerificationEmail('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : showResetPassword ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading || resetEmailSent}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-sm font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending Reset Email...
                    </div>
                  ) : resetEmailSent ? (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Reset Email Sent - Check Your Inbox
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Password Reset Email
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="w-full text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-sm font-semibold"
                data-testid="button-submit"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </Button>
            )}
          </form>

          {/* OAuth Providers - Hidden on iOS for App Store compliance */}
          {/* Apple requires Sign in with Apple when other social logins are present */}
          {typeof window !== 'undefined' && !window.location.href.includes('capacitor://') && (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white/10 text-gray-300">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGoogleSignIn();
                }}
                disabled={loading}
                className="flex items-center justify-center py-2 px-4 border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-google-signin"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300/30 border-t-gray-300 rounded-full animate-spin mr-2" />
                ) : (
                  <Chrome className="w-4 h-4 mr-2" />
                )}
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGitHubSignIn();
                }}
                disabled={loading}
                className="flex items-center justify-center py-2 px-4 border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-github-signin"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300/30 border-t-gray-300 rounded-full animate-spin mr-2" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                GitHub
              </Button>
            </div>
          </div>
          )}

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsSignUp(!isSignUp);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 underline-offset-4 hover:underline cursor-pointer"
              data-testid="link-toggle-signup"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </a>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-xs text-gray-300">
                <div className="font-medium mb-1 text-white">Privacy Protected</div>
                <div>Your nutrition data is encrypted and private. We never share your personal information.</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Authentication Popup Notification */}
      <AuthPopupNotification 
        notification={notification} 
        onClose={closeNotification}
      />
    </div>
  );
}