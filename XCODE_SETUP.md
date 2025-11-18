# ByteWise Nutritionist - Xcode Setup Guide

## ✅ Preparation Complete!

Your ByteWise Nutritionist app has been prepared for Xcode. All necessary files have been built and synced.

## Quick Start

### 1. Open in Xcode

```bash
npx cap open ios
```

Or manually:
1. Open Xcode
2. File → Open
3. Navigate to `ios/App/App.xcodeproj`

### 2. Configure Signing & Capabilities

In Xcode, select the **App** target and go to **Signing & Capabilities**:

- **Bundle Identifier**: `com.bytewise.nutritionist`
- **Team**: Select your Apple Developer Team
- **Automatically manage signing**: ✅ Enable this

### 3. Configure Info.plist (Already Done)

The following permissions are already configured:
- ✅ Camera (`NSCameraUsageDescription`)
- ✅ Photo Library (`NSPhotoLibraryUsageDescription`)
- ✅ Photo Library Add (`NSPhotoLibraryAddUsageDescription`)

### 4. Build and Run

1. **Select a Target Device**:
   - Choose a simulator from the device dropdown
   - Or connect a physical iOS device

2. **Build and Run**:
   - Click the **Run** button (▶️) or press `Cmd+R`
   - Wait for the build to complete
   - App will launch on the selected device

### 5. Build for App Store

#### A. Clean Build Folder
- Product → Clean Build Folder (or `Cmd+Shift+K`)

#### B. Select Archive Target
- Select **Any iOS Device (arm64)** from the device dropdown

#### C. Create Archive
- Product → Archive
- Wait for the archive process to complete

#### D. Distribute App
- Window → Organizer (or `Shift+Cmd+O`)
- Select your archive
- Click **Distribute App**
- Choose distribution method:
  - **App Store Connect** (for App Store submission)
  - **Ad Hoc** (for testing)
  - **Development** (for development distribution)

## Project Configuration

### App Details
- **App Name**: ByteWise Nutritionist
- **Bundle ID**: `com.bytewise.nutritionist`
- **Web Directory**: `dist/public`
- **iOS Deployment Target**: iOS 13.0+

### Capacitor Plugins Installed
The following Capacitor plugins are configured:
- ✅ Camera (`@capacitor/camera`)
- ✅ Filesystem (`@capacitor/filesystem`)
- ✅ Haptics (`@capacitor/haptics`)
- ✅ Keyboard (`@capacitor/keyboard`)
- ✅ Local Notifications (`@capacitor/local-notifications`)
- ✅ Push Notifications (`@capacitor/push-notifications`)
- ✅ Splash Screen (`@capacitor/splash-screen`)
- ✅ Status Bar (`@capacitor/status-bar`)
- ✅ RevenueCat (`@revenuecat/purchases-capacitor`)

### Swift Package Manager
The project uses Swift Package Manager (SPM) for dependencies. No CocoaPods required!

## Troubleshooting

### Build Errors

**Error: "No such module 'Capacitor'"**
- Run: `npx cap sync ios`
- Clean build folder in Xcode

**Error: "Signing for "App" requires a development team"**
- Go to Signing & Capabilities
- Select your Apple Developer Team
- Enable "Automatically manage signing"

**Web assets not updating?**
- Run: `npm run build`
- Then: `npx cap sync ios`

### Simulator Issues

**App doesn't load:**
- Check that `dist/public/index.html` exists
- Verify web assets were synced: `npx cap sync ios`
- Check Xcode console for errors

## Updating the App

When you make changes to the web app:

1. **Rebuild the web app:**
   ```bash
   npm run build
   ```

2. **Sync with iOS:**
   ```bash
   npx cap sync ios
   ```

3. **Reopen in Xcode if needed:**
   ```bash
   npx cap open ios
   ```

## App Store Submission Checklist

- [ ] Bundle Identifier set to `com.bytewise.nutritionist`
- [ ] Apple Developer Team selected
- [ ] Signing configured correctly
- [ ] App icons configured (check Assets.xcassets)
- [ ] Splash screen configured
- [ ] Privacy permissions configured in Info.plist
- [ ] Archive created successfully
- [ ] App Store Connect listing prepared
- [ ] Privacy policy URL provided
- [ ] App Store screenshots prepared

## App Store Information

- **App Name**: ByteWise Nutritionist
- **Category**: Health & Fitness
- **Content Rating**: 4+ (ages 4 and up)
- **Language**: English
- **Bundle ID**: `com.bytewise.nutritionist`

## Support

For issues or questions:
- Check the Capacitor documentation: https://capacitorjs.com/docs
- Review the project's `docs/` directory
- Check Xcode console logs for detailed error messages

---

**Last Updated**: After successful `npx cap sync ios`  
**Status**: ✅ Ready for Xcode

