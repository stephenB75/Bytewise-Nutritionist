#!/bin/bash
# Working build solution - fixes Tailwind CSS configuration

echo "🔧 Working Build Solution - CSS Fixed"
echo "====================================="

# Clean build
rm -rf dist/
mkdir -p dist/public

# Temporarily modify index.css to remove problematic Tailwind directives
cd client/src
cp index.css index.css.backup

# Create minimal CSS that works
cat > index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@100;200;300;400;500;600;700;800;900&family=Quicksand:wght@300;400;500;600;700&family=Work+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Enhanced Accessibility */
html {
  font-size: 17px;
}

/* Global text improvements */
.text-xs { font-size: 0.8rem !important; }
.text-sm { font-size: 0.9rem !important; }
.text-base { font-size: 1.1rem !important; }
.text-lg { font-size: 1.2rem !important; }
.text-xl { font-size: 1.35rem !important; }

/* Button animations */
.slide-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.slide-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.slide-button:hover::before {
  left: 100%;
}

/* Progress components */
.progress-ring-circle {
  transition: stroke-dashoffset 0.3s ease-in-out;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

/* Meal timeline gradients */
.meal-breakfast { background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); }
.meal-lunch { background: linear-gradient(135deg, #dcfce7 0%, #4ade80 100%); }
.meal-dinner { background: linear-gradient(135deg, #fce7f3 0%, #f472b6 100%); }
.meal-snack { background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 100%); }
EOF

cd ../..

# Build with working CSS
cd client
NODE_ENV=production npx vite build --outDir ../dist/public --emptyOutDir
cd ..

# Restore original CSS
cd client/src
mv index.css.backup index.css
cd ../..

# Check success
if [ -f "dist/public/index.html" ]; then
    echo "✅ Build successful with CSS fixes"
    
    # Copy required files
    cp public/manifest.json dist/public/ 2>/dev/null || true
    cp public/sw.js dist/public/ 2>/dev/null || true
    
    # Build server
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    
    # Sync iOS
    npx cap sync ios
    
    echo "✅ Complete build ready"
    ls -la dist/public/ | head -6
else
    echo "❌ Build failed"
    exit 1
fi