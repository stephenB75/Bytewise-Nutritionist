// Redirect to actual server location
import('../../server/index.ts').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});