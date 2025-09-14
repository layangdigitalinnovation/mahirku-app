const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testManualPayoutCallback() {
  console.log('=== Testing Manual Payout Callback ===\n');
  
  try {
    // Step 1: Login sebagai admin
    console.log('Step 1: Admin login...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    if (!adminLogin.data.token) {
      console.error('❌ Admin login failed:', adminLogin.data.message || 'No token received');
      return;
    }
    
    console.log('✓ Admin login successful');
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    // Step 2: Get approved withdraw requests
    console.log('\nStep 2: Getting approved withdraw requests...');
    const withdrawsResponse = await api.get('/withdraw/admin/all');
    
    if (!withdrawsResponse.data.success) {
      console.error('❌ Failed to get withdraw requests:', withdrawsResponse.data.message);
      return;
    }
    
    const approvedWithdraws = withdrawsResponse.data.data.withdrawRequests.filter(w => w.status === 'approved');
    
    if (approvedWithdraws.length === 0) {
      console.log('❌ No approved withdraw requests found');
      return;
    }
    
    const withdrawToTest = approvedWithdraws[0];
    console.log(`✓ Using approved withdraw request ID: ${withdrawToTest.id}, Amount: ${withdrawToTest.amount}`);
    
    // Step 3: Manually update withdraw request to add payoutId for testing
    console.log(`\nStep 3: Manually setting payoutId for testing...`);
    const testPayoutId = `payout_test_${Date.now()}`;
    
    // We'll simulate this by directly calling the payout callback
    // First, let's test with COMPLETED status
    console.log(`\nStep 4: Testing payout callback with COMPLETED status...`);
    
    const completedCallbackPayload = {
      id: testPayoutId,
      status: 'COMPLETED',
      reference_id: `WITHDRAW-${withdrawToTest.id}-${Date.now()}`,
      amount: withdrawToTest.amount,
      channel_code: 'ID_BCA',
      updated: new Date().toISOString(),
      metadata: {
        withdraw_request_id: withdrawToTest.id.toString(),
        affiliate_id: withdrawToTest.affiliateId
      }
    };
    
    console.log('Sending COMPLETED callback payload:', JSON.stringify(completedCallbackPayload, null, 2));
    
    try {
      const completedResponse = await api.post('/payment/xendit/payout-callback', completedCallbackPayload);
      console.log('✓ COMPLETED callback response:', completedResponse.data);
      
      // Check if withdraw request status was updated
      const updatedWithdrawsResponse = await api.get('/withdraw/admin/all');
      const updatedWithdraw = updatedWithdrawsResponse.data.data.withdrawRequests.find(w => w.id === withdrawToTest.id);
      
      if (updatedWithdraw) {
        console.log(`✓ Withdraw request status updated to: ${updatedWithdraw.status}`);
      } else {
        console.log('❌ Could not find updated withdraw request');
      }
      
    } catch (callbackError) {
      console.error('❌ COMPLETED callback failed:', callbackError.response?.data || callbackError.message);
      if (callbackError.response?.data) {
        console.error('Error details:', JSON.stringify(callbackError.response.data, null, 2));
      }
    }
    
    // Step 5: Test with FAILED status using another withdraw request
    console.log(`\n\nStep 5: Testing payout callback with FAILED status...`);
    
    if (approvedWithdraws.length > 1) {
      const withdrawToTestFailed = approvedWithdraws[1];
      const testPayoutIdFailed = `payout_test_failed_${Date.now()}`;
      
      const failedCallbackPayload = {
        id: testPayoutIdFailed,
        status: 'FAILED',
        reference_id: `WITHDRAW-${withdrawToTestFailed.id}-${Date.now()}`,
        amount: withdrawToTestFailed.amount,
        channel_code: 'ID_BCA',
        failure_code: 'INSUFFICIENT_BALANCE',
        updated: new Date().toISOString(),
        metadata: {
          withdraw_request_id: withdrawToTestFailed.id.toString(),
          affiliate_id: withdrawToTestFailed.affiliateId
        }
      };
      
      console.log('Sending FAILED callback payload:', JSON.stringify(failedCallbackPayload, null, 2));
      
      try {
        const failedResponse = await api.post('/payment/xendit/payout-callback', failedCallbackPayload);
        console.log('✓ FAILED callback response:', failedResponse.data);
        
        // Check if withdraw request status was updated
        const updatedWithdrawsResponse2 = await api.get('/withdraw/admin/all');
        const updatedWithdraw2 = updatedWithdrawsResponse2.data.data.withdrawRequests.find(w => w.id === withdrawToTestFailed.id);
        
        if (updatedWithdraw2) {
          console.log(`✓ Withdraw request status updated to: ${updatedWithdraw2.status}`);
        } else {
          console.log('❌ Could not find updated withdraw request');
        }
        
      } catch (callbackError) {
        console.error('❌ FAILED callback failed:', callbackError.response?.data || callbackError.message);
        if (callbackError.response?.data) {
          console.error('Error details:', JSON.stringify(callbackError.response.data, null, 2));
        }
      }
    } else {
      console.log('❌ Not enough approved withdraw requests to test FAILED status');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testManualPayoutCallback();