#!/bin/bash
# Direct fix for Vite build path error

echo "🔧 Fixing Vite Build Path Error"
echo "==============================="

# Clean all previous builds
rm -rf dist/
mkdir -p dist/public

echo "🏗️  Building with custom Vite configuration..."

# Create temporary vite config for iOS build
cat > vite.ios.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: "client",
  base: "./",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: "client/index.html"
    }
  }
});
EOF

# Build with the iOS-specific config
NODE_ENV=production npx vite build --config vite.ios.config.ts

# Clean up temporary config
rm vite.ios.config.ts

if [ -f "dist/public/index.html" ]; then
    echo "✅ Build successful with custom config"
    
    # Ensure manifest is copied
    if [ ! -f "dist/public/manifest.json" ] && [ -f "public/manifest.json" ]; then
        cp public/manifest.json dist/public/
    fi
    
    # Sync with Capacitor
    echo "⚡ Syncing with Capacitor..."
    npx cap sync ios
    
    echo "✅ iOS build complete - path error fixed!"
else
    echo "❌ Build still failed"
    exit 1
fi