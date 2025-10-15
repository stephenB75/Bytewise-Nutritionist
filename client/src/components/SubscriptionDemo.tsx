/**
 * Subscription Demo Component
 * Shows how to use the subscription system in your app
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Lock, CheckCircle, XCircle } from 'lucide-react';

export function SubscriptionDemo() {
  const { isPremium, tier, status, isLoading } = useSubscription();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Subscription System Demo
          </CardTitle>
          <CardDescription>
            See how the subscription system works in your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
              ) : isPremium ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Current Plan: {tier}</p>
                <p className="text-sm text-gray-600">Status: {status}</p>
              </div>
            </div>
            <Badge className={isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {isPremium ? 'Premium Active' : 'Free Plan'}
            </Badge>
          </div>

          {/* Feature Examples */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Premium Feature Examples</h3>
            
            {/* Example 1: AI Food Recognition */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">AI Food Recognition</h4>
              <PremiumFeatureGate
                feature="AI Food Recognition"
                description="Take a photo of your food and get instant nutrition analysis"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    This feature would be available with Premium
                  </p>
                </div>
              </PremiumFeatureGate>
            </div>

            {/* Example 2: Advanced Analytics */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Advanced Analytics</h4>
              <PremiumFeatureGate
                feature="Advanced Analytics"
                description="Get detailed insights into your nutrition trends and patterns"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    This feature would be available with Premium
                  </p>
                </div>
              </PremiumFeatureGate>
            </div>

            {/* Example 3: PDF Export */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">PDF Export</h4>
              <PremiumFeatureGate
                feature="PDF Export"
                description="Export your nutrition data as professional PDF reports"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    This feature would be available with Premium
                  </p>
                </div>
              </PremiumFeatureGate>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">How to Test</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Configure RevenueCat API key in environment variables</li>
              <li>• Set up products in App Store Connect</li>
              <li>• Test purchases in sandbox mode</li>
              <li>• Check subscription status in Profile page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
