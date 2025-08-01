# Supabase Setup Guide for Bytewise Nutrition Tracker

## Overview
Your Bytewise app has been migrated to a serverless architecture using Supabase as the backend-as-a-service. This provides better scalability, built-in authentication, real-time features, and reduced maintenance overhead.

## Required Environment Variables

Add these environment variables to your Replit secrets:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# USDA API (for nutrition data)
VITE_USDA_API_KEY=your-usda-api-key
```

## Supabase Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/sign in
3. Click "New Project"
4. Choose your organization and enter project details:
   - **Name**: `bytewise-nutrition-tracker`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Wait for the project to be created (~2 minutes)

### 2. Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (use for `VITE_SUPABASE_URL`)
   - **anon public** key (use for `VITE_SUPABASE_ANON_KEY`)

### 3. Run Database Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to create all the necessary tables and security policies

### 4. Configure Authentication
1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your Replit domain: `https://your-repl-name.your-username.repl.co`
3. Under **Redirect URLs**, add: `https://your-repl-name.your-username.repl.co/auth/callback`

#### Enable OAuth Providers (Optional)
**Google OAuth:**
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

**GitHub OAuth:**
1. Go to **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Add your GitHub OAuth app credentials from [GitHub Developer Settings](https://github.com/settings/developers)

### 5. Set Up Row Level Security (RLS)
The migration script automatically sets up RLS policies, but verify in **Authentication** → **Policies** that you see policies for:
- `users_policy`
- `meals_policy`
- `recipes_policy`
- `water_intake_policy`
- `achievements_policy`
- `calorie_calculations_policy`

## Features Included

### Authentication
- ✅ Email/password authentication
- ✅ Google OAuth (configurable)
- ✅ GitHub OAuth (configurable)
- ✅ Password reset functionality
- ✅ Automatic user profile creation

### Database Features
- ✅ PostgreSQL with automatic backups
- ✅ Row Level Security for data privacy
- ✅ Real-time subscriptions for live updates
- ✅ Optimistic UI updates with TanStack Query

### API Features
- ✅ TypeScript-generated database types
- ✅ Client-side API with type safety
- ✅ USDA FoodData Central integration
- ✅ Automatic error handling and retries

## Migration Benefits

### Before (Express + Neon)
- Required server maintenance
- Custom auth implementation
- Manual session management
- Single-region deployment

### After (Supabase Serverless)
- Zero server maintenance
- Built-in authentication with OAuth
- Automatic scaling and redundancy
- Global edge network
- Real-time capabilities out of the box
- Built-in file storage for future features

## Development Workflow

1. **Local Development**: All changes are client-side only
2. **Database Changes**: Use Supabase SQL Editor or migration files
3. **Authentication**: Handled automatically by Supabase Auth
4. **API Changes**: Update TypeScript types and client-side API functions

## Security Features

- **Row Level Security**: Users can only access their own data
- **JWT Authentication**: Secure, stateless authentication
- **Environment Variables**: Sensitive keys stored securely
- **HTTPS Only**: All communication encrypted
- **Rate Limiting**: Built-in protection against abuse

## Troubleshooting

### Common Issues
1. **"Missing Supabase environment variables"**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Replit secrets
2. **Authentication not working**: Check that your site URL and redirect URLs are correctly configured in Supabase
3. **Database errors**: Verify that the migration script ran successfully and all tables exist

### Getting Help
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

Your Bytewise app is now powered by a modern, serverless architecture that will scale automatically with your users while providing enterprise-grade security and performance!