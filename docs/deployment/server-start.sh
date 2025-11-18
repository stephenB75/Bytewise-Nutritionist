#!/bin/bash
# Production Server Start Script

echo "Starting ByteWise Production Server..."

# Kill any existing servers on port 8080
pkill -f "python.*8080" 2>/dev/null || true

# Navigate to production build
cd dist/public

# Start HTTP server
echo "Starting server on http://0.0.0.0:8080/"
python3 -m http.server 8080 --bind 0.0.0.0