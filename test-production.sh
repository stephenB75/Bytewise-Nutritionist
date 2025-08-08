#!/bin/bash

echo "🏗️ Building ByteWise Nutritionist for production testing..."
npm run build

echo "🚀 Starting production server..."
NODE_ENV=production node dist/index.js &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

echo "🧪 Testing PWA components..."
echo "✅ Manifest:" 
curl -s http://localhost:5000/manifest.json | grep '"name"' | head -1

echo "✅ Service Worker:"
curl -s http://localhost:5000/sw.js | head -1

echo "✅ Main App:"
curl -I http://localhost:5000/ 2>/dev/null | head -2

echo ""
echo "🎯 Production server running at: http://localhost:5000"
echo "📱 PWA ready for testing!"
echo ""
echo "Stop server with: kill $SERVER_PID"
