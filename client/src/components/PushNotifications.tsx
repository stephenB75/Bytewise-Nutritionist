/**
 * Push Notifications Component
 * Handles notification permissions and push notification setup
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Check, X, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationsProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export function PushNotifications({ onPermissionChange }: PushNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      onPermissionChange?.(result);

      if (result === 'granted') {
        // Test notification
        new Notification('ByteWise Notifications Enabled!', {
          body: 'You\'ll now receive nutrition reminders and goal updates.',
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
        });

        toast({
          title: "Notifications Enabled",
          description: "You'll receive nutrition reminders and goal updates.",
        });
      } else if (result === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "You can enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from ByteWise!',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
      });
      
      toast({
        title: "Test Notification Sent",
        description: "Check if you received the notification!",
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { status: 'Enabled', color: 'bg-green-500', icon: Check };
      case 'denied':
        return { status: 'Blocked', color: 'bg-red-500', icon: X };
      default:
        return { status: 'Not Set', color: 'bg-gray-500', icon: Bell };
    }
  };

  const permissionInfo = getPermissionStatus();
  const StatusIcon = permissionInfo.icon;

  if (!isSupported) {
    return (
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-800">Notifications Not Supported</div>
            <div className="text-sm text-gray-600">Your browser doesn't support push notifications</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${permissionInfo.color} rounded-full flex items-center justify-center`}>
            <StatusIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium">Push Notifications</div>
            <div className="text-sm text-gray-600">
              Status: <Badge variant="secondary">{permissionInfo.status}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {permission === 'default' && (
            <Button 
              onClick={requestPermission}
              disabled={isLoading}
              size="sm"
            >
              <BellRing className="w-4 h-4 mr-2" />
              {isLoading ? 'Requesting...' : 'Enable'}
            </Button>
          )}
          
          {permission === 'granted' && (
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
            >
              Test
            </Button>
          )}
          
          {permission === 'denied' && (
            <Button 
              onClick={() => {
                toast({
                  title: "Enable in Browser Settings",
                  description: "Go to browser settings to enable notifications for this site.",
                });
              }}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>
      
      {permission === 'granted' && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-800">
            ✓ You'll receive notifications for:
            <ul className="mt-1 ml-4 space-y-1">
              <li>• Daily calorie goal reminders</li>
              <li>• Meal logging reminders</li>
              <li>• Achievement unlocks</li>
              <li>• Weekly progress summaries</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export default PushNotifications;