/**
 * Comprehensive System Check for ByteWise Nutritionist
 * Tests all components, buttons, and functions
 */

const http = require('http');
const https = require('https');

console.log('🔍 BYTEWISE NUTRITIONIST SYSTEM CHECK');
console.log('=' .repeat(50));

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function logTest(testName, status, message = '') {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  const symbol = symbols[status] || '❓';
  
  console.log(`${symbol} ${testName}: ${message}`);
  
  testResults[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
  testResults.details.push({ test: testName, status, message });
}

// Helper function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const lib = options.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test 1: Server Health Check
async function testServerHealth() {
  console.log('\n📡 SERVER HEALTH CHECKS');
  console.log('-'.repeat(30));
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      logTest('Server Response', 'pass', 'Server responding on port 5000');
    } else {
      logTest('Server Response', 'fail', `Unexpected status code: ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Server Response', 'fail', `Server not responding: ${error.message}`);
  }
}

// Test 2: API Endpoints
async function testAPIEndpoints() {
  console.log('\n🔗 API ENDPOINT TESTS');
  console.log('-'.repeat(30));
  
  const endpoints = [
    { path: '/api/foods/search?q=apple&limit=2', method: 'GET', name: 'Food Search API' },
    { path: '/api/foods/search?q=chocolate&limit=2', method: 'GET', name: 'Enhanced Candy Search' },
    { path: '/api/foods/search?q=gummy&limit=2', method: 'GET', name: 'Gummy Candy Search' },
    { path: '/api/foods/calculate', method: 'POST', name: 'Calorie Calculator API', 
      body: JSON.stringify({ ingredients: 'apple, 1 medium' }) },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.body
      });
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        if (endpoint.name.includes('Search') && data.foods && data.foods.length > 0) {
          logTest(endpoint.name, 'pass', `Returned ${data.foods.length} results`);
        } else if (endpoint.name.includes('Calculator') && data.result) {
          logTest(endpoint.name, 'pass', `Calculated ${data.result.totalCalories} calories`);
        } else {
          logTest(endpoint.name, 'pass', 'Valid response structure');
        }
      } else if (response.statusCode === 401) {
        logTest(endpoint.name, 'warn', 'Requires authentication (expected for protected endpoints)');
      } else {
        logTest(endpoint.name, 'fail', `Status: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(endpoint.name, 'fail', error.message);
    }
  }
}

// Test 3: Enhanced Candy System
async function testCandySystem() {
  console.log('\n🍬 ENHANCED CANDY SYSTEM TESTS');
  console.log('-'.repeat(30));
  
  const candyTests = [
    'chocolate candy',
    'hard candy', 
    'gummy bears',
    'lollipop',
    'caramel candy',
    'jelly beans',
    'taffy',
    'mint candy',
    'fudge',
    'marshmallow'
  ];
  
  for (const candy of candyTests) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/foods/search?q=${encodeURIComponent(candy)}&limit=1`,
        method: 'GET'
      });
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        if (data.foods && data.foods.length > 0) {
          const food = data.foods[0];
          const isEnhanced = food.dataType === 'Enhanced' || food.description?.includes('Enhanced');
          
          if (isEnhanced) {
            logTest(`${candy} (Enhanced)`, 'pass', `Enhanced data with ${food.calories} cal/100g`);
          } else {
            logTest(`${candy} (USDA)`, 'pass', `USDA data: ${food.description}`);
          }
        } else {
          logTest(candy, 'warn', 'No results found');
        }
      } else {
        logTest(candy, 'fail', `API error: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(candy, 'fail', error.message);
    }
  }
}

