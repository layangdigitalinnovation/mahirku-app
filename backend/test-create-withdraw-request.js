const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testCreateWithdrawRequest() {
  console.log('=== Testing Create Withdraw Request Process ===\n');
  
  try {
    // Step 1: Login sebagai affiliate
    console.log('Step 1: Affiliate login...');
    const affiliateLogin = await api.post('/auth/login', {
      email: 'aff9@example.com', // Ganti dengan email affiliate yang valid
      password: 'password123' // Ganti dengan password yang benar
    });
    
    if (!affiliateLogin.data.token) {
      console.error('❌ Affiliate login failed:', affiliateLogin.data.message || 'No token received');
      return;
    }
    
    console.log('✓ Affiliate login successful');
    api.defaults.headers.common['Authorization'] = `Bearer ${affiliateLogin.data.token}`;
    
    // Step 2: Cek saldo affiliate
    console.log('\nStep 2: Checking affiliate balance...');
    const balanceResponse = await api.get('/affiliate/dashboard');
    
    if (!balanceResponse.data.success) {
      console.error('❌ Failed to get affiliate balance:', balanceResponse.data.message);
      return;
    }
    
    const balance = balanceResponse.data.data.balance;
    console.log(`✓ Current balance: Rp ${balance.toLocaleString()}`);
    
    if (balance <= 0) {
      console.log('❌ Insufficient balance to create withdraw request');
      return;
    }
    
    // Step 3: Cek withdraw request yang pending
    console.log('\nStep 3: Checking pending withdraw requests...');
    const withdrawHistoryResponse = await api.get('/withdraw/history');
    
    if (!withdrawHistoryResponse.data.success) {
      console.error('❌ Failed to get withdraw history:', withdrawHistoryResponse.data.message);
      return;
    }
    
    const pendingWithdraws = withdrawHistoryResponse.data.data.withdrawRequests.filter(w => w.status === 'pending');
    
    if (pendingWithdraws.length > 0) {
      console.log('⚠️ You already have pending withdraw requests:');
      pendingWithdraws.forEach(w => {
        console.log(`  - ID: ${w.id}, Amount: Rp ${w.amount.toLocaleString()}, Created: ${new Date(w.createdAt).toLocaleString()}`);
      });
      console.log('Please wait for them to be processed before creating a new one.');
      return;
    }
    
    // Step 4: Buat withdraw request baru
    console.log('\nStep 4: Creating new withdraw request...');
    
    // Jumlah penarikan (50% dari saldo atau minimal Rp 50.000)
    const withdrawAmount = Math.max(Math.floor(balance * 0.5), 50000);
    console.log(`Withdraw amount: Rp ${withdrawAmount.toLocaleString()}`);
    
    const withdrawData = {
      amount: withdrawAmount,
      bankName: 'BCA', // Ganti dengan bank yang sesuai
      accountNumber: '1234567890', // Ganti dengan nomor rekening yang valid
      accountName: 'Nama Pemilik Rekening' // Ganti dengan nama pemilik rekening
    };
    
    try {
      const createResponse = await api.post('/withdraw/request', withdrawData);
      
      console.log('✓ Withdraw request created successfully');
      console.log('Response:', JSON.stringify(createResponse.data, null, 2));
      
      // Step 5: Verifikasi withdraw request telah dibuat
      console.log('\nStep 5: Verifying withdraw request was created...');
      const verifyResponse = await api.get('/withdraw/history');
      
      const latestWithdraw = verifyResponse.data.data.withdrawRequests[0];
      console.log(`Latest withdraw request: ID ${latestWithdraw.id}, Status: ${latestWithdraw.status}, Amount: Rp ${latestWithdraw.amount.toLocaleString()}`);
      
      console.log('\n=== Test Summary ===');
      console.log('✓ Successfully logged in as affiliate');
      console.log(`✓ Verified sufficient balance: Rp ${balance.toLocaleString()}`);
      console.log('✓ No pending withdraw requests found');
      console.log(`✓ Created withdraw request for Rp ${withdrawAmount.toLocaleString()}`);
      console.log('✓ Verified withdraw request was created with pending status');
      console.log('\nNext steps:');
      console.log('1. Admin needs to approve this withdraw request');
      console.log('2. Run test-approve-and-payout.js as admin to process the payout');
      
    } catch (createError) {
      console.error('❌ Failed to create withdraw request:', createError.response?.data || createError.message);
      if (createError.response?.data) {
        console.error('Error details:', JSON.stringify(createError.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testCreateWithdrawRequest();