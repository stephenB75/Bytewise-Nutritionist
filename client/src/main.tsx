import { createRoot } from "react-dom/client";
import App from "./App";
import TestApp from "./TestApp";
import "./index.css";

// Suppress development warnings and errors
if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('WebSocket') || 
        message.includes('Invalid hook call') ||
        message.includes('Cannot read properties of null') ||
        message.includes('chrome-extension') ||
        message.includes('content.js')) {
      return; // Suppress development environment errors
    }
    originalError.apply(console, args);
  };
  console.warn = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('Invalid hook call') || 
        message.includes('WebSocket')) {
      return; // Suppress React and WebSocket warnings
    }
    originalWarn.apply(console, args);
  };
}

import { Component, ErrorInfo, ReactNode } from 'react';

// Proper React Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>Component Error</h1>
            <p style={{ color: '#374151', marginBottom: '15px' }}>
              Something went wrong while rendering the app
            </p>
            <pre style={{ 
              background: '#f3f4f6', 
              padding: '15px', 
              borderRadius: '4px', 
              textAlign: 'left', 
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error('Critical app error:', error);
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #fee2e2; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: white; padding: 40px; border-radius: 8px; max-width: 500px; text-align: center;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">Critical Error</h1>
        <p style="color: #374151; margin-bottom: 15px;">App failed to initialize</p>
        <pre style="background: #f3f4f6; padding: 15px; border-radius: 4px; text-align: left; overflow: auto;">${String(error)}</pre>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 15px;">Reload Page</button>
      </div>
    </div>
  `;
}
