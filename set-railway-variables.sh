#!/bin/bash

# Railway Environment Variables Setup Script
echo "🚀 Setting up Railway environment variables for ByteWise Nutritionist"
echo ""

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Link to project
echo "🔗 Linking to your Railway project..."
railway link

echo ""
echo "📝 Setting up basic environment variables..."
echo ""

# Set basic environment variables
railway variables set NODE_ENV="production"
railway variables set HOST="0.0.0.0"
railway variables set PORT="5000"
railway variables set VITE_DEVELOPMENT_MODE="false"

echo "✅ Basic environment variables set"
echo ""

echo "⚠️  IMPORTANT: You still need to set these manually:"
echo ""
echo "1. DATABASE_URL - Get this from Railway PostgreSQL or Supabase"
echo "2. VITE_SUPABASE_URL - Your Supabase project URL"
echo "3. VITE_SUPABASE_ANON_KEY - Your Supabase anonymous key"
echo "4. SUPABASE_URL - Your Supabase project URL"
echo "5. SUPABASE_ANON_KEY - Your Supabase anonymous key"
echo "6. SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key"
echo "7. USDA_API_KEY - Your USDA API key"
echo "8. APP_URL - Your Railway app URL (set after deployment)"
echo ""

echo "To set these, run:"
echo "   railway variables set DATABASE_URL=\"your-database-url\""
echo "   railway variables set VITE_SUPABASE_URL=\"your-supabase-url\""
echo "   # ... etc"
echo ""

echo "Or use the Railway web dashboard:"
echo "   https://railway.app/dashboard"
echo ""

echo "🎯 After setting all variables, your app should deploy successfully!"
echo ""
echo "📖 See railway-variables-setup.md for detailed instructions"
