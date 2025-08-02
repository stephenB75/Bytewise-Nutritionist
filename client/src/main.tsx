import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import TestApp from "./TestApp";
import MinimalTest from "./MinimalTest";
import "./index.css";

// Debug mode - use minimal test to isolate issues
const useMinimalTest = true;

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

// Add error boundary to catch render errors
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found');
  document.body.innerHTML = `
    <div style="background: red; color: white; padding: 20px;">
      ERROR: Root element not found in DOM
    </div>
  `;
} else {
  console.log('✅ Root element found, attempting render...');
  
  try {
    const AppComponent = useMinimalTest ? MinimalTest : App;
    const root = createRoot(rootElement);
    root.render(<AppComponent />);
    console.log('✅ React render initiated successfully');
  } catch (error) {
    console.error('❌ React render failed:', error);
    rootElement.innerHTML = `
      <div style="background: red; color: white; padding: 20px; font-family: Arial;">
        <h1>RENDER ERROR</h1>
        <p>React failed to render: ${error}</p>
      </div>
    `;
  }
}
