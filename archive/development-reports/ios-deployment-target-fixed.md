# ✅ iOS Deployment Target Fixed

## What was fixed:
- Updated Podfile: iOS 13.0 → iOS 14.0
- Updated Xcode project: iOS 13.0 → iOS 14.0
- All deployment targets now match (required for Capacitor 7.x)

## Now complete these steps in Terminal:

```bash
# 1. Navigate to iOS directory
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Downloads/Bytewise-Nutritionist/ios/App

# 2. Clean everything
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods

# 3. Install pods fresh
pod install
```

## After pod install succeeds:

1. **Close Xcode completely**
2. **Open the workspace file:**
   ```bash
   open App.xcworkspace
   ```
3. **In Xcode:**
   - Clean Build Folder: Press **Shift+Cmd+K**
   - Build: Press **Cmd+B**

## Why this fix was needed:
- Capacitor 7.x plugins require iOS 14.0 minimum
- Your project was set to iOS 13.0
- Both Podfile AND Xcode project needed updating
- Now everything is aligned at iOS 14.0

## Device Support:
- iOS 14.0 still supports iPhone 6s and newer
- Released in 2020, so 99%+ of devices support it

The pod install should work now without any deployment target errors!