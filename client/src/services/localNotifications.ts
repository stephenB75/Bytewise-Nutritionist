import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const FASTING_COMPLETE_ID = 1001;

// Must stay synchronous: awaiting a Capacitor plugin proxy hangs forever on native.
function getPlugin() {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications')) {
    return null;
  }
  return LocalNotifications;
}

async function ensurePermission(plugin: typeof LocalNotifications): Promise<boolean> {
  let { display } = await plugin.checkPermissions();
  if (display === 'prompt' || display === 'prompt-with-rationale') {
    ({ display } = await plugin.requestPermissions());
  }
  return display === 'granted';
}

/**
 * Schedules the OS notification for the end of a fast so it arrives even when the app
 * is closed. Re-scheduling replaces any earlier one. No-op on the web.
 */
export async function scheduleFastingCompleteNotification(endAt: Date, planName: string): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    await plugin.cancel({ notifications: [{ id: FASTING_COMPLETE_ID }] });
    if (endAt.getTime() <= Date.now()) return;
    if (!(await ensurePermission(plugin))) return;

    await plugin.schedule({
      notifications: [{
        id: FASTING_COMPLETE_ID,
        title: 'Fasting Complete! 🎉',
        body: `Your ${planName} fast is done. Time to break your fast with a nutritious meal.`,
        schedule: { at: endAt, allowWhileIdle: true },
      }],
    });
  } catch (error) {
    console.warn('Could not schedule fasting notification:', error);
  }
}

export async function cancelFastingCompleteNotification(): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    await plugin.cancel({ notifications: [{ id: FASTING_COMPLETE_ID }] });
  } catch (error) {
    console.warn('Could not cancel fasting notification:', error);
  }
}
