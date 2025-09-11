const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testSimpleRequest() {
  console.log('=== Testing Simple Request to See Logging ===\n');
  
  try {
    // Simple login request to trigger middleware logging
    console.log('Making a simple login request...');
    const response = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    console.log('✓ Request completed successfully');
    console.log('Response status:', response.status);
    
  } catch (error) {
    console.log('Request completed with error:', error.response?.status || error.message);
  }
}

testSimpleRequest();