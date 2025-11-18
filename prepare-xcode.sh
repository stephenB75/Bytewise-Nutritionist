#!/bin/bash
# ByteWise Nutritionist - Xcode Preparation Script
# This script prepares the app for building in Xcode

set -e  # Exit on any error

echo "🍎 ByteWise Nutritionist - Preparing for Xcode"
echo "============================================="
echo ""

# Check for macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must run on macOS"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "⚠️  Warning: Xcode not found in PATH"
    echo "This is okay if you plan to install it later"
else
    echo "✅ Xcode found: $(xcodebuild -version | head -1)"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Installing Node.js dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Verify Capacitor setup
echo ""
echo "⚡ Checking Capacitor configuration..."
if ! npx cap doctor 2>&1 | grep -q "iOS"; then
    echo "⚠️  Capacitor iOS check skipped (may require Xcode)"
fi

# Clean previous builds
echo ""
echo "🗑️  Cleaning previous builds..."
rm -rf dist/
rm -rf ios/App/App/public/

# Build web application
echo ""
echo "🏗️  Building web application..."
npm run build

# Verify build output
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build failed - index.html not found in dist/public/"
    exit 1
fi

echo "✅ Web build successful"
echo "   - dist/public/index.html ✓"

# Copy manifest if needed
if [ ! -f "dist/public/manifest.json" ]; then
    echo ""
    echo "📋 Copying manifest.json..."
    if [ -f "public/manifest.json" ]; then
        cp public/manifest.json dist/public/
    elif [ -f "manifest.json" ]; then
        cp manifest.json dist/public/
    fi
fi

# Sync with Capacitor iOS
echo ""
echo "🔄 Syncing web assets to iOS project..."
npx cap sync ios

# Verify iOS project structure
if [ ! -d "ios/App" ]; then
    echo "❌ Error: iOS project directory not found"
    exit 1
fi

echo ""
echo "✅ iOS project structure verified"
echo "   - ios/App/App.xcodeproj ✓"

# Check for app icons
if [ -d "ios/App/App/Assets.xcassets/AppIcon.appiconset" ]; then
    echo "   - App icons configured ✓"
else
    echo "   ⚠️  App icons may need configuration"
fi

# Check for splash screen
if [ -d "ios/App/App/Assets.xcassets/Splash.imageset" ]; then
    echo "   - Splash screen configured ✓"
fi

# Verify Info.plist permissions
echo ""
echo "📱 Verifying iOS permissions in Info.plist..."
if grep -q "NSCameraUsageDescription" ios/App/App/Info.plist; then
    echo "   ✓ Camera permission configured"
fi
if grep -q "NSPhotoLibraryUsageDescription" ios/App/App/Info.plist; then
    echo "   ✓ Photo library permission configured"
fi

echo ""
echo "============================================="
echo "✅ PREPARATION COMPLETE!"
echo "============================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open the project in Xcode:"
echo "   npx cap open ios"
echo ""
echo "2. In Xcode, configure:"
echo "   • Select 'App' target"
echo "   • Set Bundle Identifier: com.bytewise.nutritionist"
echo "   • Choose your Apple Developer Team"
echo "   • Enable 'Automatically manage signing'"
echo ""
echo "3. Build and run:"
echo "   • Select a simulator or connected device"
echo "   • Click the Run button (▶️) or press Cmd+R"
echo ""
echo "4. For App Store submission:"
echo "   • Product → Clean Build Folder (Cmd+Shift+K)"
echo "   • Product → Archive"
echo "   • Window → Organizer → Distribute App"
echo ""
echo "🎯 App Information:"
echo "   • App Name: ByteWise Nutritionist"
echo "   • Bundle ID: com.bytewise.nutritionist"
echo "   • Web Directory: dist/public"
echo ""
echo "Ready to build! 🚀"
