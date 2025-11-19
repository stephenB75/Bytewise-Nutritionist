# Supabase Backend Connection Fix

## ✅ What Was Fixed

### 1. Created Unified API Proxy Edge Function
- **File:** `supabase/functions/api-proxy/index.ts`
- **Purpose:** Routes all `/api/*` requests to Supabase operations
- **Endpoints Handled:**
  - `/api/auth/user` - Get authenticated user
  - `/api/meals/logged` - Get user's logged meals
  - `/api/user/photos` - Manage user photos (GET, DELETE)
  - `/api/user/sync-data` - Sync user data
  - `/api/version` - API version info
  - `/api/foods` - Food search (placeholder)
  - `/api/usda/search` - USDA search (placeholder)

### 2. Created Client-Side API Proxy Script
- **File:** `supabase-api-config.js` (copied to `dist/public/`)
- **Purpose:** Intercepts frontend `/api/*` fetch calls and routes them to Supabase Edge Functions
- **Features:**
  - Automatic URL mapping
  - Auth token injection
  - CORS handling
  - Works with existing frontend code without changes

### 3. Updated Service Worker
- **File:** `dist/public/sw.js`
- **Changes:** Enhanced API request handling to proxy to Supabase
- **Features:**
  - Detects relative `/api/*` calls
  - Proxies to Supabase Edge Functions
  - Maintains caching strategy
  - Handles offline scenarios

### 4. Updated HTML
- **File:** `dist/public/index.html`
- **Changes:** Added script tag to load API proxy configuration

## 🚀 Deployment Steps

### Step 1: Deploy Supabase Edge Function

```bash
# Install Supabase CLI if not already installed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref bcfilsryfjwemqytwbvr

# Deploy the API proxy function
supabase functions deploy api-proxy
```

### Step 2: Create Database Tables

Run these SQL scripts in Supabase SQL Editor:

```sql
-- Meals table
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

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- User photos table
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

-- User sync data table
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

### Step 3: Verify Edge Function URL

After deployment, your API proxy will be available at:
```
https://bcfilsryfjwemqytwbvr.supabase.co/functions/v1/api-proxy
```

### Step 4: Test the Connection

1. Open your deployed app
2. Open browser DevTools → Network tab
3. Try to log in or make an API call
4. Verify requests are going to Supabase Edge Functions
5. Check for CORS errors (should be none)

## 🔧 How It Works

### Request Flow

1. **Frontend makes API call:**
   ```javascript
   fetch('/api/meals/logged')
   ```

2. **Client-side proxy intercepts:**
   - `supabase-api-config.js` intercepts the fetch
   - Maps `/api/meals/logged` → Supabase Edge Function URL
   - Adds auth token from localStorage
   - Makes request to Supabase

3. **Service Worker (if needed):**
   - If client-side proxy didn't catch it
   - Service worker proxies relative `/api/*` calls
   - Routes to Supabase Edge Functions

4. **Supabase Edge Function:**
   - Receives request with auth token
   - Validates user
   - Queries Supabase database
   - Returns data with CORS headers

### API Endpoint Mapping

| Frontend Call | Supabase Edge Function |
|--------------|----------------------|
| `/api/auth/user` | `api-proxy/api/auth/user` |
| `/api/meals/logged` | `api-proxy/api/meals/logged` |
| `/api/user/photos` | `api-proxy/api/user/photos` |
| `/api/user/sync-data` | `api-proxy/api/user/sync-data` |
| `/api/version` | `api-proxy/api/version` |

## ✅ Verification Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Project linked: `supabase link --project-ref bcfilsryfjwemqytwbvr`
- [ ] Database tables created (meals, user_photos, user_sync_data)
- [ ] RLS policies configured
- [ ] Edge Function deployed: `supabase functions deploy api-proxy`
- [ ] `supabase-api-config.js` included in `dist/public/`
- [ ] Service worker updated
- [ ] Test API calls in browser
- [ ] Verify auth tokens are being sent
- [ ] Check for CORS errors (should be none)

## 🐛 Troubleshooting

### API calls still failing

1. **Check Edge Function is deployed:**
   ```bash
   supabase functions list
   ```

2. **Check function logs:**
   ```bash
   supabase functions logs api-proxy
   ```

3. **Verify auth token:**
   - Open browser DevTools → Application → Local Storage
   - Look for Supabase auth token
   - Check if token is being sent in requests

### CORS errors

- Edge Functions include CORS headers
- Check browser console for specific CORS errors
- Verify function URL is correct

### Authentication errors

- Ensure user is logged in via Supabase
- Check auth token is valid
- Verify RLS policies allow access

### Database errors

- Check tables exist in Supabase
- Verify RLS policies are set
- Check user has proper permissions

## 📝 Files Modified

1. `supabase/functions/api-proxy/index.ts` - New unified API proxy
2. `supabase-api-config.js` - Client-side proxy script
3. `dist/public/supabase-api-config.js` - Copied to public
4. `dist/public/sw.js` - Updated service worker
5. `dist/public/index.html` - Added script tag

## 🎯 Next Steps

1. Deploy Edge Function: `supabase functions deploy api-proxy`
2. Create database tables (SQL scripts above)
3. Test API endpoints
4. Verify authentication works
5. Deploy updated frontend files

---

**Status:** ✅ Backend connection fixed, ready for deployment  
**Edge Function:** `api-proxy`  
**Database:** Supabase (PostgreSQL)

