const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testCompleteWithdrawFlow() {
  console.log('=== Testing Complete Withdraw Flow ===\n');
  
  let withdrawRequestId = null;
  
  try {
    // BAGIAN 1: AFFILIATE MEMBUAT PERMINTAAN PENARIKAN
    console.log('BAGIAN 1: AFFILIATE MEMBUAT PERMINTAAN PENARIKAN');
    console.log('----------------------------------------');
    
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
    const affiliateToken = affiliateLogin.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${affiliateToken}`;
    
    // Step 2: Cek saldo affiliate
    console.log('\nStep 2: Checking affiliate balance...');
    const balanceResponse = await api.get('/affiliate/balance');
    
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
    
    // Step 3: Buat withdraw request baru
    console.log('\nStep 3: Creating new withdraw request...');
    
    // Jumlah penarikan (50% dari saldo atau minimal Rp 50.000)
    const withdrawAmount = Math.max(Math.floor(balance * 0.5), 50000);
    console.log(`Withdraw amount: Rp ${withdrawAmount.toLocaleString()}`);
    
    const withdrawData = {
      amount: withdrawAmount,
      bankName: 'BCA', // Ganti dengan bank yang sesuai
      accountNumber: '1234567890', // Ganti dengan nomor rekening yang valid
      accountName: 'Nama Pemilik Rekening' // Ganti dengan nama pemilik rekening
    };
    
    const createResponse = await api.post('/withdraw/request', withdrawData);
    
    console.log('✓ Withdraw request created successfully');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    
    withdrawRequestId = createResponse.data.data.id;
    console.log(`Withdraw request ID: ${withdrawRequestId}`);
    
    // BAGIAN 2: ADMIN MENYETUJUI PERMINTAAN PENARIKAN
    console.log('\n\nBAGIAN 2: ADMIN MENYETUJUI PERMINTAAN PENARIKAN');
    console.log('----------------------------------------');
    
    // Step 4: Login sebagai admin
    console.log('\nStep 4: Admin login...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@mahirku.com', // Ganti dengan email admin yang valid
      password: 'admin123' // Ganti dengan password yang benar
    });
    
    if (!adminLogin.data.token) {
      console.error('❌ Admin login failed:', adminLogin.data.message || 'No token received');
      return;
    }
    
    console.log('✓ Admin login successful');
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    // Step 5: Verifikasi permintaan penarikan ada di daftar admin
    console.log('\nStep 5: Verifying withdraw request in admin list...');
    const adminWithdrawsResponse = await api.get('/withdraw/admin/all');
    
    if (!adminWithdrawsResponse.data.success) {
      console.error('❌ Failed to get admin withdraw list:', adminWithdrawsResponse.data.message);
      return;
    }
    
    const pendingWithdraws = adminWithdrawsResponse.data.data.withdrawRequests.filter(w => w.status === 'pending');
    const targetWithdraw = pendingWithdraws.find(w => w.id === withdrawRequestId);
    
    if (!targetWithdraw) {
      console.log('❌ Could not find the created withdraw request in admin list');
      console.log('Available pending withdraw requests:');
      pendingWithdraws.forEach(w => {
        console.log(`  - ID: ${w.id}, Amount: Rp ${w.amount.toLocaleString()}`);
      });
      return;
    }
    
    console.log(`✓ Found withdraw request ID: ${targetWithdraw.id}, Amount: Rp ${targetWithdraw.amount.toLocaleString()}`);
    
    // Step 6: Approve the withdraw request
    console.log(`\nStep 6: Approving withdraw request ID: ${targetWithdraw.id}...`);
    
    const approveResponse = await api.put(`/withdraw/admin/${targetWithdraw.id}/approve`, {
      notes: 'Approved via automated test'
    });
    
    console.log('✓ Withdraw request approved successfully');
    console.log('Approval response:', JSON.stringify(approveResponse.data, null, 2));
    
    // Check if payout was processed
    if (approveResponse.data.data && approveResponse.data.data.payout) {
      console.log('✓ Payout processed successfully');
      console.log('Payout ID:', approveResponse.data.data.payout.id);
    } else if (approveResponse.data.payoutError) {
      console.log('⚠️ Payout failed:', approveResponse.data.payoutError);
    } else {
      console.log('⚠️ No payout information in response');
    }
    
    // Step 7: Verifikasi status withdraw request telah berubah
    console.log('\nStep 7: Verifying withdraw request status has changed...');
    const verifyResponse = await api.get(`/withdraw/admin/detail/${targetWithdraw.id}`);
    
    if (!verifyResponse.data.success) {
      console.error('❌ Failed to get withdraw details:', verifyResponse.data.message);
      return;
    }
    
    const updatedWithdraw = verifyResponse.data.data;
    console.log(`Updated withdraw status: ${updatedWithdraw.status}`);
    console.log(`Payout ID: ${updatedWithdraw.payoutId || 'Not set'}`);
    console.log(`Payout Status: ${updatedWithdraw.payoutStatus || 'Not set'}`);
    
    // BAGIAN 3: AFFILIATE MEMERIKSA STATUS PENARIKAN
    console.log('\n\nBAGIAN 3: AFFILIATE MEMERIKSA STATUS PENARIKAN');
    console.log('----------------------------------------');
    
    // Step 8: Login kembali sebagai affiliate
    console.log('\nStep 8: Switching back to affiliate account...');
    api.defaults.headers.common['Authorization'] = `Bearer ${affiliateToken}`;
    
    // Step 9: Cek status withdraw request dari sisi affiliate
    console.log('\nStep 9: Checking withdraw status as affiliate...');
    const affiliateWithdrawResponse = await api.get('/withdraw/history');
    
    if (!affiliateWithdrawResponse.data.success) {
      console.error('❌ Failed to get affiliate withdraw history:', affiliateWithdrawResponse.data.message);
      return;
    }
    
    const affiliateWithdraw = affiliateWithdrawResponse.data.data.withdrawRequests.find(w => w.id === withdrawRequestId);
    
    if (!affiliateWithdraw) {
      console.log('❌ Could not find the withdraw request in affiliate history');
      return;
    }
    
    console.log(`Affiliate view - Withdraw status: ${affiliateWithdraw.status}`);
    console.log(`Affiliate view - Amount: Rp ${affiliateWithdraw.amount.toLocaleString()}`);
    console.log(`Affiliate view - Created: ${new Date(affiliateWithdraw.createdAt).toLocaleString()}`);
    console.log(`Affiliate view - Processed: ${affiliateWithdraw.processedAt ? new Date(affiliateWithdraw.processedAt).toLocaleString() : 'Not processed yet'}`);
    
    // Step 10: Cek saldo affiliate setelah penarikan
    console.log('\nStep 10: Checking affiliate balance after withdrawal...');
    const finalBalanceResponse = await api.get('/affiliate/dashboard');
    
    if (!finalBalanceResponse.data.success) {
      console.error('❌ Failed to get final affiliate balance:', finalBalanceResponse.data.message);
      return;
    }
    
    const finalBalance = finalBalanceResponse.data.data.balance;
    console.log(`Final balance: Rp ${finalBalance.toLocaleString()}`);
    console.log(`Balance change: Rp ${(balance - finalBalance).toLocaleString()}`);
    
    // Ringkasan test
    console.log('\n=== Test Summary ===');
    console.log('✓ Successfully created withdraw request as affiliate');
    console.log('✓ Successfully approved withdraw request as admin');
    console.log(`✓ Withdraw request status: ${updatedWithdraw.status}`);
    console.log(`✓ Payout status: ${updatedWithdraw.payoutStatus || 'Not available'}`);
    console.log(`✓ Balance before: Rp ${balance.toLocaleString()}, after: Rp ${finalBalance.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testCompleteWithdrawFlow();