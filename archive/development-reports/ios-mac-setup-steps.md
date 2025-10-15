# iOS Build Setup on Mac - Complete Steps

## The Problem
The Podfile requires files from `node_modules/@capacitor/ios/scripts/pods_helpers` but node_modules don't exist on your Mac yet.

## ✅ Correct Order of Steps

### Step 1: Install Node.js Dependencies First
In Terminal, navigate to your project root (where package.json is):
```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Downloads/Bytewise-Nutritionist

# Install all npm dependencies
npm install
```

This will create the `node_modules` folder with all Capacitor packages.

### Step 2: Sync Capacitor (Important!)
Still in the project root:
```bash
npx cap sync ios
```

This copies web assets and configuration to the iOS project.

### Step 3: Now Install CocoaPods
Navigate to the iOS folder:
```bash
cd ios/App
pod install
```

This should now work because node_modules exist!

### Step 4: Open in Xcode
```bash
open App.xcworkspace
```

Or double-click `App.xcworkspace` in Finder (NOT App.xcodeproj)

### Step 5: Configure Signing
1. Select "App" in the project navigator
2. Go to "Signing & Capabilities" tab
3. Select your Apple Developer team
4. Enable "Automatically manage signing"

### Step 6: Build
Press Cmd+B to build

## 🔍 Verification Checklist
After `npm install`, check that these exist:
- [ ] `node_modules` folder in project root
- [ ] `node_modules/@capacitor/ios` folder exists
- [ ] `node_modules/@capacitor/ios/scripts/pods_helpers.rb` file exists

## 💡 Common Issues

### If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### If pod install still fails after npm install:
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clear pod cache
pod cache clean --all

# Try again
cd ios/App
pod install
```

### For M1/M2 Macs specifically:
```bash
# If pod install fails on Apple Silicon
cd ios/App
arch -x86_64 pod install
```

## 📱 Quick Command Summary
Run these in order from your project root:
```bash
# 1. Install JavaScript dependencies
npm install

# 2. Sync with Capacitor
npx cap sync ios

# 3. Install iOS dependencies
cd ios/App
pod install

# 4. Open in Xcode
open App.xcworkspace
```

## Important Notes
- You MUST run `npm install` before `pod install`
- Always work from the project root first, then navigate to ios/App
- The project path appears to be in iCloud - make sure all files are downloaded locally

The error you're seeing is the #1 most common iOS build issue - it happens when trying to run pod install before npm install!