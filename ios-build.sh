#!/bin/bash

echo "📱 ByteWise Nutritionist - iOS Native Build"
echo "=========================================="
echo ""

# Check if we're on macOS (required for iOS development)
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  Warning: iOS development requires macOS with Xcode installed"
    echo "   You can still build the web app and sync files for later iOS development"
    echo ""
fi

# Build the web application
echo "🏗️  Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed. Please check the errors above."
    exit 1
fi

# Ensure Capacitor CLI is available
echo "🔧 Checking Capacitor setup..."
if ! command -v npx cap &> /dev/null; then
    echo "❌ Capacitor CLI not found. Installing..."
    npm install -g @capacitor/cli
fi

# Sync the web app with iOS project
echo "🔄 Syncing web app with iOS project..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed. Please check the errors above."
    exit 1
fi

# Copy native resources if they exist
echo "📦 Copying native iOS resources..."
if [ -d "ios-assets" ]; then
    cp -r ios-assets/* ios/App/App/Resources/ 2>/dev/null || echo "   No additional iOS assets to copy"
fi

echo ""
echo "✅ iOS build preparation complete!"
echo ""
echo "📋 Next steps:"

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   1. Open Xcode: npx cap open ios"
    echo "   2. Configure signing team in Xcode"
    echo "   3. Build and run on simulator or device"
    echo "   4. For live reload: npm run dev (then) npx cap run ios --livereload"
    echo ""
    echo "🚀 Ready to launch Xcode? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🎯 Opening Xcode..."
        npx cap open ios
    else
        echo "👍 iOS project ready. Run 'npx cap open ios' when ready."
    fi
else
    echo "   1. Transfer project to macOS machine"
    echo "   2. Run 'npx cap open ios' on macOS with Xcode"
    echo "   3. Configure Apple Developer account and signing"
    echo "   4. Build and test on iOS Simulator or device"
fi

echo ""
echo "📱 iOS project location: ./ios"
echo "🔧 App ID: com.bytewise.nutritionist"
echo "📦 Bundle ready for Xcode development"