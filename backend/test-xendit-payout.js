const axios = require('axios');
require('dotenv').config();

// Xendit configuration from environment variables
const xenditConfig = {
  apiKey: process.env.XENDIT_API_KEY,
  publicKey: process.env.XENDIT_PUBLIC_KEY,
  baseUrl: process.env.XENDIT_BASE_URL,
  callbackUrl: process.env.XENDIT_CALLBACK_URL
};

// Test Xendit Payout API directly
async function testXenditPayoutAPI() {
  console.log('=== Testing Xendit Payout API Directly ===\n');
  
  try {
    // Check configuration
    console.log('Step 1: Checking Xendit configuration...');
    console.log('API Key:', xenditConfig.apiKey ? `${xenditConfig.apiKey.substring(0, 20)}...` : 'NOT SET');
    console.log('Base URL:', xenditConfig.baseUrl);
    
    if (!xenditConfig.apiKey) {
      console.error('❌ XENDIT_API_KEY is not configured');
      return;
    }
    
    // Test Xendit API connectivity
    console.log('\nStep 2: Testing Xendit API connectivity...');
    
    const authHeader = Buffer.from(`${xenditConfig.apiKey}:`).toString('base64');
    
    // Test with a simple API call first (get balance)
    try {
      const balanceResponse = await axios.get(`${xenditConfig.baseUrl}/balance`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✓ Xendit API connectivity successful');
      console.log('Account balance:', balanceResponse.data);
    } catch (balanceError) {
      console.error('❌ Xendit API connectivity failed:', balanceError.response?.data || balanceError.message);
      return;
    }
    
    // Test payout creation with minimal data
    console.log('\nStep 3: Testing payout creation...');
    
    const testPayoutPayload = {
      reference_id: `TEST-PAYOUT-${Date.now()}`,
      channel_code: 'ID_BCA',
      channel_properties: {
        account_holder_name: 'Test User',
        account_number: '1234567890'
      },
      amount: 10000,
      description: 'Test payout from Mahirku',
      currency: 'IDR'
    };
    
    console.log('Sending payout payload:', JSON.stringify(testPayoutPayload, null, 2));
    
    try {
      const payoutResponse = await axios.post(`${xenditConfig.baseUrl}/payouts`, testPayoutPayload, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✓ Payout creation successful!');
      console.log('Payout response:', JSON.stringify(payoutResponse.data, null, 2));
      
    } catch (payoutError) {
      console.error('❌ Payout creation failed:');
      console.error('Status:', payoutError.response?.status);
      console.error('Error data:', JSON.stringify(payoutError.response?.data, null, 2));
      
      // Analyze common errors
      if (payoutError.response?.status === 400) {
        console.log('\n🔍 Analysis: Bad Request (400)');
        console.log('This usually means:');
        console.log('- Invalid payload format');
        console.log('- Missing required fields');
        console.log('- Invalid bank account details');
      } else if (payoutError.response?.status === 401) {
        console.log('\n🔍 Analysis: Unauthorized (401)');
        console.log('This usually means:');
        console.log('- Invalid API key');
        console.log('- API key not properly encoded');
      } else if (payoutError.response?.status === 403) {
        console.log('\n🔍 Analysis: Forbidden (403)');
        console.log('This usually means:');
        console.log('- API key doesn\'t have payout permissions');
        console.log('- Account not verified for payouts');
      }
    }
    
    // Test bank code validation
    console.log('\nStep 4: Testing bank code mapping...');
    
    const bankMapping = {
      'BCA': 'ID_BCA',
      'BNI': 'ID_BNI',
      'BRI': 'ID_BRI',
      'MANDIRI': 'ID_MANDIRI',
      'CIMB': 'ID_CIMB',
      'DANAMON': 'ID_DANAMON',
      'PERMATA': 'ID_PERMATA',
      'BTN': 'ID_BTN'
    };
    
    console.log('Available bank codes:', Object.values(bankMapping));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test the actual processAutomaticPayout function
async function testProcessAutomaticPayout() {
  console.log('\n=== Testing processAutomaticPayout Function ===\n');
  
  try {
    // Login as admin first
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Step 1: Admin login...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    if (!adminLogin.data.token) {
      console.error('❌ Admin login failed');
      return;
    }
    
    console.log('✓ Admin login successful');
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    // Get approved withdraw requests
    console.log('\nStep 2: Getting approved withdraw requests...');
    const withdrawsResponse = await api.get('/withdraw/admin/all');
    
    if (!withdrawsResponse.data.success) {
      console.error('❌ Failed to get withdraw requests');
      return;
    }
    
    const approvedWithdraws = withdrawsResponse.data.data.withdrawRequests.filter(w => w.status === 'approved');
    
    if (approvedWithdraws.length === 0) {
      console.log('❌ No approved withdraw requests found');
      return;
    }
    
    const testWithdraw = approvedWithdraws[0];
    console.log('✓ Found approved withdraw request:', {
      id: testWithdraw.id,
      amount: testWithdraw.amount,
      affiliateId: testWithdraw.affiliateId,
      payoutId: testWithdraw.payoutId
    });
    
    // Try to process payout manually by calling the endpoint
    console.log('\nStep 3: Testing manual payout processing...');
    
    // Since we can\'t directly call processAutomaticPayout, let\'s try to trigger it
    // by re-approving the withdraw request
    try {
      const reapproveResponse = await api.put(`/withdraw/admin/approve/${testWithdraw.id}`);
      console.log('Re-approve response:', reapproveResponse.data);
    } catch (reapproveError) {
      console.log('Re-approve error (expected if already approved):', reapproveError.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  await testXenditPayoutAPI();
  await testProcessAutomaticPayout();
}

runAllTests();