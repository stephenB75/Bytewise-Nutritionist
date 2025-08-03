/**
 * Sign On Module Component
 * Handles user authentication and account creation
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LogoBrand } from '@/components/LogoBrand';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Github, 
  Chrome,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Sparkles
} from 'lucide-react';

interface SignOnModuleProps {
  onSignIn?: (userData: any) => void;
  onCancel?: () => void;
  mode?: 'signin' | 'signup' | 'both';
}

export function SignOnModule({ onSignIn, onCancel, mode = 'both' }: SignOnModuleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful sign in
      const userData = {
        id: '1',
        email: formData.email,
        firstName: formData.firstName || 'User',
        lastName: formData.lastName || '',
        profileImage: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=ff6b35&color=fff`
      };

      onSignIn?.(userData);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to ByteWise.",
      });

    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful sign up
      const userData = {
        id: '1',
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        profileImage: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=ff6b35&color=fff`
      };

      onSignIn?.(userData);
      
      toast({
        title: "Account Created!",
        description: "Welcome to ByteWise. Let's start tracking your nutrition!",
      });

    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    toast({
      title: `${provider === 'google' ? 'Google' : 'GitHub'} Sign In`,
      description: "OAuth integration would be implemented here.",
    });
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="signin-email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Signing In...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstname">First Name</Label>
          <Input
            id="signup-firstname"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastname">Last Name</Label>
          <Input
            id="signup-lastname"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="signup-email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );

  const renderOAuthButtons = () => (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleOAuthSignIn('google')}
      >
        <Chrome className="w-4 h-4 mr-2" />
        Continue with Google
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleOAuthSignIn('github')}
      >
        <Github className="w-4 h-4 mr-2" />
        Continue with GitHub
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <LogoBrand />
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to ByteWise</h1>
            <p className="text-gray-600 mt-2">Smart nutrition tracking made simple</p>
          </div>
        </div>

        {mode === 'both' ? (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              {renderSignInForm()}
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              {renderSignUpForm()}
            </TabsContent>
          </Tabs>
        ) : mode === 'signin' ? (
          <div className="space-y-4">
            {renderSignInForm()}
          </div>
        ) : (
          <div className="space-y-4">
            {renderSignUpForm()}
          </div>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4">
            {renderOAuthButtons()}
          </div>
        </div>

        {onCancel && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </Card>
    </div>
  );
}

export default SignOnModule;