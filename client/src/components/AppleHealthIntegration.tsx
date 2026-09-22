import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, Smartphone, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { healthKitService } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

interface AppleHealthIntegrationProps {
  onHealthDataSync?: (data: any) => void;
}

export function AppleHealthIntegration({ onHealthDataSync }: AppleHealthIntegrationProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await healthKitService.initialize();
      if (cancelled) return;
      setIsAvailable(healthKitService.getAvailability());
      setIsConnected(healthKitService.getAuthorizationStatus());
      setAutoSync(localStorage.getItem('appleHealthAutoSync') === 'true');
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      const success = await healthKitService.requestPermissions();

      if (success) {
        setIsConnected(true);
        setAutoSync(localStorage.getItem('appleHealthAutoSync') === 'true');
        toast({
          title: 'Apple Health Connected',
          description: 'Meals and water you log will appear in Apple Health.',
          duration: 3000,
        });
        if (onHealthDataSync) {
          onHealthDataSync({ type: 'manual_sync' });
        }
      } else {
        toast({
          title: 'Connection Failed',
          description: 'Allow ByteWise in the Apple Health permission sheet, then try again.',
          variant: 'destructive',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Apple Health connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Apple Health could not be opened. Try again from the iOS app.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await healthKitService.disconnect();
      setIsConnected(false);
      setAutoSync(false);

      toast({
        title: 'Apple Health Disconnected',
        description: 'You can revoke access in iOS Settings > Privacy & Security > Health.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Apple Health disconnection error:', error);
    }
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSync(enabled);
    localStorage.setItem('appleHealthAutoSync', enabled.toString());

    toast({
      title: enabled ? 'Auto-sync Enabled' : 'Auto-sync Disabled',
      description: enabled
        ? 'Logged meals and water will write to Apple Health.'
        : 'You can still sync from this screen.',
      duration: 2000,
    });
  };

  const handleManualSync = async () => {
    if (!isConnected) return;

    setIsLoading(true);

    try {
      if (onHealthDataSync) {
        await onHealthDataSync({ type: 'manual_sync' });
      }

      toast({
        title: 'Sync Complete',
        description: 'Today’s meals and water were sent to Apple Health.',
        duration: 2000,
      });
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Unable to sync data to Apple Health.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <Card className="w-full bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-950">
            <Heart className="h-5 w-5 text-red-500" />
            Apple Health
          </CardTitle>
          <CardDescription className="text-gray-700">
            Save meals and water to Apple Health from the ByteWise iOS app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <Smartphone className="h-4 w-4 mt-0.5 text-orange-600" />
            <span>On iPhone, open ByteWise and connect Apple Health here. Logged calories and water then appear in the Health app.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600" />
            <span>Safari and the website cannot write to Apple Health. Use the iOS app for this sync.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-950">
          <Heart className="h-5 w-5 text-red-500" />
          Apple Health
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-700">
          Write meals and water you log in ByteWise into the Health app.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <p className="mb-2">Connecting lets ByteWise:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Write calories from each logged meal</li>
                <li>Write water when you log a glass</li>
                <li>Keep Health in sync without storing that data on our servers</li>
              </ul>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? 'Connecting...' : 'Connect Apple Health'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Automatic Sync</Label>
                <div className="text-sm text-gray-500">
                  Write to Apple Health when you log meals or water
                </div>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={handleAutoSyncToggle}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleManualSync}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </Button>

              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>

            <div className="text-xs text-gray-600 bg-white/60 p-3 rounded-lg">
              <strong>Privacy:</strong> Health data goes to Apple Health on this iPhone.
              Manage access in iOS Settings → Privacy & Security → Health → ByteWise Nutritionist.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
