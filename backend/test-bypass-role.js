const axios = require('axios');

async function testBypassRole() {
  try {
    console.log('=== Testing Bypass Role Middleware ===');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin token obtained');
    
    // Test an endpoint that only uses authMiddleware (no checkRole)
    console.log('\n=== Testing /withdraw/history (authMiddleware only) ===');
    const historyResponse = await axios.get('http://localhost:5000/api/withdraw/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ /withdraw/history status:', historyResponse.status);
    
    // Test an endpoint that uses both authMiddleware and checkRole
    console.log('\n=== Testing /withdraw/admin/all (authMiddleware + checkRole) ===');
    const allResponse = await axios.get('http://localhost:5000/api/withdraw/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ /withdraw/admin/all status:', allResponse.status);
    
    // Test the problematic approval endpoint
    console.log('\n=== Testing /withdraw/admin/16/approve (authMiddleware + checkRole) ===');
    const approvalResponse = await axios.put('http://localhost:5000/api/withdraw/admin/16/approve', 
      { notes: 'Test' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Approval response:', approvalResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    console.log('Request URL:', error.config?.url);
    console.log('Request method:', error.config?.method);
  }
}

testBypassRole();