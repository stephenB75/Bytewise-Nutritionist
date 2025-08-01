/**
 * Login Screen Component
 * Supabase authentication with email/password and OAuth
 * Features email/password and social authentication
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { NewLogoBrand } from '@/components/NewLogoBrand';
import { supabase } from '@/lib/supabase';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';

interface LoginScreenProps {
  onNavigate: (page: string) => void;
}

function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Rotating background system
  const { currentImage, currentTheme, currentAlt, isLoading: imageLoading } = useRotatingBackground();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              first_name: email.split('@')[0], // Use email prefix as initial name
            }
          },
        });
        
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Store email for potential resend functionality
          localStorage.setItem('pending_confirmation_email', email);
          setSuccessMessage(
            `Confirmation email sent to ${email}! Please check your inbox and click the confirmation link to complete your account setup.`
          );
        } else if (data.session) {
          // User is immediately signed in (email confirmation disabled)
          setSuccessMessage('Account created successfully! Welcome to Bytewise!');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        setSuccessMessage(`Password reset link sent to ${email}! Please check your email.`);
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (error: any) {
      // Handle authentication errors gracefully
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link first.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      // Handle OAuth errors gracefully
      
      let errorMessage = error.message;
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to Google authentication. Please try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Production mode - demo login removed for live app

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Join thousands tracking their nutrition';
      case 'forgot': return 'Enter your email to reset your password';
      default: return 'Your personal nutrition companion';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rotating Food Background Image */}
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px) brightness(0.6)'
        }}
        role="img"
        aria-label={currentAlt}
      />
      
      {/* Loading state for background */}
      {imageLoading && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-500 to-blue-600" />
      )}
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 z-5 bg-black/20" />

      {/* Login Popup */}
      <div className="relative z-30 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <NewLogoBrand size="xl" className="drop-shadow-lg" />
          </div>

          {/* Login Card */}
          <Card className="p-8 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {getTitle()}
              </h1>
              <p className="text-gray-600">
                {getSubtitle()}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-2 pr-11 h-11 text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    style={{ 
                      backgroundColor: 'white !important',
                      color: '#1f2937 !important'
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-2 pr-20 h-11 text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                      style={{ 
                        backgroundColor: 'white !important',
                        color: '#1f2937 !important'
                      }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Lock className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending Reset...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-3">
              {mode === 'login' && (
                <>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>

                  <p className="text-sm text-gray-600">
                    Forgot your password?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Reset password
                    </button>
                  </p>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>



                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                </>
              )}

              {mode === 'signup' && (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to sign in
                  </button>
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Secure authentication powered by Supabase
            </p>
            
            {/* Background theme indicator */}
            <div className="text-center mt-2">
              <Badge variant="outline" className="text-xs bg-white/80">
                {currentTheme.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Theme
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;