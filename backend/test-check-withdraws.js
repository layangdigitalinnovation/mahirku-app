const axios = require('axios');

async function checkWithdraws() {
  try {
    console.log('=== Check Withdraw Requests ===');
    
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin token obtained');
    
    // Get all withdraw requests
    console.log('\n2. Getting all withdraw requests...');
    const withdrawsResponse = await axios.get('http://localhost:5000/api/withdraw/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Withdraw requests retrieved');
    console.log('Response structure:', JSON.stringify(withdrawsResponse.data, null, 2));
    
    // Try to access the data
    const data = withdrawsResponse.data.data.withdrawRequests || withdrawsResponse.data.data || withdrawsResponse.data;
    if (Array.isArray(data)) {
      console.log('Total requests:', data.length);
      
      // Show first few requests
      const requests = data.slice(0, 5);
      console.log('\nFirst 5 requests:');
      requests.forEach(req => {
        console.log(`ID: ${req.id}, Status: ${req.status}, Amount: ${req.amount}, User: ${req.user?.email || 'N/A'}`);
      });
      
      // Check if ID 16 exists
      const request16 = data.find(req => req.id === 16);
      if (request16) {
        console.log('\n✅ Request ID 16 found:');
        console.log('Status:', request16.status);
        console.log('Amount:', request16.amount);
        console.log('User:', request16.user?.email || 'N/A');
      } else {
        console.log('\n❌ Request ID 16 NOT found');
        console.log('Available IDs:', data.map(req => req.id).slice(0, 10));
      }
    } else {
      console.log('Data is not an array:', typeof data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

checkWithdraws();