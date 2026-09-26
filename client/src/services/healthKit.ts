import { Capacitor } from '@capacitor/core';
import { Health } from '@capgo/capacitor-health';

const CONNECTED_KEY = 'appleHealthConnected';
const LEGACY_KEYS = ['appleHealthAutoSync', 'appleHealthSyncedMealIds', 'appleHealthSyncedWater', 'pendingHealthKitSync'];

const FITNESS_READ_TYPES = ['steps', 'calories', 'distance'] as const;
// Added after the first release; people who connected earlier were never asked for these.
const RECOVERY_READ_TYPES = ['sleep', 'workouts'] as const;
const READ_TYPES = [...FITNESS_READ_TYPES, ...RECOVERY_READ_TYPES];

export type HealthPermissionResult = { ok: true } | { ok: false; reason: string };

export type SleepSummary = {
  asleepMinutes: number;
  awakeMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  coreMinutes: number;
  hasStages: boolean;
  score: number;
};

export type WorkoutSummary = {
  count: number;
  minutes: number;
  calories: number;
  items: Array<{ name: string; minutes: number; calories: number }>;
};

export type AppleFitnessSummary = {
  steps: number;
  activeCalories: number;
  distanceMiles: number;
  sleep: SleepSummary | null;
  workouts: WorkoutSummary;
};

type AuthorizationResult = {
  readAuthorized?: string[];
  readDenied?: string[];
};

type SleepState = 'inBed' | 'asleep' | 'awake' | 'rem' | 'deep' | 'light';

type HealthSampleRow = {
  value?: number;
  sourceId?: string;
  sourceName?: string;
  sleepState?: SleepState;
};

type WorkoutRow = {
  workoutType: string;
  duration: number;
  totalEnergyBurned?: number;
  startDate: string;
  endDate: string;
};

