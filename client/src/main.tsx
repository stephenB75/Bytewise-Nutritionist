import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./index.css";

// App ready for rendering

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

// ByteWise app starting

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
  // Root element found
  try {
    const root = createRoot(rootElement);
    
    // Show loading screen with CSS logo
    rootElement.innerHTML = `
      <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
        <div>
          <div style="font-family: 'League Spartan', sans-serif; margin-bottom: 2rem; text-align: center;">
            <div style="font-size: 4rem; font-weight: 900; margin: 0; line-height: 0.9; color: #7dd3fc; margin-bottom: 0.5rem; text-transform: lowercase; letter-spacing: -0.02em;">
              bytewise
            </div>
            <div style="font-size: 1.25rem; font-weight: 300; margin: 0; opacity: 0.8; letter-spacing: 0.15em; text-transform: uppercase;">
              nutritionist
            </div>
          </div>
          <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem;">Loading nutrition tracker...</p>
          <div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    // Render app after brief loading
    setTimeout(() => {
      root.render(<App />);
    }, 800);
    
  } catch (error) {
    rootElement.innerHTML = `
      <div style="background: #ef4444; color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
        <div>
          <h1>React Error</h1>
          <p>Failed to render: ${error}</p>
        </div>
      </div>
    `;
  }
}
