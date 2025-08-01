#!/bin/bash
# Final definitive build solution - bypasses all Vite config issues

echo "🔧 Final Build Solution - Complete Config Bypass"
echo "================================================"

# Clean everything
rm -rf dist/
mkdir -p dist/public

# Build directly from client directory to avoid path issues
cd client

echo "🏗️  Building from client directory..."

# Create completely isolated build config with Tailwind fix
cat > isolated.vite.config.js << 'EOF'
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
  css: {
    postcss: {
      plugins: [
        require('tailwindcss')({
          content: [
            './src/**/*.{js,jsx,ts,tsx}',
            './index.html',
          ],
          darkMode: ["class"],
          theme: {
            extend: {
              colors: {
                border: "hsl(214.3 31.8% 91.4%)",
                input: "hsl(214.3 31.8% 91.4%)",
                ring: "hsl(221.2 83.2% 53.3%)",
                background: "hsl(0 0% 100%)",
                foreground: "hsl(222.2 84% 4.9%)",
                primary: {
                  DEFAULT: "hsl(221.2 83.2% 53.3%)",
                  foreground: "hsl(210 40% 98%)",
                },
                secondary: {
                  DEFAULT: "hsl(210 40% 96%)",
                  foreground: "hsl(222.2 84% 4.9%)",
                },
                muted: {
                  DEFAULT: "hsl(210 40% 96%)",
                  foreground: "hsl(215.4 16.3% 46.9%)",
                },
              },
            },
          },
          plugins: [],
        }),
        require('autoprefixer'),
      ],
    },
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: "./index.html"
    }
  }
});
EOF

# Build with isolated config
NODE_ENV=production npx vite build --config isolated.vite.config.js

# Clean up
rm isolated.vite.config.js
cd ..

# Verify and complete build
if [ -f "dist/public/index.html" ]; then
    echo "✅ Web build successful"
    
    # Copy required files
    cp public/manifest.json dist/public/ 2>/dev/null || true
    cp public/sw.js dist/public/ 2>/dev/null || true
    
    # Build server
    echo "🖥️  Building server..."
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    
    # Sync with iOS
    echo "📱 Syncing with iOS..."
    npx cap sync ios
    
    echo "✅ Complete build finished!"
    echo "📁 Build contents:"
    ls -la dist/public/ | head -8
else
    echo "❌ Build failed"
    exit 1
fi