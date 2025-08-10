#!/bin/bash

echo "🔐 Fixing iOS Build Permissions for ByteWise Nutritionist"
echo "=================================================="

# Use relative path from current directory
IOS_PATH="./ios"

echo "📂 Checking iOS directory..."
if [ -d "$IOS_PATH" ]; then
    echo "✅ Found iOS directory at: $IOS_PATH"
else
    echo "❌ iOS directory not found. Make sure you're running this from the project root."
    echo "Current directory: $(pwd)"
    exit 1
fi

echo ""
echo "🔧 Step 1: Fixing file permissions..."
# Fix permissions on the entire iOS directory if Pods exist
if [ -d "$IOS_PATH/App/Pods" ]; then
    chmod -R 755 "$IOS_PATH/App/Pods"
    if [ -f "$IOS_PATH/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh" ]; then
        chmod +x "$IOS_PATH/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh"
    fi
fi

echo "🧹 Step 2: Clearing Xcode derived data..."
# Clear Xcode's derived data which might have permission issues
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "🔄 Step 3: Resetting Cocoapods..."
cd "$IOS_PATH/App" || exit

# Check if pod command exists
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods not found! Install it with: sudo gem install cocoapods"
    exit 1
fi

# Remove and reinstall pods
echo "Removing old Pods..."
rm -rf Pods
rm -f Podfile.lock

echo "Running pod deintegrate..."
pod deintegrate

echo "Running pod install..."
pod install

echo ""
echo "✅ Permissions fixed! Now do the following:"
echo ""
echo "1. QUIT Xcode completely (Cmd+Q)"
echo "2. Open Terminal and run:"
echo "   cd ios/App"
echo "   open App.xcworkspace"
echo ""
echo "3. In Xcode:"
echo "   - Clean Build Folder (Shift+Cmd+K)"
echo "   - Try building again (Cmd+B)"
echo ""
echo "If you still see permission errors, you may need to:"
echo "- Go to System Settings > Privacy & Security > Files and Folders"
echo "- Make sure Xcode has permission to access your folders"
echo "- Grant Terminal Full Disk Access in Privacy & Security settings"