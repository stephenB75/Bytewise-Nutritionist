/**
 * Email Confirmation Page
 * Handles email confirmation for new user signups
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { NewLogoBrand } from '@/components/NewLogoBrand';
import { supabase } from '@/lib/supabase';

interface EmailConfirmationProps {
  onNavigate: (page: string) => void;
}

export function EmailConfirmation({ onNavigate }: EmailConfirmationProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
          return;
        }

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          if (error.message.includes('expired')) {
            setStatus('expired');
            setMessage('Your confirmation link has expired. Please sign up again to receive a new confirmation email.');
          } else {
            setStatus('error');
            setMessage(error.message || 'Email confirmation failed. Please try again.');
          }
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Your email has been confirmed successfully! You can now sign in to your Bytewise account.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            onNavigate('login');
          }, 3000);
        }

      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [onNavigate]);

  const resendConfirmation = async () => {
    try {
      const email = localStorage.getItem('pending_confirmation_email');
      if (!email) {
        setMessage('No email found. Please sign up again.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('New confirmation email sent! Please check your inbox.');
      }
    } catch (error: any) {
      setMessage('Failed to resend confirmation email. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'loading':
      default:
        return <Mail className="w-16 h-16 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      case 'loading':
      default:
        return 'text-blue-600';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Confirmed!';
      case 'error':
        return 'Confirmation Failed';
      case 'expired':
        return 'Link Expired';
      case 'loading':
      default:
        return 'Confirming Email...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <NewLogoBrand size="lg" className="mb-4" />
        </div>

        <div className="mb-6">
          {getStatusIcon()}
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {getTitle()}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Redirecting to login in 3 seconds...
            </p>
            <Button 
              onClick={() => onNavigate('login')}
              className="w-full"
            >
              Sign In Now
            </Button>
          </div>
        )}

        {(status === 'error' || status === 'expired') && (
          <div className="space-y-3">
            {status === 'expired' && (
              <Button 
                onClick={resendConfirmation}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Confirmation Email
              </Button>
            )}
            <Button 
              onClick={() => onNavigate('login')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default EmailConfirmation;