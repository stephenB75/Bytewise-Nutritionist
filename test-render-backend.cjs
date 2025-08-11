// Test script to verify what Render should be seeing
const https = require('https');

console.log('Testing Render Backend Status...\n');

const testEndpoint = (path) => {
  return new Promise((resolve) => {
    https.get(`https://bytewise-backend.onrender.com${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`${path}: Status ${res.statusCode}`);
        if (res.statusCode === 502) {
          console.log('  → 502 Bad Gateway means Render can\'t start the server');
          console.log('  → Check Render logs for startup errors');
        }
        if (data) {
          try {
            const json = JSON.parse(data);
            console.log('  Response:', JSON.stringify(json, null, 2));
          } catch {
            console.log('  Response:', data.substring(0, 100));
          }
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`${path}: Error - ${err.message}`);
      resolve();
    });
  });
};

async function runTests() {
  await testEndpoint('/api/health');
  await testEndpoint('/');
  
  console.log('\n=== LIKELY ISSUE WITH YOUR RENDER DEPLOYMENT ===\n');
  console.log('Since you already added the environment variables, the problem is likely:');
  console.log('');
  console.log('❌ BUILD COMMAND ISSUE:');
  console.log('Your package.json uses: "vite build && esbuild server/index.ts"');
  console.log('This requires both vite AND esbuild to build.');
  console.log('');
  console.log('✅ SOLUTION:');
  console.log('In Render Dashboard > Settings:');
  console.log('');
  console.log('1. Change Build Command to:');
  console.log('   npm install && npm run build');
  console.log('');
  console.log('2. Make sure Start Command is:');
  console.log('   npm run start');
  console.log('');
  console.log('3. OR Try simpler commands:');
  console.log('   Build: npm install');
  console.log('   Start: node server/index.js');
  console.log('');
  console.log('4. CHECK THE LOGS:');
  console.log('   Go to Logs tab in Render and look for:');
  console.log('   - "Cannot find module \'dist/index.js\'" → Build failed');
  console.log('   - "esbuild: command not found" → Missing dependency');
  console.log('   - Any npm ERR! messages');
  console.log('');
  console.log('The logs will tell you exactly what\'s failing!');
}

runTests();