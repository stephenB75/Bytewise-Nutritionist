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

# Copy package files
COPY package*.json ./

# Install dependencies using package-lock.json
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy built client files to server/public for production serving
RUN mkdir -p server/public && cp -r client/dist/* server/public/

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
COPY supabase ./supabase
COPY public ./public

# Copy the built client files LAST to ensure they don't get overwritten
COPY --from=builder /app/client/dist ./server/public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start the application
CMD ["npm", "run", "start"]