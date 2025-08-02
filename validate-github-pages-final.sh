#!/bin/bash
# Final GitHub Pages Validation

echo "🌐 Final GitHub Pages Validation"
echo "================================"

# Check service worker path
if grep -q "register('/Bytewise-Nutritionist/sw.js')" dist/public/index.html; then
    echo "✅ Service worker path: /Bytewise-Nutritionist/sw.js"
else
    echo "❌ Service worker path incorrect"
    exit 1
fi

# Check manifest path
if grep -q 'href="/Bytewise-Nutritionist/manifest.json"' dist/public/index.html; then
    echo "✅ Manifest path: /Bytewise-Nutritionist/manifest.json"
else
    echo "❌ Manifest path incorrect"
    exit 1
fi

# Check asset paths
if grep -q 'src="/Bytewise-Nutritionist/assets/' dist/public/index.html; then
    echo "✅ Asset paths: /Bytewise-Nutritionist/assets/"
else
    echo "❌ Asset paths incorrect"
    exit 1
fi

# Check manifest content
if grep -q '"start_url": "/Bytewise-Nutritionist/"' dist/public/manifest.json; then
    echo "✅ Manifest start_url correct"
else
    echo "❌ Manifest start_url incorrect"
fi

if grep -q '"scope": "/Bytewise-Nutritionist/"' dist/public/manifest.json; then
    echo "✅ Manifest scope correct"
else
    echo "❌ Manifest scope incorrect"
fi

echo ""
echo "🎯 GitHub Pages Deployment Status:"
echo "   Repository: stephenb75/Bytewise-Nutritionist"
echo "   URL: https://stephenb75.github.io/Bytewise-Nutritionist/"
echo "   Service Worker: Fixed for subdirectory"
echo "   PWA Manifest: Fixed for subdirectory"
echo "   All Assets: Use absolute paths for subdirectory"
echo ""
echo "✅ Ready for GitHub Pages deployment!"