import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initNativeApp } from "./capacitor/initNativeApp";
import { routeAuthCallbackPath } from "./lib/authLinkParams";

import "./index.css";

routeAuthCallbackPath();
void initNativeApp();

// Production ready ByteWise Nutrition Tracker

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = `
    <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial; text-align: center;">
      <div>
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚨 ROOT ELEMENT ERROR</h1>
        <p style="font-size: 1.5rem;">Root element not found in DOM</p>
      </div>
    </div>
  `;
} else {
  try {
    // Do not write innerHTML after createRoot. React 18 owns this node;
    // replacing it leaves the container empty (blank screen on launch).
    const root = createRoot(rootElement);
    root.render(<App />);
    // Keep the native splash up until the first frame is actually painted.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void import('@capacitor/splash-screen')
          .then(({ SplashScreen }) => SplashScreen.hide())
          .catch(() => {});
      });
    });
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
