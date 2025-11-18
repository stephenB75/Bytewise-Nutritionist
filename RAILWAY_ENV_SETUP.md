# Railway Environment Variables Setup

## Required Environment Variables

Set these in Railway dashboard: **Settings → Variables**

### Supabase Configuration

```
VITE_SUPABASE_URL=https://bcfilsryfjwemqytwbvr.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk
```

### API Configuration (Optional - if using Edge Functions)

```
VITE_API_BASE_URL=https://bcfilsryfjwemqytwbvr.supabase.co/functions/v1
```

### Environment

```
NODE_ENV=production
```

## How to Set in Railway

1. Go to Railway dashboard
2. Select your project: `bytewise-nutritionist`
3. Click on your service
4. Go to **Settings** → **Variables**
5. Click **"New Variable"** for each variable above
6. Enter the variable name and value
7. Click **"Add"**
8. Railway will automatically redeploy with new variables

## Important Notes

- **VITE_ prefix**: Variables starting with `VITE_` are exposed to the frontend build
- **Build-time**: These variables are embedded at build time, not runtime
- **Security**: Never commit `.env` files with secrets to git
- **Supabase Keys**: The anon key is safe to expose in frontend (it's public)

## Verification

After setting variables:
1. Trigger a new deployment
2. Check build logs to verify variables are available
3. Test the app to ensure Supabase connection works

