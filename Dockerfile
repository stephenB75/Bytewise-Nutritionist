# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine AS base

# Install build dependencies for Alpine
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

# Set working directory
WORKDIR /app

# Build stage - install all dependencies and build
FROM base AS builder
COPY package*.json ./
RUN npm ci --silent
COPY . .
ENV CI=false
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]