// src/pages/PrivacyPolicy.tsx
import React from 'react';

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

    </>
  );
};

export default PrivacyPolicy;
