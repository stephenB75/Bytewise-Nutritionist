# iOS Production Environment Configuration

This guide details the environment variables and configuration needed for iOS production builds of ByteWise Nutritionist.

## Critical Environment Variables for iOS

### Server-Side Environment Variables
These are set on your production server (Railway, Heroku, etc.):

```bash
# Database & Authentication
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SESSION_SECRET=your-strong-session-secret

# API Keys
GOOGLE_API_KEY=your-google-gemini-vision-api-key
USDA_API_KEY=your-usda-fdc-api-key

# RevenueCat (Production)
REVENUECAT_WEBHOOK_SECRET=your-revenuecat-webhook-secret

# App Configuration
APP_URL=https://www.bytewisenutritionist.com
NODE_ENV=production
LOG_LEVEL=info
```

### Client-Side Environment Variables (iOS Build)
These are embedded in the iOS app during Capacitor build:

```bash
# Supabase Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Keys (Frontend)
VITE_USDA_API_KEY=your-usda-fdc-api-key
VITE_REVENUECAT_API_KEY=your-revenuecat-public-api-key

# App Configuration
VITE_APP_URL=https://www.bytewisenutritionist.com
```

## iOS-Specific Security Considerations

### 1. ATS (App Transport Security) Compliance
✅ **Fixed**: All HTTP localhost fallbacks replaced with HTTPS production URLs
- Email verification redirects: HTTPS ✅
- Password reset redirects: HTTPS ✅
- Authentication callbacks: HTTPS ✅

### 2. API Key Security
- ✅ Google Gemini Vision API key: Server-side only (secure)
- ✅ Supabase Service Role key: Server-side only (secure)
- ⚠️ RevenueCat Public API key: Client-side (acceptable, designed for client use)
- ⚠️ USDA API key: Client-side (acceptable, public API)

### 3. Environment Variable Setup for iOS Builds

#### Recommended: iOS Build Script
Create a build script that sets environment variables before building:
```bash
#!/bin/bash
# ios-build.sh

export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
export VITE_USDA_API_KEY="your-usda-api-key"
export VITE_REVENUECAT_API_KEY="your-revenuecat-public-key"
export VITE_APP_URL="https://www.bytewisenutritionist.com"

npm run build
npx cap sync ios
npx cap open ios
```

## Critical Production Setup Requirements

### 1. Supabase Dashboard Configuration (REQUIRED)
Before iOS deployment, configure these settings in your Supabase Dashboard:

**Authentication Settings:**
- **Site URL**: Set to your production domain (e.g., `https://www.bytewisenutritionist.com`)
- **Allowed Redirect URLs**: Add these exact URLs:
  - `https://www.bytewisenutritionist.com/api/auth/verify-email`
  - `https://www.bytewisenutritionist.com/reset-password`
  - `https://www.bytewisenutritionist.com` (base URL)

⚠️ **Critical**: Without these redirect URLs, email verification and password reset will fail in production.

## Required iOS Setup Steps

### 1. Xcode Capabilities
Ensure these capabilities are enabled in Xcode:
- ✅ **Push Notifications** (for meal reminders)
- ✅ **In-App Purchases** (for RevenueCat subscriptions)
- ❌ **NOT** Apple Pay (we use StoreKit, not Apple Pay)

### 2. Info.plist Permissions
Current permissions (all essential):
- ✅ `NSCameraUsageDescription` (food photo capture)
- ✅ `NSPhotoLibraryUsageDescription` (select meal photos)  
- ✅ `NSPhotoLibraryAddUsageDescription` (save nutrition reports)

### 3. App.entitlements
Current entitlements (correct):
- ✅ Empty file (capabilities set in Xcode)
- ✅ No hardcoded `aps-environment` (set by provisioning profile)
- ✅ No Apple Pay entitlements (we use StoreKit)

## Environment Validation Checklist

Before iOS App Store submission:

### ✅ Server Environment
- [ ] All HTTPS endpoints verified
- [ ] Database connection working
- [ ] Google Gemini Vision API responding
- [ ] USDA API responding  
- [ ] RevenueCat webhooks configured
- [ ] Session secrets properly set

### ✅ iOS Client Environment  
- [ ] All VITE_ variables embedded in build
- [ ] Supabase connection working
- [ ] API calls using HTTPS
- [ ] RevenueCat subscriptions functional
- [ ] Camera/photo permissions working

### ✅ Production Readiness
- [ ] No HTTP fallbacks in code
- [ ] No localhost references
- [ ] All environment variables documented
- [ ] Backup fallback values in place
- [ ] Error handling for missing variables

## Common Issues & Solutions

### Issue: "Network requests fail on device"
**Solution**: Ensure all API endpoints use HTTPS and environment variables are properly set in the iOS build.

### Issue: "RevenueCat not working"
**Solution**: Verify `VITE_REVENUECAT_API_KEY` is set and In-App Purchases capability is enabled in Xcode.

### Issue: "Authentication redirects fail"
**Solution**: Ensure `VITE_APP_URL` matches your production domain exactly.

### Issue: "Camera not working"
**Solution**: Verify `NSCameraUsageDescription` is in Info.plist and camera permissions are properly requested.