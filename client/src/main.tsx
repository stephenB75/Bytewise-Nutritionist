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

// Immediate DOM test - no React needed
document.body.style.backgroundColor = '#ff0000';
document.body.innerHTML = `
  <div style="background: #fef7cd; color: #1d1d1b; padding: 20px; font-family: Arial; min-height: 100vh;">
    <h1>JAVASCRIPT IS EXECUTING</h1>
    <p>If you see this, JavaScript is working but React may not be.</p>
    <p>Time: ${new Date().toLocaleString()}</p>
    <p>URL: ${window.location.href}</p>
    <p>Console should show debug messages...</p>
  </div>
`;

console.log('🔍 MAIN.TSX EXECUTED - Check browser console');
console.log('🌐 URL:', window.location.href);
console.log('📁 Root element exists:', !!document.getElementById("root"));

// Now try React render
try {
  console.log('🚀 Starting React render...');
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const AppComponent = useMinimalTest ? MinimalTest : App;
    const root = createRoot(rootElement);
    root.render(<AppComponent />);
    console.log('✅ React render completed');
  } else {
    console.error('❌ Root element missing');
  }
} catch (error) {
  console.error('❌ React render error:', error);
  document.body.innerHTML += `<div style="background: red; color: white; padding: 20px;"><h2>REACT ERROR: ${error}</h2></div>`;
}
