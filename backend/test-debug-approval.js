const axios = require('axios');

async function testDebugApproval() {
  try {
    console.log('=== Debug Approval Test ===');
    
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin token obtained');
    console.log('Token preview:', token.substring(0, 30) + '...');
    
    // Test working endpoint first
    console.log('\n2. Testing working endpoint /auth/me...');
    try {
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ /auth/me works - Status:', meResponse.status);
    } catch (error) {
      console.log('❌ /auth/me failed:', error.response?.status, error.response?.data);
      return;
    }
    
    // Test admin endpoint that works
    console.log('\n3. Testing working admin endpoint /withdraw/admin/all...');
    try {
      const allResponse = await axios.get('http://localhost:5000/api/withdraw/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ /withdraw/admin/all works - Status:', allResponse.status);
    } catch (error) {
      console.log('❌ /withdraw/admin/all failed:', error.response?.status, error.response?.data);
    }
    
    // Now test the problematic approval endpoint
    console.log('\n4. Testing problematic endpoint /withdraw/admin/16/approve...');
    try {
      const approvalResponse = await axios.put('http://localhost:5000/api/withdraw/admin/16/approve', 
        { notes: 'Debug test' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Approval works - Status:', approvalResponse.status);
      console.log('Response:', approvalResponse.data);
    } catch (error) {
      console.log('❌ Approval failed - Status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Request URL:', error.config?.url);
      console.log('Request method:', error.config?.method);
      console.log('Request headers:', error.config?.headers);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testDebugApproval();