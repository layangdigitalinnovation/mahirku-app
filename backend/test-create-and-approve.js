const axios = require('axios');

async function testCreateAndApprove() {
  try {
    console.log('=== Create and Approve Test ===');
    
    // Login as admin first to get admin token
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin token obtained');
    
    // Login as affiliator to create a withdraw request
    console.log('\n2. Logging in as affiliator...');
    const affLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'aff9@example.com',
      password: 'password123'
    });
    
    const affToken = affLoginResponse.data.token;
    console.log('✅ Affiliator token obtained');
    
    // Create a new withdraw request
    console.log('\n3. Creating new withdraw request...');
    const createResponse = await axios.post('http://localhost:5000/api/withdraw/request', {
      amount: 50000,
      bankName: 'BCA',
      accountNumber: '9876543210',
      accountName: 'Test Withdraw'
    }, {
      headers: { Authorization: `Bearer ${affToken}` }
    });
    
    const newRequestId = createResponse.data.data.id;
    console.log('✅ New withdraw request created with ID:', newRequestId);
    console.log('Status:', createResponse.data.data.status);
    
    // Now try to approve it with admin
    console.log('\n4. Approving the new request...');
    const approveResponse = await axios.put(`http://localhost:5000/api/withdraw/admin/${newRequestId}/approve`, {
      notes: 'Test approval for new request'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Approval successful!');
    console.log('Response:', approveResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n🔍 This is the 401 error we\'ve been investigating!');
    }
  }
}

testCreateAndApprove();