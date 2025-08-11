# Deploy to Railway Instead (5 Minutes)

Since Render is having persistent path issues, let's use Railway which is much simpler:

## Step 1: Go to Railway
https://railway.app

## Step 2: Sign Up/Login
Use your GitHub account

## Step 3: Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your "bytewise-backend" repository
- Authorize Railway to access it

## Step 4: Add Environment Variables
Click on your service, then go to "Variables" tab and add:

```
SUPABASE_URL=https://bcfilsryfjwemqytwbvr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk
NODE_ENV=production
```

## Step 5: Deploy Settings (Optional)
Railway usually auto-detects everything, but if needed:
- Build Command: `npm install`
- Start Command: `npx tsx server/index.ts`

## Step 6: Get Your URL
Once deployed, Railway will give you a URL like:
`https://bytewise-backend-production.up.railway.app`

## Step 7: Update Frontend
Update your frontend to use the new Railway URL instead of Render.

## Why Railway is Better Here:
- No root directory issues
- Auto-detects Node.js projects
- Simpler deployment process
- Better error messages
- Free tier available
- Deploys in 2-3 minutes

## Alternative: Vercel
If Railway doesn't work, try Vercel:
1. Install: `npm i -g vercel`
2. Run: `vercel` in your project root
3. Follow prompts
4. Add environment variables in Vercel dashboard