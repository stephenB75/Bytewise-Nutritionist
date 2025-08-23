/**
 * PWA Update Notification Component
 * 
 * Displays a notification when a new version of the PWA is available
 * Helps users update to get the latest app icon and features
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, RefreshCw } from 'lucide-react';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) return;

    // Register service worker update handler
    const handleServiceWorkerUpdate = () => {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Check for updates
        reg.update();
        
        // Listen for new service worker waiting
        if (reg.waiting) {
          setShowUpdate(true);
        }
        
        // Listen for state changes
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    };

    handleServiceWorkerUpdate();

    // Check for updates every 30 minutes
    const interval = setInterval(() => {
      if (registration) {
        registration.update();
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [registration]);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the new service worker to take control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      // If no waiting worker, just reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Store dismissal in localStorage with timestamp
    localStorage.setItem('pwa-update-dismissed', new Date().toISOString());
  };

  // Check if update was recently dismissed (within 24 hours)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-update-dismissed');
    if (dismissed) {
      const dismissTime = new Date(dismissed).getTime();
      const now = new Date().getTime();
      const hoursSinceDismiss = (now - dismissTime) / (1000 * 60 * 60);
      
      // Hide notification if dismissed within last 24 hours
      if (hoursSinceDismiss < 24) {
        setShowUpdate(false);
      }
    }
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg border-2 border-brand-yellow">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-brand-yellow animate-spin-slow" />
              <h3 className="font-semibold text-gray-900">
                Update Available!
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              A new version of ByteWise is ready. Update now to get the latest features and improvements, including the new app icon.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-medium"
                size="sm"
              >
                Update Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-amber-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}