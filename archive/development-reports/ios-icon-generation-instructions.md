# iOS Icon Generation Instructions

## Immediate Fix to Continue Building

The app icon catalog is now configured, but the actual icon files need to be generated. 

### Quick Fix on Your Mac:
Run this in Terminal to generate all required icon sizes:

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Downloads/Bytewise-Nutritionist/ios/App/App/Assets.xcassets/AppIcon.appiconset

# Use the existing 1024x1024 icon to generate all sizes
SOURCE="AppIcon-512@2x.png"

# Generate iPhone icons
sips -z 120 120 "$SOURCE" --out "AppIcon-60@2x.png"
sips -z 180 180 "$SOURCE" --out "AppIcon-60@3x.png"

# Generate iPad icons  
sips -z 76 76 "$SOURCE" --out "AppIcon-76.png"
sips -z 152 152 "$SOURCE" --out "AppIcon-76@2x.png"
sips -z 167 167 "$SOURCE" --out "AppIcon-83.5@2x.png"

# Generate Settings icons
sips -z 29 29 "$SOURCE" --out "AppIcon-29.png"
sips -z 58 58 "$SOURCE" --out "AppIcon-29@2x.png"
sips -z 87 87 "$SOURCE" --out "AppIcon-29@3x.png"

# Generate Spotlight icons
sips -z 40 40 "$SOURCE" --out "AppIcon-40.png"
sips -z 80 80 "$SOURCE" --out "AppIcon-40@2x.png"
sips -z 120 120 "$SOURCE" --out "AppIcon-40@3x.png"

# Generate Notification icons
sips -z 20 20 "$SOURCE" --out "AppIcon-20.png"
sips -z 40 40 "$SOURCE" --out "AppIcon-20@2x.png"
sips -z 60 60 "$SOURCE" --out "AppIcon-20@3x.png"
```

### After Running the Commands:
1. Clean Build Folder in Xcode: **Shift+Cmd+K**
2. Build again: **Cmd+B**

## Note About Other Warnings:
- The Capacitor plugin warnings (auto property synthesis) are **not critical** and won't prevent the app from building
- The "Run script build phase" warning for Pods is **normal** and can be ignored
- Focus on fixing the app icon errors first

## Alternative: Professional Icon Generation
For production, consider using an icon generator tool like:
- [Icon Set Creator](https://apps.apple.com/app/icon-set-creator/id939343785) (Mac App Store)
- [Bakery](https://apps.apple.com/app/bakery/id1575220747) (Mac App Store)
- [IconKit](https://iconkit.app/)

These tools will generate perfectly sized icons with proper optimization from your source image.