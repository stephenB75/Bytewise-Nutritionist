#!/bin/bash

# ByteWise IPA Creation Script
# Automates the iOS build and IPA export process

set -e  # Exit on any error

echo "📱 Creating IPA for ByteWise Nutritionist..."

# Check prerequisites
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: xcodebuild not found. Please install Xcode."
    exit 1
fi

if [ ! -d "ios" ]; then
    echo "❌ Error: iOS project not found. Run 'npx cap add ios' first."
    exit 1
fi

# Navigate to iOS directory
cd ios

# Check if workspace exists
if [ ! -f "App/App.xcworkspace" ]; then
    echo "❌ Error: Xcode workspace not found."
    exit 1
fi

# Get the current date for versioning
BUILD_DATE=$(date +"%Y%m%d%H%M")

echo "🔨 Building ByteWise for iOS..."

# Build and archive
echo "📦 Creating archive..."
xcodebuild -workspace App/App.xcworkspace \
    -scheme App \
    -configuration Release \
    -destination generic/platform=iOS \
    -archivePath "ByteWise_${BUILD_DATE}.xcarchive" \
    archive

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully: ByteWise_${BUILD_DATE}.xcarchive"
else
    echo "❌ Archive failed. Check Xcode project configuration."
    exit 1
fi

# Create ExportOptions.plist for different distribution methods
cat > ExportOptions-AppStore.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF

cat > ExportOptions-AdHoc.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF

cat > ExportOptions-Development.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF

echo ""
echo "📤 Choose export method:"
echo "1) App Store (for submission to App Store)"
echo "2) Ad Hoc (for testing on registered devices)"
echo "3) Development (for development testing)"
echo "4) Skip export (archive only)"
echo ""
read -p "Enter your choice (1-4): " EXPORT_CHOICE

case $EXPORT_CHOICE in
    1)
        EXPORT_METHOD="app-store"
        EXPORT_PLIST="ExportOptions-AppStore.plist"
        ;;
    2)
        EXPORT_METHOD="ad-hoc"
        EXPORT_PLIST="ExportOptions-AdHoc.plist"
        ;;
    3)
        EXPORT_METHOD="development"
        EXPORT_PLIST="ExportOptions-Development.plist"
        ;;
    4)
        echo "✅ Archive created. Skipping IPA export."
        echo "📍 Archive location: ios/ByteWise_${BUILD_DATE}.xcarchive"
        echo "🎯 Open in Xcode Organizer to distribute manually."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Skipping export."
        exit 1
        ;;
esac

# Export IPA
echo "📱 Exporting IPA ($EXPORT_METHOD)..."
mkdir -p "ByteWise_${EXPORT_METHOD}_${BUILD_DATE}"

xcodebuild -exportArchive \
    -archivePath "ByteWise_${BUILD_DATE}.xcarchive" \
    -exportPath "ByteWise_${EXPORT_METHOD}_${BUILD_DATE}" \
    -exportOptionsPlist "$EXPORT_PLIST"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 IPA created successfully!"
    echo ""
    echo "📍 Location: ios/ByteWise_${EXPORT_METHOD}_${BUILD_DATE}/"
    echo "📱 IPA File: $(find "ByteWise_${EXPORT_METHOD}_${BUILD_DATE}" -name "*.ipa")"
    echo ""
    
    IPA_FILE=$(find "ByteWise_${EXPORT_METHOD}_${BUILD_DATE}" -name "*.ipa")
    if [ -f "$IPA_FILE" ]; then
        IPA_SIZE=$(ls -lh "$IPA_FILE" | awk '{print $5}')
        echo "📊 IPA Size: $IPA_SIZE"
        echo ""
    fi
    
    case $EXPORT_CHOICE in
        1)
            echo "🍎 Next steps for App Store submission:"
            echo "1. Upload to App Store Connect using Xcode Organizer or Transporter"
            echo "2. Complete app metadata in App Store Connect"
            echo "3. Add required screenshots for all device sizes"
            echo "4. Submit for review"
            ;;
        2)
            echo "📲 Next steps for Ad Hoc distribution:"
            echo "1. Distribute IPA to registered testers"
            echo "2. Install via TestFlight or direct installation"
            echo "3. Collect feedback and test thoroughly"
            ;;
        3)
            echo "🔧 Next steps for development testing:"
            echo "1. Install on development devices"
            echo "2. Test all features and functionality"
            echo "3. Debug any issues before release build"
            ;;
    esac
    
else
    echo "❌ IPA export failed. Check signing configuration."
    exit 1
fi

echo ""
echo "📖 For detailed instructions, see IPA_CREATION_GUIDE.md"
echo "🚀 Your ByteWise app is ready for distribution!"

cd ..