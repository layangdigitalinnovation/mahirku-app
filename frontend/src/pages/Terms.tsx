// src/pages/Terms.tsx
import React from 'react';
import { Shield, Info, Mail } from 'lucide-react';

type TermSection = {
  title: string;
  content: string;
};

const termSections: TermSection[] = [
  {
    title: '1. Penerimaan Syarat',
    content: 'Dengan mengakses dan menggunakan platform Mahirku, Anda menyetujui untuk terikat oleh syarat dan ketentuan penggunaan ini. Jika Anda tidak setuju dengan salah satu ketentuan ini, harap tidak menggunakan layanan kami.'
  },
  {
    title: '2. Penggunaan Layanan',
    content: 'Mahirku menyediakan platform untuk melakukan berbagai tes psikometri termasuk Cognitive Style Test dan DISC Test. Layanan ini ditujukan untuk pengembangan diri dan tidak menggantikan konsultasi profesional.'
  },
  {
    title: '3. Akun Pengguna',
    content: 'Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Setiap aktivitas yang terjadi di bawah akun Anda menjadi tanggung jawab Anda sepenuhnya. Segera laporkan jika terjadi penggunaan tidak sah.'
  },
  {
    title: '4. Privasi Data',
    content: 'Kami berkomitmen untuk melindungi privasi Anda. Data pribadi dan hasil tes Anda disimpan dengan aman dan hanya digunakan sesuai kebijakan privasi kami. Kami tidak akan membagikan informasi pribadi Anda tanpa persetujuan.'
  },
  {
    title: '5. Token dan Pembayaran',
    content: 'Pembelian token bersifat final dan non-refundable kecuali dalam kondisi tertentu yang kami tentukan. Token digunakan untuk mengakses tes dan fitur premium. Harga token dapat berubah sewaktu-waktu.'
  },
  {
    title: '6. Kekayaan Intelektual',
    content: 'Semua konten, termasuk namun tidak terbatas pada teks, grafik, logo, dan perangkat lunak adalah milik Mahirku dan dilindungi oleh hukum kekayaan intelektual yang berlaku.'
  },
  {
    title: '7. Batasan Tanggung Jawab',
    content: 'Mahirku tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan. Hasil tes bersifat informatif dan tidak menjamin hasil tertentu dalam kehidupan profesional atau pribadi.'
  },
  {
    title: '8. Perubahan Syarat',
    content: 'Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui platform dan email terdaftar. Penggunaan berkelanjutan setelah perubahan dianggap sebagai penerimaan terhadap syarat yang diperbarui.'
  },
  {
    title: '9. Penghentian Layanan',
    content: 'Kami berhak menangguhkan atau menghentikan akses Anda jika terjadi pelanggaran terhadap syarat penggunaan, penyalahgunaan layanan, atau alasan lain yang kami anggap perlu untuk menjaga integritas platform.'
  },
  {
    title: '10. Hukum yang Berlaku',
    content: 'Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui pengadilan yang berwenang di Indonesia.'
  },
];

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50">
      {/* Header Section */}
      <div className="bg-white pt-24 pb-12 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-full mb-4">
            <Shield className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            Syarat & Ketentuan
          </h1>
          <p className="text-gray-600 text-base font-medium">
            Terms of Use
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Informasi Penting
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Harap baca syarat dan ketentuan berikut dengan seksama sebelum menggunakan layanan Mahirku.
                Penggunaan platform kami menandakan persetujuan Anda terhadap seluruh ketentuan yang tercantum.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4">
          {termSections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <span className="text-base font-extrabold text-indigo-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Footer Card */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-4">
            <Mail className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Butuh Bantuan?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami di:
          </p>
          <a
            href="mailto:layanggroup@gmail.com"
            className="inline-block text-base font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            layanggroup@gmail.com
          </a>
        </div>

        {/* Last Updated */}
        <p className="text-center text-xs text-gray-400 italic mt-6">
          Terakhir diperbarui: 1 Januari 2026
        </p>
      </div>
    </div>
  );
};

export default Terms;
