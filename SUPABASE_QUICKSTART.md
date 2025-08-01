# Supabase Quick Setup for Bytewise

## Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub (recommended) or email

## Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `bytewise-nutrition`
   - **Database Password**: Generate a secure password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Get Your Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ`)

## Step 4: Add to Replit Secrets
1. In your Replit project, click the lock icon (🔒) in the sidebar
2. Add these secrets:
   ```
   VITE_SUPABASE_URL = https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Click "Add secret" for each one

## Step 5: Run Database Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the query editor
5. Click "Run" button

## Step 6: Configure Authentication (Optional)
1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add: `https://your-repl-name.your-username.repl.co`
3. Under **Redirect URLs**, add: `https://your-repl-name.your-username.repl.co/auth/callback`

## Step 7: Test Your Setup
1. Refresh your Replit app
2. You should see the Bytewise login screen instead of setup instructions
3. Try creating an account with email/password

## Free Tier Limits
- **Database**: 500MB storage
- **Bandwidth**: 5GB transfer
- **Auth**: Unlimited users
- **API Requests**: 50,000 per month
- **Perfect for development and small apps**

## Need Help?
- Check the detailed `SUPABASE_SETUP.md` for troubleshooting
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Discord support: [discord.supabase.com](https://discord.supabase.com)

Your nutrition tracker will be fully serverless and ready to scale!