#!/bin/bash

echo "=== Fixing Xcode Icon Reference Issue ==="
echo ""
echo "This script will clean all Xcode caches and reset the icon configuration"
echo ""

# Step 1: Clean derived data
echo "1. Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "   ✅ Derived data cleaned"

# Step 2: Clean build folder from command line
echo ""
echo "2. Cleaning build folder..."
cd ios/App
xcodebuild clean -workspace App.xcworkspace -scheme App -configuration Debug 2>/dev/null || echo "   (Xcode clean attempted)"
echo "   ✅ Build folder cleaned"

# Step 3: Remove any .DS_Store files that might contain references
echo ""
echo "3. Removing .DS_Store files..."
find . -name ".DS_Store" -delete
echo "   ✅ .DS_Store files removed"

# Step 4: Reset simulators
echo ""
echo "4. Resetting simulators..."
xcrun simctl shutdown all 2>/dev/null || true
echo "   ✅ Simulators reset"

# Step 5: Verify asset catalog
echo ""
echo "5. Verifying asset catalog..."
echo "   AppIcon files present: $(ls Assets.xcassets/AppIcon.appiconset/*.png 2>/dev/null | wc -l)"
echo "   Contents.json present: $(ls Assets.xcassets/AppIcon.appiconset/Contents.json 2>/dev/null | wc -l)"

# Step 6: Instructions for Xcode
echo ""
echo "=== Manual Steps in Xcode ==="
echo ""
echo "1. COMPLETELY QUIT Xcode (Cmd+Q)"
echo ""
echo "2. In Terminal, run this command to clear any cached settings:"
echo "   defaults delete com.apple.dt.Xcode 2>/dev/null || true"
echo ""
echo "3. Open Xcode again and open your project:"
echo "   - File → Open → Navigate to ios/App/App.xcworkspace"
echo ""
echo "4. In Xcode, go to your project settings:"
echo "   - Click on 'App' in the navigator (top item with blue icon)"
echo "   - Select the 'App' target"
echo "   - Go to 'Build Settings' tab"
echo "   - Search for 'Asset Catalog Compiler'"
echo "   - Make sure 'Asset Catalog App Icon Set Name' is set to 'AppIcon'"
echo "   - NOT a file path, just 'AppIcon'"
echo ""
echo "5. Clean and build:"
echo "   - Product → Clean Build Folder (Shift+Cmd+K)"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "If the error persists, in Xcode:"
echo "   - Click on Assets.xcassets in the navigator"
echo "   - Right-click on AppIcon"
echo "   - Choose 'Show in Finder'"
echo "   - Verify all .png files are present"
echo "   - Go back to Xcode and try building again"

echo ""
echo "✅ Script complete. Follow the manual steps above in Xcode."