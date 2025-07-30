/**
 * Login Screen Component
 * 
 * Provides authentication interface with Replit OIDC integration
 * Features brand-compliant design and mobile optimization
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  Smartphone, 
  Shield, 
  TrendingUp,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (page: string) => void;
}

function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Redirect to Replit authentication
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Track Nutrition",
      description: "Monitor calories, macros, and micronutrients with USDA-verified data",
      color: "text-blue-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Native app experience with offline capabilities and PWA support",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with enterprise-grade security",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Personalized Insights",
      description: "AI-powered recommendations based on your unique nutrition patterns",
      color: "text-orange-600"
    }
  ];

  const benefits = [
    "300,000+ USDA verified foods",
    "Offline nutrition tracking",
    "Personalized meal suggestions",
    "Achievement tracking system",
    "Detailed nutrition analytics",
    "Smart habit analysis"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="bytewise-logo bytewise-logo-md text-center">
            <div className="bytewise-logo-main">bytewise</div>
            <div className="bytewise-logo-tagline">Nutritionist</div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Bytewise
          </h1>
          <p className="text-gray-600">
            Your intelligent nutrition companion for healthier living
          </p>
          <Badge variant="secondary" className="mt-2">
            Professional Grade Nutrition Tracking
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sign In to Continue
            </h2>
            <p className="text-sm text-gray-600">
              Secure authentication powered by Replit
            </p>
          </div>

          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In with Replit
              </div>
            )}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Card>

        {/* Features Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 text-center">
            Why Choose Bytewise?
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <IconComponent className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits List */}
        <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-md">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Premium Features Included
          </h4>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Trusted by nutrition professionals worldwide
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;