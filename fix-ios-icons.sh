#!/bin/bash

echo "🔧 Fixing iOS Icon Issues..."

# Navigate to the icons directory
cd ios/App/App/Assets.xcassets/AppIcon.appiconset

# Create a basic colored icon as source (yellow - ByteWise brand color)
# Using printf and xxd to create a minimal valid PNG
echo "Creating source icon..."

# Create a 1x1 yellow PNG and scale it up
printf '\x89\x50\x4E\x47\x0D\x0A\x1A\x0A\x00\x00\x00\x0D\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90\x77\x53\xDE\x00\x00\x00\x0C\x49\x44\x41\x54\x08\x99\x63\xF8\xEF\xDF\x3F\x00\x05\xFE\x02\xFE\xDC\xCC\xCD\xCD\x00\x00\x00\x00\x49\x45\x4E\x44\xAE\x42\x60\x82' > temp.png

# Scale it to 1024x1024
sips -z 1024 1024 temp.png --out AppIcon-512@2x.png

# Now generate all required sizes
echo "Generating all icon sizes..."

# iPhone icons
sips -z 40 40 AppIcon-512@2x.png --out AppIcon-20@2x.png
sips -z 60 60 AppIcon-512@2x.png --out AppIcon-20@3x.png
sips -z 58 58 AppIcon-512@2x.png --out AppIcon-29@2x.png
sips -z 87 87 AppIcon-512@2x.png --out AppIcon-29@3x.png
sips -z 80 80 AppIcon-512@2x.png --out AppIcon-40@2x.png
sips -z 120 120 AppIcon-512@2x.png --out AppIcon-40@3x.png
sips -z 120 120 AppIcon-512@2x.png --out AppIcon-60@2x.png
sips -z 180 180 AppIcon-512@2x.png --out AppIcon-60@3x.png

# iPad icons
sips -z 20 20 AppIcon-512@2x.png --out AppIcon-20.png
sips -z 29 29 AppIcon-512@2x.png --out AppIcon-29.png
sips -z 40 40 AppIcon-512@2x.png --out AppIcon-40.png
sips -z 76 76 AppIcon-512@2x.png --out AppIcon-76.png
sips -z 152 152 AppIcon-512@2x.png --out AppIcon-76@2x.png
sips -z 167 167 AppIcon-512@2x.png --out AppIcon-83.5@2x.png

# Clean up
rm temp.png

echo "✅ Icons generated!"
echo ""
echo "Now in Xcode:"
echo "1. Clean Build Folder (Shift+Cmd+K)"
echo "2. Build again (Cmd+B)"