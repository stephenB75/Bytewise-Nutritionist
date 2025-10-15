#!/bin/bash

# Railway startup script for ByteWise Nutritionist
echo "🚀 Starting ByteWise Nutritionist on Railway..."

# Set default environment variables if not set
export NODE_ENV=${NODE_ENV:-production}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-5000}

# Log environment info
echo "📊 Environment: $NODE_ENV"
echo "🌐 Host: $HOST"
echo "🔌 Port: $PORT"
echo "📁 Working Directory: $(pwd)"

# Check if required files exist
if [ ! -f "server/index.ts" ]; then
    echo "❌ Error: server/index.ts not found"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Error: dist/public directory not found"
    exit 1
fi

# Start the application
echo "🎯 Starting server with tsx..."
exec tsx server/index.ts
