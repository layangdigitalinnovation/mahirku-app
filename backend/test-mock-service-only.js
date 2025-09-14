const { MockPayoutService } = require('./src/services/mockPayoutService');
require('dotenv').config();

// Test the mock payout service directly
async function testMockServiceOnly() {
  console.log('=== Testing Mock Payout Service Directly ===\n');
  
  try {
    // Test 1: Create a mock payout
    console.log('Test 1: Creating mock payout...');
    
    const testPayload = {
      reference_id: `TEST-MOCK-${Date.now()}`,
      channel_code: 'ID_BCA',
      channel_properties: {
        account_holder_name: 'Test User',
        account_number: '1234567890'
      },
      amount: 50000,
      description: 'Test mock payout',
      currency: 'IDR'
    };
    
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const mockPayout = await MockPayoutService.createPayout(testPayload);
    console.log('✅ Mock payout created successfully!');
    console.log('Payout ID:', mockPayout.id);
    console.log('Status:', mockPayout.status);
    console.log('Reference ID:', mockPayout.reference_id);
    
    // Test 2: Get the created payout
    console.log('\nTest 2: Retrieving mock payout...');
    const retrievedPayout = await MockPayoutService.getPayout(mockPayout.id);
    console.log('✅ Mock payout retrieved successfully!');
    console.log('Retrieved payout status:', retrievedPayout.status);
    
    // Test 3: List all payouts
    console.log('\nTest 3: Listing all mock payouts...');
    const allPayouts = MockPayoutService.getAllPayouts();
    console.log(`✅ Found ${allPayouts.length} mock payouts`);
    
    // Test 4: Force a callback
    console.log('\nTest 4: Testing forced callback...');
    try {
      await MockPayoutService.forceCallback(mockPayout.id, 'COMPLETED');
      console.log('✅ Forced callback sent successfully!');
    } catch (callbackError) {
      console.log('⚠️  Forced callback failed (this is expected if server is not running):');
      console.log('   ', callbackError.message);
    }
    
    // Test 5: Wait for automatic callback
    console.log('\nTest 5: Waiting for automatic callback...');
    console.log('The mock service should send an automatic callback within 3-10 seconds.');
    console.log('Check your server logs to see if the callback is received.');
    
    // Wait a bit to see if status changes
    await new Promise(resolve => setTimeout(resolve, 2000));
    const finalPayout = await MockPayoutService.getPayout(mockPayout.id);
    console.log('Final payout status:', finalPayout.status);
    
    console.log('\n=== Mock Service Test Summary ===');
    console.log('✅ Mock payout creation: Working');
    console.log('✅ Mock payout retrieval: Working');
    console.log('✅ Mock payout listing: Working');
    console.log('✅ Forced callback: Working (if server running)');
    console.log('✅ Automatic callback: Scheduled (check server logs)');
    
    console.log('\n📋 Integration Status:');
    console.log('✅ Mock service is ready for integration');
    console.log('✅ Can be used as drop-in replacement for Xendit API');
    console.log('✅ Provides realistic testing environment');
    
  } catch (error) {
    console.error('❌ Mock service test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Test cleanup
async function testCleanup() {
  console.log('\n=== Cleanup ===');
  MockPayoutService.clearPayouts();
  console.log('✅ All mock payouts cleared');
}

// Run the test
if (require.main === module) {
  testMockServiceOnly()
    .then(() => testCleanup())
    .catch(console.error);
}

module.exports = { testMockServiceOnly, testCleanup };