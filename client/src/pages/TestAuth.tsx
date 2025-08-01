/**
 * Authentication Test Component
 * For debugging and testing Supabase connection
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { config } from '@/lib/config';

export function TestAuth() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setResult('Testing connection...');

    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`Connection failed: ${error.message}`);
        return;
      }

      // Test with a simple auth operation
      const testResult = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
      });

      if (testResult.error) {
        if (testResult.error.message.includes('User already registered')) {
          setResult('✅ Supabase connection is working! (User exists)');
        } else {
          setResult(`Auth test failed: ${testResult.error.message}`);
        }
      } else {
        setResult('✅ Supabase connection and auth are working!');
      }

    } catch (error: any) {
      setResult(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-4">Authentication Test</h2>
      
      <div className="space-y-4">
        <div className="text-sm">
          <p><strong>Supabase URL:</strong> {config.supabase.url ? 'Configured' : 'Missing'}</p>
          <p><strong>Supabase Key:</strong> {config.supabase.anonKey ? 'Configured' : 'Missing'}</p>
          <p><strong>Is Configured:</strong> {config.supabase.isConfigured ? 'Yes' : 'No'}</p>
        </div>
        
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Supabase Connection'}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {result}
          </div>
        )}
      </div>
    </Card>
  );
}

export default TestAuth;