# Use Debian-based Node.js for reliable native module compilation
FROM node:20-bookworm-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci --silent

# Copy application source
COPY . .

# Build application
ENV CI=false
RUN npm run build

# Production stage
FROM node:20-bookworm-slim AS runner

# Set working directory
WORKDIR /app

# Copy built application, server source, and ALL dependencies (including dev for tsx/vite)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/vite.config.ts ./

# Install tsx globally for production
RUN npm install -g tsx

# Create startup script directly in production stage
RUN echo '#!/bin/bash' > start.sh && \
    echo 'echo "🚀 Starting ByteWise Nutritionist on Railway..."' >> start.sh && \
    echo 'export NODE_ENV=${NODE_ENV:-production}' >> start.sh && \
    echo 'export HOST=${HOST:-0.0.0.0}' >> start.sh && \
    echo 'export PORT=${PORT:-5000}' >> start.sh && \
    echo 'echo "📊 Environment: $NODE_ENV"' >> start.sh && \
    echo 'echo "🌐 Host: $HOST"' >> start.sh && \
    echo 'echo "🔌 Port: $PORT"' >> start.sh && \
    echo 'if [ ! -f "server/index.ts" ]; then' >> start.sh && \
    echo '    echo "❌ Error: server/index.ts not found"' >> start.sh && \
    echo '    exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo 'if [ ! -d "dist/public" ]; then' >> start.sh && \
    echo '    echo "❌ Error: dist/public directory not found"' >> start.sh && \
    echo '    exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo 'echo "🎯 Starting server with tsx..."' >> start.sh && \
    echo 'exec tsx server/index.ts' >> start.sh && \
    chmod +x start.sh

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Expose port
EXPOSE 5000

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Add health check - use PORT environment variable for Railway compatibility
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Start the application using the startup script
CMD ["./start.sh"]