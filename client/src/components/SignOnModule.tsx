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
  const { toast } = useToast();
  const { supabase, refetch } = useAuth();

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
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate password for sign-up
    if (isSignUp && passwordErrors.length > 0) {
      toast({
        title: "Password Requirements Not Met",
        description: `Password needs: ${passwordErrors.join(', ')}`,
        variant: "destructive",
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
          toast({
            title: isSignUp ? "Account created!" : "Email verification required",
            description: data.message || "Please check your email to verify your account before signing in.",
          });
          if (isSignUp) {
            // Switch to sign-in mode after successful signup
            setIsSignUp(false);
            setPassword(''); // Clear password for security
          }
        } else if (data.session) {
          // Successfully signed in with verified email
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            
            if (sessionError) {
              throw sessionError;
            }
            
            // Refetch auth state and wait for completion
            await refetch();
            
            // Additional delay to ensure state propagation
            await new Promise(resolve => setTimeout(resolve, 200));
            
            toast({
              title: "Welcome back!",
              description: "You've been signed in successfully.",
            });
            
            // Close the sign-in module
            if (onClose) {
              onClose();
            }
            
          } catch (err) {
            // Fallback to page reload if session setting fails
            toast({
              title: "Signing in...",
              description: "Refreshing page to complete sign-in.",
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } else {
        if (data.requiresVerification || data.message === "Email not confirmed") {
          toast({
            title: "Email not confirmed",
            description: data.message || "Please check your email and click the confirmation link.",
            variant: "destructive",
          });
        } else {
          let errorMessage = data.message || "Please try again.";
          if (errorMessage.includes("Password should contain")) {
            errorMessage = "Password must include: uppercase letter, lowercase letter, number, and special character (!@#$%^&* etc.)";
          }
          toast({
            title: "Authentication failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setConfirmingEmail(true);
    
    try {
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email confirmed!",
          description: "You can now sign in with your credentials.",
        });
      } else {
        toast({
          title: "Confirmation failed",
          description: data.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirmingEmail(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      toast({
        title: "Redirecting to Google",
        description: "You'll be redirected to Google to complete sign-in.",
      });
    } catch (error: any) {
      setLoading(false);
      let errorMessage = error.message;
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to Google authentication. Please try again.';
      } else if (error.message.includes('oauth')) {
        errorMessage = 'Google authentication is not properly configured. Please contact support.';
      }
      
      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGitHubSignIn = async () => {
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
      toast({
        title: "Redirecting to GitHub",
        description: "You'll be redirected to GitHub to complete sign-in.",
      });
    } catch (error: any) {
      setLoading(false);
      let errorMessage = error.message;
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to GitHub authentication. Please try again.';
      } else if (error.message.includes('oauth')) {
        errorMessage = 'GitHub authentication is not properly configured. Please contact support.';
      }
      
      toast({
        title: "GitHub Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
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
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link. It may take a few minutes to arrive.",
      });
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Unable to send password reset email. Please try again.",
        variant: "destructive",
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
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            {isSignUp ? 'Join bytewise nutritionist' : 'Welcome Back'}
          </h2>
          <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {isSignUp ? 'Start your nutrition tracking journey today' : 'Access your nutrition tracking and progress'}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
        <div className="space-y-6">
          {/* Benefits */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Your <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Nutrition</span> Journey Awaits
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Track Your Progress</div>
                <div className="text-xs text-gray-300">Monitor daily goals and achievements</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Secure Data Sync</div>
                <div className="text-xs text-gray-300">Your data stays safe across devices</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Personal Profile</div>
                <div className="text-xs text-gray-300">Customize goals and preferences</div>
              </div>
            </div>
          </div>

          {/* Email Authentication Form */}
          <form 
            onSubmit={handleEmailAuth} 
            className="space-y-4"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                    {isSignUp && (
                      <span className="text-xs text-gray-400 ml-2">
                        (Must include: A-Z, a-z, 0-9, special chars)
                      </span>
                    )}
                  </Label>
                  {!isSignUp && !showResetPassword && (
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
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
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
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

            {showResetPassword ? (
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



          {/* OAuth Providers */}
          <div className="space-y-3">
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
                onClick={handleGoogleSignIn}
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
                onClick={handleGitHubSignIn}
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

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
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
    </div>
  );
}