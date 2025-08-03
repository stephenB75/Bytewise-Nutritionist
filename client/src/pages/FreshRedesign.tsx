/**
 * ByteWise - Complete Fresh Redesign from Scratch
 * Only keeping the calorie calculator function as requested
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Sparkles, 
  Zap,
  Target,
  ChevronRight
} from 'lucide-react';

interface FreshRedesignProps {
  onNavigate: (page: string) => void;
}

export default function FreshRedesign({ onNavigate }: FreshRedesignProps) {
  // Rotating background themes
  const [currentTheme, setCurrentTheme] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator state - keeping original functionality
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  // Auto-rotating themes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % themes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fresh visual themes
  const themes = [
    {
      name: 'Sunrise Energy',
      gradient: 'from-orange-400 via-pink-400 to-purple-500',
      accent: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      name: 'Ocean Breeze',
      gradient: 'from-blue-400 via-cyan-400 to-teal-500', 
      accent: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Forest Fresh',
      gradient: 'from-green-400 via-emerald-400 to-cyan-500',
      accent: 'text-green-600', 
      bg: 'bg-green-50'
    },
    {
      name: 'Cosmic Purple',
      gradient: 'from-purple-400 via-violet-400 to-indigo-500',
      accent: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'Golden Hour',
      gradient: 'from-yellow-400 via-orange-400 to-red-500',
      accent: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ];

  const currentThemeData = themes[currentTheme];

  // Calculate calories function - preserved original logic
  const calculateCalories = () => {
    if (!age || !gender || !weight || !height || !activityLevel) {
      alert('Please fill in all fields');
      return;
    }

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    // BMR calculation using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5;
    } else {
      bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161;
    }

    // Activity level multipliers
    const activityMultipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'extra': 1.9
    };

    const totalCalories = Math.round(bmr * activityMultipliers[activityLevel]);
    setCalculatedCalories(totalCalories);
  };

  const resetCalculator = () => {
    setAge('');
    setGender('');
    setWeight('');
    setHeight('');
    setActivityLevel('');
    setCalculatedCalories(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentThemeData.gradient} transition-all duration-1000 ease-in-out`}
      >
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-white rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Theme indicator */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${currentThemeData.accent}`} />
          <span className="text-sm font-semibold">{currentThemeData.name}</span>
          <Badge variant="secondary" className="text-xs">
            {currentTheme + 1}/5
          </Badge>
        </div>
      </div>

      <div className="relative z-10 pt-20 px-6">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
              <h1 className="text-4xl font-black text-gray-800 mb-2">
                ByteWise
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Smart Nutrition Calculator
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                <span>Redesigned from scratch</span>
              </div>
            </div>
          </div>

          {/* Main Action */}
          {!showCalculator ? (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl rounded-3xl p-8">
              <div className="text-center">
                <div className={`w-20 h-20 ${currentThemeData.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <Calculator className={`w-10 h-10 ${currentThemeData.accent}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Calculate Your Daily Calories
                </h2>
                <p className="text-gray-600 mb-8">
                  Get personalized calorie recommendations based on your body metrics and activity level
                </p>
                <Button
                  onClick={() => setShowCalculator(true)}
                  className={`w-full h-16 bg-gradient-to-r ${currentThemeData.gradient} hover:scale-105 transform transition-all duration-300 text-white font-bold text-lg rounded-2xl shadow-lg border-0`}
                >
                  <Target className="w-6 h-6 mr-3" />
                  Start Calculation
                  <ChevronRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </Card>
          ) : (
            /* Calculator Interface */
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl rounded-3xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Calorie Calculator
                </h2>
                <p className="text-gray-600">
                  Fill in your details for accurate results
                </p>
              </div>

              <div className="space-y-6">
                {/* Age Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age (years)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-current text-lg"
                  />
                </div>

                {/* Gender Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 text-lg">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-current text-lg"
                  />
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-current text-lg"
                  />
                </div>

                {/* Activity Level Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 text-lg">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="extra">Extra Active (very hard exercise, physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <Button
                    onClick={calculateCalories}
                    className={`w-full h-16 bg-gradient-to-r ${currentThemeData.gradient} hover:scale-105 transform transition-all duration-300 text-white font-bold text-lg rounded-2xl shadow-lg border-0`}
                  >
                    <Calculator className="w-6 h-6 mr-3" />
                    Calculate Calories
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-2 font-semibold"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => setShowCalculator(false)}
                      variant="outline" 
                      className="flex-1 h-12 rounded-xl border-2 font-semibold"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Results Display */}
          {calculatedCalories && (
            <Card className={`${currentThemeData.bg} border-0 shadow-2xl rounded-3xl p-8`}>
              <div className="text-center">
                <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className={`text-3xl font-black ${currentThemeData.accent}`}>
                    {calculatedCalories}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Daily Calorie Needs
                </h3>
                <p className="text-gray-600 mb-6">
                  Based on your personal metrics and activity level
                </p>
                <div className="bg-white/50 rounded-2xl p-4">
                  <div className="text-sm text-gray-600">
                    This calculation uses the Mifflin-St Jeor equation for accurate results
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}