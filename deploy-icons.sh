#!/bin/bash

echo "=== Deploying ByteWise Icons for Production ==="

# Ensure all icon files exist in public
if [ ! -f "public/apple-icon.png" ]; then
  echo "Creating apple-icon.png..."
  convert "attached_assets/0DECDB40-48F9-4733-BE6D-F69F7B7679A3_1754931226793.png" \
    -resize 180x180! \
    -background white \
    -alpha remove \
    -alpha off \
    public/apple-icon.png
fi

if [ ! -f "public/apple-touch-icon.png" ]; then
  echo "Creating apple-touch-icon.png..."
  cp public/apple-icon.png public/apple-touch-icon.png
fi

# Build the project
npm run build

# Copy icons to dist
cp public/apple-icon.png dist/public/
cp public/apple-touch-icon.png dist/public/
cp public/apple-touch-icon*.png dist/public/
cp public/favicon.ico dist/public/
cp public/manifest.json dist/public/

# Fix the production HTML
sed -i 's|href="/icons/apple-touch-icon-180x180.png"|href="/apple-touch-icon.png"|g' dist/public/index.html
sed -i 's|href="/icons/apple-touch-icon-152x152.png"|href="/apple-touch-icon-152x152.png"|g' dist/public/index.html
sed -i 's|href="/icons/apple-touch-icon-120x120.png"|href="/apple-touch-icon-120x120.png"|g' dist/public/index.html

# Add apple-icon.png reference if not present
if ! grep -q 'apple-icon.png' dist/public/index.html; then
  sed -i '40a\  <link rel="apple-touch-icon" href="/apple-icon.png">' dist/public/index.html
fi

echo "=== Icons deployed successfully ==="
echo "Icons available at:"
ls -lh dist/public/apple*.png 2>/dev/null | head -5
