---
description: Setup Upload Keystore untuk Play Store
---

# Setup Upload Keystore untuk Google Play Store

Workflow ini hanya perlu dilakukan **SATU KALI** seumur hidup aplikasi. Keystore ini adalah identitas digital aplikasi Anda.

## ⚠️ PERINGATAN PENTING

**BACKUP FILE KEYSTORE** setelah dibuat! Jika file ini hilang, Anda **TIDAK AKAN PERNAH BISA** mengupdate aplikasi di Play Store selamanya.

## Langkah-langkah

### 1. Navigate ke Folder Android App

```bash
cd android/app
```

### 2. Generate Keystore

Jalankan command berikut (pastikan Java JDK sudah terinstall):

```bash
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Catatan:**
- Anda bisa mengganti `my-upload-key` dan `my-key-alias` sesuai keinginan
- **CATAT PASSWORD** yang Anda buat!

### 3. Isi Informasi yang Diminta

Command akan meminta informasi:
- Password keystore (minimal 6 karakter)
- Konfirmasi password
- Nama lengkap
- Nama organisasi/perusahaan
- Kota
- Provinsi
- Kode negara (ID untuk Indonesia)

### 4. Verifikasi File Dibuat

Setelah selesai, cek apakah file `my-upload-key.keystore` sudah ada di folder `android/app/`.

```bash
ls my-upload-key.keystore
# atau di Windows
dir my-upload-key.keystore
```

### 5. Update gradle.properties

Buka file `android/gradle.properties` dan ganti password:

```properties
MYAPP_UPLOAD_STORE_PASSWORD=PasswordAndaDiSini
MYAPP_UPLOAD_KEY_PASSWORD=PasswordAndaDiSini
```

**Ganti `PasswordAndaDiSini` dengan password yang Anda buat di step 2.**

### 6. Backup Keystore

**SANGAT PENTING!** Backup file keystore ke:
- ✅ Google Drive
- ✅ Email pribadi
- ✅ USB drive
- ✅ Cloud storage lainnya

❌ **JANGAN:**
- Commit keystore ke Git/GitHub
- Simpan hanya di komputer lokal
- Share password ke orang lain

### 7. Security: Update .gitignore

Pastikan password tidak ter-commit ke Git. Tambahkan ke `.gitignore`:

```
# Keystore files
*.keystore
*.jks

# Don't commit gradle.properties with passwords
android/gradle.properties
```

## Selesai!

Anda sekarang siap untuk build release `.aab` file. Gunakan workflow `build-release.md`.
