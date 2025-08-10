#!/usr/bin/env node

/**
 * Backend Services Verification Script
 * Tests all critical backend functionality
 */

const http = require('http');
const https = require('https');

// Configuration
const LOCAL_BACKEND = 'http://localhost:5000';
const RENDER_BACKEND = 'https://bytewise-backend.onrender.com';
const REPLIT_BACKEND = 'https://workspace.stephtonybro.repl.co';

const tests = {
  health: '/api/health',
  popularFoods: '/api/foods/popular',
  searchFoods: '/api/foods/search?q=apple',
  authCheck: '/api/auth/check',
  userSettings: '/api/users/settings'
};

function testEndpoint(baseUrl, path) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${path}`;
    const client = url.startsWith('https') ? https : http;
    
    const startTime = Date.now();
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const json = JSON.parse(data);
          resolve({
            success: res.statusCode === 200 || res.statusCode === 401,
            status: res.statusCode,
            responseTime,
            data: json,
            dataType: Array.isArray(json) ? 'array' : 'object',
            itemCount: Array.isArray(json) ? json.length : null
          });
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            responseTime,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

async function verifyBackend(name, baseUrl) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${name}: ${baseUrl}`);
  console.log('='.repeat(60));
  
  let allPassed = true;
  let workingEndpoints = 0;
  let totalEndpoints = Object.keys(tests).length;
  
  for (const [testName, path] of Object.entries(tests)) {
    const result = await testEndpoint(baseUrl, path);
    
    const icon = result.success ? '✅' : '❌';
    const status = result.status ? `Status: ${result.status}` : '';
    const time = result.responseTime ? `${result.responseTime}ms` : '';
    const items = result.itemCount !== null ? `(${result.itemCount} items)` : '';
    
    console.log(`${icon} ${testName.padEnd(15)} ${status.padEnd(12)} ${time.padEnd(8)} ${items}`);
    
    if (result.success) {
      workingEndpoints++;
      
      // Additional validation for specific endpoints
      if (testName === 'health' && result.data?.services) {
        console.log(`   └─ Services: ${Object.entries(result.data.services)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}`);
      }
      
      if (testName === 'popularFoods' && result.itemCount > 0) {
        const foods = result.data.slice(0, 3).map(f => f.name);
        console.log(`   └─ Sample foods: ${foods.join(', ')}`);
      }
    } else {
      allPassed = false;
      if (result.error) {
        console.log(`   └─ Error: ${result.error}`);
      }
    }
  }
  
  console.log('-'.repeat(60));
  console.log(`Summary: ${workingEndpoints}/${totalEndpoints} endpoints working`);
  
  return { name, baseUrl, allPassed, workingEndpoints, totalEndpoints };
}

async function main() {
  console.log('BACKEND SERVICES VERIFICATION');
  console.log('Date:', new Date().toISOString());
  
  const results = [];
  
  // Test local backend
  results.push(await verifyBackend('Local Backend', LOCAL_BACKEND));
  
  // Test Render backend
  results.push(await verifyBackend('Render Backend', RENDER_BACKEND));
  
  // Test Replit backend
  results.push(await verifyBackend('Replit Backend', REPLIT_BACKEND));
  
  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));
  
  const workingBackends = results.filter(r => r.workingEndpoints > 0);
  const fullyWorkingBackends = results.filter(r => r.allPassed);
  
  if (fullyWorkingBackends.length > 0) {
    console.log('✅ Fully functional backends:');
    fullyWorkingBackends.forEach(b => {
      console.log(`   - ${b.name}: ${b.baseUrl}`);
    });
  }
  
  if (workingBackends.length > 0 && fullyWorkingBackends.length === 0) {
    console.log('⚠️  Partially working backends:');
    workingBackends.forEach(b => {
      console.log(`   - ${b.name}: ${b.workingEndpoints}/${b.totalEndpoints} endpoints`);
    });
  }
  
  if (workingBackends.length === 0) {
    console.log('❌ No working backends found!');
    console.log('\nTroubleshooting:');
    console.log('1. Check if the backend server is running');
    console.log('2. Verify environment variables are set');
    console.log('3. Check database connection strings');
    console.log('4. Deploy backend to Render if not done');
  } else {
    console.log('\n✅ Recommended configuration:');
    const best = workingBackends.sort((a, b) => b.workingEndpoints - a.workingEndpoints)[0];
    console.log(`   Use ${best.name} at ${best.baseUrl}`);
  }
}

main().catch(console.error);