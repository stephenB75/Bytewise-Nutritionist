# Railway Environment Variables Setup

## 🚀 Quick Setup Guide

Since Railway CLI requires interactive login, here's how to set up your environment variables:

### Method 1: Railway Web Dashboard (Recommended)

1. **Go to**: https://railway.app/dashboard
2. **Select your project**: ByteWise-Nutritionist
3. **Click "Variables" tab**
4. **Add these variables**:

## 📋 Required Environment Variables

### Basic Configuration (Minimum Required)
```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
VITE_DEVELOPMENT_MODE=false
```

### Database Configuration (Critical)
```bash
# Get this from Railway PostgreSQL or Supabase
DATABASE_URL=postgresql://username:password@hostname:port/database
```

### Supabase Configuration
```bash
# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase API keys
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### API Keys
```bash
# USDA API key for nutrition data
USDA_API_KEY=your-usda-api-key-here

# RevenueCat for subscriptions (optional)
REACT_APP_REVENUECAT_API_KEY=your-revenuecat-key-here
```

### App URL (Set after deployment)
```bash
# Your Railway app URL (will be provided after deployment)
APP_URL=https://your-app-name.railway.app
```

## 🔑 How to Get Your Keys

### 1. Database URL
**Option A: Railway PostgreSQL (Easiest)**
- In Railway dashboard → "New" → "Database" → "PostgreSQL"
- Copy the generated DATABASE_URL

**Option B: Supabase Database**
- Go to Supabase project → Settings → Database
- Copy the connection string

### 2. Supabase Keys
- Go to your Supabase project dashboard
- Go to Settings → API
- Copy the Project URL and API keys

### 3. USDA API Key
- Go to https://fdc.nal.usda.gov/api-guide.html
- Sign up for a free API key
- Copy the key

## 🚀 After Setting Variables

1. Railway will automatically redeploy
2. Check the deployment logs
3. Visit your app URL to test
4. Health check: `https://your-app.railway.app/health`

## ⚠️ Important Notes

- Variables are case-sensitive
- Don't include quotes around values in Railway dashboard
- Start with basic variables first, then add API keys
- Railway encrypts all variables for security