type HealthBridge = {
  isAvailable: () => Promise<{ available: boolean; platform?: string; reason?: string }>;
  requestAuthorization: (options: { read: string[]; write: string[] }) => Promise<AuthorizationResult>;
  checkAuthorization: (options: { read: string[]; write: string[] }) => Promise<AuthorizationResult>;
  readSamples: (options: {
    dataType: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => Promise<{ samples?: HealthSampleRow[] }>;
  queryWorkouts: (options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => Promise<{ workouts?: WorkoutRow[] }>;
};

const SLEEP_GOAL_MINUTES = 8 * 60;

/**
 * Bytewise's own 0-100 sleep score (Apple does not expose its Sleep Score to other apps):
 * 50 points for time asleep against an 8-hour goal, 30 for deep + REM share (35% earns full
 * marks; nights without stage data get a neutral 20), and 20 for staying asleep (an hour awake scores 0).
 */
export function calculateSleepScore(sleep: Omit<SleepSummary, 'score'>): number {
  if (sleep.asleepMinutes <= 0) {
    return 0;
  }
  const duration = Math.min(sleep.asleepMinutes / SLEEP_GOAL_MINUTES, 1) * 50;
  const restorativeShare = (sleep.deepMinutes + sleep.remMinutes) / sleep.asleepMinutes;
  const quality = sleep.hasStages ? Math.min(restorativeShare / 0.35, 1) * 30 : 20;
  const continuity = Math.max(0, 1 - sleep.awakeMinutes / 60) * 20;
  return Math.round(duration + quality + continuity);
}

const WORKOUT_NAMES: Record<string, string> = {
  highIntensityIntervalTraining: 'HIIT',
  traditionalStrengthTraining: 'Strength training',
  functionalStrengthTraining: 'Functional strength',
  mixedCardio: 'Cardio',
  runningTreadmill: 'Treadmill run',
  bikingStationary: 'Indoor cycle',
  other: 'Workout',
};

function workoutName(type: string): string {
  if (WORKOUT_NAMES[type]) {
    return WORKOUT_NAMES[type];
  }
  const words = type.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isNativeIos() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

function errorMessage(error: unknown): string {
  const message = String((error as any)?.message ?? error ?? '');
  if (/entitlement/i.test(message)) {
    return 'This build is missing the HealthKit capability. In Xcode, add HealthKit under Signing & Capabilities and reinstall.';
  }
  if (/not implemented/i.test(message)) {
    return 'The Apple Health plugin is missing from this build. Run npm run ios:prepare and rebuild in Xcode.';
  }
  return message || 'Apple Health could not be opened.';
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Must stay synchronous: Capacitor plugin proxies answer every property, including `then`,
// so returning one from an async function (or awaiting it) hangs forever on native.
function getHealth(): HealthBridge | null {
  return isNativeIos() ? (Health as unknown as HealthBridge) : null;
}

// Apple never reveals whether read access was granted, only whether the user has been asked
// ("readAuthorized" here). Types the user switched off simply return no samples.
function wasAsked(result: AuthorizationResult): boolean {
  const asked = result.readAuthorized || [];
  return FITNESS_READ_TYPES.some((type) => asked.includes(type));
}

function wasAskedForRecovery(result: AuthorizationResult): boolean {
  const asked = result.readAuthorized || [];
  return RECOVERY_READ_TYPES.every((type) => asked.includes(type));
}

export class HealthKitService {
  private isAvailable = false;
  private unavailableReason: string | null = null;
  private isAuthorized = localStorage.getItem(CONNECTED_KEY) === 'true';
  private recoveryAsked = false;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    const health = getHealth();
    if (!health) {
      this.isAvailable = false;
      this.unavailableReason = isNativeIos() ? 'The Apple Health plugin is missing from this build.' : null;
      return;
    }

    try {
      const status = await health.isAvailable();
      this.isAvailable = !!status.available;
      this.unavailableReason = status.available ? null : status.reason || "Apple Health isn't available on this device.";

      if (this.isAvailable && this.isAuthorized) {
        const auth = await health.checkAuthorization({ read: READ_TYPES, write: [] });
        this.setAuthorized(wasAsked(auth));
        this.recoveryAsked = wasAskedForRecovery(auth);
      }
    } catch (error) {
      console.warn('HealthKit availability check failed:', error);
      this.isAvailable = false;
      this.unavailableReason = errorMessage(error);
    }
  }

  private setAuthorized(value: boolean) {
    this.isAuthorized = value;
    localStorage.setItem(CONNECTED_KEY, value ? 'true' : 'false');
  }

  async initialize(): Promise<void> {
    await this.ready;
  }

  async requestPermissions(): Promise<HealthPermissionResult> {
    await this.ready;
    const health = getHealth();
    if (!health || !this.isAvailable) {
      return { ok: false, reason: this.unavailableReason || "Apple Health isn't available on this device." };
    }

    try {
      const status = await health.requestAuthorization({ read: READ_TYPES, write: [] });
      this.setAuthorized(wasAsked(status));
      this.recoveryAsked = wasAskedForRecovery(status);
      return this.isAuthorized
        ? { ok: true }
        : { ok: false, reason: 'Apple Health did not record an answer. Please try again.' };
    } catch (error) {
      console.error('HealthKit permission request failed:', error);
      this.setAuthorized(false);
      return { ok: false, reason: errorMessage(error) };
    }
  }

  /** iOS shows the permission sheet only once; afterwards access is changed in the Health app. */
  openHealthApp(): void {
    window.location.href = 'x-apple-health://';
  }

  getUnavailableReason(): string | null {
    return this.unavailableReason;
  }

  private async sumSamplesForDay(dataType: string, date: Date = new Date()): Promise<number> {
    const health = getHealth();
    if (!health) {
      return 0;
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    try {
      const { samples } = await health.readSamples({
        dataType,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: 5000,
      });

      // iPhone and Apple Watch both record the same walk, so adding every sample double-counts.
      // Health's own totals de-duplicate by source; the busiest source is a close stand-in.
      const totalsBySource = new Map<string, number>();
      for (const sample of samples || []) {
        const source = sample.sourceId || sample.sourceName || 'unknown';
        totalsBySource.set(source, (totalsBySource.get(source) || 0) + toNumber(sample.value));
      }
      return Math.max(0, ...Array.from(totalsBySource.values()));
    } catch (error) {
      console.warn(`Failed to read ${dataType} from Apple Health:`, error);
      return 0;
    }
  }

  async readTodayFitnessSummary(): Promise<AppleFitnessSummary | null> {
    await this.ready;
    if (!this.isAvailable || !this.isAuthorized) {
      return null;
    }

    const [steps, activeCalories, distanceMeters, sleep, workouts] = await Promise.all([
      this.sumSamplesForDay('steps'),
      this.sumSamplesForDay('calories'),
      this.sumSamplesForDay('distance'),
      this.readLastNightSleep(),
      this.readTodayWorkouts(),
    ]);

    return {
      steps: Math.round(steps),
      activeCalories: Math.round(activeCalories),
      distanceMiles: Math.round((distanceMeters / 1609.34) * 10) / 10,
      sleep,
      workouts,
    };
  }

  /** Sleep between 6 PM yesterday and 6 PM today (or now, if earlier). */
  private async readLastNightSleep(): Promise<SleepSummary | null> {
    const health = getHealth();
    if (!health || !this.recoveryAsked) {
      return null;
    }

    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(18, 0, 0, 0);
    const cutoff = new Date();
    cutoff.setHours(18, 0, 0, 0);
    const end = new Date(Math.min(Date.now(), cutoff.getTime()));

    try {
      const { samples } = await health.readSamples({
        dataType: 'sleep',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: 2000,
      });

      // Watch, iPhone and sleep apps can each record the same night; use the most complete source.
      const bySource = new Map<string, Omit<SleepSummary, 'score'>>();
      for (const sample of samples || []) {
        const source = sample.sourceId || sample.sourceName || 'unknown';
        const night = bySource.get(source) || {
          asleepMinutes: 0, awakeMinutes: 0, deepMinutes: 0, remMinutes: 0, coreMinutes: 0, hasStages: false,
        };
        const minutes = toNumber(sample.value);
        switch (sample.sleepState) {
          case 'deep':
            night.deepMinutes += minutes;
            night.asleepMinutes += minutes;
            night.hasStages = true;
            break;
          case 'rem':
            night.remMinutes += minutes;
            night.asleepMinutes += minutes;
            night.hasStages = true;
            break;
          case 'light':
            night.coreMinutes += minutes;
            night.asleepMinutes += minutes;
            night.hasStages = true;
            break;
          case 'asleep':
            night.asleepMinutes += minutes;
            break;
          case 'awake':
            night.awakeMinutes += minutes;
            break;
          default:
            break;
        }
        bySource.set(source, night);
      }

      const best = Array.from(bySource.values()).sort((a, b) => b.asleepMinutes - a.asleepMinutes)[0];
      if (!best || best.asleepMinutes <= 0) {
        return null;
      }
      const rounded = {
        asleepMinutes: Math.round(best.asleepMinutes),
        awakeMinutes: Math.round(best.awakeMinutes),
        deepMinutes: Math.round(best.deepMinutes),
        remMinutes: Math.round(best.remMinutes),
        coreMinutes: Math.round(best.coreMinutes),
        hasStages: best.hasStages,
      };
      return { ...rounded, score: calculateSleepScore(rounded) };
    } catch (error) {
      console.warn('Failed to read sleep from Apple Health:', error);
      return null;
    }
  }

  private async readTodayWorkouts(): Promise<WorkoutSummary> {
    const empty: WorkoutSummary = { count: 0, minutes: 0, calories: 0, items: [] };
    const health = getHealth();
    if (!health || !this.recoveryAsked) {
      return empty;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    try {
      const { workouts } = await health.queryWorkouts({
        startDate: start.toISOString(),
        endDate: new Date().toISOString(),
        limit: 50,
      });

      // The same session is often saved by both Apple Watch and a third-party app; keep one.
      const kept: WorkoutRow[] = [];
      const sorted = [...(workouts || [])].sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
      for (const workout of sorted) {
        const s = Date.parse(workout.startDate);
        const e = Date.parse(workout.endDate);
        const duplicate = kept.some((k) => {
          const overlap = Math.min(e, Date.parse(k.endDate)) - Math.max(s, Date.parse(k.startDate));
          return overlap > 0.5 * Math.min(e - s, Date.parse(k.endDate) - Date.parse(k.startDate));
        });
        if (!duplicate) {
          kept.push(workout);
        }
      }

      const items = kept.map((workout) => ({
        name: workoutName(workout.workoutType),
        minutes: Math.round(toNumber(workout.duration) / 60),
        calories: Math.round(toNumber(workout.totalEnergyBurned)),
      }));
      return {
        count: items.length,
        minutes: items.reduce((sum, item) => sum + item.minutes, 0),
        calories: items.reduce((sum, item) => sum + item.calories, 0),
        items,
      };
    } catch (error) {
      console.warn('Failed to read workouts from Apple Health:', error);
      return empty;
    }
  }

  /** Connected before sleep and workouts were added, so iOS has not asked about them yet. */
  needsRecoveryPermission(): boolean {
    return this.isAvailable && this.isAuthorized && !this.recoveryAsked;
  }

  getAvailability(): boolean {
    return this.isAvailable;
  }

  getAuthorizationStatus(): boolean {
    return this.isAuthorized;
  }

  async disconnect(): Promise<void> {
    this.isAuthorized = false;
    localStorage.removeItem(CONNECTED_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  }
}

export const healthKitService = new HealthKitService();
