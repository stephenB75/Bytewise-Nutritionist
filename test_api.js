const fetch = require('node-fetch');

async function testAPI() {
  try {
    // Test the meals/logged endpoint
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const url = `http://localhost:5000/api/meals/logged?startDate=${weekStart.toISOString()}&endDate=${tomorrow.toISOString()}`;
    console.log('Testing endpoint:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Meals found:', data.length);
      if (data.length > 0) {
        console.log('First meal:', JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
