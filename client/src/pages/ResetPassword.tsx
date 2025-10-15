/**
 * Password Reset Page
 * Allows users to set a new password after clicking the reset link
 */

import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function ResetPassword() {
  const [, navigate] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { supabase } = useAuth();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    checkSession();
  }, [supabase]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. You can now sign in with your new password.",
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
      toast({
        title: "Password Reset Failed",
        description: error.message || "Unable to reset your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-fit mb-4">
            <Lock className="w-8 h-8 text-gray-900" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-gray-700">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && !success && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-green-500/20 rounded-full w-fit">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Password Reset Successful!
              </h3>
              <p className="text-gray-700">
                Your password has been updated. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="pl-10 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600 focus:border-amber-500 focus:ring-amber-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="pl-10 bg-amber-50/90 border-amber-400 text-gray-900 placeholder-gray-600 focus:border-amber-500 focus:ring-amber-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-sm font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Resetting Password...
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}