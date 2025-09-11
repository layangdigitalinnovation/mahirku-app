const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testApproveAndPayout() {
  console.log('=== Testing Approve and Payout Process ===\n');
  
  try {
    // Step 1: Login sebagai admin
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
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    
    // Step 2: Get pending withdraw requests
    console.log('\nStep 2: Getting pending withdraw requests...');
    const withdrawsResponse = await api.get('/withdraw/admin/all');
    
    if (!withdrawsResponse.data.success) {
      console.error('❌ Failed to get withdraw requests:', withdrawsResponse.data.message);
      return;
    }
    
    const pendingWithdraws = withdrawsResponse.data.data.withdrawRequests.filter(w => w.status === 'pending');
    
    if (pendingWithdraws.length === 0) {
      console.log('❌ No pending withdraw requests found');
      console.log('Available withdraw requests:');
      withdrawsResponse.data.data.withdrawRequests.forEach(w => {
        console.log(`  - ID: ${w.id}, Status: ${w.status}, Amount: ${w.amount}`);
      });
      return;
    }
    
    const withdrawToApprove = pendingWithdraws[0];
    console.log(`✓ Found pending withdraw request ID: ${withdrawToApprove.id}, Amount: ${withdrawToApprove.amount}`);
    
    // Step 3: Approve the withdraw request
    console.log(`\nStep 3: Approving withdraw request ID: ${withdrawToApprove.id}...`);
    
    try {
      const approveResponse = await api.put(`/withdraw/admin/${withdrawToApprove.id}/approve`, {
        notes: 'Test approval for payout testing'
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
      
    } catch (approveError) {
      console.error('❌ Failed to approve withdraw request:', approveError.response?.data || approveError.message);
      if (approveError.response?.data) {
        console.error('Error details:', JSON.stringify(approveError.response.data, null, 2));
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
testApproveAndPayout();