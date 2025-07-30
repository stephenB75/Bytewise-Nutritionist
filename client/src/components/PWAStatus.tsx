/**
 * PWA Status Indicator Component
 * Shows current PWA installation and service worker status
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Download, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistered, setSWRegistered] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'cached' | 'error'>('checking');

  useEffect(() => {
    // Check if PWA is installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      setIsInstalled(standalone || fullscreen);
    };

    // Check service worker registration
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          setSWRegistered(!!registration);
          if (registration) {
            console.log('Service Worker active:', registration.active?.state);
          }
        } catch (error) {
          console.error('Service Worker check failed:', error);
        }
      }
    };

    // Check cache status
    const checkCacheStatus = async () => {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const hasCache = cacheNames.some(name => name.includes('bytewise'));
          setCacheStatus(hasCache ? 'cached' : 'checking');
        }
      } catch (error) {
        setCacheStatus('error');
      }
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Install prompt handling
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    checkInstalled();
    checkServiceWorker();
    checkCacheStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const result = await installPrompt.userChoice;
        console.log('Install result:', result.outcome);
        setInstallPrompt(null);
      } catch (error) {
        console.error('Install failed:', error);
      }
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (isInstalled && swRegistered) return 'default';
    return 'secondary';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isInstalled) return 'Installed';
    if (swRegistered) return 'PWA Ready';
    return 'Loading...';
  };

  return (
    <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {swRegistered ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-sm text-gray-600">
              Service Worker
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cacheStatus === 'cached' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : cacheStatus === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-sm text-gray-600">
              Cache
            </span>
          </div>
        </div>

        {installPrompt && !isInstalled && (
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-1" />
            Install App
          </Button>
        )}

        {isInstalled && (
          <div className="flex items-center gap-1 text-green-600">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">App Mode</span>
          </div>
        )}
      </div>

      {!isOnline && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            You're offline, but the app will continue to work with cached data.
          </p>
        </div>
      )}
    </Card>
  );
}