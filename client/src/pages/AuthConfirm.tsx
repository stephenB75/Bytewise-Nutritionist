import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { establishRecoverySession } from '@/lib/recoverySession';
import { parseAuthLinkParams } from '@/lib/authLinkParams';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Supabase PKCE email templates often link to /auth/confirm?token_hash=...&type=recovery
 */
export default function AuthConfirm() {
  const [, navigate] = useLocation();
  const { supabase } = useAuth();
  const [message, setMessage] = useState('Completing secure sign-in…');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = parseAuthLinkParams();

      if (params.type === 'recovery' || (!params.type && params.token_hash)) {
        const result = await establishRecoverySession(supabase);
        if (cancelled) return;
        if (result.ok) {
          navigate('/reset-password');
        } else {
          navigate(`/reset-password?auth_error=${encodeURIComponent(result.message)}`);
        }
        return;
      }

      if (params.token_hash && params.type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: params.token_hash,
          type: params.type as EmailOtpType,
        });
        if (cancelled) return;
        if (error) {
          navigate(`/?auth_error=${encodeURIComponent(error.message)}`);
          return;
        }
        if (params.type === 'signup' || params.type === 'email') {
          navigate('/verify-email');
          return;
        }
      }

      if (params.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(params.code);
        if (cancelled) return;
        if (error) {
          navigate(`/?auth_error=${encodeURIComponent(error.message)}`);
          return;
        }
        navigate('/');
        return;
      }

      setMessage('Nothing to confirm. Redirecting…');
      navigate('/');
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 text-center bg-amber-50 border-amber-200">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600 mx-auto mb-3" />
        <p className="text-gray-800 text-sm">{message}</p>
      </Card>
    </div>
  );
}
