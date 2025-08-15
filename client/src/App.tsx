/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import { TestComponent } from './TestComponent';

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black' }}>
      <TestComponent />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}