import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Settings, CheckCircle } from 'lucide-react';
import { healthKitService } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

export function AppleHealthIntegration() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await healthKitService.initialize();
      if (cancelled) return;
      setIsAvailable(healthKitService.getAvailability());
      setIsConnected(healthKitService.getAuthorizationStatus());
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
        window.dispatchEvent(new CustomEvent('apple-health-changed'));
        toast({
          title: 'Apple Health Connected',
          description: "Today's steps, move calories, and distance now show on Home.",
          duration: 3000,
        });
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
      window.dispatchEvent(new CustomEvent('apple-health-changed'));

      toast({
        title: 'Apple Health Disconnected',
        description: 'You can revoke access in iOS Settings > Privacy & Security > Health.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Apple Health disconnection error:', error);
    }
  };

  if (!isAvailable) {
    return (
      <div className="p-4 rounded-2xl border border-amber-200/40 bg-white/50">
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="space-y-1" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            <p className="font-semibold text-gray-950">Apple Health</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Connect this on the ByteWise iPhone app to show your daily activity next to your nutrition.
            </p>
          </div>
        </div>
      </div>
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
          Show your daily activity from the Health app alongside your nutrition.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <p className="mb-2">Connecting lets ByteWise read:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Steps</li>
                <li>Active (move) calories</li>
                <li>Walking and running distance</li>
              </ul>
              <p className="mt-2">This data stays on your iPhone and isn't stored on our servers.</p>
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
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Disconnect
            </Button>

            <div className="text-xs text-gray-600 bg-white/60 p-3 rounded-lg">
              <strong>Privacy:</strong> Activity is read from Apple Health on this iPhone and isn't stored on our servers.
              If steps or calories show 0, turn them on in iOS Settings → Privacy & Security → Health → ByteWise Nutritionist.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
