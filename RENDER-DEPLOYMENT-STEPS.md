# 🚀 Deploy Your Backend to Render - Quick Steps

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `bytewise-backend`
3. Set to Private (recommended) or Public
4. **Don't** initialize with README
5. Click "Create repository"

## Step 2: Push Your Code to GitHub

Copy and run these commands in your terminal:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/bytewise-backend.git
git branch -M main
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## Step 3: Deploy on Render

1. Go to: https://render.com
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your `bytewise-backend` repository
5. Click **"Connect"**

## Step 4: Configure Service

Use these exact settings:

- **Name**: `bytewise-backend`
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

## Step 5: Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

```
NODE_ENV = production
PORT = 10000
VITE_SUPABASE_URL = https://bcfilsryfjwemqytwbvr.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk
DATABASE_URL = [Get from Supabase - see below]
VITE_USDA_API_KEY = z4YPCZm0HAL1SLXe9sRhXXRG8meDjQDBkGqE7hqY
```

### To get DATABASE_URL:
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to Settings → Database
4. Copy "Connection string" (URI format)
5. It looks like: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend URL will be: `https://bytewise-backend.onrender.com`

## Step 7: Test Your Backend

Once deployed, test these URLs:
- Health Check: https://bytewise-backend.onrender.com/api/health
- Should return: `{"status":"healthy","services":{"database":"connected"}}`

## Step 8: Update Frontend Configuration

After your backend is live, I'll update your frontend to use the new backend URL.

## ⚠️ Important Notes

- **First deployment** takes 5-10 minutes
- **Free tier** spins down after 15 minutes of inactivity
- **First request** after sleep takes ~30 seconds (cold start)
- This is normal for free tier

## Need Help?

If you see errors in Render logs:
1. Check all environment variables are set
2. Verify DATABASE_URL is correct
3. Make sure build succeeds

Let me know once you've completed Step 6 and I'll update your frontend!