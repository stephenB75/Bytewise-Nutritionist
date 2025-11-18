# Supabase Backend Setup Guide

This guide will help you set up Supabase Edge Functions to replace the missing backend API service.

## Prerequisites

1. Supabase account (already configured)
2. Supabase CLI installed
3. Node.js 18+ installed

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

## Step 3: Link Your Project

```bash
cd /Users/stephenb/Downloads/Bytewise-Nutritionist
supabase link --project-ref bcfilsryfjwemqytwbvr
```

## Step 4: Set Up Database Tables

You need to create the following tables in your Supabase database:

### Meals Table
```sql
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  date DATE NOT NULL,
  meal_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own meals
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own meals
CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meals
CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own meals
CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);
```

### User Photos Table
```sql
CREATE TABLE IF NOT EXISTS user_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON user_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON user_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON user_photos FOR DELETE
  USING (auth.uid() = user_id);
```

### User Sync Data Table
```sql
CREATE TABLE IF NOT EXISTS user_sync_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_key TEXT NOT NULL,
  data JSONB NOT NULL,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sync_key)
);

ALTER TABLE user_sync_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync data"
  ON user_sync_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync data"
  ON user_sync_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync data"
  ON user_sync_data FOR UPDATE
  USING (auth.uid() = user_id);
```

## Step 5: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy api-meals-logged
supabase functions deploy api-user-photos
supabase functions deploy api-user-sync-data
supabase functions deploy api-version
```

Or deploy all at once:
```bash
supabase functions deploy
```

## Step 6: Update Frontend API Base URL

The frontend needs to call Supabase Edge Functions instead of localhost.

Update your environment variables:

**For Production (Railway):**
- Set `VITE_SUPABASE_URL` = `https://bcfilsryfjwemqytwbvr.supabase.co`
- Set `VITE_SUPABASE_ANON_KEY` = (your anon key)
- Remove or update `VITE_API_BASE_URL` to point to Supabase Edge Functions

**Edge Function URLs:**
- `/api/meals/logged` → `https://bcfilsryfjwemqytwbvr.supabase.co/functions/v1/api-meals-logged`
- `/api/user/photos` → `https://bcfilsryfjwemqytwbvr.supabase.co/functions/v1/api-user-photos`
- `/api/user/sync-data` → `https://bcfilsryfjwemqytwbvr.supabase.co/functions/v1/api-user-sync-data`
- `/api/version` → `https://bcfilsryfjwemqytwbvr.supabase.co/functions/v1/api-version`

## Step 7: Update Service Worker

The service worker needs to be updated to handle Supabase Edge Function URLs. However, since the frontend is already built, you may need to:

1. Rebuild the frontend with updated API URLs
2. Or update the service worker to proxy requests to Supabase

## Step 8: Configure Railway Environment Variables

In Railway dashboard, set these environment variables:

```
VITE_SUPABASE_URL=https://bcfilsryfjwemqytwbvr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Alternative: Use Supabase Client Directly

Instead of Edge Functions, you can use Supabase client directly in the frontend:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Get meals directly
const { data: meals } = await supabase
  .from('meals')
  .select('*')
  .eq('user_id', user.id)
```

This is simpler and doesn't require Edge Functions.

## Testing

1. Test Edge Functions locally:
```bash
supabase functions serve
```

2. Test in production:
- Deploy functions
- Test API endpoints from frontend
- Check Supabase dashboard for logs

## Troubleshooting

### Functions not deploying
- Check you're logged in: `supabase login`
- Verify project link: `supabase projects list`
- Check function syntax

### CORS errors
- Edge Functions include CORS headers
- Check browser console for specific errors
- Verify function URLs are correct

### Authentication errors
- Ensure Authorization header is sent
- Check Supabase auth is working
- Verify RLS policies are set correctly

## Next Steps

1. Deploy Edge Functions
2. Update frontend to use Supabase client or Edge Functions
3. Test all API endpoints
4. Update service worker if needed
5. Deploy to production

