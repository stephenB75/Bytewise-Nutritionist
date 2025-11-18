# Railway Deployment Guide

## Quick Start

1. **Connect Repository to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository

2. **Configure Deployment**
   - Railway will auto-detect the configuration from `railway.json` and `nixpacks.toml`
   - The app will serve from `dist/public` directory
   - Port is automatically set via `$PORT` environment variable

3. **Environment Variables** (Optional)
   - `NODE_ENV=production` (already set)
   - `PORT` (automatically set by Railway)

## Deployment Files

### `railway.json`
Main Railway configuration file specifying build and deploy commands.

### `railway.toml`
Alternative TOML format configuration (Railway supports both).

### `Procfile`
Process file for Railway to know how to start the app.

### `package.json`
Node.js package file with start scripts.

### `nixpacks.toml`
Nixpacks configuration for building and running the static site.

## How It Works

1. **Build Phase**: No build needed (static site already built)
2. **Deploy Phase**: Starts a simple HTTP server using `serve` package
3. **Serving**: Serves files from `dist/public` directory
4. **Port**: Uses Railway's `$PORT` environment variable

## Custom Domain Setup

1. In Railway dashboard, go to your project
2. Click on your service
3. Go to "Settings" → "Networking"
4. Add your custom domain: `bytewisenutritionist.com`
5. Railway will provide DNS records to configure

## Health Check

Railway automatically checks if the service is running on the configured port.

## Troubleshooting

### App not loading
- Check Railway logs for errors
- Verify `dist/public` directory exists
- Ensure `serve` package is available

### Port issues
- Railway automatically sets `$PORT`
- Don't hardcode port numbers
- Use `$PORT` environment variable

### Build failures
- Static site doesn't need building
- If build fails, check that `dist/public` exists
- Verify all files are committed to git

## Manual Deployment

If you need to deploy manually:

```bash
# Install serve globally
npm install -g serve

# Start server
serve -s dist/public -l $PORT
```

## File Structure

```
Bytewise-Nutritionist/
├── dist/
│   └── public/          # Static files served by Railway
├── railway.json         # Railway configuration
├── railway.toml         # Alternative config
├── Procfile            # Process file
├── package.json        # Node.js config
└── nixpacks.toml      # Nixpacks config
```

## Notes

- The app is a static PWA, so no build step is required
- Railway will automatically install `serve` package
- All static files are in `dist/public`
- Service worker and PWA features work automatically

