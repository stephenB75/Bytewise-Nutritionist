import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress WebSocket errors in development (Replit environment issue)
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('WebSocket')) {
      return; // Suppress WebSocket connection errors
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
