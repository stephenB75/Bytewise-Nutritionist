# ByteWise IPA Creation - Complete Guide

## 🎯 Prerequisites

Your ByteWise app already has:
- ✅ iOS project created (`ios/` directory)
- ✅ Production build completed (599KB optimized)
- ✅ Capacitor configuration ready
- ✅ All assets synced to iOS project

## 📱 Step-by-Step IPA Creation

### Step 1: Open iOS Project in Xcode
```bash
# Open your iOS project
npx cap open ios
```

This opens `ios/App/App.xcworkspace` in Xcode.

### Step 2: Configure Project Settings

#### A. Set Development Team
1. Select **App** project in navigator (top item)
2. Select **App** target under "TARGETS"
3. Go to **Signing & Capabilities** tab
4. Under **Team**, select your Apple Developer account
5. Ensure **Automatically manage signing** is checked

#### B. Configure Bundle Identifier
- Verify **Bundle Identifier** is: `com.bytewise.nutritionist`
- This matches your Capacitor config

#### C. Set Deployment Target
- Set **iOS Deployment Target** to **14.0** or higher
- This ensures compatibility with modern iOS features

### Step 3: Add App Icons

#### A. Prepare Icons
You need these sizes (create from 1024x1024 base):
- 1024×1024 (App Store)
- 180×180 (iPhone @3x)
- 120×120 (iPhone @2x)  
- 152×152 (iPad @2x)
- 76×76 (iPad)

#### B. Add to Xcode
1. In Xcode navigator, go to **App → App → Assets.xcassets → AppIcon.appiconset**
2. Drag each icon to its corresponding slot
3. All slots should be filled (no empty spaces)

### Step 4: Configure Permissions (Info.plist)

Add these to `ios/App/App/Info.plist`:

```xml
<!-- Camera permission for food scanning -->
<key>NSCameraUsageDescription</key>
<string>ByteWise needs camera access to scan food barcodes and capture meal photos for nutrition tracking</string>

<!-- Photo library permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>ByteWise needs photo library access to attach meal images to your nutrition log entries</string>

<!-- Location permission (optional) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>ByteWise uses location to find nearby restaurants and suggest local nutrition options</string>

<!-- Background modes for PWA functionality -->
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
    <string>background-fetch</string>
</array>
```

### Step 5: Test on Simulator/Device

#### Test on Simulator:
1. Select **iOS Simulator** from device menu
2. Choose **iPhone 15 Pro** or similar
3. Click **Run** (▶️) button
4. Test all major features:
   - User registration/login
   - Meal logging functionality
   - USDA database searches
   - Progress tracking
   - PDF export

#### Test on Physical Device:
1. Connect iPhone/iPad via USB
2. Select your device from device menu
3. Click **Run** (▶️) button
4. Test PWA features, touch interactions, notifications

### Step 6: Archive for App Store

#### A. Configure for Release
1. Edit scheme: **Product → Scheme → Edit Scheme**
2. Select **Archive** on left
3. Set **Build Configuration** to **Release**
4. Click **Close**

#### B. Create Archive
1. Select **Any iOS Device (arm64)** from device menu
2. Go to **Product → Archive**
3. Wait for build to complete (5-10 minutes)
4. Archive will appear in **Organizer** window

### Step 7: Export IPA

#### A. From Organizer
1. **Organizer** should open automatically after archiving
2. Select your archive
3. Click **Distribute App**

#### B. Choose Distribution Method
Select based on your needs:

**For App Store Submission:**
- Choose **App Store Connect**
- Follow wizard to upload directly

**For Testing/Distribution:**
- Choose **Ad Hoc** (for registered devices)
- Choose **Enterprise** (if you have enterprise account)
- Choose **Development** (for development testing)

#### C. Export Process
1. Select **Export** option
2. Choose signing method (Automatic recommended)
3. Select destination folder
4. Click **Export**
5. IPA file will be created in selected folder

### Step 8: App Store Connect Upload

#### A. Using Xcode Organizer
1. In distribution wizard, choose **App Store Connect**
2. Select your app record (create if needed)
3. Click **Upload**
4. Wait for processing (30+ minutes)

#### B. Using Transporter App
1. Download **Transporter** from Mac App Store
2. Drag your IPA file to Transporter
3. Click **Deliver**

### Step 9: App Store Connect Configuration

#### A. App Information
- **Name**: ByteWise Nutritionist
- **Subtitle**: Professional Nutrition Tracking
- **Category**: Medical or Health & Fitness
- **Age Rating**: 4+

