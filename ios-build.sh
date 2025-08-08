#!/bin/bash

echo "📱 Starting iOS Build Setup for ByteWise Nutritionist"
echo "================================================"

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must be run on macOS for iOS development"
    exit 1
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor iOS project..."
npx cap sync ios

# Navigate to iOS directory
cd ios/App || exit 1

# Clean previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf Pods
rm -f Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Update CocoaPods repo
echo "📦 Updating CocoaPods repository..."
pod repo update

# Install pods with verbose output
echo "🔧 Installing CocoaPods dependencies..."
pod install --verbose

# Check if pod install was successful
if [ $? -eq 0 ]; then
    echo "✅ Pod installation successful!"
    
    # Open Xcode workspace
    echo "📂 Opening Xcode workspace..."
    open App.xcworkspace
    
    echo ""
    echo "========================================="
    echo "✨ iOS Build Setup Complete!"
    echo "========================================="
    echo "Next steps:"
    echo "1. In Xcode, select your development team"
    echo "2. Select a simulator or device"
    echo "3. Press Cmd+R to build and run"
    echo ""
else
    echo "❌ Pod installation failed!"
    echo "Troubleshooting steps:"
    echo "1. Make sure CocoaPods is installed: gem install cocoapods"
    echo "2. Try: pod deintegrate && pod install"
    echo "3. Check that all node_modules are installed: npm install"
    exit 1
fi