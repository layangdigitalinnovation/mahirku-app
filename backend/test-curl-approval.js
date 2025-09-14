const { exec } = require('child_process');
const axios = require('axios');

async function testCurlApproval() {
  try {
    console.log('=== Curl Approval Test ===');
    
    // First get admin token
    console.log('1. Getting admin token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@neuroscan.demo',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtained:', token.substring(0, 20) + '...');
    
    // Test with curl
    console.log('\n2. Testing with curl...');
    const curlCommand = `curl -X PUT "http://localhost:5000/api/withdraw/admin/16/approve" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"notes":"Test approval"}' -v`;
    
    console.log('Curl command:', curlCommand);
    
    exec(curlCommand, (error, stdout, stderr) => {
      console.log('\n=== Curl Output ===');
      if (stdout) console.log('STDOUT:', stdout);
      if (stderr) console.log('STDERR:', stderr);
      if (error) console.log('ERROR:', error.message);
    });
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testCurlApproval();

// Keep the script running for a bit to see curl output
setTimeout(() => {
  console.log('\nTest completed.');
  process.exit(0);
}, 3000);