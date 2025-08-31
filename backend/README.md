# Mahirku Backend

## Konfigurasi Database

Proyek ini menggunakan PostgreSQL sebagai database. Sebelum menjalankan migrasi, pastikan Anda telah mengatur file `.env` dengan informasi koneksi database yang benar:

```
DB_USER=username_database
DB_PASS=password_database
DB_NAME=nama_database
DB_HOST=localhost
```

## Migrasi Database

Proyek ini menggunakan Sequelize sebagai ORM (Object-Relational Mapping) dan Sequelize CLI untuk mengelola migrasi database.

### Menjalankan Migrasi

Untuk menjalankan migrasi dan membuat struktur tabel di database:

```bash
npm run migrate
```

Perintah ini akan menjalankan semua file migrasi yang belum dijalankan di direktori `src/migrations`.

### Membatalkan Migrasi

Untuk membatalkan migrasi terakhir:

```bash
npm run migrate:undo
```

Untuk membatalkan semua migrasi:

```bash
npm run migrate:undo:all
```

## Seed Data

Untuk mengisi database dengan data awal (seed):

```bash
npm run seed
```

Untuk membatalkan seed terakhir:

```bash
npm run seed:undo
```

Untuk membatalkan semua seed:

```bash
npm run seed:undo:all
```

## Membuat File Migrasi Baru

Untuk membuat file migrasi baru:

```bash
npx sequelize-cli migration:generate --name nama-migrasi
```

Contoh:

```bash
npx sequelize-cli migration:generate --name add-column-to-users
```

File migrasi baru akan dibuat di direktori `src/migrations` dengan format nama `YYYYMMDDHHMMSS-nama-migrasi.js`.

## Membuat Model dan Migrasi Sekaligus

Untuk membuat model dan file migrasi sekaligus:

```bash
npx sequelize-cli model:generate --name NamaModel --attributes atribut1:tipe,atribut2:tipe
```

Contoh:

```bash
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string
```

Perintah ini akan membuat file model di direktori `src/models` dan file migrasi di direktori `src/migrations`.

## Membuat Seed Data

Untuk membuat file seed baru:

```bash
npx sequelize-cli seed:generate --name nama-seed
```

Contoh:

```bash
npx sequelize-cli seed:generate --name demo-users
```

File seed baru akan dibuat di direktori `src/seeders`.