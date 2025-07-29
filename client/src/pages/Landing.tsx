import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { BrandStandard } from '@/components/Brand';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate a brief loading state before redirect
    setTimeout(() => {
      window.location.href = `/api/login`;
    }, 300);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col justify-center px-4 py-8 safe-area-inset animate-fade-in">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-sm mx-auto">
        {/* Brand section with mobile sizing */}
        <div className="text-center mb-6">
          <BrandStandard size="md" className="mb-6" />
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to track your nutrition journey
          </p>
        </div>

        {/* Form with mobile-optimized spacing */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-base bg-input-background border-border touch-target"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 h-12 text-base bg-input-background border-border touch-target"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground touch-target p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 font-medium touch-target p-2"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-primary text-primary-foreground btn-animate touch-target"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Replit'}
          </Button>
        </form>

        {/* Mobile-optimized footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={handleLogin}
              className="font-medium text-primary hover:text-primary/80 touch-target p-1"
            >
              Sign up
            </button>
          </p>

          {/* Tagline */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground/80">
              Track. Plan. Thrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}