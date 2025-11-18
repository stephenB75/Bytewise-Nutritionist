# Railway Deployment Instructions

## ✅ Project Created on Railway

**Project Name:** bytewise-nutritionist  
**Project URL:** https://railway.com/project/fe23c341-77e6-4337-b528-f1895d46c44c

## 🚀 Recommended: Deploy via GitHub Integration

Since the repository is large (1.5GB), **GitHub integration is the recommended method** as Railway will only pull what's needed from GitHub.

### Steps:

1. **Go to Railway Dashboard**
   - Visit: https://railway.com/project/fe23c341-77e6-4337-b528-f1895d46c44c
   - Or go to https://railway.app and select your project

2. **Connect GitHub Repository**
   - Click on your service (or create a new service)
   - Go to **Settings** → **Source**
   - Click **"Connect GitHub Repo"**
   - Select: `stephenB75/Bytewise-Nutritionist`
   - Select branch: `Cursor-Main`
   - Click **"Deploy"**

3. **Railway will automatically:**
   - Pull code from GitHub (only necessary files)
   - Detect `nixpacks.toml` configuration
   - Install Node.js 18
   - Install `serve` package
   - Deploy from `dist/public` directory
   - Assign a public URL

4. **Monitor Deployment**
   - Watch the build logs in Railway dashboard
   - Deployment should complete in 2-3 minutes

## 🌐 Add Custom Domain

After deployment succeeds:

1. In Railway dashboard → Your service → **Settings** → **Networking**
2. Click **"Add Domain"**
3. Enter: `bytewisenutritionist.com`
4. Railway will provide DNS records:
   - CNAME record to point to Railway
   - Or A record if using apex domain
5. Configure DNS with your domain provider
6. Wait for DNS propagation (5-30 minutes)

## 📊 Verify Deployment

1. **Check Deployment Status**
   - Railway dashboard → Deployments
   - Should show "Active" status

2. **Test the App**
   - Visit Railway-provided URL (e.g., `*.railway.app`)
   - Or your custom domain after DNS is configured

3. **Check Logs**
   - Railway dashboard → Deployments → View Logs
   - Should see: "Serving!" message

## 🔧 Alternative: Deploy Specific Directory

If you need to use CLI, you can deploy only the dist/public directory:

```bash
# Deploy only dist/public (smaller upload)
railway up dist/public
```

However, GitHub integration is still recommended for large repos.

## 📝 Current Configuration

- **Branch:** Cursor-Main
- **Build System:** Nixpacks
- **Node Version:** 18.x
- **Start Command:** `serve -s dist/public -l $PORT`
- **Root Directory:** `dist/public`
- **Project ID:** fe23c341-77e6-4337-b528-f1895d46c44c

## ✅ Next Steps

1. Connect GitHub repository in Railway dashboard
2. Select branch: `Cursor-Main`
3. Deploy
4. Add custom domain: `bytewisenutritionist.com`
5. Configure DNS records
6. Test the deployed app

---

**Note:** The Railway project is already created and linked. You just need to connect the GitHub repository in the dashboard.

