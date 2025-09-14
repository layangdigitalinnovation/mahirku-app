const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testPayoutCallback() {
  console.log('=== Testing Payout Callback ===\n');
  
  try {
    // Step 1: Login sebagai admin untuk mendapatkan token
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
    
    // Step 2: Cari withdraw request yang sudah approved dan memiliki payoutId
    console.log('\nStep 2: Finding approved withdraw request with payoutId...');
    
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    const withdrawsResponse = await api.get('/withdraw/admin/all');
    
    if (!withdrawsResponse.data.success) {
      console.error('❌ Failed to get withdraw requests:', withdrawsResponse.data.message);
      return;
    }
    
    // Cari withdraw request yang sudah approved dan memiliki payoutId
    const approvedWithdraw = withdrawsResponse.data.data.withdrawRequests.find(w => 
      w.status === 'approved' && w.payoutId
    );
    
    if (!approvedWithdraw) {
      console.log('❌ No approved withdraw request with payoutId found');
      console.log('Available withdraw requests:');
      withdrawsResponse.data.data.withdrawRequests.forEach(w => {
        console.log(`  - ID: ${w.id}, Status: ${w.status}, PayoutId: ${w.payoutId || 'null'}`);
      });
      return;
    }
    
    console.log(`✓ Found approved withdraw request:`);
    console.log(`  - ID: ${approvedWithdraw.id}`);
    console.log(`  - Status: ${approvedWithdraw.status}`);
    console.log(`  - PayoutId: ${approvedWithdraw.payoutId}`);
    console.log(`  - Amount: ${approvedWithdraw.amount}`);
    
    // Step 3: Test payout callback dengan status COMPLETED
    console.log('\nStep 3: Testing payout callback with COMPLETED status...');
    




    const callbackPayload = {
      id: approvedWithdraw.payoutId, // Ini adalah payoutId yang akan dicari di database
      status: 'COMPLETED',
      reference_id: `WITHDRAW-${approvedWithdraw.id}-${Date.now()}`,
      amount: approvedWithdraw.amount,
      failure_code: null,
      updated: new Date().toISOString(),
      created: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
    
    console.log('Callback payload:', JSON.stringify(callbackPayload, null, 2));
    
    // Kirim callback tanpa authorization header (karena ini webhook dari Xendit)
    delete api.defaults.headers.common['Authorization'];
    api.defaults.headers.common['x-callback-token'] = process.env.XENDIT_CALLBACK_TOKEN;

    const callbackResponse = await api.post('/payment/xendit/payout-callback', callbackPayload);
    
    console.log('✓ Payout callback successful!');
    console.log('Response:', callbackResponse.data);
    
    // Step 4: Verifikasi status withdraw request sudah terupdate
    console.log('\nStep 4: Verifying withdraw request status update...');
    
    // Login admin lagi untuk cek status
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    const updatedWithdrawsResponse = await api.get('/withdraw/admin/all');
    const updatedWithdraw = updatedWithdrawsResponse.data.data.withdrawRequests.find(w => w.id === approvedWithdraw.id);
    
    if (updatedWithdraw) {
      console.log(`✓ Withdraw request status updated:`);
      console.log(`  - ID: ${updatedWithdraw.id}`);
      console.log(`  - Status: ${updatedWithdraw.status}`);
      console.log(`  - PayoutStatus: ${updatedWithdraw.payoutStatus}`);
      console.log(`  - UpdatedAt: ${updatedWithdraw.updatedAt}`);
    } else {
      console.log('❌ Could not find updated withdraw request');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test dengan status FAILED juga
async function testPayoutCallbackFailed() {
  console.log('\n=== Testing Payout Callback with FAILED status ===\n');
  
  try {
    // Login sebagai admin
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    // Cari withdraw request yang processing
    const withdrawsResponse = await api.get('/withdraw/admin/all');
    const processingWithdraw = withdrawsResponse.data.data.withdrawRequests.find(w => 
      w.status === 'processing' && w.payoutId
    );
    
    if (!processingWithdraw) {
      console.log('❌ No processing withdraw request with payoutId found for FAILED test');
      return;
    }
    
    console.log(`✓ Found processing withdraw request for FAILED test:`);
    console.log(`  - ID: ${processingWithdraw.id}`);
    console.log(`  - PayoutId: ${processingWithdraw.payoutId}`);
    
    // Test callback dengan status FAILED
    const failedCallbackPayload = {
      id: processingWithdraw.payoutId,
      status: 'FAILED',
      reference_id: `WITHDRAW-${processingWithdraw.id}-${Date.now()}`,
      amount: processingWithdraw.amount,
      failure_code: 'INSUFFICIENT_BALANCE',
      updated: new Date().toISOString()
    };
    
    console.log('FAILED callback payload:', JSON.stringify(failedCallbackPayload, null, 2));
    
    delete api.defaults.headers.common['Authorization'];
    
    const failedCallbackResponse = await api.post('/payment/xendit/payout-callback', failedCallbackPayload);
    
    console.log('✓ FAILED payout callback successful!');
    console.log('Response:', failedCallbackResponse.data);
    
  } catch (error) {
    console.error('❌ FAILED test failed:', error.response?.data || error.message);
  }
}

// Jalankan kedua test
async function runAllTests() {
  await testPayoutCallback();
  await testPayoutCallbackFailed();
}

runAllTests();