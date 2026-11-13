export interface LandingPageTemplate {
  slug: string;
  title: string;
  description: string;
  category: string;
  themeConfig: Record<string, any>;
  pixelConfig: Record<string, any>;
  sections: any[];
  formConfig: Record<string, any>;
}

export const getWetonKayaTemplate = (): LandingPageTemplate => {
  return {
    slug: 'lp-karakter',
    title: 'Bongkar 8 Karakter & Potensi Keberlimpahan Anda - Mahirku',
    description: 'Kenali pola bawah sadar, blind spot penghambat rezeki, dan jalur karier/bisnis terbaik Anda melalui asesmen psikologi & AI modern.',
    category: 'character-test',
    themeConfig: {
      primaryColor: '#6366F1', // Indigo
      secondaryColor: '#EC4899', // Pink
      accentColor: '#F59E0B', // Amber
      backgroundColor: '#0F172A', // Slate 900 dark theme
      textColor: '#F8FAFC',
      fontFamily: 'Plus Jakarta Sans',
      buttonRadius: 'rounded-xl',
      showUrgencyBar: true,
      urgencyBarText: '🔥 PROMO SPESIAL TERBATAS: Diskon s/d 70% Khusus Hari Ini! Kuota Terbatas.',
      urgencyMinutes: 15,
    },
    pixelConfig: {
      facebookPixelId: '',
      tiktokPixelId: '',
      googleTagId: '',
    },
    formConfig: {
      title: 'Daftar & Checkout Token Tes Karakter',
      subtitle: 'Isi data Anda untuk langsung mendapatkan Token Tes dan membuka akses asesmen instan.',
      ctaButtonText: '🚀 AMBIL TES SEKARANG & LIHAT KARAKTER ANDA',
      guaranteeText: '🔒 Pembayaran Terverifikasi Otomatis (QRIS, VA Bank & E-Wallet). Akses langsung aktif!',
      whatsappAdminNumber: '6281234567890',
      allowGateway: true,
      allowWhatsApp: true,
      fields: {
        fullName: { enabled: true, required: true, label: 'Nama Lengkap' },
        whatsapp: { enabled: true, required: true, label: 'Nomor WhatsApp (Aktif)' },
        email: { enabled: true, required: true, label: 'Alamat Email' },
        birthDate: { enabled: true, required: false, label: 'Tanggal Lahir' },
        gender: { enabled: true, required: false, label: 'Jenis Kelamin' },
        goal: {
          enabled: true,
          required: false,
          label: 'Fokus Pengembangan Utama Anda?',
          options: [
            'Meningkatkan Karier & Promosi',
            'Menemukan Bisnis yang Cocok',
            'Memahami Potensi Diri & Bakat Alami',
            'Mengatasi Hambatan Finansial & Mental Block',
          ],
        },
      },
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          badgeText: '✨ ASESMEN PSIKOLOGI MODERN & AI 2026',
          headline: 'Bongkar Rahasia 8 Karakter & Potensi Keberlimpahan Anda',
          headlineHighlight: '8 Karakter & Potensi Keberlimpahan',
          subheadline:
            'Bukan sekadar weton tradisional—ini asesmen psikologi kepribadian modern berbasis AI untuk membedah blueprint pikiran bawah sadar, blind spot karier, dan magnet rezeki Anda.',
          ctaText: '🔥 AMBIL TES KARAKTER SEKARANG (Diskon 70%)',
          secondaryCtaText: 'Lihat Contoh Laporan 👇',
          statsText: '⭐ 4.9/5 dari 18.500+ Peserta Tes di Seluruh Indonesia',
          ratingCount: '18.500+',
          heroImage:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
          floatingBadges: [
            { text: 'Akurasi Asesmen 96.4%', icon: 'ShieldCheck' },
            { text: 'Laporan 25+ Halaman PDF', icon: 'FileText' },
          ],
        },
      },
      {
        id: 'painPoints',
        type: 'painPoints',
        enabled: true,
        order: 2,
        data: {
          badge: '⚠️ KENAPA BANYAK ORANG MERASA STAGNAN?',
          title: 'Apakah Anda Sering Mengalami 4 Masalah Ini?',
          subtitle:
            'Bekerja keras siang malam tapi merasa hasil tidak sebanding? Masalahnya bukan kurang kerja keras, tapi berada di jalur yang salah.',
          items: [
            {
              icon: 'AlertTriangle',
              title: 'Merasa Terjebak di Jalur Karier yang Salah',
              desc: 'Setiap hari pergi bekerja dengan rasa hampa, menguras energi, dan tidak tahu apa keunggulan kompetitif alami Anda.',
            },
            {
              icon: 'TrendingDown',
              title: 'Penghasilan & Bisnis Mentok',
              desc: 'Sudah mencoba berbagai cara dan peluang, tapi omzet atau pendapatan jalan di tempat karena melanggar tipe karakter alami Anda.',
            },
            {
              icon: 'Brain',
              title: 'Blind Spot & Pola Keputusan Bawah Sadar',
              desc: 'Sering melakukan kesalahan yang sama berulang-ulang tanpa menyadari akar penyebab mental block di alam bawah sadar.',
            },
            {
              icon: 'Compass',
              title: 'Bingung Menentukan Arah Hidup 5 Tahun Kedepan',
              desc: 'Khawatir salah langkah dalam mengambil keputusan besar (pindah kerja, mulai bisnis, atau memilih rekanan).',
            },
          ],
        },
      },
      {
        id: 'characterArchetypes',
        type: 'characterArchetypes',
        enabled: true,
        order: 3,
        data: {
          badge: '🔮 8 BLUEPRINT KARAKTER SUKSES',
          title: 'Kenali 8 Tipe Karakter: Mana yang Merupakan Kekuatan Alami Anda?',
          subtitle:
            'Setiap manusia diciptakan dengan cetak biru yang unik. Sukses tercepat terjadi ketika Anda berjalan di jalur karakter asli Anda:',
          items: [
            {
              name: 'Sang Pencipta (The Creator)',
              badge: 'Inovasi & Kreasi',
              color: '#3B82F6',
              desc: 'Penuh dengan ide segar dan visi masa depan. Sukses melalui penciptaan produk baru dan inovasi, namun butuh tim untuk eksekusi detail.',
            },
            {
              name: 'Sang Bintang (The Star)',
              badge: 'Magnetisme & Panggung',
              color: '#8B5CF6',
              desc: 'Memiliki daya tarik personal branding yang kuat. Jalur rezeki terbaik melalui komunikasi, representasi merek, dan panggung publik.',
            },
            {
              name: 'Sang Negosiator (The Deal Maker)',
              badge: 'Koneksi & Peluang',
              color: '#EC4899',
              desc: 'Sensitif membaca momentum pasar dan menjalin hubungan saling menguntungkan. Sukses sebagai penghubung dan perunding ulung.',
            },
            {
              name: 'Sang Pengelola (The Accumulator)',
              badge: 'Sistem & Ketelitian',
              color: '#10B981',
              desc: 'Sangat disiplin dan cermat membaca data. Jalur kemakmuran terbaik melalui pengelolaan aset yang stabil dan risiko terukur.',
            },
            {
              name: 'Sang Penguasa (The Lord)',
              badge: 'Kontrol & Efisiensi',
              color: '#F59E0B',
              desc: 'Fokus pada angka konkret dan margin keuntungan. Pengendali proses bisnis dan pengoptimalan sumber daya secara maksimal.',
            },
            {
              name: 'Sang Pemikir (The Strategist)',
              badge: 'Analisis & Taktik',
              color: '#6366F1',
              desc: 'Mampu melihat pola tersembunyi dan merumuskan taktik pemecahan masalah kompleks yang tidak disadari orang lain.',
            },
            {
              name: 'Sang Penggerak (The Mobilizer)',
              badge: 'Aksi & Eksekusi',
              color: '#EF4444',
              desc: 'Pemberani, cepat bertindak, dan mampu membakar semangat tim untuk menuntaskan sasaran besar dalam waktu singkat.',
            },
            {
              name: 'Sang Pelindung (The Caretaker)',
              badge: 'Harmoni & Empati',
              color: '#14B8A6',
              desc: 'Menjaga kepuasan stakeholder dan relasi jangka panjang. Rezeki mengalir deras lewat loyalitas jaringan dan pelayanan prima.',
            },
          ],
        },
      },
      {
        id: 'benefits',
        type: 'benefits',
        enabled: true,
        order: 4,
        data: {
          badge: '📊 LAPORAN KOMPREHENSIF',
          title: 'Apa Saja yang Akan Anda Dapatkan di Laporan Lengkap?',
          subtitle:
            'Bukan sekadar kuis umum—Anda akan menerima dokumen asesmen 25+ halaman yang disusun khusus untuk Anda:',
          items: [
            {
              icon: 'FileText',
              title: 'Profil Karakter Utama & Sekunder',
              desc: 'Penjelasan mendalam mengenai kepribadian dominan, motif bawah sadar, dan cara Anda memproses informasi.',
            },
            {
              icon: 'Target',
              title: 'Kompas Karier & Peta Bisnis Terbaik',
              desc: 'Daftar profesi, industri, dan model bisnis yang 3x lebih cepat mendatangkan hasil sesuai karakter Anda.',
            },
            {
              icon: 'ShieldAlert',
              title: 'Bedah Blind Spot & Mental Block',
              desc: 'Deteksi dini jebakan psikologis yang sering membuat Anda rugi, gagal fokus, atau kehabisan energi.',
            },
            {
              icon: 'Compass',
              title: 'Action Plan 30 Hari Pertama',
              desc: 'Langkah praktis yang dapat langsung Anda terapkan untuk mulai mengoptimalkan magnet rezeki Anda.',
            },
            {
              icon: 'Zap',
              title: 'Akses Instan & Fleksibel',
              desc: 'Kerjakan tes kapan saja lewat smartphone dalam 10-15 menit. Hasil instan langsung keluar!',
            },
            {
              icon: 'Award',
              title: 'Sertifikat Digital Mahirku',
              desc: 'Sertifikat resmi tanda verifikasi asesmen yang dapat diverifikasi keasliannya.',
            },
          ],
        },
      },
      {
        id: 'orderForm',
        type: 'orderForm',
        enabled: true,
        order: 5,
        data: {
          badge: '⚡ AMBIL PROMO HARI INI',
          title: 'Formulir Pemesanan Token & Akses Instan',
          subtitle:
            'Pilih paket token di bawah, isi formulir dengan benar, dan dapatkan akses langsung ke asesmen Mahirku.',
          packageSelectorTitle: 'Pilih Paket Token Asesmen:',
          packages: [
            {
              id: 1,
              name: 'Paket 1 Token (Personal)',
              tokens: 1,
              originalPrice: 165000,
              price: 49000,
              badge: 'Paling Hemat',
              isPopular: false,
              features: [
                '1x Akses Tes Lengkap Karakter',
                'Laporan 25+ Halaman Format PDF',
                'Akses Selamanya & Hasil Instan',
              ],
            },
            {
              id: 2,
              name: 'Paket 3 Token (Best Value)',
              tokens: 3,
              originalPrice: 495000,
              price: 99000,
              badge: 'Paling Laris 🔥',
              isPopular: true,
              features: [
                '3x Akses Tes (Bisa untuk Pasangan/Partner)',
                '3 Laporan Lengkap Terpisah',
                'Analisis Komparasi Pasangan/Tim',
                'Hemat 80% Khusus Hari Ini',
              ],
            },
            {
              id: 3,
              name: 'Paket 5 Token (Family & Tim)',
              tokens: 5,
              originalPrice: 825000,
              price: 149000,
              badge: 'Super Hemat',
              isPopular: false,
              features: [
                '5x Akses Tes Lengkap',
                'Ideal untuk Keluarga / Tim Bisnis',
                'Prioritas Support WhatsApp',
                'Bonus Panduan Sinergi Karakter',
              ],
            },
          ],
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        enabled: true,
        order: 6,
        data: {
          badge: '💬 BUKTI NYATA',
          title: 'Apa Kata Mereka yang Telah Mengikuti Tes?',
          subtitle: 'Pengalaman nyata dari ribuan peserta yang telah menemukan jalur potensinya:',
          items: [
            {
              name: 'Hendra Wijaya',
              role: 'Pengusaha Kuliner (32 Tahun)',
              rating: 5,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              comment:
                'Dulu saya maksain diri ngurusin pencatatan keuangan padahal karakter saya Sang Pencipta. Setelah ikut tes ini, saya serahkan keuangan ke Sang Pengelola dan fokus di pengembangan menu. Omzet naik 3x lipat dalam 4 bulan!',
            },
            {
              name: 'Siska Anggraini',
              role: 'Marketing Executive (27 Tahun)',
              rating: 5,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              comment:
                'Laporannya sangat detail dan ga nyangka bisa seakurat ini. Terutama bagian blind spot yang ngebuka mata saya kenapa selama ini gampang burned out. Recommended banget buat yang lagi galau karir.',
            },
            {
              name: 'Rian Prasetyo',
              role: 'Freelancer & Content Creator (25 Tahun)',
              rating: 5,
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
              comment:
                'Checkout-nya gampang banget langsung bayar pake QRIS, token langsung aktif dan bisa tes dari HP. Penjelasannya mudah dipahami dan aplikatif!',
            },
          ],
        },
      },
      {
        id: 'faq',
        type: 'faq',
        enabled: true,
        order: 7,
        data: {
          badge: '❓ TANYA JAWAB',
          title: 'Pertanyaan yang Sering Diajukan (FAQ)',
          subtitle: 'Berikut jawaban untuk pertanyaan yang paling sering ditanyakan oleh calon peserta:',
          items: [
            {
              question: 'Apakah ini sama dengan weton ramalan kelahiran tradisional?',
              answer:
                'Bukan. Ini adalah tes psikologi modern berbasis teori kepribadian dan teknologi AI Mahirku. Dinamakan Weton Karakter karena memetakan cetak biru alami (blueprint) manusia, namun metodologinya 100% ilmiah dan berbasis psikometri perilaku.',
            },
            {
              question: 'Berapa lama waktu untuk menyelesaikan tes?',
              answer:
                'Hanya sekitar 10-15 menit. Anda dapat mengerjakannya santai di smartphone Anda kapan saja.',
            },
            {
              question: 'Kapan hasil dan laporan keluar?',
              answer:
                'Hasil analisis AI langsung keluar seketika begitu Anda selesai menjawab kuis. Anda juga dapat mengunduh laporan PDF lengkap untuk disimpan seumur hidup.',
            },
            {
              question: 'Bagaimana cara pembelian dan pembayaran token?',
              answer:
                'Sangat mudah! Anda cukup mengisi formulir di atas, memilih paket, lalu membayar via QRIS (GoPay, OVO, ShopeePay, Dana), Virtual Account bank, atau lewat WhatsApp.',
            },
            {
              question: 'Apakah token ada masa kedaluwarsanya?',
              answer:
                'Tidak ada masa kadaluarsa! Token berlaku seumur hidup dan bisa digunakan kapan saja atau diberikan kepada orang lain.',
            },
          ],
        },
      },
      {
        id: 'stickyMobileCta',
        type: 'stickyMobileCta',
        enabled: true,
        order: 8,
        data: {
          text: '🔥 Ambil Tes Karakter Sekarang',
          subtext: 'Diskon 70% Khusus Hari Ini',
          buttonText: 'Daftar Sekarang 👉',
        },
      },
    ],
  };
};

