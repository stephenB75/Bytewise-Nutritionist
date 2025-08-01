#!/bin/bash

# ByteWise iOS Build Script
# Builds the app for iOS deployment

set -e  # Exit on any error

echo "🍎 Building ByteWise for iOS deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Capacitor is installed
if ! command -v npx cap &> /dev/null; then
    echo "📦 Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Capacitor iOS if not already installed
if [ ! -d "node_modules/@capacitor/ios" ]; then
    echo "📱 Installing Capacitor iOS..."
    npm install @capacitor/ios @capacitor/core @capacitor/cli
fi

# Build the web app
echo "🔨 Building web application..."
npm run build

# Initialize Capacitor if not already done
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚡ Initializing Capacitor..."
    npx cap init "ByteWise Nutritionist" "com.bytewise.nutritionist"
fi

# Add iOS platform if not already added
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
fi

# Install additional Capacitor plugins
echo "🔌 Installing Capacitor plugins..."
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/haptics @capacitor/local-notifications @capacitor/push-notifications @capacitor/camera @capacitor/filesystem @capacitor/device @capacitor/network @capacitor/storage @capacitor/keyboard

# Sync with iOS
echo "🔄 Syncing with iOS..."
npx cap sync ios

# Generate icons if script exists
if [ -f "public/icons/generate-icons.sh" ]; then
    echo "🎨 Generating app icons..."
    cd public/icons
    chmod +x generate-icons.sh
    if [ -f "icon-base-1024.png" ]; then
        ./generate-icons.sh
    else
        echo "⚠️  Warning: icon-base-1024.png not found. Please add a 1024x1024 PNG icon to generate all required sizes."
    fi
    cd ../..
fi

# Copy icons to iOS project if they exist
if [ -d "ios/App/App/Assets.xcassets/AppIcon.appiconset" ] && [ -f "public/icons/icon-1024.png" ]; then
    echo "📋 Copying icons to iOS project..."
    # This would copy the generated icons to the iOS project
    # In practice, you'd do this manually in Xcode
fi

echo ""
echo "✅ iOS build preparation complete!"
echo ""
echo "Next steps:"
echo "1. Open the iOS project in Xcode:"
echo "   npx cap open ios"
echo ""
echo "2. In Xcode:"
echo "   - Configure your Apple Developer Team"
echo "   - Add app icons to Assets.xcassets/AppIcon.appiconset/"
echo "   - Configure Info.plist permissions"
echo "   - Build and test on simulator or device"
echo ""
echo "3. For App Store deployment:"
echo "   - Archive the project (Product → Archive)"
echo "   - Upload to App Store Connect"
echo "   - Submit for review"
echo ""
echo "📖 See ios-deployment.md for detailed instructions"