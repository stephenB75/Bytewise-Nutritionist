import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./index.css";

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
    const root = createRoot(rootElement);
    
    // Show loading screen with CSS logo
    rootElement.innerHTML = `
      <div style="background: #0a0a00; color: white; padding: 40px; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; text-align: center; position: relative; overflow: hidden;">
        <!-- Background pattern -->
        <div style="position: absolute; inset: 0; opacity: 0.1; background-image: radial-gradient(circle at 25% 25%, #faed39 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1f4aa6 0%, transparent 50%);"></div>
        
        <div style="position: relative; z-index: 10;">
          <!-- CSS Logo -->
          <div style="margin-bottom: 3rem; text-align: center;">
            <div style="font-family: 'League Spartan', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 5rem; font-weight: 900; margin: 0; line-height: 0.85; color: #faed39; margin-bottom: 0.75rem; text-transform: lowercase; letter-spacing: -0.03em; text-shadow: 0 0 30px rgba(250, 237, 57, 0.3);">
              bytewise
            </div>
            <div style="font-family: 'League Spartan', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 1.5rem; font-weight: 300; margin: 0; color: rgba(255,255,255,0.9); letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.9;">
              nutritionist
            </div>
          </div>
          
          <!-- Loading text and spinner -->
          <div style="margin-bottom: 2rem;">
            <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8); margin: 0 0 2rem 0; font-weight: 300;">Loading your nutrition tracker...</p>
            <div style="width: 60px; height: 60px; border: 3px solid rgba(250, 237, 57, 0.2); border-top: 3px solid #faed39; border-radius: 50%; animation: spin 1.2s linear infinite; margin: 0 auto; box-shadow: 0 0 20px rgba(250, 237, 57, 0.3);"></div>
          </div>
        </div>
      </div>
      
      <style>
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;700;900&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'League Spartan', system-ui, -apple-system, sans-serif;
        }
      </style>
    `;
    
    // Render full app
    root.render(<App />);
    
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
