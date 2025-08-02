# PWABuilder iOS Error Fix

## Issue:
PWABuilder iOS service returns "500 Internal Server Error" with "415 Unsupported Media Type" when processing SVG icons.

## Root Cause:
PWABuilder's iOS image generator service only accepts PNG format icons for iOS app package creation.

## Solution Applied:

### 1. Updated Manifest
- Added PNG icon entries alongside SVG icons
- PWABuilder will use PNG icons for iOS package generation
- SVG icons remain for web PWA functionality

### 2. Icon Format Strategy
- **SVG Icons**: For web PWA, browser compatibility, vector scaling
- **PNG Icons**: For PWABuilder iOS service, native app generation

### 3. Manifest Changes
```json
{
  "icons": [
    // SVG icons for web PWA
    { "src": "icon-192.svg", "type": "image/svg+xml", "purpose": "any" },
    { "src": "icon-512.svg", "type": "image/svg+xml", "purpose": "any" },
    
    // PNG icons for PWABuilder iOS
    { "src": "icon-192.png", "type": "image/png", "purpose": "any" },
    { "src": "icon-512.png", "type": "image/png", "purpose": "any" }
  ]
}
```

## Additional Fix - React Native Configuration:
PWABuilder iOS service also requires React Native app configuration files.

### Files Added:
- **app.json**: Expo/React Native configuration with proper app metadata
- **package.json**: React Native package configuration for PWABuilder

### Configuration Details:
- Bundle ID: `com.bytewise.nutritionist`
- App name: ByteWise Nutritionist
- Icons and splash screen configured
- iOS and Android platform settings

## Next Steps:
1. Create actual PNG versions of your ByteWise icons (192x192, 512x512)
2. Upload complete deployment package to GitHub Pages
3. Retry PWABuilder iOS package generation
4. Both PNG icons and React Native config will resolve PWABuilder errors

## Icon Creation Options:
- Use online SVG to PNG converters
- Use design tools (Figma, Canva, Photoshop)
- Use command line tools (ImageMagick, Inkscape)
- Create new 192x192 and 512x512 PNG icons with ByteWise branding