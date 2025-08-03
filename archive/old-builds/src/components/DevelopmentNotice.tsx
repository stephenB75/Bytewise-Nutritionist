/**
 * Development Setup Notice
 * Shows when Supabase needs to be configured
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Database, Key, CheckCircle } from 'lucide-react';
import { config } from '@/lib/config';

export function DevelopmentNotice() {
  const hasSupabaseUrl = !!config.supabase.url;
  const hasSupabaseKey = !!config.supabase.anonKey;
  const hasUsdaKey = config.usda.isConfigured;

  const isFullyConfigured = hasSupabaseUrl && hasSupabaseKey && hasUsdaKey;

  if (isFullyConfigured) {
    return null; // Don't show notice when fully configured
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bytewise Setup Required</h1>
          <p className="text-gray-600">
            Your nutrition tracker has been migrated to a serverless architecture with Supabase.
            Complete the setup below to start tracking your nutrition goals.
          </p>
        </div>

        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <ExternalLink className="h-4 w-4" />
          <AlertTitle>Quick Setup Required</AlertTitle>
          <AlertDescription>
            Follow the steps below to configure your serverless backend and start using Bytewise.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium">Supabase URL</span>
            </div>
            {hasSupabaseUrl ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <span className="text-sm text-gray-500">Not configured</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium">Supabase API Key</span>
            </div>
            {hasSupabaseKey ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <span className="text-sm text-gray-500">Not configured</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium">USDA API Key</span>
            </div>
            {hasUsdaKey ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <span className="text-sm text-gray-500">Optional - for nutrition data</span>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Check the <code className="bg-blue-100 px-1 rounded">SUPABASE_SETUP.md</code> file for detailed instructions</li>
            <li>2. Create a free Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener" className="underline">supabase.com</a></li>
            <li>3. Copy your project URL and anon key to Replit secrets</li>
            <li>4. Run the database migration from the setup guide</li>
            <li>5. Refresh this page to start using Bytewise</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://supabase.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Create Supabase Project
          </Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Check Configuration
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Check the <code>SUPABASE_SETUP.md</code> file for step-by-step instructions.
          </p>
        </div>
      </Card>
    </div>
  );
}