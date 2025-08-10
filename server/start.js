#!/usr/bin/env node

/**
 * Production server starter for Render deployment
 * This ensures the server starts correctly on Render
 */

import('./index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});