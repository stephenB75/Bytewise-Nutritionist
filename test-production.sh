#!/bin/bash
# Test Production Build

echo "🧪 Testing Production Build"
echo "=========================="

# Stop development server
pkill -f "tsx server/index.ts" 2>/dev/null || true

# Ensure clean production build
./ultimate-build-fix.sh

# Test if build exists
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Production build missing"
    exit 1
fi

echo "✅ Production build exists"

# Start production server
cd dist/public
echo "Starting production server on port 8080..."
python3 -m http.server 8080 --bind 0.0.0.0 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test if server is responding
if curl -s http://localhost:8080/ | grep -q "ByteWise"; then
    echo "✅ Production server responding"
    echo "✅ HTML loading correctly"
else
    echo "❌ Production server not responding"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🌐 Production server running at:"
echo "   http://localhost:8080/"
echo ""
echo "Press Ctrl+C to stop server"

# Keep server running
wait $SERVER_PID