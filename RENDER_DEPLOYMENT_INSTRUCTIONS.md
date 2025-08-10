# Render Deployment Instructions
## Fix Your Failed Deployment

## Step 1: Go to Render Dashboard
1. Click on "bytewise-backend" service
2. Go to "Logs" tab to see why it failed

## Step 2: Add Environment Variables
In Render Dashboard > Environment:

```
NODE_ENV=production
SUPABASE_URL=https://bcfilsryfjwemqytwbvr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk
DATABASE_URL=postgresql://postgres.bcfilsryfjwemqytwbvr:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**IMPORTANT**: Replace [YOUR-PASSWORD] with your actual Supabase database password

## Step 3: Configure Build Settings
In Settings tab:
- **Build Command**: `npm install`
- **Start Command**: `npm run start`
- **Auto-Deploy**: Enable for automatic deploys

## Step 4: Manual Deploy
1. Click "Manual Deploy" button
2. Select "Deploy latest commit"
3. Watch the logs for any errors

## Common Errors and Fixes

### Error: "Cannot find module"
- Make sure all dependencies are in package.json
- Check if build command is `npm install`

### Error: "Invalid URL" or Database Connection
- DATABASE_URL must be PostgreSQL format
- Not a JWT token or base64 string
- Get correct URL from Supabase > Settings > Database

### Error: Port binding
- Server must use `process.env.PORT`
- Already configured in your code ✓

## Alternative: Deploy to Railway (If Render Fails)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - DATABASE_URL
6. Deploy automatically starts

## After Successful Deployment

Test your backend:
```bash
curl https://bytewise-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "auth": "active"
  }
}
```

Then deploy your frontend!