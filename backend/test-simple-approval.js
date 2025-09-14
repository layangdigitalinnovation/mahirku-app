const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});

async function testApproval() {
  try {
    console.log('=== Simple Approval Test ===');
    
    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.token;
    console.log('✓ Admin login successful');
    console.log('Admin token:', adminToken.substring(0, 20) + '...');
    
    // Step 2: Set authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    console.log('✓ Authorization header set');
    
    // Step 3: Test /auth/me endpoint
    console.log('\nStep 3: Testing /auth/me endpoint...');
    const meResponse = await api.get('/auth/me');
    console.log('✓ /auth/me successful');
    console.log('User:', meResponse.data.user.email, 'Role ID:', meResponse.data.user.roleId);
    
    // Step 4: Get withdraw requests
    console.log('\nStep 4: Getting withdraw requests...');
    const withdrawResponse = await api.get('/withdraw/admin/all');
    console.log('✓ Withdraw requests retrieved');
    console.log('Response structure:', Object.keys(withdrawResponse.data));
    console.log('Full response:', JSON.stringify(withdrawResponse.data, null, 2));
    
    const requests = withdrawResponse.data.data.data || [];
    console.log('Total requests:', requests.length);
    
    // Step 5: Create a new pending request first
    console.log('\nStep 5: Creating a new withdraw request...');
    
    // Login as affiliator first
    const affiliatorLoginResponse = await api.post('/auth/login', {
      email: 'aff9@example.com',
      password: 'password123'
    });
    
    const affiliatorToken = affiliatorLoginResponse.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${affiliatorToken}`;
    
    // Create withdraw request
    const createResponse = await api.post('/withdraw/request', {
      amount: 100000,
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountName: 'Test User'
    });
    
    console.log('✓ Withdraw request created:', createResponse.data.data.id);
    const pendingRequest = createResponse.data.data;
    
    // Switch back to admin token
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    
    console.log('Found pending request ID:', pendingRequest.id);
    
    // Step 6: Try to approve the request
    console.log('\nStep 6: Attempting to approve request...');
    console.log('Request URL:', `/withdraw/admin/${pendingRequest.id}/approve`);
    console.log('Authorization header:', api.defaults.headers.common['Authorization'].substring(0, 30) + '...');
    
    const approvalResponse = await api.put(`/withdraw/admin/${pendingRequest.id}/approve`, {
      notes: 'Test approval'
    });
    
    console.log('✓ Approval successful!');
    console.log('Response:', approvalResponse.data);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full response:', error.response?.data);
    console.log('Request config:', {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
  }
}

testApproval();