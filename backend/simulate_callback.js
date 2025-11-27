const axios = require('axios');

const invoiceId = '7'; // Replace with the actual invoice ID from the user's error message
const externalId = `INV-${invoiceId}`;

const payload = {
    external_id: externalId,
    status: 'PAID',
    paid_at: new Date().toISOString(),
    payment_method: 'CREDIT_CARD',
    amount: 50000, // Example amount
};

axios.post('http://localhost:5000/api/payment/xendit/callback', payload)
    .then(res => {
        console.log('Callback simulated successfully:', res.data);
    })
    .catch(err => {
        console.error('Error simulating callback:', err.response ? err.response.data : err.message);
    });
