/**
 * Simple Modern Food Layout - Minimal version without problematic hooks
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoBrand } from '@/components/LogoBrand';

interface SimpleModernLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function SimpleModernLayout({ onNavigate }: SimpleModernLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-600">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 text-white">
          <LogoBrand />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              Sign In
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
              Track Your
              <br />
              <span className="text-yellow-300">Nutrition</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Modern food tracking with real USDA nutrition data. 
              Simplified, beautiful, and effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-white/90 text-lg px-8 py-4"
                onClick={() => onNavigate?.('calculator')}
              >
                Start Tracking
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-4"
                onClick={() => onNavigate?.('logger')}
              >
                View Progress
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Calorie Tracking</h3>
              <p className="text-gray-600">
                Accurate USDA nutrition data with smart calorie calculations
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Progress Analytics</h3>
              <p className="text-gray-600">
                Weekly insights and goal tracking with visual progress
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Goal Achievement</h3>
              <p className="text-gray-600">
                Set and reach your nutrition goals with smart recommendations
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex justify-around py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => onNavigate?.('redesigned')}
          >
            <span className="text-lg">🏠</span>
            <span className="text-xs">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => onNavigate?.('calculator')}
          >
            <span className="text-lg">🔥</span>
            <span className="text-xs">Track</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => onNavigate?.('logger')}
          >
            <span className="text-lg">📊</span>
            <span className="text-xs">Progress</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1"
            onClick={() => onNavigate?.('profile')}
          >
            <span className="text-lg">👤</span>
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}