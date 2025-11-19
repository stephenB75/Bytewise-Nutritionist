# GitHub Deployment Configuration Guide

## Overview

This repository is configured to automatically deploy to **GitHub Pages** from the `Cursor-Main` branch using GitHub Actions.

## Current Configuration

### GitHub Actions Workflow
- **File:** `.github/workflows/deploy.yml`
- **Triggers:** 
  - Automatic: On push to `Cursor-Main` or `main` branch
  - Manual: Via GitHub Actions UI (workflow_dispatch)
- **Deployment Target:** GitHub Pages
- **Source Directory:** `dist/public`

## Setup Steps

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/stephenB75/Bytewise-Nutritionist`
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source:** `GitHub Actions`
   - This allows the workflow to deploy automatically

### Step 2: Verify Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, ensure:
   - ✅ **Read and write permissions** is selected
   - ✅ **Allow GitHub Actions to create and approve pull requests** (if needed)

### Step 3: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under **Actions permissions**, select:
   - ✅ **Allow all actions and reusable workflows**

### Step 4: Verify Branch Protection (Optional)

If you want to protect the `Cursor-Main` branch:

1. Go to **Settings** → **Branches**
2. Add branch protection rule for `Cursor-Main`
3. Configure as needed (status checks, required reviews, etc.)

## How It Works

### Automatic Deployment

1. **Push to Branch:**
   ```bash
   git push origin Cursor-Main
   ```

2. **GitHub Actions Triggers:**
   - Workflow automatically runs on push
   - Checks out the repository
   - Uploads `dist/public` as artifact
   - Deploys to GitHub Pages

3. **Deployment URL:**
   - Your site will be available at:
   - `https://stephenB75.github.io/Bytewise-Nutritionist/`
   - Or custom domain if configured

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"**
4. Select branch: `Cursor-Main`
5. Click **"Run workflow"**

## Deployment Process

The workflow performs these steps:

1. **Checkout** - Gets the latest code from `Cursor-Main` branch
2. **Setup Pages** - Configures GitHub Pages environment
3. **Upload Artifact** - Uploads `dist/public` directory
4. **Deploy** - Deploys to GitHub Pages

## Custom Domain Setup

To use a custom domain (e.g., `bytewisenutritionist.com`):

1. In repository **Settings** → **Pages**
2. Under **Custom domain**, enter: `bytewisenutritionist.com`
3. Configure DNS records:
   - **Type:** CNAME
   - **Name:** `@` or `www`
   - **Value:** `stephenB75.github.io`
4. Wait for DNS propagation (5-30 minutes)
5. GitHub will automatically create a `CNAME` file

## Environment Variables

If your app needs environment variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL`

**Note:** GitHub Pages serves static files, so environment variables are embedded at build time. If you need runtime environment variables, consider using Railway or another platform.

## Troubleshooting

### Deployment Not Triggering

- ✅ Check that GitHub Actions is enabled
- ✅ Verify workflow file is in `.github/workflows/`
- ✅ Check branch name matches (`Cursor-Main`)
- ✅ Look at Actions tab for errors

### Build Fails

- ✅ Check that `dist/public` directory exists
- ✅ Verify all files are committed
- ✅ Check workflow logs for specific errors

### Site Not Updating

- ✅ Wait a few minutes for deployment to complete
- ✅ Clear browser cache
- ✅ Check GitHub Pages settings
- ✅ Verify custom domain DNS (if using)

### 404 Errors

- ✅ Ensure `dist/public/index.html` exists
- ✅ Check base path in app configuration
- ✅ Verify GitHub Pages source is set correctly

## Workflow File Location

```
.github/
└── workflows/
    └── deploy.yml
```

## Deployment Status

Check deployment status:
1. Go to **Actions** tab
2. Click on latest workflow run
3. View deployment logs
4. Check deployment URL

## Alternative: Railway Deployment

If you prefer Railway over GitHub Pages:

1. Railway provides:
   - Better for dynamic apps
   - Environment variables support
   - Custom domains
   - Better performance

2. See `RAILWAY_DEPLOY_INSTRUCTIONS.md` for Railway setup

## Current Branch Configuration

- **Primary Branch:** `Cursor-Main`
- **Deployment Branch:** `Cursor-Main`
- **Fallback Branch:** `main`

## Next Steps

1. ✅ Enable GitHub Pages (Settings → Pages)
2. ✅ Set source to "GitHub Actions"
3. ✅ Push to `Cursor-Main` branch
4. ✅ Verify deployment in Actions tab
5. ✅ Test deployed site
6. ✅ Configure custom domain (optional)

---

**Status:** ✅ Workflow configured, ready for deployment  
**Branch:** `Cursor-Main`  
**Deployment:** Automatic on push

