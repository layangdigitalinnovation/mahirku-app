#!/bin/bash

# Script ini akan menghapus file backend/XENDIT_PAYOUT_TROUBLESHOOTING.md dari seluruh history git.
# Pastikan Anda sudah backup repo atau clone fresh sebelum menjalankan ini.

echo "Mulai proses pembersihan history..."

# 1. Pastikan repo bersih (stash changes jika ada)
git stash

# 2. Hapus file dari seluruh history
# Menggunakan git filter-branch (native git command)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/XENDIT_PAYOUT_TROUBLESHOOTING.md" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Hapus refs original (backup otomatis dari filter-branch) agar file benar-benar hilang
rm -rf .git/refs/original/

# 4. Cleanup logs dan garbage objects untuk mengecilkan ukuran repo
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "----------------------------------------------------------------"
echo "Cleanup selesai!"
echo "----------------------------------------------------------------"
echo "Langkah selanjutnya:"
echo "1. Cek apakah file benar-benar hilang dengan command:"
echo "   git log --all --full-history -- \"backend/XENDIT_PAYOUT_TROUBLESHOOTING.md\""
echo "   (Seharusnya tidak muncul output apapun)"
echo ""
echo "2. Jika sudah yakin, lakukan force push ke GitHub:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo "----------------------------------------------------------------"
