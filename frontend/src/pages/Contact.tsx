// src/pages/Contact.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-lg text-blue-100">
            Ada pertanyaan atau ingin bekerjasama? Kami siap membantu Anda.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Informasi Kontak */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Informasi Kontak</h2>
            <p className="text-gray-600 text-lg">
              Kami terbuka untuk pertanyaan, saran, atau kebutuhan khusus.
            </p>
            <div className="space-y-5 text-gray-700">
              <div className="flex items-start gap-4">
                <MapPin className="text-blue-600 w-6 h-6 mt-1" />
                <span>Jl. Siliwangi No.54, Kota Tasikmalaya</span>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="text-blue-600 w-6 h-6 mt-1" />
                <span>layanggroup@gmail.com</span>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-blue-600 w-6 h-6 mt-1" />
                <span>+62 857-5995-7956 (WhatsApp)</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Kirim Pesan</h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email aktif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>
              <Button type="submit" className="bg-blue-600 text-white w-full hover:bg-blue-700">
                Kirim Pesan
              </Button>
            </form>
          </div>
        </div>
      </section>

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

export default Contact;
