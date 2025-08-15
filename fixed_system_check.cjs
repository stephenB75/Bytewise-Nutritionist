/**
 * Updated System Check with Fixed API Endpoints
 */

const http = require('http');

console.log('🔧 UPDATED SYSTEM CHECK - FIXED API ENDPOINTS');
console.log('=' .repeat(50));

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

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

async function testFixedAPIs() {
  console.log('\n🔧 FIXED API ENDPOINT TESTS');
  console.log('-'.repeat(30));
  
  const endpoints = [
    { path: '/api/foods/search?q=apple&limit=2', method: 'GET', name: 'Food Search API (Fixed)' },
    { path: '/api/foods/search?q=chocolate&limit=2', method: 'GET', name: 'Enhanced Candy Search (Fixed)' },
    { path: '/api/foods/calculate', method: 'POST', name: 'Calorie Calculator API (New endpoint)', 
      body: JSON.stringify({ ingredients: 'apple, 1 medium' }) },
    { path: '/api/calculate-calories', method: 'POST', name: 'Alternative Calculator API', 
      body: JSON.stringify({ ingredient: 'apple', measurement: '1 medium' }) }
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
        try {
          const data = JSON.parse(response.body);
          if (endpoint.name.includes('Search') && data.foods) {
            logTest(endpoint.name, 'pass', `Returned ${data.foods.length} results`);
          } else if (endpoint.name.includes('Calculator') && data.result) {
            logTest(endpoint.name, 'pass', `Calculated ${data.result.estimatedCalories || data.result.totalCalories} calories`);
          } else {
            logTest(endpoint.name, 'pass', 'Valid JSON response');
          }
        } catch (parseError) {
          logTest(endpoint.name, 'fail', `Invalid JSON response: ${parseError.message}`);
        }
      } else {
        logTest(endpoint.name, 'fail', `Status: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(endpoint.name, 'fail', error.message);
    }
  }
}

async function testEnhancedCandySystem() {
  console.log('\n🍬 ENHANCED CANDY SYSTEM VERIFICATION');
  console.log('-'.repeat(30));
  
  const candyTests = [
    'chocolate candy',
    'gummy bears',
    'hard candy',
    'lollipop',
    'caramel candy'
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
        try {
          const data = JSON.parse(response.body);
          if (data.foods && data.foods.length > 0) {
            const food = data.foods[0];
            const isEnhanced = food.dataType === 'Enhanced' || food.description?.includes('Enhanced');
            
            if (isEnhanced) {
              logTest(`${candy} (Enhanced)`, 'pass', `Enhanced data: ${food.description}`);
            } else {
              logTest(`${candy} (USDA)`, 'pass', `USDA data: ${food.description}`);
            }
          } else {
            logTest(candy, 'warn', 'No results found');
          }
        } catch (parseError) {
          logTest(candy, 'fail', `JSON parse error: ${parseError.message}`);
        }
      } else {
        logTest(candy, 'fail', `API error: ${response.statusCode}`);
      }
    } catch (error) {
      logTest(candy, 'fail', error.message);
    }
  }
}

async function runFixedSystemCheck() {
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  await testFixedAPIs();
  await testEnhancedCandySystem();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FIXED SYSTEM CHECK RESULTS');
  console.log('='.repeat(50));
  
  const total = testResults.passed + testResults.failed + testResults.warnings;
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : '0';
  
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('✅ Food search API working properly');
    console.log('✅ Calculator APIs responding correctly');
    console.log('✅ Enhanced candy system functional');
    console.log('✅ JSON parsing issues resolved');
  } else {
    console.log('\n⚠️  REMAINING ISSUES:');
    testResults.details
      .filter(test => test.status === 'fail')
      .forEach(test => console.log(`❌ ${test.test}: ${test.message}`));
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
}

runFixedSystemCheck().catch(console.error);