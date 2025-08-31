// src/pages/Terms.tsx
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Heading */}
      <div className="pt-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-10">Syarat & Ketentuan</h1>
      </div>

      {/* Content */}
      <section className="flex-grow px-6 pb-20">
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
      </section>
    </div>
  );
};

export default Terms;
