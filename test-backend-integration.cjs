#!/usr/bin/env node

/**
 * Backend Integration Test Script
 * Verifies the new Render backend is properly integrated
 */

const https = require('https');

const BACKEND_URL = 'https://bytewise-backend.onrender.com';
const TESTS = [
  {
    name: 'Health Check',
    path: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    validateResponse: (data) => {
      return data && data.status === 'healthy';
    }
  },
  {
    name: 'Popular Foods',
    path: '/api/foods/popular',
    method: 'GET',
    expectedStatus: 200,
    validateResponse: (data) => {
      return Array.isArray(data) && data.length > 0;
    }
  },
  {
    name: 'Food Search (Apple)',
    path: '/api/foods/search?q=apple',
    method: 'GET',
    expectedStatus: 200,
    validateResponse: (data) => {
      return Array.isArray(data);
    }
  },
  {
    name: 'Auth Check',
    path: '/api/auth/check',
    method: 'GET',
    expectedStatus: [200, 401], // Either authenticated or not
    validateResponse: () => true
  }
];

function makeRequest(test) {
  return new Promise((resolve) => {
    const url = `${BACKEND_URL}${test.path}`;
    console.log(`\nTesting: ${test.name}`);
    console.log(`URL: ${url}`);
    
    const startTime = Date.now();
    
    https.get(url, { timeout: 60000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const expectedStatuses = Array.isArray(test.expectedStatus) 
          ? test.expectedStatus 
          : [test.expectedStatus];
        
        const statusOk = expectedStatuses.includes(res.statusCode);
        
        let jsonData;
        let validResponse = false;
        
        try {
          jsonData = JSON.parse(data);
          validResponse = test.validateResponse(jsonData);
        } catch (e) {
          jsonData = data;
        }
        
        console.log(`Status: ${res.statusCode} ${statusOk ? '✓' : '✗'}`);
        console.log(`Response Time: ${responseTime}ms`);
        
        if (statusOk && validResponse) {
          console.log(`Result: ✅ PASSED`);
        } else {
          console.log(`Result: ❌ FAILED`);
          if (!statusOk) {
            console.log(`Expected status: ${test.expectedStatus}, got: ${res.statusCode}`);
          }
          if (!validResponse) {
            console.log(`Response validation failed`);
          }
        }
        
        if (jsonData && typeof jsonData === 'object') {
          console.log(`Sample Response:`, JSON.stringify(jsonData).slice(0, 200));
        }
        
        resolve({
          test: test.name,
          passed: statusOk && validResponse,
          status: res.statusCode,
          responseTime
        });
      });
    }).on('error', (err) => {
      console.log(`Result: ❌ ERROR - ${err.message}`);
      resolve({
        test: test.name,
        passed: false,
        error: err.message
      });
    }).on('timeout', () => {
      console.log(`Result: ⏱️ TIMEOUT (Backend cold start - this is normal for first request)`);
      resolve({
        test: test.name,
        passed: false,
        error: 'Timeout - Backend warming up'
      });
    });
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('BACKEND INTEGRATION TEST SUITE');
  console.log('Backend URL:', BACKEND_URL);
  console.log('Date:', new Date().toISOString());
  console.log('='.repeat(60));
  
  console.log('\n⚠️  Note: First request may take 30-60 seconds (Render cold start)');
  
  const results = [];
  
  for (const test of TESTS) {
    const result = await makeRequest(test);
    results.push(result);
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    const time = r.responseTime ? `${r.responseTime}ms` : 'N/A';
    console.log(`${icon} ${r.test.padEnd(25)} ${r.error || `Status: ${r.status}, Time: ${time}`}`);
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. This is normal if:');
    console.log('   - Backend is cold starting (first request)');
    console.log('   - Backend is still deploying');
    console.log('   - Wait 1-2 minutes and run again');
  } else {
    console.log('\n✅ All tests passed! Backend is fully operational.');
  }
}

// Run the tests
runTests().catch(console.error);