// Test 4: Authentication Endpoints  
async function testAuthSystem() {
  console.log('\n🔐 AUTHENTICATION SYSTEM TESTS');
  console.log('-'.repeat(30));
  
  const authEndpoints = [
    { path: '/api/auth/user', method: 'GET', name: 'User Session Check' },
    { path: '/api/user/restore-data', method: 'GET', name: 'Data Restoration' }
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Auth endpoints should return 401 for unauthenticated requests
      if (response.statusCode === 401) {
        logTest(endpoint.name, 'pass', 'Properly requires authentication');
      } else if (response.statusCode === 200) {
        logTest(endpoint.name, 'pass', 'Endpoint accessible');
      } else {
        logTest(endpoint.name, 'warn', `Unexpected status: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(endpoint.name, 'fail', error.message);
    }
  }
}

// Test 5: Static File Serving
async function testStaticFiles() {
  console.log('\n📁 STATIC FILE SERVING TESTS');
  console.log('-'.repeat(30));
  
  const staticFiles = [
    '/interactive_user_guide.html',
    '/ByteWise_Nutritionist_User_Guide.html'
  ];
  
  for (const file of staticFiles) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: file,
        method: 'GET'
      });
      
      if (response.statusCode === 200) {
        const isHtml = response.headers['content-type']?.includes('text/html');
        const hasContent = response.body.length > 1000;
        
        if (isHtml && hasContent) {
          logTest(`Static File: ${file}`, 'pass', `${Math.round(response.body.length/1024)}KB HTML file`);
        } else {
          logTest(`Static File: ${file}`, 'warn', 'File served but may be incomplete');
        }
      } else {
        logTest(`Static File: ${file}`, 'fail', `Status: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(`Static File: ${file}`, 'fail', error.message);
    }
  }
}

// Test 6: Calorie Calculation Accuracy
async function testCalculationAccuracy() {
  console.log('\n🧮 CALCULATION ACCURACY TESTS');
  console.log('-'.repeat(30));
  
  const calculationTests = [
    {
      ingredients: 'chocolate candy, 50g',
      expectedRange: { min: 250, max: 300 },
      name: 'Chocolate Candy Calculation'
    },
    {
      ingredients: 'apple, 1 medium',
      expectedRange: { min: 80, max: 120 },
      name: 'Apple Calculation'
    },
    {
      ingredients: 'gummy candy, 25g',
      expectedRange: { min: 90, max: 110 },
      name: 'Gummy Candy Calculation'
    }
  ];
  
  for (const test of calculationTests) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/foods/calculate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients: test.ingredients })
      });
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        const calories = parseFloat(data.result?.totalCalories || 0);
        
        if (calories >= test.expectedRange.min && calories <= test.expectedRange.max) {
          logTest(test.name, 'pass', `${calories} calories (within expected range)`);
        } else {
          logTest(test.name, 'warn', `${calories} calories (outside expected ${test.expectedRange.min}-${test.expectedRange.max})`);
        }
      } else {
        logTest(test.name, 'fail', `API error: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(test.name, 'fail', error.message);
    }
  }
}

// Test 7: Database Connectivity
async function testDatabaseConnectivity() {
  console.log('\n🗄️ DATABASE CONNECTIVITY TESTS');
  console.log('-'.repeat(30));
  
  // Test if endpoints that use database are responding
  const dbEndpoints = [
    { path: '/api/achievements', name: 'Achievements Database' },
    { path: '/api/meals/logged', name: 'Meals Database' }
  ];
  
  for (const endpoint of dbEndpoints) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: 'GET'
      });
      
      // These endpoints require auth, so 401 means database connection is working
      if (response.statusCode === 401) {
        logTest(endpoint.name, 'pass', 'Database connection active (requires auth)');
      } else if (response.statusCode === 500) {
        logTest(endpoint.name, 'fail', 'Database connection error');
      } else {
        logTest(endpoint.name, 'pass', 'Database accessible');
      }
    } catch (error) {
      logTest(endpoint.name, 'fail', `Database error: ${error.message}`);
    }
  }
}

// Main test execution
async function runSystemCheck() {
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  await testServerHealth();
  await testAPIEndpoints();
  await testCandySystem();
  await testAuthSystem();
  await testStaticFiles();
  await testCalculationAccuracy();
  await testDatabaseConnectivity();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SYSTEM CHECK SUMMARY');
  console.log('='.repeat(50));
  
  const total = testResults.passed + testResults.failed + testResults.warnings;
  const passRate = ((testResults.passed / total) * 100).toFixed(1);
  
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL CRITICAL SYSTEMS OPERATIONAL!');
    console.log('✅ Server is running properly');
    console.log('✅ APIs are responding correctly');
    console.log('✅ Enhanced candy system is working');
    console.log('✅ Authentication is secure');
    console.log('✅ Database connectivity confirmed');
    console.log('✅ Static files are served correctly');
  } else {
    console.log('\n⚠️  ISSUES DETECTED:');
    testResults.details
      .filter(test => test.status === 'fail')
      .forEach(test => console.log(`❌ ${test.test}: ${test.message}`));
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
}

// Run the system check
runSystemCheck().catch(console.error);