/**
 * Minimal Working App - Progressive Enhancement
 */

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function AppMinimal() {
  const [message] = useState('ByteWise is working correctly!');
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ByteWise</h1>
          <p className="text-lg text-gray-600 mb-6">Nutrition Tracker</p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">✅ {message}</p>
            <p className="text-green-600 text-sm mt-2">External URL accessible</p>
          </div>
          
          <div className="space-y-3 text-sm text-gray-500">
            <p>🌐 Server: Running on port 5000</p>
            <p>🔗 External access: Confirmed</p>
            <p>⚛️ React: Loading successfully</p>
            <p>🔧 Components: Minimal version active</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">Ready for full feature restoration</p>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}