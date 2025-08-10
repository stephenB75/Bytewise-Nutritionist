# ByteWise Nutritionist - Custom Domain Deployment Guide
## Domain: bytewisenutritionist.com

This guide provides comprehensive instructions for deploying the ByteWise Nutritionist app to your custom domain.

## 📋 Prerequisites

1. Domain ownership of `bytewisenutritionist.com`
2. Access to your domain registrar's DNS settings
3. Vercel account (free tier works)
4. GitHub account (for repository hosting)

## 🚀 Deployment Steps

### Step 1: Prepare the Codebase

The application is already configured for your custom domain with:
- ✅ URL detection for bytewisenutritionist.com
- ✅ API routing configured
- ✅ Production environment settings
- ✅ HTTPS enforced for custom domain

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Deploy the application**:
```bash
vercel --prod
```

3. **Follow the prompts**:
   - Select your account
   - Link to existing project or create new
   - Use default settings for build

### Step 3: Configure Custom Domain

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Domains" section
   - Add `bytewisenutritionist.com`
   - Add `www.bytewisenutritionist.com`

2. **DNS Configuration** (at your domain registrar):

   **Option A: Using Vercel's nameservers (Recommended)**
   - Change nameservers to:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`

   **Option B: Using A and CNAME records**
   - Add A record:
     - Name: `@`
     - Value: `76.76.21.21`
   
   - Add CNAME record:
     - Name: `www`
     - Value: `cname.vercel-dns.com`

### Step 4: Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# USDA API
VITE_USDA_API_KEY=z4YPCZm0HAL1SLXe9sRhXXRG8meDjQDBkGqE7hqY

# Database URL (if using external database)
DATABASE_URL=postgresql://...

# Node Environment
NODE_ENV=production
```

### Step 5: Build Optimization

The app is configured with:
- **PWA Support**: Installable on mobile devices
- **Service Worker**: Offline capability
- **Optimized Assets**: Compressed and cached
- **Mobile-First**: Touch-optimized interface

### Step 6: Verify Deployment

1. **Check DNS propagation**:
   - Visit: https://dnschecker.org
   - Enter: bytewisenutritionist.com
   - Verify global propagation

2. **Test functionality**:
   - [ ] Homepage loads at https://bytewisenutritionist.com
   - [ ] User authentication works
   - [ ] Food search and logging functional
   - [ ] Recipe creation saves properly
   - [ ] Meal planning features work
   - [ ] PDF export generates correctly

## 🔧 Alternative Deployment Options

### Using Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Add `_redirects` file** in public folder:
```
/api/* https://your-backend-url.com/api/:splat 200
/* /index.html 200
```

### Using GitHub Pages (Static Only)

Note: GitHub Pages doesn't support server-side functionality. Use only if deploying frontend with external API.

1. Update `vite.config.ts` base URL
2. Deploy using GitHub Actions
3. Configure custom domain in repository settings

## 📱 Mobile App Distribution

### PWA Installation
Users can install the app directly from the browser:
1. Visit https://bytewisenutritionist.com
2. Click "Install App" when prompted
3. Or use browser menu > "Add to Home Screen"

### iOS App Store (Future)
- Use included Capacitor configuration
- Follow iOS deployment guide in `iOS-Build-Instructions.md`

### Android Play Store (Future)
- Use included Capacitor configuration
- Build APK using `npm run build:android`

## 🔍 Monitoring & Analytics

Consider adding:
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and monitoring

## 🛠️ Troubleshooting

### Domain Not Resolving
- Wait 24-48 hours for DNS propagation
- Clear browser cache and DNS cache
- Verify DNS records are correct

### SSL Certificate Issues
- Vercel automatically provisions SSL
- If issues persist, remove and re-add domain

### API Connection Issues
- Verify environment variables are set
- Check CORS configuration
- Ensure API endpoints are accessible

### Build Failures
- Check Node version (use v20+)
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Domain Setup Guide**: https://vercel.com/docs/concepts/projects/custom-domains
- **Troubleshooting**: https://vercel.com/guides

## ✅ Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] SSL certificate active
- [ ] All features functional
- [ ] Mobile responsive design works
- [ ] PWA installation works
- [ ] Performance optimized (check with Lighthouse)
- [ ] SEO meta tags present
- [ ] Analytics configured
- [ ] Error monitoring active
- [ ] Backup strategy in place

## 🎉 Congratulations!

Your ByteWise Nutritionist app is now live at https://bytewisenutritionist.com

Remember to:
- Monitor performance regularly
- Keep dependencies updated
- Backup your database
- Collect user feedback for improvements

For questions or issues, refer to the main documentation or open an issue in the repository.