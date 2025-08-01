#!/bin/bash
# Simple production build avoiding all config conflicts

echo "🔧 Simple Build Solution"
echo "========================"

# Clean build directory
rm -rf dist/
mkdir -p dist/public

# Build from client with minimal config
cd client

# Create simple vite config that just works
cat > simple.config.js << 'EOF'
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
  }
});
EOF

# Build with simple config
NODE_ENV=production npx vite build --config simple.config.js

# Clean up config
rm simple.config.js
cd ..

# Check build success
if [ -f "dist/public/index.html" ]; then
    echo "✅ Build successful"
    
    # Copy manifest and service worker
    cp public/manifest.json dist/public/ 2>/dev/null || true
    cp public/sw.js dist/public/ 2>/dev/null || true
    
    # Build server
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    
    # Final sync
    npx cap sync ios
    
    echo "✅ Complete build ready for IPA"
    echo "📁 Files created:"
    ls -la dist/public/ | head -6
else
    echo "❌ Build failed"
    exit 1
fi