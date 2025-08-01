import { NewLogoBrand } from '@/components/NewLogoBrand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
}

export default function ForgotPassword({ onNavigateToLogin, showToast }: ForgotPasswordProps) {
  const handleResetRequest = () => {
    // Since we use Supabase Auth, redirect to working app for password reset
    showToast('Redirecting to password reset...', 'default');
    setTimeout(() => {
      window.location.href = '/working';
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    
    if (!email) {
      showToast('Please enter a valid email address', 'destructive');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'destructive');
      return;
    }

    handleResetRequest();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Brand Logo */}
        <div className="text-center">
          <NewLogoBrand size="xl" />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              Reset Password
            </CardTitle>
            <p className="text-muted-foreground" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              We'll help you reset your password through Replit
            </p>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label 
                  htmlFor="email"
                  className="text-sm font-medium" 
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="touch-target"
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
                  required
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full touch-target"
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}
              >
                Reset Password via Supabase
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={onNavigateToLogin}
                className="text-sm"
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
            Since ByteWise uses Supabase authentication, password reset is handled through your Supabase account.
          </p>
        </div>
      </div>
    </div>
  );
}