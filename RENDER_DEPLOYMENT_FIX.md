# Render Deployment Fix Guide
## Date: August 10, 2025

## Issue: Render Deployment Failed ❌

### Most Common Causes & Solutions

## 1. Missing Build/Start Commands
**In Render Dashboard:**
- Click on "bytewise-backend" service
- Go to Settings
- Set these values:
  - **Build Command**: `npm install`
  - **Start Command**: `npm run start`

## 2. Missing Environment Variables
**Add these in Render Dashboard > Environment:**
```
SUPABASE_URL=https://bcfilsryfjwemqytwbvr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk
DATABASE_URL=postgresql://postgres.bcfilsryfjwemqytwbvr:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**IMPORTANT**: Replace [YOUR-PASSWORD] with your actual Supabase database password

## 3. Node Version Mismatch
**Add to package.json:**
```json
"engines": {
  "node": ">=18.0.0"
}
```

## 4. Port Configuration
**Render uses PORT environment variable**
Make sure your server listens on `process.env.PORT || 5000`

## Step-by-Step Fix Process

### Step 1: Check Deployment Logs
1. Click on "bytewise-backend" in Render
2. Go to "Logs" tab
3. Look for error messages (usually in red)
4. Common errors:
   - "Cannot find module" → Missing dependencies
   - "Invalid URL" → Wrong DATABASE_URL format
   - "Port already in use" → Port configuration issue

### Step 2: Fix Common Issues

#### If "Cannot find module" error:
- Make sure all dependencies are in package.json
- Don't use devDependencies for production packages

#### If "Invalid URL" error:
- DATABASE_URL must be a PostgreSQL connection string, not a JWT token
- Format: `postgresql://user:pass@host:port/database`

#### If Port error:
- Server must use `process.env.PORT`
- Don't hardcode port 5000

### Step 3: Redeploy
1. After fixing issues, go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Watch the logs for success

## Alternative: Quick Deployment to Railway

If Render continues to fail, deploy to Railway instead:

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - DATABASE_URL
6. Deploy automatically starts

## Verification Checklist

Once deployed successfully:
- [ ] Service shows "Live" status
- [ ] No errors in deployment logs
- [ ] Health endpoint responds: `curl https://bytewise-backend.onrender.com/api/health`
- [ ] Returns JSON with status "healthy"

## Current Backend Configuration

Your backend is configured to use Supabase directly, which simplifies deployment:
- No complex database setup needed
- Uses Supabase client for all operations
- Environment variables are the only requirement

## Next Steps After Successful Deployment

1. **Test the backend:**
   ```bash
   curl https://bytewise-backend.onrender.com/api/health
   ```

2. **Deploy frontend:**
   - Frontend already configured to use Render backend
   - Just click Deploy in Replit

3. **Verify complete system:**
   - Visit bytewisenutritionist.com
   - Test login, food search, meal logging

## Need More Help?

Check Render deployment logs and share any error messages. The most common issue is missing or incorrect environment variables.