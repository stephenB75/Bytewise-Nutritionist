# Bytewise Deployment Guide

## Deployment Overview

Bytewise is designed for serverless deployment with minimal configuration. The app can be deployed to various platforms with the same Supabase backend.

## Supabase Backend (Already Set Up)

Your Supabase backend is already configured and operational:
- ✅ Database schema applied
- ✅ Row Level Security policies active
- ✅ Authentication providers configured
- ✅ Real-time subscriptions enabled

## Frontend Deployment Options

### 1. Replit Deployment (Easiest)

**Current Status**: Your app is already running on Replit and ready for deployment.

**Steps to Deploy**:
1. Your app is already running at your Replit URL
2. For production deployment, click the "Deploy" button in Replit
3. Choose your deployment options
4. Your app will be live with automatic HTTPS and global CDN

**Benefits**:
- Zero configuration required
- Automatic HTTPS and custom domains
- Global CDN distribution
- Built-in monitoring and analytics

### 2. Vercel Deployment

**Prerequisites**:
- Vercel account
- GitHub repository (optional but recommended)

**Steps**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY  
# VITE_USDA_API_KEY
```

**Configuration** (vercel.json):
```json
{
  "build": {
    "env": {
      "VITE_SUPABASE_URL": "@supabase-url",
      "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
      "VITE_USDA_API_KEY": "@usda-api-key"
    }
  },
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

### 3. Netlify Deployment

**Steps**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the app
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Configuration** (_redirects file in public/):
```
/*    /index.html   200
```

**Environment Variables** (in Netlify dashboard):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_USDA_API_KEY`

### 4. Static File Hosting

Since Bytewise is a client-side app with serverless backend, you can deploy to any static hosting service:

**Build for Production**:
```bash
npm run build
```

**Deploy the `dist/` folder to**:
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages
- Surge.sh
- Any other static hosting

## Environment Variables

### Required Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables
```bash
VITE_USDA_API_KEY=your-usda-key-here
```

## PWA Configuration

### Service Worker
The app includes a service worker for:
- Offline functionality
- Background sync
- Push notifications
- App caching

### Web App Manifest
Located at `public/manifest.json` with:
- App icons (192px, 512px)
- Theme colors
- Display mode (standalone)
- Start URL configuration

### Installation Prompts
The app automatically detects:
- Chrome/Edge install prompts
- iOS Safari add-to-home-screen
- Android Chrome installation

## Production Optimizations

### Build Optimizations (Already Configured)
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: JavaScript and CSS compression
- **Image Optimization**: WebP conversion with fallbacks

### Performance Features
- **Lazy Loading**: Components and images load on demand
- **Caching Strategy**: Aggressive caching with cache invalidation
- **Preloading**: Critical resources preloaded
- **Compression**: Gzip/Brotli compression enabled

## Domain Configuration

### Custom Domain Setup
1. **Replit**: Add custom domain in deployment settings
2. **Vercel**: Add domain in project settings
3. **Netlify**: Configure domain in site settings

### SSL/HTTPS
All modern hosting platforms provide automatic HTTPS:
- Automatic certificate provisioning
- HTTP to HTTPS redirects
- Certificate renewal

## Monitoring & Analytics

### Built-in Monitoring
- **Supabase Dashboard**: Database performance and usage
- **Hosting Platform**: Traffic and performance metrics
- **Browser DevTools**: Performance profiling

### Optional Integrations
```typescript
// Add to your app for enhanced monitoring
- Google Analytics
- Sentry for error tracking
- LogRocket for user sessions
- Hotjar for user behavior
```

## Security Considerations

### Production Security Checklist
- ✅ HTTPS enforced everywhere
- ✅ Environment variables secured
- ✅ API keys properly scoped
- ✅ Database security policies active
- ✅ Content Security Policy headers
- ✅ CORS properly configured

### Supabase Security (Already Active)
- Row Level Security policies
- JWT token validation
- API rate limiting
- Database connection pooling

## Backup & Recovery

### Database Backups
**Supabase Pro Features** (if upgraded):
- Automatic daily backups
- Point-in-time recovery
- Cross-region replication

**Free Tier Backup Strategy**:
```sql
-- Export your data periodically
pg_dump --host=db.your-project.supabase.co --port=5432 --username=postgres --dbname=postgres > backup.sql
```

### Code Backup
- Git repository with version control
- Automated deployments from Git
- Multiple deployment environments

## Scaling Considerations

### Traffic Scaling
**Automatic Scaling** (no configuration needed):
- Supabase: Auto-scaling database connections
- Static hosting: Global CDN distribution
- Service worker: Client-side caching reduces server load

### Database Scaling
**Current Limits** (Supabase Free Tier):
- 500MB database storage
- 50,000 API requests/month
- 5GB bandwidth/month

**Upgrade Path**:
- Supabase Pro: $25/month for 8GB + auto-scaling
- Enterprise: Custom pricing for high-volume applications

### Feature Scaling
**Horizontal Scaling Ready**:
- Stateless frontend architecture
- Serverless backend functions
- CDN-cached static assets
- Database read replicas (Pro tier)

## Troubleshooting Deployment

### Common Issues

**Build Failures**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Environment Variable Issues**:
```bash
# Verify variables are set
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

**Database Connection Issues**:
```bash
# Test connection
node scripts/test-connection.js
```

**PWA Installation Issues**:
- Verify HTTPS is enabled
- Check manifest.json validity
- Ensure service worker is registered

### Support Resources
- **Supabase**: [Discord Community](https://discord.supabase.com)
- **Replit**: [Community Forum](https://replit.com/community)
- **Vercel**: [Documentation](https://vercel.com/docs)
- **Netlify**: [Support Forum](https://answers.netlify.com)

## Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Build optimizations enabled
- [ ] PWA manifest configured
- [ ] Service worker tested

### Post-Deployment
- [ ] App loads correctly
- [ ] Authentication working
- [ ] Database connections active
- [ ] PWA installation working
- [ ] Performance metrics acceptable
- [ ] Mobile responsiveness verified

Your Bytewise nutrition tracker is now ready for production deployment with a scalable, secure, and performant architecture!