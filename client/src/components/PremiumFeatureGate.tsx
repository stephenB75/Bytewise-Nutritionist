import { useState, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPaywall } from '@/components/SubscriptionPaywall';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Star, Lock, Sparkles } from 'lucide-react';

interface PremiumFeatureGateProps {
  children: ReactNode;
  feature: 'premium' | 'pro';
  featureName: string;
  description?: string;
  className?: string;
  showUpgradePrompt?: boolean;
}

export function PremiumFeatureGate({ 
  children, 
  feature, 
  featureName, 
  description,
  className = "",
  showUpgradePrompt = true 
}: PremiumFeatureGateProps) {
  const { hasFeature, isLoading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  // Show loading state while subscription status is being fetched
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="h-24 w-full"></div>
      </div>
    );
  }

  // If user has the required feature, render the children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // If showUpgradePrompt is false, just return null (feature is hidden)
  if (!showUpgradePrompt) {
    return null;
  }

  // Otherwise, show the upgrade prompt
  return (
    <>
      <Card className={`bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            {feature === 'pro' ? (
              <Crown className="w-8 h-8 text-purple-500 mr-2" />
            ) : (
              <Star className="w-8 h-8 text-amber-500 mr-2" />
            )}
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {feature === 'pro' ? 'Pro' : 'Premium'} Feature
          </h3>
          
          <p className="text-gray-700 mb-2 font-semibold">
            {featureName}
          </p>
          
          {description && (
            <p className="text-gray-600 text-sm mb-4">
              {description}
            </p>
          )}
          
          <Button
            onClick={() => setShowPaywall(true)}
            className={`${
              feature === 'pro' 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-amber-500 hover:bg-amber-600'
            } text-white font-semibold px-6 py-2 rounded-lg transition-colors`}
            data-testid={`button-upgrade-${feature}`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to {feature === 'pro' ? 'Pro' : 'Premium'}
          </Button>
          
          <p className="text-xs text-gray-500 mt-3">
            Unlock this feature with a {feature === 'pro' ? 'Pro' : 'Premium'} subscription
          </p>
        </CardContent>
      </Card>

      <SubscriptionPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={featureName}
      />
    </>
  );
}

export default PremiumFeatureGate;