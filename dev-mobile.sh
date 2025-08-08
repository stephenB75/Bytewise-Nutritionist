#!/bin/bash

echo "🚀 Starting ByteWise Nutritionist - Mobile Development Mode"
echo ""
echo "📱 Network interfaces available:"
ip addr show | grep -E "inet (192\.168\.|10\.|172\.)" | sed 's/^/   /' | head -3
echo ""
echo "📍 Access from mobile device using one of the IPs above on port 5000"
echo "   Example: http://192.168.1.100:5000"
echo ""
echo "✨ Features enabled:"
echo "   - Hot reload for instant updates"
echo "   - Full backend with database"
echo "   - PWA service worker"
echo "   - Achievement system"
echo "   - Real device testing"
echo ""
echo "🔄 Starting server..."

HOST=0.0.0.0 npm run dev