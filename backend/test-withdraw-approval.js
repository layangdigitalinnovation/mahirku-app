const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});

async function testWithdrawApproval() {
  try {
    console.log('=== Testing Withdraw Approval Process ===\n');
    
    // Step 1: Login as admin
    console.log('Step 1: Admin login...');
    const adminLoginResponse = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    console.log('Admin login response:', adminLoginResponse.data);
    
    if (!adminLoginResponse.data.token) {
      throw new Error('Admin login failed: No token received');
    }
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✓ Admin login successful');
    
    // Step 2: Login as affiliate to create withdraw request
    console.log('\nStep 2: Affiliate login...');
    const affiliateLoginResponse = await api.post('/auth/login', {
      email: 'aff9@example.com',
      password: 'password123'
    });
    
    console.log('Affiliate login response:', affiliateLoginResponse.data);
    
    if (!affiliateLoginResponse.data.token) {
       throw new Error(`Affiliate login failed: ${affiliateLoginResponse.data.message}`);
    }
    
    const affiliateToken = affiliateLoginResponse.data.token;
    console.log('✓ Affiliate login successful');
    
    // Step 3: Try to create withdraw request (skip if already exists)
    console.log('\nStep 3: Creating withdraw request...');
    api.defaults.headers.common['Authorization'] = `Bearer ${affiliateToken}`;
    
    try {
      const withdrawRequestResponse = await api.post('/withdraw/request', {
        amount: 50000,
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountName: 'Test Affiliate',
        notes: 'Test withdrawal request'
      });
      
      if (withdrawRequestResponse.data.success) {
        console.log('✓ Withdraw request created successfully');
        console.log('Request ID:', withdrawRequestResponse.data.data.id);
      }
    } catch (error) {
      console.log('Note: Could not create withdraw request:', error.response?.data?.message || error.message);
      console.log('Continuing with existing requests...');
    }
    
    // Step 4: Switch to admin and get pending requests
    console.log('\nStep 4: Getting pending withdraw requests...');
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    console.log('Admin token set:', adminToken ? adminToken.substring(0, 30) + '...' : 'null');
    
    const withdrawRequestsResponse = await api.get('/withdraw/admin/all?status=pending');
    
    if (!withdrawRequestsResponse.data.success || withdrawRequestsResponse.data.data.withdrawRequests.length === 0) {
      console.log('No pending withdraw requests found');
      return;
    }
    
    const pendingRequest = withdrawRequestsResponse.data.data.withdrawRequests[0];
    console.log('✓ Found pending request ID:', pendingRequest.id);
    console.log('Amount:', pendingRequest.amount);
    console.log('Status:', pendingRequest.status);
    
    // Step 5: Approve the withdraw request
    console.log('\nStep 5: Approving withdraw request...');
    console.log('Request URL:', `/withdraw/admin/approve/${pendingRequest.id}`);
    console.log('Authorization header:', api.defaults.headers.common['Authorization']);
    
    const approveResponse = await api.put(`/withdraw/admin/approve/${pendingRequest.id}`, {
      notes: 'Approved by test script'
    });
    
    if (approveResponse.data.success) {
      console.log('✓ Withdraw request approved successfully!');
      console.log('Response:', JSON.stringify(approveResponse.data, null, 2));
    } else {
      console.log('✗ Approval failed:', approveResponse.data.message);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWithdrawApproval();