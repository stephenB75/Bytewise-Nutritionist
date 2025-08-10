#!/bin/bash

# ByteWise Nutritionist - Independent Deployment Script
# This script helps deploy your app completely independent from Replit

echo "🚀 ByteWise Nutritionist - Independent Deployment"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Backend Deployment to Render${NC}"
echo "--------------------------------------"
echo "1. Go to https://render.com and create an account"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Name: bytewise-backend"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Instance Type: Free"
echo ""
echo "5. Add these environment variables in Render:"
echo "   NODE_ENV=production"
echo "   DATABASE_URL=<your_supabase_database_url>"
echo "   SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>"
echo "   SUPABASE_ANON_KEY=<your_anon_key>"
echo ""
echo "Press Enter when backend is deployed..."
read

echo -e "${YELLOW}Step 2: Get your Backend URL${NC}"
echo "-----------------------------"
echo "Your backend URL will be: https://<your-app-name>.onrender.com"
echo "Enter your backend URL: "
read BACKEND_URL

echo -e "${YELLOW}Step 3: Update Frontend Environment${NC}"
echo "-----------------------------------"
echo "Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "Add:"
echo "   VITE_API_BASE_URL=$BACKEND_URL"
echo "   VITE_SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=<your_anon_key>"
echo ""
echo "Press Enter when environment variables are added..."
read

echo -e "${YELLOW}Step 4: Deploy Frontend${NC}"
echo "-----------------------"
echo "Running Vercel deployment..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "Vercel CLI not installed. Install with: npm i -g vercel"
    echo "Then run: vercel --prod"
fi

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "========================"
echo "Your app is now independent from Replit:"
echo "- Frontend: https://bytewisenutritionist.com"
echo "- Backend: $BACKEND_URL"
echo "- Database: Supabase"
echo ""
echo "Test your deployment:"
echo "1. Visit https://bytewisenutritionist.com"
echo "2. Log in with your credentials"
echo "3. Check that meals load properly"
echo ""
echo "If you encounter issues, check:"
echo "- Render logs for backend errors"
echo "- Vercel logs for frontend errors"
echo "- Browser console for client-side errors"