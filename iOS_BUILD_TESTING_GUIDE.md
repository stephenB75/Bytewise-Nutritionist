# iOS Build and Testing Guide

## Overview
The AI Food Analyzer app is fully configured and ready for iOS building and testing. All Capacitor plugins are properly configured, and the project structure is prepared for Xcode.

## Prerequisites
- **macOS** with Xcode 15+ installed
- **iOS device** or simulator for testing
- **Apple Developer Account** for device testing and App Store submission

## Build Process

### 1. Build and Sync Project
```bash
# Navigate to project directory
cd ai-food-analyzer

# Build the frontend application
npm run build

# Sync iOS project with latest build and plugins (from repo root)
npx cap sync ios

# Open iOS project in Xcode
npx cap open ios
```

**⚠️ Critical**: 
- Always run `npm run build` followed by `npx cap sync ios` before opening Xcode
- Run commands from the **repository root** directory
- Verify build assets are copied from `dist/public/` (CLI log may misleadingly show 'public')
- Use `sync` (not `copy`) to ensure plugins and web assets are both updated

### 2. Configure Build Settings
- **Team**: Select your Apple Developer Team
- **Bundle Identifier**: Ensure it matches your App Store Connect app
- **Deployment Target**: iOS 13.0+ (as configured in capacitor.config.ts)
- **Signing**: Enable "Automatically manage signing"

### 3. Enable Required Capabilities

**Essential for App Functionality:**

#### Push Notifications
1. Select your target in Xcode
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability** → **Push Notifications**
4. Ensure **Remote notifications** background mode is enabled

#### In-App Purchase (RevenueCat)
1. Click **+ Capability** → **In-App Purchase**
2. Configure StoreKit testing:
   - Product → Scheme → Edit Scheme → Options → StoreKit Configuration
   - Create a `.storekit` configuration file for testing

#### Background Modes
1. Click **+ Capability** → **Background Modes**
2. Enable:
   - **Remote notifications** (for push notifications)
   - **Background fetch** (if app needs background data updates)

#### APNs Setup (Required for Push Notifications)
1. **Apple Developer Portal**:
   - Create APNs key (.p8 file)
   - Note Key ID and Team ID
2. **Configure in your notification service**:
   - Upload .p8 key
   - Configure Key ID and Team ID
3. **Test Configuration**:
   - Use device token from test device
   - Send test notification

### 4. Build Configuration
- **Configuration**: Use "Release" for final testing and distribution
- **Destination**: Select connected iOS device or simulator
- **Build**: ⌘+B to build the project

**Build Troubleshooting:**
- If build fails, clean build folder: Product → Clean Build Folder
- Verify all capabilities are properly configured
- Check that Bundle ID matches your developer account

**⚠️ Asset Verification:**
Before building in Xcode, verify current web assets:
```bash
# Check that index.html exists with current build fingerprints
ls -la ios/App/App/public/index.html
grep 'index-.*\.(js\|css)' ios/App/App/public/index.html
```
Ensure timestamps match your recent build and fingerprints are current.

## Testing Checklist

### 🔧 Core App Functions
- [ ] **App Launch**: Verify app starts without crashes
- [ ] **Authentication**: Test email/password sign-in/sign-up
- [ ] **UI Navigation**: Check all screens and navigation flows
- [ ] **Theme**: Verify light/dark mode switching works

### 📸 Camera & Photo Upload
- [ ] **Camera Permission**: Verify camera access prompt appears
- [ ] **Photo Capture**: Test taking photos with device camera
- [ ] **Photo Selection**: Test selecting from photo library
- [ ] **Upload Process**: Verify photos upload to Supabase Storage
- [ ] **Error Handling**: Test network failures and permission denials

### 🤖 AI Analysis Features
- [ ] **Food Recognition**: Upload food photos and verify AI analysis
- [ ] **Nutrition Display**: Check nutritional information appears correctly
- [ ] **USDA Integration**: Verify food database lookups work
- [ ] **Response Handling**: Test various food types and edge cases

### 🔔 Notifications
- [ ] **Permission Prompt**: Verify notification permission request
- [ ] **Local Notifications**: Test meal reminder notifications
- [ ] **Badge Updates**: Check app icon badge behavior

