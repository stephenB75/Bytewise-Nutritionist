/**
 * Premium Feature Gate Component
 * Shows upgrade prompt for premium features
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Sparkles, Check } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumFeatureGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  className?: string;
  showUpgradeModal?: boolean;
}

export function PremiumFeatureGate({ 
  children, 
  feature, 
  description, 
  className = '',
  showUpgradeModal = true 
}: PremiumFeatureGateProps) {
  const { isPremium, isLoading, subscriptionTiers, purchaseSubscription } = useSubscription();
  const [showModal, setShowModal] = React.useState(false);

  // If user is premium, show the feature
  if (isPremium) {
    return <>{children}</>;
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade prompt
  const handleUpgradeClick = () => {
    if (showUpgradeModal) {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Blurred feature content */}
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        
        {/* Overlay with upgrade prompt */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50/90 to-yellow-50/90 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <div className="mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Premium Feature</h3>
              <p className="text-sm text-gray-600 mb-3">
                {description || `${feature} is available with Premium`}
              </p>
            </div>
            
            <Button 
              onClick={handleUpgradeClick}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Crown className="w-7 h-7 text-amber-500" />
                Upgrade to Premium
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Feature description */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  {feature}
                </h3>
                <p className="text-gray-700">
                  {description || `Unlock ${feature} and many more premium features with a ByteWise Premium subscription.`}
                </p>
              </div>

              {/* Subscription tiers */}
              <div className="grid md:grid-cols-2 gap-4">
                {subscriptionTiers.map((tier) => (
                  <Card 
                    key={tier.id} 
                    className={`relative ${tier.isPopular ? 'ring-2 ring-amber-500 shadow-lg' : ''}`}
                  >
                    {tier.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="text-3xl font-bold text-gray-900">
                        {tier.price}
                        <span className="text-lg font-normal text-gray-500">/{tier.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        onClick={() => purchaseSubscription(tier.productId)}
                        className={`w-full ${
                          tier.isPopular 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' 
                            : 'bg-gray-900 hover:bg-gray-800'
                        } text-white font-medium py-2`}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Choose {tier.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional benefits */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Premium Benefits
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Unlimited AI food recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Advanced analytics & trends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Priority customer support</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Unlimited PDF exports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ad-free experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Cross-device sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
