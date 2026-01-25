---
description: Build Release AAB untuk Play Store
---

# Build Release AAB untuk Google Play Store

Workflow ini digunakan setiap kali Anda ingin membuat file `.aab` untuk diupload ke Play Store.

## Prerequisites

✅ Upload keystore sudah dibuat (lihat `keystore-setup.md`)
✅ Password sudah diisi di `android/gradle.properties`

## Langkah-langkah

### 1. Update Version (Wajib untuk Update Aplikasi)

Buka file `android/app/build.gradle`, cari bagian `defaultConfig`:

```gradle
defaultConfig {
    applicationId 'com.mahirku.app'  // JANGAN PERNAH DIUBAH!
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    
    versionCode 1        // ← TAMBAH ANGKA INI untuk update (2, 3, 4, dst)
    versionName "1.0.0"  // ← Ubah sesuai keinginan ("1.1.0", "2.0.0", dst)
}
```

**Aturan:**
- **versionCode**: HARUS integer dan HARUS lebih besar dari versi sebelumnya
- **versionName**: Bebas, ini yang dilihat user (misal "1.0.0", "1.1.0", "2.0.0")
- **applicationId**: JANGAN PERNAH DIUBAH selamanya!

**Contoh Update:**
- Rilis pertama: `versionCode 1`, `versionName "1.0.0"`
- Update bug fix: `versionCode 2`, `versionName "1.0.1"`
- Update fitur baru: `versionCode 3`, `versionName "1.1.0"`
- Update major: `versionCode 4`, `versionName "2.0.0"`

### 2. Clean Previous Build

Bersihkan build sebelumnya untuk memastikan build fresh:

// turbo-all
```bash
cd android
```

```bash
./gradlew clean
```

**Note:** Di Windows gunakan `gradlew` tanpa `./`

### 3. Build Release Bundle

Generate file `.aab`:

```bash
./gradlew bundleRelease
```

**Note:** Di Windows gunakan `gradlew bundleRelease`

Proses ini akan memakan waktu 2-5 menit tergantung spesifikasi komputer.

### 4. Verifikasi Build Success

Setelah build selesai, cek output:

```bash
cd app/build/outputs/bundle/release
ls -lh app-release.aab
```

**Di Windows:**
```bash
cd app\build\outputs\bundle\release
dir app-release.aab
```

File `.aab` siap diupload ke Google Play Console!

### 5. Lokasi File AAB

File yang siap diupload ada di:
```
mobile/android/app/build/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### Error: "Keystore file not found"

**Solusi:** Pastikan file `my-upload-key.keystore` ada di folder `android/app/`

### Error: "Keystore password was incorrect"

**Solusi:** Cek password di `android/gradle.properties`, pastikan sama dengan password saat membuat keystore

### Error: "versionCode has already been used"

**Solusi:** Tambah angka `versionCode` di `build.gradle`. Google Play tidak mengizinkan upload dengan versionCode yang sama atau lebih kecil.

### Build Berhasil tapi File Tidak Ada

**Solusi:** Cek folder output lengkap: `android/app/build/outputs/bundle/release/`

## Next Steps

1. ✅ Upload `app-release.aab` ke Google Play Console
2. ✅ Isi informasi aplikasi (deskripsi, screenshots, dll)
3. ✅ Submit untuk review
4. ✅ Tunggu persetujuan Google (biasanya 1-3 hari)

## Tips

- **Simpan setiap file .aab** yang pernah Anda upload sebagai backup
- **Catat versionCode** setiap rilis untuk tracking
- **Test di internal/closed testing** dulu sebelum production release
