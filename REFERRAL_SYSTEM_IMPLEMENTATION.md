# Implementasi Sistem Referral Berbasis Cookie

## Overview
Sistem referral telah diubah dari sistem `parentId` menjadi sistem berbasis cookie dengan kode referral.

## Cara Kerja

### 1. Pembuatan Link Referral
- Setiap affiliator mendapatkan link referral dengan format: `https://mahirku.com/?ref=aff{userId}`
- Contoh: User dengan ID 9 akan mendapat link `https://mahirku.com/?ref=aff9`

### 2. Penyimpanan Cookie
- Ketika user mengklik link referral, middleware `referralMiddleware` akan:
  - Mendeteksi parameter `ref` di URL
  - Memvalidasi format referral code (harus `aff` + angka)
  - Menyimpan cookie `mahirku_referral` dengan value referral code
  - Cookie berlaku selama 30 hari

### 3. Registrasi User
- Saat registrasi, sistem akan:
  - Membaca cookie `mahirku_referral`
  - Mengekstrak user ID dari referral code
  - Memverifikasi bahwa referrer adalah affiliator (roleId = 2)
  - Menyimpan referrer sebagai `parentId` di user baru
  - Menghapus cookie setelah registrasi berhasil

### 4. Komisi Pembelian Token
- Saat callback pembayaran berhasil, sistem akan:
  - Membaca cookie `mahirku_referral` dari request
  - Mengekstrak user ID dari referral code
  - Mencari affiliator berdasarkan ID tersebut
  - Menghitung dan menambahkan komisi jika affiliator valid

## File yang Dimodifikasi

### 1. `xenditController.ts`
- Mengubah logika komisi dari `user.parentId` menjadi pembacaan cookie
- Menambahkan validasi affiliator berdasarkan roleId

### 2. `authController.ts` (sudah ada)
- Menggunakan `getReferralFromCookie()` untuk membaca referral
- Menggunakan `clearReferralCookie()` setelah registrasi

### 3. `referralMiddleware.ts` (sudah ada)
- Middleware untuk menangani parameter `ref` dan menyimpan cookie
- Helper functions untuk membaca dan menghapus cookie

## Keuntungan Sistem Baru

1. **Fleksibilitas**: User tidak perlu langsung registrasi saat mengklik link
2. **Tracking**: Cookie bertahan 30 hari, memberikan waktu lebih untuk konversi
3. **Keamanan**: Validasi format referral code dan verifikasi affiliator
4. **Debugging**: Log yang jelas untuk setiap tahap proses

## Testing

Untuk testing sistem:

1. Buat link referral: `GET /api/affiliate/referral-link`
2. Kunjungi link dengan parameter `?ref=aff{userId}`
3. Cek cookie `mahirku_referral` di browser
4. Lakukan registrasi dan pembelian token
5. Verifikasi komisi tercatat di database

## Catatan Penting

- Cookie `mahirku_referral` harus dapat dibaca oleh backend
- Pastikan `cookie-parser` middleware sudah terpasang
- Sistem fallback: jika cookie tidak ada, tidak ada komisi (tidak error)
- Log yang komprehensif untuk debugging