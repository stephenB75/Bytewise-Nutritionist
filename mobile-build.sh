#!/bin/bash

# ByteWise Mobile Build Script
# Builds and syncs the app for iOS and Android deployment

echo "🚀 Building ByteWise for Mobile Deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build the web app for production
echo "📦 Building production web app..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not created"
    exit 1
fi

# Copy essential files to dist root for Capacitor
echo "📋 Preparing Capacitor files..."
cp client/index.html dist/ 2>/dev/null || echo "index.html already in dist"
cp manifest.json dist/ 2>/dev/null || echo "manifest.json not needed for native"
cp -r client/public/* dist/ 2>/dev/null || echo "No public files to copy"

# Sync with native platforms
echo "🔄 Syncing with native platforms..."
npx cap sync

echo "✅ Mobile build complete!"
echo ""
echo "Next steps:"
echo "📱 For iOS: npx cap open ios"
echo "🤖 For Android: npx cap open android"
echo ""
echo "Development server:"
echo "💻 Start dev server: npm run dev"
echo "🔗 Then run: npx cap run ios --livereload"