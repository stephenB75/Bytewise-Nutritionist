import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Calendar, Target, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BrandStandard } from '../Brand';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface SignupScreenProps {
  onSignup: () => void;
  onNavigateToLogin: () => void;
}

export function SignupScreen({ onSignup, onNavigateToLogin }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    activityLevel: '',
    goal: '',
    weight: '',
    height: '',
    calorieGoal: '',
    proteinGoal: '',
    fatGoal: '',
    carbGoal: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignup();
    }, 1500);
  };

  const calculateMacros = () => {
    const calories = parseInt(formData.calorieGoal) || 2000;
    const protein = Math.round(calories * 0.25 / 4); // 25% protein
    const fat = Math.round(calories * 0.30 / 9); // 30% fat
    const carbs = Math.round(calories * 0.45 / 4); // 45% carbs
    
    setFormData(prev => ({
      ...prev,
      proteinGoal: protein.toString(),
      fatGoal: fat.toString(),
      carbGoal: carbs.toString()
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
        <p className="text-muted-foreground">Let's get you started with Bytewise</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-medium text-foreground mb-2">First Name</label>
          <Input
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="John"
            className="bg-input-background"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Last Name</label>
          <Input
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Doe"
            className="bg-input-background"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@example.com"
            className="pl-10 bg-input-background"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a secure password"
            className="pl-10 pr-10 bg-input-background"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            className="pl-10 pr-10 bg-input-background"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Personal Details</h2>
        <p className="text-muted-foreground">Help us personalize your experience</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-medium text-foreground mb-2">Age</label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="25"
            className="bg-input-background"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Gender</label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger className="bg-input-background">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-medium text-foreground mb-2">Weight (kg)</label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="70"
            className="bg-input-background"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Height (cm)</label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder="175"
            className="bg-input-background"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-2">Activity Level</label>
        <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
          <SelectTrigger className="bg-input-background">
            <SelectValue placeholder="Select your activity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
            <SelectItem value="lightly-active">Lightly active (light exercise 1-3 days/week)</SelectItem>
            <SelectItem value="moderately-active">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
            <SelectItem value="very-active">Very active (hard exercise 6-7 days/week)</SelectItem>
            <SelectItem value="extra-active">Extra active (very hard exercise, physical job)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-2">Primary Goal</label>
        <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
          <SelectTrigger className="bg-input-background">
            <SelectValue placeholder="What's your main goal?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lose-weight">Lose weight</SelectItem>
            <SelectItem value="gain-weight">Gain weight</SelectItem>
            <SelectItem value="maintain-weight">Maintain weight</SelectItem>
            <SelectItem value="build-muscle">Build muscle</SelectItem>
            <SelectItem value="improve-health">Improve overall health</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Nutrition Goals</h2>
        <p className="text-muted-foreground">Set your daily macro targets</p>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-2">Daily Calorie Goal</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={formData.calorieGoal}
            onChange={(e) => handleInputChange('calorieGoal', e.target.value)}
            placeholder="2000"
            className="bg-input-background"
          />
          <Button
            type="button"
            variant="outline"
            onClick={calculateMacros}
            className="whitespace-nowrap"
          >
            Auto Calculate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-medium text-foreground mb-2">Protein (g)</label>
          <Input
            type="number"
            value={formData.proteinGoal}
            onChange={(e) => handleInputChange('proteinGoal', e.target.value)}
            placeholder="150"
            className="bg-input-background"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Fat (g)</label>
          <Input
            type="number"
            value={formData.fatGoal}
            onChange={(e) => handleInputChange('fatGoal', e.target.value)}
            placeholder="67"
            className="bg-input-background"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Carbs (g)</label>
          <Input
            type="number"
            value={formData.carbGoal}
            onChange={(e) => handleInputChange('carbGoal', e.target.value)}
            placeholder="225"
            className="bg-input-background"
          />
        </div>
      </div>

      <Card className="p-4 bg-primary/10 border-primary/20">
        <h3 className="font-semibold text-primary mb-2">Macro Distribution</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Protein:</span>
            <span>{formData.proteinGoal ? Math.round((parseInt(formData.proteinGoal) * 4) / parseInt(formData.calorieGoal || '2000') * 100) : 25}%</span>
          </div>
          <div className="flex justify-between">
            <span>Fat:</span>
            <span>{formData.fatGoal ? Math.round((parseInt(formData.fatGoal) * 9) / parseInt(formData.calorieGoal || '2000') * 100) : 30}%</span>
          </div>
          <div className="flex justify-between">
            <span>Carbs:</span>
            <span>{formData.carbGoal ? Math.round((parseInt(formData.carbGoal) * 4) / parseInt(formData.calorieGoal || '2000') * 100) : 45}%</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
        />
        <label htmlFor="terms" className="text-sm">
          I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <BrandStandard size="lg" className="mb-8" />
        
        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-primary text-primary-foreground btn-animate"
                disabled={
                  (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword)) ||
                  (currentStep === 2 && (!formData.age || !formData.gender || !formData.activityLevel || !formData.goal))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground btn-animate"
                disabled={isLoading || !agreedToTerms || !formData.calorieGoal}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}