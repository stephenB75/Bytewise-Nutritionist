#!/bin/bash
# ByteWise iOS Build Script - Fixes Vite path issues

echo "🔧 ByteWise iOS Build - Fixing Path Issues"
echo "=========================================="

# Clean previous builds
echo "🗑️  Cleaning previous builds..."
rm -rf dist/public
rm -rf dist/client

# Run Vite build with proper configuration
echo "🏗️  Building web application..."
NODE_ENV=production vite build

# Check if build was successful
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build failed - index.html not found"
    exit 1
fi

echo "✅ Web build successful"

# Copy required assets for iOS
echo "📱 Preparing iOS assets..."
if [ ! -f "dist/public/manifest.json" ]; then
    echo "⚠️  Copying manifest.json..."
    cp public/manifest.json dist/public/
fi

# Sync with Capacitor iOS
echo "⚡ Syncing with Capacitor iOS..."
npx cap sync ios

echo "✅ iOS build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npx cap open ios"
echo "2. Build IPA in Xcode"