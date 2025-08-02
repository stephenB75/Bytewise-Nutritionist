#!/bin/bash
# Fix GitHub Pages Subdirectory Path Issues

echo "🔧 Fixing GitHub Pages Subdirectory Paths"
echo "========================================="

# Clean and rebuild with proper base path
rm -rf dist/
mkdir -p dist/public

# Create Vite config specifically for GitHub Pages subdirectory
cat > vite.github-pages.config.js << 'EOF'
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
  base: "/Bytewise-Nutritionist/", // GitHub Pages subdirectory
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

# Build with GitHub Pages base path
NODE_ENV=production npx vite build --config vite.github-pages.config.js

# Fix service worker registration for subdirectory
sed -i 's|navigator.serviceWorker.register("./sw.js")|navigator.serviceWorker.register("/Bytewise-Nutritionist/sw.js")|g' dist/public/index.html

# Update manifest for subdirectory
cat > dist/public/manifest.json << 'EOF'
{
  "id": "com.bytewise.nutritionist",
  "name": "ByteWise Nutritionist", 
  "short_name": "ByteWise",
  "description": "Professional nutrition tracking app with USDA database integration",
  "start_url": "/Bytewise-Nutritionist/",
  "scope": "/Bytewise-Nutritionist/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#7dd3fc",
  "background_color": "#ffffff",
  "categories": ["health", "lifestyle", "food"],
  "lang": "en-US",
  "dir": "ltr",
  "icons": [
    {
      "src": "/Bytewise-Nutritionist/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/Bytewise-Nutritionist/icon-512.svg",
      "sizes": "512x512", 
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
EOF

# Update service worker for subdirectory
cat > dist/public/sw.js << 'EOF'
const CACHE_NAME = 'bytewise-v1';
const urlsToCache = [
  '/Bytewise-Nutritionist/',
  '/Bytewise-Nutritionist/index.html',
  '/Bytewise-Nutritionist/manifest.json'
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

# Create proper 404.html for GitHub Pages SPA routing
cat > dist/public/404.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ByteWise Nutritionist</title>
    <script type="text/javascript">
      // GitHub Pages SPA routing fix for subdirectory
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

echo "✅ GitHub Pages subdirectory paths fixed"
echo "Ready for: https://stephenb75.github.io/Bytewise-Nutritionist/"