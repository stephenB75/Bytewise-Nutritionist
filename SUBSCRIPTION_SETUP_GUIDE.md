# ByteWise Nutritionist - Subscription Setup Guide

## 🎯 Overview

Your ByteWise Nutritionist app now has a complete subscription system integrated! This guide will help you configure and activate the payment features.

## 📱 What's Been Added

### ✅ Frontend Components Created
- **`useSubscription` Hook** - Manages subscription state and RevenueCat integration
- **`PremiumFeatureGate` Component** - Restricts premium features with upgrade prompts
- **`SubscriptionManager` Component** - Full subscription management UI
- **Profile Integration** - Subscription section added to profile page

### ✅ Features Implemented
- Subscription status display
- Premium feature gating
- Upgrade flow with pricing tiers
- Purchase and restore functionality
- Cross-device subscription sync

## 🔧 Configuration Required

### 1. RevenueCat Setup

1. **Create RevenueCat Account**:
   - Go to [https://app.revenuecat.com/](https://app.revenuecat.com/)
   - Sign up for a free account
   - Create a new project for ByteWise Nutritionist

2. **Get API Key**:
   - Copy your RevenueCat API key
   - Add it to your environment variables

3. **Configure Products**:
   - Create these products in RevenueCat:
     - `premium_monthly` - $9.99/month
     - `premium_annual` - $79.99/year

### 2. Environment Variables

Create a `.env` file in the `client` directory:

```bash
# RevenueCat Configuration
REACT_APP_REVENUECAT_API_KEY=your_revenuecat_api_key_here

# Stripe Configuration (for web payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Backend API URL
REACT_APP_API_URL=http://localhost:5000
```

### 3. App Store Connect Setup

1. **Create In-App Purchases**:
   - Go to App Store Connect
   - Navigate to your app → Features → In-App Purchases
   - Create Auto-Renewable Subscriptions:
     - `premium_monthly` - $9.99/month
     - `premium_annual` - $79.99/year

2. **Configure RevenueCat**:
   - Link your App Store Connect products to RevenueCat
   - Set up entitlements: `premium` and `pro`

## 🚀 How to Use

### For Users

1. **View Subscription Status**:
   - Go to Profile page
   - Click on "Subscription" section
   - See current plan and status

2. **Upgrade to Premium**:
   - Click "Upgrade to Premium" button
   - Choose monthly or annual plan
   - Complete purchase through App Store

3. **Restore Purchases**:
   - Use "Restore Purchases" button
   - Sync subscription across devices

### For Developers

1. **Gate Premium Features**:
   ```tsx
   import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
   
   <PremiumFeatureGate
     feature="AI Food Recognition"
     description="Unlimited AI-powered food analysis"
   >
     <YourPremiumComponent />
   </PremiumFeatureGate>
   ```

2. **Check Subscription Status**:
   ```tsx
   import { useSubscription } from '@/hooks/useSubscription';
   
   const { isPremium, tier, status } = useSubscription();
   ```

## 💰 Subscription Tiers

### Free Plan
- Basic food logging
- Limited AI analyses (10/month)
- 1 PDF export per week
- 5 recipes max
- Standard support

### Premium Monthly - $9.99/month
- Unlimited AI food recognition
- Unlimited PDF exports
- Advanced analytics & trends
- Unlimited recipe management
- Priority support
- Ad-free experience

### Premium Annual - $79.99/year
- Everything in Premium Monthly
- Save 33% vs monthly
- Best value for serious users
- Early access to new features

## 🔒 Security Features

- **RevenueCat Integration** - Secure subscription management
- **Backend Validation** - Server-side subscription verification
- **Webhook Handling** - Real-time subscription updates
- **Cross-Device Sync** - Seamless experience across devices

## 🎨 UI/UX Features

- **Modern Design** - Consistent with app's amber/yellow theme
- **Smooth Animations** - Professional upgrade flow
- **Clear Pricing** - Transparent subscription tiers
- **Status Indicators** - Clear subscription status display
- **Feature Comparison** - Side-by-side plan comparison

## 🚨 Important Notes

1. **Testing**: Use RevenueCat sandbox for testing
2. **App Store Review**: Ensure compliance with Apple's guidelines
3. **Backend Sync**: Subscription changes sync with your database
4. **Error Handling**: Graceful fallbacks for network issues

## 📞 Support

If you need help with setup:
1. Check RevenueCat documentation
2. Review App Store Connect guidelines
3. Test thoroughly in sandbox mode
4. Monitor subscription analytics

Your ByteWise Nutritionist app is now ready for premium subscriptions! 🎉
