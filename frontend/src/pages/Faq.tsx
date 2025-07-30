// src/pages/Faq.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const faqItems = [
  {
    question: 'Apa itu Mahirku?',
    answer: 'Mahirku adalah platform asesmen berbasis biometrik dan numerologi untuk menggali gaya berpikir dan potensi diri.'
  },
  {
    question: 'Bagaimana cara kerja tes di Mahirku?',
    answer: 'Kami menggunakan analisis sidik jari dan face recognition untuk menghasilkan laporan gaya berpikir yang akurat.'
  },
  {
    question: 'Berapa lama hasil tes keluar?',
    answer: 'Biasanya hasil tersedia dalam 2-3 menit setelah pengambilan data biometrik.'
  },
  {
    question: 'Apakah hasil bisa digunakan untuk menentukan karier?',
    answer: 'Ya, hasil kami mencakup rekomendasi karier yang sesuai dengan gaya berpikir Anda.'
  },
  {
    question: 'Apakah layanan tersedia offline?',
    answer: 'Ya, kami menyediakan tes offline untuk kelompok (keluarga atau institusi).'
  }
];

const Faq: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-600 mb-12 text-center">Pertanyaan yang Sering Diajukan (FAQ)</h1>
          <div className="space-y-8">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{faq.question}</h2>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
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

export default Faq;