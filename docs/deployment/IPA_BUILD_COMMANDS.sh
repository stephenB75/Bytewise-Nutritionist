#!/bin/bash
# ByteWise IPA Build Commands for macOS
# Run this script on macOS with Xcode installed

set -e  # Exit on any error

echo "🍎 ByteWise Nutritionist - IPA Build Script"
echo "=========================================="

# Check for macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must run on macOS"
    echo "iOS app building requires Xcode which is only available on macOS"
    exit 1
fi

# Check for Xcode
echo "📱 Checking Xcode installation..."
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode not installed"
    echo "Please install Xcode from the Mac App Store"
    exit 1
fi

# Check for Node.js
echo "📦 Checking Node.js installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ Error: Node.js not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install Command Line Tools if needed
echo "🔨 Verifying Xcode Command Line Tools..."
xcode-select -p || {
    echo "Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "Please complete the Command Line Tools installation and re-run this script"
    exit 1
}

# Install dependencies
echo "📥 Installing Node.js dependencies..."
npm install

# Verify Capacitor setup
echo "⚡ Checking Capacitor configuration..."
npx cap doctor || {
    echo "⚠️  Some Capacitor warnings detected (this is normal without CocoaPods)"
    echo "Continuing with build process..."
}

# Ensure web build exists
if [ ! -f "dist/public/index.html" ]; then
    echo "🏗️  Building web application..."
    npm run build
else
    echo "✅ Web build already exists"
fi

# Sync web assets to iOS
echo "🔄 Syncing web assets to iOS project..."
npx cap sync ios

# Verify iOS project structure
if [ ! -f "ios/App/App.xcworkspace" ]; then
    echo "❌ Error: iOS project not found"
    echo "Please ensure the 'ios' directory exists and contains the Capacitor iOS project"
    exit 1
fi

echo ""
echo "✅ BUILD PREPARATION COMPLETE!"
echo "=============================="
echo ""
echo "📋 Next Steps in Xcode:"
echo "1. Opening Xcode project..."

# Open Xcode
npx cap open ios

echo ""
echo "2. In Xcode, configure the following:"
echo "   • Select 'ByteWise' target"
echo "   • Set Bundle Identifier: com.bytewise.nutritionist"
echo "   • Choose your Apple Developer Team"
echo "   • Enable 'Automatically manage signing'"
echo ""
echo "3. Build IPA:"
echo "   • Select 'Any iOS Device (arm64)' as target"
echo "   • Product → Clean Build Folder"
echo "   • Product → Archive"
echo "   • Window → Organizer → Distribute App"
echo "   • Choose 'App Store Connect'"
echo ""
echo "🎯 App Store Information:"
echo "   • App Name: ByteWise Nutritionist"
echo "   • Bundle ID: com.bytewise.nutritionist"
echo "   • Category: Health & Fitness"
echo "   • Content Rating: 4+"
echo ""
echo "📱 Your ByteWise app is ready for iOS App Store submission!"