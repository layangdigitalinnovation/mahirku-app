// Test script untuk memverifikasi implementasi referral di frontend
import axios from 'axios';

// Konfigurasi axios yang sama dengan frontend
const api = axios.create({
  baseURL: 'https://api.mahirku.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // PENTING: Untuk mengirim cookies
});

async function testFrontendReferralFlow() {
  console.log('=== Testing Frontend Referral Flow ===\n');

  try {
    // 1. Test set cookie via referral link
    console.log('1. Testing referral link cookie setting...');
    const setCookieResponse = await api.get('/', {
      params: { ref: 'aff9' },
      maxRedirects: 0,
      validateStatus: () => true // Accept any status
    });

    console.log('Set-Cookie headers:', setCookieResponse.headers['set-cookie']);

    // 2. Test login untuk mendapatkan token
    console.log('\n2. Testing login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    if (loginResponse.status === 200) {
      console.log('Login successful, token received');
      const token = loginResponse.data.token;

      // Set token untuk request selanjutnya
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // 3. Test purchase token dengan cookie
      console.log('\n3. Testing token purchase with referral cookie...');
      const purchaseResponse = await api.post('/token/purchase', {
        packageId: 1
      });

      console.log('Purchase response:', {
        status: purchaseResponse.status,
        message: purchaseResponse.data.message,
        hasPaymentUrl: !!purchaseResponse.data.paymentUrl,
        hasInvoiceId: !!purchaseResponse.data.invoiceId
      });

    } else {
      console.log('Login failed:', loginResponse.data);
    }

  } catch (error) {
    if (error.response) {
      console.log('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Jalankan test
testFrontendReferralFlow();