// src/pages/PrivacyPolicy.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-600 mb-10 text-center">Kebijakan Privasi</h1>
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 text-gray-700 leading-relaxed">
            <p>Mahirku menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.</p>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Informasi yang Dikumpulkan</h2>
              <p>Kami mengumpulkan informasi seperti nama, email, sidik jari, dan foto wajah saat Anda menggunakan layanan kami.</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Penggunaan Informasi</h2>
              <p>Informasi digunakan untuk keperluan asesmen, pengiriman hasil, dan peningkatan layanan Mahirku.</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">3. Perlindungan Data</h2>
              <p>Kami menggunakan protokol keamanan untuk melindungi data Anda dari akses tidak sah.</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">4. Hak Pengguna</h2>
              <p>Anda berhak mengakses, memperbarui, atau meminta penghapusan data Anda dengan menghubungi kami.</p>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default PrivacyPolicy;
