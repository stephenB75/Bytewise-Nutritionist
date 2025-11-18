import { useState, useEffect, useCallback } from 'react';
import { subscriptionService, SubscriptionStatus, SubscriptionOffering } from '@/services/subscriptionService';
import { useAuth } from '@/hooks/useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    tier: 'free',
    willRenew: false,
    isInGracePeriod: false
  });
  const [offerings, setOfferings] = useState<SubscriptionOffering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat when user is available
  useEffect(() => {
    if (user) {
      initializeSubscription();
    }
  }, [user]);

  const initializeSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize RevenueCat with user ID
      await subscriptionService.initialize(user?.id);
      
      // Load subscription status and offerings
      const [status, availableOfferings] = await Promise.all([
        subscriptionService.getSubscriptionStatus(),
        subscriptionService.loadOfferings()
      ]);

      setSubscriptionStatus(status);
      setOfferings(availableOfferings);

      console.log('🔄 Subscription initialized:', { status, offerings: availableOfferings });

    } catch (err) {
      console.error('❌ Failed to initialize subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize subscription');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      return status;
    } catch (err) {
      console.error('❌ Failed to refresh subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription');
      return subscriptionStatus;
    }
  }, [subscriptionStatus]);

  const purchaseSubscription = useCallback(async (productId: string) => {
    try {
      setError(null);
      const success = await subscriptionService.purchaseSubscription(productId);
      
      if (success) {
        // Refresh status after successful purchase
        await refreshSubscriptionStatus();
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      return false;
    }
  }, [refreshSubscriptionStatus]);

  const restorePurchases = useCallback(async () => {
    try {
      setError(null);
      const status = await subscriptionService.restorePurchases();
      setSubscriptionStatus(status);
      return status;
    } catch (err) {
      console.error('❌ Restore failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
      return subscriptionStatus;
    }
  }, [subscriptionStatus]);

  // Convenience functions for checking subscription status
  const isPremium = subscriptionStatus.isActive && (subscriptionStatus.tier === 'premium' || subscriptionStatus.tier === 'pro');
  const isPro = subscriptionStatus.isActive && subscriptionStatus.tier === 'pro';
  const isFree = !subscriptionStatus.isActive || subscriptionStatus.tier === 'free';

  return {
    // Status
    subscriptionStatus,
    isPremium,
    isPro,
    isFree,
    isLoading,
    error,
    
    // Data
    offerings,
    
    // Actions
    refreshSubscriptionStatus,
    purchaseSubscription,
    restorePurchases,
    initializeSubscription,
    
    // Helper functions
    hasFeature: (feature: 'premium' | 'pro') => {
      if (feature === 'premium') return isPremium;
      if (feature === 'pro') return isPro;
      return false;
    }
  };
}