# ByteWise Nutritionist - External Deployment Guide

## Deployment Options for bytewisenutritionist.com

### Option 1: Vercel (Recommended for Next.js/React apps)
Free tier available, automatic SSL, global CDN

### Option 2: Netlify
Great for static sites with serverless functions

### Option 3: Digital Ocean App Platform
Full-stack deployment with managed database

### Option 4: VPS (DigitalOcean, AWS, Linode)
Full control, requires more setup

## Pre-Deployment Checklist

- [x] Production build scripts configured
- [x] Environment variables documented
- [x] Database configured (PostgreSQL)
- [x] Static assets optimized
- [x] PWA manifest configured
- [x] iOS icons generated

## Required Environment Variables

```
DATABASE_URL=your_production_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
NODE_ENV=production
```

## Domain Configuration

Domain: bytewisenutritionist.com
SSL: Will be auto-configured by most hosting platforms