# Better Local Development Setup

## Current Development Options

### 1. Standard Development (Current)
```bash
npm run dev
```
- **URL:** http://localhost:5000
- **Features:** Hot reload, full backend, database
- **Best for:** General development work

### 2. Mobile Testing (Network Access)
```bash
# Get your local IP address
ip addr show | grep "inet 192.168\|inet 10\." | head -1

# Start server accessible on network
HOST=0.0.0.0 npm run dev
```
- **URL:** http://[YOUR_IP]:5000 
- **Features:** Test on real mobile devices
- **Best for:** Mobile PWA testing, responsive design

### 3. Production Testing
```bash
# Build and test production version
npm run build
NODE_ENV=production node dist/index.js
```
- **URL:** http://localhost:5000
- **Features:** Production optimizations, service worker
- **Best for:** Final testing before deployment

### 4. Static PWA Testing (Frontend Only)
```bash
# Build first
npm run build

# Serve static files only
npx serve dist/public -p 3000
```
- **URL:** http://localhost:3000
- **Features:** PWA installation testing, no backend
- **Best for:** PWA features, offline testing

## Advanced Development Options

### Database Management
```bash
# Push schema changes
npm run db:push

# View database in browser (if available)
npm run db:studio
```

### Performance Testing
```bash
# Install lighthouse globally
npm install -g lighthouse

# Audit your app
lighthouse http://localhost:5000 --view

# Mobile audit
lighthouse http://localhost:5000 --preset=mobile --view
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Or specific modules
DEBUG=express:* npm run dev
```

## Quick Setup Scripts

### Create development helpers
```bash
# Create quick-start script
cat > dev-mobile.sh << 'EOF'
#!/bin/bash
echo "Starting mobile-accessible development server..."
echo "Network interfaces:"
ip addr show | grep -E "inet (192\.168\.|10\.|172\.)" | head -3
echo ""
echo "Access from mobile device using one of the IPs above"
HOST=0.0.0.0 npm run dev
EOF

chmod +x dev-mobile.sh
```

### Production test script
```bash
# Create production test helper
cat > test-prod.sh << 'EOF'
#!/bin/bash
echo "Building and testing production version..."
npm run build
echo "Starting production server..."
NODE_ENV=production PORT=5001 node dist/index.js &
SERVER_PID=$!
sleep 3
echo "Production server running at: http://localhost:5001"
echo "Stop with: kill $SERVER_PID"
EOF

chmod +x test-prod.sh
```

## Recommended Development Workflow

### Daily Development
1. **Start:** `npm run dev` (standard development)
2. **Mobile Check:** `./dev-mobile.sh` (test on devices)
3. **Pre-deploy:** `./test-prod.sh` (production verification)

### PWA Development
1. **Feature dev:** Standard development server
2. **PWA testing:** Static serve for installation testing
3. **Service worker:** Production build for caching verification

### Performance Optimization
1. **Lighthouse audit:** Regular performance checks
2. **Network testing:** Mobile network simulation
3. **Bundle analysis:** Check build output for optimization

## Current Advantages

Your Replit setup already provides:
- **Auto-restart** on file changes
- **Environment variables** automatically loaded
- **Database** pre-configured and accessible
- **HTTPS** available via Replit domains
- **Port management** handled automatically

## Best Practices

- Use network-accessible mode for real device testing
- Run production builds before deployment
- Regular lighthouse audits for performance
- Test PWA installation on multiple browsers
- Verify offline functionality with service worker

Your development environment is already well-optimized for PWA development!