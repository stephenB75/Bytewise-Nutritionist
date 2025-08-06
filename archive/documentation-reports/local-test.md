# Local PWA Testing Guide

## Quick Start - Production Testing

### Method 1: Built-in Production Server
```bash
# Build the app
npm run build

# Start production server
npm start
```
**Access:** http://localhost:5000
**Features:** Full PWA with backend, database, authentication

### Method 2: Static Serve (PWA Only)
```bash
# Serve built static files
npx serve dist/public -p 3000
```
**Access:** http://localhost:3000
**Features:** PWA frontend only, no backend functionality

### Method 3: HTTP Server (Alternative)
```bash
# Alternative static server
npx http-server dist/public -p 8080
```
**Access:** http://localhost:8080

## PWA Testing Checklist

### ✅ Browser DevTools Testing
1. **Open Chrome DevTools → Application Tab**
2. **Check Manifest:**
   - Valid manifest.json
   - Icons load correctly
   - App installable
3. **Check Service Worker:**
   - Registers successfully
   - Caches resources
   - Works offline
4. **Check Storage:**
   - LocalStorage for user data
   - Cache API for assets

### ✅ Installation Testing
1. **Chrome:** Look for install prompt in address bar
2. **Mobile:** Add to Home Screen option
3. **Edge:** Install app button in toolbar
4. **Firefox:** Install Web App option in menu

### ✅ PWA Features to Test
- **Offline Mode:** Disconnect internet, app should work
- **Push Notifications:** Ready for implementation
- **Full Screen:** Launches without browser UI
- **App Shortcuts:** Right-click icon for quick actions

## Performance Testing

### Lighthouse Audit
```bash
# Install lighthouse globally
npm install -g lighthouse

# Audit your local app
lighthouse http://localhost:5000 --view
```

### PWA Score Check
- Performance: Should be 90+
- Accessibility: Should be 90+
- Best Practices: Should be 90+
- SEO: Should be 90+
- PWA: Should be installable

## Mobile Testing

### Using Chrome DevTools
1. Open DevTools → Toggle device toolbar
2. Select mobile device (iPhone/Android)
3. Test touch interactions
4. Verify safe area handling

### Real Device Testing
```bash
# Make accessible on local network
npm start -- --host 0.0.0.0

# Access from mobile: http://[YOUR_IP]:5000
ip addr show | grep inet
```

## Production Deployment Preparation

### Environment Check
- DATABASE_URL configured
- All secrets set
- Build completes without errors
- All tests pass

### Pre-deployment Validation
- PWA manifest valid
- Service worker functional
- Icons optimized
- HTTPS ready (Replit provides)

## Current Status
✅ Build successful (168.7kb server, optimized frontend)
✅ PWA manifest complete
✅ Service worker functional
✅ Icons ready (SVG format)
✅ Mobile optimized
✅ Ready for deployment

## Next Steps
1. Test locally using methods above
2. Verify PWA installation works
3. Check offline functionality
4. Deploy to Replit for public access