#### B. App Description
```
ByteWise Nutritionist - Professional nutrition tracking with USDA database integration.

PROFESSIONAL FEATURES:
• USDA FoodData Central integration for accurate nutrition data
• Smart meal logging with automatic time-based categorization
• Enhanced ingredient database with 40+ professional conversion standards
• Weekly progress tracking with comprehensive PDF export reports
• Advanced accessibility features with 17px base font sizing

TECHNICAL EXCELLENCE:
• Native iOS experience with Progressive Web App benefits
• Offline functionality with intelligent background synchronization
• Professional slide animations and touch-optimized interactions
• WCAG 2.1 AA accessibility compliance
• Real-time nutrition calculations and progress analytics

Perfect for nutritionists, dietitians, fitness professionals, and health-conscious individuals who demand professional-grade nutrition tracking accuracy.
```

#### C. Screenshots (Required Sizes)
- **iPhone 6.7"** (iPhone 15 Pro Max): 1290×2796 pixels
- **iPhone 6.5"** (iPhone 14 Plus): 1284×2778 pixels
- **iPhone 5.5"** (iPhone 8 Plus): 1242×2208 pixels
- **iPad Pro 12.9"**: 2048×2732 pixels

#### D. Keywords
```
nutrition tracker, USDA database, calorie counter, meal planner, professional nutrition, diet app, health tracking, food database, nutrition analysis, meal logging
```

## 🛠️ Command Line IPA Creation (Alternative)

### Using xcodebuild (Advanced)
```bash
# Navigate to iOS project
cd ios

# Build for archiving
xcodebuild -workspace App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath App.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath App.xcarchive \
  -exportPath . \
  -exportOptionsPlist ExportOptions.plist
```

Create `ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

## 📋 Pre-Submission Checklist

### Technical Requirements
- [ ] App builds without errors in Xcode
- [ ] All app icons added (no missing slots)
- [ ] Info.plist permissions configured
- [ ] App tested on iOS simulator
- [ ] App tested on physical iOS device
- [ ] Archive created successfully
- [ ] IPA exported without errors

### App Store Requirements
- [ ] Apple Developer account active ($99/year)
- [ ] App Store Connect app record created
- [ ] App metadata completed (name, description, keywords)
- [ ] Screenshots captured for all required device sizes
- [ ] Privacy policy URL added (if collecting user data)
- [ ] Age rating set appropriately

### Functionality Testing
- [ ] User registration/login works
- [ ] USDA database integration functions
- [ ] Meal logging saves and displays correctly
- [ ] Progress tracking calculates properly
- [ ] PDF export generates successfully
- [ ] Offline functionality works
- [ ] PWA features function (notifications, caching)

## 🚨 Common Issues & Solutions

### Build Errors
**"No code signing identities found"**
- Solution: Add Apple Developer account in Xcode Preferences → Accounts

**"App ID not found"**
- Solution: Create App ID in Apple Developer Portal matching bundle identifier

**"Provisioning profile doesn't match"**
- Solution: Enable "Automatically manage signing" in project settings

### Archive Issues
**"Archive failed"**
- Solution: Clean build folder (Product → Clean Build Folder), then retry

**"Invalid binary"**
- Solution: Check deployment target matches Xcode minimum requirements

### App Store Upload Issues
**"Invalid bundle"**
- Solution: Ensure all required icons are present and correct sizes

**"Missing compliance information"**
- Solution: Complete export compliance in App Store Connect

## 🎯 Timeline for IPA Creation

- **Xcode Configuration**: 30-60 minutes
- **Icon Preparation**: 1-2 hours
- **Testing & Bug Fixes**: 2-4 hours
- **Archive & Export**: 15-30 minutes
- **App Store Connect Setup**: 1-2 hours
- **Apple Review Process**: 24-48 hours

## 🏆 Success Criteria

Your ByteWise IPA will include:
- **Professional nutrition tracking** with USDA database integration
- **Native iOS experience** with haptic feedback and system integration
- **PWA capabilities** including offline functionality and background sync
- **Enhanced accessibility** with professional UI animations
- **Comprehensive features** including meal logging, progress tracking, PDF export

The resulting IPA will be ready for App Store distribution, providing users with a professional-grade nutrition tracking application that combines web technology benefits with native iOS capabilities.

---

**Your ByteWise app is now ready for IPA creation and App Store submission!**