import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { apiRequest } from '@/lib/queryClient';

const TOKEN_KEY = 'bytewise-push-token';

type PushHandlers = {
  /** A push arrived while the app was open (iOS shows no banner then). */
  onReceived: (type?: string) => void;
  /** The user tapped a push. */
  onOpened: (type?: string) => void;
};

let handlers: PushHandlers | null = null;
let listenersAdded = false;

// Must stay synchronous: awaiting a Capacitor plugin proxy hangs forever on native.
function getPlugin() {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('PushNotifications')) {
    return null;
  }
  return PushNotifications;
}

async function addListeners(plugin: typeof PushNotifications) {
  if (listenersAdded) return;
  listenersAdded = true;

  await plugin.addListener('registration', async ({ value }) => {
    try {
      await apiRequest('POST', '/api/push/register', { token: value });
      localStorage.setItem(TOKEN_KEY, value);
    } catch (error) {
      console.warn('Could not save push token:', error);
    }
  });
  await plugin.addListener('registrationError', error => {
    console.warn('Push registration failed:', error?.error || error);
  });
  await plugin.addListener('pushNotificationReceived', notification => {
    handlers?.onReceived(notification.data?.type);
  });
  await plugin.addListener('pushNotificationActionPerformed', action => {
    handlers?.onOpened(action.notification.data?.type);
  });
}

/**
 * Registers this iPhone for push notifications for the signed-in user. With `prompt` false it only
 * refreshes an existing permission, so the iOS permission dialog appears only when it's relevant.
 * No-op on the web.
 */
export async function registerForPush(options: PushHandlers & { prompt: boolean }): Promise<void> {
  const plugin = getPlugin();
  if (!plugin) return;
  handlers = { onReceived: options.onReceived, onOpened: options.onOpened };

  try {
    let { receive } = await plugin.checkPermissions();
    if (receive !== 'granted') {
      if (!options.prompt || receive === 'denied') return;
      ({ receive } = await plugin.requestPermissions());
      if (receive !== 'granted') return;
    }
    await addListeners(plugin);
    await plugin.register();
  } catch (error) {
    console.warn('Could not register for push notifications:', error);
  }
}

/** Stops pushes for the current user on this device. Call before signing out. */
export async function unregisterPush(): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || !getPlugin()) return;
  try {
    await apiRequest('POST', '/api/push/unregister', { token });
  } catch (error) {
    console.warn('Could not remove push token:', error);
  }
  localStorage.removeItem(TOKEN_KEY);
}
