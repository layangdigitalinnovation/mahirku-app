# Dokumentasi Sistem Commission Rate - Mahirku Backend

## Overview

Sistem commission rate telah diperbarui untuk memberikan komisi yang lebih fleksibel dan akurat kepada affiliator berdasarkan package yang dibeli oleh referred user. Komisi sekarang dihitung berdasarkan jumlah token yang dibeli dengan rumus yang lebih presisi.

## Perubahan Utama

### 1. **Commission Rate per Package**
- Setiap package sekarang memiliki field `commissionRate` (0-100%)
- Commission rate dapat diatur berbeda untuk setiap package
- Default commission rate adalah 0% jika tidak diset

### 2. **Rumus Komisi Baru**
```
price_per_token = package.price / package.defaultTokenAmount
commission = total_tokens × price_per_token × commission_rate
```

### 3. **Timing Pemberian Komisi**
- Komisi hanya diberikan saat **pembayaran token berhasil**
- Tidak ada lagi komisi dari test completion
- Komisi otomatis masuk ke affiliator saat callback payment sukses

## Database Schema

### Package Model
```sql
ALTER TABLE packages ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00;
```

**Field baru:**
- `commission_rate`: DECIMAL(5,2) - Persentase komisi (0.00 - 100.00)
- Default: 0.00 (tidak ada komisi)
- Validation: 0 ≤ commission_rate ≤ 100

## API Endpoints

### 1. **Package Management (Admin)**

#### Create Package
```http
POST /api/packages
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Premium Package",
  "price": 100000,
  "defaultTokenAmount": 1000,
  "commissionRate": 5.5,
  "description": "Package description"
}
```

#### Update Package
```http
PUT /api/packages/:id
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Updated Premium Package",
  "price": 120000,
  "defaultTokenAmount": 1200,
  "commissionRate": 7.0
}
```

#### Get Package Details
```http
GET /api/packages/:id

Response:
{
  "id": 1,
  "name": "Premium Package",
  "price": 100000,
  "defaultTokenAmount": 1000,
  "commissionRate": 5.5,
  "description": "Package description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. **Affiliate System**

#### Get Referral Link
```http
GET /api/affiliate/referral-link
Authorization: Bearer <user_token>

Response:
{
  "referralLink": "https://mahirku.com/?ref=aff123"
}
```

#### Get Affiliate Stats
```http
GET /api/affiliate/stats
Authorization: Bearer <user_token>

