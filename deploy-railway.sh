#!/bin/bash

# Railway Deployment Script for ByteWise Nutritionist
# Production deployment to www.bytewisenutritionist.com

echo "🚀 Deploying ByteWise Nutritionist to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm i -g @railway/cli"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is live at: https://www.bytewisenutritionist.com"
    echo ""
    echo "📝 Next steps:"
    echo "1. Verify the deployment at the URL above"
    echo "2. Check Railway dashboard for logs and metrics"
    echo "3. Ensure all environment variables are set correctly"
else
    echo "❌ Deployment failed. Check Railway logs for details."
    exit 1
fi