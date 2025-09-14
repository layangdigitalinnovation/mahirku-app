// src/pages/Contact.tsx
import React from "react";
import { Button } from "../components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-secondary-100 font-body text-white py-40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-heading1 text-primary-900 font-bold mb-4 font-heading">
            Hubungi Kami
          </h1>
          <p className="text-heading5 text-primary-100">
            Ada pertanyaan atau ingin bekerjasama? Kami siap membantu Anda.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 bg-gray-50 font-body">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Informasi Kontak */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              Informasi Kontak
            </h2>
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 font-heading">
              Kirim Pesan
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email aktif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan
                </label>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-600 text-white w-full hover:bg-blue-700"
              >
                Kirim Pesan
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
