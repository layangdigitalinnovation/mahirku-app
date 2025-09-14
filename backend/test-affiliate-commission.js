// Test script untuk memverifikasi komisi affiliate tercatat dengan benar
const { sequelize } = require('./src/config/database');
const AffiliateCommission = require('./src/models/AffiliateCommission').default;
const AffiliateBalance = require('./src/models/AffiliateBalance').default;
const User = require('./src/models/User').default;
const Package = require('./src/models/Package').default;
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

async function testAffiliateCommissionFlow() {
  console.log('=== TESTING AFFILIATE COMMISSION FLOW ===\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // 1. Cek data awal
    console.log('1. Checking initial data...');
    const initialCommissions = await AffiliateCommission.count();
    const initialBalance = await AffiliateBalance.findOne({ where: { affiliateId: 9 } });
    
    console.log(`Initial commissions count: ${initialCommissions}`);
    console.log(`Initial balance for affiliate 9:`, initialBalance ? {
      totalEarned: initialBalance.totalEarned,
      availableBalance: initialBalance.availableBalance
    } : 'No balance record');
    
    // 2. Test set referral cookie
    console.log('\n2. Testing referral cookie setting...');
    const setCookieResponse = await api.get('/', {
      params: { ref: 'aff9' },
      maxRedirects: 0,
      validateStatus: () => true
    });
    
    const cookieHeader = setCookieResponse.headers['set-cookie'];
    console.log('Set-Cookie response:', cookieHeader ? 'Cookie set successfully' : 'No cookie set');
    
    // 3. Register user baru dengan referral cookie
     console.log('\n3. Creating new user with referral cookie...');
     const timestamp = Date.now();
     const registerResponse = await api.post('/auth/register-user', {
       username: 'testuser' + timestamp,
       email: 'test' + timestamp + '@example.com',
       password: 'password123',
       fullname: 'Test User',
       address: 'Test Address',
       phoneNumber: '081234567890'
     });
     
     if (registerResponse.status === 201) {
       console.log('✅ Test user created successfully with referral');
       
       // Login dengan user baru
       const loginResponse = await api.post('/auth/login', {
         email: 'test' + timestamp + '@example.com',
         password: 'password123'
       });
       
       if (loginResponse.status === 200) {
      api.defaults.headers.Authorization = `Bearer ${loginResponse.data.token}`;
      console.log('✅ Login successful with new user');
      
      // 4. Cek package yang tersedia
      console.log('\n4. Checking available packages...');
      const packages = await Package.findAll();
      console.log('Available packages:', packages.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        commissionRate: p.commissionRate
      })));
      
      if (packages.length === 0) {
        console.log('❌ No packages found, creating test package...');
        const testPackage = await Package.create({
          name: 'Test Package',
          description: 'Test package for commission testing',
          defaultTokenAmount: 10,
          price: 100000,
          commissionRate: 5.5
        });
        console.log('✅ Test package created:', testPackage.id);
      }
      
      // 5. Test purchase token dengan referral cookie
      console.log('\n5. Testing token purchase with referral cookie...');
      const purchaseResponse = await api.post('/token/purchase', {
        packageId: packages[0]?.id || 1
      }, {
        headers: {
          'Cookie': 'mahirku_referral=aff9'
        }
      });
      
      console.log('Purchase response:', {
        status: purchaseResponse.status,
        message: purchaseResponse.data.message,
        hasPaymentUrl: !!purchaseResponse.data.paymentUrl,
        hasInvoiceId: !!purchaseResponse.data.invoiceId
      });
      
      // 6. Simulasi callback pembayaran sukses
      console.log('\n6. Simulating successful payment callback...');
      
      // Cari invoice yang baru dibuat
      const invoiceId = purchaseResponse.data.invoiceId;
      if (invoiceId) {
        try {
          // Simulasi callback Xendit dengan external_id yang benar
          const callbackResponse = await api.post('/payment/xendit/callback', {
            id: `invoice_${invoiceId}`,
            external_id: `INV-${invoiceId}`,
            status: 'PAID',
            amount: packages[0]?.price || 100000,
            paid_amount: packages[0]?.price || 100000,
            payment_method: 'BANK_TRANSFER',
            payment_channel: 'BCA',
            paid_at: new Date().toISOString()
          }, {
            headers: {
              'Cookie': 'mahirku_referral=aff9'
            }
          });
          
          console.log('Callback response:', {
            status: callbackResponse.status,
            message: callbackResponse.data?.message || 'Success'
          });
        } catch (callbackError) {
          console.log('Callback error (expected):', callbackError.response?.status, callbackError.response?.data?.message);
        }
      }
      
       } else {
         console.log('❌ Login failed with new user');
         return;
       }
     } else {
       console.log('❌ User registration failed');
       console.log('Register response:', registerResponse.status, registerResponse.data);
       return;
     }
    
    // 7. Tunggu sebentar untuk memastikan callback diproses
    console.log('\n7. Waiting for commission processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 8. Cek invoice yang dibuat untuk memastikan referralCode tersimpan
     console.log('\n8. Checking invoice details...');
     const invoiceDetails = await sequelize.query(
       'SELECT * FROM invoices ORDER BY id DESC LIMIT 1',
       { type: sequelize.QueryTypes.SELECT }
     );
     
     if (invoiceDetails.length > 0) {
       const invoice = invoiceDetails[0];
       console.log('Latest invoice details:');
       console.log(`   ID: ${invoice.id}`);
       console.log(`   User ID: ${invoice.userId}`);
       console.log(`   Package ID: ${invoice.packageId}`);
       console.log(`   Referral Code: ${invoice.referralCode}`);
       console.log(`   Status: ${invoice.status}`);
       console.log(`   Token Amount: ${invoice.tokenAmount}`);
     } else {
       console.log('❌ No invoice found');
     }
     
     // 9. Cek apakah komisi tercatat
     console.log('\n9. Checking if commission was recorded...');
     
     const finalCommissions = await AffiliateCommission.findAll({
       include: [
         { model: User, as: 'referrer', attributes: ['id', 'fullname', 'email'] },
         { model: User, as: 'referredUser', attributes: ['id', 'fullname', 'email'] }
       ],
       order: [['createdAt', 'DESC']],
       limit: 5
     });
    
    console.log('Recent commissions after purchase:');
    if (finalCommissions.length > 0) {
      finalCommissions.forEach((commission, index) => {
        console.log(`${index + 1}. Commission ID: ${commission.id}`);
        console.log(`   Referrer: ${commission.referrer?.fullname} (${commission.referrer?.email})`);
        console.log(`   Referred User: ${commission.referredUser?.fullname} (${commission.referredUser?.email})`);
        console.log(`   Amount: Rp ${commission.amount.toLocaleString()}`);
        console.log(`   Source: ${commission.source}`);
        console.log(`   Status: ${commission.status}`);
        console.log(`   Created: ${commission.createdAt}`);
        console.log('');
      });
    } else {
      console.log('No commissions found');
    }
    
    // 10. Cek balance affiliate
     console.log('10. Checking affiliate balance...');
    const finalBalance = await AffiliateBalance.findOne({
      where: { affiliateId: 9 },
      include: [{ model: User, as: 'affiliate', attributes: ['id', 'fullname', 'email'] }]
    });
    
    if (finalBalance) {
      console.log('Affiliate balance for aff9:');
      console.log(`   Total Earned: Rp ${finalBalance.totalEarned.toLocaleString()}`);
      console.log(`   Available Balance: Rp ${finalBalance.availableBalance.toLocaleString()}`);
      console.log(`   Withdrawn Amount: Rp ${finalBalance.withdrawnAmount.toLocaleString()}`);
      console.log(`   Minimum Balance: Rp ${finalBalance.minimumBalance.toLocaleString()}`);
    } else {
      console.log('❌ No balance record found for affiliate 9');
    }
    
    // 11. Summary
     console.log('\n=== SUMMARY ===');
    const totalCommissions = await AffiliateCommission.count();
    const tokenPurchaseCommissions = await AffiliateCommission.count({
      where: { source: 'token_purchase' }
    });
    
    console.log(`Total commissions in database: ${totalCommissions}`);
    console.log(`Token purchase commissions: ${tokenPurchaseCommissions}`);
    console.log(`Commissions added in this test: ${totalCommissions - initialCommissions}`);
    
    if (totalCommissions > initialCommissions) {
      console.log('✅ SUCCESS: Commission was recorded!');
    } else {
      console.log('❌ FAILED: No commission was recorded');
      console.log('\nPossible reasons:');
      console.log('- Payment callback was not processed');
      console.log('- Referral cookie was not read correctly');
      console.log('- Commission calculation failed');
      console.log('- Database transaction failed');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await sequelize.close();
  }
}

// Jalankan test
testAffiliateCommissionFlow();