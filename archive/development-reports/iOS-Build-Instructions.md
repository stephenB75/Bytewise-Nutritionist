# ByteWise Nutritionist - iOS IPA Build Instructions

## Prerequisites ✅

- **Mac with Xcode 15+** installed
- **Apple Developer Account** (individual or organization)
- **iOS 17+ device or simulator** for testing

## Project Status ✅

✅ **Production build completed** (`npm run build`)  
✅ **Debug code removed** (console.logs, test files)  
✅ **Capacitor iOS platform synced** (`npx cap sync ios`)  
✅ **8 Capacitor plugins configured** (Camera, Filesystem, Haptics, etc.)  
✅ **App Store optimized settings** applied  

## Build Steps for Xcode

### 1. Download Project Files
```bash
# Download the entire project to your Mac
# Ensure you have the /ios folder and all configuration files
```

### 2. Open in Xcode
```bash
# Navigate to the ios directory
cd ios

# Open the Xcode workspace
open App/App.xcworkspace
```

### 3. Configure Code Signing
- Select **App** target in Xcode
- Go to **Signing & Capabilities**
- Select your **Team** (Apple Developer Account)
- Ensure **Bundle Identifier** matches: `com.bytewise.nutritionist`
- Enable **Automatically manage signing**

### 4. Update App Information
- In **General** tab, verify:
  - **Display Name**: ByteWise Nutritionist
  - **Version**: 1.0.0
  - **Build**: 1
  - **Minimum Deployments**: iOS 17.0

### 5. Build for Release
```bash
# Clean build folder
Product → Clean Build Folder

# Archive for distribution
Product → Archive

# OR use command line:
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive -archivePath ByteWise.xcarchive
```

### 6. Export IPA
- In **Organizer** window (appears after archive)
- Select **Distribute App**
- Choose **App Store Connect** or **Ad Hoc** for testing
- Follow export wizard to generate `.ipa` file

## App Store Deployment

### App Information
- **App Name**: ByteWise Nutritionist
- **Bundle ID**: com.bytewise.nutritionist
- **Primary Category**: Health & Fitness
- **Secondary Category**: Food & Drink

### Privacy Permissions
The app requests these permissions (already configured):
- **Camera**: "ByteWise uses the camera to photograph meals for accurate nutrition tracking and food recognition."
- **Photo Library**: "ByteWise accesses your photo library to select meal images for nutrition logging and analysis."
- **File Storage**: "ByteWise uses device storage to save meal photos, export nutrition reports, and cache data for offline use."

### Features Highlights
- 📊 Comprehensive nutrition tracking
- 🥗 USDA database integration (90%+ food accuracy)
- 🏆 Achievement system with meal-based unlocking
- 📱 Native iOS features (camera, haptics, notifications)
- 🔄 PWA capabilities with offline functionality
- 📄 PDF export for nutrition reports
- ⚡ Real-time micronutrient tracking
- 🕐 Intermittent fasting tracker

## Troubleshooting

### Common Issues:
1. **CocoaPods not found**: Install with `sudo gem install cocoapods`
2. **Signing errors**: Ensure Apple Developer Account is active
3. **Build errors**: Clean build folder and retry
4. **Plugin issues**: Run `npx cap sync ios` again

### Performance Optimization:
- App optimized for iOS 17+
- Removed all debug code and logging
- Compressed assets for faster loading
- Service Worker configured for offline functionality

## Deployment Checklist ✅

- [x] Production build completed
- [x] Debug code removed
- [x] Capacitor iOS synced
- [x] App Store permissions configured
- [x] Bundle identifier set
- [x] iOS-specific optimizations applied
- [x] PWA manifest configured
- [x] Service Worker production-ready

## Next Steps

1. **Download project** to Mac with Xcode
2. **Open ios/App/App.xcworkspace** in Xcode
3. **Configure code signing** with your Apple Developer Account
4. **Archive and export** the IPA file
5. **Upload to App Store Connect** for distribution

The app is now production-ready for iOS deployment! 🚀