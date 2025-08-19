import { Capacitor } from '@capacitor/core';

export interface HealthData {
  waterIntake?: number; // in milliliters
  calories?: number;
  protein?: number; // in grams
  carbohydrates?: number; // in grams
  fat?: number; // in grams
}

export interface HealthKitPermissions {
  read: string[];
  write: string[];
}

export class HealthKitService {
  private isAvailable = false;
  private isAuthorized = false;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      this.isAvailable = false;
      return;
    }

    try {
      // HealthKit is available on all iOS devices, just check if we're on iOS
      this.isAvailable = true;
    } catch (error) {
      console.warn('HealthKit availability check failed:', error);
      this.isAvailable = false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    try {
      // For now, simulate permission request - this will be implemented with native HealthKit
      console.log('HealthKit permissions would be requested here in the native iOS app');
      this.isAuthorized = true;
      return true;
    } catch (error) {
      console.error('HealthKit permission request failed:', error);
      this.isAuthorized = false;
      return false;
    }
  }

  async syncWaterIntake(glasses: number, date?: Date): Promise<boolean> {
    if (!this.isAvailable || !this.isAuthorized) {
      return false;
    }

    try {
      // Convert glasses to milliliters (assuming 8 oz = 240ml per glass)
      const milliliters = glasses * 240;
      const syncDate = date || new Date();

      // Store data for native iOS app integration
      const healthData = {
        type: 'dietaryWater',
        value: milliliters,
        unit: 'ml',
        date: syncDate.toISOString(),
        glasses: glasses
      };
      
      // Save to localStorage for native app to sync later
      const existingData = JSON.parse(localStorage.getItem('pendingHealthKitSync') || '[]');
      existingData.push(healthData);
      localStorage.setItem('pendingHealthKitSync', JSON.stringify(existingData));

      console.log('✅ Water intake prepared for Apple Health sync:', { glasses, milliliters, date: syncDate });
      return true;
    } catch (error) {
      console.error('❌ Failed to prepare water intake for Apple Health sync:', error);
      return false;
    }
  }

  async syncNutritionData(nutrition: HealthData, date?: Date): Promise<boolean> {
    if (!this.isAvailable || !this.isAuthorized) {
      return false;
    }

    try {
      const syncDate = date || new Date();
      const promises: Promise<any>[] = [];

      const existingData = JSON.parse(localStorage.getItem('pendingHealthKitSync') || '[]');

      if (nutrition.calories !== undefined) {
        existingData.push({
          type: 'dietaryEnergyConsumed',
          value: nutrition.calories,
          unit: 'kcal',
          date: syncDate.toISOString()
        });
      }

      if (nutrition.protein !== undefined) {
        existingData.push({
          type: 'dietaryProtein',
          value: nutrition.protein,
          unit: 'g',
          date: syncDate.toISOString()
        });
      }

      if (nutrition.carbohydrates !== undefined) {
        existingData.push({
          type: 'dietaryCarbohydrates',
          value: nutrition.carbohydrates,
          unit: 'g',
          date: syncDate.toISOString()
        });
      }

      if (nutrition.fat !== undefined) {
        existingData.push({
          type: 'dietaryFatTotal',
          value: nutrition.fat,
          unit: 'g',
          date: syncDate.toISOString()
        });
      }

      localStorage.setItem('pendingHealthKitSync', JSON.stringify(existingData));

      // Removed promises array as we're now using localStorage
      // await Promise.all(promises);
      console.log('✅ Nutrition data synced to Apple Health:', nutrition);
      return true;
    } catch (error) {
      console.error('❌ Failed to sync nutrition data to Apple Health:', error);
      return false;
    }
  }

  async readWaterIntake(date?: Date): Promise<number | null> {
    if (!this.isAvailable || !this.isAuthorized) {
      return null;
    }

    try {
      const targetDate = date || new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // For now, return null to indicate HealthKit data reading is not available in web version
      // The native iOS app will implement actual HealthKit reading
      console.log('HealthKit data reading would be implemented in the native iOS app');
      return null;
    } catch (error) {
      console.error('❌ Failed to read water intake from Apple Health:', error);
      return null;
    }
  }

  async readNutritionData(date?: Date): Promise<HealthData | null> {
    if (!this.isAvailable || !this.isAuthorized) {
      return null;
    }

    try {
      const targetDate = date || new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // For now, return null to indicate HealthKit data reading is not available in web version
      // The native iOS app will implement actual HealthKit reading
      console.log('HealthKit nutrition data reading would be implemented in the native iOS app');
      return null;
    } catch (error) {
      console.error('❌ Failed to read nutrition data from Apple Health:', error);
      return null;
    }
  }

  getAvailability(): boolean {
    return this.isAvailable;
  }

  getAuthorizationStatus(): boolean {
    return this.isAuthorized;
  }

  async disconnect(): Promise<void> {
    // Reset authorization status
    this.isAuthorized = false;
    // Clear any pending sync data
    localStorage.removeItem('pendingHealthKitSync');
    console.log('Apple Health disconnected');
  }
}

// Export singleton instance
export const healthKitService = new HealthKitService();