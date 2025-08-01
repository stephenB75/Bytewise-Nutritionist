#!/bin/bash

echo "🚀 Deploying ByteWise to GitHub Pages..."

# Build the production version
echo "📦 Building production app..."
npm run build

# Create a temporary directory for deployment
echo "📁 Preparing deployment files..."
rm -rf gh-pages-temp
mkdir gh-pages-temp

# Copy all built files to temp directory
cp -r dist/public/* gh-pages-temp/

# Navigate to temp directory
cd gh-pages-temp

# Create .nojekyll to disable Jekyll processing
touch .nojekyll

# Create 404.html for SPA routing
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

# Add GitHub Pages routing script to index.html
sed -i 's|</head>|<script type="text/javascript">(function(l) { if (l.search[1] === "/" ) { var decoded = l.search.slice(1).split("&").map(function(s) { return s.replace(/~and~/g, "&") }).join("?"); window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash); } }(window.location))</script></head>|g' index.html

# Initialize git and deploy
echo "🌐 Deploying to GitHub Pages..."
git init
git checkout -b gh-pages
git add .
git commit -m "Deploy ByteWise Nutritionist - $(date)"

# Push to GitHub (replace existing gh-pages branch)
git remote add origin https://github.com/stephenb75/Bytewise-Nutritionist.git
git push -f origin gh-pages

# Clean up
cd ..
rm -rf gh-pages-temp

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your ByteWise app will be available at:"
echo "🌐 https://stephenb75.github.io/Bytewise-Nutritionist/"
echo ""
echo "⏳ GitHub Pages may take 5-10 minutes to update"
echo ""
echo "Make sure GitHub Pages settings are configured to use 'gh-pages' branch:"
echo "1. Go to: https://github.com/stephenb75/Bytewise-Nutritionist/settings/pages"
echo "2. Set Source to 'Deploy from a branch'"
echo "3. Select 'gh-pages' branch and '/ (root)' folder"
echo "4. Save settings"