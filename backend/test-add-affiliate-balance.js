const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testAddAffiliateBalance() {
  console.log('=== Testing Add Affiliate Balance ===\n');
  
  try {
    // Step 1: Login sebagai admin
    console.log('Step 1: Admin login...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo', // Ganti dengan email admin yang valid
      password: 'admin123' // Ganti dengan password yang benar
    });
    
    if (!adminLogin.data.token) {
      console.error('❌ Admin login failed:', adminLogin.data.message || 'No token received');
      return;
    }
    
    console.log('✓ Admin login successful');
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    // Step 2: Dapatkan daftar affiliate
    console.log('\nStep 2: Getting affiliate list...');
    const affiliatesResponse = await api.get('/affiliate');
    
    if (!affiliatesResponse.data.success) {
      console.error('❌ Failed to get affiliate list:', affiliatesResponse.data.message);
      return;
    }
    
    const affiliates = affiliatesResponse.data.data.affiliates;
    
    if (affiliates.length === 0) {
      console.log('❌ No affiliates found');
      return;
    }
    
    console.log(`Found ${affiliates.length} affiliates`);
    
    // Pilih affiliate pertama atau yang ditentukan
    const targetAffiliate = affiliates.find(a => a.email === 'affiliate@mahirku.com') || affiliates[0];
    console.log(`Selected affiliate: ${targetAffiliate.fullname} (${targetAffiliate.email})`);
    
    // Step 3: Cek saldo affiliate saat ini
    console.log('\nStep 3: Checking current affiliate balance...');
    const balanceResponse = await api.get(`/admin/affiliate/${targetAffiliate.id}`);
    
    if (!balanceResponse.data.success) {
      console.error('❌ Failed to get affiliate details:', balanceResponse.data.message);
      return;
    }
    
    const currentBalance = balanceResponse.data.data.affiliate.balance || 0;
    console.log(`Current balance: Rp ${currentBalance.toLocaleString()}`);
    
    // Step 4: Tambahkan saldo ke affiliate
    console.log('\nStep 4: Adding balance to affiliate...');
    
    // Jumlah yang akan ditambahkan (Rp 500.000)
    const amountToAdd = 500000;
    console.log(`Amount to add: Rp ${amountToAdd.toLocaleString()}`);
    
    // Buat transaksi komisi manual
    const transactionData = {
      affiliateId: targetAffiliate.id,
      amount: amountToAdd,
      description: 'Test balance for withdraw testing',
      type: 'manual_credit', // Tipe transaksi manual
      referenceId: `TEST-${Date.now()}` // ID referensi unik
    };
    
    const addBalanceResponse = await api.post('/admin/commission/manual', transactionData);
    
    if (!addBalanceResponse.data.success) {
      console.error('❌ Failed to add balance:', addBalanceResponse.data.message);
      return;
    }
    
    console.log('✓ Balance added successfully');
    console.log('Transaction details:', JSON.stringify(addBalanceResponse.data.data, null, 2));
    
    // Step 5: Verifikasi saldo telah bertambah
    console.log('\nStep 5: Verifying updated balance...');
    const updatedBalanceResponse = await api.get(`/admin/affiliate/${targetAffiliate.id}`);
    
    if (!updatedBalanceResponse.data.success) {
      console.error('❌ Failed to get updated affiliate details:', updatedBalanceResponse.data.message);
      return;
    }
    
    const updatedBalance = updatedBalanceResponse.data.data.affiliate.balance || 0;
    console.log(`Updated balance: Rp ${updatedBalance.toLocaleString()}`);
    console.log(`Balance increased by: Rp ${(updatedBalance - currentBalance).toLocaleString()}`);
    
    // Ringkasan test
    console.log('\n=== Test Summary ===');
    console.log('✓ Successfully logged in as admin');
    console.log(`✓ Selected affiliate: ${targetAffiliate.fullname}`);
    console.log(`✓ Initial balance: Rp ${currentBalance.toLocaleString()}`);
    console.log(`✓ Added Rp ${amountToAdd.toLocaleString()} to balance`);
    console.log(`✓ Final balance: Rp ${updatedBalance.toLocaleString()}`);
    console.log('\nNext steps:');
    console.log('1. Run test-create-withdraw-request.js as affiliate to create a withdraw request');
    console.log('2. Run test-approve-and-payout.js as admin to approve and process the payout');
    console.log('3. Or run test-complete-withdraw-flow.js to test the entire process');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testAddAffiliateBalance();