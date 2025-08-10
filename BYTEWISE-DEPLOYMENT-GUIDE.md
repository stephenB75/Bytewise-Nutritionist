# 🚀 Deploy ByteWise Nutritionist to bytewisenutiritionist.com

## Quick Deployment Options (Choose One)

### Option 1: Vercel (Easiest - 5 minutes)
**Best for:** Quick deployment with automatic SSL and global CDN

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Choose "Continue with existing project"
   - Link to your project

3. **Add Custom Domain**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add `bytewisenutiritionist.com`
   - Update DNS at your domain registrar:
     - A Record: @ → 76.76.21.21
     - CNAME: www → cname.vercel-dns.com

### Option 2: Netlify (Simple with GitHub)
**Best for:** Git-based deployments with automatic builds

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Drag `dist` folder to Netlify dashboard
   - Or connect GitHub repository

3. **Add Domain**
   - Go to Site Settings → Domain Management
   - Add `bytewisenutiritionist.com`
   - Update DNS:
     - A Record: @ → 75.2.60.5
     - CNAME: www → your-site.netlify.app

### Option 3: DigitalOcean App Platform
**Best for:** Full-stack apps with managed database

1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Connect GitHub or upload code
   - Choose "Web Service"

2. **Configure**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - HTTP Port: 3000

3. **Add Domain**
   - In App Settings → Domains
   - Add `bytewisenutiritionist.com`
   - Update DNS to DigitalOcean nameservers

### Option 4: VPS Deployment (Full Control)
**Best for:** Complete control and customization

1. **Get a VPS** (DigitalOcean, Linode, AWS EC2)
   - Ubuntu 22.04 recommended
   - 2GB RAM minimum

2. **Run deployment script**
   ```bash
   ./deploy-external.sh
   scp -r deployment-package/* root@your-server-ip:/var/www/bytewise/
   ```

3. **On your server**
   ```bash
   ssh root@your-server-ip
   cd /var/www/bytewise
   npm install --production
   pm2 start npm --name bytewise -- start
   ```

## Environment Variables (Required for All Options)

Create these in your hosting platform's dashboard:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Production
NODE_ENV=production
VITE_APP_URL=https://bytewisenutiritionist.com
```

## Database Setup

### Option A: Use Existing Supabase
Your current Supabase database will work. Just use the same credentials.

### Option B: New Production Database
1. Create new Supabase project at [supabase.com](https://supabase.com)
2. Run migrations:
   ```bash
   npm run db:push
   ```

## DNS Configuration

At your domain registrar (GoDaddy, Namecheap, etc.):

### For Vercel:
- A Record: @ → 76.76.21.21
- CNAME: www → cname.vercel-dns.com

### For Netlify:
- A Record: @ → 75.2.60.5
- CNAME: www → your-site.netlify.app

### For VPS:
- A Record: @ → Your Server IP
- A Record: www → Your Server IP

## Post-Deployment Checklist

- [ ] Site loads at https://bytewisenutiritionist.com
- [ ] SSL certificate active (green padlock)
- [ ] Login/signup works
- [ ] Food search returns results
- [ ] Meal logging saves data
- [ ] PWA installs on mobile
- [ ] Icons show ByteWise branding

## Quick Commands

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

## Support

- **Domain issues:** Check DNS propagation at [dnschecker.org](https://dnschecker.org)
- **SSL issues:** Wait 10-30 minutes after DNS changes
- **Database issues:** Check environment variables are set correctly

Your ByteWise Nutritionist app will be live at **https://bytewisenutiritionist.com** within minutes!