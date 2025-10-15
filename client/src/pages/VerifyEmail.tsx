import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const { supabase } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL hash (Supabase uses hash for email confirmation)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (type === 'signup' || type === 'email_change') {
          if (accessToken) {
            // Set the session with the access token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (!error) {
              setVerificationStatus('success');
              setMessage('Email verified successfully! You can now sign in to your account.');
              
              // Mark this as a fresh authentication for tour purposes
              localStorage.setItem('fresh-auth-session', 'true');
              console.log('🎯 Email verification completed, marking for tour trigger');
              
              // Redirect to home after 3 seconds
              setTimeout(() => {
                setLocation('/');
              }, 3000);
            } else {
              setVerificationStatus('error');
              setMessage('Failed to verify email. The link may have expired.');
            }
          } else {
            setVerificationStatus('error');
            setMessage('Invalid verification link.');
          }
        } else {
          // Check if user is already verified
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.email_confirmed_at) {
            setVerificationStatus('success');
            setMessage('Your email is already verified. You can sign in to your account.');
          } else {
            setVerificationStatus('error');
            setMessage('No verification token found. Please check your email for the verification link.');
          }
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [supabase, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-8">
        <div className="text-center space-y-6">
          {verificationStatus === 'verifying' && (
            <>
              <div className="p-4 bg-blue-500/20 rounded-full inline-block">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verifying Your Email</h2>
              <p className="text-gray-700">Please wait while we verify your email address...</p>
            </>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <div className="p-4 bg-green-500/20 rounded-full inline-block">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-700">{message}</p>
              <Button
                onClick={() => setLocation('/')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Go to Home
              </Button>
            </>
          )}
          
          {verificationStatus === 'error' && (
            <>
              <div className="p-4 bg-red-500/20 rounded-full inline-block">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-gray-700">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  Go to Home
                </Button>
                <p className="text-sm text-gray-700">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Need a new verification email? Sign in and request a new one from your profile.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}