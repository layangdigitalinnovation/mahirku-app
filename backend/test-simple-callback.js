const axios = require('axios');

async function testSimpleCallback() {
  console.log('=== Testing Simple Payout Callback ===\n');
  
  // Wait for server to be ready
  console.log('Waiting for server to be ready...');
  
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!serverReady && attempts < maxAttempts) {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/login');
      serverReady = true;
      console.log('✓ Server is ready');
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts}: Server not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!serverReady) {
    console.error('❌ Server is not responding after', maxAttempts, 'attempts');
    return;
  }
  
  try {
    // Test callback endpoint directly
    console.log('\nTesting payout callback endpoint...');
    
    const callbackPayload = {
      id: 'test_payout_123',
      status: 'COMPLETED',
      reference_id: 'WITHDRAW-25-123456789',
      amount: 50000,
      channel_code: 'ID_BCA',
      updated: new Date().toISOString()
    };
    
    console.log('Sending callback payload:');
    console.log(JSON.stringify(callbackPayload, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/payment/xendit/payout-callback', callbackPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✓ Callback successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('\n❌ Callback failed:');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message);
    console.log('Full error data:', error.response?.data);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Server connection refused. Make sure the server is running.');
    }
  }
}

// Run test
testSimpleCallback();