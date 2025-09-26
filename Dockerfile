# Build stage
FROM node:20 AS builder

WORKDIR /app

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Set build-time environment variables with defaults
ENV VITE_SUPABASE_URL="https://bcfilsryfjwemqytwbvr.supabase.co"
ENV VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZmlsc3J5Zmp3ZW1xeXR3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzU5MTksImV4cCI6MjA2OTYxMTkxOX0.9AJ51rynZVDSINfVWYsh9s2cjpUvz75BR7FiA_TqNvk"
ENV VITE_USDA_API_KEY="DEMO_KEY"
ENV VITE_REVENUECAT_API_KEY=""
ENV NODE_ENV="production"

# Create required directories
RUN mkdir -p attached_assets dist client/dist server/public

# Copy essential source files
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY tsconfig.json ./

# Create assets directory (files handled by .dockerignore)
RUN mkdir -p attached_assets

# Build with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Ensure build output exists and copy to server/public
RUN ls -la client/dist/ || echo "No client dist found"
RUN mkdir -p server/public && cp -r client/dist/* server/public/ 2>/dev/null || echo "No files to copy"

# Production stage
FROM node:20

WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy other necessary files first
COPY server ./server
COPY shared ./shared

# Copy the built client files LAST to ensure they don't get overwritten
COPY --from=builder /app/client/dist ./server/public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start the application
CMD ["npm", "run", "start"]