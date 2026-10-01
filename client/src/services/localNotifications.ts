import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';

const FASTING_COMPLETE_ID = 1001;
const WATER_AFTERNOON_ID = 1002;
const WATER_EVENING_ID = 1003;
const MEAL_LUNCH_ID = 1004;
const MEAL_DINNER_ID = 1005;
const WATER_GOAL_ID = 1006;
const CALORIE_GOAL_ID = 1007;
const FASTING_MILESTONE_BASE = 1100;
const ACHIEVEMENT_ID_BASE = 2000;

const SIGNIFICANT_FASTING_HOURS = [12, 16, 18, 20, 24, 36, 48, 72];
const FASTING_MILESTONE_COPY: Record<number, { title: string; body: string }> = {
  12: { title: 'Half-Day Champion! 🌟', body: '12 hours down. Your body is in fat-burning mode.' },
  16: { title: '16-Hour Hero! 🏆', body: 'Classic 16:8 complete. Time to break your fast if this was your plan.' },
  18: { title: '18-Hour Warrior! ⚔️', body: '18 hours in. Mental clarity should be at its peak.' },
  20: { title: '20-Hour Legend! 👑', body: 'Warrior level reached. Deep ketosis is underway.' },
  24: { title: '24-Hour Master! 🌟', body: 'A full day of fasting. Peak autophagy unlocked.' },
  36: { title: '36-Hour Champion! 💎', body: 'Extended fast in progress. Cellular renewal is in full swing.' },
  48: { title: '48-Hour Legend! 🦅', body: 'Two full days. Extraordinary discipline.' },
  72: { title: '72-Hour Master! 🏔️', body: 'Three days complete. Maximum fasting benefits unlocked.' },
};

type TabId = 'home' | 'nutrition' | 'fasting' | 'daily' | 'profile';

type TapHandler = (tab?: TabId) => void;

let tapHandler: TapHandler | null = null;
let tapListenerAdded = false;

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

function nextOccurrence(hour: number, minute: number): Date {
  const at = new Date();
  at.setHours(hour, minute, 0, 0);
  if (at.getTime() <= Date.now() + 30_000) {
    at.setDate(at.getDate() + 1);
  }
  return at;
}

function isSameLocalDay(date: Date, other = new Date()): boolean {
  return date.getFullYear() === other.getFullYear()
    && date.getMonth() === other.getMonth()
    && date.getDate() === other.getDate();
}

function buildNotification(
  id: number,
  title: string,
  body: string,
  at: Date,
  tab: TabId,
): LocalNotificationSchema {
  return {
    id,
    title,
    body,
    schedule: { at, allowWhileIdle: true },
    extra: { tab },
  };
}

async function cancelIds(plugin: typeof LocalNotifications, ids: number[]): Promise<void> {
  if (!ids.length) return;
  await plugin.cancel({ notifications: ids.map(id => ({ id })) });
}

/**
 * Schedules the OS notification for the end of a fast so it arrives even when the app
 * is closed. Re-scheduling replaces any earlier one. No-op on the web.
 */
export async function scheduleFastingCompleteNotification(endAt: Date, planName: string): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    await cancelIds(plugin, [FASTING_COMPLETE_ID]);
    if (endAt.getTime() <= Date.now()) return;
    if (!(await ensurePermission(plugin))) return;

    await plugin.schedule({
      notifications: [
        buildNotification(
          FASTING_COMPLETE_ID,
          'Fasting Complete! 🎉',
          `Your ${planName} fast is done. Time to break your fast with a nutritious meal.`,
          endAt,
          'fasting',
        ),
      ],
    });
  } catch (error) {
    console.warn('Could not schedule fasting notification:', error);
  }
}

export async function cancelFastingCompleteNotification(): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    await cancelIds(plugin, [FASTING_COMPLETE_ID]);
  } catch (error) {
    console.warn('Could not cancel fasting notification:', error);
  }
}

function fastingMilestoneId(hours: number): number {
  return FASTING_MILESTONE_BASE + hours;
}

/** Upcoming 12h+ milestones so they still fire if the app is backgrounded. */
export async function scheduleFastingMilestoneNotifications(startAt: Date, targetDurationMs: number): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    const ids = SIGNIFICANT_FASTING_HOURS.map(fastingMilestoneId);
    await cancelIds(plugin, ids);

    const endAt = startAt.getTime() + targetDurationMs;
    const upcoming = SIGNIFICANT_FASTING_HOURS
      .map(hours => {
        const at = new Date(startAt.getTime() + hours * 60 * 60 * 1000);
        return { hours, at };
      })
      .filter(({ at }) => at.getTime() > Date.now() + 30_000 && at.getTime() <= endAt + 1_000);

    if (!upcoming.length) return;
    if (!(await ensurePermission(plugin))) return;

    await plugin.schedule({
      notifications: upcoming.map(({ hours, at }) => {
        const copy = FASTING_MILESTONE_COPY[hours] || {
          title: `${hours}-Hour Milestone!`,
          body: `You've completed ${hours} hours of fasting.`,
        };
        return buildNotification(fastingMilestoneId(hours), copy.title, copy.body, at, 'fasting');
      }),
    });
  } catch (error) {
    console.warn('Could not schedule fasting milestone notifications:', error);
  }
}

