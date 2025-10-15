# Railway Deployment Setup Guide

## 🎉 Docker Build Success!
Your Docker build issues are now completely resolved! The app is building and starting successfully.

## 🚨 Current Issue: Missing Environment Variables
The app is failing because it needs environment variables configured in Railway.

## 🛠️ Solution: Configure Environment Variables

### Method 1: Railway Web Dashboard (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Select your project**: ByteWise-Nutritionist
3. **Click on "Variables" tab**
4. **Add these environment variables**:

#### Required Environment Variables:

```bash
# Application Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=5000

# Database Configuration (CRITICAL - This is what's missing!)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# USDA API Configuration
USDA_API_KEY=your-usda-api-key

# RevenueCat Configuration (Optional)
REACT_APP_REVENUECAT_API_KEY=your-revenuecat-key

# Application URL
APP_URL=https://your-railway-app.railway.app

# Development Mode
VITE_DEVELOPMENT_MODE=false
```

### Method 2: Railway CLI (Alternative)

If you prefer using the CLI:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://username:password@hostname:port/database"
railway variables set NODE_ENV="production"
railway variables set HOST="0.0.0.0"
railway variables set PORT="5000"
# ... (add all other variables)
```

## 🔑 Getting Your Database URL

### Option A: Use Railway's PostgreSQL (Recommended)
1. In Railway dashboard, go to your project
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service
5. Add it to your environment variables

### Option B: Use Supabase Database
1. Go to your Supabase project dashboard
2. Go to Settings → Database
3. Copy the connection string
4. Use it as your `DATABASE_URL`

## 🚀 After Setting Variables

1. **Redeploy**: Railway will automatically redeploy when you add variables
2. **Check Logs**: Monitor the deployment logs
3. **Test Health Check**: Visit `https://your-app.railway.app/health`

## ✅ Expected Result

Once environment variables are set:
- ✅ App will start successfully
- ✅ Database connection will work
- ✅ Health check will pass
- ✅ Your app will be live!

## 🆘 Need Help?

If you need help getting your database URL or API keys, let me know and I can guide you through the process!
