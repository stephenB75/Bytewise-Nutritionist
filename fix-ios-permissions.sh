#!/bin/bash

echo "🔐 Fixing iOS Build Permissions for ByteWise Nutritionist"
echo "=================================================="

# Get the actual path from your error message
IOS_PATH="/Volumes/Mac Pro 2 HD/Bytewise-Nutritionist/ios"

echo "📂 Checking iOS directory..."
if [ -d "$IOS_PATH" ]; then
    echo "✅ Found iOS directory at: $IOS_PATH"
else
    echo "❌ iOS directory not found. Please update the path in this script."
    exit 1
fi

echo ""
echo "🔧 Step 1: Fixing file permissions..."
# Fix permissions on the entire iOS directory
chmod -R 755 "$IOS_PATH/App/Pods" 2>/dev/null
chmod +x "$IOS_PATH/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh" 2>/dev/null

echo "🧹 Step 2: Clearing Xcode derived data..."
# Clear Xcode's derived data which might have permission issues
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "🔄 Step 3: Resetting Cocoapods..."
cd "$IOS_PATH/App"

# Remove and reinstall pods
rm -rf Pods
rm -f Podfile.lock
pod deintegrate
pod install

echo ""
echo "✅ Permissions fixed! Now do the following:"
echo ""
echo "1. QUIT Xcode completely (Cmd+Q)"
echo "2. Open Terminal and run:"
echo "   cd '$IOS_PATH/App'"
echo "   open App.xcworkspace"
echo ""
echo "3. In Xcode:"
echo "   - Clean Build Folder (Shift+Cmd+K)"
echo "   - Try building again (Cmd+B)"
echo ""
echo "If you still see permission errors, you may need to:"
echo "- Go to System Settings > Privacy & Security > Files and Folders"
echo "- Make sure Xcode has permission to access your folders"