Response:
{
  "balance": {
    "totalEarned": 150000,
    "availableBalance": 120000,
    "withdrawnAmount": 30000,
    "minimumBalance": 100000
  },
  "totalTests": 0,
  "totalTokenPurchaseCommissions": 5,
  "history": [
    {
      "id": 1,
      "amount": 5500,
      "status": "pending",
      "source": "token_purchase",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "referredUser": {
        "id": 2,
        "fullname": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### Get Commission Breakdown
```http
GET /api/affiliate/commission-breakdown
Authorization: Bearer <user_token>

Response:
{
  "breakdown": [
    {
      "source": "token_purchase",
      "count": 5,
      "totalAmount": 27500
    }
  ],
  "totalCommissions": 5,
  "totalAmount": 27500
}
```

## Flow Pembayaran dan Komisi

### 1. **User Registration dengan Referral**
```javascript
// Frontend: Saat user register dengan referral code
const registerData = {
  fullname: "John Doe",
  email: "john@example.com",
  password: "password123",
  referralCode: "aff123" // Dari URL parameter ?ref=aff123
};

// Backend akan set parentId berdasarkan referralCode
```

### 2. **Token Purchase Flow**
```javascript
// Frontend: Initiate payment
const paymentData = {
  userId: 2,
  packageId: 1,
  voucherCode: "DISCOUNT10", // optional
  referralCode: "aff123" // optional, untuk tracking
};

// POST /api/xendit/payment
// Response: { paymentUrl: "https://checkout.xendit.co/...", invoiceId: 123 }
```

### 3. **Automatic Commission Calculation**
```javascript
// Backend: Saat payment callback sukses
// 1. Update user tokens
// 2. Hitung komisi otomatis:

const package = await Package.findByPk(packageId);
const pricePerToken = package.price / package.defaultTokenAmount;
const commissionAmount = totalTokens * pricePerToken * (package.commissionRate / 100);

// 3. Buat record komisi
// 4. Update affiliate balance
```

## Contoh Perhitungan Komisi

### Scenario 1: Premium Package
```
Package Details:
- Price: Rp 100,000
- Default Token Amount: 1,000 tokens
- Commission Rate: 5.5%

User Purchase:
- Tokens Purchased: 1,000 tokens

Calculation:
price_per_token = 100,000 / 1,000 = Rp 100 per token
commission = 1,000 × 100 × 0.055 = Rp 5,500
```

### Scenario 2: Basic Package
```
Package Details:
- Price: Rp 50,000
- Default Token Amount: 500 tokens
- Commission Rate: 3.0%

User Purchase:
- Tokens Purchased: 500 tokens

Calculation:
price_per_token = 50,000 / 500 = Rp 100 per token
commission = 500 × 100 × 0.03 = Rp 1,500
```

## Frontend Integration Guide

### 1. **Package Display**
```javascript
// Tampilkan commission rate untuk affiliator
const PackageCard = ({ package, isAffiliate }) => {
  return (
    <div className="package-card">
      <h3>{package.name}</h3>
      <p>Price: Rp {package.price.toLocaleString()}</p>
      <p>Tokens: {package.defaultTokenAmount}</p>
      
      {isAffiliate && (
        <div className="commission-info">
          <p>Commission Rate: {package.commissionRate}%</p>
          <p>Potential Earning: Rp {(package.price * package.commissionRate / 100).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};
```

### 2. **Affiliate Dashboard**
```javascript
// Tampilkan statistik komisi
const AffiliateDashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/affiliate/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setStats);
  }, []);
  
  return (
    <div>
      <h2>Affiliate Dashboard</h2>
      <div className="balance-info">
        <p>Total Earned: Rp {stats?.balance.totalEarned.toLocaleString()}</p>
        <p>Available: Rp {stats?.balance.availableBalance.toLocaleString()}</p>
        <p>Withdrawn: Rp {stats?.balance.withdrawnAmount.toLocaleString()}</p>
      </div>
      
      <div className="commission-history">
        <h3>Recent Commissions</h3>
        {stats?.history.map(commission => (
          <div key={commission.id} className="commission-item">
            <p>Amount: Rp {commission.amount.toLocaleString()}</p>
            <p>From: {commission.referredUser.fullname}</p>
            <p>Date: {new Date(commission.createdAt).toLocaleDateString()}</p>
            <p>Status: {commission.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. **Admin Package Management**
```javascript
// Form untuk create/update package
const PackageForm = ({ package, onSave }) => {
  const [formData, setFormData] = useState({
    name: package?.name || '',
    price: package?.price || 0,
    defaultTokenAmount: package?.defaultTokenAmount || 0,
    commissionRate: package?.commissionRate || 0,
    description: package?.description || ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = package 
      ? `/api/packages/${package.id}` 
      : '/api/packages';
    const method = package ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      const result = await response.json();
      onSave(result);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Package Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="number"
        placeholder="Price (IDR)"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
        required
      />
      
      <input
        type="number"
        placeholder="Default Token Amount"
        value={formData.defaultTokenAmount}
        onChange={(e) => setFormData({...formData, defaultTokenAmount: parseInt(e.target.value)})}
        required
      />
      
      <input
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="Commission Rate (%)"
        value={formData.commissionRate}
        onChange={(e) => setFormData({...formData, commissionRate: parseFloat(e.target.value)})}
        required
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      
      <button type="submit">
        {package ? 'Update' : 'Create'} Package
      </button>
    </form>
  );
};
```

## Error Handling

### Common Error Responses
```javascript
// Invalid commission rate
{
  "error": "Validation error",
  "details": "Commission rate must be between 0 and 100"
}

// Package not found
{
  "error": "Package not found",
  "message": "Package with ID 123 not found"
}

// Unauthorized access
{
  "error": "Unauthorized",
  "message": "Admin access required"
}
```

## Testing

### Test Scenarios
1. **Create package dengan commission rate 5%**
2. **User register dengan referral code**
3. **User beli token dari package tersebut**
4. **Verify komisi masuk ke affiliator**
5. **Check affiliate balance dan history**

### Sample Test Data
```javascript
// Test Package
const testPackage = {
  name: "Test Package",
  price: 100000,
  defaultTokenAmount: 1000,
  commissionRate: 5.0,
  description: "Test package for commission"
};

// Expected Commission
const expectedCommission = 100000 * 0.05 = 5000; // Rp 5,000
```

## Migration Guide

### Database Migration
```bash
# Run migration untuk menambah commission_rate field
node run-migrations.js
```

### Update Existing Packages
```sql
-- Set default commission rate untuk existing packages
UPDATE packages SET commission_rate = 0.00 WHERE commission_rate IS NULL;

-- Set specific commission rate untuk packages tertentu
UPDATE packages SET commission_rate = 5.00 WHERE name = 'Premium Package';
UPDATE packages SET commission_rate = 3.00 WHERE name = 'Basic Package';
```

## Notes

1. **Backward Compatibility**: Existing packages akan memiliki commission rate 0% by default
2. **Performance**: Commission calculation dilakukan saat payment callback, tidak mempengaruhi user experience
3. **Security**: Commission rate hanya bisa diubah oleh admin
4. **Audit Trail**: Semua commission records tersimpan dengan detail lengkap
5. **Flexibility**: Commission rate bisa diatur berbeda untuk setiap package sesuai strategi bisnis

## Support

Jika ada pertanyaan atau issue terkait implementasi, silakan hubungi tim backend atau buat issue di repository ini.