export const getDiscTemplate = (): LandingPageTemplate => {
  return {
    slug: 'lp-disc',
    title: 'Tes Kepribadian DISC & Pemetaan Talenta Karier - Mahirku',
    description: 'Kenali profil kepribadian DISC Anda untuk peningkatan performa kerja, kepemimpinan, dan komunikasi efektif.',
    category: 'disc-test',
    themeConfig: {
      primaryColor: '#0284C7', // Sky 600
      secondaryColor: '#4F46E5', // Indigo 600
      accentColor: '#10B981', // Emerald 500
      backgroundColor: '#0F172A',
      textColor: '#F8FAFC',
      fontFamily: 'Inter',
      buttonRadius: 'rounded-xl',
      showUrgencyBar: true,
      urgencyBarText: '⚡ Penawaran Khusus DISC Assessment Mahirku - Akses Instan',
      urgencyMinutes: 20,
    },
    pixelConfig: {
      facebookPixelId: '',
      tiktokPixelId: '',
      googleTagId: '',
    },
    formConfig: {
      title: 'Checkout Token DISC Test',
      subtitle: 'Dapatkan token asesmen DISC resmi dengan laporan kepribadian lengkap.',
      ctaButtonText: 'DAPATKAN TOKEN DISC TEST SEKARANG',
      guaranteeText: '🔒 Standar Asesmen Psikometri Internasional Mahirku',
      whatsappAdminNumber: '6281234567890',
      allowGateway: true,
      allowWhatsApp: true,
      fields: {
        fullName: { enabled: true, required: true, label: 'Nama Lengkap' },
        whatsapp: { enabled: true, required: true, label: 'Nomor WhatsApp' },
        email: { enabled: true, required: true, label: 'Alamat Email' },
        birthDate: { enabled: false, required: false, label: 'Tanggal Lahir' },
        gender: { enabled: false, required: false, label: 'Jenis Kelamin' },
      },
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          badgeText: '💼 ASESMEN STANDAR PERUSAHAAN GLOBAL',
          headline: 'Pahami Gaya Komunikasi & Kepemimpinan Anda dengan DISC',
          headlineHighlight: 'Gaya Komunikasi & Kepemimpinan',
          subheadline:
            'Ketahui apakah profil Anda Dominance, Influence, Steadiness, atau Compliance. Dapatkan peta perilaku kerja untuk melesatkan karier Anda.',
          ctaText: 'MULAI TES DISC SEKARANG',
          secondaryCtaText: 'Pelajari Manfaat DISC',
          statsText: '⭐ Digunakan oleh 50+ Tim dan Ribuan Profesional',
          ratingCount: '12.000+',
          heroImage:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          floatingBadges: [
            { text: 'Profil 4 Kuadran Lengkap', icon: 'CheckCircle' },
            { text: 'Rekomendasi Gaya Kerja', icon: 'Award' },
          ],
        },
      },
      {
        id: 'orderForm',
        type: 'orderForm',
        enabled: true,
        order: 2,
        data: {
          badge: '⚡ PAKET TOKEN DISC',
          title: 'Formulir Pembelian Token DISC',
          subtitle: 'Pilih paket token yang Anda butuhkan di bawah ini:',
          packageSelectorTitle: 'Pilihan Paket:',
          packages: [
            {
              id: 1,
              name: 'Paket 1 Token DISC',
              tokens: 1,
              originalPrice: 150000,
              price: 49000,
              badge: 'Personal',
              isPopular: false,
              features: ['1x Tes DISC Lengkap', 'Grafik 3 Profil DISC', 'Laporan PDF Lengkap'],
            },
            {
              id: 2,
              name: 'Paket 3 Token DISC (Tim Kecil)',
              tokens: 3,
              originalPrice: 450000,
              price: 99000,
              badge: 'Paling Populer',
              isPopular: true,
              features: ['3x Tes DISC', 'Laporan Individu & Tim', 'Hemat Biaya Asesmen'],
            },
          ],
        },
      },
    ],
  };
};

