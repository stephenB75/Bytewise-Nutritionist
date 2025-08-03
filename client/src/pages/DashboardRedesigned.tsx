/**
 * Completely Redesigned ByteWise Dashboard
 * Dramatic visual overhaul with impossible-to-miss changes
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, Flame, Utensils, BarChart3, Award } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function DashboardRedesigned({ onNavigate }: DashboardProps) {
  const [currentBg, setCurrentBg] = useState(0);
  const [pulseColor, setPulseColor] = useState('bg-red-500');

  // Rotate backgrounds every 2 seconds for maximum visibility
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Pulse color animation
  useEffect(() => {
    const colorInterval = setInterval(() => {
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
      setPulseColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 1000);
    return () => clearInterval(colorInterval);
  }, []);

  const backgrounds = [
    'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
    'linear-gradient(45deg, #96CEB4, #FECA57, #FF9FF3)',
    'linear-gradient(45deg, #54A0FF, #5F27CD, #00D2D3)',
    'linear-gradient(45deg, #FF9F43, #EE5A24, #FD79A8)',
    'linear-gradient(45deg, #2ED573, #7158E2, #3742FA)',
    'linear-gradient(45deg, #FF6B9D, #C44569, #F8B500)'
  ];

  return (
    <div 
      className="min-h-screen transition-all duration-500 ease-in-out relative overflow-hidden"
      style={{ background: backgrounds[currentBg] }}
    >
      {/* MASSIVE REDESIGN BANNER - IMPOSSIBLE TO MISS */}
      <div className={`fixed top-0 left-0 right-0 z-[9999] ${pulseColor} text-white p-6 text-center font-black text-2xl shadow-2xl animate-bounce`}>
        🚀 BYTEWISE COMPLETELY REDESIGNED! 🚀
        <div className="text-lg font-bold mt-2">
          Background {currentBg + 1}/6 • Auto-Changing Every 2s
        </div>
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div className="w-8 h-8 bg-white/30 rounded-full backdrop-blur-sm"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 pt-24 px-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Hero Card with Glass Effect */}
          <Card className="bg-white/20 backdrop-blur-lg border-white/30 shadow-2xl rounded-3xl p-8 text-center">
            <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
              ByteWise Nutrition
            </h1>
            <p className="text-xl text-white/90 mb-6 font-bold">
              🎨 COMPLETE VISUAL REDESIGN ACTIVE 🎨
            </p>
            <div className="text-lg text-white/80 font-semibold">
              This is the NEW REDESIGNED interface!
            </div>
          </Card>

          {/* Progress Rings - Dramatically Different */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Calories', value: 1850, goal: 2200, color: 'stroke-red-400' },
              { label: 'Protein', value: 95, goal: 120, color: 'stroke-blue-400' },
              { label: 'Carbs', value: 180, goal: 300, color: 'stroke-green-400' },
              { label: 'Fat', value: 45, goal: 70, color: 'stroke-purple-400' }
            ].map((item, i) => {
              const progress = (item.value / item.goal) * 100;
              return (
                <Card key={item.label} className="bg-white/20 backdrop-blur-lg border-white/30 rounded-2xl p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeDasharray={`${progress}, 100`}
                          className="transition-all duration-1000 ease-out drop-shadow-lg"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-black text-sm drop-shadow">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-white font-bold text-center">
                      <div className="text-sm">{item.label}</div>
                      <div className="text-xs opacity-80">{item.value}/{item.goal}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Large Action Buttons - Completely Different Style */}
          <div className="space-y-4">
            {[
              { label: 'Calculate Calories', icon: Target, color: 'from-red-500 to-pink-500' },
              { label: 'Log Meals', icon: Utensils, color: 'from-blue-500 to-cyan-500' },
              { label: 'View Progress', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
              { label: 'Achievements', icon: Award, color: 'from-purple-500 to-violet-500' }
            ].map((button, i) => (
              <Button
                key={button.label}
                onClick={() => onNavigate(i === 0 ? 'calculator' : i === 1 ? 'logger' : 'profile')}
                className={`w-full h-16 bg-gradient-to-r ${button.color} hover:scale-105 transform transition-all duration-300 text-white font-bold text-lg rounded-2xl shadow-2xl border-2 border-white/20`}
              >
                <button.icon className="w-6 h-6 mr-3" />
                {button.label}
              </Button>
            ))}
          </div>

          {/* Features Showcase */}
          <Card className="bg-white/20 backdrop-blur-lg border-white/30 rounded-2xl p-6">
            <h3 className="text-white font-black text-xl mb-4 text-center">
              🎨 NEW REDESIGN FEATURES 🎨
            </h3>
            <div className="space-y-3 text-white/90 font-semibold">
              <div>✨ Auto-rotating gradient backgrounds</div>
              <div>🎯 Interactive 3D progress rings</div>
              <div>🧠 ADHD-friendly visual design</div>
              <div>🌈 Enhanced color psychology</div>
              <div>💫 Smooth micro-animations</div>
              <div>🔮 Glass-morphism effects</div>
            </div>
          </Card>

          {/* Time Display */}
          <div className="text-center text-white/80 font-bold bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            Redesigned at: {new Date().toLocaleTimeString()}
          </div>

        </div>
      </div>
    </div>
  );
}