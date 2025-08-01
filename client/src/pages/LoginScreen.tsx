/**
 * Simple Login Screen Component
 * 
 * Clean authentication interface with food background image
 * Features simple sign-in popup with Supabase authentication
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { NewLogoBrand } from '@/components/NewLogoBrand';
import dishImage from '@assets/food-3262796_1920_1753859530086.jpg';

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
      {/* Food Background Image - Beautiful dish background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${dishImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px) brightness(0.6)'
        }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 z-5 bg-black/20" />
      


      {/* Login Popup */}
      <div className="relative z-30 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Logo - Increased size by 45% */}
          <div className="text-center mb-8">
            <NewLogoBrand size="xl" className="drop-shadow-lg" />
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
              Secure authentication powered by Supabase
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default LoginScreen;