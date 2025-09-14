const axios = require('axios');
// Use direct database connection instead of importing ES module
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// Base URL untuk API
const BASE_URL = 'http://localhost:5000/api';

// Axios instance dengan konfigurasi default
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000
});

async function testAdminWithdrawApproval() {
  try {
    console.log('=== Test Admin Withdraw Approval After Affiliator Logout ===\n');

    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful\n');

    // Step 2: Login sebagai affiliator
    console.log('Step 2: Login as affiliator...');
    const affiliatorLoginResponse = await api.post('/auth/login', {
      email: 'aff9@example.com',
      password: 'password123'
    });
    
    if (affiliatorLoginResponse.data.success) {
      console.log('✓ Affiliator login successful');
      console.log('Token:', affiliatorLoginResponse.data.data.token.substring(0, 20) + '...');
    }

    // Step 3: Logout affiliator (clear token)
    console.log('\nStep 3: Logout affiliator...');
    // Simulate logout by clearing authorization header
    delete api.defaults.headers.common['Authorization'];
    console.log('✓ Affiliator logged out (token cleared)\n');

    // Step 4: Login sebagai admin
    console.log('Step 4: Login as admin...');
    const adminLoginResponse = await api.post('/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    console.log('Admin login response:', JSON.stringify(adminLoginResponse.data, null, 2));
    
    if (adminLoginResponse.data.token) {
      console.log('✓ Admin login successful');
      const adminToken = adminLoginResponse.data.token;
      console.log('Admin Token:', adminToken.substring(0, 20) + '...');
      
      // Set admin token for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      console.log('Token set in headers:', api.defaults.headers.common['Authorization'].substring(0, 30) + '...');
    } else {
      console.log('❌ Admin login failed:', adminLoginResponse.data);
      throw new Error('Admin login failed');
    }

    // Step 5: Create a test withdraw request first
    console.log('\nStep 5: Creating a test withdraw request...');
    
    // First, we need to create a withdraw request as an affiliator
    // Login as affiliator again to create withdraw request
    const affiliatorLoginResponse2 = await api.post('/auth/login', {
      email: 'aff9@example.com',
      password: 'password123'
    });
    
    if (affiliatorLoginResponse2.data.token) {
      const affiliatorToken = affiliatorLoginResponse2.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${affiliatorToken}`;
      
      // Create withdraw request
       try {
         const createWithdrawResponse = await api.post('/withdraw/request', {
           amount: 150000,
           bankName: 'BCA',
           accountNumber: '1234567890',
           accountName: 'Test Affiliator 9',
           notes: 'Test withdraw request for admin approval test'
         });
         console.log('✓ Test withdraw request created');
       } catch (createError) {
         console.log('Note: Could not create withdraw request:', createError.response?.data?.message || createError.message);
       }
    }
    
    // Switch back to admin token
    const adminToken = adminLoginResponse.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    
    // Step 6: Get withdraw requests
    console.log('\nStep 6: Getting withdraw requests...');
    console.log('Current Authorization header:', api.defaults.headers.common['Authorization']);
    const withdrawRequestsResponse = await api.get('/withdraw/admin/all');
    
    console.log('Withdraw requests response:', JSON.stringify(withdrawRequestsResponse.data, null, 2));
    
    if (withdrawRequestsResponse.data.success && withdrawRequestsResponse.data.data.withdrawRequests.length > 0) {
      console.log('✓ Withdraw requests retrieved successfully');
      console.log(`Found ${withdrawRequestsResponse.data.data.withdrawRequests.length} withdraw requests`);
      
      // Get the first pending request
      const pendingRequest = withdrawRequestsResponse.data.data.withdrawRequests.find(req => req.status === 'pending');
      
      if (pendingRequest) {
        console.log(`\nStep 7: Attempting to approve withdraw request ID: ${pendingRequest.id}`);
        
        // Reset admin token for approval
        console.log('Admin token value:', adminToken ? adminToken.substring(0, 30) + '...' : 'null');
        api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
        console.log('Current Authorization header:', api.defaults.headers.common['Authorization'].substring(0, 50) + '...');
        
        // Test admin token with /auth/me endpoint first
        try {
          const meResponse = await api.get('/auth/me');
          console.log('Admin token validation successful:', meResponse.data.user?.email);
          console.log('Admin user role ID:', meResponse.data.user?.roleId);
          console.log('Admin user role name:', meResponse.data.user?.role?.name);
        } catch (meError) {
          console.log('❌ Admin token validation failed:', meError.response?.data?.message || meError.message);
        }
        
        try {
          const approveResponse = await api.put(`/withdraw/admin/${pendingRequest.id}/approve`, {
            notes: 'Approved by admin after affiliator logout test'
          });
          
          if (approveResponse.data.success) {
            console.log('✅ SUCCESS: Withdraw request approved successfully!');
            console.log('Response:', approveResponse.data.message);
            console.log("Payout : ", approveResponse.data.data.payoutError)
          } else {
            console.log('❌ FAILED: Approval failed with message:', approveResponse.data.message);
          }
        } catch (approveError) {
          console.log('❌ FAILED: Error during approval:');
          console.log('Status:', approveError.response?.status);
          console.log('Message:', approveError.response?.data?.message || approveError.message);
          
          if (approveError.response?.data?.message === 'User not authenticated') {
            console.log('\n🐛 BUG CONFIRMED: "User not authenticated" error occurred!');
          }
        }
      } else {
        console.log('⚠️  No pending withdraw requests found to test approval');
      }
    } else {
      console.log('⚠️  No withdraw requests found');
      console.log('Response data:', withdrawRequestsResponse.data);
    }

    console.log('\n=== Test Completed ===');

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run the test
testAdminWithdrawApproval();