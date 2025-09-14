# Xendit Payout API Troubleshooting Guide

## Current Issue

The error `REQUEST_FORBIDDEN_ERROR` with message "The API key is forbidden to perform this request" indicates that the current Xendit API key doesn't have sufficient permissions for payout operations.

## Root Cause Analysis

### Current Configuration
- **API Key**: `xnd_development_7fdg8SoKlaSaV0LJeeXeyMaBQ1u1LBnk2cBiPGL8sTBuySaouYvg77A9I742R`
- **Key Type**: Development key (indicated by `xnd_development_` prefix)
- **Issue**: Development keys have limited permissions and typically don't support payout functionality

### Why Development Keys Can't Access Payouts

1. **Security Restrictions**: Payouts involve real money transfers, so Xendit restricts this to verified accounts
2. **Account Verification**: Payout functionality requires business verification and compliance checks
3. **Permission Levels**: Development keys are meant for testing basic features like invoice creation, not money disbursement

## Solutions

### Option 1: Upgrade to Production Account (Recommended)

1. **Complete Business Verification**:
   - Submit business documents to Xendit
   - Complete KYB (Know Your Business) process
   - Wait for approval (usually 1-3 business days)

2. **Request Payout Permissions**:
   - Contact Xendit support to enable payout features
   - Provide use case documentation
   - Complete additional compliance requirements if needed

3. **Get Production API Key**:
   - Once verified, generate production API key from dashboard
   - Production keys have format: `xnd_production_...`

### Option 2: Use Xendit Test Mode (Limited)

1. **Check Test Environment**:
   - Some Xendit features have test endpoints
   - Test mode may have different base URL
   - Limited functionality compared to production

2. **Alternative Test Approach**:
   ```javascript
   // Use test base URL if available
   const testBaseUrl = 'https://api.xendit.co/test'; // Check Xendit docs
   ```

### Option 3: Mock Payout for Development

1. **Create Mock Payout Service**:
   ```javascript
   // Create a mock service for development
   const mockPayoutService = {
     createPayout: async (payload) => {
       console.log('Mock payout created:', payload);
       return {
         id: `mock_payout_${Date.now()}`,
         status: 'PENDING',
         reference_id: payload.reference_id,
         amount: payload.amount
       };
     }
   };
   ```

2. **Environment-Based Switching**:
   ```javascript
   const payoutService = process.env.NODE_ENV === 'production' 
     ? realXenditService 
     : mockPayoutService;
   ```

## Immediate Actions

### 1. Verify Current Account Status

Run this test to check account capabilities:

```bash
node test-xendit-account-info.js
```

### 2. Contact Xendit Support

- **Email**: support@xendit.co
- **Request**: Enable payout functionality for development/testing
- **Provide**: Business use case and testing requirements

### 3. Implement Fallback Strategy

For immediate development, implement mock payouts:

```javascript
// In xenditController.ts
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Use mock payout for development
  return mockPayoutResponse;
} else {
  // Use real Xendit API for production
  return await xenditAPI.createPayout(payload);
}
```

## Testing Alternatives

### 1. Test Other Xendit Features

- Invoice creation (should work with development key)
- Payment callbacks
- Balance inquiries

### 2. Simulate Payout Flow

- Create payout records in database
- Simulate callback responses
- Test UI/UX without actual money transfer

### 3. Use Webhook Testing

- Test payout callbacks with tools like ngrok
- Simulate different payout statuses
- Verify callback handling logic

## Next Steps

1. **Short-term**: Implement mock payout service for development
2. **Medium-term**: Complete Xendit business verification
3. **Long-term**: Migrate to production API key with full permissions

## Additional Resources

- [Xendit Payout API Documentation](https://developers.xendit.co/api-reference/#payouts)
- [Xendit Account Verification Guide](https://help.xendit.co/en/articles/2837251-how-to-verify-your-account)
- [Xendit API Key Management](https://help.xendit.co/en/articles/2837252-api-keys)