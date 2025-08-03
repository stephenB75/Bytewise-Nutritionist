/**
 * ByteWise Redesigned Dashboard
 * Following user requirements: rotating food backgrounds, swipe actions, 
 * interactive elements, ADHD-friendly design, workflow system
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  BookOpen, 
  TrendingUp, 
  FileBarChart, 
  ArrowRight,
  ChefHat,
  Apple,
  Beef,
  Coffee,
  Cake
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function DashboardRedesigned({ onNavigate }: DashboardProps) {
  const [currentFoodBg, setCurrentFoodBg] = useState(0);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [adhdMode, setAdhdMode] = useState(true);

  // Rotating food backgrounds every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFoodBg(prev => (prev + 1) % foodBackgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Food-themed backgrounds with clipping paths
  const foodBackgrounds = [
    {
      image: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'%3E%3Cdefs%3E%3CradialGradient id=\'apple\' cx=\'50%25\' cy=\'30%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23ff6b6b\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23ee5a24\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath fill=\'url(%23apple)\' d=\'M500 100c-200 0-300 150-300 350s100 350 300 350 300-150 300-350-100-350-300-350z\'/%3E%3C/svg%3E")',
      name: 'Fresh Apples',
      icon: Apple,
      colors: 'from-red-400 via-orange-400 to-yellow-400'
    },
    {
      image: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'%3E%3Cdefs%3E%3ClinearGradient id=\'protein\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%238b4513\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23d2691e\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill=\'url(%23protein)\' d=\'M200 300h600c50 0 100 50 100 100v200c0 50-50 100-100 100H200c-50 0-100-50-100-100V400c0-50 50-100 100-100z\'/%3E%3C/svg%3E")',
      name: 'Protein Power',
      icon: Beef,
      colors: 'from-amber-600 via-orange-500 to-red-500'
    },
    {
      image: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'%3E%3Cdefs%3E%3CradialGradient id=\'coffee\' cx=\'50%25\' cy=\'40%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%236f4e37\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%233e2723\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse fill=\'url(%23coffee)\' cx=\'500\' cy=\'500\' rx=\'300\' ry=\'400\'/%3E%3C/svg%3E")',
      name: 'Morning Energy',
      icon: Coffee,
      colors: 'from-amber-900 via-amber-700 to-yellow-600'
    },
    {
      image: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'%3E%3Cdefs%3E%3ClinearGradient id=\'greens\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2355a3ff\'/%3E%3Cstop offset=\'50%25\' stop-color=\'%233742fa\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%232f1b69\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill=\'url(%23greens)\' d=\'M100 400c0-150 150-300 400-300s400 150 400 300c0 200-150 400-400 400s-400-200-400-400z\'/%3E%3C/svg%3E")',
      name: 'Ocean Nutrition',
      icon: ChefHat,
      colors: 'from-blue-500 via-purple-500 to-indigo-600'
    },
    {
      image: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'%3E%3Cdefs%3E%3CradialGradient id=\'sweet\' cx=\'50%25\' cy=\'30%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23ff9ff3\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23f368e0\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle fill=\'url(%23sweet)\' cx=\'500\' cy=\'500\' r=\'350\'/%3E%3C/svg%3E")',
      name: 'Sweet Balance',
      icon: Cake,
      colors: 'from-pink-400 via-purple-400 to-indigo-400'
    }
  ];

  // Workflow steps - Calculate → Log → Track → View → Export
  const workflowSteps = [
    { id: 'calculate', label: 'Calculate', icon: Calculator, page: 'calculator' },
    { id: 'log', label: 'Log', icon: BookOpen, page: 'logger' },
    { id: 'track', label: 'Track', icon: TrendingUp, page: 'dashboard' },
    { id: 'view', label: 'View', icon: TrendingUp, page: 'dashboard' },
    { id: 'export', label: 'Export', icon: FileBarChart, page: 'profile' }
  ];

  const currentBg = foodBackgrounds[currentFoodBg];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rotating Food Background with Clipping Path */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentBg.colors} transition-all duration-1000 ease-in-out`}
        style={{
          backgroundImage: currentBg.image,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: adhdMode ? 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' : 'none'
        }}
      >
        {/* Food pattern overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ADHD-Friendly Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Focus Mode</span>
          <Switch checked={adhdMode} onCheckedChange={setAdhdMode} />
        </div>
      </div>

      {/* Food Background Indicator */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <currentBg.icon className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium">{currentBg.name}</span>
          <Badge variant="secondary" className="text-xs">
            {currentFoodBg + 1}/5
          </Badge>
        </div>
      </div>

      <div className="relative z-10 pt-20 px-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Workflow Navigation - Easy Flow System */}
          <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl rounded-3xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Your Nutrition Journey
            </h2>
            <div className="flex items-center justify-between">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => {
                      setWorkflowStep(index);
                      onNavigate(step.page);
                    }}
                    className={`
                      flex flex-col items-center p-3 rounded-2xl transition-all duration-300
                      ${adhdMode ? 'min-w-[60px] min-h-[60px]' : 'min-w-[50px] min-h-[50px]'}
                      ${completedSteps.includes(index) 
                        ? 'bg-green-100 text-green-700 shadow-md' 
                        : index === workflowStep 
                          ? 'bg-blue-100 text-blue-700 shadow-lg scale-110' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }
                    `}
                  >
                    <step.icon className={`${adhdMode ? 'w-6 h-6' : 'w-5 h-5'} mb-1`} />
                    <span className={`text-xs font-medium ${adhdMode ? 'text-xs' : 'text-[10px]'}`}>
                      {step.label}
                    </span>
                  </button>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Interactive Progress Rings with Swipe Actions */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Calories', value: 1850, goal: 2200, color: 'text-red-500', bgColor: 'bg-red-50' },
              { label: 'Protein', value: 95, goal: 120, color: 'text-blue-500', bgColor: 'bg-blue-50' },
              { label: 'Carbs', value: 180, goal: 300, color: 'text-green-500', bgColor: 'bg-green-50' },
              { label: 'Fat', value: 45, goal: 70, color: 'text-purple-500', bgColor: 'bg-purple-50' }
            ].map((item, i) => {
              const progress = (item.value / item.goal) * 100;
              return (
                <Card 
                  key={item.label} 
                  className={`
                    ${item.bgColor} border-0 shadow-lg rounded-3xl p-4 cursor-pointer 
                    transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                    ${adhdMode ? 'min-h-[140px]' : 'min-h-[120px]'}
                  `}
                  onClick={() => {
                    // Swipe action simulation
                    setCompletedSteps(prev => [...prev, i]);
                  }}
                >
                  <div className="flex flex-col items-center h-full justify-center">
                    <div className={`relative ${adhdMode ? 'w-16 h-16' : 'w-12 h-12'} mb-3`}>
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(0,0,0,0.1)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${progress}, 100`}
                          className={`${item.color} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`${item.color} font-bold ${adhdMode ? 'text-sm' : 'text-xs'}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold text-gray-800 ${adhdMode ? 'text-sm' : 'text-xs'}`}>
                        {item.label}
                      </div>
                      <div className={`text-gray-600 ${adhdMode ? 'text-xs' : 'text-[10px]'}`}>
                        {item.value}/{item.goal}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Action Buttons - ADHD-Friendly Large Touch Targets */}
          <div className="space-y-3">
            {[
              { 
                label: 'Calculate Calories', 
                icon: Calculator, 
                page: 'calculator',
                color: 'bg-gradient-to-r from-orange-400 to-red-500',
                description: 'Quick calorie calculation'
              },
              { 
                label: 'Log Your Meals', 
                icon: BookOpen, 
                page: 'logger',
                color: 'bg-gradient-to-r from-green-400 to-blue-500',
                description: 'Track what you eat'
              },
              { 
                label: 'View Progress', 
                icon: TrendingUp, 
                page: 'profile',
                color: 'bg-gradient-to-r from-purple-400 to-pink-500',
                description: 'See your achievements'
              }
            ].map((button, i) => (
              <Button
                key={button.label}
                onClick={() => onNavigate(button.page)}
                className={`
                  w-full ${adhdMode ? 'h-20 text-lg' : 'h-16 text-base'} 
                  ${button.color} hover:scale-[1.02] active:scale-[0.98]
                  transform transition-all duration-200 text-white font-bold 
                  rounded-2xl shadow-lg border-0 relative overflow-hidden
                `}
              >
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center">
                    <button.icon className={`${adhdMode ? 'w-7 h-7' : 'w-6 h-6'} mr-3`} />
                    <div className="text-left">
                      <div className="font-bold">{button.label}</div>
                      <div className={`${adhdMode ? 'text-sm' : 'text-xs'} opacity-90`}>
                        {button.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`${adhdMode ? 'w-6 h-6' : 'w-5 h-5'} opacity-70`} />
                </div>
              </Button>
            ))}
          </div>

          {/* Today's Summary Card */}
          <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl rounded-3xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Today's Nutrition Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">1,850</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">95g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full w-3/4"></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              84% of daily goal achieved
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}