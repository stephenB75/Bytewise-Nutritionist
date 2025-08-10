#!/bin/bash

# Create ByteWise Nutritionist branded icons for iOS
# Uses yellow background with text overlay

echo "🔧 Generating ByteWise Nutritionist iOS Icons..."

cd ios/App/App/Assets.xcassets/AppIcon.appiconset

# First, create a base 1024x1024 icon using ImageMagick alternative
# We'll use Node.js to generate a simple colored icon

cat > generate-icon.js << 'EOF'
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create 1024x1024 canvas
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Fill with ByteWise yellow background
ctx.fillStyle = '#faed39';
ctx.fillRect(0, 0, 1024, 1024);

// Add "BW" text in center
ctx.fillStyle = '#1f4aa6';
ctx.font = 'bold 500px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('BW', 512, 512);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('AppIcon-512@2x.png', buffer);

// Generate all other sizes
const sizes = [
  { name: 'AppIcon-20.png', size: 20 },
  { name: 'AppIcon-20@2x.png', size: 40 },
  { name: 'AppIcon-20@3x.png', size: 60 },
  { name: 'AppIcon-29.png', size: 29 },
  { name: 'AppIcon-29@2x.png', size: 58 },
  { name: 'AppIcon-29@3x.png', size: 87 },
  { name: 'AppIcon-40.png', size: 40 },
  { name: 'AppIcon-40@2x.png', size: 80 },
  { name: 'AppIcon-40@3x.png', size: 120 },
  { name: 'AppIcon-60@2x.png', size: 120 },
  { name: 'AppIcon-60@3x.png', size: 180 },
  { name: 'AppIcon-76.png', size: 76 },
  { name: 'AppIcon-76@2x.png', size: 152 },
  { name: 'AppIcon-83.5@2x.png', size: 167 }
];

sizes.forEach(({ name, size }) => {
  const smallCanvas = createCanvas(size, size);
  const smallCtx = smallCanvas.getContext('2d');
  
  // Fill with yellow
  smallCtx.fillStyle = '#faed39';
  smallCtx.fillRect(0, 0, size, size);
  
  // Add text scaled appropriately
  smallCtx.fillStyle = '#1f4aa6';
  const fontSize = Math.floor(size * 0.45);
  smallCtx.font = `bold ${fontSize}px Arial`;
  smallCtx.textAlign = 'center';
  smallCtx.textBaseline = 'middle';
  smallCtx.fillText('BW', size/2, size/2);
  
  // Save
  const smallBuffer = smallCanvas.toBuffer('image/png');
  fs.writeFileSync(name, smallBuffer);
  console.log(`Generated ${name} (${size}x${size})`);
});

console.log('✅ All icons generated successfully!');
EOF

# Check if canvas is installed, if not install it
if ! npm list canvas >/dev/null 2>&1; then
  echo "Installing canvas package..."
  npm install canvas
fi

# Run the icon generator
node generate-icon.js

# Clean up
rm generate-icon.js

echo "✅ ByteWise icons generated!"
echo ""
echo "Now in Xcode:"
echo "1. Clean Build Folder (Shift+Cmd+K)"
echo "2. Build again (Cmd+B)"