// src/pages/Faq.tsx
import React, { useState } from 'react';
import { Search, X, ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const faqItems: FAQItem[] = [
  {
    category: 'Umum',
    question: 'Apa itu Mahirku?',
    answer: 'Mahirku adalah platform psikometri digital yang menyediakan berbagai tes untuk membantu Anda memahami gaya berpikir, kepribadian, dan potensi diri. Kami menggunakan metodologi ilmiah dan teknologi sidik jari untuk memberikan hasil yang akurat dan personal.'
  },
  {
    category: 'Umum',
    question: 'Tes apa saja yang tersedia?',
    answer: 'Saat ini Mahirku menyediakan Cognitive Style Test (CST) yang menganalisis gaya berpikir Anda dan DISC Test untuk profil kepribadian. Setiap tes dirancang untuk memberikan insight mendalam tentang karakteristik unik Anda.'
  },
  {
    category: 'Token',
    question: 'Bagaimana cara membeli token?',
    answer: 'Anda dapat membeli token melalui menu Token Packages di aplikasi. Pilih paket yang sesuai, masukkan kode voucher jika ada, lalu lanjutkan ke pembayaran. Kami menerima berbagai metode pembayaran melalui Xendit.'
  },
  {
    category: 'Token',
    question: 'Apakah token bisa dikembalikan?',
    answer: 'Token yang sudah dibeli bersifat non-refundable. Namun, jika terjadi kesalahan teknis atau masalah pembayaran, silakan hubungi tim support kami dan kami akan membantu menyelesaikan masalahnya.'
  },
  {
    category: 'Token',
    question: 'Berapa lama masa berlaku token?',
    answer: 'Token yang Anda beli tidak memiliki masa kadaluarsa. Anda dapat menggunakan token kapan saja untuk melakukan tes tanpa batas waktu.'
  },
  {
    category: 'Test',
    question: 'Bagaimana cara melakukan Cognitive Style Test?',
    answer: 'Pilih Cognitive Style Test dari dashboard, isi data diri (tanggal lahir dan golongan darah), lalu lakukan verifikasi sidik jari. Anda juga dapat mengisi kuesioner tambahan untuk hasil yang lebih akurat. Tes akan menganalisis pola sidik jari dan jawaban Anda.'
  },
  {
    category: 'Test',
    question: 'Mengapa harus menggunakan sidik jari?',
    answer: 'Sidik jari mengandung pola unik yang dapat memberikan insight tentang karakteristik kognitif seseorang. Teknologi kami menganalisis pola ini dengan metode ilmiah untuk memberikan hasil yang lebih personal dan akurat.'
  },
  {
    category: 'Test',
    question: 'Apakah hasil tes akurat?',
    answer: 'Hasil tes kami didasarkan pada metodologi yang telah teruji secara ilmiah. Namun, hasil tes bersifat informatif dan sebaiknya digunakan sebagai panduan pengembangan diri, bukan satu-satunya penentu dalam pengambilan keputusan penting.'
  },
  {
    category: 'Test',
    question: 'Bisakah saya mengulang tes?',
    answer: 'Ya, Anda dapat mengulang tes kapan saja dengan menggunakan token. Namun untuk hasil yang konsisten, disarankan ada jarak waktu yang cukup antar tes karena hasil tes mencerminkan kondisi Anda saat tes dilakukan.'
  },
  {
    category: 'Akun',
    question: 'Bagaimana cara mengubah profil?',
    answer: 'Buka menu Profile, pilih Edit Profile, lalu ubah informasi yang diperlukan seperti nama, email, atau nomor telepon. Klik Save Changes untuk menyimpan perubahan.'
  },
  {
    category: 'Akun',
    question: 'Apakah data saya aman?',
    answer: 'Keamanan data Anda adalah prioritas kami. Semua data pribadi dan hasil tes disimpan dengan enkripsi dan hanya dapat diakses oleh Anda. Kami tidak akan membagikan informasi Anda kepada pihak ketiga tanpa persetujuan.'
  },
  {
    category: 'Sertifikat',
    question: 'Bagaimana cara download sertifikat?',
    answer: 'Setelah menyelesaikan tes, buka menu Reports, pilih hasil tes yang ingin Anda download, lalu klik tombol Download Sertifikat. Sertifikat akan tersimpan di perangkat Anda dalam format PDF.'
  },
  {
    category: 'Afiliasi',
    question: 'Apa itu program afiliasi?',
    answer: 'Program afiliasi Mahirku memungkinkan Anda mendapatkan komisi dengan mengajak orang lain bergabung. Bagikan link referral Anda dan dapatkan reward setiap kali ada yang mendaftar atau melakukan pembelian melalui link Anda.'
  },
  {
    category: 'Afiliasi',
    question: 'Bagaimana cara withdraw komisi?',
    answer: 'Buka dashboard Affiliator, pilih menu Withdraw, masukkan nominal dan detail rekening bank, lalu submit permintaan. Tim kami akan memproses withdrawal Anda dalam 1-3 hari kerja.'
  },
];

const FAQAccordionItem: React.FC<{
  question: string;
  answer: string;
  category: string;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ question, answer, category, isExpanded, onToggle }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 mb-3 border transition-all duration-300 cursor-pointer ${isExpanded
        ? 'border-indigo-200 bg-indigo-50/30 shadow-md'
        : 'border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100'
        }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              {category}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 leading-relaxed">
            {question}
          </h3>
        </div>
        <div
          className={`shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
            }`}
        >
          <ChevronDown className="w-4 h-4 text-indigo-600" />
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const Faq: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFAQs = faqItems.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqItems.map((faq) => faq.category)));

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50">
      {/* Header Section */}
      <div className="bg-white pt-24 pb-12 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-full mb-4">
              <HelpCircle className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
              FAQ
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Pertanyaan yang Sering Ditanyakan
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-700 placeholder-gray-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {categories.map((category) => {
          const categoryFAQs = filteredFAQs.filter((faq) => faq.category === category);
          if (categoryFAQs.length === 0) return null;

          return (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                  {category}
                </h2>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">
                  {categoryFAQs.length}
                </span>
              </div>

              {categoryFAQs.map((faq) => {
                const globalIndex = faqItems.indexOf(faq);
                return (
                  <FAQAccordionItem
                    key={globalIndex}
                    question={faq.question}
                    answer={faq.answer}
                    category={faq.category}
                    isExpanded={expandedIndex === globalIndex}
                    onToggle={() => setExpandedIndex(expandedIndex === globalIndex ? null : globalIndex)}
                  />
                );
              })}
            </div>
          );
        })}

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ditemukan</h3>
            <p className="text-gray-500">
              Coba kata kunci lain atau hubungi support kami
            </p>
          </div>
        )}

        {/* Support Card */}
        <div className="mt-12 bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 text-center border border-blue-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Masih ada pertanyaan?
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Tim support kami siap membantu Anda.<br />
            Hubungi kami di:
          </p>
          <a
            href="mailto:layanggroup@gmail.com"
            className="inline-block text-lg font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            layanggroup@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Faq;