# ByteWise iOS App Deployment Guide

## Overview
This guide covers deploying ByteWise as a native iOS app using modern web-to-native technologies. The app maintains all web functionality while providing native iOS integration.

## Prerequisites

### Development Environment
- macOS with Xcode 15.0+
- iOS Simulator or physical iOS device (iOS 14.0+)
- Apple Developer Account (for App Store deployment)
- Node.js 18+ and npm

### Tools Installation
```bash
# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Install Ionic CLI (optional, for additional tools)
npm install -g @ionic/cli

# Install CocoaPods (for iOS dependencies)
sudo gem install cocoapods
```

## Setup Process

### 1. Initialize Capacitor
```bash
# In your project root
npm install @capacitor/core @capacitor/ios @capacitor/cli

# Initialize Capacitor
npx cap init "ByteWise Nutritionist" "com.bytewise.nutritionist" --web-dir=dist

# Add iOS platform
npx cap add ios
```

### 2. Configure App Settings
Copy the configuration from `ios-config.json` to your `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bytewise.nutritionist',
  appName: 'ByteWise Nutritionist',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#fef7cd',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#fef7cd',
      showSpinner: true,
      spinnerColor: '#a8dadc'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#a8dadc'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#a8dadc'
    }
  }
};

export default config;
```

### 3. Generate App Icons
```bash
cd public/icons
chmod +x generate-icons.sh
./generate-icons.sh
```

Place your 1024x1024 base icon as `icon-base-1024.png` before running the script.

### 4. Build and Sync
```bash
# Build your web app
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## iOS-Specific Configuration

### Info.plist Settings
Add these permissions to your iOS app's Info.plist:

```xml
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to scan food barcodes for nutrition tracking</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app accesses photos to attach meal images to your nutrition log</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses location to find nearby restaurants and suggest local nutrition options</string>

<key>NSUserNotificationsUsageDescription</key>
<string>This app sends notifications to remind you about meal logging and nutrition goals</string>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.bytewise.nutritionist</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>bytewise</string>
    </array>
  </dict>
</array>
```

### App Icons Setup
In Xcode:
1. Navigate to your project → Target → General
2. Scroll to "App Icons and Launch Images"
3. Click on "App Icon Source" → "AppIcon"
4. Drag and drop the generated icons to their respective slots

### Launch Screen
Create a launch screen that matches your app's theme:
1. Open `LaunchScreen.storyboard` in Xcode
2. Set background color to `#fef7cd`
3. Add your logo and "ByteWise" text
4. Use system font with color `#a8dadc`

## Native Features Integration

### Push Notifications
```bash
npm install @capacitor/push-notifications
npx cap sync ios
```

Add to your main app file:
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Register for push notifications
await PushNotifications.requestPermissions();
await PushNotifications.register();
```

### Local Notifications (Meal Reminders)
```bash
npm install @capacitor/local-notifications
npx cap sync ios
```

### Camera/Photo Access
```bash
npm install @capacitor/camera
npx cap sync ios
```

### Haptic Feedback
```bash
npm install @capacitor/haptics
npx cap sync ios
```

## Testing

### iOS Simulator
```bash
# Build and run in simulator
npm run build
npx cap sync ios
npx cap run ios
```

### Physical Device
1. Connect iOS device via USB
2. In Xcode, select your device from the scheme selector
3. Ensure your device is registered in your Apple Developer account
4. Build and run (⌘+R)

## App Store Preparation

### 1. App Store Connect Setup
- Create new app in App Store Connect
- App ID: `com.bytewise.nutritionist`
- Category: Medical or Health & Fitness
- Age Rating: 4+ (appropriate for all ages)

### 2. Screenshots Required
- iPhone 6.7" (1290 x 2796): 3-10 screenshots
- iPhone 6.5" (1284 x 2778): 3-10 screenshots  
- iPhone 5.5" (1242 x 2208): 3-10 screenshots
- iPad Pro 12.9" (2048 x 2732): 3-10 screenshots

### 3. App Store Metadata
```
Title: ByteWise Nutritionist
Subtitle: Professional Nutrition Tracking
Keywords: nutrition, diet, calories, health, meal planning, USDA, fitness
Description: Track your nutrition with professional-grade tools...
```

### 4. Build for Distribution
In Xcode:
1. Select "Any iOS Device" scheme
2. Product → Archive
3. Upload to App Store Connect
4. Submit for review

## Deployment Checklist

- [ ] App icons generated and added to Xcode project
- [ ] Launch screen configured with brand colors
- [ ] Info.plist permissions added
- [ ] Push notification certificates configured
- [ ] App tested on physical iOS device
- [ ] App Store screenshots captured
- [ ] App Store Connect metadata completed
- [ ] Privacy policy URL added
- [ ] App reviewed and approved by Apple

## Maintenance

### Updates
```bash
# After making web app changes
npm run build
npx cap sync ios

# Update version in Xcode
# Build → Archive → Upload to App Store
```

### Analytics
Consider integrating:
- Firebase Analytics
- Apple App Analytics
- Crashlytics for error reporting

## Support

For issues with:
- **Capacitor**: https://capacitorjs.com/docs
- **iOS Development**: https://developer.apple.com/documentation
- **App Store Review**: https://developer.apple.com/app-store/review/guidelines

## Security Considerations

- Enable App Transport Security (ATS)
- Use HTTPS for all API endpoints
- Implement certificate pinning for production
- Enable keychain storage for sensitive data
- Follow iOS security best practices

---

**Note**: This deployment process converts your PWA into a native iOS app while maintaining all web functionality. The app will have native iOS integration and can be distributed through the App Store.