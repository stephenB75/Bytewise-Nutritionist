#!/bin/bash

# ByteWise GitHub Pages Deployment Script
echo "🚀 Deploying ByteWise to GitHub Pages..."

# Build the application for GitHub Pages
echo "📦 Building production version for GitHub Pages..."
GITHUB_PAGES=true npm run build

# Create GitHub Pages deployment branch
echo "🌐 Setting up GitHub Pages deployment..."

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "📝 Updating existing gh-pages branch..."
    git checkout gh-pages
    git pull origin gh-pages
else
    echo "🆕 Creating new gh-pages branch..."
    git checkout --orphan gh-pages
fi

# Clear existing files (except .git)
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

# Copy built files
echo "📋 Copying build files..."
cp -r dist/public/* .

# Update all absolute paths to relative paths for GitHub Pages
echo "🔧 Configuring paths for GitHub Pages..."
if [ -f "index.html" ]; then
    # Update asset paths for GitHub Pages base path
    sed -i 's|="/assets/|="./assets/|g' index.html
    sed -i 's|="/icons/|="./icons/|g' index.html
    sed -i 's|="/"||g' index.html
fi

# Update manifest.json for GitHub Pages
if [ -f "manifest.json" ]; then
    sed -i 's|"start_url": "/"|"start_url": "./"|g' manifest.json
    sed -i 's|"/icons/|"./icons/|g' manifest.json
fi

# Create CNAME file for custom domain (optional - remove if using username.github.io/repo-name)
# echo "your-custom-domain.com" > CNAME

# Create .nojekyll to disable Jekyll processing
touch .nojekyll

# Create index.html redirect for SPA routing
cat > 404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ByteWise Nutritionist</title>
  <script type="text/javascript">
    // GitHub Pages SPA redirect
    var pathSegmentsToKeep = 1;
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + 
      '/?/' + l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body></body>
</html>
EOF

# Update index.html to handle GitHub Pages routing
if [ -f "index.html" ]; then
    # Add GitHub Pages routing script before closing head tag
    sed -i 's|</head>|<script type="text/javascript">(function(l) { if (l.search[1] === "/" ) { var decoded = l.search.slice(1).split("&").map(function(s) { return s.replace(/~and~/g, "&") }).join("?"); window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash); } }(window.location))</script></head>|g' index.html
fi

# Add and commit files
echo "📤 Committing files to gh-pages branch..."
git add .
git commit -m "Deploy ByteWise Nutritionist to GitHub Pages

Features deployed:
- Professional nutrition tracking with USDA database
- Enhanced ingredient database with 40+ professional items  
- Smart meal logging with time-based categorization
- Weekly progress tracking with PDF export
- Enhanced accessibility and professional animations
- PWA functionality with offline support

Build: $(date)"

# Push to GitHub
echo "🌍 Pushing to GitHub Pages..."
git push origin gh-pages

# Switch back to main branch
git checkout main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your ByteWise app will be available at:"
echo "🌐 https://stephtonybro.github.io/Bytewise-Nutritionist"
echo ""
echo "GitHub Pages setup:"
echo "1. Go to your repository settings"
echo "2. Navigate to Pages section"
echo "3. Set source to 'Deploy from a branch'"
echo "4. Select 'gh-pages' branch and '/ (root)' folder"
echo "5. Save settings"
echo ""
echo "⏳ GitHub Pages deployment usually takes 5-10 minutes to go live"