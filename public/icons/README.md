# ByteWise App Icons

This directory contains all the app icons needed for iOS and PWA deployment.

## Icon Requirements

### For iOS App Store:
- **1024x1024px** - App Store icon (required)
- **180x180px** - iPhone app icon
- **120x120px** - iPhone app icon (smaller sizes)
- **152x152px** - iPad app icon
- **76x76px** - iPad app icon (smaller)

### For PWA/Web:
- **512x512px** - PWA icon (large)
- **192x192px** - PWA icon (standard)
- **72x72px** - Android Chrome icon
- **32x32px** - Favicon
- **16x16px** - Favicon (small)

## How to Generate Icons

1. **Create your base icon:**
   - Design a 1024x1024px PNG image
   - Use simple, clear design that works at small sizes
   - Follow iOS Human Interface Guidelines
   - Save as `icon-base-1024.png` in this directory

2. **Run the generation script:**
   ```bash
   cd public/icons
   ./generate-icons.sh
   ```

3. **Manual setup in Xcode:**
   - Open your iOS project in Xcode
   - Navigate to Assets.xcassets → AppIcon.appiconset
   - Drag and drop the generated icons to their respective slots

## Icon Design Guidelines

### iOS Guidelines:
- **Simple and memorable** - avoid complex details
- **Recognizable at all sizes** - test at 20x20px
- **No text** - icons should be purely visual
- **Consistent with brand** - use your app's color scheme
- **Rounded corners** - iOS automatically applies corner radius
- **No transparency** - use solid background

### Brand Colors for ByteWise:
- **Primary:** #a8dadc (teal)
- **Secondary:** #fef7cd (cream)
- **Accent:** #457b9d (dark blue)

## Files Generated

After running the script, you'll have:

```
icon-20.png          - iOS Settings
icon-29.png          - iOS Settings
icon-40.png          - iOS Spotlight
icon-58.png          - iOS Settings @2x
icon-60.png          - iOS Home Screen
icon-76.png          - iPad Home Screen
icon-80.png          - iOS Spotlight @2x
icon-87.png          - iOS Settings @3x
icon-120.png         - iOS Home Screen @2x
icon-152.png         - iPad Home Screen @2x
icon-167.png         - iPad Pro Home Screen
icon-180.png         - iOS Home Screen @3x
icon-1024.png        - App Store

icon-72x72.png       - PWA
icon-96x96.png       - PWA
icon-128x128.png     - PWA
icon-144x144.png     - PWA
icon-152x152.png     - PWA
icon-192x192.png     - PWA
icon-384x384.png     - PWA
icon-512x512.png     - PWA

favicon-16x16.png    - Browser favicon
favicon-32x32.png    - Browser favicon

apple-touch-icon-*.png  - iOS Safari
android-chrome-*.png    - Android Chrome
```

## Troubleshooting

### ImageMagick Not Found:
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# CentOS/RHEL
sudo yum install ImageMagick
```

### Icons Not Appearing in iOS:
1. Clean build folder in Xcode (Product → Clean Build Folder)
2. Delete app from simulator/device
3. Rebuild and reinstall

### PWA Icons Not Loading:
1. Check manifest.json references correct icon paths
2. Verify icons are in public/icons/ directory
3. Clear browser cache and service worker

## Testing Icons

### iOS:
- Test on actual devices with different screen densities
- Check App Store Connect for any icon issues
- Verify icons appear correctly in Settings and Spotlight

### PWA:
- Test installation on mobile browsers
- Verify home screen icon appears correctly
- Check favicon in browser tabs