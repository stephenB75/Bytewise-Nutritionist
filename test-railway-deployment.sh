#!/bin/bash

# Railway Deployment Test Script
echo "🔍 Testing Railway deployment configuration..."
echo ""

# Check if we can build locally
echo "1. Testing local build..."
if npm run build; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed"
    exit 1
fi

echo ""

# Check if required files exist
echo "2. Checking required files..."
files=("Dockerfile" "railway.json" "package.json" "server/index.ts" "server/routes.ts")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""

# Check Dockerfile syntax
echo "3. Checking Dockerfile syntax..."
if docker --version &> /dev/null; then
    if docker build --no-cache -t test-railway . &> /dev/null; then
        echo "✅ Dockerfile builds successfully"
    else
        echo "❌ Dockerfile has syntax errors"
        echo "   Run: docker build -t test-railway . to see errors"
    fi
else
    echo "⚠️  Docker not available - cannot test Dockerfile"
fi

echo ""

# Check environment variables
echo "4. Checking environment variables..."
echo "Required variables for Railway:"
echo "  - NODE_ENV=production"
echo "  - HOST=0.0.0.0"
echo "  - PORT=5000"
echo "  - DATABASE_URL=postgresql://..."
echo "  - VITE_SUPABASE_URL=https://..."
echo "  - VITE_SUPABASE_ANON_KEY=..."
echo "  - SUPABASE_URL=https://..."
echo "  - SUPABASE_ANON_KEY=..."
echo "  - SUPABASE_SERVICE_ROLE_KEY=..."
echo "  - USDA_API_KEY=..."

echo ""
echo "5. Next steps:"
echo "  1. Go to Railway dashboard: https://railway.app/dashboard"
echo "  2. Select your project"
echo "  3. Go to Variables tab"
echo "  4. Add all required environment variables"
echo "  5. Check deployment logs for specific errors"
echo ""
echo "6. Common issues:"
echo "  - Missing DATABASE_URL"
echo "  - Wrong HOST (should be 0.0.0.0, not localhost)"
echo "  - Health check timeout"
echo "  - Build failures"
echo ""
echo "📖 See RAILWAY_TROUBLESHOOTING.md for detailed solutions"
