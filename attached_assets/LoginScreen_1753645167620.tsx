import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BrandStandard } from '../Brand';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
}

export function LoginScreen({ onLogin, onNavigateToSignup, onNavigateToForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <BrandStandard size="lg" className="mb-8" />
        
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground mb-2">
          Welcome back
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Sign in to track your nutrition journey
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block font-medium text-foreground mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input-background border-border"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input-background border-border"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 font-medium"
              onClick={onNavigateToForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground btn-animate"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignup}
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}