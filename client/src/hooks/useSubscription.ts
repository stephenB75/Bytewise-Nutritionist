/**
 * Subscription Management Hook
 * Handles subscription state, purchases, and RevenueCat integration
 */

import { useState, useEffect, useCallback } from 'react';
import { Purchases, CustomerInfo, PurchasesOffering } from '@revenuecat/purchases-capacitor';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  productId: string;
}

export interface SubscriptionState {
  isPremium: boolean;
  isPro: boolean;
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'expired' | 'cancelled' | 'inactive';
  expiresAt: Date | null;
  isLoading: boolean;
  error: string | null;
  offerings: PurchasesOffering[];
  currentOffering: PurchasesOffering | null;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: '$9.99',
    period: 'month',
    productId: 'premium_monthly',
    features: [
      'Unlimited AI food recognition',
      'Unlimited PDF exports',
      'Advanced analytics & trends',
      'Unlimited recipe management',
      'Priority support',
      'Ad-free experience'
    ]
  },
  {
    id: 'premium_annual',
    name: 'Premium Annual',
    price: '$79.99',
    period: 'year',
    productId: 'premium_annual',
    isPopular: true,
    features: [
      'Everything in Premium Monthly',
      'Save 33% vs monthly',
      'Best value for serious users',
      'Early access to new features'
    ]
  }
];

export function useSubscription() {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isPremium: false,
    isPro: false,
    tier: 'free',
    status: 'inactive',
    expiresAt: null,
    isLoading: true,
    error: null,
    offerings: [],
    currentOffering: null
  });

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Configure RevenueCat (you'll need to add your API key)
        await Purchases.configure({
          apiKey: process.env.REACT_APP_REVENUECAT_API_KEY || 'your_revenuecat_api_key',
          appUserID: undefined, // Let RevenueCat generate anonymous ID
        });

        // Get current customer info
        const customerInfo = await Purchases.getCustomerInfo();
        await handleCustomerInfoUpdate(customerInfo);

        // Get available offerings
        const offerings = await Purchases.getOfferings();
        setSubscriptionState(prev => ({
          ...prev,
          offerings: offerings.all || [],
          currentOffering: offerings.current
        }));

      } catch (error) {
        console.error('RevenueCat initialization error:', error);
        setSubscriptionState(prev => ({
          ...prev,
          error: 'Failed to initialize subscription service',
          isLoading: false
        }));
      }
    };

    initializeRevenueCat();
  }, []);

  // Handle customer info updates
  const handleCustomerInfoUpdate = useCallback(async (customerInfo: CustomerInfo) => {
    try {
      const entitlements = customerInfo.entitlements;
      let tier: 'free' | 'premium' | 'pro' = 'free';
      let status: 'active' | 'expired' | 'cancelled' | 'inactive' = 'inactive';
      let expiresAt: Date | null = null;

      if (entitlements.active) {
        if (entitlements.active['pro']) {
          tier = 'pro';
          status = 'active';
          expiresAt = entitlements.active['pro'].expirationDate ? 
            new Date(entitlements.active['pro'].expirationDate) : null;
        } else if (entitlements.active['premium']) {
          tier = 'premium';
          status = 'active';
          expiresAt = entitlements.active['premium'].expirationDate ? 
            new Date(entitlements.active['premium'].expirationDate) : null;
        }
      }

      // Sync with backend
      await syncSubscriptionWithBackend(customerInfo);

      setSubscriptionState(prev => ({
        ...prev,
        isPremium: tier === 'premium' || tier === 'pro',
        isPro: tier === 'pro',
        tier,
        status,
        expiresAt,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error handling customer info update:', error);
      setSubscriptionState(prev => ({
        ...prev,
        error: 'Failed to update subscription status',
        isLoading: false
      }));
    }
  }, []);

  // Sync subscription with backend
  const syncSubscriptionWithBackend = async (customerInfo: CustomerInfo) => {
    try {
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          revenueCatUserId: customerInfo.originalAppUserId,
          customerInfo: customerInfo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync subscription with backend');
      }
    } catch (error) {
      console.error('Backend sync error:', error);
    }
  };

  // Purchase subscription
  const purchaseSubscription = async (productId: string) => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

      const { customerInfo } = await Purchases.purchaseProduct({ productId });
      await handleCustomerInfoUpdate(customerInfo);

      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Purchase error:', error);
      setSubscriptionState(prev => ({
        ...prev,
        error: error.message || 'Purchase failed',
        isLoading: false
      }));
      return { success: false, error: error.message };
    }
  };

  // Restore purchases
  const restorePurchases = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

      const customerInfo = await Purchases.restorePurchases();
      await handleCustomerInfoUpdate(customerInfo);

      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Restore error:', error);
      setSubscriptionState(prev => ({
        ...prev,
        error: error.message || 'Restore failed',
        isLoading: false
      }));
      return { success: false, error: error.message };
    }
  };

  // Check if feature is available
  const hasFeature = (feature: string): boolean => {
    if (subscriptionState.tier === 'free') {
      return false;
    }
    return true; // All premium features available for premium/pro users
  };

  // Get subscription tier info
  const getSubscriptionTier = (tierId: string): SubscriptionTier | undefined => {
    return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId);
  };

  return {
    ...subscriptionState,
    subscriptionTiers: SUBSCRIPTION_TIERS,
    purchaseSubscription,
    restorePurchases,
    hasFeature,
    getSubscriptionTier,
    refreshSubscription: () => handleCustomerInfoUpdate(subscriptionState as any)
  };
}
