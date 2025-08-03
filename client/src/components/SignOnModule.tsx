/**
 * User Sign-On Module
 * Authentication component for the profile page
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface SignOnModuleProps {
  onClose?: () => void;
}

export function SignOnModule({ onClose }: SignOnModuleProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (response.ok) {
        toast({
          title: isSignUp ? "Account created!" : "Welcome back!",
          description: isSignUp ? "Please check your email to verify your account." : "You've been signed in successfully.",
        });
        window.location.reload(); // Refresh to update auth state
      } else {
        const error = await response.json();
        toast({
          title: "Authentication failed",
          description: error.message || "Please try again.",
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
    <Card className="w-full bg-white/90 backdrop-blur-md border-0 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#1f4aa6] to-[#45c73e] text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-white/20 rounded-full">
            <User className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
          {isSignUp ? 'Join ByteWise' : 'Sign In to ByteWise'}
        </h2>
        <p className="text-center text-white/90 text-sm">
          {isSignUp ? 'Start your nutrition tracking journey' : 'Access your nutrition tracking, recipes, and progress'}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Benefits */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-center">Your Nutrition Journey Awaits</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-[#faed39]/10 rounded-lg">
              <div className="p-2 bg-[#faed39]/20 rounded-full">
                <Zap className="w-4 h-4 text-[#faed39]" />
              </div>
              <div>
                <div className="font-medium text-sm">Track Your Progress</div>
                <div className="text-xs text-gray-600">Monitor daily goals and achievements</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-[#1f4aa6]/10 rounded-lg">
              <div className="p-2 bg-[#1f4aa6]/20 rounded-full">
                <Shield className="w-4 h-4 text-[#1f4aa6]" />
              </div>
              <div>
                <div className="font-medium text-sm">Secure Data Sync</div>
                <div className="text-xs text-gray-600">Your data stays safe across devices</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-[#45c73e]/10 rounded-lg">
              <div className="p-2 bg-[#45c73e]/20 rounded-full">
                <User className="w-4 h-4 text-[#45c73e]" />
              </div>
              <div>
                <div className="font-medium text-sm">Personal Profile</div>
                <div className="text-xs text-gray-600">Customize goals and preferences</div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Authentication Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-white border-gray-300 focus:border-[#1f4aa6] focus:ring-[#1f4aa6]"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-white border-gray-300 focus:border-[#1f4aa6] focus:ring-[#1f4aa6]"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1f4aa6] to-[#45c73e] hover:from-[#1f4aa6]/80 hover:to-[#45c73e]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-3 text-base font-semibold"
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
        </form>

        {/* OAuth Providers */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGitHubSignIn}
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-[#1f4aa6] hover:text-[#1f4aa6]/80 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Privacy Protected</div>
              <div>Your nutrition data is encrypted and private. We never share your personal information.</div>
            </div>
          </div>
        </div>

        {/* Guest Mode Option */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">Want to try without signing in?</div>
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
            Limited features available in guest mode
          </Badge>
        </div>
      </div>
    </Card>
  );
}