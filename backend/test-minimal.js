const axios = require('axios');

async function testMinimal() {
  try {
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Admin token obtained');
    
    // Try to approve request ID 16 (from previous test)
    const response = await axios.put('http://localhost:5000/api/withdraw/admin/approve/16', 
      { notes: 'Test' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data);
  }
}

testMinimal();