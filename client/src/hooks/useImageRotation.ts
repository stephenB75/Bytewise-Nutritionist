/**
 * Image Rotation Hook
 * 
 * Manages automatic food image rotation on app open/close cycles
 * Detects when the app is opened or closed and triggers image rotation
 */

import React, { useEffect } from 'react';
import { resetImageRotation, isImageRotationEnabled } from '@/utils/foodImageRotation';

export function useImageRotation() {
  useEffect(() => {
    // Only run if rotation is enabled
    if (!isImageRotationEnabled()) {
      return;
    }

    // Track app visibility changes (close/open detection)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App became visible (opened)
        const lastHidden = sessionStorage.getItem('app-last-hidden');
        const now = Date.now();
        
        // If app was hidden for more than 30 seconds, consider it a new session
        if (lastHidden && (now - parseInt(lastHidden)) > 30000) {
          resetImageRotation();
        }
      } else {
        // App became hidden (closed/minimized)
        sessionStorage.setItem('app-last-hidden', String(Date.now()));
      }
    };

    // Track browser/tab close
    const handleBeforeUnload = () => {
      resetImageRotation();
    };

    // Track page focus/blur (additional detection)
    const handleFocus = () => {
      const lastBlur = sessionStorage.getItem('app-last-blur');
      const now = Date.now();
      
      // If app was blurred for more than 60 seconds, rotate images
      if (lastBlur && (now - parseInt(lastBlur)) > 60000) {
        resetImageRotation();
      }
    };

    const handleBlur = () => {
      sessionStorage.setItem('app-last-blur', String(Date.now()));
    };

    // Initial setup - check if this is a fresh session
    const checkInitialSession = () => {
      const sessionStart = sessionStorage.getItem('session-start-time');
      if (!sessionStart) {
        // First time opening - set session start
        sessionStorage.setItem('session-start-time', String(Date.now()));
        resetImageRotation();
      }
    };

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Run initial check
    checkInitialSession();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Return utilities for manual control
  return {
    resetRotation: resetImageRotation,
    isRotationEnabled: isImageRotationEnabled,
  };
}