export const getBlankTemplate = (): LandingPageTemplate => {
  return {
    slug: 'lp-baru',
    title: 'Halaman Penawaran Baru - Mahirku',
    description: 'Deskripsi halaman penawaran baru.',
    category: 'general',
    themeConfig: {
      primaryColor: '#4F46E5',
      secondaryColor: '#06B6D4',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1E293B',
      fontFamily: 'Plus Jakarta Sans',
      buttonRadius: 'rounded-lg',
      showUrgencyBar: false,
      urgencyBarText: 'Promo Khusus Terbatas!',
      urgencyMinutes: 15,
    },
    pixelConfig: {
      facebookPixelId: '',
      tiktokPixelId: '',
      googleTagId: '',
    },
    formConfig: {
      title: 'Formulir Pemesanan',
      subtitle: 'Silakan isi data untuk menyelesaikan pesanan Anda.',
      ctaButtonText: 'Lanjutkan Pemesanan',
      guaranteeText: 'Pembayaran Aman & Terpercaya',
      whatsappAdminNumber: '6281234567890',
      allowGateway: true,
      allowWhatsApp: true,
      fields: {
        fullName: { enabled: true, required: true, label: 'Nama Lengkap' },
        whatsapp: { enabled: true, required: true, label: 'Nomor WhatsApp' },
        email: { enabled: true, required: true, label: 'Email' },
      },
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          badgeText: 'PENAWARAN SPESIAL',
          headline: 'Judul Penawaran Menarik Anda Di Sini',
          headlineHighlight: 'Judul Penawaran Menarik',
          subheadline: 'Tuliskan penjelasan singkat mengenai manfaat utama produk atau layanan Anda di sini.',
          ctaText: 'Pesan Sekarang',
          secondaryCtaText: 'Info Lebih Lanjut',
          statsText: 'Telah dipercaya oleh banyak pengguna',
          ratingCount: '1.000+',
          heroImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          floatingBadges: [{ text: 'Kualitas Terjamin', icon: 'CheckCircle' }],
        },
      },
      {
        id: 'orderForm',
        type: 'orderForm',
        enabled: true,
        order: 2,
        data: {
          badge: 'FORMULIR ORDER',
          title: 'Formulir Pemesanan Token',
          subtitle: 'Pilih paket dan isi data diri Anda.',
          packageSelectorTitle: 'Pilihan Paket Token:',
          packages: [
            {
              id: 1,
              name: 'Paket Basic (1 Token)',
              tokens: 1,
              originalPrice: 100000,
              price: 50000,
              badge: 'Hemat',
              isPopular: true,
              features: ['1 Token Tes', 'Akses Penuh', 'Laporan Lengkap'],
            },
          ],
        },
      },
    ],
  };
};

