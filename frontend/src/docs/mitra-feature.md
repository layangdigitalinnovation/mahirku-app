---
title: Fitur Mitra
description: Dokumentasi teknis dan alur bisnis fitur Mitra pada Mahirku Platform
---

# Dokumentasi Fitur Mitra – Mahirku Platform

Dokumentasi ini menjelaskan implementasi teknis dan alur bisnis dari fitur **Mitra** di Mahirku Platform.  
Fitur ini memungkinkan pengguna dengan role **Mitra** untuk membangun jaringan afiliasi dan memperoleh komisi bertingkat (*override commission*).

---

## 1. Overview

Fitur Mitra dirancang untuk menciptakan struktur pemasaran bertingkat yang sederhana dan terkontrol:

- **Mitra**  
  Pengguna level atas yang dapat merekrut member di bawahnya.
- **Affiliator**  
  Member yang telah menyelesaikan tes (*Thinking Style* / *DISC*) dan berhak menyebarkan kode referral.
- **End User**  
  Pengguna yang mendaftar melalui link Affiliator dan membeli token.

### Key Benefits

- **Mitra**  
  Mendapatkan komisi pasif dari penjualan yang dilakukan oleh Affiliator di bawahnya.
- **Affiliator**  
  Mendapatkan komisi langsung dari penjualan token ke End User.
- **Platform**  
  Memperluas jangkauan pemasaran melalui jaringan Mitra.

---

## 2. Struktur Role & Hirarki

| Role | ID | Deskripsi |
| --- | --- | --- |
| **Super Admin** | 1 | Administrator sistem, mengatur persentase komisi Mitra |
| **Affiliator** | 2 | Pengguna yang bisa membagikan referral link |
| **User** | 3 | Pengguna biasa / member baru yang belum tes |
| **Mitra** | 4 | Role khusus dengan dashboard monitoring member & komisi |

### Hubungan Database (ERD Snippet)

- **Users**
  - Memiliki kolom `parentId` (self-referencing FK ke `users.id`)
  - Jika User A direkrut Mitra B → `UserA.parentId = MitraB.id`
- **Packages**
  - Memiliki kolom `mitraCommissionRate`
  - Menentukan persentase komisi Mitra per paket

---

## 3. Alur Bisnis (Business Flows)

### A. Akuisisi Member (Mitra → Member)

1. Mitra login ke **Mitra Dashboard**
2. Masuk ke menu **Members**
3. Klik **Add Member** dan mengisi form
4. Sistem membuat user baru dengan:
   - Role: `User` (ID: 3)
   - `parentId`: ID Mitra

### B. Upgrade Member ke Affiliator

1. Member login sebagai `User`
2. Member membeli token (jika diperlukan)
3. Member menyelesaikan tes **Thinking Style** atau **DISC**
4. Sistem otomatis mengecek:
   - User memiliki `parentId`
   - Role masih `User`
5. Jika valid → role di-upgrade menjadi `Affiliator` (ID: 2)
6. User dapat mengakses fitur Affiliator & referral link

### C. Promosi Manual ke Affiliator (Mitra → Member)

1. Mitra login ke **Mitra Dashboard**
2. Masuk ke menu **Members**
3. Pada tabel member, cari member dengan status `User`
4. Klik tombol aksi **Jadikan Affiliator**
5. Sistem memverifikasi validitas member
6. Role member diupdate menjadi `Affiliator` (ID: 2)

### D. Upgrade Affiliator ke Mitra (Self-Promotion)

Fitur ini memungkinkan Affiliator untuk naik level menjadi Mitra secara mandiri jika memenuhi syarat.

1. **Syarat Kelayakan**:
   - Memiliki minimal **1 member** (downline) yang sudah berstatus **Affiliator**.
   - User (Parent) telah menyelesaikan tes (**Thinking Style** atau **DISC**) secara pribadi.
2. **Proses**:
   - Sistem secara otomatis mengecek kelayakan setiap kali Affiliator membuka dashboard.
   - Jika memenuhi syarat, **Banner Upgrade Mitra** akan muncul di dashboard.
   - User mengklik tombol "Upgrade ke Mitra Sekarang".
   - Sistem memverifikasi ulang syarat (Status Member Child & Status Tes Parent).
   - Jika valid, role user berubah menjadi **Mitra** (ID: 4).
   - User diarahkan ke Mitra Dashboard.

