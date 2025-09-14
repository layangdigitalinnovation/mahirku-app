const axios = require('axios');
require('dotenv').config();

// Xendit configuration
const xenditConfig = {
  apiKey: process.env.XENDIT_API_KEY,
  baseUrl: process.env.XENDIT_BASE_URL || 'https://api.xendit.co'
};

async function checkXenditAccountInfo() {
  console.log('=== Xendit Account Information & Capabilities Check ===\n');
  
  if (!xenditConfig.apiKey) {
    console.error('❌ XENDIT_API_KEY is not configured');
    return;
  }
  
  const authHeader = Buffer.from(`${xenditConfig.apiKey}:`).toString('base64');
  const headers = {
    'Authorization': `Basic ${authHeader}`,
    'Content-Type': 'application/json'
  };
  
  console.log('API Key Type:', xenditConfig.apiKey.startsWith('xnd_development_') ? 'Development' : 'Production');
  console.log('API Key Preview:', `${xenditConfig.apiKey.substring(0, 20)}...`);
  console.log('Base URL:', xenditConfig.baseUrl);
  console.log();
  
  // Test 1: Basic API connectivity
  console.log('🔍 Test 1: Basic API Connectivity');
  try {
    const response = await axios.get(`${xenditConfig.baseUrl}/balance`, { headers });
    console.log('✅ API connectivity: SUCCESS');
    console.log('Account Balance:', response.data);
  } catch (error) {
    console.log('❌ API connectivity: FAILED');
    console.log('Error:', error.response?.data || error.message);
    return;
  }
  
  console.log();
  
  // Test 2: Invoice creation (should work with development key)
  console.log('🔍 Test 2: Invoice Creation Capability');
  try {
    const invoicePayload = {
      external_id: `test-invoice-${Date.now()}`,
      amount: 10000,
      description: 'Test invoice for capability check',
      invoice_duration: 86400,
      customer: {
        given_names: 'Test',
        surname: 'User',
        email: 'test@example.com'
      },
      customer_notification_preference: {
        invoice_created: ['email'],
        invoice_reminder: ['email'],
        invoice_paid: ['email']
      },
      success_redirect_url: 'https://example.com/success',
      failure_redirect_url: 'https://example.com/failure'
    };
    
    const invoiceResponse = await axios.post(`${xenditConfig.baseUrl}/v2/invoices`, invoicePayload, { headers });
    console.log('✅ Invoice creation: SUCCESS');
    console.log('Invoice ID:', invoiceResponse.data.id);
    console.log('Invoice URL:', invoiceResponse.data.invoice_url);
  } catch (error) {
    console.log('❌ Invoice creation: FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
  
  console.log();
  
  // Test 3: Payout capability (likely to fail with development key)
  console.log('🔍 Test 3: Payout Creation Capability');
  try {
    const payoutPayload = {
      reference_id: `test-payout-${Date.now()}`,
      channel_code: 'ID_BCA',
      channel_properties: {
        account_holder_name: 'Test User',
        account_number: '1234567890'
      },
      amount: 10000,
      description: 'Test payout capability check',
      currency: 'IDR'
    };
    
    const payoutResponse = await axios.post(`${xenditConfig.baseUrl}/payouts`, payoutPayload, { headers });
    console.log('✅ Payout creation: SUCCESS');
    console.log('Payout ID:', payoutResponse.data.id);
    console.log('Payout Status:', payoutResponse.data.status);
  } catch (error) {
    console.log('❌ Payout creation: FAILED');
    console.log('Status Code:', error.response?.status);
    console.log('Error Code:', error.response?.data?.error_code);
    console.log('Error Message:', error.response?.data?.message);
    
    if (error.response?.data?.error_code === 'REQUEST_FORBIDDEN_ERROR') {
      console.log('\n💡 Analysis: This is expected for development API keys');
      console.log('   Development keys typically don\'t have payout permissions');
      console.log('   You need a production account with business verification');
    }
  }
  
  console.log();
  
  // Test 4: Available payment methods
  console.log('🔍 Test 4: Available Payment Methods');
  try {
    const methodsResponse = await axios.get(`${xenditConfig.baseUrl}/available_retail_outlets`, { headers });
    console.log('✅ Payment methods: SUCCESS');
    console.log('Available retail outlets:', methodsResponse.data.length);
  } catch (error) {
    console.log('❌ Payment methods: FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
  
  console.log();
  
  // Summary and recommendations
  console.log('=== SUMMARY & RECOMMENDATIONS ===');
  console.log();
  
  if (xenditConfig.apiKey.startsWith('xnd_development_')) {
    console.log('📋 Current Status: Development Account');
    console.log('✅ Can do: Invoice creation, payment processing, webhooks');
    console.log('❌ Cannot do: Payouts, money disbursement');
    console.log();
    console.log('🚀 Next Steps:');
    console.log('1. For testing: Implement mock payout service');
    console.log('2. For production: Complete business verification with Xendit');
    console.log('3. Request payout permissions from Xendit support');
    console.log('4. Upgrade to production API key');
  } else {
    console.log('📋 Current Status: Production Account');
    console.log('🔍 If payout failed, contact Xendit support to enable payout permissions');
  }
  
  console.log();
  console.log('📚 See XENDIT_PAYOUT_TROUBLESHOOTING.md for detailed solutions');
}

// Run the check
checkXenditAccountInfo().catch(console.error);