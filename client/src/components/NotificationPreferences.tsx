import React, { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  OS_NOTIFICATIONS_PREF_EVENT,
  areOsNotificationsEnabled,
  getOsNotificationPermission,
  setOsNotificationsEnabled,
  type OsNotificationPermission,
  usesNativeNotifications,
} from '@/services/localNotifications';
import { refreshPushIfPermitted, unregisterPush } from '@/services/pushNotifications';

function permissionHint(permission: OsNotificationPermission, enabled: boolean): string {
  if (!usesNativeNotifications()) {
    return 'On iPhone, banners appear in Notification Center. The bell inbox always stays in the app.';
  }
  if (!enabled) {
    return 'OS banners and reminders are off. The bell inbox still keeps your in-app history.';
  }
  if (permission === 'denied') {
    return 'Allowed in Bytewise, but iOS is blocking alerts. Enable them in Settings → Notifications → Bytewise.';
  }
  if (permission === 'granted') {
    return 'Banners, meal/water reminders, fasting alerts, and friend pushes are on.';
  }
  return 'Turn on to allow banners and reminders. iOS may ask for permission.';
}

export function NotificationPreferences() {
  const [enabled, setEnabled] = useState(() => areOsNotificationsEnabled());
  const [permission, setPermission] = useState<OsNotificationPermission>('unavailable');
  const [busy, setBusy] = useState(false);

  const refreshPermission = useCallback(async () => {
    setPermission(await getOsNotificationPermission());
  }, []);

  useEffect(() => {
    void refreshPermission();
    const onPref = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (typeof detail?.enabled === 'boolean') setEnabled(detail.enabled);
      void refreshPermission();
    };
    window.addEventListener(OS_NOTIFICATIONS_PREF_EVENT, onPref);
    return () => window.removeEventListener(OS_NOTIFICATIONS_PREF_EVENT, onPref);
  }, [refreshPermission]);

  const handleToggle = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    const previous = enabled;
    setEnabled(next);
    try {
      const result = await setOsNotificationsEnabled(next);
      setEnabled(result.enabled);
      setPermission(result.permission);

      if (!next) {
        await unregisterPush();
        toast({
          title: 'App notifications off',
          description: 'Banners and reminders stopped. Your bell inbox is unchanged.',
          duration: 3000,
        });
      } else if (result.needsSettings) {
        toast({
          title: 'Allow notifications in iOS Settings',
          description: 'Settings → Notifications → Bytewise → Allow Notifications.',
          variant: 'destructive',
          duration: 6000,
        });
      } else if (result.permission === 'granted' || result.permission === 'unavailable') {
        await refreshPushIfPermitted();
        toast({
          title: 'App notifications on',
          description: usesNativeNotifications()
            ? 'You’ll get iOS banners for goals, reminders, and friend updates.'
            : 'Preference saved. Install the iOS app to get device banners.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.warn('Could not update notification preference:', error);
      setEnabled(previous);
      toast({
        title: 'Could not update notifications',
        description: 'Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 overflow-hidden rounded-2xl shadow-2xl"
      data-testid="notification-preferences"
    >
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/80">
            <Bell className="h-5 w-5 text-amber-900" />
          </div>
          <div className="min-w-0" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            <h3
              className="text-lg font-semibold text-gray-900 sm:text-xl"
              style={{ fontFamily: "'League Spartan', sans-serif" }}
            >
              App notifications
            </h3>
            <p className="mt-0.5 text-sm text-gray-700">
              {permissionHint(permission, enabled)}
            </p>
            {Capacitor.isNativePlatform() && enabled && permission === 'denied' && (
              <p className="mt-2 text-xs font-medium text-rose-700">
                Open iOS Settings to finish enabling alerts.
              </p>
            )}
          </div>
        </div>
        <Switch
          checked={enabled}
          disabled={busy}
          onCheckedChange={(checked) => void handleToggle(checked)}
          aria-label="App notifications"
          data-testid="notification-preferences-switch"
          className="data-[state=checked]:bg-amber-600"
        />
      </div>
    </Card>
  );
}
