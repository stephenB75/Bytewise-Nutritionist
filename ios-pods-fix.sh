#!/bin/bash

# iOS Pods Installation Fix Script
# Run this from your project root

echo "🔧 Fixing iOS Pods Installation..."

# Navigate to iOS App directory
cd ios/App

echo "📦 Step 1: Cleaning old Pod files..."
# Remove old Pod files and cache
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods

echo "🧹 Step 2: Deintegrating Pods from project..."
# Deintegrate pods from the project
pod deintegrate

echo "🔄 Step 3: Updating Pod repo..."
# Update the Pod repository
pod repo update

echo "📥 Step 4: Installing Pods fresh..."
# Install pods with verbose output to see any issues
pod install --verbose

echo "✅ Step 5: Verifying installation..."
# Check if critical files exist
if [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "✅ SUCCESS: Pod configuration files created!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Close Xcode completely"
    echo "2. Open App.xcworkspace (NOT App.xcodeproj)"
    echo "3. Clean Build Folder (Shift+Cmd+K)"
    echo "4. Build again (Cmd+B)"
else
    echo "❌ ERROR: Pod installation may have failed."
    echo "Please check the verbose output above for errors."
fi

echo ""
echo "🎯 Remember: Always open App.xcworkspace, never App.xcodeproj!"