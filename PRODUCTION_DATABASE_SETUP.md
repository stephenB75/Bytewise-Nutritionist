# Production Database Setup Guide

## 🚀 Setting Up Production Database

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password
5. Wait for project to be ready (2-3 minutes)

### Step 2: Get Database Connection String

1. Go to **Settings** → **Database** in your Supabase dashboard
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres:your_password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### Step 3: Get Supabase Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### Step 4: Get USDA API Key

1. Go to [fdc.nal.usda.gov/api-guide.html](https://fdc.nal.usda.gov/api-guide.html)
2. Sign up for a free API key
3. Copy your API key

### Step 5: Set Environment Variables

#### For Railway Deployment:

1. Go to your Railway project dashboard
2. Go to **Variables** tab
3. Add these environment variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:your_password@db.abcdefghijklmnop.supabase.co:5432/postgres

# Supabase
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# USDA API
USDA_API_KEY=your_usda_api_key

# App Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
APP_URL=https://bytewisenutritionist.com
VITE_DEVELOPMENT_MODE=false
```

#### For Local Testing:

Create a `.env` file in your project root:

```bash
# Copy the same variables as above
```

### Step 6: Run Database Migration

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your_project_ref`
4. Run migration: `supabase db push`

Or manually run the SQL from `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

### Step 7: Test Production Database

1. Start the app: `NODE_ENV=production npm run dev`
2. Check health: `curl http://localhost:5000/api/health`
3. Should show: `"database":"connected"` instead of `"mock"`

### Step 8: Deploy to Railway

1. Push changes to GitHub
2. Railway will auto-deploy with the new environment variables
3. Check production health: `curl https://bytewisenutritionist.com/api/health`

## 🔧 Troubleshooting

### Database Connection Issues:
- Check DATABASE_URL format
- Verify password is correct
- Ensure Supabase project is active
- Check network connectivity

### Supabase Issues:
- Verify API keys are correct
- Check project URL format
- Ensure service role key is secret

### USDA API Issues:
- Verify API key is valid
- Check rate limits
- Test API endpoint directly

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database connection string obtained
- [ ] Supabase keys copied
- [ ] USDA API key obtained
- [ ] Environment variables set
- [ ] Database migration run
- [ ] Local testing successful
- [ ] Railway deployment successful
- [ ] Production health check passes

## 🎯 Expected Results

After setup, your app should:
- Connect to real PostgreSQL database
- Store user data persistently
- Handle authentication properly
- Process nutrition data correctly
- Support all subscription features

**The app will be fully production-ready with real database functionality! 🚀**
