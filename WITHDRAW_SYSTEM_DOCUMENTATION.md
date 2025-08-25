# 📋 Dokumentasi Sistem Withdraw dengan Payout Otomatis Xendit

## 📖 Daftar Isi
1. [Overview](#overview)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Alur Kerja Sistem](#alur-kerja-sistem)
6. [Konfigurasi Xendit](#konfigurasi-xendit)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Sistem Withdraw dengan Payout Otomatis Xendit adalah fitur yang memungkinkan affiliator untuk menarik komisi mereka secara otomatis melalui integrasi dengan Xendit API. Sistem ini menangani seluruh proses dari pengajuan withdraw hingga transfer dana ke rekening bank affiliator.

### ✨ Fitur Utama:
- **Pengajuan Withdraw**: Affiliator dapat mengajukan penarikan dana dengan minimum Rp 100.000
- **Approval System**: Admin dapat menyetujui atau menolak permintaan withdraw
- **Payout Otomatis**: Setelah disetujui, sistem otomatis memproses transfer melalui Xendit
- **Real-time Status**: Tracking status payout secara real-time melalui webhook
- **Audit Trail**: Pencatatan lengkap semua transaksi withdraw

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Xendit      │
│   (React)       │    │   (Node.js)     │    │      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Request Withdraw   │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Admin Approval     │                       │
         ├──────────────────────►│                       │
         │                       │ 3. Create Payout     │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 4. Payout Response   │
         │                       │◄──────────────────────┤
         │                       │                       │
         │                       │ 5. Webhook Callback  │
         │                       │◄──────────────────────┤
         │ 6. Status Update      │                       │
         │◄──────────────────────┤                       │
```

### 🔧 Komponen Utama:

1. **Models**:
   - `AffiliateBalance`: Menyimpan saldo komisi affiliator
   - `WithdrawRequest`: Menyimpan data permintaan withdraw
   - `User`: Data affiliator dengan informasi bank

2. **Controllers**:
   - `withdrawController`: Menangani CRUD withdraw requests
   - `xenditController`: Menangani integrasi dengan Xendit API
   - `affiliateController`: Menampilkan saldo dan komisi

3. **Routes**:
   - `/api/withdraw/*`: Endpoint untuk withdraw system
   - `/api/payment/xendit/payout-callback`: Webhook untuk callback Xendit

---

## 🗄️ Database Schema

### 📊 Tabel `users`
```sql
ALTER TABLE users ADD COLUMN bankName VARCHAR(255);
ALTER TABLE users ADD COLUMN bankAccountNumber VARCHAR(50);
ALTER TABLE users ADD COLUMN bankAccountName VARCHAR(255);
```

### 📊 Tabel `affiliate_balances`
```sql
CREATE TABLE affiliate_balances (
  id SERIAL PRIMARY KEY,
  affiliateId INTEGER NOT NULL REFERENCES users(id),
  balance INTEGER NOT NULL DEFAULT 0,
  withdrawnAmount INTEGER NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📊 Tabel `withdraw_requests`
```sql
CREATE TABLE withdraw_requests (
  id SERIAL PRIMARY KEY,
  affiliateId INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'processed', 'processing', 'completed', 'failed') DEFAULT 'pending',
  bankName VARCHAR(255),
  accountNumber VARCHAR(50),
  accountName VARCHAR(255),
  notes TEXT,
  processedAt TIMESTAMP,
  processedBy INTEGER REFERENCES users(id),
  rejectionReason TEXT,
  payoutId VARCHAR(255),
  payoutStatus VARCHAR(50),
  failureReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📊 Tabel `affiliate_commissions`
```sql
ALTER TABLE affiliate_commissions ADD COLUMN status ENUM('pending', 'paid') DEFAULT 'pending';
ALTER TABLE affiliate_commissions ADD COLUMN source ENUM('test_completion', 'token_purchase') NOT NULL;
```

---

## 🔌 API Endpoints

### 🏦 Withdraw System Endpoints

#### 1. **POST** `/api/withdraw/request`
**Deskripsi**: Mengajukan permintaan withdraw

**Request Body**:
```json
{
  "amount": 150000,
  "bankName": "BCA",
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "notes": "Withdraw komisi bulan ini"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Permintaan withdraw berhasil diajukan",
  "data": {
    "id": "123",
    "amount": 150000,
    "status": "pending",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

#### 2. **GET** `/api/withdraw/history`
**Deskripsi**: Mendapatkan riwayat withdraw affiliator

**Query Parameters**:
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10)
- `status`: Filter berdasarkan status

**Response**:
```json
{
  "success": true,
  "data": {
    "withdrawRequests": [
      {
        "id": "123",
        "amount": 150000,
        "status": "completed",
        "bankName": "BCA",
        "accountNumber": "****7890",
        "createdAt": "2025-01-15T10:00:00Z",
        "processedAt": "2025-01-15T11:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

#### 3. **PUT** `/api/withdraw/approve/:id`
**Deskripsi**: Menyetujui permintaan withdraw (Admin only)

**Request Body**:
```json
{
  "notes": "Withdraw disetujui"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Withdraw request berhasil disetujui dan payout sedang diproses",
  "data": {
    "withdrawRequestId": "123",
    "payoutId": "payout_xyz789",
    "status": "processing"
  }
}
```

#### 4. **PUT** `/api/withdraw/reject/:id`
**Deskripsi**: Menolak permintaan withdraw (Admin only)

**Request Body**:
```json
{
  "reason": "Data bank tidak valid"
}
```

#### 5. **GET** `/api/withdraw/admin/pending`
**Deskripsi**: Mendapatkan semua permintaan withdraw yang pending (Admin only)

### 🔄 Xendit Integration Endpoints

#### 6. **POST** `/api/payment/xendit/payout-callback`
**Deskripsi**: Webhook untuk menerima callback status payout dari Xendit

**Request Body** (dari Xendit):
```json
{
  "id": "payout_xyz789",
  "status": "COMPLETED",
  "amount": 150000,
  "reference_id": "withdraw_123",
  "failure_reason": null,
  "created": "2025-01-15T10:00:00Z",
  "completed_at": "2025-01-15T10:05:00Z"
}
```

---

## ⚙️ Alur Kerja Sistem

### 🔄 1. Pengajuan Withdraw
```
1. Affiliator mengajukan withdraw melalui frontend
2. Sistem validasi:
   - Saldo mencukupi (minimal Rp 100.000)
   - Data bank lengkap
   - Tidak ada withdraw pending
3. Buat record di withdraw_requests dengan status 'pending'
4. Kurangi saldo available (optional: reserve amount)
```

### ✅ 2. Approval Process
```
1. Admin melihat daftar withdraw pending
2. Admin approve/reject withdraw request
3. Jika approved:
   - Update status ke 'approved'
   - Trigger automatic payout process
4. Jika rejected:
   - Update status ke 'rejected'
   - Kembalikan saldo (jika di-reserve)
```

### 💸 3. Automatic Payout Process
```
1. Sistem ambil data withdraw request + affiliate info
2. Validasi data bank affiliate
3. Buat payload untuk Xendit API:
   {
     "reference_id": "withdraw_{id}",
     "amount": amount,
     "account_holder_name": affiliate.bankAccountName,
     "account_number": affiliate.bankAccountNumber,
     "bank_code": bankCode,
     "description": "Withdraw komisi affiliate"
   }
4. Kirim request ke Xendit /payouts endpoint
5. Update withdraw request:
   - status: 'processing'
   - payoutId: response.id
   - payoutStatus: response.status
```

### 📡 4. Webhook Callback
```
1. Xendit kirim callback ke /api/payment/xendit/payout-callback
2. Sistem update withdraw request berdasarkan status:
   - COMPLETED: status = 'completed'
   - FAILED: status = 'failed', simpan failure_reason
   - PENDING: status = 'processing'
3. Update affiliate balance jika completed
4. Kirim notifikasi ke affiliator (email/push notification)
```

---

## 🔐 Konfigurasi Xendit

### 📝 Environment Variables
```env
# Xendit Configuration
XENDIT_SECRET_KEY=xnd_development_your_secret_key
XENDIT_PUBLIC_KEY=xnd_public_development_your_public_key
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token
XENDIT_BASE_URL=https://api.xendit.co

# Webhook URLs
XENDIT_PAYOUT_CALLBACK_URL=https://yourdomain.com/api/payment/xendit/payout-callback
```

### ⚙️ Xendit Dashboard Setup
1. **Login ke Xendit Dashboard**
2. **Buat Webhook**:
   - URL: `https://yourdomain.com/api/payment/xendit/payout-callback`
   - Events: `payout.completed`, `payout.failed`
3. **Setup Bank Codes**:
   ```javascript
   const BANK_CODES = {
     'BCA': 'BCA',
     'BNI': 'BNI',
     'BRI': 'BRI',
     'MANDIRI': 'MANDIRI',
     'CIMB': 'CIMB',
     'DANAMON': 'DANAMON'
   };
   ```

### 🔧 Xendit API Configuration
```javascript
// config/xenditConfig.ts
export const xenditConfig = {
  secretKey: process.env.XENDIT_SECRET_KEY!,
  publicKey: process.env.XENDIT_PUBLIC_KEY!,
  baseURL: process.env.XENDIT_BASE_URL || 'https://api.xendit.co',
  webhookToken: process.env.XENDIT_WEBHOOK_TOKEN,
  callbackURL: process.env.XENDIT_PAYOUT_CALLBACK_URL
};
```

---

## ⚠️ Error Handling

### 🚨 Common Error Scenarios

#### 1. **Insufficient Balance**
```json
{
  "success": false,
  "error": "INSUFFICIENT_BALANCE",
  "message": "Saldo tidak mencukupi untuk withdraw. Minimum Rp 100.000",
  "data": {
    "currentBalance": 75000,
    "minimumWithdraw": 100000
  }
}
```

#### 2. **Invalid Bank Data**
```json
{
  "success": false,
  "error": "INVALID_BANK_DATA",
  "message": "Data bank tidak lengkap atau tidak valid",
  "data": {
    "missingFields": ["bankAccountName", "bankAccountNumber"]
  }
}
```

#### 3. **Xendit API Error**
```json
{
  "success": false,
  "error": "XENDIT_API_ERROR",
  "message": "Gagal memproses payout melalui Xendit",
  "data": {
    "xenditError": "INVALID_ACCOUNT_NUMBER",
    "xenditMessage": "Account number is invalid"
  }
}
```

#### 4. **Pending Withdraw Exists**
```json
{
  "success": false,
  "error": "PENDING_WITHDRAW_EXISTS",
  "message": "Anda masih memiliki permintaan withdraw yang sedang diproses",
  "data": {
    "pendingWithdrawId": "123",
    "pendingAmount": 150000
  }
}
```

### 🔄 Error Recovery

#### Retry Mechanism
```javascript
// Retry failed payouts
const retryFailedPayout = async (withdrawRequestId: string) => {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await processAutomaticPayout(withdrawRequestId);
      if (result.success) {
        return result;
      }
    } catch (error) {
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  // Mark as failed after max retries
  await WithdrawRequest.update(
    { status: 'failed', failureReason: 'Max retries exceeded' },
    { where: { id: withdrawRequestId } }
  );
};
```

---

## 🧪 Testing

### 🔬 Unit Tests

#### Test Withdraw Request Creation
```javascript
// tests/withdraw.test.js
describe('Withdraw Request', () => {
  test('should create withdraw request with valid data', async () => {
    const withdrawData = {
      affiliateId: 1,
      amount: 150000,
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountName: 'John Doe'
    };
    
    const response = await request(app)
      .post('/api/withdraw/request')
      .send(withdrawData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('pending');
  });
  
  test('should reject withdraw with insufficient balance', async () => {
    const withdrawData = {
      affiliateId: 1,
      amount: 1000000, // Amount too high
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountName: 'John Doe'
    };
    
    const response = await request(app)
      .post('/api/withdraw/request')
      .send(withdrawData)
      .expect(400);
      
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('INSUFFICIENT_BALANCE');
  });
});
```

#### Test Xendit Integration
```javascript
// tests/xendit.test.js
describe('Xendit Payout', () => {
  test('should process automatic payout successfully', async () => {
    // Mock Xendit API response
    nock('https://api.xendit.co')
      .post('/payouts')
      .reply(200, {
        id: 'payout_test_123',
        status: 'PENDING',
        amount: 150000
      });
      
    const result = await processAutomaticPayout('withdraw_123');
    
    expect(result.success).toBe(true);
    expect(result.payoutId).toBe('payout_test_123');
  });
  
  test('should handle webhook callback correctly', async () => {
    const callbackData = {
      id: 'payout_test_123',
      status: 'COMPLETED',
      reference_id: 'withdraw_123'
    };
    
    const response = await request(app)
      .post('/api/payment/xendit/payout-callback')
      .send(callbackData)
      .expect(200);
      
    expect(response.body.success).toBe(true);
    
    // Verify withdraw request status updated
    const withdrawRequest = await WithdrawRequest.findOne({
      where: { payoutId: 'payout_test_123' }
    });
    expect(withdrawRequest.status).toBe('completed');
  });
});
```

### 🎯 Integration Tests

#### End-to-End Withdraw Flow
```javascript
// tests/e2e/withdraw-flow.test.js
describe('Complete Withdraw Flow', () => {
  test('should complete full withdraw process', async () => {
    // 1. Create withdraw request
    const withdrawResponse = await request(app)
      .post('/api/withdraw/request')
      .send(validWithdrawData)
      .expect(201);
      
    const withdrawId = withdrawResponse.body.data.id;
    
    // 2. Admin approves withdraw
    await request(app)
      .put(`/api/withdraw/approve/${withdrawId}`)
      .send({ notes: 'Approved for testing' })
      .expect(200);
      
    // 3. Verify payout was created
    const withdrawRequest = await WithdrawRequest.findByPk(withdrawId);
    expect(withdrawRequest.status).toBe('processing');
    expect(withdrawRequest.payoutId).toBeTruthy();
    
    // 4. Simulate webhook callback
    await request(app)
      .post('/api/payment/xendit/payout-callback')
      .send({
        id: withdrawRequest.payoutId,
        status: 'COMPLETED',
        reference_id: `withdraw_${withdrawId}`
      })
      .expect(200);
      
    // 5. Verify final status
    await withdrawRequest.reload();
    expect(withdrawRequest.status).toBe('completed');
  });
});
```

### 🧪 Manual Testing Checklist

#### ✅ Withdraw Request Testing
- [ ] Create withdraw with valid data
- [ ] Create withdraw with insufficient balance
- [ ] Create withdraw with invalid bank data
- [ ] Create withdraw when pending request exists
- [ ] View withdraw history with pagination
- [ ] Filter withdraw history by status

#### ✅ Admin Approval Testing
- [ ] Approve valid withdraw request
- [ ] Reject withdraw request with reason
- [ ] View all pending withdraws
- [ ] Approve withdraw triggers payout

#### ✅ Xendit Integration Testing
- [ ] Successful payout creation
- [ ] Handle Xendit API errors
- [ ] Process webhook callbacks
- [ ] Handle different payout statuses
- [ ] Retry failed payouts

---

## 🚀 Deployment

### 📋 Pre-deployment Checklist

#### ✅ Environment Setup
- [ ] Set all required environment variables
- [ ] Configure Xendit webhook URLs
- [ ] Setup database migrations
- [ ] Configure SSL certificates
- [ ] Setup monitoring and logging

#### ✅ Database Migration
```bash
# Run migrations
cd backend
node run-migrations.js

# Verify tables created
psql -d your_database -c "\dt"
```

#### ✅ Xendit Configuration
1. **Production API Keys**:
   ```env
   XENDIT_SECRET_KEY=xnd_production_your_secret_key
   XENDIT_PUBLIC_KEY=xnd_public_production_your_public_key
   ```

2. **Webhook Setup**:
   - URL: `https://yourdomain.com/api/payment/xendit/payout-callback`
   - Verify webhook token
   - Test webhook connectivity

3. **Bank Account Validation**:
   - Enable account validation in Xendit dashboard
   - Configure supported banks

### 🔧 Production Configuration

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/mahirku
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    location /api/payment/xendit/payout-callback {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for webhook processing
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mahirku-backend',
    script: 'dist/server.js',
    cwd: '/path/to/backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/mahirku/error.log',
    out_file: '/var/log/mahirku/out.log',
    log_file: '/var/log/mahirku/combined.log',
    time: true
  }]
};
```

### 📊 Monitoring

#### Health Check Endpoint
```javascript
// Add to routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});
```

#### Logging Configuration
```javascript
// utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'withdraw-system' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

---

## 🔍 Troubleshooting

### ❌ Common Issues

#### 1. **Webhook Not Received**
**Symptoms**: Payout status tidak update setelah completion

**Diagnosis**:
```bash
# Check webhook logs
tail -f /var/log/nginx/access.log | grep payout-callback

# Check application logs
pm2 logs mahirku-backend | grep webhook
```

**Solutions**:
- Verify webhook URL accessible from internet
- Check SSL certificate validity
- Verify webhook token configuration
- Test webhook manually:
  ```bash
  curl -X POST https://yourdomain.com/api/payment/xendit/payout-callback \
    -H "Content-Type: application/json" \
    -d '{"id":"test","status":"COMPLETED","reference_id":"test"}'
  ```

#### 2. **Payout Creation Failed**
**Symptoms**: Error saat approve withdraw request

**Diagnosis**:
```javascript
// Check Xendit API response
console.log('Xendit Error:', error.response?.data);
```

**Common Causes & Solutions**:
- **Invalid Bank Code**: Update bank code mapping
- **Invalid Account Number**: Validate account number format
- **Insufficient Xendit Balance**: Top up Xendit account
- **API Rate Limit**: Implement retry with exponential backoff

#### 3. **Database Connection Issues**
**Symptoms**: Server crashes atau timeout

**Diagnosis**:
```bash
# Check database connections
psql -d your_database -c "SELECT count(*) FROM pg_stat_activity;"

# Check application logs
pm2 logs mahirku-backend | grep "database"
```

**Solutions**:
- Increase connection pool size
- Check database server resources
- Optimize slow queries
- Implement connection retry logic

#### 4. **Memory Leaks**
**Symptoms**: Server memory usage terus meningkat

**Diagnosis**:
```bash
# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect server.js
```

**Solutions**:
- Review event listeners (ensure proper cleanup)
- Check for unclosed database connections
- Implement proper error handling
- Use memory profiling tools

### 🔧 Debug Commands

#### Check Withdraw Request Status
```sql
-- Check pending withdraws
SELECT wr.*, u.fullname, u.email 
FROM withdraw_requests wr 
JOIN users u ON wr.affiliateId = u.id 
WHERE wr.status = 'pending';

-- Check processing payouts
SELECT * FROM withdraw_requests 
WHERE status = 'processing' 
AND payoutId IS NOT NULL;
```

#### Manually Update Payout Status
```sql
-- If webhook missed, manually update status
UPDATE withdraw_requests 
SET status = 'completed', 
    payoutStatus = 'COMPLETED',
    updatedAt = CURRENT_TIMESTAMP
WHERE payoutId = 'payout_xyz789';
```

#### Retry Failed Payout
```javascript
// In Node.js console
const { processAutomaticPayout } = require('./src/controllers/xenditController');

// Retry specific withdraw
processAutomaticPayout('withdraw_123')
  .then(result => console.log('Retry result:', result))
  .catch(error => console.error('Retry failed:', error));
```

### 📞 Support Contacts

#### Internal Team
- **Backend Developer**: [developer@company.com]
- **DevOps Engineer**: [devops@company.com]
- **Product Manager**: [pm@company.com]

#### External Services
- **Xendit Support**: support@xendit.co
- **Xendit Documentation**: https://developers.xendit.co/
- **Xendit Status Page**: https://status.xendit.co/

---

## 📚 Additional Resources

### 📖 Documentation Links
- [Xendit Payout API Documentation](https://developers.xendit.co/api-reference/#payouts)
- [Xendit Webhook Documentation](https://developers.xendit.co/api-reference/#webhooks)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Documentation](https://expressjs.com/)

### 🛠️ Development Tools
- **API Testing**: Postman Collection (link to shared collection)
- **Database GUI**: pgAdmin, DBeaver
- **Log Analysis**: ELK Stack, Grafana
- **Monitoring**: New Relic, DataDog

### 🔄 Version History

| Version | Date | Changes |
|---------|------|----------|
| 1.0.0 | 2025-01-15 | Initial implementation with basic withdraw system |
| 1.1.0 | 2025-01-15 | Added Xendit payout integration |
| 1.2.0 | TBD | Planned: Email notifications, SMS alerts |

---

**📝 Catatan**: Dokumentasi ini akan terus diperbarui seiring dengan pengembangan fitur. Pastikan untuk selalu merujuk ke versi terbaru.

**🔒 Keamanan**: Jangan pernah commit API keys atau credentials ke repository. Gunakan environment variables dan secret management tools.

**⚡ Performance**: Monitor performa sistem secara berkala dan optimasi query database yang lambat.

**🧪 Testing**: Selalu test di environment staging sebelum deploy ke production.

---

*Dokumentasi dibuat oleh Tim Development Mahirku - 2025*