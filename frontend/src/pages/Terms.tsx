// src/pages/Terms.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Heading */}
      <div className="pt-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-10">Syarat & Ketentuan</h1>
      </div>

      {/* Content */}
      <main className="flex-grow px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-10">
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Dengan menggunakan layanan Mahirku, Anda setuju dengan syarat & ketentuan berikut:
            </p>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Penggunaan Layanan</h2>
              <p>Layanan hanya boleh digunakan oleh individu dengan informasi yang benar dan sah.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Pembayaran</h2>
              <p>Semua pembayaran bersifat final. Tidak ada pengembalian dana kecuali layanan tidak tersedia.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">3. Hak Kekayaan Intelektual</h2>
              <p>Seluruh konten dan laporan adalah milik Mahirku dan tidak boleh didistribusikan tanpa izin.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">4. Perubahan Layanan</h2>
              <p>Mahirku berhak mengubah layanan kapan saja dengan pemberitahuan di website.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo & Intro */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Mahirku</h3>
              <p className="text-gray-400 text-sm">
                Platform tes minat bakat dan gaya berpikir berbasis biometrik & numerologi untuk individu, keluarga, dan perusahaan.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Menu</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Beranda</Link></li>
                <li><Link to="/register" className="hover:text-white">Daftar</Link></li>
                <li><Link to="/contact" className="hover:text-white">Kontak</Link></li>
              </ul>
            </div>

            {/* Bantuan */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Bantuan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Kebijakan Privasi</Link></li>
                <li><Link to="/terms" className="hover:text-white">Syarat & Ketentuan</Link></li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Hubungi Kami</h4>
              <p className="text-sm text-gray-400">Alamat: Jl. Siliwangi No.54, Kota Tasikmalaya</p>
              <p className="text-sm text-gray-400">Email: layanggroup@gmail.com</p>
              <p className="text-sm text-gray-400">WhatsApp: +62 857-5995-7956</p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Mahirku. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
