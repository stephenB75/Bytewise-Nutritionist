/**
 * ByteWise - Fresh Redesign Inspired by Modern Food Apps
 * Clean, modern interface keeping only the calorie calculator
 */

import { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';

interface FreshRedesignProps {
  onNavigate: (page: string) => void;
}

export default function FreshRedesign({ onNavigate }: FreshRedesignProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Force immediate visual feedback
  console.log('🎨 FRESH REDESIGN LOADING - New UI Active!');
  
  // Add immediate cache-busting
  useEffect(() => {
    console.log('✅ FreshRedesign component mounted successfully');
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">9:41</div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
            <div className="text-xs text-gray-600">100%</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Hero Section with Food Image Background */}
        {!showCalculator ? (
          <>
            {/* Hero Card */}
            <div 
              className="relative h-80 rounded-3xl overflow-hidden mb-6 shadow-xl"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'%3E%3Cdefs%3E%3ClinearGradient id='food' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff6b6b'/%3E%3Cstop offset='50%25' stop-color='%23feca57'/%3E%3Cstop offset='100%25' stop-color='%2348dbfb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1000' height='600' fill='url(%23food)'/%3E%3Ccircle cx='200' cy='150' r='80' fill='%23fff' opacity='0.1'/%3E%3Ccircle cx='800' cy='400' r='60' fill='%23fff' opacity='0.1'/%3E%3Ccircle cx='500' cy='300' r='100' fill='%23fff' opacity='0.05'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">
                  ByteWise
                </h1>
                <p className="text-white/90 text-lg mb-6">
                  Calculate your daily calorie needs
                </p>
                <Button
                  onClick={() => setShowCalculator(true)}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-2xl shadow-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Features Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Accurate</h3>
                <p className="text-sm text-gray-600">Precise BMR calculation</p>
              </Card>
              <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Fast</h3>
                <p className="text-sm text-gray-600">Quick results</p>
              </Card>
            </div>
          </>
        ) : (
          /* Calculator Interface with Step-by-Step Design */
          <div className="space-y-6">
            {/* Progress Header */}
            <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Calorie Calculator</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Step {currentStep + 1} of {formSteps.length}
                </Badge>
              </div>
              <div className="flex gap-2">
                {formSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-2 rounded-full ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </Card>

            {/* Current Step Card */}
            <Card className="bg-white border-0 shadow-lg rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const IconComponent = formSteps[currentStep].icon;
                    return <IconComponent className="w-8 h-8 text-blue-600" />;
                  })()}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {formSteps[currentStep].label}
                </h3>
              </div>

              <div className="space-y-6">
                {/* Dynamic Input Based on Current Step */}
                {formSteps[currentStep].type === 'number' && (
                  <Input
                    type="number"
                    placeholder={formSteps[currentStep].placeholder}
                    value={
                      formSteps[currentStep].field === 'age' ? age :
                      formSteps[currentStep].field === 'weight' ? weight :
                      formSteps[currentStep].field === 'height' ? height : ''
                    }
                    onChange={(e) => {
                      switch(formSteps[currentStep].field) {
                        case 'age': setAge(e.target.value); break;
                        case 'weight': setWeight(e.target.value); break;
                        case 'height': setHeight(e.target.value); break;
                      }
                    }}
                    className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500"
                  />
                )}

                {formSteps[currentStep].type === 'select' && formSteps[currentStep].field === 'gender' && (
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-14 text-lg rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {formSteps[currentStep].type === 'select' && formSteps[currentStep].field === 'activityLevel' && (
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger className="h-14 text-lg rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">
                        <div className="py-2">
                          <div className="font-medium">Sedentary</div>
                          <div className="text-sm text-gray-500">Little/no exercise</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="light">
                        <div className="py-2">
                          <div className="font-medium">Light</div>
                          <div className="text-sm text-gray-500">Light exercise 1-3 days/week</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderate">
                        <div className="py-2">
                          <div className="font-medium">Moderate</div>
                          <div className="text-sm text-gray-500">Moderate exercise 3-5 days/week</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div className="py-2">
                          <div className="font-medium">Active</div>
                          <div className="text-sm text-gray-500">Hard exercise 6-7 days/week</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="extra">
                        <div className="py-2">
                          <div className="font-medium">Extra Active</div>
                          <div className="text-sm text-gray-500">Very hard exercise, physical job</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  {currentStep > 0 && (
                    <Button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-2 font-semibold"
                    >
                      Back
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => {
                      const currentValue = 
                        formSteps[currentStep].field === 'age' ? age :
                        formSteps[currentStep].field === 'gender' ? gender :
                        formSteps[currentStep].field === 'weight' ? weight :
                        formSteps[currentStep].field === 'height' ? height :
                        formSteps[currentStep].field === 'activityLevel' ? activityLevel : '';
                      
                      if (!currentValue) {
                        alert(`Please fill in ${formSteps[currentStep].label.toLowerCase()}`);
                        return;
                      }
                      
                      if (currentStep < formSteps.length - 1) {
                        setCurrentStep(prev => prev + 1);
                      } else {
                        calculateCalories();
                      }
                    }}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
                  >
                    {currentStep < formSteps.length - 1 ? 'Continue' : 'Calculate'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="text-gray-500 text-sm hover:text-gray-700"
                  >
                    ← Back to home
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Results Display */}
        {calculatedCalories && (
          <Card className="bg-white border-0 shadow-lg rounded-2xl p-8 mt-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-black text-white">
                  {calculatedCalories}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Daily Calories
              </h3>
              <p className="text-gray-600 mb-6">
                Your personalized daily calorie needs
              </p>
              
              {/* Breakdown Card */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{Math.round(calculatedCalories * 0.5)}</div>
                    <div className="text-xs text-gray-600">Carbs (50%)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{Math.round(calculatedCalories * 0.3 / 4)}</div>
                    <div className="text-xs text-gray-600">Protein (30%)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{Math.round(calculatedCalories * 0.2 / 9)}</div>
                    <div className="text-xs text-gray-600">Fat (20%)</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={resetCalculator}
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl border-2 font-semibold"
                >
                  Calculate Again
                </Button>
                <Button
                  onClick={() => setShowCalculator(false)}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
                >
                  Done
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}