# 📋 Panduan Testing API Mahirku dengan Postman

## 🚀 Cara Import Collection dan Environment

### 1. Import Collection
1. Buka Postman
2. Klik **Import** di pojok kiri atas
3. Pilih file `Mahirku_Complete_API_Collection.postman_collection.json`
4. Klik **Import**

### 2. Import Environment
1. Di Postman, klik **Environments** di sidebar kiri
2. Klik **Import**
3. Pilih file `Mahirku_Environment.postman_environment.json`
4. Klik **Import**
5. Pilih environment **Mahirku Development Environment** di dropdown pojok kanan atas

## 🔧 Setup Awal

### 1. Pastikan Server Backend Berjalan
```bash
cd backend
node node_modules/ts-node/dist/bin.js src/server.ts
```
Server akan berjalan di `http://localhost:5000`

### 2. Variabel Environment
Environment sudah dikonfigurasi dengan variabel berikut:
- `base_url`: http://localhost:5000
- `auth_token`: (akan diisi otomatis setelah login)
- `user_id`: (akan diisi otomatis setelah login)
- `withdraw_id`: (untuk testing withdraw endpoints)
- `package_id`: 1 (default package ID)
- `test_id`: 1 (default test ID)
- `session_id`: (untuk testing session)
- `voucher_code`: DISCOUNT10
- `affiliate_code`: AFFILIATE123

## 📝 Urutan Testing yang Disarankan

### 1. 🔐 Authentication Flow
1. **Register User** - Daftarkan user baru
2. **Login User** - Login dan dapatkan token (token akan tersimpan otomatis)
3. **Get Profile** - Verifikasi profile user

### 2. 👥 User Management
1. **Update Profile** - Update informasi user termasuk data bank
2. **Get All Users (Admin)** - Lihat semua user (perlu role admin)

### 3. 📦 Package Management
1. **Get All Packages** - Lihat semua paket yang tersedia
2. **Create Package (Admin)** - Buat paket baru (perlu role admin)

### 4. 💳 Payment Flow
1. **Create Payment** - Buat pembayaran untuk paket
2. **Payment Callback** - Simulasi callback dari Xendit
3. **Payout Callback** - Simulasi callback payout dari Xendit

### 5. 🤝 Affiliate System
1. **Get Affiliate Dashboard** - Lihat dashboard affiliate
2. **Get Affiliate Commissions** - Lihat komisi yang diterima
3. **Get Referrals** - Lihat daftar referral

### 6. 💰 Withdraw System
1. **Request Withdraw** - Ajukan penarikan dana
2. **Get Withdraw History** - Lihat riwayat penarikan
3. **Get Pending Withdraws (Admin)** - Lihat penarikan pending (admin)
4. **Approve Withdraw (Admin)** - Setujui penarikan (admin)
5. **Reject Withdraw (Admin)** - Tolak penarikan (admin)

### 7. 📝 Testing System
1. **Get All Tests** - Lihat semua tes yang tersedia
2. **Start Test** - Mulai tes
3. **Submit Test Answer** - Kirim jawaban
4. **Complete Test** - Selesaikan tes
5. **Get Test Results** - Lihat hasil tes

### 8. 🛠️ Admin Management
1. **Get All Transactions (Admin)** - Lihat semua transaksi
2. **Get Dashboard Stats (Admin)** - Lihat statistik dashboard

### 9. 🎫 Voucher Management
1. **Get All Vouchers** - Lihat semua voucher
2. **Create Voucher (Admin)** - Buat voucher baru (admin)

## 🔑 Autentikasi

### Token Otomatis
Setelah login berhasil, token akan tersimpan otomatis di environment variable `auth_token` melalui script test yang sudah dikonfigurasi.

### Manual Token Setup
Jika perlu set token manual:
1. Klik **Environments** di sidebar
2. Pilih **Mahirku Development Environment**
3. Isi nilai `auth_token` dengan token yang didapat dari login

## 📊 Response Format

Semua API menggunakan format response standar:
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Untuk error:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    // Error details
  }
}
```

## 🚨 Troubleshooting

### Server Connection Error
- Pastikan server backend berjalan di port 5000
- Cek apakah ada error di terminal server
- Pastikan database PostgreSQL berjalan

### Authentication Error
- Pastikan sudah login dan token tersimpan
- Cek apakah token masih valid (tidak expired)
- Untuk endpoint admin, pastikan user memiliki role admin

### Database Error
- Pastikan migrasi database sudah dijalankan
- Cek koneksi database di file konfigurasi

### Validation Error
- Periksa format data yang dikirim
- Pastikan semua field required sudah diisi
- Cek tipe data sesuai dengan yang diharapkan

## 📋 Checklist Testing

### ✅ Basic Flow
- [ ] Register user baru
- [ ] Login user
- [ ] Get profile
- [ ] Update profile

### ✅ Payment Flow
- [ ] Get packages
- [ ] Create payment
- [ ] Payment callback
- [ ] Verify token balance

### ✅ Affiliate Flow
- [ ] Register dengan affiliate code
- [ ] Check affiliate dashboard
- [ ] Verify commission calculation

### ✅ Withdraw Flow
- [ ] Request withdraw
- [ ] Admin approve/reject
- [ ] Check payout callback
- [ ] Verify balance update

### ✅ Testing Flow
- [ ] Start test
- [ ] Submit answers
- [ ] Complete test
- [ ] Check results
- [ ] Verify commission for affiliate

## 🔧 Kustomisasi

### Mengubah Base URL
Untuk testing di environment lain:
1. Buka **Environments**
2. Edit `base_url` sesuai server target
3. Contoh: `https://api.mahirku.com` untuk production

### Menambah Endpoint Baru
1. Duplicate request yang mirip
2. Ubah method, URL, dan body sesuai kebutuhan
3. Tambahkan ke folder yang sesuai

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek dokumentasi API di `WITHDRAW_SYSTEM_DOCUMENTATION.md`
2. Periksa log server untuk error details
3. Hubungi tim development untuk bantuan lebih lanjut

---

**Happy Testing! 🚀**