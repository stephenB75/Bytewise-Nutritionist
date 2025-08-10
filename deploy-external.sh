#!/bin/bash

# ByteWise Nutritionist - External Deployment Script
# Deploy to VPS or cloud provider

echo "=== ByteWise Nutritionist Deployment Script ==="
echo ""
echo "This script prepares your app for deployment on external hosting"
echo ""

# Build the application
echo "1. Building production assets..."
npm run build

# Create deployment package
echo ""
echo "2. Creating deployment package..."
mkdir -p deployment-package
cp -r dist deployment-package/
cp package.json deployment-package/
cp package-lock.json deployment-package/
cp -r server deployment-package/
cp -r shared deployment-package/
cp -r public deployment-package/

# Create production environment template
cat > deployment-package/.env.example << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# App URL
VITE_APP_URL=https://bytewisenutiritionist.com
EOF

echo ""
echo "3. Creating deployment instructions..."
cat > deployment-package/DEPLOY.md << 'EOF'
# Deployment Instructions for bytewisenutiritionist.com

## VPS Deployment (Ubuntu/Debian)

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Configure Nginx
Create `/etc/nginx/sites-available/bytewisenutiritionist.com`:
```nginx
server {
    listen 80;
    server_name bytewisenutiritionist.com www.bytewisenutiritionist.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bytewisenutiritionist.com -d www.bytewisenutiritionist.com
```

### 4. Start Application
```bash
# Install dependencies
npm install --production

# Set up environment variables
cp .env.example .env
nano .env  # Edit with your values

# Start with PM2
pm2 start npm --name "bytewise" -- start
pm2 save
pm2 startup
```

## Alternative: Docker Deployment

Use the included Dockerfile to containerize the application.

## DNS Configuration

Point your domain to your server:
- A Record: @ -> Your Server IP
- A Record: www -> Your Server IP
EOF

echo ""
echo "4. Creating Docker configuration..."
cat > deployment-package/Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy application files
COPY dist ./dist
COPY server ./server
COPY shared ./shared
COPY public ./public

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
EOF

cat > deployment-package/docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
EOF

echo ""
echo "✅ Deployment package created in ./deployment-package/"
echo ""
echo "Next steps:"
echo "1. Review and edit deployment-package/.env.example with your production values"
echo "2. Choose your deployment method:"
echo "   - VPS: Follow instructions in deployment-package/DEPLOY.md"
echo "   - Vercel: Run 'vercel' in project root"
echo "   - Netlify: Connect GitHub repo or drag folder to Netlify"
echo "3. Configure DNS for bytewisenutiritionist.com"