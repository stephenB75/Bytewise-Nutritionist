#!/bin/bash

echo "🧹 ByteWise Nutritionist - Deployment Cleanup"
echo "=============================================="
echo ""

# Remove development artifacts
echo "🗑️  Removing development artifacts..."
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

# Clean build directories
echo "🧽 Cleaning build directories..."
rm -rf dist/ 2>/dev/null || true
rm -rf .vite/ 2>/dev/null || true
rm -rf node_modules/.vite/ 2>/dev/null || true

# Check for any remaining console statements
echo "🔍 Checking for debug statements..."
CONSOLE_COUNT=$(grep -r "console\." client/src server shared 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo "⚠️  Found $CONSOLE_COUNT console statements. Consider removing for production:"
    grep -rn "console\." client/src server shared 2>/dev/null | head -5 || true
    echo ""
fi

# Optimize image assets
echo "🖼️  Checking image assets..."
LARGE_IMAGES=$(find attached_assets -name "*.png" -size +500k 2>/dev/null | wc -l || echo "0")
if [ "$LARGE_IMAGES" -gt 0 ]; then
    echo "📷 Found $LARGE_IMAGES large images. Consider optimizing for mobile:"
    find attached_assets -name "*.png" -size +500k 2>/dev/null | head -3 || true
    echo ""
fi

# Check dependencies
echo "📦 Analyzing dependencies..."
NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "Unknown")
echo "   Node modules size: $NODE_MODULES_SIZE"

# Validate core files
echo "✅ Validating core files..."
CORE_FILES=(
    "capacitor.config.ts"
    "ios-deployment.config.ts"
    "client/src/pages/ModernFoodLayout.tsx"
    "client/src/components/UserSettingsManager.tsx"
    "shared/schema.ts"
    "server/index.ts"
)

for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ Missing: $file"
    fi
done

# Check TypeScript compilation
echo "🔧 Checking TypeScript compilation..."
npm run check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ TypeScript compilation successful"
else
    echo "   ⚠️ TypeScript compilation warnings/errors detected"
fi

# Mobile-specific checks
echo "📱 Mobile deployment readiness..."
if [ -f "ios-deployment.config.ts" ]; then
    echo "   ✓ iOS production config ready"
else
    echo "   ✗ Missing iOS production config"
fi

if [ -f "ios-production-build.sh" ]; then
    echo "   ✓ iOS build script ready"
else
    echo "   ✗ Missing iOS build script"
fi

# Security check
echo "🔒 Security validation..."
if grep -q "localhost" capacitor.config.ts 2>/dev/null; then
    echo "   ⚠️ Development server config found in main capacitor.config.ts"
    echo "   💡 Use ios-deployment.config.ts for production"
fi

# Final recommendations
echo ""
echo "📋 Pre-deployment Checklist:"
echo "   [ ] Run production build: ./ios-production-build.sh"
echo "   [ ] Test on iOS device/simulator"
echo "   [ ] Verify all features work offline"
echo "   [ ] Check camera permissions"
echo "   [ ] Validate notification settings"
echo "   [ ] Configure Apple Developer signing"
echo "   [ ] Archive for App Store submission"
echo ""

# Performance recommendations
if [ "$NODE_MODULES_SIZE" = "Unknown" ] || [[ "$NODE_MODULES_SIZE" =~ [0-9]+[GM] ]]; then
    echo "💡 Performance Tips:"
    echo "   • Consider lazy loading for non-critical components"
    echo "   • Optimize large images in attached_assets/"
    echo "   • Enable gzip compression on server"
    echo "   • Use Capacitor's production build optimizations"
    echo ""
fi

echo "🚀 Cleanup complete! Ready for iOS deployment preparation."
echo "   Next: Run './ios-production-build.sh' to prepare iOS build"