### E. Alur Komisi (Commission Flow)

Saat **End User** membeli token melalui referral **Affiliator** (di bawah Mitra):

1. End User membeli paket (contoh: Rp 100.000)
2. **Komisi Affiliator**
   - Rumus: `Harga Paket × Package.commissionRate`
   - Contoh: `100.000 × 10% = Rp 10.000`
3. **Komisi Mitra (Override)**
   - Rumus: `Harga Paket × Package.mitraCommissionRate`
   - Contoh: `100.000 × 5% = Rp 5.000`
4. Data komisi dicatat di:
   - `AffiliateCommissions`
   - Saldo diperbarui di `AffiliateBalances`

---

## 4. Implementasi Backend

### Perubahan Database

- **roles**
  - Menambahkan role `mitra`
- **packages**
  - Menambahkan kolom `mitraCommissionRate` (DECIMAL)
- **users**
  - Memanfaatkan `parentId` untuk hirarki Mitra

### API Endpoints

#### Mitra Management
Base URL: `/api/mitra`

| Method | Endpoint | Deskripsi | Access |
| --- | --- | --- | --- |
| GET | `/dashboard` | Statistik Mitra (member & komisi) | Mitra |
| GET | `/members` | Daftar member & status afiliasi | Mitra |
| POST | `/members` | Menambah member baru | Mitra |
| POST | `/members/:id/promote` | Promosi member ke Affiliator | Mitra |

#### Affiliator Upgrade
Base URL: `/api/affiliate`

| Method | Endpoint | Deskripsi | Access |
| --- | --- | --- | --- |
| GET | `/check-mitra-eligibility` | Cek kelayakan upgrade ke Mitra | Affiliator |
| POST | `/upgrade-mitra` | Proses upgrade role ke Mitra | Affiliator |

### File Penting

- `src/utils/affiliateUtils.ts`  
  Perhitungan komisi Mitra & Affiliator
- `src/controllers/mitraController.ts`  
  Logic dashboard dan manajemen member
- `src/controllers/affiliateController.ts`
  Logic check eligibility & upgrade mitra
- `src/middlewares/roleMiddleware.ts`  
  Middleware `isMitra`

---

## 5. Implementasi Frontend

### Mitra Dashboard

- **Layout**
  - Dashboard standar dengan sidebar khusus Mitra
- **Overview**
  - Total member
  - Total komisi
- **Members**
  - Tabel member
  - Status: `User` vs `Affiliator`
  - Total kontribusi komisi
  - Form **Add Member**
  - Tombol aksi **Jadikan Affiliator**

### Affiliator Dashboard (Enhancement)

- **Upgrade Mitra Banner**
  - Muncul secara kondisional jika user eligible.
  - Menampilkan tombol aksi untuk upgrade instan ke Mitra.

### Admin Panel

- **Package Management**
  - Admin dapat mengatur **Mitra Commission Rate (%)**

---

## 6. Cara Penggunaan (User Guide)

### Setup Awal (Admin)

1. Login sebagai **Super Admin**
2. Masuk ke **Paket Token**
3. Atur **Mitra Commission Rate**
4. Buat user dan assign role **Mitra**

### Penggunaan (Mitra)

1. Login sebagai Mitra
2. Pantau performa di Dashboard
3. Tambahkan member melalui menu **Members**
4. Arahkan member untuk menyelesaikan tes

### Upgrade ke Mitra (Affiliator)

1. Pastikan Anda (Affiliator) sudah menyelesaikan tes (Thinking Style / DISC).
2. Pastikan minimal satu member referral Anda telah menjadi Affiliator.
3. Buka Dashboard Affiliator.
4. Klik tombol **Upgrade ke Mitra Sekarang** pada banner notifikasi.

---

## 7. Catatan Teknis

- Komisi Mitra dihitung dari **harga paket**, bukan komisi Affiliator
- Komisi hanya tercatat jika status pembayaran `paid`
- Upgrade role otomatis terjadi di controller tes
- Upgrade Mitra manual memvalidasi: `child.roleId == 2` AND (`parent.hasThinkingStyleResult` OR `parent.hasDiscResult`)
