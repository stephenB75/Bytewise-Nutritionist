/**
 * User Sign-On Module
 * Authentication component for the profile page
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  User, 
  Shield, 
  Github, 
  Chrome,
  Zap
} from 'lucide-react';

interface SignOnModuleProps {
  onClose?: () => void;
}

export function SignOnModule({ onClose }: SignOnModuleProps) {
  const handleSignIn = () => {
    // Redirect to Replit Auth login endpoint
    window.location.href = '/api/login';
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
          Sign In to ByteWise
        </h2>
        <p className="text-center text-white/90 text-sm">
          Access your nutrition tracking, recipes, and progress
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

        {/* Sign In Button */}
        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-gradient-to-r from-[#1f4aa6] to-[#45c73e] hover:from-[#1f4aa6]/80 hover:to-[#45c73e]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-3 text-base font-semibold"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In with Replit
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Github className="w-4 h-4" />
            <span>•</span>
            <Chrome className="w-4 h-4" />
            <span>Supports GitHub, Google, and more</span>
          </div>
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