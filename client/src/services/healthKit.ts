import { Capacitor } from '@capacitor/core';

const CONNECTED_KEY = 'appleHealthConnected';
const LEGACY_KEYS = ['appleHealthAutoSync', 'appleHealthSyncedMealIds', 'appleHealthSyncedWater', 'pendingHealthKitSync'];

// The only Activity types @capgo/capacitor-health 7.x understands; any other identifier fails the whole request.
const FITNESS_READ_TYPES = ['steps', 'calories', 'distance'] as const;

export type AppleFitnessSummary = {
  steps: number;
  activeCalories: number;
  distanceMiles: number;
};

type AuthorizationResult = {
  readAuthorized?: string[];
  readDenied?: string[];
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
  }) => Promise<{ samples?: Array<{ value?: number; sourceId?: string; sourceName?: string }> }>;
};

function isNativeIos() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getHealth(): Promise<HealthBridge | null> {
  if (!isNativeIos()) {
    return null;
  }

  try {
    const mod = await import('@capgo/capacitor-health');
    return mod.Health as unknown as HealthBridge;
  } catch (error) {
    console.warn('Apple Health plugin is not available:', error);
    return null;
  }
}

// Apple never reveals whether read access was granted, only whether the user has been asked
// ("readAuthorized" here). Types the user switched off simply return no samples.
function wasAsked(result: AuthorizationResult): boolean {
  return (result.readAuthorized || []).length > 0;
}

export class HealthKitService {
  private isAvailable = false;
  private isAuthorized = localStorage.getItem(CONNECTED_KEY) === 'true';
  private ready: Promise<void>;

  constructor() {
    this.ready = this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    const health = await getHealth();
    if (!health) {
      this.isAvailable = false;
      return;
    }

    try {
      const status = await health.isAvailable();
      this.isAvailable = !!status.available;

      if (this.isAvailable && this.isAuthorized) {
        const auth = await health.checkAuthorization({ read: [...FITNESS_READ_TYPES], write: [] });
        this.setAuthorized(wasAsked(auth));
      }
    } catch (error) {
      console.warn('HealthKit availability check failed:', error);
    }
  }

  private setAuthorized(value: boolean) {
    this.isAuthorized = value;
    localStorage.setItem(CONNECTED_KEY, value ? 'true' : 'false');
  }

  async initialize(): Promise<void> {
    await this.ready;
  }

  async requestPermissions(): Promise<boolean> {
    await this.ready;
    if (!this.isAvailable) {
      return false;
    }

    try {
      const health = await getHealth();
      if (!health) {
        return false;
      }

      const status = await health.requestAuthorization({ read: [...FITNESS_READ_TYPES], write: [] });
      this.setAuthorized(wasAsked(status));
      return this.isAuthorized;
    } catch (error) {
      console.error('HealthKit permission request failed:', error);
      this.setAuthorized(false);
      return false;
    }
  }

  private async sumSamplesForDay(dataType: string, date: Date = new Date()): Promise<number> {
    const health = await getHealth();
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

    const [steps, activeCalories, distanceMeters] = await Promise.all([
      this.sumSamplesForDay('steps'),
      this.sumSamplesForDay('calories'),
      this.sumSamplesForDay('distance'),
    ]);

    return {
      steps: Math.round(steps),
      activeCalories: Math.round(activeCalories),
      distanceMiles: Math.round((distanceMeters / 1609.34) * 10) / 10,
    };
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
