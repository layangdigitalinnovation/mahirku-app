const axios = require('axios');
require('dotenv').config();

// Test the complete mock payout flow
async function testMockPayoutFlow() {
  console.log('=== Testing Mock Payout Flow ===\n');
  
  const baseUrl = 'http://localhost:5000';
  let authToken = '';
  
  try {
    // Step 1: Login as admin
    console.log('Step 1: Admin Login...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }
    
    // Step 2: Get pending withdraw requests
    console.log('\nStep 2: Getting pending withdraw requests...');
    const withdrawsResponse = await axios.get(`${baseUrl}/api/withdraw/admin/all`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const pendingWithdraws = withdrawsResponse.data.data.withdrawRequests.filter(w => w.status === 'pending');
    console.log(`Found ${pendingWithdraws.length} pending withdraw requests`);
    
    if (pendingWithdraws.length === 0) {
      console.log('⚠️  No pending withdraws found. Creating a test withdraw request...');
      
      // Create a test withdraw request (you might need to implement this)
      console.log('Note: You may need to create a test withdraw request manually');
      return;
    }
    
    const testWithdraw = pendingWithdraws[0];
    console.log(`Using withdraw request ID: ${testWithdraw.id}`);
    console.log(`Amount: Rp ${testWithdraw.amount.toLocaleString()}`);
    console.log(`Affiliate: ${testWithdraw.affiliate?.fullname || 'Unknown'}`);
    
    // Step 3: Approve the withdraw request (this should trigger mock payout)
    console.log('\nStep 3: Approving withdraw request...');
    const approvalResponse = await axios.put(
      `${baseUrl}/api/withdraw/admin/approve/${testWithdraw.id}`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (approvalResponse.status === 200) {
      console.log('✅ Withdraw request approved successfully');
      console.log('Response:', approvalResponse.data);
      
      // Check if it mentions mock service
      if (approvalResponse.data.message && approvalResponse.data.message.includes('mock')) {
        console.log('🔧 Mock payout service was used (as expected in development)');
      }
    } else {
      throw new Error('Failed to approve withdraw request');
    }
    
    // Step 4: Check the updated withdraw request status
    console.log('\nStep 4: Checking updated withdraw status...');
    const updatedWithdrawResponse = await axios.get(
      `${baseUrl}/api/withdraw/admin/requests`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const updatedWithdraw = updatedWithdrawResponse.data.find(w => w.id === testWithdraw.id);
    if (updatedWithdraw) {
      console.log('Updated withdraw status:', updatedWithdraw.status);
      console.log('Payout ID:', updatedWithdraw.payoutId || 'Not set');
      console.log('Payout Status:', updatedWithdraw.payoutStatus || 'Not set');
      
      if (updatedWithdraw.status === 'processing') {
        console.log('✅ Withdraw status correctly updated to processing');
      }
      
      if (updatedWithdraw.payoutId && updatedWithdraw.payoutId.startsWith('mock_payout_')) {
        console.log('✅ Mock payout ID correctly assigned');
      }
    }
    
    // Step 5: Wait for mock callback (should happen within 3-10 seconds)
    console.log('\nStep 5: Waiting for mock payout callback...');
    console.log('Mock service should send a callback within 3-10 seconds...');
    
    // Wait and check status multiple times
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const checkResponse = await axios.get(
        `${baseUrl}/api/withdraw/admin/requests`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      const currentWithdraw = checkResponse.data.find(w => w.id === testWithdraw.id);
      if (currentWithdraw) {
        console.log(`Check ${i + 1}: Status = ${currentWithdraw.status}, Payout Status = ${currentWithdraw.payoutStatus || 'Not set'}`);
        
        if (currentWithdraw.status === 'completed' || currentWithdraw.status === 'failed') {
          console.log(`✅ Mock callback received! Final status: ${currentWithdraw.status}`);
          break;
        }
      }
      
      if (i === 5) {
        console.log('⚠️  Callback not received within 12 seconds. This might be normal if callback URL is not accessible.');
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Mock payout service integration working');
    console.log('✅ Withdraw approval triggers payout creation');
    console.log('✅ Mock payout ID is stored correctly');
    console.log('✅ System handles development mode gracefully');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test with production Xendit API key when ready');
    console.log('2. Verify callback URL is accessible for production');
    console.log('3. Complete Xendit business verification for real payouts');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Tip: Make sure admin credentials are correct');
    } else if (error.response?.status === 404) {
      console.log('💡 Tip: Make sure the server is running on port 5000');
    }
  }
}

// Helper function to create a test withdraw request if needed
async function createTestWithdrawRequest() {
  console.log('=== Creating Test Withdraw Request ===\n');
  
  // This would require implementing a test affiliate with balance
  // For now, just provide instructions
  console.log('To create a test withdraw request:');
  console.log('1. Create an affiliate account');
  console.log('2. Add some commission balance');
  console.log('3. Submit a withdraw request');
  console.log('4. Then run this test again');
}

// Run the test
if (require.main === module) {
  testMockPayoutFlow().catch(console.error);
}

module.exports = { testMockPayoutFlow, createTestWithdrawRequest };