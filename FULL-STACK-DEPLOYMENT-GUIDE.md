# 🚀 Full Stack Deployment Guide - Complete Independence from Replit
## ByteWise Nutritionist - bytewisenutritionist.com

This guide will help you deploy your app with **both backend and frontend** running independently from Replit.

## Current Architecture
- **Frontend**: React app on Vercel (bytewisenutritionist.com)
- **Backend**: Express.js API (currently on Replit only)
- **Database**: Supabase (already independent)
- **Goal**: Deploy backend independently and connect everything

## 🎯 Recommended Architecture
1. **Frontend**: Keep on Vercel (bytewisenutritionist.com)
2. **Backend**: Deploy to Render.com (free tier available)
3. **Database**: Keep on Supabase

---

## 📦 Part 1: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

Create a new file `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: bytewise-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: PORT
        value: 10000
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up for free account
3. Connect your GitHub account

### Step 3: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `bytewise-backend`
   - **Root Directory**: Leave blank
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your_supabase_database_url
   SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (takes ~5 minutes)
7. Your backend URL will be: `https://bytewise-backend.onrender.com`

---

## 🌐 Part 2: Update Frontend to Use New Backend

### Step 1: Update Environment Variables

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   ```
   VITE_API_BASE_URL=https://bytewise-backend.onrender.com
   VITE_SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### Step 2: Update Frontend Code

Update `client/src/lib/config.ts`:

```typescript
// Dynamic API base URL for production
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Production (your backend on Render)
  if (isCustomDomain || isProd) {
    return 'https://bytewise-backend.onrender.com';
  }
  
  // Local development
  return `${window.location.protocol}//${window.location.host}/api`;
};
```

### Step 3: Update API Request Handler

Update `client/src/lib/queryClient.ts`:

```typescript
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  
  // Use the backend URL from config
  const baseUrl = config.apiBaseUrl;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const headers = {
    ...authHeaders,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}
```

---

## 🔄 Part 3: Configure CORS for Backend

Update `server/index.ts` to allow your frontend domain:

```typescript
app.use(cors({
  origin: [
    'https://bytewisenutritionist.com',
    'https://www.bytewisenutritionist.com',
    'http://localhost:5173', // for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## ✅ Part 4: Deploy Everything

### Backend Deployment (Render)
```bash
# Commit your changes
git add .
git commit -m "Configure for Render deployment"
git push

# Render will auto-deploy from GitHub
```

### Frontend Deployment (Vercel)
```bash
# Deploy frontend with new backend URL
vercel --prod
```

---

## 🧪 Part 5: Test Everything

### Test Checklist:
- [ ] Backend health check: `https://bytewise-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://bytewisenutritionist.com`
- [ ] User can sign up/login
- [ ] Meals can be logged
- [ ] Data persists in Supabase
- [ ] All features work without Replit

---

## 💡 Alternative Backend Hosting Options

### Option A: Railway.app (Easier, $5/month)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
railway domain
```

### Option B: Heroku (Professional, $7/month)
```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create bytewise-backend
git push heroku main
```

### Option C: DigitalOcean App Platform ($5/month)
1. Create app at [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Connect GitHub
3. Auto-deploy on push

---

## 🔒 Security Checklist

- [x] Environment variables are set in production
- [x] CORS is configured correctly
- [x] Database has Row Level Security (RLS)
- [x] API keys are not exposed in frontend
- [x] HTTPS is enforced

---

## 📊 Monitoring

### Backend Monitoring (Render)
- Dashboard: `https://dashboard.render.com`
- Logs: Available in Render dashboard
- Metrics: CPU, Memory, Request count

### Frontend Monitoring (Vercel)
- Analytics: Built into Vercel
- Performance: Web Vitals tracking
- Errors: Vercel Functions logs

---

## 🆘 Troubleshooting

### Backend Not Responding
1. Check Render dashboard for deploy status
2. View logs: Render Dashboard → Your Service → Logs
3. Verify environment variables are set

### CORS Errors
1. Ensure backend allows your frontend domain
2. Check credentials: 'include' in fetch requests
3. Verify headers are allowed

### Database Connection Issues
1. Check DATABASE_URL is correct
2. Verify Supabase project is active
3. Check connection pooling settings

### Frontend Can't Connect to Backend
1. Verify VITE_API_BASE_URL is set in Vercel
2. Check backend is running
3. Test backend endpoint directly

---

## 🎉 Success!

Your app is now completely independent from Replit:
- ✅ Frontend on Vercel: `bytewisenutritionist.com`
- ✅ Backend on Render: `bytewise-backend.onrender.com`
- ✅ Database on Supabase
- ✅ All services running independently
- ✅ No Replit dependency

## 📝 Important URLs After Deployment
- **Production Site**: https://bytewisenutritionist.com
- **Backend API**: https://bytewise-backend.onrender.com
- **Database**: Supabase Dashboard
- **Backend Logs**: Render Dashboard
- **Frontend Analytics**: Vercel Dashboard

## 🔄 Continuous Deployment
Both Vercel and Render support automatic deployments:
- Push to GitHub → Auto-deploy to both services
- Zero downtime deployments
- Rollback capability

---

Remember to update DNS if needed and allow 24-48 hours for propagation.