export async function cancelFastingMilestoneNotifications(): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    await cancelIds(plugin, SIGNIFICANT_FASTING_HOURS.map(fastingMilestoneId));
  } catch (error) {
    console.warn('Could not cancel fasting milestone notifications:', error);
  }
}

async function notifyNow(id: number, title: string, body: string, tab: TabId): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    if (!(await ensurePermission(plugin))) return;
    await plugin.schedule({
      notifications: [
        buildNotification(id, title, body, new Date(Date.now() + 800), tab),
      ],
    });
  } catch (error) {
    console.warn('Could not show local notification:', error);
  }
}

export async function notifyWaterGoalReached(): Promise<void> {
  await notifyNow(
    WATER_GOAL_ID,
    'Daily Hydration Goal! 💧',
    "You've reached your 64 oz water goal today!",
    'home',
  );
}

export async function notifyCalorieGoalReached(goalCalories: number): Promise<void> {
  await notifyNow(
    CALORIE_GOAL_ID,
    'Daily Calorie Goal! 🎯',
    `Congratulations! You've reached your ${goalCalories} calorie goal today.`,
    'home',
  );
}

export async function notifyAchievementUnlocked(title: string, message: string): Promise<void> {
  const id = ACHIEVEMENT_ID_BASE + (Date.now() % 8000);
  await notifyNow(id, title, message, 'profile');
}

/**
 * Keeps daily water and meal reminders on the next due slot.
 * Skips today's copy once the matching goal is already met.
 */
export async function syncDailyReminders(opts: {
  waterGlasses: number;
  mealsLoggedToday: number;
}): Promise<void> {
  try {
    const plugin = getPlugin();
    if (!plugin) return;
    if (!(await ensurePermission(plugin))) return;

    const reminderIds = [WATER_AFTERNOON_ID, WATER_EVENING_ID, MEAL_LUNCH_ID, MEAL_DINNER_ID];
    await cancelIds(plugin, reminderIds);

    const waterGoalMet = opts.waterGlasses >= 8;
    const hasMeals = opts.mealsLoggedToday > 0;
    const waterAfternoon = nextOccurrence(15, 0);
    const waterEvening = nextOccurrence(19, 0);
    const mealLunch = nextOccurrence(13, 0);
    const mealDinner = nextOccurrence(18, 30);

    const notifications: LocalNotificationSchema[] = [];

    if (!waterGoalMet || !isSameLocalDay(waterAfternoon)) {
      notifications.push(buildNotification(
        WATER_AFTERNOON_ID,
        'Hydration reminder 💧',
        'A glass of water now keeps you on track for 64 oz today.',
        waterAfternoon,
        'home',
      ));
    }
    if (!waterGoalMet || !isSameLocalDay(waterEvening)) {
      notifications.push(buildNotification(
        WATER_EVENING_ID,
        'Evening hydration 💧',
        "You still have room before 64 oz. Finish the day hydrated.",
        waterEvening,
        'home',
      ));
    }
    if (!hasMeals || !isSameLocalDay(mealLunch)) {
      notifications.push(buildNotification(
        MEAL_LUNCH_ID,
        'Log lunch 🍽️',
        "Nothing is on today's Journal yet. Add a meal so your calories stay accurate.",
        mealLunch,
        'nutrition',
      ));
    }
    if (!hasMeals || !isSameLocalDay(mealDinner)) {
      notifications.push(buildNotification(
        MEAL_DINNER_ID,
        'Log dinner 🍽️',
        "Still no meals logged today. A quick add on Tracker keeps your day complete.",
        mealDinner,
        'nutrition',
      ));
    }

    if (notifications.length) {
      await plugin.schedule({ notifications });
    }
  } catch (error) {
    console.warn('Could not schedule daily reminders:', error);
  }
}

/** Opens the matching tab when a local notification is tapped. */
export async function watchLocalNotificationTaps(onOpen: TapHandler): Promise<void> {
  tapHandler = onOpen;
  const plugin = getPlugin();
  if (!plugin || tapListenerAdded) return;
  tapListenerAdded = true;
  try {
    await plugin.addListener('localNotificationActionPerformed', action => {
      const tab = action.notification.extra?.tab;
      if (tab === 'home' || tab === 'nutrition' || tab === 'fasting' || tab === 'daily' || tab === 'profile') {
        tapHandler?.(tab);
      }
    });
  } catch (error) {
    tapListenerAdded = false;
    console.warn('Could not watch local notification taps:', error);
  }
}
