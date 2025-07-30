/**
 * Simple Login Screen Component
 * 
 * Clean authentication interface with food background image
 * Features simple sign-in popup with Replit OIDC integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { LogoBrand } from '@/components/LogoBrand';

interface LoginScreenProps {
  onNavigate: (page: string) => void;
}

function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Redirect to Replit OIDC login
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Food Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='food-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23f0f9ff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='8'/%3E%3Crect x='60' y='10' width='15' height='20' rx='3'/%3E%3Cellipse cx='30' cy='70' rx='12' ry='8'/%3E%3Cpath d='M70 60 Q80 50 90 60 Q80 70 70 60' fill='%23dcfce7'/%3E%3Ccircle cx='15' cy='85' r='6'/%3E%3Crect x='75' y='25' width='10' height='15' rx='2'/%3E%3Cellipse cx='45' cy='45' rx='8' ry='12'/%3E%3Cpath d='M85 80 Q95 70 100 80 Q95 90 85 80' fill='%23fef3c7'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23food-pattern)'/%3E%3C/svg%3E")`,
          backgroundColor: '#f8fafc'
        }}
      />
      
      {/* Food Elements Overlay */}
      <div className="absolute inset-0 z-10">
        {/* Floating food icons */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-green-100/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <span className="text-2xl">🥗</span>
        </div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-orange-100/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <span className="text-xl">🍎</span>
        </div>
        <div className="absolute bottom-32 left-20 w-14 h-14 bg-yellow-100/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
          <span className="text-xl">🥑</span>
        </div>
        <div className="absolute bottom-20 right-12 w-18 h-18 bg-red-100/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>
          <span className="text-2xl">🍅</span>
        </div>
        <div className="absolute top-1/2 left-6 w-12 h-12 bg-purple-100/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.8s' }}>
          <span className="text-xl">🫐</span>
        </div>
        <div className="absolute top-1/3 right-8 w-16 h-16 bg-pink-100/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}>
          <span className="text-2xl">🥕</span>
        </div>
      </div>

      {/* Login Popup */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <LogoBrand size="lg" />
          </div>

          {/* Login Card - Simple Popup */}
          <Card className="p-8 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Bytewise
              </h1>
              <p className="text-gray-600">
                Your personal nutrition companion
              </p>
            </div>

            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In to Continue
                </div>
              )}
            </Button>

            {/* Simple footer */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Secure authentication powered by Replit
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default LoginScreen;