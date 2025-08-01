#!/bin/bash
# Production build script that bypasses Vite config issues

echo "🔧 ByteWise Production Build (Config Bypass)"
echo "============================================"

# Clean all build outputs
rm -rf dist/
mkdir -p dist/public

# Set production environment
export NODE_ENV=production

# Create minimal working vite config that avoids the path issue
cat > temp.vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client/src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: "client",
  base: "./",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    rollupOptions: {
      input: {
        main: "client/index.html"
      }
    }
  }
});
EOF

echo "🏗️  Building web application with bypass config..."
npx vite build --config temp.vite.config.js

# Check if build succeeded
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Vite build failed"
    
    # Try alternative approach - direct build from client directory
    echo "🔄 Trying alternative build approach..."
    cd client
    
    # Create local vite config
    cat > vite.local.config.js << 'LOCALEOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      "@shared": path.resolve(process.cwd(), "../shared"),
      "@assets": path.resolve(process.cwd(), "../attached_assets"),
    },
  },
  base: "./",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: false,
    minify: true
  }
});
LOCALEOF
    
    # Build from client directory
    npx vite build --config vite.local.config.js
    
    # Clean up
    rm vite.local.config.js
    cd ..
fi

# Clean up temp config
rm -f temp.vite.config.js

# Verify build success
if [ -f "dist/public/index.html" ]; then
    echo "✅ Web build successful"
    
    # Copy essential files
    if [ -f "public/manifest.json" ]; then
        cp public/manifest.json dist/public/
    fi
    
    if [ -f "public/sw.js" ]; then
        cp public/sw.js dist/public/
    fi
    
    # Build server if needed
    echo "🖥️  Building server..."
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    
    echo "✅ Production build complete!"
    ls -la dist/public/ | head -5
else
    echo "❌ Build failed completely"
    exit 1
fi