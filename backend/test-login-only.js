const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Response status:', loginResponse.status);
    console.log('Response data:', loginResponse.data);
    
  } catch (error) {
    console.error('Login failed:', error.response?.status, error.response?.data || error.message);
  }
};

testLogin();