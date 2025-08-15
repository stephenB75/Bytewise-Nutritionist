/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { TestComponent } from './TestComponent';

function AppContent() {
  return (
    <div className="min-h-screen bg-black">
      <TestComponent />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}