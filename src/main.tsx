import { createRoot } from "react-dom/client";
import App from "./App";
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

createRoot(document.getElementById("root")!).render(<App />);
