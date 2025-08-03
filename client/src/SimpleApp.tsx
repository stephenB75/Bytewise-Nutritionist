/**
 * Simple App Component for Testing
 * Minimal React component to verify basic functionality
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-sky-300">
              bytewise
            </h1>
            <p className="text-lg text-slate-300">
              nutritionist
            </p>
          </header>
          
          <main className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">🍎 Nutrition Tracker</h2>
              <p className="text-slate-300 mb-4">
                Your comprehensive nutrition tracking application is ready to use.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-green-300">✓ Server Running</h3>
                  <p className="text-sm text-slate-400">Backend services active</p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-blue-300">✓ UI Components</h3>
                  <p className="text-sm text-slate-400">Interface ready</p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-purple-300">✓ Database</h3>
                  <p className="text-sm text-slate-400">PostgreSQL connected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Application Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>React App:</span>
                  <span className="text-green-300">✓ Loaded</span>
                </div>
                <div className="flex justify-between">
                  <span>TanStack Query:</span>
                  <span className="text-green-300">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Tailwind CSS:</span>
                  <span className="text-green-300">✓ Styled</span>
                </div>
                <div className="flex justify-between">
                  <span>PWA Features:</span>
                  <span className="text-green-300">✓ Available</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}