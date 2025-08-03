/**
 * Clean Food App Layout - Fixed React hooks implementation
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CalorieCalculator from '@/components/CalorieCalculator';

interface CleanFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function CleanFoodLayout({ onNavigate }: CleanFoodLayoutProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-2">
          {['home', 'nutrition', 'daily', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === tab 
                  ? 'text-[#faed39] bg-[#faed39]/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-xs mt-1 capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="pb-20">
        {activeTab === 'home' && (
          <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="h-screen relative flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
              <div className="text-center z-10 px-6">
                <div className="mb-8">
                  <div className="text-[3.825rem] font-bold leading-none tracking-tight text-white">
                    Byte<span className="text-[#faed39]">Wise</span>
                  </div>
                  <div className="text-[1.0625rem] text-gray-300 mt-2">
                    Smart Nutrition Tracking
                  </div>
                </div>
                <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
                  Track your nutrition with precision using our advanced calorie calculator and USDA food database.
                </p>
              </div>
            </div>

            {/* Calorie Calculator Section */}
            <div className="px-6 py-12">
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Calorie Calculator</h2>
                  <CalorieCalculator />
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="p-6 pt-12">
            <h1 className="text-2xl font-bold mb-6">Nutrition Overview</h1>
            <p className="text-gray-300">Nutrition tracking features will be added here.</p>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="p-6 pt-12">
            <h1 className="text-2xl font-bold mb-6">Daily Tracking</h1>
            <p className="text-gray-300">Daily food logging will be implemented here.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 pt-12">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <p className="text-gray-300">User profile and settings will be available here.</p>
          </div>
        )}
      </main>
    </div>
  );
}