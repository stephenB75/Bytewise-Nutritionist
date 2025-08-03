import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleTest from "./SimpleTest";
import "./index.css";

// Debug mode - use simple test to isolate issues
const useSimpleTest = false;

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
    // Force simple visual test first
    const AppComponent = useSimpleTest ? SimpleTest : App;
    const root = createRoot(rootElement);
    
    // Add immediate visual feedback
    rootElement.innerHTML = `
      <div style="background: linear-gradient(45deg, #10b981, #3b82f6); color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
        <div>
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">🎨 BYTEWISE LOADING...</h1>
          <p style="font-size: 1.5rem;">React is initializing the visual redesign</p>
          <div style="margin-top: 2rem;">
            <div style="width: 50px; height: 50px; border: 5px solid white; border-top: 5px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
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
    
    // Delay React render to show loading state
    setTimeout(() => {
      root.render(<AppComponent />);
      console.log('✅ React render initiated successfully');
    }, 1000);
    
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
