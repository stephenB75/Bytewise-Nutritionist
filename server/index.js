// Simple server wrapper to work around Render's path issue
import('./index.ts').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});