### 💰 Subscription Features (RevenueCat)
- [ ] **Purchase Flow**: Test subscription purchase process
- [ ] **Receipt Validation**: Verify purchase validation works
- [ ] **Feature Gating**: Check premium features are properly gated
- [ ] **Restoration**: Test restoring previous purchases

### 🌐 Network & Offline Behavior
- [ ] **Online Mode**: Test with good internet connection
- [ ] **Poor Connection**: Test with slow/intermittent connectivity
- [ ] **Offline Mode**: Verify appropriate error messages
- [ ] **Background Behavior**: Test app backgrounding/foregrounding

### 🔐 Security & Privacy
- [ ] **OAuth Hidden**: Verify NO Google/GitHub buttons appear on iOS
- [ ] **Email Auth Only**: Confirm only email/password authentication visible
- [ ] **Data Encryption**: Verify sensitive data is encrypted
- [ ] **Privacy Manifest**: Check privacy declarations are accurate

## Device-Specific Testing

### iPhone Testing
- [ ] **Various Screen Sizes**: Test on different iPhone models
- [ ] **Safe Areas**: Verify UI adapts to notches/dynamic island
- [ ] **Orientation**: Test portrait/landscape if supported
- [ ] **Accessibility**: Test with VoiceOver and larger text sizes

### Performance Testing
- [ ] **App Launch Time**: Measure cold start performance
- [ ] **Memory Usage**: Monitor memory consumption during AI analysis
- [ ] **Battery Impact**: Check battery usage during intensive operations
- [ ] **Storage**: Verify app doesn't consume excessive storage

## Common Issues & Solutions

### Build Issues
- **Provisioning Profile**: Ensure correct team and certificates
- **Bundle ID Conflicts**: Verify unique bundle identifier
- **Plugin Compatibility**: Check all Capacitor plugins are iOS compatible

### Runtime Issues
- **Permission Denials**: Test graceful handling of denied permissions
- **Network Errors**: Verify appropriate error messages
- **AI Service Failures**: Test fallback behavior for API failures

### App Store Compliance
- **OAuth Compliance**: ✅ Third-party OAuth hidden on iOS
- **Privacy Labels**: Ensure App Store privacy nutrition label is accurate
- **Age Rating**: Verify appropriate content rating
- **Guideline Compliance**: Review against App Store Review Guidelines

## Performance Benchmarks

### Expected Performance
- **App Launch**: < 3 seconds cold start
- **Camera Capture**: Near-instant photo capture
- **AI Analysis**: 3-10 seconds depending on image complexity
- **Upload Time**: 1-5 seconds for typical food photos

### Memory Usage
- **Idle**: < 50MB
- **During AI Analysis**: < 150MB
- **Photo Processing**: < 200MB peak

## Pre-Submission Checklist

### Technical Requirements
- [ ] **iOS Version Support**: Minimum iOS 13.0+
- [ ] **Device Compatibility**: iPhone 8+ recommended
- [ ] **Performance**: No memory leaks or excessive CPU usage
- [ ] **Accessibility**: VoiceOver support implemented

### App Store Requirements
- [ ] **Metadata**: App description, keywords, screenshots prepared
- [ ] **Privacy Policy**: Updated privacy policy accessible
- [ ] **Age Rating**: Appropriate content rating selected
- [ ] **Review Guidelines**: Compliance with all App Store guidelines

### Business Requirements
- [ ] **Subscription Setup**: RevenueCat products configured
- [ ] **Analytics**: Tracking events implemented
- [ ] **Crash Reporting**: Error monitoring configured
- [ ] **Support**: Customer support contact information provided

## Next Steps After Testing

1. **Address Issues**: Fix any bugs or performance issues found
2. **App Store Connect**: Prepare app listing and metadata
3. **TestFlight**: Distribute beta version for additional testing
4. **Submission**: Submit to App Store for review

## Support Contacts

- **Development Issues**: Contact development team
- **App Store Process**: Apple Developer Support
- **RevenueCat Issues**: RevenueCat support documentation

## Environment Configuration

All required environment variables are documented in `iOS_ENVIRONMENT_GUIDE.md`. Ensure all production credentials are configured before building.

---

**Status**: iOS project is fully configured and ready for Xcode building and device testing.