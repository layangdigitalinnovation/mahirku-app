import type React from 'react';
import {
  LandingPageThemeConfig,
  SectionBlock,
  SectionType,
  CustomFormField,
  CustomFieldType,
} from '@/types/landingPage';

export interface ParsedVideoEmbed {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'vimeo' | 'direct' | 'unknown';
  platformLabel: string;
  embedUrl: string;
  isVertical: boolean;
  warning?: string;
}

/**
 * Parse URL video dari YouTube, TikTok, Instagram Reels/Post, Facebook, Vimeo, atau MP4 langsung
 */
export function parseVideoEmbed(rawUrl?: string): ParsedVideoEmbed | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.trim();

  // Direct video file (.mp4, .webm, .mov, atau file hasil upload lokal)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('/uploads/landing-pages/')) {
    return {
      platform: 'direct',
      platformLabel: 'Video File (MP4)',
      embedUrl: url,
      isVertical: false,
    };
  }

  // YouTube (watch?v=, youtu.be/, shorts/, embed/, live/)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const isShorts = /youtube\.com\/shorts\//i.test(url);
    return {
      platform: 'youtube',
      platformLabel: isShorts ? 'YouTube Shorts' : 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      isVertical: isShorts,
    };
  }

  // TikTok (tiktok.com/@user/video/1234567890123456789 or /embed/v2/12345...)
  const ttMatch = url.match(/tiktok\.com\/(?:@[^/]+\/video\/|embed\/v2\/)(\d+)/i);
  if (ttMatch && ttMatch[1]) {
    return {
      platform: 'tiktok',
      platformLabel: 'TikTok',
      embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`,
      isVertical: true,
    };
  }
  if (/tiktok\.com/i.test(url)) {
    return {
      platform: 'tiktok',
      platformLabel: 'TikTok',
      embedUrl: url,
      isVertical: true,
      warning:
        'Link pendek TikTok (vt.tiktok.com/vm.tiktok.com) tidak memiliki ID video. Buka link tersebut di browser lalu salin URL lengkap (format: tiktok.com/@username/video/12345...).',
    };
  }

  // Instagram (instagram.com/reel/CODE, /reels/CODE, /p/CODE, /tv/CODE)
  const igMatch = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const isReel = /\/(reel|reels|tv)\//i.test(url);
    const segment = isReel ? 'reel' : 'p';
    return {
      platform: 'instagram',
      platformLabel: isReel ? 'Instagram Reels' : 'Instagram Post',
      embedUrl: `https://www.instagram.com/${segment}/${igMatch[1]}/embed`,
      isVertical: isReel,
    };
  }

  // Vimeo (vimeo.com/12345678)
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      platform: 'vimeo',
      platformLabel: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      isVertical: false,
    };
  }

  // Facebook Video / Reels
  if (/facebook\.com|fb\.watch/i.test(url)) {
    const isReel = /\/reel\//i.test(url);
    return {
      platform: 'facebook',
      platformLabel: isReel ? 'Facebook Reels' : 'Facebook Video',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=false&width=560`,
      isVertical: isReel,
    };
  }

  return {
    platform: 'unknown',
    platformLabel: 'Embed URL',
    embedUrl: url,
    isVertical: false,
  };
}

export interface SectionCatalogItem {
  type: SectionType;
  icon: string;
  label: string;
  description: string;
  category: 'media' | 'sales' | 'conversion';
}

export const SECTION_CATALOG: SectionCatalogItem[] = [
  {
    type: 'video',
    icon: '🎥',
    label: 'Video Sosmed & MP4',
    description: 'Embed video YouTube, TikTok, Instagram Reels, Facebook, Vimeo, atau upload MP4.',
    category: 'media',
  },
  {
    type: 'mediaContent',
    icon: '🖼️',
    label: 'Gambar & Konten Bebas',
    description: 'Blok gambar custom (upload/URL) dengan judul, paragraf narasi, poin & tombol CTA.',
    category: 'media',
  },
  {
    type: 'gallery',
    icon: '📸',
    label: 'Galeri / Bukti Gambar',
    description: 'Tampilkan beberapa foto, screenshot chat WA, atau contoh hasil laporan asesmen.',
    category: 'media',
  },
  {
    type: 'hero',
    icon: '🌟',
    label: 'Hero Banner',
    description: 'Headline utama hook iklan, badge atas, gambar/video hero, dan tombol CTA utama.',
    category: 'sales',
  },
  {
    type: 'painPoints',
    icon: '⚠️',
    label: 'Masalah & Agitasi',
    description: 'Daftar problem yang dialami target audiens sebelum menggunakan solusi Anda.',
    category: 'sales',
  },
  {
    type: 'characterArchetypes',
    icon: '🔮',
    label: 'Daftar Kartu / Karakter',
    description: 'Grid kartu menarik (8 karakter WetonKaya, tipe kepribadian, modul produk, dll).',
    category: 'sales',
  },
  {
    type: 'benefits',
    icon: '📊',
    label: 'Laporan & Manfaat',
    description: 'Penjelasan fitur unggulan dan manfaat yang didapat peserta setelah order.',
    category: 'sales',
  },
  {
    type: 'testimonials',
    icon: '💬',
    label: 'Testimoni Peserta',
    description: 'Ulasan pelanggan lengkap dengan foto avatar, bintang rating, dan bukti screenshot.',
    category: 'sales',
  },
  {
    type: 'faq',
    icon: '❓',
    label: 'FAQ (Tanya Jawab)',
    description: 'Pertanyaan yang sering diajukan dalam bentuk akordeon yang bisa diklik.',
    category: 'sales',
  },
  {
    type: 'ctaBanner',
    icon: '🔥',
    label: 'Banner CTA Penawaran',
    description: 'Kotak ajakan bertindak (Call to Action) dengan gambar/warna mencolok menuju form.',
    category: 'conversion',
  },
  {
    type: 'orderForm',
    icon: '📝',
    label: 'Formulir & Checkout',
    description: 'Formulir pemesanan paket DB otomatis, pilihan voucher, dan pembayaran otomatis / WA.',
    category: 'conversion',
  },
  {
    type: 'stickyMobileCta',
    icon: '📱',
    label: 'Sticky Mobile Button',
    description: 'Tombol melayang di bagian bawah layar HP yang selalu siap diklik pengunjung.',
    category: 'conversion',
  },
];

export function getDefaultSectionLabel(section: SectionBlock): string {
  if (section.title && section.title.trim()) return section.title;
  const resolvedType = (section.type || section.id) as SectionType;
  const found = SECTION_CATALOG.find((c) => c.type === resolvedType);
  if (found) return `${found.icon} ${found.label}`;
  return section.id;
}

export function createDefaultSection(type: SectionType, order: number): SectionBlock {
  const uniqueId = `${type}-${Date.now()}`;

  switch (type) {
    case 'video':
      return {
        id: uniqueId,
        type: 'video',
        title: '🎥 Video Penjelasan Produk',
        enabled: true,
        order,
        data: {
          badge: '🎬 TONTON VIDEO SINGKAT INI',
          title: 'Lihat Bagaimana Asesmen Ini Mengubah Banyak Orang',
          subtitle: 'Simak penjelasan lengkapnya dalam video berdurasi singkat berikut ini.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          aspectRatio: 'auto',
          caption: 'Klik tombol play untuk mendengarkan penjelasannya.',
          ctaText: 'SAYA MAU IKUT TES SEKARANG 👉',
          showCta: true,
        },
      };

    case 'mediaContent':
      return {
        id: uniqueId,
        type: 'mediaContent',
        title: '🖼️ Konten & Gambar Custom',
        enabled: true,
        order,
        data: {
          badge: '✨ KEUNGGULAN UTAMA',
          title: 'Kenapa Harus Memahami Potensi Diri Sejak Dini?',
          content:
            'Banyak orang menghabiskan bertahun-tahun di bidang yang kurang cocok dengan karakter alaminya. Dengan pemetaan yang tepat, Anda bisa mengambil keputusan karier, bisnis, dan finansial dengan jauh lebih percaya diri.',
          imageUrl:
            'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
          layout: 'image-top',
          bullets: [
            'Analisis mendalam berbasis psikometri & AI modern',
            'Bahasa ringan dan mudah langsung dipraktikkan',
            'Akses instan dari HP kapan saja tanpa aplikasi tambahan',
          ],
          ctaText: 'PELAJARI & PESAN TOKEN 👉',
          showCta: false,
        },
      };

    case 'gallery':
      return {
        id: uniqueId,
        type: 'gallery',
        title: '📸 Galeri & Bukti Nyata',
        enabled: true,
        order,
        data: {
          badge: '📸 DOKUMENTASI & CONTOH HASIL',
          title: 'Intip Tampilan Laporan & Antusiasme Peserta',
          subtitle: 'Berikut beberapa cuplikan hasil laporan PDF dan respon peserta.',
          columns: 2,
          items: [
            {
              imageUrl:
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
              caption: 'Grafik Pemetaan Potensi Lengkap',
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
              caption: 'Rekomendasi Jalur Karier & Bisnis',
            },
          ],
        },
      };

    case 'hero':
      return {
        id: uniqueId,
        type: 'hero',
        title: '🌟 Hero Banner',
        enabled: true,
        order,
        data: {
          badgeText: '✨ PENAWARAN SPESIAL HARI INI',
          headline: 'Temukan Jalur Potensi Terbaik & Blueprint Sukses Anda',
          subheadline:
            'Asesmen modern untuk memahami kekuatan alami, blind spot penghambat, dan langkah aksi strategis Anda dalam hitungan menit.',
          ctaText: '🔥 AMBIL TES SEKARANG',
          statsText: '⭐ 4.9/5 dari 18.500+ Peserta di Indonesia',
          heroImage:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
          heroVideoUrl: '',
        },
      };

    case 'painPoints':
      return {
        id: uniqueId,
        type: 'painPoints',
        title: '⚠️ Masalah & Agitasi',
        enabled: true,
        order,
        data: {
          badge: '⚠️ PERNAH MERASAKAN HAL INI?',
          title: 'Apakah Anda Sering Mengalami Kendala Ini?',
          subtitle: 'Masalahnya seringkali bukan kurang berusaha, tapi kurang tepat arah.',
          items: [
            {
              title: 'Merasa Energi Terkuras di Jalur yang Salah',
              desc: 'Sudah bekerja keras setiap hari tetapi hasil terasa jalan di tempat.',
            },
            {
              title: 'Bingung Menentukan Fokus Bisnis / Karier',
              desc: 'Terlalu banyak mencoba hal baru tanpa tahu keunggulan alami diri sendiri.',
            },
          ],
        },
      };

    case 'characterArchetypes':
      return {
        id: uniqueId,
        type: 'characterArchetypes',
        title: '🔮 Daftar Kartu / Karakter',
        enabled: true,
        order,
        data: {
          badge: '🔮 KENALI POTENSI ANDA',
          title: 'Profil Karakter & Kekuatan Alami',
          subtitle: 'Setiap tipe memiliki jalur keberhasilan yang berbeda-beda:',
          items: [
            {
              name: 'Sang Pencipta (The Creator)',
              badge: 'Inovasi & Visi',
              color: '#3B82F6',
              desc: 'Kuat dalam mencetuskan ide baru dan membangun konsep masa depan.',
              imageUrl: '',
            },
            {
              name: 'Sang Penggerak (The Mobilizer)',
              badge: 'Aksi & Eksekusi',
              color: '#F59E0B',
              desc: 'Cepat mengambil tindakan dan mampu menggerakkan tim menuju target.',
              imageUrl: '',
            },
          ],
        },
      };

    case 'benefits':
      return {
        id: uniqueId,
        type: 'benefits',
        title: '📊 Laporan & Manfaat',
        enabled: true,
        order,
        data: {
          badge: '📊 APA YANG ANDA DAPATKAN?',
          title: 'Manfaat & Isi Laporan Asesmen Lengkap',
          subtitle: 'Semua disusun praktis agar bisa langsung Anda terapkan.',
          imageUrl: '',
          items: [
            {
              title: 'Analisis Potensi Dominan',
              desc: 'Memahami kekuatan inti dan gaya berpikir alami Anda.',
            },
            {
              title: 'Rekomendasi Karier & Bisnis',
              desc: 'Daftar bidang yang paling selaras dengan tipe karakter Anda.',
            },
          ],
        },
      };

    case 'testimonials':
      return {
        id: uniqueId,
        type: 'testimonials',
        title: '💬 Testimoni Peserta',
        enabled: true,
        order,
        data: {
          badge: '💬 BUKTI NYATA PESERTA',
          title: 'Apa Kata Mereka Setelah Mengikuti Tes Ini?',
          subtitle: 'Ribuan peserta telah terbantu menemukan arah terbaiknya.',
          items: [
            {
              name: 'Rizky Pratama',
              role: 'Pengusaha Kuliner, Bandung',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              rating: 5,
              comment: 'Penjelasannya sangat kena dan detail! Sekarang saya jauh lebih yakin mengambil keputusan bisnis.',
              proofImageUrl: '',
            },
          ],
        },
      };

    case 'faq':
      return {
        id: uniqueId,
        type: 'faq',
        title: '❓ FAQ (Tanya Jawab)',
        enabled: true,
        order,
        data: {
          badge: '❓ TANYA JAWAB',
          title: 'Pertanyaan yang Sering Diajukan',
          subtitle: 'Jawaban singkat untuk membantu Anda sebelum memulai.',
          items: [
            {
              question: 'Berapa lama proses pengerjaan tesnya?',
              answer: 'Sekitar 10-15 menit dari HP Anda, dan hasilnya langsung keluar otomatis.',
            },
          ],
        },
      };

    case 'ctaBanner':
      return {
        id: uniqueId,
        type: 'ctaBanner',
        title: '🔥 Banner CTA Penawaran',
        enabled: true,
        order,
        data: {
          badge: '⏳ KUOTA PROMO TERBATAS',
          title: 'Jangan Tunda Lagi — Kenali Peta Potensi Anda Hari Ini!',
          subtitle: 'Klaim voucher diskon yang masih tersedia sebelum promo ditutup.',
          imageUrl: '',
          ctaText: '🚀 KLAIM PROMO & PESAN SEKARANG',
        },
      };

    case 'orderForm':
      return {
        id: uniqueId,
        type: 'orderForm',
        title: '📝 Formulir & Checkout',
        enabled: true,
        order,
        data: {
          badge: '⚡ AMBIL PROMO HARI INI',
          title: 'Formulir Pemesanan Token & Akses Instan',
          subtitle: 'Pilih paket token di bawah, lengkapi data, dan akses langsung terbuka otomatis.',
        },
      };

    case 'stickyMobileCta':
      return {
        id: uniqueId,
        type: 'stickyMobileCta',
        title: '📱 Sticky Mobile Button',
        enabled: true,
        order,
        data: {
          buttonText: 'Ambil Tes Sekarang 👉',
          subtext: 'Diskon Terbatas Hari Ini!',
        },
      };

    default:
      return {
        id: uniqueId,
        type: 'mediaContent',
        title: '✨ Bagian Custom',
        enabled: true,
        order,
        data: {
          badge: '✨ INFO',
          title: 'Judul Bagian Custom',
          content: 'Isi konten landing page Anda di sini.',
          imageUrl: '',
          layout: 'image-top',
          bullets: [],
          ctaText: 'LANJUTKAN',
          showCta: false,
        },
      };
  }
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: Partial<LandingPageThemeConfig>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dark-luxury',
    name: 'Dark Luxury Gold',
    description: 'Elegan gelap dengan aksen emas/amber yang kuat untuk iklan konversi tinggi',
    config: {
      backgroundColor: '#0F172A',
      cardBackgroundColor: '#1E293B',
      cardBorderColor: '#334155',
      textColor: '#F8FAFC',
      mutedTextColor: '#94A3B8',
      primaryColor: '#6366F1',
      secondaryColor: '#EC4899',
      accentColor: '#F59E0B',
      buttonTextColor: '#0F172A',
      urgencyBarBgFrom: '#D97706',
      urgencyBarBgTo: '#E11D48',
      urgencyBarTextColor: '#FFFFFF',
    },
  },
  {
    id: 'clean-light',
    name: 'Clean Modern Light',
    description: 'Tema terang bersih dan profesional seperti SaaS / formulir modern',
    config: {
      backgroundColor: '#F8FAFC',
      cardBackgroundColor: '#FFFFFF',
      cardBorderColor: '#E2E8F0',
      textColor: '#0F172A',
      mutedTextColor: '#475569',
      primaryColor: '#4F46E5',
      secondaryColor: '#0EA5E9',
      accentColor: '#4F46E5',
      buttonTextColor: '#FFFFFF',
      urgencyBarBgFrom: '#4F46E5',
      urgencyBarBgTo: '#7C3AED',
      urgencyBarTextColor: '#FFFFFF',
    },
  },
  {
    id: 'emerald-wealth',
    name: 'Emerald Prosperity',
    description: 'Hijau zamrud berwibawa, cocok untuk tema finansial, rezeki & bisnis',
    config: {
      backgroundColor: '#022C22',
      cardBackgroundColor: '#064E3B',
      cardBorderColor: '#065F46',
      textColor: '#ECFDF5',
      mutedTextColor: '#A7F3D0',
      primaryColor: '#10B981',
      secondaryColor: '#FBBF24',
      accentColor: '#F59E0B',
      buttonTextColor: '#022C22',
      urgencyBarBgFrom: '#059669',
      urgencyBarBgTo: '#0D9488',
      urgencyBarTextColor: '#FFFFFF',
    },
  },
  {
    id: 'tiktok-rose',
    name: 'Viral Ads Rose',
    description: 'Kontras tinggi magenta & ungu untuk menarik perhatian pengguna TikTok/IG Ads',
    config: {
      backgroundColor: '#180B29',
      cardBackgroundColor: '#271242',
      cardBorderColor: '#4C1D95',
      textColor: '#FAF5FF',
      mutedTextColor: '#D8B4FE',
      primaryColor: '#A855F7',
      secondaryColor: '#EC4899',
      accentColor: '#F43F5E',
      buttonTextColor: '#FFFFFF',
      urgencyBarBgFrom: '#EC4899',
      urgencyBarBgTo: '#8B5CF6',
      urgencyBarTextColor: '#FFFFFF',
    },
  },
  {
    id: 'warm-cream',
    name: 'Warm Editorial Cream',
    description: 'Nuansa krem hangat & coklat marun lembut, nyaman dibaca untuk copywriting panjang',
    config: {
      backgroundColor: '#FFFBEB',
      cardBackgroundColor: '#FFFFFF',
      cardBorderColor: '#FDE68A',
      textColor: '#292524',
      mutedTextColor: '#57534E',
      primaryColor: '#B45309',
      secondaryColor: '#D97706',
      accentColor: '#D97706',
      buttonTextColor: '#FFFFFF',
      urgencyBarBgFrom: '#B45309',
      urgencyBarBgTo: '#DC2626',
      urgencyBarTextColor: '#FFFFFF',
    },
  },
];

export function resolveTheme(theme?: LandingPageThemeConfig) {
  const bg = theme?.backgroundColor || '#0F172A';
  const isLightBg = isColorLight(bg);
  const cardBg =
    theme?.cardBackgroundColor || (isLightBg ? '#FFFFFF' : 'rgba(255,255,255,0.05)');
  const isLightCard = isColorLight(
    cardBg.startsWith('#') || cardBg.startsWith('rgb')
      ? cardBg
      : isLightBg
      ? '#FFFFFF'
      : '#1E293B'
  );

  return {
    primaryColor: theme?.primaryColor || '#6366F1',
    secondaryColor: theme?.secondaryColor || '#EC4899',
    accentColor: theme?.accentColor || '#F59E0B',
    buttonTextColor: theme?.buttonTextColor || (isLightBg ? '#FFFFFF' : '#0F172A'),
    backgroundColor: bg,
    cardBackgroundColor:
      theme?.cardBackgroundColor || (isLightBg ? '#FFFFFF' : 'rgba(255,255,255,0.05)'),
    cardBorderColor:
      theme?.cardBorderColor || (isLightBg ? '#E2E8F0' : 'rgba(255,255,255,0.12)'),
    textColor: theme?.textColor || (isLightBg ? '#0F172A' : '#F8FAFC'),
    mutedTextColor: theme?.mutedTextColor || (isLightBg ? '#475569' : '#94A3B8'),
    fontFamily: theme?.fontFamily || 'Plus Jakarta Sans',
    buttonRadius: theme?.buttonRadius || 'rounded-2xl',
    cardRadius: theme?.cardRadius || 'rounded-2xl',
    backgroundPattern: theme?.backgroundPattern || 'none',
    sectionSpacing: theme?.sectionSpacing || 'normal',
    showUrgencyBar: theme?.showUrgencyBar !== false,
    urgencyBarText:
      theme?.urgencyBarText || '🔥 PROMO SPESIAL TERBATAS: Diskon Khusus Hari Ini!',
    urgencyMinutes: theme?.urgencyMinutes || 15,
    urgencyBarBgFrom: theme?.urgencyBarBgFrom || '#D97706',
    urgencyBarBgTo: theme?.urgencyBarBgTo || '#E11D48',
    urgencyBarTextColor: theme?.urgencyBarTextColor || '#FFFFFF',
    headerLogoUrl: theme?.headerLogoUrl || '',
    footerText:
      theme?.footerText || '© 2026 Mahirku. Hak Cipta Dilindungi Undang-Undang.',
    isLightBg,
    isLightCard,
  };
}

function isColorLight(colorStr: string): boolean {
  if (!colorStr) return false;
  if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
    }
  }
  const clean = colorStr.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return false;
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export function getBackgroundPatternStyle(
  theme: ReturnType<typeof resolveTheme>
): React.CSSProperties {
  if (theme.backgroundPattern === 'dots') {
    const dotColor = theme.isLightBg ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)';
    return {
      backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    };
  }
  if (theme.backgroundPattern === 'grid') {
    const lineColor = theme.isLightBg ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.05)';
    return {
      backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
      backgroundSize: '28px 28px',
    };
  }
  if (theme.backgroundPattern === 'radial-glow') {
    return {
      backgroundImage: `radial-gradient(circle at 50% 0%, ${theme.primaryColor}25 0%, transparent 55%)`,
    };
  }
  return {};
}

export const CUSTOM_FIELD_PRESETS: Array<{
  key: string;
  label: string;
  type: CustomFieldType;
  placeholder: string;
  options?: string[];
}> = [
  {
    key: 'city',
    label: 'Kota / Domisili',
    type: 'text',
    placeholder: 'Contoh: Surabaya / Jakarta Selatan',
  },
  {
    key: 'age',
    label: 'Usia Saat Ini',
    type: 'number',
    placeholder: 'Contoh: 28',
  },
  {
    key: 'gender',
    label: 'Jenis Kelamin',
    type: 'radio',
    placeholder: '',
    options: ['Laki-laki', 'Perempuan'],
  },
  {
    key: 'birthDate',
    label: 'Tanggal Lahir',
    type: 'date',
    placeholder: '',
  },
  {
    key: 'profession',
    label: 'Pekerjaan / Bidang Bisnis',
    type: 'text',
    placeholder: 'Contoh: Pengusaha / Karyawan Swasta',
  },
  {
    key: 'goal',
    label: 'Target Pengembangan Utama',
    type: 'select',
    placeholder: 'Pilih Fokus Anda...',
    options: [
      'Meningkatkan Karier & Promosi',
      'Menemukan Bisnis yang Cocok',
      'Mengenali Potensi & Bakat Alami',
      'Mengatasi Stagnasi Finansial',
    ],
  },
  {
    key: 'notes',
    label: 'Keluhan / Pertanyaan Khusus',
    type: 'textarea',
    placeholder: 'Ceritakan singkat kondisi atau pertanyaan Anda...',
  },
];

export function createCustomFormField(
  presetKey?: string
): CustomFormField {
  const uniqueId = `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const preset = CUSTOM_FIELD_PRESETS.find((p) => p.key === presetKey);
  if (preset) {
    return {
      id: `${preset.key}_${Date.now()}`,
      label: preset.label,
      type: preset.type,
      placeholder: preset.placeholder,
      required: false,
      enabled: true,
      options: preset.options ? [...preset.options] : [],
    };
  }

  return {
    id: uniqueId,
    label: 'Pertanyaan Tambahan',
    type: 'text',
    placeholder: 'Ketik jawaban Anda di sini...',
    required: false,
    enabled: true,
    options: [],
  };
}

/**
 * Mengambil daftar custom fields dari formConfig.
 * Jika belum pernah diset (landing page lama), otomatis konversi dari formConfig.fields bawaan.
 */
export function resolveCustomFormFields(formConfig?: Record<string, any>): CustomFormField[] {
  if (Array.isArray(formConfig?.customFields)) {
    return formConfig.customFields;
  }

  const legacyFields = formConfig?.fields || {};
  const defaults: CustomFormField[] = [];

  if (legacyFields.birthDate?.enabled !== false) {
    defaults.push({
      id: 'birthDate',
      label: legacyFields.birthDate?.label || 'Tanggal Lahir (Opsional)',
      type: 'date',
      placeholder: '',
      required: Boolean(legacyFields.birthDate?.required),
      enabled: true,
    });
  }

  if (legacyFields.goal?.enabled !== false) {
    defaults.push({
      id: 'goal',
      label: legacyFields.goal?.label || 'Target Pengembangan Utama?',
      type: 'select',
      placeholder: 'Pilih Fokus Anda...',
      required: Boolean(legacyFields.goal?.required),
      enabled: true,
      options: Array.isArray(legacyFields.goal?.options)
        ? legacyFields.goal.options
        : [
            'Meningkatkan Karier & Promosi',
            'Menemukan Bisnis yang Cocok',
            'Mengenali Potensi & Bakat Alami',
            'Mengatasi Stagnasi Finansial',
          ],
    });
  }

  return defaults;
}
