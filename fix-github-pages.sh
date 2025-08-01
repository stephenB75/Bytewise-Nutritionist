#!/bin/bash

echo "🔧 Fixing GitHub Pages deployment for ByteWise..."

# Build the production version
echo "📦 Building production app..."
npm run build

# Navigate to the built files
cd dist/public

# Initialize git in the dist directory
echo "🌐 Setting up GitHub Pages deployment..."
git init
git checkout -b gh-pages

# Add all files
git add .

# Commit with timestamp
git commit -m "Deploy ByteWise Nutritionist to GitHub Pages - $(date)"

# Add your GitHub repository as remote
echo "📤 Pushing to GitHub Pages..."
git remote add origin https://github.com/stephenb75/Bytewise-Nutritionist.git

# Force push to gh-pages branch (this will overwrite existing)
git push -f origin gh-pages

cd ../..

echo ""
echo "✅ GitHub Pages deployment complete!"
echo ""
echo "Your app should be available at:"
echo "🌐 https://stephenb75.github.io/Bytewise-Nutritionist/"
echo ""
echo "⏳ GitHub Pages may take 5-10 minutes to update"
echo "📋 Make sure GitHub Pages is configured to use 'gh-pages' branch in repository settings"