/**
 * ByteWise - Complete Modern Food App Redesign
 * Inspired by Deliveroo, Chipotle, and modern food delivery apps
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  ArrowRight,
  Target,
  Activity,
  User,
  Scale,
  Ruler,
  Zap,
  ChefHat,
  Utensils,
  Apple,
  Flame
} from 'lucide-react';

interface ModernFoodAppProps {
  onNavigate: (page: string) => void;
}

export default function ModernFoodApp({ onNavigate }: ModernFoodAppProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Force immediate visual feedback
  console.log('🎨 MODERN FOOD APP REDESIGN LOADING!');
  
  // Add immediate cache-busting
  useEffect(() => {
    console.log('✅ ModernFoodApp component mounted successfully');
  }, []);
  
  // Calculator state - preserving original functionality
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Form steps for better UX
  const formSteps = [
    { field: 'age', label: 'Age', icon: User, placeholder: 'Enter your age', type: 'number' },
    { field: 'gender', label: 'Gender', icon: User, placeholder: 'Select gender', type: 'select' },
    { field: 'weight', label: 'Weight (kg)', icon: Scale, placeholder: 'Enter weight', type: 'number' },
    { field: 'height', label: 'Height (cm)', icon: Ruler, placeholder: 'Enter height', type: 'number' },
    { field: 'activityLevel', label: 'Activity Level', icon: Activity, placeholder: 'Select activity', type: 'select' }
  ];

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
    setCurrentStep(0);
  };

  const getCurrentValue = (field: string) => {
    switch (field) {
      case 'age': return age;
      case 'gender': return gender;
      case 'weight': return weight;
      case 'height': return height;
      case 'activityLevel': return activityLevel;
      default: return '';
    }
  };

  const setCurrentValue = (field: string, value: string) => {
    switch (field) {
      case 'age': setAge(value); break;
      case 'gender': setGender(value); break;
      case 'weight': setWeight(value); break;
      case 'height': setHeight(value); break;
      case 'activityLevel': setActivityLevel(value); break;
    }
  };

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateCalories();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {!showCalculator ? (
        // Welcome Screen - Modern Food App Style
        <div className="min-h-screen flex flex-col">
          {/* Hero Section with Food Background */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
            {/* Food Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
              <div className="absolute top-32 right-8 w-16 h-16 rounded-full bg-white"></div>
              <div className="absolute top-60 left-16 w-12 h-12 rounded-full bg-white"></div>
              <div className="absolute bottom-32 right-12 w-24 h-24 rounded-full bg-white"></div>
              <div className="absolute bottom-16 left-8 w-14 h-14 rounded-full bg-white"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center text-white">
              {/* App Icon */}
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                <Apple className="w-12 h-12 text-white" />
              </div>
              
              {/* Title */}
              <h1 className="text-5xl font-black mb-4 tracking-tight">
                Byte<span className="text-yellow-200">Wise</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl font-medium mb-2 text-white/90">
                Smart Calorie Calculator
              </p>
              <p className="text-lg text-white/80 mb-12 max-w-sm">
                Get accurate daily calorie needs in seconds
              </p>
              
              {/* CTA Button */}
              <Button
                onClick={() => setShowCalculator(true)}
                className="w-full max-w-sm h-16 bg-white text-orange-500 hover:bg-gray-50 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Calculate My Calories
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              
              {/* Features */}
              <div className="flex justify-center space-x-8 mt-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Fast</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <Target className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Accurate</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Scientific</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : calculatedCalories ? (
        // Results Screen - Modern Card Design
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
          <div className="max-w-md mx-auto pt-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Your Daily Calories</h2>
              <p className="text-gray-600">Based on your personal metrics</p>
            </div>

            {/* Main Calorie Card */}
            <Card className="p-8 mb-6 bg-white shadow-2xl rounded-3xl border-0">
              <div className="text-center">
                <div className="text-6xl font-black text-gray-900 mb-2">
                  {calculatedCalories.toLocaleString()}
                </div>
                <div className="text-xl font-bold text-gray-600 mb-6">calories per day</div>
                
                {/* Macros Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-2xl">
                    <div className="text-2xl font-black text-orange-600 mb-1">
                      {Math.round(calculatedCalories * 0.5 / 4)}g
                    </div>
                    <div className="text-sm font-bold text-orange-700">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-600 mb-1">
                      {Math.round(calculatedCalories * 0.3 / 4)}g
                    </div>
                    <div className="text-sm font-bold text-blue-700">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-2xl">
                    <div className="text-2xl font-black text-purple-600 mb-1">
                      {Math.round(calculatedCalories * 0.2 / 9)}g
                    </div>
                    <div className="text-sm font-bold text-purple-700">Fat</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={resetCalculator}
                className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg rounded-2xl border-0"
              >
                Calculate Again
              </Button>
              <Button
                onClick={() => setShowCalculator(false)}
                className="w-full h-14 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-lg rounded-2xl shadow-lg"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Calculator Steps - Modern Step-by-Step Interface
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="max-w-md mx-auto pt-8">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="w-12 h-12 rounded-full bg-white shadow-lg border-0 disabled:opacity-50"
                >
                  ←
                </Button>
                <div className="text-center">
                  <div className="text-sm font-bold text-gray-600 mb-1">
                    Step {currentStep + 1} of {formSteps.length}
                  </div>
                  <div className="w-32 h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 h-12"></div>
              </div>
            </div>

            {/* Current Step Card */}
            <Card className="p-8 mb-8 bg-white shadow-2xl rounded-3xl border-0">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                  {React.createElement(formSteps[currentStep].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {formSteps[currentStep].label}
                </h2>
              </div>

              {/* Input Field */}
              <div className="space-y-4">
                {formSteps[currentStep].type === 'select' ? (
                  <Select 
                    value={getCurrentValue(formSteps[currentStep].field)} 
                    onValueChange={(value) => setCurrentValue(formSteps[currentStep].field, value)}
                  >
                    <SelectTrigger className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-400">
                      <SelectValue placeholder={formSteps[currentStep].placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {formSteps[currentStep].field === 'gender' ? (
                        <>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                          <SelectItem value="light">Light (light exercise/sports 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (moderate exercise/sports 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (hard exercise/sports 6-7 days a week)</SelectItem>
                          <SelectItem value="extra">Extra Active (very hard exercise & physical job)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={formSteps[currentStep].type}
                    value={getCurrentValue(formSteps[currentStep].field)}
                    onChange={(e) => setCurrentValue(formSteps[currentStep].field, e.target.value)}
                    placeholder={formSteps[currentStep].placeholder}
                    className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-400"
                  />
                )}
              </div>
            </Card>

            {/* Next Button */}
            <Button
              onClick={nextStep}
              disabled={!getCurrentValue(formSteps[currentStep].field)}
              className="w-full h-16 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xl rounded-2xl shadow-lg disabled:opacity-50"
            >
              {currentStep === formSteps.length - 1 ? (
                <>
                  Calculate <Calculator className="ml-3 w-6 h-6" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-3 w-6 h-6" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}