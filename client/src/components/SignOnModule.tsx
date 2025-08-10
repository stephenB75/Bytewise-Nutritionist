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
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface SignOnModuleProps {
  onClose?: () => void;
}

export function SignOnModule({ onClose }: SignOnModuleProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { toast } = useToast();
  const { supabase, refetch } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const response = await apiRequest('POST', endpoint, { email, password });

      const data = await response.json();

      if (response.ok) {
        if (isSignUp) {
          toast({
            title: "Account created successfully!",
            description: "We've sent a verification email to your inbox. Please verify your email before signing in.",
          });
          // Show verification message UI
          setShowVerificationMessage(true);
          setIsSignUp(false);
          setPassword(''); // Clear password for security
        } else {
          // Set the Supabase session with the returned data
          if (data.session) {
            try {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              });
              
              if (!sessionError) {
                // Refetch auth state immediately
                await refetch();
              }
            } catch (err) {
              // Handle session errors silently
            }
          }
          
          toast({
            title: "Welcome back!",
            description: "You've been signed in successfully.",
          });
          
          // Close the sign-in module or refresh
          if (onClose) {
            onClose();
          } else {
            // Force a page reload as fallback
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } else {
        if (data.message === "Email not confirmed" || data.requiresVerification) {
          toast({
            title: "Email verification required",
            description: "Please verify your email before signing in. Check your inbox for the verification link.",
            variant: "destructive",
          });
          setShowVerificationMessage(true);
        } else {
          toast({
            title: "Authentication failed",
            description: data.message || "Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
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
      const response = await apiRequest('POST', '/api/auth/confirm-email', { email });

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

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setResendingVerification(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/resend-verification', { email });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification email sent!",
          description: "Please check your inbox for the verification link.",
        });
      } else {
        toast({
          title: "Failed to resend",
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
      setResendingVerification(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/reset-password', { email });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password reset email sent!",
          description: "Check your email for instructions to reset your password.",
        });
        setIsResetPassword(false);
        setEmail('');
      } else {
        toast({
          title: "Reset failed",
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
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const handleGitHubSignIn = () => {
    window.location.href = '/api/auth/github';
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
            {isResetPassword ? 'Reset Password' : isSignUp ? 'Join bytewise nutritionist' : 'Welcome Back'}
          </h2>
          <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {isResetPassword ? 'Enter your email to reset your password' : isSignUp ? 'Start your nutrition tracking journey today' : 'Access your nutrition tracking and progress'}
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
          <form onSubmit={isResetPassword ? handlePasswordReset : handleEmailAuth} className="space-y-4">
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
              
              {!isResetPassword && (
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                      required
                    />
                  </div>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(true);
                        setIsSignUp(false);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-sm font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isResetPassword ? 'Sending Reset Email...' : isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <>
                  {isResetPassword ? <Mail className="w-5 h-5 mr-2" /> : isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                  {isResetPassword ? 'Send Reset Email' : isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          {/* Email Verification Message */}
          {showVerificationMessage && !isResetPassword && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-200 font-medium">
                    Email verification required
                  </p>
                  <p className="text-xs text-gray-400">
                    We've sent a verification link to <strong className="text-gray-300">{email}</strong>. 
                    Please check your inbox and click the link to verify your account.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="text-xs border-blue-400/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
                    >
                      {resendingVerification ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          Resend verification email
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVerificationMessage(false)}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OAuth Providers - Hide in reset password mode */}
          {!isResetPassword && (
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
                  className="flex items-center justify-center py-2 px-4 border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGitHubSignIn}
                  className="flex items-center justify-center py-2 px-4 border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
          )}

          {/* Toggle Sign In / Sign Up / Reset Password */}
          <div className="text-center space-y-2">
            {isResetPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(false);
                  setIsSignUp(false);
                }}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsResetPassword(false);
                }}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
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