#!/bin/bash

# ByteWise Icon Generation Script
# Generates all required iOS app icons from a base 1024x1024 icon

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed. Please install it first:"
    echo "macOS: brew install imagemagick"
    echo "Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Base icon should be 1024x1024 PNG
BASE_ICON="icon-base-1024.png"

if [ ! -f "$BASE_ICON" ]; then
    echo "Base icon file '$BASE_ICON' not found!"
    echo "Please provide a 1024x1024 PNG file named '$BASE_ICON'"
    exit 1
fi

echo "Generating ByteWise app icons from $BASE_ICON..."

# iOS App Icons (required for App Store)
declare -a ios_sizes=(
    "20:icon-20.png"
    "29:icon-29.png"
    "40:icon-40.png"
    "58:icon-58.png"
    "60:icon-60.png"
    "76:icon-76.png"
    "80:icon-80.png"
    "87:icon-87.png"
    "120:icon-120.png"
    "152:icon-152.png"
    "167:icon-167.png"
    "180:icon-180.png"
    "1024:icon-1024.png"
)

# PWA Icons (for web app manifest)
declare -a pwa_sizes=(
    "72:icon-72x72.png"
    "96:icon-96x96.png"
    "128:icon-128x128.png"
    "144:icon-144x144.png"
    "152:icon-152x152.png"
    "192:icon-192x192.png"
    "384:icon-384x384.png"
    "512:icon-512x512.png"
)

# Generate iOS icons
echo "Generating iOS app icons..."
for size_info in "${ios_sizes[@]}"; do
    IFS=':' read -r size filename <<< "$size_info"
    echo "  Creating ${filename} (${size}x${size})"
    convert "$BASE_ICON" -resize "${size}x${size}" "$filename"
done

# Generate PWA icons
echo "Generating PWA icons..."
for size_info in "${pwa_sizes[@]}"; do
    IFS=':' read -r size filename <<< "$size_info"
    echo "  Creating ${filename} (${size}x${size})"
    convert "$BASE_ICON" -resize "${size}x${size}" "$filename"
done

# Generate additional icons
echo "Generating additional icons..."

# Favicon
convert "$BASE_ICON" -resize "32x32" "favicon-32x32.png"
convert "$BASE_ICON" -resize "16x16" "favicon-16x16.png"

# Apple Touch Icons
convert "$BASE_ICON" -resize "180x180" "apple-touch-icon-180x180.png"
convert "$BASE_ICON" -resize "152x152" "apple-touch-icon-152x152.png"
convert "$BASE_ICON" -resize "120x120" "apple-touch-icon-120x120.png"

# Android Chrome Icons
convert "$BASE_ICON" -resize "192x192" "android-chrome-192x192.png"
convert "$BASE_ICON" -resize "512x512" "android-chrome-512x512.png"

# Shortcut icons
convert "$BASE_ICON" -resize "96x96" -fill "#4ade80" -colorize 20% "shortcut-meal.png"
convert "$BASE_ICON" -resize "96x96" -fill "#3b82f6" -colorize 20% "shortcut-dashboard.png"
convert "$BASE_ICON" -resize "96x96" -fill "#f59e0b" -colorize 20% "shortcut-progress.png"

# Badge icon for notifications
convert "$BASE_ICON" -resize "72x72" -alpha set -channel A -evaluate multiply 0.9 "badge-72x72.png"

echo "✅ All icons generated successfully!"
echo ""
echo "Next steps for iOS app:"
echo "1. Copy icons to your iOS project's Assets.xcassets/AppIcon.appiconset/"
echo "2. Update your Info.plist with the configuration from ios-config.json"
echo "3. Add icons to public/icons/ directory for PWA functionality"
echo ""
echo "Icon files generated:"
ls -la *.png | grep -E "(icon-|apple-touch|android-chrome|shortcut-|badge-|favicon-)"