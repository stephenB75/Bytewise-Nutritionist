# ByteWise Nutritionist - Production PWA

A professional nutrition tracking Progressive Web App with USDA database integration.

## Features
- USDA food database integration for accurate nutrition data
- Meal logging and calorie tracking
- Recipe creation and meal planning
- Progress analytics and achievement system
- Offline functionality with service worker
- PWA installable on mobile devices

## Deployment
This package contains the production-ready PWA build:

- `index.html` - Main application entry point
- `manifest.json` - PWA manifest for app installation
- `sw.js` - Service worker for offline functionality
- `assets/` - Optimized JavaScript and CSS bundles
- `icon-*.svg` - PWA icons for all platforms

## GitHub Pages Setup
1. Upload all files to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Your app will be available at: `https://[username].github.io/[repository]/`

## PWABuilder
Use this GitHub repository URL with PWABuilder to generate native iOS/Android apps for app store distribution.

## Performance
- Bundle size: ~600KB optimized JavaScript
- Code-split chunks for faster loading
- Vector icons for all resolutions
- Offline-first caching strategy

Built with React, TypeScript, Tailwind CSS, and Supabase.