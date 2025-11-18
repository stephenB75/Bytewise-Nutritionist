import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Crown, Sparkles, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Optional: specify which feature triggered the paywall
}

export function SubscriptionPaywall({ isOpen, onClose, feature }: SubscriptionPaywallProps) {
  const { offerings, purchaseSubscription, restorePurchases, isLoading } = useSubscription();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (productId: string) => {
    try {
      setIsPurchasing(true);
      const success = await purchaseSubscription(productId);
      
      if (success) {
        toast({
          title: "🎉 Welcome to Premium!",
          description: "Your subscription is now active. Enjoy all premium features!",
          duration: 5000,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "❌ Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const status = await restorePurchases();
      
      if (status.isActive) {
        toast({
          title: "✅ Purchases Restored",
          description: "Your subscription has been restored successfully!",
        });
        onClose();
      } else {
        toast({
          title: "ℹ️ No Active Subscriptions",
          description: "No active subscriptions found to restore.",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Restore Failed",
        description: error instanceof Error ? error.message : "Failed to restore purchases.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const premiumFeatures = [
    { icon: Sparkles, text: "Unlimited AI food photo analysis", highlight: true },
    { icon: Star, text: "Advanced nutrition insights & micronutrient tracking" },
    { icon: CheckCircle, text: "Detailed PDF nutrition reports" },
    { icon: Crown, text: "Custom nutrition goals & recommendations" },
    { icon: CheckCircle, text: "Priority customer support" },
    { icon: Star, text: "Ad-free experience" }
  ];

  const proFeatures = [
    { icon: Crown, text: "All Premium features included", highlight: true },
    { icon: Sparkles, text: "AI meal planning & recipe suggestions" },
    { icon: Star, text: "Advanced analytics & trend insights" },
    { icon: CheckCircle, text: "Export data to popular fitness apps" },
    { icon: Crown, text: "Early access to new features" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-amber-200/50"
            data-testid="button-close-paywall"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-center py-4">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-amber-600 mr-2" />
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Unlock Premium Features
              </DialogTitle>
            </div>
            
            {feature && (
              <DialogDescription className="text-lg text-gray-700">
                You need a premium subscription to access <span className="font-semibold text-amber-700">{feature}</span>
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Plans */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Premium Plan */}
            <Card className="relative bg-white/80 border-2 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1">
                Most Popular
              </Badge>
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-amber-500 mr-2" />
                  <CardTitle className="text-2xl font-bold text-gray-900">Premium</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Perfect for nutrition enthusiasts
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$9.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <feature.icon className={`w-5 h-5 mr-3 ${feature.highlight ? 'text-amber-500' : 'text-green-500'}`} />
                      <span className={`text-sm ${feature.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handlePurchase('premium_monthly')}
                  disabled={isPurchasing || isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  data-testid="button-purchase-premium"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Premium'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative bg-white/80 border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="w-6 h-6 text-purple-500 mr-2" />
                  <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  For serious nutrition professionals
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$19.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <feature.icon className={`w-5 h-5 mr-3 ${feature.highlight ? 'text-purple-500' : 'text-green-500'}`} />
                      <span className={`text-sm ${feature.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handlePurchase('pro_monthly')}
                  disabled={isPurchasing || isLoading}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  data-testid="button-purchase-pro"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Pro'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Annual Plans Notice */}
          <div className="text-center bg-amber-100/50 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-gray-700">
              <Sparkles className="w-4 h-4 inline mr-1 text-amber-500" />
              <strong>Save 30%</strong> with annual plans available in the App Store
            </p>
          </div>

          {/* Restore Purchases */}
          <div className="flex justify-center pt-4 border-t border-amber-200">
            <Button
              variant="ghost"
              onClick={handleRestore}
              disabled={isRestoring}
              className="text-gray-600 hover:text-gray-800 hover:bg-amber-100"
              data-testid="button-restore-purchases"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                'Restore Purchases'
              )}
            </Button>
          </div>

          {/* Terms & Privacy */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.</p>
            <p>Payment will be charged to your Apple ID account at confirmation of purchase.</p>
            <div className="flex justify-center space-x-4 mt-2">
              <button className="underline hover:text-gray-700" data-testid="link-terms">Terms of Service</button>
              <button className="underline hover:text-gray-700" data-testid="link-privacy">Privacy Policy</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionPaywall;