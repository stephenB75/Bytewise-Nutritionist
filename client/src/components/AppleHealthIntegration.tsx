import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, Footprints, Flame, Activity, Smartphone, Loader2 } from 'lucide-react';
import { healthKitService } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

const READ_ITEMS = [
  { icon: Footprints, label: 'Steps', color: 'text-blue-600' },
  { icon: Flame, label: 'Move calories', color: 'text-orange-600' },
  { icon: Activity, label: 'Walking & running distance', color: 'text-purple-600' },
];

export function AppleHealthIntegration() {
  const isNativeIos = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(isNativeIos);
  const [isLoading, setIsLoading] = useState(false);
  const [nativeReason, setNativeReason] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNativeIos) return;
    let cancelled = false;

    const load = async () => {
      await healthKitService.initialize();
      if (cancelled) return;
      setIsAvailable(healthKitService.getAvailability());
      setNativeReason(healthKitService.getUnavailableReason());
      setIsConnected(healthKitService.getAuthorizationStatus());
      setIsChecking(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isNativeIos]);

  const handleConnect = async () => {
    setIsLoading(true);
    setLastError(null);

    try {
      const result = await healthKitService.requestPermissions();

      if (result.ok) {
        setIsConnected(true);
        window.dispatchEvent(new CustomEvent('apple-health-changed'));
        toast({
          title: 'Apple Health Connected',
          description: "Today's steps, move calories, and distance now show on your Dashboard.",
          duration: 3000,
        });
      } else {
        setLastError(result.reason);
        toast({
          title: 'Apple Health not connected',
          description: result.reason,
          variant: 'destructive',
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Apple Health connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Apple Health could not be opened. Please try again.',
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

  const unavailableReason = !isNativeIos
    ? 'Open the Bytewise app on your iPhone to connect Apple Health.'
    : !isChecking && !isAvailable
      ? nativeReason || "Apple Health isn't available on this device."
      : null;

  return (
    <div className="space-y-4" data-testid="apple-health-section" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 border border-amber-200/60 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
            <Heart className="h-5 w-5 text-rose-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-950">Apple Health</p>
            <p className="text-sm text-gray-700">
              {isConnected ? 'Showing your activity on the Dashboard' : 'Not connected'}
            </p>
          </div>
        </div>
        {isConnected && (
          <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900">Bytewise reads from Apple Health:</p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {READ_ITEMS.map(({ icon: Icon, label, color }) => (
            <li key={label} className="flex items-center gap-2 rounded-lg bg-white/60 border border-amber-200/50 px-3 py-2 text-sm text-gray-800">
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {isConnected ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 bg-white/60 p-3 rounded-lg">
            If a number shows 0, open the Health app → your profile picture → Apps → Bytewise and turn it on.
            Your activity stays on your iPhone and isn't stored on our servers.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => healthKitService.openHealthApp()} className="w-full">
              Open Health app
            </Button>
            <Button variant="outline" onClick={handleDisconnect} className="w-full">
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={handleConnect}
            disabled={!!unavailableReason || isChecking || isLoading}
            className="on-color w-full h-12 bg-rose-600 hover:bg-rose-700 text-base font-semibold disabled:opacity-75"
            data-testid="button-connect-apple-health"
          >
            {isLoading || isChecking ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Heart className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Connecting…' : 'Connect Apple Health'}
          </Button>
          {unavailableReason ? (
            <p className="flex items-center justify-center gap-1.5 text-center text-sm text-gray-700">
              <Smartphone className="h-4 w-4 shrink-0" />
              {unavailableReason}
            </p>
          ) : lastError ? (
            <div className="space-y-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <p>{lastError}</p>
              <p className="text-xs text-gray-700">
                iOS asks only once. If you already answered, open the Health app → your profile picture → Apps → Bytewise to turn on Steps, Active Energy and Walking + Running Distance.
              </p>
              <Button variant="outline" size="sm" onClick={() => healthKitService.openHealthApp()} className="w-full">
                Open Health app
              </Button>
            </div>
          ) : (
            <p className="text-center text-xs text-gray-600">
              Apple will ask which data to share. Your activity stays on your iPhone.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
