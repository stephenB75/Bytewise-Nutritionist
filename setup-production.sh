#!/bin/bash

# ByteWise Nutritionist - Production Setup Script
# This script helps you set up the production database and environment

echo "🚀 ByteWise Nutritionist - Production Setup"
echo "=========================================="
echo ""

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# ByteWise Nutritionist - Environment Variables
# Replace the placeholder values with your actual credentials

# Application Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=5000

# Database Configuration (Required for Production)
# Get this from your Supabase project settings
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres

# Supabase Configuration (Required)
# Get these from your Supabase project API settings
VITE_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# USDA API Configuration (Required)
# Get your free API key from: https://fdc.nal.usda.gov/api-guide.html
USDA_API_KEY=[YOUR_USDA_API_KEY]

# RevenueCat Configuration (Optional - for subscriptions)
REACT_APP_REVENUECAT_API_KEY=[YOUR_REVENUECAT_KEY]

# Application URL
APP_URL=https://bytewisenutritionist.com

# Development Mode (Set to false for production)
VITE_DEVELOPMENT_MODE=false
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "============="
echo ""
echo "1. 🔧 Set up Supabase project:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Get your database connection string and API keys"
echo ""
echo "2. 🔑 Get USDA API key:"
echo "   - Go to https://fdc.nal.usda.gov/api-guide.html"
echo "   - Sign up for a free API key"
echo ""
echo "3. ✏️  Edit .env file:"
echo "   - Replace all [YOUR_*] placeholders with actual values"
echo "   - Make sure DATABASE_URL is correct"
echo ""
echo "4. 🗄️  Set up database:"
echo "   - Run the SQL from supabase/migrations/001_initial_schema.sql"
echo "   - Or use: supabase db push (if you have Supabase CLI)"
echo ""
echo "5. 🚀 Test production mode:"
echo "   - Run: NODE_ENV=production npm run dev"
echo "   - Check: curl http://localhost:5000/api/health"
echo "   - Should show 'database':'connected' instead of 'mock'"
echo ""
echo "6. 🌐 Deploy to Railway:"
echo "   - Add the same environment variables to Railway"
echo "   - Push to GitHub to trigger deployment"
echo ""
echo "📖 For detailed instructions, see: PRODUCTION_DATABASE_SETUP.md"
echo ""
echo "🎯 Once set up, your app will have:"
echo "   ✅ Real PostgreSQL database"
echo "   ✅ Persistent user data"
echo "   ✅ Full subscription system"
echo "   ✅ Production-ready features"
echo ""
echo "Happy coding! 🚀"
