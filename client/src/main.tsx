import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress development warnings and errors
if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('WebSocket') || 
      args[0].includes('Invalid hook call')
    )) {
      return; // Suppress WebSocket and React warnings
    }
    originalError.apply(console, args);
  };
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Invalid hook call')) {
      return; // Suppress React hook warnings
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
