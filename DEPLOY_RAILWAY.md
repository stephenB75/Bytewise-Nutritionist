# Deploy to Railway - Quick Start Guide

## Option 1: Deploy via Railway Dashboard (Recommended)

### Step 1: Connect GitHub Repository
1. Go to [Railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select repository: `stephenB75/Bytewise-Nutritionist`
6. Select branch: `Cursor-Main`

### Step 2: Configure Deployment
- Railway will auto-detect the configuration from:
  - `railway.json`
  - `nixpacks.toml`
  - `Procfile`
  - `package.json`

### Step 3: Deploy
- Railway will automatically:
  1. Install Node.js 18
  2. Install `serve` package globally
  3. Start serving from `dist/public`
  4. Assign a public URL

### Step 4: Add Custom Domain
1. In Railway dashboard, go to your project
2. Click on your service
3. Go to **Settings** → **Networking**
4. Click **"Add Domain"**
5. Enter: `bytewisenutritionist.com`
6. Configure DNS records as shown by Railway

---

## Option 2: Deploy via Railway CLI

### Install Railway CLI
```bash
# macOS
brew install railway

# Or using npm
npm i -g @railway/cli
```

### Login to Railway
```bash
railway login
```

### Initialize Project
```bash
cd /Users/stephenb/Downloads/Bytewise-Nutritionist
railway init
```

### Link to Existing Project (if project exists)
```bash
railway link
```

### Deploy
```bash
# Deploy current branch
railway up

# Or deploy specific branch
railway up --branch Cursor-Main
```

### Set Environment Variables (if needed)
```bash
railway variables set NODE_ENV=production
```

---

## Option 3: Deploy via GitHub Integration (Automatic)

### Enable Auto-Deploy
1. In Railway dashboard
2. Go to your project → Settings
3. Enable **"Auto Deploy"**
4. Select branch: `Cursor-Main`
5. Railway will deploy automatically on every push

---

## Verification

After deployment, verify:

1. **Check Deployment Status**
   - Railway dashboard → Deployments
   - Should show "Active" status

2. **Test the App**
   - Visit the Railway-provided URL
   - Or your custom domain: `bytewisenutritionist.com`

3. **Check Logs**
   - Railway dashboard → Deployments → View Logs
   - Should see: "Serving!" message from serve

4. **Verify Service Worker**
   - Open DevTools → Application → Service Workers
   - Should be registered

---

## Troubleshooting

### Build Fails
- Check Railway logs for errors
- Verify `dist/public` directory exists
- Ensure all files are committed to git

### App Not Loading
- Check Railway logs
- Verify PORT is set correctly
- Check domain configuration

### Service Worker Issues
- Ensure HTTPS is enabled (Railway provides this)
- Check service worker registration in browser console

---

## Current Configuration

- **Branch:** Cursor-Main
- **Build System:** Nixpacks
- **Node Version:** 18.x
- **Start Command:** `serve -s dist/public -l $PORT`
- **Root Directory:** `dist/public`

---

## Quick Deploy Command (if CLI installed)

```bash
railway up --branch Cursor-Main
```

