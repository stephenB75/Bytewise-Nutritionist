# iOS Build Guide for ByteWise Nutritionist
## Fixed Workspace Issue ✅

### Problem Solved
The App.xcworkspace was missing its contents.xcworkspacedata file. This has been fixed and Xcode should now properly recognize the workspace.

## Step-by-Step Build Instructions

### 1. Prerequisites (on macOS)
- **Xcode**: Version 14.0 or higher
- **CocoaPods**: Install with `sudo gem install cocoapods` if not already installed
- **Apple Developer Account**: For device testing and App Store distribution

### 2. Important: Open the RIGHT File in Xcode

⚠️ **CRITICAL**: You must open the `.xcworkspace` file, NOT the `.xcodeproj` file!

```bash
# CORRECT - Open this:
ios/App/App.xcworkspace

# WRONG - Do NOT open this:
ios/App/App.xcodeproj
```

### 3. Build Steps

#### Option A: Using the Build Script (Recommended)
```bash
# On macOS, run:
./ios-build.sh
```
This script will:
- Sync Capacitor
- Install CocoaPods dependencies
- Open Xcode with the workspace

#### Option B: Manual Build Process

1. **Sync Capacitor** (if you've made changes):
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **Install CocoaPods**:
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

3. **Open in Xcode**:
   ```bash
   open ios/App/App.xcworkspace
   ```
   Or manually: File → Open → Navigate to `ios/App/` → Select `App.xcworkspace`

### 4. Configure in Xcode

Once Xcode opens with the workspace:

1. **Select the App Target**:
   - In the navigator, click on "App" at the top
   - Make sure "App" target is selected (not Pods)

2. **Configure Signing**:
   - Go to "Signing & Capabilities" tab
   - Check "Automatically manage signing"
   - Select your Team from the dropdown
   - Bundle Identifier should be: `com.bytewise.nutritionist`

3. **Select Build Destination**:
   - Top toolbar: Next to the play button
   - Choose either:
     - A simulator (e.g., "iPhone 15 Pro")
     - Your connected device (if developer mode enabled)
     - "Generic iOS Device" (for archive/distribution)

### 5. Build and Run

#### For Development Testing:
1. Select a simulator or connected device
2. Click the Play button (▶️) or press `Cmd+R`
3. Wait for build to complete
4. App will launch on selected device/simulator

#### For App Store Distribution:
1. Select "Generic iOS Device" as destination
2. Menu: Product → Archive
3. Wait for archive to complete
4. Window → Organizer will open
5. Select your archive → "Distribute App"
6. Follow App Store Connect upload wizard

### 6. Common Issues and Solutions

#### Issue: "No such module 'Capacitor'"
**Solution**: You opened the .xcodeproj instead of .xcworkspace. Close and open App.xcworkspace.

#### Issue: "Signing for 'App' requires a development team"
**Solution**: Select your Apple Developer team in Signing & Capabilities.

#### Issue: Build fails with pod errors
**Solution**: 
```bash
cd ios/App
pod deintegrate
pod install
```

#### Issue: "Could not find workspace"
**Solution**: The workspace file has been fixed. Make sure you're opening:
`ios/App/App.xcworkspace`

### 7. Deployment Checklist

Before submitting to App Store:

- [ ] Increment version number in Xcode
- [ ] Update app screenshots in App Store Connect
- [ ] Test on real device
- [ ] Archive with "Generic iOS Device" selected
- [ ] Validate archive before upload
- [ ] Submit for review with release notes

## Quick Commands Reference

```bash
# Full rebuild from scratch
npm run build && npx cap sync ios && cd ios/App && pod install && cd ../..

# Open in Xcode (correct way)
open ios/App/App.xcworkspace

# Clean build folders
rm -rf ios/App/build
rm -rf ~/Library/Developer/Xcode/DerivedData

# Check pod version
pod --version
```

## Success! 🎉
The workspace issue has been resolved. Xcode should now properly recognize and open your iOS project. Remember: always use the `.xcworkspace` file when working with CocoaPods!