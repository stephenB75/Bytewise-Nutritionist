import { Capacitor } from '@capacitor/core';

export interface HealthData {
  waterIntake?: number;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

export interface HealthMealSync {
  id?: number | string;
  calories?: number;
  totalCalories?: number;
  date?: string;
  name?: string;
}

const CONNECTED_KEY = 'appleHealthConnected';
const AUTO_SYNC_KEY = 'appleHealthAutoSync';
const SYNCED_MEALS_KEY = 'appleHealthSyncedMealIds';
const SYNCED_WATER_KEY = 'appleHealthSyncedWater';
const PENDING_KEY = 'pendingHealthKitSync';

const WRITE_TYPES = ['dietaryWater', 'dietaryEnergyConsumed'] as const;
const FITNESS_READ_TYPES = ['steps', 'calories', 'exerciseTime', 'distance'] as const;

export type AppleFitnessSummary = {
  steps: number;
  activeCalories: number;
  exerciseMinutes: number;
  distanceMiles: number;
};

type HealthBridge = {
  isAvailable: () => Promise<{ available: boolean; platform?: string; reason?: string }>;
  requestAuthorization: (options: { read: string[]; write: string[] }) => Promise<{
    writeAuthorized?: string[];
    writeDenied?: string[];
  }>;
  checkAuthorization: (options: { read: string[]; write: string[] }) => Promise<{
    writeAuthorized?: string[];
    writeDenied?: string[];
  }>;
  saveSample: (options: {
    dataType: string;
    value: number;
    unit?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  readSamples?: (options: {
    dataType: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => Promise<{ samples?: Array<{ value?: number; quantity?: number }> }>;
};

function isNativeIos() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

async function getHealth(): Promise<HealthBridge | null> {
  if (!isNativeIos()) {
    return null;
  }

  try {
    const mod = await import('@capgo/capacitor-health');
    return mod.Health as HealthBridge;
  } catch (error) {
    console.warn('Apple Health plugin is not available:', error);
    return null;
  }
}

export class HealthKitService {
  private isAvailable = false;
  private isAuthorized = localStorage.getItem(CONNECTED_KEY) === 'true';
  private ready: Promise<void>;

  constructor() {
    this.ready = this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    if (!isNativeIos()) {
      this.isAvailable = false;
      return;
    }

    try {
      const health = await getHealth();
      if (!health) {
        this.isAvailable = true;
        return;
      }

      const status = await health.isAvailable();
      this.isAvailable = !!status.available;

      if (this.isAvailable && this.isAuthorized) {
        const auth = await health.checkAuthorization({
          read: [...WRITE_TYPES, ...FITNESS_READ_TYPES],
          write: [...WRITE_TYPES],
        });
        this.isAuthorized = (auth.writeAuthorized || []).length > 0;
        localStorage.setItem(CONNECTED_KEY, this.isAuthorized ? 'true' : 'false');
      }
    } catch (error) {
      console.warn('HealthKit availability check failed:', error);
      this.isAvailable = isNativeIos();
    }
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

      const status = await health.requestAuthorization({
        read: [...WRITE_TYPES, ...FITNESS_READ_TYPES],
        write: [...WRITE_TYPES],
      });
      const deniedAll = WRITE_TYPES.every((type) => (status.writeDenied || []).includes(type));
      this.isAuthorized = !deniedAll;
      localStorage.setItem(CONNECTED_KEY, this.isAuthorized ? 'true' : 'false');
      if (this.isAuthorized && localStorage.getItem(AUTO_SYNC_KEY) === null) {
        localStorage.setItem(AUTO_SYNC_KEY, 'true');
      }
      return this.isAuthorized;
    } catch (error) {
      console.error('HealthKit permission request failed:', error);
      this.isAuthorized = false;
      localStorage.setItem(CONNECTED_KEY, 'false');
      return false;
    }
  }

  async syncWaterIntake(glasses: number, date?: Date): Promise<boolean> {
    await this.ready;
    if (!this.isAvailable || !this.isAuthorized) {
      return false;
    }

    const nextGlasses = Math.max(0, toNumber(glasses));
    const lastGlasses = toNumber(localStorage.getItem(SYNCED_WATER_KEY));
    const delta = nextGlasses - lastGlasses;
    if (delta <= 0) {
      localStorage.setItem(SYNCED_WATER_KEY, String(nextGlasses));
      return true;
    }

    const liters = delta * 0.24;
    const syncDate = (date || new Date()).toISOString();

    try {
      const health = await getHealth();
      if (health) {
        await health.saveSample({
          dataType: 'dietaryWater',
          value: liters,
          unit: 'liter',
          startDate: syncDate,
          endDate: syncDate,
        });
      } else {
        this.queuePending({
          type: 'dietaryWater',
          value: liters,
          unit: 'l',
          date: syncDate,
          glasses: delta,
        });
      }

      localStorage.setItem(SYNCED_WATER_KEY, String(nextGlasses));
      return true;
    } catch (error) {
      console.error('Failed to sync water intake to Apple Health:', error);
      return false;
    }
  }

  async syncNutritionData(nutrition: HealthData, date?: Date): Promise<boolean> {
    const calories = toNumber(nutrition.calories);
    if (calories <= 0) {
      return false;
    }
    return this.syncMeal({ calories }, date);
  }

  async syncMeal(meal: HealthMealSync, date?: Date): Promise<boolean> {
    await this.ready;
    if (!this.isAvailable || !this.isAuthorized) {
      return false;
    }

    const calories = toNumber(meal.calories ?? meal.totalCalories);
    if (calories <= 0) {
      return false;
    }

    const mealId = meal.id != null ? String(meal.id) : '';
    const synced = new Set(readJson<string[]>(SYNCED_MEALS_KEY, []));
    if (mealId && synced.has(mealId)) {
      return true;
    }

    const syncDate = meal.date && /^\d{4}-\d{2}-\d{2}$/.test(meal.date)
      ? new Date(`${meal.date}T12:00:00`).toISOString()
      : (date || new Date()).toISOString();

    try {
      const health = await getHealth();
      if (health) {
        await health.saveSample({
          dataType: 'dietaryEnergyConsumed',
          value: calories,
          unit: 'kilocalorie',
          startDate: syncDate,
          endDate: syncDate,
        });
      } else {
        this.queuePending({
          type: 'dietaryEnergyConsumed',
          value: calories,
          unit: 'kcal',
          date: syncDate,
          name: meal.name,
          mealId,
        });
      }

      if (mealId) {
        synced.add(mealId);
        localStorage.setItem(SYNCED_MEALS_KEY, JSON.stringify(Array.from(synced)));
      }
      return true;
    } catch (error) {
      console.error('Failed to sync nutrition data to Apple Health:', error);
      return false;
    }
  }

  async syncMeals(meals: HealthMealSync[]): Promise<number> {
    let saved = 0;
    for (const meal of meals) {
      if (await this.syncMeal(meal)) {
        saved += 1;
      }
    }
    return saved;
  }

  async readWaterIntake(_date?: Date): Promise<number | null> {
    return null;
  }

  async readNutritionData(_date?: Date): Promise<HealthData | null> {
    return null;
  }

  private async sumSamplesForDay(dataType: string, date: Date = new Date()): Promise<number> {
    await this.ready;
    if (!this.isAvailable || !this.isAuthorized) {
      return 0;
    }

    const health = await getHealth();
    if (!health?.readSamples) {
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
        limit: 500,
      });

      return (samples || []).reduce(
        (sum, sample) => sum + toNumber(sample.value ?? sample.quantity),
        0
      );
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

    const [steps, activeCalories, exerciseMinutes, distanceMeters] = await Promise.all([
      this.sumSamplesForDay('steps'),
      this.sumSamplesForDay('calories'),
      this.sumSamplesForDay('exerciseTime'),
      this.sumSamplesForDay('distance'),
    ]);

    return {
      steps: Math.round(steps),
      activeCalories: Math.round(activeCalories),
      exerciseMinutes: Math.round(exerciseMinutes),
      distanceMiles: Math.round((distanceMeters / 1609.34) * 10) / 10,
    };
  }

  getAvailability(): boolean {
    return this.isAvailable;
  }

  getAuthorizationStatus(): boolean {
    return this.isAuthorized;
  }

  isAutoSyncEnabled(): boolean {
    return localStorage.getItem(AUTO_SYNC_KEY) === 'true' && this.isAuthorized;
  }

  async disconnect(): Promise<void> {
    this.isAuthorized = false;
    localStorage.removeItem(CONNECTED_KEY);
    localStorage.removeItem(AUTO_SYNC_KEY);
    localStorage.removeItem(SYNCED_MEALS_KEY);
    localStorage.removeItem(SYNCED_WATER_KEY);
    localStorage.removeItem(PENDING_KEY);
  }

  private queuePending(entry: Record<string, unknown>) {
    const existing = readJson<Record<string, unknown>[]>(PENDING_KEY, []);
    existing.push(entry);
    localStorage.setItem(PENDING_KEY, JSON.stringify(existing));
  }
}

export const healthKitService = new HealthKitService();
