import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, RefreshCw, Smartphone, Monitor, Apple } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function IconTest() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };
    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              ByteWise Icon Verification
            </CardTitle>
            <CardDescription>
              Verify that the new ByteWise Nutritionist icon is properly installed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current Status:</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Service Worker: v1.3.0 (Updated)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Icons: New ByteWise design with plate & fork
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  PWA Mode: {isStandalone ? 'Standalone App' : 'Browser Mode'}
                </li>
              </ul>
            </div>

            {/* Browser Tab Icon */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Browser Tab Icon
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Look at your browser tab - you should see the colorful ByteWise icon with the plate and fork.
              </p>
              <Button onClick={clearCache} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Clear Cache & Refresh
              </Button>
            </div>

            {/* PWA Installation */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Install as App
              </h3>
              
              {isStandalone ? (
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700">
                    ✓ You're already using the installed PWA version!
                  </p>
                </div>
              ) : isInstallable ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Install ByteWise as a standalone app on your device:
                  </p>
                  <Button onClick={handleInstallClick} className="bg-blue-600 hover:bg-blue-700">
                    Install ByteWise App
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    To install the app, use your browser's menu:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Chrome/Edge: Menu → "Install app"</li>
                    <li>• Safari: Share → "Add to Home Screen"</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Installation Guide */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile Home Screen
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-1 mb-1">
                    <Apple className="w-4 h-4" />
                    iOS (Safari)
                  </h4>
                  <ol className="text-sm text-gray-600 ml-5 list-decimal space-y-1">
                    <li>Tap the Share button (square with arrow)</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>You'll see the ByteWise icon preview</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Android (Chrome)</h4>
                  <ol className="text-sm text-gray-600 ml-5 list-decimal space-y-1">
                    <li>Tap the menu (3 dots)</li>
                    <li>Select "Add to Home screen"</li>
                    <li>You'll see the ByteWise icon preview</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Icon Preview */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Icon Preview</h3>
              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <img src="/icons/icon-192x192.png?v=1.3" alt="192x192" className="w-24 h-24 rounded-lg shadow-md" />
                  <p className="text-xs mt-1">192x192</p>
                </div>
                <div className="text-center">
                  <img src="/icons/icon-512x512.png?v=1.3" alt="512x512" className="w-32 h-32 rounded-lg shadow-md" />
                  <p className="text-xs mt-1">512x512</p>
                </div>
                <div className="text-center">
                  <img src="/favicon.ico?v=1.3" alt="Favicon" className="w-8 h-8" />
                  <p className="text-xs mt-1">Favicon</p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">If you don't see the new icon:</h3>
              <ol className="text-sm space-y-1 ml-5 list-decimal">
                <li>Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)</li>
                <li>Clear browser cache in settings</li>
                <li>For installed PWA: Remove and reinstall the app</li>
                <li>Close and reopen your browser</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}