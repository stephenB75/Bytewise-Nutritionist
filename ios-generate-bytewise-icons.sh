#!/bin/bash

# Generate all iOS app icons from ByteWise Nutritionist branded logo
echo "🎨 Generating iOS app icons from ByteWise Nutritionist logo..."

cd ios/App/App/Assets.xcassets/AppIcon.appiconset

# Source is your branded ByteWise logo
SOURCE="AppIcon-512@2x.png"

if [ ! -f "$SOURCE" ]; then
    echo "❌ Source icon not found: $SOURCE"
    exit 1
fi

echo "📱 Generating iPhone icons..."
# iPhone Notification - 20pt
sips -z 40 40 "$SOURCE" --out "AppIcon-20@2x.png"
sips -z 60 60 "$SOURCE" --out "AppIcon-20@3x.png"

# iPhone Settings - 29pt  
sips -z 58 58 "$SOURCE" --out "AppIcon-29@2x.png"
sips -z 87 87 "$SOURCE" --out "AppIcon-29@3x.png"

# iPhone Spotlight - 40pt
sips -z 80 80 "$SOURCE" --out "AppIcon-40@2x.png"
sips -z 120 120 "$SOURCE" --out "AppIcon-40@3x.png"

# iPhone App - 60pt
sips -z 120 120 "$SOURCE" --out "AppIcon-60@2x.png"
sips -z 180 180 "$SOURCE" --out "AppIcon-60@3x.png"

echo "📱 Generating iPad icons..."
# iPad Notification - 20pt
sips -z 20 20 "$SOURCE" --out "AppIcon-20.png"
sips -z 40 40 "$SOURCE" --out "AppIcon-20@2x~ipad.png"

# iPad Settings - 29pt
sips -z 29 29 "$SOURCE" --out "AppIcon-29.png"
sips -z 58 58 "$SOURCE" --out "AppIcon-29@2x~ipad.png"

# iPad Spotlight - 40pt
sips -z 40 40 "$SOURCE" --out "AppIcon-40.png"
sips -z 80 80 "$SOURCE" --out "AppIcon-40@2x~ipad.png"

# iPad App - 76pt
sips -z 76 76 "$SOURCE" --out "AppIcon-76.png"
sips -z 152 152 "$SOURCE" --out "AppIcon-76@2x.png"

# iPad Pro - 83.5pt
sips -z 167 167 "$SOURCE" --out "AppIcon-83.5@2x.png"

echo "✅ ByteWise Nutritionist app icons generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. In Xcode: Clean Build Folder (Shift+Cmd+K)"
echo "2. Build again (Cmd+B)"
echo ""
echo "Your ByteWise branded icons are now ready for the App Store! 🚀"