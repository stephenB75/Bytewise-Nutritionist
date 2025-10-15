/**
 * PWA Install Prompt Component
 * Shows install banner for Progressive Web App
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds if not dismissed
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
      } else {
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      // Error handled with user feedback toast
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Show again in 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg border-0 animate-in slide-in-from-bottom-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Install bytewise nutritionist
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get the full app experience with offline access and faster loading
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 text-white"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// iOS Safari Install Instructions Component
export function IOSInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && isSafari && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowInstructions(true), 45000); // Show after 45 seconds
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowInstructions(false);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  if (!showInstructions) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg border-0 animate-in slide-in-from-bottom-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
            <Download className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">
              Add to Home Screen
            </h3>
            <div className="text-xs text-gray-600 space-y-1 mb-3">
              <p>1. Tap the share button in Safari</p>
              <p>2. Select "Add to Home Screen"</p>
              <p>3. Tap "Add" to install the app</p>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Got it
            </Button>
          </div>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}