#!/bin/bash

echo "🏗️ Building ByteWise Nutritionist for production testing..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Starting production server on port 5001..."
    NODE_ENV=production PORT=5001 node dist/index.js &
    SERVER_PID=$!
    
    echo "⏳ Waiting for server to start..."
    sleep 4
    
    echo ""
    echo "✅ Production server running!"
    echo "   URL: http://localhost:5001"
    echo "   Mode: Production optimized"
    echo "   PWA: Ready for installation testing"
    echo ""
    echo "🧪 Test checklist:"
    echo "   □ PWA installation prompt appears"
    echo "   □ Service worker caches resources"
    echo "   □ App works offline"
    echo "   □ Mobile responsive design"
    echo "   □ Achievement system functional"
    echo ""
    echo "🛑 Stop server: kill $SERVER_PID"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi