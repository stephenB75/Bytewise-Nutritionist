# ByteWise Nutritionist - Railway Deployment Guide

## Production Deployment to www.bytewisenutritionist.com

### Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **Railway CLI**: Install via `npm i -g @railway/cli`
3. **Domain Setup**: Configure www.bytewisenutritionist.com in Railway dashboard
4. **Environment Variables**: Prepare all required secrets

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Database
DATABASE_URL=your_postgresql_connection_string

# USDA API
USDA_API_KEY=your_usda_api_key

# Session
SESSION_SECRET=your_secure_session_secret

# Application
NODE_ENV=production
PORT=5000
APP_URL=https://www.bytewisenutritionist.com

# Email Settings (for Supabase)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Deployment Steps

#### 1. Initial Setup

```bash
# Login to Railway
railway login

# Link your project
railway link

# Set environment variables
railway variables set SUPABASE_URL=https://ykgqcftrfvjblmqzbqvr.supabase.co
railway variables set SUPABASE_ANON_KEY=your_key_here
# ... set all other variables
```

#### 2. Deploy Application

```bash
# Build and deploy
npm run build
railway up

# Or use the deployment script
chmod +x deploy-railway.sh
./deploy-railway.sh
```

#### 3. Configure Custom Domain

1. Go to Railway dashboard
2. Select your project
3. Navigate to Settings → Domains
4. Add custom domain: www.bytewisenutritionist.com
5. Update DNS records with provided CNAME

#### 4. Verify Deployment

1. Check health endpoint: https://www.bytewisenutritionist.com/api/health
2. Test authentication flow with email verification
3. Verify all features are working

### Email Verification Setup

The application requires email verification for new accounts. Configure these in Supabase:

1. **Supabase Dashboard**:
   - Go to Authentication → Email Templates
   - Customize confirmation email template
   - Set redirect URL to: https://www.bytewisenutritionist.com/verify-email

2. **SMTP Configuration**:
   - Configure SMTP settings in Supabase
   - Test email delivery

### Production Features

- ✅ Email verification required for sign-up
- ✅ Secure JWT-based authentication
- ✅ Health check endpoint for monitoring
- ✅ Graceful shutdown handling
- ✅ CORS configured for production domain
- ✅ Session persistence
- ✅ Error logging and monitoring

### Monitoring

1. **Health Check**: 
   - Endpoint: `/api/health`
   - Checks: Database, Auth, USDA API, Storage

2. **Railway Metrics**:
   - CPU usage
   - Memory consumption
   - Request counts
   - Error rates

### Troubleshooting

#### Email Verification Not Working
- Check SMTP configuration in Supabase
- Verify redirect URL is correct
- Check spam folder for verification emails

#### Database Connection Issues
- Verify DATABASE_URL is correct
- Check connection pool settings
- Ensure SSL mode is configured

#### Authentication Failures
- Verify all Supabase keys are correct
- Check CORS configuration
- Ensure JWT secret matches

### Maintenance

#### Update Deployment
```bash
git pull origin main
npm run build
railway up
```

#### Rollback
```bash
railway rollback
```

#### View Logs
```bash
railway logs
```

### Security Checklist

- [x] Email verification enforced
- [x] Environment variables secured
- [x] HTTPS only
- [x] CORS properly configured
- [x] Session security enabled
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS protection

### Support

For deployment issues:
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Test health endpoint: `curl https://www.bytewisenutritionist.com/api/health`

### Production URLs

- **Main Application**: https://www.bytewisenutritionist.com
- **Health Check**: https://www.bytewisenutritionist.com/api/health
- **Email Verification**: https://www.bytewisenutritionist.com/verify-email

### Next Steps

1. Set up monitoring alerts
2. Configure backup strategy
3. Implement rate limiting
4. Set up error tracking (Sentry/Rollbar)
5. Configure CDN for static assets