const axios = require('axios');

async function testAuthMiddleware() {
  try {
    console.log('=== Testing Auth Middleware ===');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin token obtained');
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    // Test /auth/me endpoint (should use authMiddleware)
    console.log('\n=== Testing /auth/me endpoint ===');
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ /auth/me response:', meResponse.data);
    
    // Test withdraw history endpoint (should use authMiddleware)
    console.log('\n=== Testing /withdraw/history endpoint ===');
    const historyResponse = await axios.get('http://localhost:5000/api/withdraw/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ /withdraw/history response status:', historyResponse.status);
    
    // Test the problematic approval endpoint
    console.log('\n=== Testing /withdraw/admin/16/approve endpoint ===');
    const approvalResponse = await axios.put('http://localhost:5000/api/withdraw/admin/16/approve', 
      { notes: 'Test' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Approval response:', approvalResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔍 This confirms the 401 error is happening');
    }
  }
}

testAuthMiddleware();