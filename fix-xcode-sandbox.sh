#!/bin/bash

echo "🔐 Fixing Xcode Sandbox Restrictions for ByteWise Nutritionist"
echo "=============================================================="
echo ""

# Navigate to the iOS App directory
cd ios/App || exit

echo "🛠️ Step 1: Removing ALL build artifacts and caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf build/
rm -rf Pods/
rm -f Podfile.lock
rm -rf *.xcworkspace

echo "🔧 Step 2: Resetting CocoaPods completely..."
pod cache clean --all
pod deintegrate

echo "📦 Step 3: Creating fresh Podfile..."
cat > Podfile << 'EOF'
require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'

platform :ios, '13.0'
use_frameworks!

# workaround to avoid Xcode caching of Pods that requires
# Product -> Clean Build Folder after new Cordova plugins installed
# Requires CocoaPods 1.6 or newer
install! 'cocoapods', :disable_input_output_paths => true

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCommunityAppleSignIn', :path => '../../node_modules/@capacitor-community/apple-sign-in'
  pod 'CapacitorApp', :path => '../../node_modules/@capacitor/app'
  pod 'CapacitorBrowser', :path => '../../node_modules/@capacitor/browser'
  pod 'CapacitorCamera', :path => '../../node_modules/@capacitor/camera'
  pod 'CapacitorFilesystem', :path => '../../node_modules/@capacitor/filesystem'
  pod 'CapacitorHaptics', :path => '../../node_modules/@capacitor/haptics'
  pod 'CapacitorKeyboard', :path => '../../node_modules/@capacitor/keyboard'
  pod 'CapacitorLocalNotifications', :path => '../../node_modules/@capacitor/local-notifications'
  pod 'CapacitorPushNotifications', :path => '../../node_modules/@capacitor/push-notifications'
  pod 'CapacitorShare', :path => '../../node_modules/@capacitor/share'
  pod 'CapacitorSplashScreen', :path => '../../node_modules/@capacitor/splash-screen'
  pod 'CapacitorStatusBar', :path => '../../node_modules/@capacitor/status-bar'
  pod 'CordovaPlugins', :path => '../capacitor-cordova-ios-plugins'
end

target 'App' do
  capacitor_pods
  # Add any additional pods here
end

post_install do |installer|
  assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
      config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ""
      config.build_settings['CODE_SIGNING_REQUIRED'] = "NO"
      config.build_settings['CODE_SIGNING_ALLOWED'] = "NO"
    end
  end
end
EOF

echo "🔄 Step 4: Installing pods with proper permissions..."
pod install --repo-update

echo "🔐 Step 5: Explicitly setting execute permissions..."
find Pods -name "*.sh" -exec chmod +x {} \;

echo "📁 Step 6: Creating Xcode workspace settings..."
mkdir -p App.xcworkspace/xcshareddata
cat > App.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>BuildSystemType</key>
    <string>Latest</string>
    <key>DisableBuildSystemDeprecationDiagnostic</key>
    <true/>
</dict>
</plist>
EOF

echo ""
echo "✅ Setup complete! Now follow these EXACT steps:"
echo ""
echo "1. CLOSE Xcode completely (Cmd+Q)"
echo ""
echo "2. Open System Settings and grant permissions:"
echo "   • Privacy & Security > Files and Folders > Xcode > Enable all folders"
echo "   • Privacy & Security > Developer Tools > Enable Terminal"
echo "   • Privacy & Security > Full Disk Access > Enable Xcode (if available)"
echo ""
echo "3. In Terminal, run these commands:"
echo "   cd $(pwd)"
echo "   open App.xcworkspace"
echo ""
echo "4. In Xcode:"
echo "   • Wait for indexing to complete"
echo "   • Product > Clean Build Folder (Shift+Cmd+K)"
echo "   • Product > Build (Cmd+B)"
echo ""
echo "If the error persists, try:"
echo "   • Restart your Mac"
echo "   • Run Xcode with elevated permissions: sudo open App.xcworkspace"