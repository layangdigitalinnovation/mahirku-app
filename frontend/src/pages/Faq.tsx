// src/pages/Faq.tsx
import React from 'react';

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
    </>
  );
};

export default Faq;