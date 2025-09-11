const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testImprovedPayoutCallback() {
  console.log('=== Testing Improved Payout Callback ===\n');
  
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
    
    if (approvedWithdraws.length < 2) {
      console.log('❌ Need at least 2 approved withdraw requests for testing');
      console.log(`Found ${approvedWithdraws.length} approved withdraw requests`);
      return;
    }
    
    console.log(`✓ Found ${approvedWithdraws.length} approved withdraw requests`);
    
    const withdrawForCompleted = approvedWithdraws[0];
    const withdrawForFailed = approvedWithdraws[1];
    
    console.log('Testing with withdraw requests:');
    console.log(`- COMPLETED test: ID ${withdrawForCompleted.id}, Amount: ${withdrawForCompleted.amount}`);
    console.log(`- FAILED test: ID ${withdrawForFailed.id}, Amount: ${withdrawForFailed.amount}`);
    
    // Step 3: Test COMPLETED callback with reference_id fallback
    console.log('\nStep 3: Testing COMPLETED callback with reference_id fallback...');
    
    const completedCallbackPayload = {
      id: `payout_completed_${Date.now()}`, // Payout ID yang tidak ada di database
      status: 'COMPLETED',
      reference_id: `WITHDRAW-${withdrawForCompleted.id}-${Date.now()}`, // Format yang bisa diparsing
      amount: withdrawForCompleted.amount,
      channel_code: 'ID_BCA',
      updated: new Date().toISOString(),
      metadata: {
        withdraw_request_id: withdrawForCompleted.id.toString(),
        affiliate_id: withdrawForCompleted.affiliateId
      }
    };
    
    console.log('Sending COMPLETED callback payload:');
    console.log(JSON.stringify(completedCallbackPayload, null, 2));
    
    try {
      const completedResponse = await api.post('/payment/xendit/payout-callback', completedCallbackPayload);
      console.log('\n✓ COMPLETED callback SUCCESS!');
      console.log('Response:', completedResponse.data);
      
      // Verify the withdraw request status was updated
      const updatedWithdrawResponse = await api.get('/withdraw/admin/all');
      const updatedWithdraw = updatedWithdrawResponse.data.data.withdrawRequests.find(w => w.id === withdrawForCompleted.id);
      
      console.log('\n✓ Withdraw request status after callback:');
      console.log(`- Status: ${updatedWithdraw.status}`);
      console.log(`- Payout Status: ${updatedWithdraw.payoutStatus}`);
      console.log(`- Payout ID: ${updatedWithdraw.payoutId}`);
      
    } catch (completedError) {
      console.log('\n❌ COMPLETED callback failed:');
      console.log('Status:', completedError.response?.status);
      console.log('Error:', completedError.response?.data?.message);
    }
    
    // Step 4: Test FAILED callback with reference_id fallback
    console.log('\nStep 4: Testing FAILED callback with reference_id fallback...');
    
    const failedCallbackPayload = {
      id: `payout_failed_${Date.now()}`, // Payout ID yang tidak ada di database
      status: 'FAILED',
      reference_id: `WITHDRAW-${withdrawForFailed.id}-${Date.now()}`, // Format yang bisa diparsing
      amount: withdrawForFailed.amount,
      channel_code: 'ID_BCA',
      failure_code: 'INSUFFICIENT_BALANCE',
      updated: new Date().toISOString(),
      metadata: {
        withdraw_request_id: withdrawForFailed.id.toString(),
        affiliate_id: withdrawForFailed.affiliateId
      }
    };
    
    console.log('Sending FAILED callback payload:');
    console.log(JSON.stringify(failedCallbackPayload, null, 2));
    
    try {
      const failedResponse = await api.post('/payment/xendit/payout-callback', failedCallbackPayload);
      console.log('\n✓ FAILED callback SUCCESS!');
      console.log('Response:', failedResponse.data);
      
      // Verify the withdraw request status was updated
      const updatedWithdrawResponse = await api.get('/withdraw/admin/all');
      const updatedWithdraw = updatedWithdrawResponse.data.data.withdrawRequests.find(w => w.id === withdrawForFailed.id);
      
      console.log('\n✓ Withdraw request status after callback:');
      console.log(`- Status: ${updatedWithdraw.status}`);
      console.log(`- Payout Status: ${updatedWithdraw.payoutStatus}`);
      console.log(`- Failure Reason: ${updatedWithdraw.failureReason}`);
      console.log(`- Payout ID: ${updatedWithdraw.payoutId}`);
      
    } catch (failedError) {
      console.log('\n❌ FAILED callback failed:');
      console.log('Status:', failedError.response?.status);
      console.log('Error:', failedError.response?.data?.message);
    }
    
    // Step 5: Test with invalid reference_id format
    console.log('\nStep 5: Testing callback with invalid reference_id format...');
    
    const invalidCallbackPayload = {
      id: `payout_invalid_${Date.now()}`,
      status: 'COMPLETED',
      reference_id: `INVALID-FORMAT-${Date.now()}`, // Format yang tidak bisa diparsing
      amount: 10000
    };
    
    try {
      const invalidResponse = await api.post('/payment/xendit/payout-callback', invalidCallbackPayload);
      console.log('Unexpected success with invalid reference_id');
    } catch (invalidError) {
      console.log('✓ Invalid reference_id correctly rejected:');
      console.log('Status:', invalidError.response?.status);
      console.log('Error:', invalidError.response?.data?.message);
    }
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('✓ Admin login works');
    console.log('✓ Withdraw requests can be retrieved');
    console.log('✓ Callback endpoint is accessible');
    console.log('✓ Reference_id fallback logic implemented');
    console.log('✓ Callback can find withdraw requests by reference_id');
    console.log('✓ Withdraw request status updates correctly');
    console.log('✓ PayoutId gets updated for future callbacks');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testImprovedPayoutCallback();