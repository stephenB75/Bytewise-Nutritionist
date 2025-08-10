# 🚀 Moving Backend to Render - Step by Step Guide
## ByteWise Nutritionist Backend Deployment

This guide will help you move your backend from Replit to Render for reliable production deployment.

## Why Render?
✅ **Free tier** (750 hours/month)
✅ **Automatic deploys** from GitHub
✅ **Built for Node.js/Express**
✅ **No credit card required**
✅ **Reliable uptime**

## Prerequisites
- GitHub account (to push your code)
- Your Supabase credentials

## Step 1: Push Code to GitHub

1. Create a new GitHub repository:
   - Go to [github.com/new](https://github.com/new)
   - Name it: `bytewise-backend`
   - Make it private or public
   - Don't initialize with README

2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial backend deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bytewise-backend.git
   git push -u origin main
   ```

## Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

## Step 3: Deploy Backend to Render

1. In Render Dashboard, click **"New +"** → **"Web Service"**

2. Connect your GitHub repository:
   - Select `bytewise-backend` repository
   - Click **"Connect"**

3. Configure your service:
   - **Name**: `bytewise-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV                    = production
   PORT                        = 10000
   VITE_SUPABASE_URL          = https://bcfilsryfjwemqytwbvr.supabase.co
   VITE_SUPABASE_ANON_KEY     = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk
   DATABASE_URL               = [Your Supabase connection string]
   VITE_USDA_API_KEY          = z4YPCZm0HAL1SLXe9sRhXXRG8meDjQDBkGqE7hqY
   ```

   **To get DATABASE_URL**:
   - Go to your Supabase project
   - Settings → Database
   - Copy the "Connection string" (URI format)

5. Click **"Create Web Service"**

6. Wait for deployment (5-10 minutes)
   - Your backend URL will be: `https://bytewise-backend.onrender.com`
   - Test it: `https://bytewise-backend.onrender.com/api/health`

## Step 4: Update Frontend to Use New Backend

### Update the configuration file:

In `client/src/lib/config.ts`:

```typescript
// Production with independent backend
if (isCustomDomain || isProd) {
  // Use Render backend for production
  return 'https://bytewise-backend.onrender.com/api';
}
```

### Update CORS in backend:

In `server/index.ts`, ensure CORS allows your domain:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://bytewisenutritionist.com', 'https://www.bytewisenutritionist.com']
  : ['http://localhost:5173'];
```

## Step 5: Deploy Frontend Changes

1. Commit and push your changes to GitHub
2. Deploy from Replit or redeploy on your current frontend host
3. Test the connection

## Step 6: Verify Everything Works

Test these endpoints:
1. Health Check: `https://bytewise-backend.onrender.com/api/health`
2. Your Website: `https://bytewisenutritionist.com`
3. Check Dashboard: Meals should load
4. Test Login: Authentication should work

## Troubleshooting

### If backend doesn't start:
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure build command succeeds

### If frontend can't connect:
- Check CORS settings
- Verify API URL in config.ts
- Check browser console for errors

### If database errors occur:
- Verify DATABASE_URL is correct
- Check Supabase credentials
- Ensure database is accessible

## Important Notes

⚠️ **Free Tier Limitations**:
- Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Consider upgrading to paid tier ($7/month) for always-on service

## Alternative Providers

If Render doesn't work for you:

1. **Railway** ($5/month)
   - No cold starts
   - Better performance
   - [railway.app](https://railway.app)

2. **Fly.io** (Free allowance)
   - Global deployment
   - Better for international users
   - [fly.io](https://fly.io)

3. **DigitalOcean App Platform** ($5/month)
   - Very reliable
   - Good support
   - [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)

## Support

If you encounter issues:
1. Check Render logs for errors
2. Verify all environment variables
3. Ensure GitHub connection is working
4. Test API endpoints directly

Your backend will now be independent from Replit and more reliable for production use!