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
  
  console.log('\n=== RENDER DEPLOYMENT CHECKLIST ===');
  console.log('If you see 502 errors above, check these in Render Dashboard:');
  console.log('');
  console.log('1. LOGS TAB - Look for:');
  console.log('   ✓ "npm ERR!" - Missing dependencies');
  console.log('   ✓ "Error: Cannot find module" - Build failed');
  console.log('   ✓ "SyntaxError" - Code issues');
  console.log('   ✓ "ECONNREFUSED" - Database connection failed');
  console.log('');
  console.log('2. ENVIRONMENT TAB - Verify these exist:');
  console.log('   ✓ SUPABASE_URL');
  console.log('   ✓ SUPABASE_ANON_KEY');
  console.log('   ✓ NODE_ENV=production');
  console.log('');
  console.log('3. SETTINGS TAB - Check:');
  console.log('   ✓ Build Command: npm install');
  console.log('   ✓ Start Command: npm run start');
  console.log('   ✓ Node Version: Should be 18+');
  console.log('');
  console.log('4. EVENTS TAB - Look for:');
  console.log('   ✓ "Deploy failed" messages');
  console.log('   ✓ "Build failed" messages');
  console.log('');
  console.log('Most common issue: Build command or start command is wrong');
}

runTests();