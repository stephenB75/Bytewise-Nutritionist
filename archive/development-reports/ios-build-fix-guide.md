# iOS Build Error Fix Guide

## 🚨 Main Issue: Missing Pods Directory
The `Pods` directory is not present, which means CocoaPods dependencies haven't been installed.

## Step-by-Step Fix

### 1. Install CocoaPods (if not already installed)
Open Terminal on your Mac and run:
```bash
sudo gem install cocoapods
```

### 2. Install Pod Dependencies
Navigate to the iOS app directory and install pods:
```bash
cd ios/App
pod install
```

This will:
- Download all Capacitor plugin dependencies
- Create the `Pods` directory
- Generate `Pods.xcodeproj`
- Update the workspace configuration

### 3. Open the Correct File in Xcode
**IMPORTANT**: Always open the `.xcworkspace` file, NOT the `.xcodeproj`:
```bash
open App.xcworkspace
```

Or in Finder, double-click `App.xcworkspace` (white icon), not `App.xcodeproj` (blue icon).

### 4. Clean Build Folder
In Xcode:
- Menu: Product → Clean Build Folder (or press Shift+Cmd+K)

### 5. Select Development Team
1. Click on "App" in the project navigator
2. Select "App" target
3. Go to "Signing & Capabilities" tab
4. Select your Apple Developer team from the dropdown

### 6. Build Again
- Press Cmd+B to build

## Common Xcode Errors and Solutions

### Error: "No such module 'Capacitor'"
**Solution**: Run `pod install` and open `.xcworkspace` not `.xcodeproj`

### Error: "Signing for 'App' requires a development team"
**Solution**: 
1. Select the App target
2. In Signing & Capabilities, choose your team
3. Enable "Automatically manage signing"

### Error: "Unable to load contents of file list"
**Solution**: 
```bash
cd ios/App
pod deintegrate
pod install
```

### Error: "Command PhaseScriptExecution failed"
**Solution**: 
1. Check that all node modules are installed:
```bash
npm install
```
2. Then reinstall pods:
```bash
cd ios/App
pod install
```

### Error: "Multiple commands produce..." (duplicate files)
**Solution**: 
1. Clean build folder (Shift+Cmd+K)
2. Delete DerivedData:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```
3. Restart Xcode

### Error: Build fails on M1/M2 Mac
**Solution**: 
```bash
cd ios/App
arch -x86_64 pod install
```

## Verification Checklist
- [ ] CocoaPods installed on your Mac
- [ ] Ran `pod install` in `ios/App` directory
- [ ] `Pods` directory now exists
- [ ] Opening `App.xcworkspace` (not xcodeproj)
- [ ] Development team selected in Signing
- [ ] Clean build folder performed

## Need More Help?
If errors persist after these steps:
1. Copy the specific error messages from Xcode
2. Share them so I can provide targeted solutions

The most common issue is simply not running `pod install` - this single step usually fixes 90% of build errors!