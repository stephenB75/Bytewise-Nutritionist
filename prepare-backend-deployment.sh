#!/bin/bash

# Prepare ByteWise Backend for Render Deployment

echo "🚀 Preparing ByteWise Backend for Render Deployment"
echo "=================================================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📝 Initializing Git repository..."
    git init
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
*.sqlite
*.sqlite3
coverage/
.nyc_output/
EOF
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "Prepare backend for Render deployment" || echo "No changes to commit"

echo ""
echo "✅ Backend is ready for deployment!"
echo ""
echo "Next Steps:"
echo "1. Create a GitHub repository at: https://github.com/new"
echo "2. Run these commands to push your code:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/bytewise-backend.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then follow the guide in BACKEND-RENDER-DEPLOYMENT.md"
echo ""
echo "📖 Full deployment guide: BACKEND-RENDER-DEPLOYMENT.md"