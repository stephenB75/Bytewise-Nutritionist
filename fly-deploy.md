# Fly.io Deployment Guide for ByteWise Nutritionist

## Prerequisites

1. Install Fly.io CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login to Fly.io:
```bash
flyctl auth login
```

## Environment Variables Setup

Set these environment variables in Fly.io:

```bash
# Core Application
flyctl secrets set NODE_ENV="production"
flyctl secrets set PORT="3000"
flyctl secrets set APP_URL="https://bytewise-nutritionist.fly.dev"

# Database & Auth
flyctl secrets set DATABASE_URL="your-neon-postgres-url"
flyctl secrets set SUPABASE_URL="your-supabase-url" 
flyctl secrets set SUPABASE_ANON_KEY="your-supabase-anon-key"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key"
flyctl secrets set SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# Session Security
flyctl secrets set SESSION_SECRET="your-session-secret-key"

# AI Services  
flyctl secrets set GEMINI_API_KEY="your-google-gemini-key"
flyctl secrets set GOOGLE_API_KEY="your-google-api-key"

# External APIs
flyctl secrets set USDA_API_KEY="your-usda-api-key"

# RevenueCat (for subscriptions)
flyctl secrets set REVENUECAT_WEBHOOK_SECRET="your-webhook-secret"

# Optional
flyctl secrets set LOG_LEVEL="info"
```

## Deployment Commands

1. Create the app (first time only):
```bash
flyctl apps create bytewise-nutritionist
```

**If the app name is already taken, try:**
```bash
flyctl apps create bytewise-nutritionist-[your-suffix]
```
Then update the `app` field in `fly.toml` to match.

2. Deploy:
```bash
flyctl deploy
```

3. Check status:
```bash
flyctl status
flyctl logs
```

## Production URLs

After deployment, your app will be available at:
- Main app: https://bytewise-nutritionist.fly.dev
- Health check: https://bytewise-nutritionist.fly.dev/api/health

## Important Notes

- The app serves both frontend and backend from the same container
- Static files are served from `server/public` with SPA fallback routing
- All API routes are available at `/api/*`
- HTTPS is enforced automatically
- Health checks monitor `/api/health` endpoint