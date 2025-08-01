# IPA Build Guide for ByteWise Nutritionist

## Prerequisites for IPA Creation

### Required Software
1. **macOS System** - iOS app building requires macOS
2. **Xcode** - Latest version from Mac App Store
3. **Apple Developer Account** - $99/year for App Store distribution
4. **iOS Device or Simulator** - For testing

### Current Status
❌ **Xcode Missing**: iOS development requires Xcode on macOS
❌ **macOS Required**: Cannot build iOS apps on Linux/Windows
✅ **Capacitor Configured**: App ID and configuration ready
✅ **PWA Manifest**: All iOS requirements met

## Step-by-Step IPA Build Process

### 1. Environment Setup (macOS Required)
```bash
# Install Xcode from Mac App Store
# Install Xcode Command Line Tools
xcode-select --install

# Verify Xcode installation
xcode-select -p
```

### 2. Build Web Assets
```bash
# Build the React app
npm run build

# Verify dist directory exists
ls -la dist/
```

### 3. Sync Capacitor
```bash
# Copy web assets to iOS project
npx cap sync ios

# Open iOS project in Xcode
npx cap open ios
```

### 4. iOS Project Configuration
```bash
# In Xcode:
# 1. Select ByteWise target
# 2. Update Bundle Identifier: com.bytewise.nutritionist
# 3. Set Team (Apple Developer Account)
# 4. Configure Signing & Capabilities
# 5. Set Deployment Target: iOS 14.0+
```

### 5. Build for Device
```bash
# Archive for distribution
# Product > Archive in Xcode
# Window > Organizer > Distribute App
# Choose distribution method (App Store/Ad Hoc/Enterprise)
```

## Current Configuration

### Capacitor Config
```typescript
{
  appId: 'com.bytewise.nutritionist',
  appName: 'ByteWise Nutritionist',
  webDir: 'dist',
  backgroundColor: '#fef7cd'
}
```

### iOS Specific Features
- ✅ SplashScreen configuration
- ✅ StatusBar styling  
- ✅ Keyboard handling
- ✅ Local/Push notifications
- ✅ PWA manifest with iOS meta tags

## Platform Limitations

### Replit Environment
- **Cannot build iOS apps**: Linux environment, no Xcode
- **Development only**: Use for testing web version
- **No iOS simulator**: Cannot test iOS features

### Solution: Transfer to macOS
1. **Download project files** from Replit
2. **Transfer to Mac** with Xcode installed
3. **Install dependencies**: `npm install`
4. **Build web assets**: `npm run build`
5. **Sync iOS project**: `npx cap sync ios`
6. **Open in Xcode**: `npx cap open ios`

## Alternative: Capacitor Cloud Build

### AppFlow (Ionic)
```bash
# Install Ionic CLI
npm install -g @ionic/cli

# Login to Ionic AppFlow
ionic login

# Build in cloud
ionic capacitor build ios --prod
```

### Requirements
- Ionic AppFlow account
- Upload certificates and provisioning profiles
- Configure signing credentials

## File Preparation for Transfer

### Essential Files for macOS Build
```
├── ios/                    # Capacitor iOS project
├── dist/                   # Built web assets (after npm run build)
├── src/                    # React source code
├── public/                 # Public assets and manifest
├── capacitor.config.ts     # Capacitor configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Build configuration
```

### Build Commands for macOS
```bash
# 1. Install dependencies
npm install

# 2. Build web app
npm run build

# 3. Sync to iOS
npx cap sync ios

# 4. Open Xcode
npx cap open ios

# 5. Build/Archive in Xcode
```

## Troubleshooting

### Common Issues
1. **Missing Xcode**: Install from Mac App Store
2. **No Developer Account**: Sign up at developer.apple.com
3. **Build errors**: Check Bundle ID and signing
4. **Missing assets**: Run `npm run build` first

### Verification Steps
```bash
# Check Capacitor setup
npx cap doctor

# Verify iOS project
ls -la ios/App/

# Check web build
ls -la dist/index.html
```

## Summary

**Current Status**: Ready for transfer to macOS
**Next Steps**: 
1. Build web assets (`npm run build`)
2. Transfer project to Mac with Xcode
3. Follow iOS build process
4. Submit to App Store

The ByteWise app is fully configured for iOS deployment but requires macOS and Xcode for IPA generation.