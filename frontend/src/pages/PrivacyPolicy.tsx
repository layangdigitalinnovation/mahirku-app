// src/pages/PrivacyPolicy.tsx
import React from 'react';
import { Lock, Info, Mail } from 'lucide-react';

type PrivacySection = {
  title: string;
  content: string;
};

const privacySections: PrivacySection[] = [
  {
    title: '1. Informasi yang Kami Kumpulkan',
    content: 'Kami mengumpulkan informasi yang Anda berikan secara langsung seperti nama, email, nomor telepon, tanggal lahir, dan golongan darah. Kami juga mengumpulkan data biometrik termasuk sidik jari untuk keperluan analisis Cognitive Style Test sesuai dengan metodologi ilmiah yang kami gunakan.'
  },
  {
    title: '2. Cara Kami Menggunakan Informasi',
    content: 'Informasi yang dikumpulkan digunakan untuk menyediakan layanan tes psikometri, menghasilkan laporan hasil tes yang akurat, memproses pembayaran dan transaksi, mengirimkan notifikasi terkait layanan, serta meningkatkan kualitas platform Mahirku secara berkelanjutan.'
  },
  {
    title: '3. Penyimpanan dan Keamanan Data',
    content: 'Data pribadi Anda disimpan dengan enkripsi menggunakan standar keamanan industri. Kami menerapkan langkah-langkah teknis dan organisasi untuk melindungi data dari akses tidak sah, kehilangan, atau penyalahgunaan. Data biometrik disimpan secara terpisah dan hanya diakses untuk keperluan analisis tes.'
  },
  {
    title: '4. Pembagian Informasi dengan Pihak Ketiga',
    content: 'Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Informasi hanya dibagikan kepada penyedia layanan yang membantu operasional platform (seperti payment gateway) dengan perjanjian kerahasiaan yang ketat, dan hanya jika diwajibkan oleh hukum atau peraturan yang berlaku.'
  },
  {
    title: '5. Cookie dan Teknologi Pelacakan',
    content: 'Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis penggunaan platform, dan menyimpan preferensi Anda. Anda dapat mengatur browser untuk menolak cookie, namun beberapa fitur mungkin tidak berfungsi optimal.'
  },
  {
    title: '6. Hak Privasi Pengguna',
    content: 'Anda memiliki hak untuk mengakses data pribadi yang kami simpan, meminta koreksi atau pembaruan data yang tidak akurat, meminta penghapusan data dalam kondisi tertentu, menolak atau membatasi pemrosesan data, dan menarik persetujuan yang telah diberikan sebelumnya.'
  },
  {
    title: '7. Penyimpanan Data Anak-Anak',
    content: 'Layanan Mahirku dapat digunakan oleh anak-anak dengan persetujuan dan pengawasan orang tua atau wali. Data anak-anak di bawah 18 tahun hanya akan diproses dengan persetujuan eksplisit dari orang tua atau wali yang sah dan dilindungi dengan standar keamanan yang lebih ketat.'
  },
  {
    title: '8. Transfer Data Internasional',
    content: 'Data Anda disimpan di server yang berlokasi di Indonesia. Jika terjadi transfer data ke luar negeri untuk keperluan teknis, kami memastikan bahwa pihak penerima menerapkan standar perlindungan data yang setara dengan peraturan di Indonesia.'
  },
  {
    title: '9. Retensi Data',
    content: 'Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan. Setelah akun dihapus, data akan dihapus dalam waktu 90 hari kecuali kami diwajibkan menyimpannya untuk keperluan hukum, audit, atau penyelesaian sengketa.'
  },
  {
    title: '10. Perubahan Kebijakan Privasi',
    content: 'Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan material akan diberitahukan melalui email atau notifikasi di platform. Kami mendorong Anda untuk meninjau kebijakan ini secara berkala untuk tetap mendapatkan informasi tentang bagaimana kami melindungi data Anda.'
  },
];

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50">
      {/* Header Section */}
      <div className="bg-white pt-24 pb-12 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-full mb-4">
            <Lock className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="text-gray-600 text-base font-medium">
            Privacy Policy
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
                Komitmen Kami terhadap Privasi Anda
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Mahirku menghargai dan menghormati privasi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan,
                menggunakan, menyimpan, dan melindungi informasi pribadi Anda ketika menggunakan platform kami.
                Dengan menggunakan layanan Mahirku, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-4">
          {privacySections.map((section, index) => (
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
            Hubungi Kami
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak privasi Anda,
            silakan hubungi kami di:
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

export default PrivacyPolicy;
