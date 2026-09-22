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

# Vite bakes these in at build time. Railway passes matching service variables as build-args.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_USDA_API_KEY
ARG VITE_REVENUECAT_API_KEY
ARG VITE_APP_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_USDA_API_KEY=$VITE_USDA_API_KEY
ENV VITE_REVENUECAT_API_KEY=$VITE_REVENUECAT_API_KEY
ENV VITE_APP_URL=$VITE_APP_URL
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

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the application using tsx to run TypeScript server directly
CMD ["npx", "tsx", "server/index.ts"]