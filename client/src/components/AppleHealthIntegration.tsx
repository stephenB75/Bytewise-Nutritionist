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
    checkHealthKitStatus();
    loadSyncPreferences();
  }, []);

  const checkHealthKitStatus = async () => {
    const available = healthKitService.getAvailability();
    const authorized = healthKitService.getAuthorizationStatus();
    
    setIsAvailable(available);
    setIsConnected(authorized);
  };

  const loadSyncPreferences = () => {
    const autoSyncEnabled = localStorage.getItem('appleHealthAutoSync') === 'true';
    setAutoSync(autoSyncEnabled);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    
    try {
      const success = await healthKitService.requestPermissions();
      
      if (success) {
        setIsConnected(true);
        toast({
          title: "Apple Health Connected! 🍎",
          description: "Your nutrition data will now sync with Apple Health.",
          variant: "default",
          duration: 3000,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Apple Health. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Apple Health connection error:', error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to Apple Health.",
        variant: "destructive",
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
      localStorage.removeItem('appleHealthAutoSync');
      
      toast({
        title: "Apple Health Disconnected",
        description: "You can revoke permissions in iOS Settings > Privacy & Security > Health.",
        variant: "default",
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
      title: enabled ? "Auto-sync Enabled" : "Auto-sync Disabled",
      description: enabled 
        ? "Your nutrition data will automatically sync to Apple Health."
        : "You'll need to manually sync your data.",
      variant: "default",
      duration: 2000,
    });
  };

  const handleManualSync = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    
    try {
      // Trigger manual sync of current day's data
      if (onHealthDataSync) {
        onHealthDataSync({ type: 'manual_sync' });
      }
      
      toast({
        title: "Sync Complete",
        description: "Your nutrition data has been synced to Apple Health.",
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Unable to sync data to Apple Health.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-gray-400" />
            Apple Health Integration
          </CardTitle>
          <CardDescription>
            Apple Health integration is only available on iOS devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span>Use the iOS app to access Apple Health features</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Apple Health Integration
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Sync your nutrition and hydration data with Apple Health for a complete wellness picture.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Connecting will allow ByteWise to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Read and write water intake data</li>
                <li>Read and write calorie consumption</li>
                <li>Read and write macronutrient data (protein, carbs, fat)</li>
                <li>Keep your health data in sync across apps</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect to Apple Health'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Automatic Sync</Label>
                <div className="text-sm text-gray-500">
                  Automatically sync data when you log meals or water
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
            
            <div className="text-xs text-gray-500 bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
              <strong>Privacy:</strong> Your health data is synced directly with Apple Health and never stored on our servers. 
              You can manage permissions in iOS Settings → Privacy & Security → Health → ByteWise Nutritionist.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}