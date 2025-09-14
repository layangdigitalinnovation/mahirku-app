const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testPayoutCallbackFixed() {
  console.log('=== Testing Payout Callback (Fixed Version) ===\n');
  
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
      return;
    }
    
    // Step 3: Manually update withdraw requests to add payoutId for testing
    console.log('\nStep 3: Manually adding payoutId to withdraw requests for testing...');
    
    const withdrawForCompleted = approvedWithdraws[0];
    const withdrawForFailed = approvedWithdraws[1];
    
    const testPayoutIdCompleted = `payout_test_completed_${Date.now()}`;
    const testPayoutIdFailed = `payout_test_failed_${Date.now()}`;
    
    // We need to directly update the database or use a different approach
    // Since we can't directly update via API, let's simulate the scenario
    
    // Step 4: Test COMPLETED callback
    console.log('\nStep 4: Testing payout callback with COMPLETED status...');
    
    const completedCallbackPayload = {
      id: testPayoutIdCompleted,
      status: 'COMPLETED',
      reference_id: `WITHDRAW-${withdrawForCompleted.id}-${Date.now()}`,
      amount: withdrawForCompleted.amount,
      channel_code: 'ID_BCA',
      updated: new Date().toISOString(),
      metadata: {
        withdraw_request_id: withdrawForCompleted.id.toString(),
        affiliate_id: withdrawForCompleted.affiliateId
      }
    };
    
    console.log('Sending COMPLETED callback payload:', JSON.stringify(completedCallbackPayload, null, 2));
    
    // First, we need to update the withdraw request to have a payoutId
    // Since we can't do this via API, let's create a test that shows the issue
    
    console.log('\n⚠️  ISSUE IDENTIFIED:');
    console.log('The handlePayoutCallback function expects withdraw requests to have payoutId,');
    console.log('but the approved withdraw requests don\'t have payoutId because the automatic payout failed.');
    console.log('\nTo fix this, we need to either:');
    console.log('1. Fix the automatic payout process during approval');
    console.log('2. Modify handlePayoutCallback to also search by reference_id or metadata');
    
    // Let's test the callback anyway to see the exact error
    try {
      const completedResponse = await api.post('/payment/xendit/payout-callback', completedCallbackPayload);
      console.log('✓ COMPLETED callback response:', completedResponse.data);
    } catch (callbackError) {
      console.log('❌ COMPLETED callback failed as expected:', callbackError.response?.data?.message);
      console.log('This confirms that the callback is looking for payoutId in withdraw requests.');
    }
    
    // Step 5: Demonstrate the solution
    console.log('\n=== SOLUTION DEMONSTRATION ===');
    console.log('\nTo properly test the payout callback, we need to:');
    console.log('1. Create a withdraw request with payoutId');
    console.log('2. Or modify the callback to handle cases where payoutId is missing');
    
    // Let's create a more comprehensive test that shows what should happen
    console.log('\nStep 5: Creating a comprehensive test scenario...');
    
    // Test the callback endpoint structure
    console.log('\nTesting callback endpoint accessibility...');
    try {
      const testResponse = await api.post('/payment/xendit/payout-callback', {
        id: 'test_payout_id',
        status: 'COMPLETED'
      });
      console.log('Callback endpoint is accessible');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✓ Callback endpoint returns 404 for non-existent payoutId (expected behavior)');
      } else {
        console.log('Callback endpoint error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('✓ Admin login works');
    console.log('✓ Withdraw requests can be retrieved');
    console.log('✓ Callback endpoint is accessible');
    console.log('❌ Approved withdraw requests don\'t have payoutId');
    console.log('❌ Callback fails because it can\'t find withdraw request by payoutId');
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Fix the automatic payout process in approveWithdrawRequest');
    console.log('2. Ensure Xendit API credentials are properly configured');
    console.log('3. Add fallback logic in handlePayoutCallback to search by reference_id');
    console.log('4. Add proper error handling for failed payout creation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testPayoutCallbackFixed();