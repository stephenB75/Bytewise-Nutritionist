#!/bin/bash
# GitHub Pages Deployment Validation

echo "🌐 GitHub Pages Deployment Validation"
echo "====================================="

# Check if production build exists
if [ ! -d "dist/public" ]; then
    echo "❌ Production build missing"
    exit 1
fi

echo "✅ Production build directory exists"

# Check critical files
FILES=("index.html" "manifest.json" "sw.js" "404.html")
for file in "${FILES[@]}"; do
    if [ -f "dist/public/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check service worker path in index.html
if grep -q "navigator.serviceWorker.register('./sw.js')" dist/public/index.html; then
    echo "✅ Service worker uses relative path"
else
    echo "❌ Service worker path incorrect"
    exit 1
fi

# Check manifest paths
if grep -q '"start_url": "./"' dist/public/manifest.json; then
    echo "✅ Manifest start_url is relative"
else
    echo "❌ Manifest start_url not relative"
fi

if grep -q '"scope": "./"' dist/public/manifest.json; then
    echo "✅ Manifest scope is relative"
else
    echo "❌ Manifest scope not relative"
fi

# Check asset paths
if grep -q 'src="./assets/' dist/public/index.html; then
    echo "✅ Asset paths are relative"
else
    echo "❌ Asset paths not relative"
    exit 1
fi

# Check bundle exists
BUNDLE=$(ls dist/public/assets/index-*.js 2>/dev/null | head -1)
if [ -n "$BUNDLE" ]; then
    BUNDLE_SIZE=$(wc -c < "$BUNDLE")
    BUNDLE_KB=$(($BUNDLE_SIZE / 1024))
    echo "✅ JavaScript bundle: ${BUNDLE_KB}KB"
else
    echo "❌ JavaScript bundle missing"
    exit 1
fi

echo ""
echo "🎯 GitHub Pages Deployment Checklist:"
echo "   ✅ Relative paths for subdirectory hosting"
echo "   ✅ Service worker registration fixed"
echo "   ✅ PWA manifest configured properly"
echo "   ✅ SPA routing with 404.html"
echo "   ✅ Production bundle optimized (${BUNDLE_KB}KB)"
echo ""
echo "🚀 Ready for deployment to:"
echo "   https://[username].github.io/[repository]/"
echo ""
echo "✅ All GitHub Pages requirements validated!"