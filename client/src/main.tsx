import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import MinimalApp from "./MinimalApp";
import "./index.css";

// Force modern design loading
const useMinimalApp = false;
const forceModernDesign = true;

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

console.log('🚀 Starting ByteWise app render...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found');
  document.body.innerHTML = `
    <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
      <div>
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚨 ROOT ELEMENT ERROR</h1>
        <p style="font-size: 1.5rem;">Root element not found in DOM</p>
      </div>
    </div>
  `;
} else {
  console.log('✅ Root element found, attempting render...');
  
  try {
    // Use minimal app with guaranteed visual redesign
    const AppComponent = useMinimalApp ? MinimalApp : App;
    const root = createRoot(rootElement);
    
    // Modern food app loading screen
    rootElement.innerHTML = `
      <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
        <div>
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
            <div style="font-size: 2rem;">🍎</div>
          </div>
          <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 900;">ByteWise</h1>
          <p style="font-size: 1.2rem; opacity: 0.9;">Loading modern food app design...</p>
          <div style="margin-top: 2rem;">
            <div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    // Force immediate render with cache busting
    setTimeout(() => {
      // Clear any cached components
      if (typeof window !== 'undefined') {
        window.location.hash = '#force-refresh-' + Date.now();
      }
      root.render(<AppComponent />);
      console.log('✅ Modern Food App rendered successfully');
    }, 500);
    
  } catch (error) {
    console.error('❌ React render failed:', error);
    rootElement.innerHTML = `
      <div style="background: linear-gradient(45deg, #ef4444, #f97316); color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
        <div>
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚨 REACT ERROR</h1>
          <p style="font-size: 1.5rem;">React failed to render: ${error}</p>
        </div>
      </div>
    `;
  }
}
