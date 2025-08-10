#!/bin/bash

echo "=== ByteWise iOS Icon Complete Fix ==="
echo "This will clean and rebuild all iOS icon references"

# Change to iOS directory
cd ios/App || exit 1

# Clean Xcode build cache
echo "1. Cleaning Xcode build cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf build/

# Remove any potential broken references
echo "2. Removing any broken icon references..."
find . -name "*.pbxproj" -exec sed -i '' '/Bytewise_Nutritionist\.png/d' {} \;

# Clean the asset catalog
echo "3. Verifying asset catalog..."
cd App/Assets.xcassets/AppIcon.appiconset

# Verify all required icons exist
echo "4. Checking icon files..."
MISSING_ICONS=()
for icon in AppIcon-20.png AppIcon-20@2x.png AppIcon-20@3x.png \
            AppIcon-29.png AppIcon-29@2x.png AppIcon-29@3x.png \
            AppIcon-40.png AppIcon-40@2x.png AppIcon-40@3x.png \
            AppIcon-60@2x.png AppIcon-60@3x.png \
            AppIcon-76.png AppIcon-76@2x.png \
            AppIcon-83.5@2x.png AppIcon-512@2x.png; do
    if [ ! -f "$icon" ]; then
        MISSING_ICONS+=("$icon")
        echo "   ❌ Missing: $icon"
    else
        echo "   ✅ Found: $icon"
    fi
done

if [ ${#MISSING_ICONS[@]} -gt 0 ]; then
    echo ""
    echo "ERROR: Some icons are missing. Regenerating..."
    # Return to project root
    cd ../../../../../../
    
    # Run icon generation
    python3 generate-ios-icons.py
    
    # Return to iOS directory
    cd ios/App
fi

# Update Contents.json to ensure no invalid references
echo ""
echo "5. Updating Contents.json..."
cd App/Assets.xcassets/AppIcon.appiconset

# Create clean Contents.json
cat > Contents.json << 'EOF'
{
  "images" : [
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "AppIcon-20@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "AppIcon-20@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "AppIcon-29@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "AppIcon-29@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "AppIcon-40@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "AppIcon-40@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "AppIcon-60@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "AppIcon-60@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "20x20",
      "idiom" : "ipad",
      "filename" : "AppIcon-20.png",
      "scale" : "1x"
    },
    {
      "size" : "20x20",
      "idiom" : "ipad",
      "filename" : "AppIcon-20@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "ipad",
      "filename" : "AppIcon-29.png",
      "scale" : "1x"
    },
    {
      "size" : "29x29",
      "idiom" : "ipad",
      "filename" : "AppIcon-29@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "ipad",
      "filename" : "AppIcon-40.png",
      "scale" : "1x"
    },
    {
      "size" : "40x40",
      "idiom" : "ipad",
      "filename" : "AppIcon-40@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "76x76",
      "idiom" : "ipad",
      "filename" : "AppIcon-76.png",
      "scale" : "1x"
    },
    {
      "size" : "76x76",
      "idiom" : "ipad",
      "filename" : "AppIcon-76@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "83.5x83.5",
      "idiom" : "ipad",
      "filename" : "AppIcon-83.5@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "1024x1024",
      "idiom" : "ios-marketing",
      "filename" : "AppIcon-512@2x.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOF

echo ""
echo "6. Running pod install to sync dependencies..."
cd ../../../
pod install

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Next steps:"
echo "1. In Xcode, go to Product → Clean Build Folder (Shift+Cmd+K)"
echo "2. Close Xcode completely"
echo "3. Open App.xcworkspace (not .xcodeproj)"
echo "4. Build again"
echo ""
echo "If you still see the error:"
echo "1. In Xcode, click on the App target"
echo "2. Go to Build Phases → Copy Bundle Resources"
echo "3. Remove any red (missing) references to Bytewise_Nutritionist.png"
echo "4. Clean and rebuild"