const axios = require('axios');

// Test 1: Set cookie dengan referral parameter
async function testSetCookie() {
  console.log('=== Test 1: Set Cookie ===');
  try {
    const response = await axios.get('http://localhost:5000/api/auth/register-user?ref=aff9', {
      withCredentials: true
    });
    console.log('Response headers:', response.headers);
    console.log('Set-Cookie:', response.headers['set-cookie']);
  } catch (error) {
    console.log('Error (expected):', error.response?.status);
    console.log('Set-Cookie from error:', error.response?.headers['set-cookie']);
  }
}

// Test 2: Login untuk mendapatkan token yang valid
async function testLogin() {
  console.log('\n=== Test 2: Login ===');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'aff9@example.com',
      password: 'password123'
    });
    console.log('Login successful, token:', response.data.token?.substring(0, 20) + '...');
    return response.data.token;
  } catch (error) {
    console.log('Login error:', error.response?.data);
    return null;
  }
}

// Test 3: Read cookie dengan token yang valid
async function testReadCookie(token) {
  console.log('\n=== Test 3: Read Cookie with Valid Token ===');
  try {
    const response = await axios.post('http://localhost:5000/api/token/purchase', 
      { packageId: 1 },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cookie': 'mahirku_referral=aff9'
        },
        withCredentials: true
      }
    );
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data);
  }
}

async function runTests() {
  await testSetCookie();
  const token = await testLogin();
  if (token) {
    await testReadCookie(token);
  } else {
    console.log('Cannot test cookie reading without valid token');
  }
}

runTests().catch(console.error);