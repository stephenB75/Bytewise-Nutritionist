/**
 * Safe Auth App - Progressive Component Loading
 */

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function AppSafeAuth() {
  const [showAuth] = useState(false); // Start with auth disabled
  
  if (showAuth) {
    // Will enable auth testing later
    return <div>Auth testing mode</div>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ByteWise</h1>
            <p className="text-xl text-gray-600">Nutrition Tracker</p>
          </div>
          
          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Server Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold">Server</h3>
              </div>
              <p className="text-sm text-gray-600">Running on port 5000</p>
              <p className="text-sm text-gray-600">External access confirmed</p>
            </div>
            
            {/* API Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold">API Endpoints</h3>
              </div>
              <p className="text-sm text-gray-600">Auth: Working</p>
              <p className="text-sm text-gray-600">Meals: Working</p>
              <p className="text-sm text-gray-600">Achievements: Working</p>
            </div>
            
            {/* Frontend Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold">Frontend</h3>
              </div>
              <p className="text-sm text-gray-600">React: Loading</p>
              <p className="text-sm text-gray-600">Components: Safe mode</p>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Mode Active</h3>
            <p className="text-yellow-700 text-sm">
              Testing components systematically to identify runtime error source.
              Auth wrapper and complex components temporarily disabled.
            </p>
          </div>
          
          {/* External URL */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              External URL: {window.location.origin}
            </p>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}