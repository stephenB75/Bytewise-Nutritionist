/**
 * Image Rotation Hook
 * 
 * Manages automatic food image rotation on app open/close cycles
 * Detects when the app is opened or closed and triggers image rotation
 */

import { resetImageRotation, isImageRotationEnabled } from '@/utils/foodImageRotation';

export function useImageRotation() {
  // Temporarily disabled to fix React import issue
  // Will re-enable once the core app is working
  return {
    isRotationEnabled: () => false,
    resetRotation: () => {},
    triggerRotation: () => {}
  };
}