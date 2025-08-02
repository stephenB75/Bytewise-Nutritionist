#!/bin/bash
# GitHub Pages Production Build - Fixes all path issues

echo "🔧 GitHub Pages Build Fix"
echo "========================="

# Clean and rebuild
rm -rf dist/
mkdir -p dist/public

# Build with GitHub Pages base path
cat > vite.github.config.js << 'EOF'
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
  base: "./", // GitHub Pages compatible relative paths
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: "client/index.html"
    }
  },
  css: {
    postcss: "./postcss.config.js"
  }
});
EOF

# Build production bundle
NODE_ENV=production npx vite build --config vite.github.config.js

# Fix service worker path
sed -i 's|navigator.serviceWorker.register("/sw.js")|navigator.serviceWorker.register("./sw.js")|g' dist/public/index.html

# Fix manifest path (if not already fixed)
sed -i 's|href="/manifest.json"|href="./manifest.json"|g' dist/public/index.html

# Update service worker for relative paths
cat > dist/public/sw.js << 'EOF'
const CACHE_NAME = 'bytewise-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
EOF

# Update manifest for GitHub Pages
cat > dist/public/manifest.json << 'EOF'
{
  "name": "ByteWise Nutritionist",
  "short_name": "ByteWise",
  "description": "Professional nutrition tracking with USDA database integration",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#fef7cd",
  "theme_color": "#a8dadc",
  "icons": [
    {
      "src": "./icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "./icon-512.svg", 
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ],
  "orientation": "portrait-primary",
  "categories": ["health", "lifestyle", "productivity"]
}
EOF

# Create 404.html for GitHub Pages SPA routing
cat > dist/public/404.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ByteWise Nutritionist</title>
    <script type="text/javascript">
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/' +
        '?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
EOF

# Sync to iOS
npx cap sync ios

echo "✅ GitHub Pages build complete"
echo "Ready for deployment at: https://[username].github.io/[repository]/"