# PWA Icon Update Guide

## Issue
PWA app icons are not updating after installation due to aggressive browser caching.

## Solution Implemented

### 1. Cache Busting
- Updated manifest.json link in index.html with version parameter: `?v=2.0.1`
- Added version parameters to all icon URLs in manifest.json: `?v=2.0`
- Updated service worker cache version to force refresh: `bytewise-v2.0.1`

### 2. Service Worker Updates
- Incremented all cache versions (static, dynamic, API, icons)
- Added proper icon caching with versioning
- Service worker will now delete old caches on activation

### 3. Icon Files Verified
All icon files are present in the correct locations:
- `/apple-icon.png` (180x180)
- `/apple-touch-icon.png` (180x180)
- `/icons/icon-192x192.png`
- `/icons/icon-512x512.png`
- Multiple sizes for comprehensive device support

## User Instructions to Update PWA Icon

### For iOS (iPhone/iPad):
1. Open Safari
2. Go to Settings > Safari > Clear History and Website Data
3. Remove the app from home screen (long press and delete)
4. Visit https://bytewisenutritionist.com
5. Tap the Share button and "Add to Home Screen"
6. The new icon should now appear

### For Android:
1. Open Chrome
2. Go to Settings > Privacy > Clear browsing data
3. Select "Cached images and files"
4. Remove the app from home screen
5. Visit https://bytewisenutritionist.com
6. Tap the three dots menu and "Add to Home screen"
7. The new icon should now appear

### For Desktop Chrome/Edge:
1. Go to chrome://settings/content/all (or edge://settings/content/all)
2. Find bytewisenutritionist.com and delete its data
3. Uninstall the PWA if installed
4. Visit https://bytewisenutritionist.com
5. Click the install icon in the address bar
6. The new icon should now appear

## Technical Details

### Files Updated:
- `index.html` - Manifest link with cache busting
- `public/manifest.json` - All icon URLs with version parameters
- `sw.js` - Updated cache versions and icon handling

### Cache Strategy:
- Static assets are cached with version control
- Icons are specifically cached in a separate cache
- Old caches are automatically deleted on service worker activation
- Manifest changes trigger new downloads

## Verification
After clearing cache and reinstalling:
1. The app icon should show the ByteWise "b" logo
2. Service worker should show version 2.0.1 in DevTools
3. All icon requests should include ?v=2.0 parameter

## Future Updates
When updating icons in the future:
1. Increment version in manifest.json link
2. Increment version parameters on all icon URLs
3. Update service worker CACHE_NAME version
4. Document the change with date and version