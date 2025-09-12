import { Purchases, LOG_LEVEL, CustomerInfo, PurchasesEntitlementInfo, PurchasesOffering } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  productId?: string;
  expiresAt?: Date;
  willRenew: boolean;
  isInGracePeriod: boolean;
}

export interface SubscriptionOffering {
  id: string;
  productId: string;
  displayName: string;
  description: string;
  priceString: string;
  duration: string;
  introPrice?: {
    priceString: string;
    duration: string;
  };
}

class SubscriptionService {
  private isInitialized = false;
  private currentOfferings: PurchasesOffering[] = [];
  
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) {
      console.log('🟡 RevenueCat already initialized');
      return;
    }

    try {
      // Only initialize on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('🌐 Running in web mode - subscription features limited');
        return;
      }

      // Configure RevenueCat with API key
      // TODO: Add RevenueCat API key to environment variables
      const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ RevenueCat API key not found in environment variables');
        return;
      }

      // Set log level for debugging
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

      // Configure with API key and optional user ID
      await Purchases.configure({
        apiKey,
        appUserID: userId || undefined
      });

      console.log('✅ RevenueCat initialized successfully');
      this.isInitialized = true;

      // Load current offerings
      await this.loadOfferings();

    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async loadOfferings(): Promise<SubscriptionOffering[]> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ RevenueCat not initialized');
        return [];
      }

      const offerings = await Purchases.getOfferings();
      this.currentOfferings = offerings.all ? Object.values(offerings.all) : [];
      
      // Convert to our interface format
      const formattedOfferings: SubscriptionOffering[] = [];
      
      for (const offering of this.currentOfferings) {
        if (offering.availablePackages) {
          for (const pkg of offering.availablePackages) {
            formattedOfferings.push({
              id: pkg.identifier,
              productId: pkg.identifier,
              displayName: pkg.packageType || pkg.identifier,
              description: `${this.getDurationFromProductId(pkg.identifier)} subscription`,
              priceString: pkg.identifier, // Will be updated with actual price from store
              duration: this.getDurationFromProductId(pkg.identifier)
            });
          }
        }
      }

      console.log('📦 Loaded subscription offerings:', formattedOfferings);
      return formattedOfferings;

    } catch (error) {
      console.error('❌ Failed to load offerings:', error);
      return [];
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      if (!this.isInitialized) {
        return {
          isActive: false,
          tier: 'free',
          willRenew: false,
          isInGracePeriod: false
        };
      }

      const result = await Purchases.getCustomerInfo();
      return this.parseCustomerInfo(result.customerInfo);

    } catch (error) {
      console.error('❌ Failed to get subscription status:', error);
      return {
        isActive: false,
        tier: 'free',
        willRenew: false,
        isInGracePeriod: false
      };
    }
  }

  async purchaseSubscription(productId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('RevenueCat not initialized');
      }

      // Find the package for this product ID
      let targetPackage;
      for (const offering of this.currentOfferings) {
        if (offering.availablePackages) {
          targetPackage = offering.availablePackages.find(
            pkg => pkg.identifier === productId
          );
          if (targetPackage) break;
        }
      }

      if (!targetPackage) {
        throw new Error(`Product ${productId} not found in available packages`);
      }

      console.log('🛒 Purchasing subscription:', productId);
      const result = await Purchases.purchasePackage({ aPackage: targetPackage });
      
      console.log('✅ Purchase successful:', result);
      return true;

    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<SubscriptionStatus> {
    try {
      if (!this.isInitialized) {
        throw new Error('RevenueCat not initialized');
      }

      console.log('🔄 Restoring purchases...');
      const result = await Purchases.restorePurchases();
      const status = this.parseCustomerInfo(result.customerInfo);
      
      console.log('✅ Purchases restored:', status);
      return status;

    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.isInitialized) {
        await Purchases.logOut();
        console.log('👋 RevenueCat user logged out');
      }
    } catch (error) {
      console.error('❌ Failed to logout from RevenueCat:', error);
    }
  }

  // Helper function to check if user has specific entitlement
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isActive && (status.tier === 'premium' || status.tier === 'pro');
    } catch (error) {
      console.error('❌ Failed to check entitlement:', error);
      return false;
    }
  }

  // Helper function to check if user has premium features
  async hasPremiumFeatures(): Promise<boolean> {
    return this.hasEntitlement('premium');
  }

  // Helper function to check if user has pro features
  async hasProFeatures(): Promise<boolean> {
    return this.hasEntitlement('pro');
  }

  private parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionStatus {
    const entitlements = customerInfo.entitlements;
    
    // Check for active entitlements
    let tier: SubscriptionTier = 'free';
    let isActive = false;
    let productId: string | undefined;
    let expiresAt: Date | undefined;
    let willRenew = false;
    let isInGracePeriod = false;

    if (entitlements && entitlements.active) {
      // Check for pro entitlement first (highest tier)
      if (entitlements.active['pro']) {
        tier = 'pro';
        isActive = true;
        const entitlement = entitlements.active['pro'];
        productId = entitlement.productIdentifier;
        expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate) : undefined;
        willRenew = entitlement.willRenew || false;
        isInGracePeriod = entitlement.isActive && entitlement.periodType === 'grace';
      }
      // Check for premium entitlement
      else if (entitlements.active['premium']) {
        tier = 'premium';
        isActive = true;
        const entitlement = entitlements.active['premium'];
        productId = entitlement.productIdentifier;
        expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate) : undefined;
        willRenew = entitlement.willRenew || false;
        isInGracePeriod = entitlement.isActive && entitlement.periodType === 'grace';
      }
    }

    return {
      isActive,
      tier,
      productId,
      expiresAt,
      willRenew,
      isInGracePeriod
    };
  }

  private getDurationFromProductId(productId: string): string {
    if (productId.includes('monthly') || productId.includes('month')) {
      return 'Monthly';
    } else if (productId.includes('yearly') || productId.includes('year') || productId.includes('annual')) {
      return 'Annual';
    } else if (productId.includes('weekly') || productId.includes('week')) {
      return 'Weekly';
    }
    return 'Unknown';
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;