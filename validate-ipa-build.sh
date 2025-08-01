#!/bin/bash
# ByteWise IPA Build Validation and Fix Script

echo "🔍 ByteWise IPA Build Validation"
echo "================================"

# Check if we have the required icons in iOS project
echo "📱 Checking iOS icon assets..."
ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
MISSING_ICONS=()

# Required iOS icons
declare -a REQUIRED_ICONS=(
    "icon-20.png"
    "icon-29.png" 
    "icon-40.png"
    "icon-58.png"
    "icon-60.png"
    "icon-76.png"
    "icon-80.png"
    "icon-87.png"
    "icon-120.png"
    "icon-152.png"
    "icon-167.png"
    "icon-180.png"
    "icon-1024.png"
)

for icon in "${REQUIRED_ICONS[@]}"; do
    if [ ! -f "$ICON_DIR/$icon" ]; then
        MISSING_ICONS+=("$icon")
    fi
done

if [ ${#MISSING_ICONS[@]} -eq 0 ]; then
    echo "✅ All required iOS icons present"
else
    echo "❌ Missing iOS icons: ${MISSING_ICONS[*]}"
    echo "🔧 Copying icons from public/icons/..."
    
    for icon in "${MISSING_ICONS[@]}"; do
        if [ -f "public/icons/$icon" ]; then
            cp "public/icons/$icon" "$ICON_DIR/$icon"
            echo "✅ Copied $icon"
        elif [ -f "public/icons/icon-base-1024.png" ] && [ "$icon" = "icon-1024.png" ]; then
            cp "public/icons/icon-base-1024.png" "$ICON_DIR/icon-1024.png"
            echo "✅ Copied 1024px icon from base"
        else
            echo "⚠️  $icon not found in public/icons/"
        fi
    done
fi

# Validate Capacitor configuration
echo ""
echo "⚡ Checking Capacitor configuration..."
if [ -f "capacitor.config.ts" ]; then
    echo "✅ capacitor.config.ts exists"
    
    # Check for proper webDir
    if grep -q "webDir: 'dist/public'" capacitor.config.ts; then
        echo "✅ webDir correctly set to 'dist/public'"
    else
        echo "❌ webDir not properly configured"
    fi
    
    # Check for app ID
    if grep -q "appId: 'com.bytewise.nutritionist'" capacitor.config.ts; then
        echo "✅ App ID properly configured"
    else
        echo "❌ App ID not properly configured"
    fi
else
    echo "❌ capacitor.config.ts missing"
fi

# Check iOS project structure
echo ""
echo "📁 Checking iOS project structure..."
if [ -d "ios/App" ]; then
    echo "✅ iOS App directory exists"
    
    if [ -f "ios/App/App.xcworkspace" ]; then
        echo "✅ Xcode workspace exists"
    else
        echo "❌ Xcode workspace not found"
    fi
    
    if [ -f "ios/App/App/Info.plist" ]; then
        echo "✅ Info.plist exists"
        
        # Check for required iOS keys
        if grep -q "NSUserNotificationsUsageDescription" ios/App/App/Info.plist; then
            echo "✅ Privacy descriptions present"
        else
            echo "⚠️  Privacy descriptions may be missing"
        fi
    else
        echo "❌ Info.plist not found"
    fi
else
    echo "❌ iOS project directory not found"
fi

# Check production build
echo ""
echo "🏗️  Checking production build..."
if [ -d "dist/public" ]; then
    echo "✅ dist/public directory exists"
    
    if [ -f "dist/public/index.html" ]; then
        echo "✅ Built index.html exists"
    else
        echo "❌ Built index.html not found"
        echo "🔧 Running production build..."
        npm run build
    fi
    
    if [ -f "dist/public/manifest.json" ]; then
        echo "✅ PWA manifest exists in build"
    else
        echo "❌ PWA manifest not found in build"
    fi
else
    echo "❌ Build output directory not found"
    echo "🔧 Running production build..."
    npm run build
fi

# Final validation
echo ""
echo "🎯 IPA Build Readiness Summary"
echo "=============================="

READY=true

# Check critical files
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Missing: capacitor.config.ts"
    READY=false
fi

if [ ! -d "ios/App" ]; then
    echo "❌ Missing: iOS project"
    READY=false
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Missing: Production build"
    READY=false
fi

if [ ${#MISSING_ICONS[@]} -gt 3 ]; then
    echo "❌ Critical: Too many missing icons"
    READY=false
fi

if [ "$READY" = true ]; then
    echo "✅ ByteWise is READY for IPA conversion!"
    echo ""
    echo "📋 Next Steps on macOS:"
    echo "1. Copy project to macOS system"
    echo "2. Install Xcode from Mac App Store"
    echo "3. Run: npm install"
    echo "4. Run: npx cap sync ios"
    echo "5. Run: npx cap open ios"
    echo "6. Build IPA in Xcode"
else
    echo "❌ ByteWise is NOT ready - fix issues above"
fi

echo ""
echo "🔗 For detailed instructions, see IPA_BUILD_COMMANDS.sh"