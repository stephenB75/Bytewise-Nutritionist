# Railway Deployment Troubleshooting Guide

## 🚨 Common Deployment Issues & Solutions

### 1. **Health Check Failures**

**Symptoms:**
- Deployment shows "Health check failed"
- App starts but Railway can't reach it

**Solutions:**
```bash
# Check if these variables are set in Railway:
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
```

**Debug Steps:**
1. Go to Railway dashboard → Your project → Deployments
2. Click on the latest deployment
3. Check the logs for errors
4. Look for "Health check" messages

### 2. **Database Connection Errors**

**Symptoms:**
- App crashes with "DATABASE_URL is missing"
- Database connection timeouts

**Solutions:**
```bash
# Ensure DATABASE_URL is set in Railway variables
DATABASE_URL=postgresql://username:password@hostname:port/database

# If using Railway PostgreSQL:
# 1. Go to Railway dashboard
# 2. Click "New" → "Database" → "PostgreSQL"
# 3. Copy the generated DATABASE_URL
```

### 3. **Build Failures**

**Symptoms:**
- Build process fails during Docker build
- "Failed to solve" errors

**Solutions:**
- Check Railway logs for specific build errors
- Ensure all files are committed to GitHub
- Verify Dockerfile syntax

### 4. **Port Binding Issues**

**Symptoms:**
- App starts but not accessible
- "Address already in use" errors

**Solutions:**
```bash
# Ensure these are set in Railway:
HOST=0.0.0.0
PORT=5000
```

### 5. **Environment Variable Issues**

**Symptoms:**
- App starts but features don't work
- API calls fail

**Solutions:**
- Verify all required variables are set
- Check variable names are correct (case-sensitive)
- Ensure no extra spaces or quotes

## 🔍 Debugging Steps

### Step 1: Check Railway Logs
1. Go to Railway dashboard
2. Select your project
3. Click "Deployments"
4. Click on the latest deployment
5. Check "Logs" tab

### Step 2: Test Health Endpoint
Once deployed, test:
```
https://your-app.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production",
  "version": "BETA 4.2"
}
```

### Step 3: Check Environment Variables
In Railway dashboard → Variables tab, verify:
- All required variables are set
- No typos in variable names
- Values don't have extra quotes

## 🚀 Quick Fixes

### Fix 1: Reset Deployment
1. Go to Railway dashboard
2. Click "Settings" → "General"
3. Click "Redeploy" or "Deploy Latest"

### Fix 2: Check Build Logs
1. Go to Railway dashboard
2. Click "Deployments"
3. Look for build errors in logs
4. Check if Docker build completed successfully

### Fix 3: Verify Variables
1. Go to Railway dashboard → Variables
2. Ensure these are set:
   - `NODE_ENV=production`
   - `HOST=0.0.0.0`
   - `PORT=5000`
   - `DATABASE_URL=your-database-url`

## 📋 Required Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `HOST=0.0.0.0`
- [ ] `PORT=5000`
- [ ] `VITE_DEVELOPMENT_MODE=false`
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `VITE_SUPABASE_URL=https://...`
- [ ] `VITE_SUPABASE_ANON_KEY=...`
- [ ] `SUPABASE_URL=https://...`
- [ ] `SUPABASE_ANON_KEY=...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=...`
- [ ] `USDA_API_KEY=...`

## 🆘 Still Having Issues?

1. **Check Railway Status**: https://status.railway.app/
2. **Railway Discord**: https://discord.gg/railway
3. **Railway Docs**: https://docs.railway.app/

## 📞 Need Help?

Share the specific error message from Railway logs, and I can help you fix it!
