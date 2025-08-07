#!/bin/bash

echo "🍎 ByteWise Nutritionist - iOS Production Build"
echo "=============================================="
echo ""

# Ensure we're starting clean
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf ios/App/App/public/
npm run build > /dev/null 2>&1

# Backup current config
echo "📋 Backing up development config..."
cp capacitor.config.ts capacitor.config.dev.ts

# Switch to production config
echo "⚙️  Applying production configuration..."
cp ios-deployment.config.ts capacitor.config.ts

# Build the web application
echo "🏗️  Building production web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Production build failed. Restoring development config..."
    mv capacitor.config.dev.ts capacitor.config.ts
    exit 1
fi

# Sync with iOS project using production config
echo "🔄 Syncing with iOS project..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ iOS sync failed. Restoring development config..."
    mv capacitor.config.dev.ts capacitor.config.ts
    exit 1
fi

# Copy production assets
echo "📦 Copying production assets..."
if [ -d "assets/ios-production" ]; then
    cp -r assets/ios-production/* ios/App/App/Resources/ 2>/dev/null || true
fi

# Update Info.plist with production values
echo "📝 Updating iOS app configuration..."
if [ -f "ios/App/App/Info.plist" ]; then
    # Update app name and bundle info (requires plutil on macOS)
    if command -v plutil &> /dev/null; then
        plutil -replace CFBundleDisplayName -string "ByteWise Nutritionist" ios/App/App/Info.plist 2>/dev/null || true
        plutil -replace CFBundleName -string "ByteWise" ios/App/App/Info.plist 2>/dev/null || true
    fi
fi

echo ""
echo "✅ iOS production build complete!"
echo ""
echo "📋 Next steps for App Store deployment:"
echo "   1. Open Xcode: npx cap open ios"
echo "   2. Configure Apple Developer Team signing"
echo "   3. Set deployment target (iOS 15.0+)"
echo "   4. Archive build (Product > Archive)"
echo "   5. Upload to App Store Connect"
echo ""
echo "🔧 Configuration:"
echo "   App ID: com.bytewise.nutritionist"
echo "   Bundle Name: ByteWise Nutritionist"
echo "   Production Config: Applied ✅"
echo ""

# Prompt to open Xcode
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🚀 Open Xcode now? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🎯 Opening Xcode for iOS deployment..."
        npx cap open ios
    else
        echo "👍 iOS project ready. Run 'npx cap open ios' when ready."
    fi
else
    echo "ℹ️  Transfer project to macOS machine for Xcode development"
fi

echo ""
echo "⚠️  Remember to restore development config after deployment:"
echo "   mv capacitor.config.dev.ts capacitor.config.ts"