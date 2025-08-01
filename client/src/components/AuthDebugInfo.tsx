/**
 * Authentication Debug Information Component
 * Shows current auth configuration and troubleshooting info
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export function AuthDebugInfo() {
  const { user, loading, error } = useAuth();
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const usdalKey = import.meta.env.VITE_USDA_API_KEY;

  const handleTestConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Supabase connection test:', { data, error });
      alert(`Connection test: ${error ? 'Failed - ' + error.message : 'Success'}`);
    } catch (err) {
      console.error('Connection test error:', err);
      alert('Connection test failed: ' + (err as Error).message);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadge = (condition: boolean, label: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? "✓" : "✗"} {label}
      </Badge>
    );
  };

  return (
    <Card className="p-6 m-4 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Authentication Debug</h2>
      </div>

      <div className="space-y-4">
        {/* Environment Variables */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Environment Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {getStatusBadge(!!supabaseUrl, "Supabase URL")}
            {getStatusBadge(!!supabaseKey, "Supabase Key")}
            {getStatusBadge(!!usdalKey, "USDA API Key")}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <div>URL: {supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set'}</div>
            <div>Key: {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set'}</div>
          </div>
        </div>

        {/* Authentication Status */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Authentication Status</h3>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(!loading)}
            <span>Loading: {loading ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(!!user)}
            <span>User: {user ? user.email || 'Authenticated' : 'Not authenticated'}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(!error)}
            <span>Error: {error || 'None'}</span>
          </div>
        </div>

        {/* Configuration Status */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Configuration</h3>
          <div className="text-sm text-gray-600">
            <div>Supabase URL Valid: {supabaseUrl?.includes('supabase.co') ? 'Yes' : 'No'}</div>
            <div>Key Length: {supabaseKey?.length || 0} characters</div>
            <div>Auth Client: {typeof supabase.auth !== 'undefined' ? 'Initialized' : 'Not initialized'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleTestConnection} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Reload Page
          </Button>
        </div>

        {/* Troubleshooting */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>1. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Secrets</div>
            <div>2. Check that the Supabase URL ends with .supabase.co</div>
            <div>3. Verify the anonymous key is the public anon key (not service role)</div>
            <div>4. Make sure the Supabase project is active and not paused</div>
          </div>
        </div>
      </div>
    </Card>
  );
}