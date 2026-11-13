import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  MessageCircle,
  QrCode,
  Tag,
  ArrowRight,
  Clock,
  Check,
  X,
  BadgePercent,
  CheckCheck,
  User,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  getPublicLandingPage,
  checkoutFromLandingPage,
} from '@/services/api/landingPage';
import {
  LandingPage,
  SectionBlock,
  DbPackage,
  DbVoucher,
  RecentOrderNotification,
} from '@/types/landingPage';
import {
  resolveTheme,
  getBackgroundPatternStyle,
  resolveCustomFormFields,
} from '@/utils/landingPageMedia';
import { LandingPageSectionRenderer } from '@/components/landing-page/LandingPageSectionRenderer';
import { DynamicFormFieldRenderer } from '@/components/landing-page/DynamicFormFieldRenderer';

export default function PublicLandingPage() {
  const { slug = 'lp-karakter' } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refCodeFromUrl = searchParams.get('ref') || '';

  const [page, setPage] = useState<LandingPage | null>(null);
  const [dbPackages, setDbPackages] = useState<DbPackage[]>([]);
  const [dbVouchers, setDbVouchers] = useState<DbVoucher[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedPackageId, setSelectedPackageId] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [selectedVoucher, setSelectedVoucher] = useState<DbVoucher | null>(null);
  const [manualVoucherCode, setManualVoucherCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'whatsapp'>('gateway');

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 14,
    seconds: 59,
  });

  // Sticky CTA visibility
  const [showStickyCta, setShowStickyCta] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Live Recent Order Looping Ticker States
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [showOrderToast, setShowOrderToast] = useState(false);
  const [dismissTicker, setDismissTicker] = useState(false);

  // Simulated fallback list if fewer real orders exist
  const simulatedOrders = [
    { fullName: 'Rian Pratama', city: 'Surabaya', packageName: 'Personal', timeAgo: '2 menit yang lalu' },
    { fullName: 'Dewi Sartika', city: 'Jakarta Selatan', packageName: 'Keluarga', timeAgo: '4 menit yang lalu' },
    { fullName: 'Ahmad Fauzi', city: 'Bandung', packageName: 'Personal', timeAgo: 'Baru saja' },
    { fullName: 'Siti Rahmawati', city: 'Yogyakarta', packageName: 'Lembaga / Komunitas', timeAgo: '3 menit yang lalu' },
    { fullName: 'Budi Santoso', city: 'Semarang', packageName: 'Personal', timeAgo: '6 menit yang lalu' },
    { fullName: 'Nadia Putri', city: 'Medan', packageName: 'Keluarga', timeAgo: '1 menit yang lalu' },
    { fullName: 'Fajar Hidayat', city: 'Makassar', packageName: 'Personal', timeAgo: '5 menit yang lalu' },
    { fullName: 'Hendro Wijaya', city: 'Denpasar, Bali', packageName: 'Keluarga', timeAgo: '7 menit yang lalu' },
  ];

  // Load landing page data
  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const res = await getPublicLandingPage(slug);
        const landingData = res.data;
        setPage(landingData);

        const pkgs = res.availablePackages || [];
        setDbPackages(pkgs);

        const vchs = res.availableVouchers || [];
        setDbVouchers(vchs);

        setRecentOrders(res.recentOrders || []);

        // 1. Tentukan paket terpilih secara default
        if (pkgs.length > 0) {
          const featuredId = landingData.formConfig?.featuredPackageId;
          const matchedFeatured = pkgs.find((p) => p.id === featuredId);
          setSelectedPackageId(matchedFeatured ? matchedFeatured.id : pkgs[0].id);
        }

        // 2. Tentukan voucher default jika sudah di-setting
        const defaultCode = landingData.formConfig?.defaultVoucherCode;
        if (defaultCode && vchs.length > 0) {
          const matchedVoucher = vchs.find(
            (v) => v.code.toUpperCase() === defaultCode.toUpperCase()
          );
          if (matchedVoucher) {
            setSelectedVoucher(matchedVoucher);
            setManualVoucherCode(matchedVoucher.code);
          }
        } else if (vchs.length > 0) {
          // Jika ada voucher aktif di DB, otomatis pasang voucher pertama
          setSelectedVoucher(vchs[0]);
          setManualVoucherCode(vchs[0].code);
        }

        // 3. Inisialisasi Countdown Timer
        const minutes = landingData.themeConfig?.urgencyMinutes || 15;
        setTimeLeft({ minutes: minutes - 1, seconds: 59 });

        // 4. Inject Meta Pixel jika diisi
        if (landingData.pixelConfig?.facebookPixelId) {
          injectMetaPixel(landingData.pixelConfig.facebookPixelId);
        }
      } catch (err: any) {
        console.error('Failed to load landing page:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  // Live Recent Orders Notification Loop Effect
  const combinedOrders = [
    ...recentOrders.map((ro) => ({
      fullName: ro.fullName,
      city: ro.city || 'Indonesia',
      packageName: ro.package?.name || ro.packageName || 'Personal',
      timeAgo: ro.timeAgo || 'Baru saja',
    })),
    ...simulatedOrders,
  ];

  useEffect(() => {
    if (page?.formConfig?.showLiveOrdersTicker === false || dismissTicker) return;

    // Tampilkan pertama kali setelah 2.5 detik
    const initialTimer = setTimeout(() => {
      setShowOrderToast(true);
    }, 2500);

    // Looping setiap 6.5 detik
    const loopInterval = setInterval(() => {
      setShowOrderToast(false);
      setTimeout(() => {
        setCurrentOrderIndex((prev) => (prev + 1) % combinedOrders.length);
        setShowOrderToast(true);
      }, 1500);
    }, 6500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopInterval);
    };
  }, [combinedOrders.length, page?.formConfig?.showLiveOrdersTicker, dismissTicker]);

  // Countdown Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 14, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Scroll listener for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper inject Meta Pixel
  const injectMetaPixel = (pixelId: string) => {
    if (typeof window !== 'undefined' && !(window as any).fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );
      (window as any).fbq('init', pixelId);
      (window as any).fbq('track', 'PageView');
      (window as any).fbq('track', 'ViewContent', { content_name: slug });
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // DAFTAR PAKET: 100% Otomatis Membaca dari Database
  const packagesList: DbPackage[] =
    dbPackages.length > 0
      ? dbPackages
      : [
          {
            id: 1,
            name: 'Personal',
            defaultTokenAmount: 1,
            price: 250000,
            description: '1x Akses Tes Lengkap & Laporan PDF 25+ Halaman',
          },
          {
            id: 2,
            name: 'Keluarga',
            defaultTokenAmount: 5,
            price: 750000,
            description: '5x Akses Tes Lengkap (Bisa untuk Pasangan/Keluarga)',
          },
          {
            id: 3,
            name: 'Lembaga / Komunitas',
            defaultTokenAmount: 25,
            price: 2500000,
            description: '25x Akses Tes untuk Tim & Komunitas',
          },
          {
            id: 4,
            name: 'Bisnis',
            defaultTokenAmount: 100,
            price: 5000000,
            description: '100x Akses Tes Skala Enterprise',
          },
        ];

  const currentSelectedPackage =
    packagesList.find((p) => p.id === selectedPackageId) || packagesList[0];

  // HITUNG DISKON VOUCHER OTOMATIS
  const originalPrice = currentSelectedPackage.price;
  let discountAmount = 0;

  if (selectedVoucher) {
    if (selectedVoucher.type === 'percentage') {
      discountAmount = Math.round((originalPrice * selectedVoucher.value) / 100);
    } else {
      discountAmount = Math.min(selectedVoucher.value, originalPrice);
    }
  }

  const finalTotal = Math.max(0, originalPrice - discountAmount);
  const isFree = finalTotal <= 0;

  // Handler Pilih Voucher dari Pilihan
  const handleSelectVoucher = (v: DbVoucher) => {
    if (selectedVoucher?.code === v.code) {
      // Toggle off jika diklik ulang
      setSelectedVoucher(null);
      setManualVoucherCode('');
      toast.info('Voucher dilepas.');
    } else {
      setSelectedVoucher(v);
      setManualVoucherCode(v.code);
      toast.success(`Voucher ${v.code} berhasil diterapkan!`);
    }
  };

  // Handler Terapkan Manual Voucher
  const handleApplyManualVoucher = () => {
    if (!manualVoucherCode.trim()) {
      setSelectedVoucher(null);
      toast.info('Kode voucher dikosongkan.');
      return;
    }
    const matched = dbVouchers.find(
      (v) => v.code.toUpperCase() === manualVoucherCode.trim().toUpperCase()
    );
    if (matched) {
      setSelectedVoucher(matched);
      toast.success(`Voucher ${matched.code} berhasil diterapkan!`);
    } else {
      toast.error('Kode voucher tidak ditemukan atau belum aktif.');
    }
  };

  // Handle Form Submit & Checkout
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Mohon isi nama lengkap Anda.');
      return;
    }
    if (!whatsapp.trim()) {
      toast.error('Mohon isi nomor WhatsApp Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Mohon isi alamat email yang valid.');
      return;
    }

    const activeCustomFields = resolveCustomFormFields(page?.formConfig).filter(
      (f) => f.enabled !== false
    );
    const additionalDataPayload: Record<string, string> = {};

    for (const field of activeCustomFields) {
      const rawVal = customAnswers[field.id];
      const isEmpty =
        rawVal === undefined ||
        rawVal === null ||
        (typeof rawVal === 'string' && !rawVal.trim()) ||
        (Array.isArray(rawVal) && rawVal.length === 0) ||
        rawVal === false;

      if (field.required && isEmpty) {
        toast.error(`Mohon lengkapi "${field.label}".`);
        return;
      }

      if (!isEmpty) {
        let formatted = '';
        if (Array.isArray(rawVal)) {
          formatted = rawVal.join(', ');
        } else if (rawVal === true) {
          formatted = 'Ya';
        } else {
          formatted = String(rawVal).trim();
        }
        additionalDataPayload[field.label || field.id] = formatted;
      }
    }

    try {
      setSubmitting(true);

      // Trigger FB Pixel InitiateCheckout
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', {
          content_name: currentSelectedPackage.name,
          value: finalTotal,
          currency: 'IDR',
        });
      }

      const res = await checkoutFromLandingPage(page?.slug || slug, {
        fullName,
        whatsapp,
        email,
        packageId: currentSelectedPackage.id,
        voucherCode: selectedVoucher ? selectedVoucher.code : undefined,
        referralCode: refCodeFromUrl || undefined,
        paymentMethod,
        additionalData: additionalDataPayload,
      });

      // Trigger FB Pixel Lead
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: currentSelectedPackage.name,
          value: finalTotal,
          currency: 'IDR',
        });
      }

      // 1. Jika via WhatsApp Checkout
      if (res.paymentMethod === 'whatsapp' && res.whatsappUrl) {
        toast.success('Mengarahkan ke WhatsApp admin untuk konfirmasi pesanan...');
        window.location.href = res.whatsappUrl;
        return;
      }

      // 2. Jika Gratis (Voucher 100%)
      if (res.isFree) {
        toast.success(res.message || 'Pendaftaran berhasil! Token gratis telah aktif.');
        window.location.href = `/customer/dashboard/overview`;
        return;
      }

      // 3. Jika via Payment Gateway
      if (res.paymentUrl) {
        toast.success('Mengarahkan ke halaman pembayaran...');
        window.location.href = res.paymentUrl;
        return;
      }

      toast.success('Pemesanan token berhasil diproses!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gagal memproses checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-300">Menyiapkan Halaman Penawaran...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h1 className="text-xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-gray-400 mt-1 max-w-sm">
          Halaman penawaran yang Anda cari mungkin telah berakhir atau belum aktif.
        </p>
      </div>
    );
  }

  const theme = page.themeConfig || {};
  const resolvedTheme = resolveTheme(theme);
  const currentLiveOrder = combinedOrders[currentOrderIndex];
  const stickyCtaSection = page.sections.find(
    (s) => (s.type || s.id) === 'stickyMobileCta' && s.enabled
  );

  const renderOrderForm = (section: SectionBlock) => {
    const isLight = resolvedTheme.isLightCard;
    const inputBg = isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)';
    const inputBorder = isLight
      ? resolvedTheme.cardBorderColor || '#E2E8F0'
      : 'rgba(255, 255, 255, 0.12)';

    return (
      <section
        key={section.id}
        ref={formRef}
        id="formulir-order"
        style={{
          backgroundColor: resolvedTheme.cardBackgroundColor,
          borderColor: isLight
            ? resolvedTheme.cardBorderColor || '#E2E8F0'
            : 'rgba(255, 255, 255, 0.12)',
          boxShadow: isLight
            ? '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0,0,0,0.03)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
        className={`p-5 sm:p-8 ${resolvedTheme.cardRadius} border transition-all duration-300 space-y-6 scroll-mt-20`}
      >
        {/* Form Header */}
        <div className="text-center space-y-2">
          <span
            style={{
              backgroundColor: `${resolvedTheme.primaryColor}14`,
              color: resolvedTheme.primaryColor,
              borderColor: `${resolvedTheme.primaryColor}28`,
            }}
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {section.data?.badge || '⚡ PROMO HARI INI'}
          </span>
          <h2
            style={{ color: resolvedTheme.textColor }}
            className="text-2xl sm:text-3xl font-black tracking-tight"
          >
            {section.data?.title || 'Formulir Pemesanan & Checkout Token'}
          </h2>
          <p
            style={{ color: resolvedTheme.mutedTextColor }}
            className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed"
          >
            {section.data?.subtitle ||
              'Pilih paket token di bawah dan lengkapi data untuk langsung mendapatkan akses tes instan.'}
          </p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-6">
          {/* STEP 1: TOKEN PACKAGES SELECTOR (OTOMATIS DARI DATABASE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                style={{ color: resolvedTheme.textColor }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span
                  style={{
                    backgroundColor: resolvedTheme.primaryColor,
                    color: '#FFFFFF',
                  }}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-sm"
                >
                  1
                </span>
                <span>Pilih Paket Token Asesmen</span>
              </label>
              <span
                style={{
                  backgroundColor: `${resolvedTheme.primaryColor}12`,
                  color: resolvedTheme.primaryColor,
                  borderColor: `${resolvedTheme.primaryColor}25`,
                }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
              >
                ✓ Otomatis Database
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {packagesList.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const isPopular =
                  (page.formConfig?.featuredPackageId || packagesList[0]?.id) === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    style={{
                      borderColor: isSelected
                        ? resolvedTheme.primaryColor
                        : isLight
                        ? resolvedTheme.cardBorderColor || '#E2E8F0'
                        : 'rgba(255,255,255,0.1)',
                      backgroundColor: isSelected
                        ? isLight
                          ? `${resolvedTheme.primaryColor}0C`
                          : `${resolvedTheme.primaryColor}22`
                        : isLight
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.03)',
                      boxShadow: isSelected
                        ? isLight
                          ? `0 8px 20px -4px ${resolvedTheme.primaryColor}22`
                          : `0 8px 24px -4px ${resolvedTheme.primaryColor}40`
                        : isLight
                        ? '0 1px 2px rgba(0,0,0,0.02)'
                        : 'none',
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative select-none hover:scale-[1.008]`}
                  >
                    {isPopular && (
                      <span
                        style={{
                          background: `linear-gradient(135deg, ${resolvedTheme.primaryColor}, #F43F5E)`,
                        }}
                        className="absolute -top-2.5 right-4 text-[10px] font-black uppercase text-white px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3" />
                        PALING LARIS
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color: isSelected
                                ? isLight
                                  ? resolvedTheme.primaryColor
                                  : '#FFFFFF'
                                : resolvedTheme.textColor,
                            }}
                            className="font-extrabold text-sm sm:text-base tracking-tight"
                          >
                            {pkg.name}
                          </span>
                          <span
                            style={{
                              backgroundColor: isSelected
                                ? resolvedTheme.primaryColor
                                : isLight
                                ? `${resolvedTheme.primaryColor}14`
                                : 'rgba(255,255,255,0.08)',
                              color: isSelected ? '#FFFFFF' : resolvedTheme.primaryColor,
                              borderColor: `${resolvedTheme.primaryColor}28`,
                            }}
                            className="text-[10px] font-bold border px-2 py-0.5 rounded-md transition"
                          >
                            {pkg.defaultTokenAmount} Token Tes
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span
                            style={{
                              color: isSelected
                                ? isLight
                                  ? resolvedTheme.primaryColor
                                  : '#FBBF24'
                                : resolvedTheme.textColor,
                            }}
                            className="text-lg sm:text-xl font-black"
                          >
                            Rp {pkg.price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {pkg.description && (
                          <p
                            style={{ color: resolvedTheme.mutedTextColor }}
                            className="text-xs mt-1"
                          >
                            {pkg.description}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          borderColor: isSelected
                            ? resolvedTheme.primaryColor
                            : isLight
                            ? '#CBD5E1'
                            : 'rgba(255,255,255,0.25)',
                          backgroundColor: isSelected
                            ? resolvedTheme.primaryColor
                            : 'transparent',
                        }}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 transition"
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: USER DETAILS */}
          <div className="space-y-3">
            <label
              style={{ color: resolvedTheme.textColor }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <span
                style={{
                  backgroundColor: resolvedTheme.primaryColor,
                  color: '#FFFFFF',
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-sm"
              >
                2
              </span>
              <span>Isi Data Diri Anda</span>
            </label>

            <div className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  style={{ color: resolvedTheme.textColor }}
                  className="text-xs font-semibold flex items-center gap-1"
                >
                  {page.formConfig?.coreFields?.fullName?.label || 'Nama Lengkap'}{' '}
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <div
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  }}
                  className="w-full border rounded-xl transition duration-200 flex items-center gap-2.5 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20"
                >
                  <User
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="w-4 h-4 shrink-0"
                  />
                  <input
                    type="text"
                    required
                    placeholder={
                      page.formConfig?.coreFields?.fullName?.placeholder ||
                      'Contoh: Budi Santoso'
                    }
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ color: resolvedTheme.textColor }}
                    className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label
                  style={{ color: resolvedTheme.textColor }}
                  className="text-xs font-semibold flex items-center gap-1"
                >
                  {page.formConfig?.coreFields?.whatsapp?.label || 'Nomor WhatsApp Aktif'}{' '}
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <div
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  }}
                  className="w-full border rounded-xl transition duration-200 flex items-center gap-2.5 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20"
                >
                  <Phone
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="w-4 h-4 shrink-0"
                  />
                  <input
                    type="tel"
                    required
                    placeholder={
                      page.formConfig?.coreFields?.whatsapp?.placeholder ||
                      'Contoh: 081234567890'
                    }
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    style={{ color: resolvedTheme.textColor }}
                    className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm focus:outline-none placeholder:text-gray-400 font-mono"
                  />
                </div>
                <span
                  style={{ color: resolvedTheme.mutedTextColor }}
                  className="text-[10px] block"
                >
                  Link tes dan token akan langsung dikirimkan ke nomor WhatsApp ini.
                </span>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  style={{ color: resolvedTheme.textColor }}
                  className="text-xs font-semibold flex items-center gap-1"
                >
                  {page.formConfig?.coreFields?.email?.label || 'Alamat Email'}{' '}
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <div
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  }}
                  className="w-full border rounded-xl transition duration-200 flex items-center gap-2.5 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20"
                >
                  <Mail
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="w-4 h-4 shrink-0"
                  />
                  <input
                    type="email"
                    required
                    placeholder={
                      page.formConfig?.coreFields?.email?.placeholder ||
                      'Contoh: budi@gmail.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ color: resolvedTheme.textColor }}
                    className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Custom Form Fields */}
              {resolveCustomFormFields(page.formConfig)
                .filter((field) => field.enabled !== false)
                .map((field) => (
                  <DynamicFormFieldRenderer
                    key={field.id}
                    field={field}
                    value={customAnswers[field.id]}
                    onChange={(val) =>
                      setCustomAnswers((prev) => ({
                        ...prev,
                        [field.id]: val,
                      }))
                    }
                    theme={page.themeConfig}
                  />
                ))}
            </div>
          </div>

          {/* STEP 3: VOUCHER SELECTION (OTOMATIS MEMBACA VOUCHER DARI DATABASE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                style={{ color: resolvedTheme.textColor }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span
                  style={{
                    backgroundColor: resolvedTheme.primaryColor,
                    color: '#FFFFFF',
                  }}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-sm"
                >
                  3
                </span>
                <span>Kupon Diskon / Voucher Promo</span>
              </label>
              {selectedVoucher && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  Kupon Aktif
                </span>
              )}
            </div>

            {/* Clickable Voucher Pills from Database */}
            {dbVouchers.length > 0 && (
              <div className="space-y-2">
                <span
                  style={{ color: resolvedTheme.mutedTextColor }}
                  className="text-[11px] block"
                >
                  Pilih Kupon Diskon Yang Tersedia:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dbVouchers.map((v) => {
                    const isApplied = selectedVoucher?.code === v.code;
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVoucher(v)}
                        style={{
                          borderColor: isApplied
                            ? '#10B981'
                            : isLight
                            ? resolvedTheme.cardBorderColor || '#E2E8F0'
                            : 'rgba(255,255,255,0.1)',
                          backgroundColor: isApplied
                            ? isLight
                              ? '#ECFDF5'
                              : 'rgba(16, 185, 129, 0.15)'
                            : isLight
                            ? '#FFFFFF'
                            : 'rgba(255,255,255,0.03)',
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none hover:scale-[1.01]`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <BadgePercent
                              style={{ color: resolvedTheme.primaryColor }}
                              className="w-4 h-4 shrink-0"
                            />
                            <span
                              style={{ color: resolvedTheme.textColor }}
                              className="font-mono font-bold text-xs"
                            >
                              {v.code}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-600 font-bold">
                            {v.type === 'percentage'
                              ? `Diskon ${v.value}%`
                              : `Potongan Rp ${v.value.toLocaleString('id-ID')}`}
                          </div>
                        </div>

                        <span
                          style={{
                            backgroundColor: isApplied
                              ? '#10B981'
                              : isLight
                              ? `${resolvedTheme.primaryColor}14`
                              : 'rgba(255,255,255,0.08)',
                            color: isApplied ? '#FFFFFF' : resolvedTheme.primaryColor,
                          }}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition"
                        >
                          {isApplied ? '✓ Diterapkan' : 'Gunakan'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input manual kode voucher */}
            <div className="flex gap-2 pt-1">
              <div
                style={{
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                }}
                className="relative flex-1 border rounded-xl flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20"
              >
                <Tag
                  style={{ color: resolvedTheme.mutedTextColor }}
                  className="w-4 h-4 mr-2 shrink-0"
                />
                <input
                  type="text"
                  placeholder="Ketik kode kupon lainnya..."
                  value={manualVoucherCode}
                  onChange={(e) => setManualVoucherCode(e.target.value.toUpperCase())}
                  style={{ color: resolvedTheme.textColor }}
                  className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm focus:outline-none uppercase font-mono placeholder:text-gray-400"
                />
              </div>
              <Button
                type="button"
                onClick={handleApplyManualVoucher}
                style={{
                  backgroundColor: resolvedTheme.primaryColor,
                  color: resolvedTheme.buttonTextColor || '#FFFFFF',
                }}
                className="rounded-xl text-xs font-semibold px-4 h-auto py-2.5 hover:brightness-110 shadow-sm"
              >
                Terapkan
              </Button>
            </div>
          </div>

          {/* STEP 4: PAYMENT METHOD */}
          <div className="space-y-3">
            <label
              style={{ color: resolvedTheme.textColor }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <span
                style={{
                  backgroundColor: resolvedTheme.primaryColor,
                  color: '#FFFFFF',
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-sm"
              >
                4
              </span>
              <span>Pilih Metode Pembayaran</span>
            </label>

            {Boolean(page.formConfig?.enableWhatsappCheckout && page.formConfig?.whatsappAdminNumber?.trim()) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Payment Gateway */}
                <div
                  onClick={() => setPaymentMethod('gateway')}
                  style={{
                    borderColor:
                      paymentMethod === 'gateway'
                        ? resolvedTheme.primaryColor
                        : isLight
                        ? resolvedTheme.cardBorderColor || '#E2E8F0'
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      paymentMethod === 'gateway'
                        ? isLight
                          ? `${resolvedTheme.primaryColor}0C`
                          : `${resolvedTheme.primaryColor}22`
                        : isLight
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.03)',
                    boxShadow:
                      paymentMethod === 'gateway' && isLight
                        ? `0 6px 18px -3px ${resolvedTheme.primaryColor}22`
                        : 'none',
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center space-y-1.5 select-none hover:scale-[1.01] relative`}
                >
                  <div
                    style={{
                      backgroundColor:
                        paymentMethod === 'gateway'
                          ? resolvedTheme.primaryColor
                          : `${resolvedTheme.primaryColor}14`,
                      color: paymentMethod === 'gateway' ? '#FFFFFF' : resolvedTheme.primaryColor,
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition shadow-sm"
                  >
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div
                    style={{
                      color:
                        paymentMethod === 'gateway'
                          ? isLight
                            ? resolvedTheme.primaryColor
                            : '#FFFFFF'
                          : resolvedTheme.textColor,
                    }}
                    className="text-xs font-extrabold"
                  >
                    Payment Gateway Otomatis
                  </div>
                  <div
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="text-[10px] leading-tight"
                  >
                    QRIS • Virtual Account • E-Wallet
                  </div>
                </div>

                {/* Order via WhatsApp */}
                <div
                  onClick={() => setPaymentMethod('whatsapp')}
                  style={{
                    borderColor:
                      paymentMethod === 'whatsapp'
                        ? '#10B981'
                        : isLight
                        ? resolvedTheme.cardBorderColor || '#E2E8F0'
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      paymentMethod === 'whatsapp'
                        ? isLight
                          ? '#ECFDF5'
                          : 'rgba(16, 185, 129, 0.2)'
                        : isLight
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.03)',
                    boxShadow:
                      paymentMethod === 'whatsapp' && isLight
                        ? '0 6px 18px -3px rgba(16, 185, 129, 0.25)'
                        : 'none',
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center space-y-1.5 select-none hover:scale-[1.01] relative`}
                >
                  <div
                    style={{
                      backgroundColor:
                        paymentMethod === 'whatsapp' ? '#10B981' : 'rgba(16, 185, 129, 0.15)',
                      color: paymentMethod === 'whatsapp' ? '#FFFFFF' : '#10B981',
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div
                    style={{
                      color:
                        paymentMethod === 'whatsapp'
                          ? '#059669'
                          : resolvedTheme.textColor,
                    }}
                    className="text-xs font-extrabold"
                  >
                    Order via WhatsApp
                  </div>
                  <div
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="text-[10px] leading-tight"
                  >
                    Chat Admin Langsung
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderColor: resolvedTheme.primaryColor,
                  backgroundColor: isLight
                    ? `${resolvedTheme.primaryColor}0C`
                    : `${resolvedTheme.primaryColor}22`,
                  boxShadow: isLight
                    ? `0 6px 18px -3px ${resolvedTheme.primaryColor}20`
                    : 'none',
                }}
                className="p-4 rounded-2xl border-2 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: resolvedTheme.primaryColor,
                      color: '#FFFFFF',
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div
                      style={{
                        color: isLight ? resolvedTheme.primaryColor : '#FFFFFF',
                      }}
                      className="text-xs sm:text-sm font-extrabold"
                    >
                      Payment Gateway Otomatis
                    </div>
                    <div
                      style={{ color: resolvedTheme.mutedTextColor }}
                      className="text-[11px] leading-tight mt-0.5"
                    >
                      QRIS (GoPay, OVO, ShopeePay, DANA) • Virtual Account Bank • E-Wallet
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: `${resolvedTheme.primaryColor}15`,
                    color: resolvedTheme.primaryColor,
                    borderColor: `${resolvedTheme.primaryColor}30`,
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 hidden sm:flex items-center gap-1"
                >
                  <Check className="w-3 h-3 stroke-[3]" /> Aktif Otomatis
                </div>
              </div>
            )}

            {/* Badges Saluran Pembayaran */}
            <div
              style={{
                backgroundColor: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
                borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
              }}
              className="p-3 rounded-xl border text-center space-y-1"
            >
              <div
                style={{ color: resolvedTheme.mutedTextColor }}
                className="text-[10px] font-medium"
              >
                Mendukung Pembayaran Otomatis Terverifikasi:
              </div>
              <div
                style={{ color: resolvedTheme.textColor }}
                className="text-[11px] font-bold"
              >
                QRIS (GoPay, OVO, ShopeePay, DANA) • BCA • Mandiri • BNI • BRI • Permata
              </div>
            </div>
          </div>

          {/* TOTAL & SUBMIT CTA */}
          <div className="pt-2 space-y-3">
            <div
              style={{
                backgroundColor: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.25)',
                borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.02)' : 'none',
              }}
              className="p-4 rounded-2xl border space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: resolvedTheme.mutedTextColor }}>
                  Harga Paket ({currentSelectedPackage.name}):
                </span>
                <span
                  style={{ color: resolvedTheme.textColor }}
                  className="font-semibold"
                >
                  Rp {originalPrice.toLocaleString('id-ID')}
                </span>
              </div>

              {selectedVoucher && (
                <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <BadgePercent className="w-3.5 h-3.5" />
                    Diskon Voucher ({selectedVoucher.code}):
                  </span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div
                style={{
                  borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
                }}
                className="pt-2.5 border-t border-dashed flex items-center justify-between"
              >
                <div>
                  <div
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="text-xs"
                  >
                    Total Tagihan:
                  </div>
                  <div
                    style={{ color: resolvedTheme.textColor }}
                    className="text-xs font-bold mt-0.5"
                  >
                    {currentSelectedPackage.defaultTokenAmount} Token Tes Instan
                  </div>
                </div>
                <div className="text-right">
                  <div
                    style={{
                      color: isLight ? resolvedTheme.primaryColor : '#FBBF24',
                    }}
                    className="text-2xl font-black"
                  >
                    {isFree ? 'GRATIS (Rp 0)' : `Rp ${finalTotal.toLocaleString('id-ID')}`}
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-500/20">
                      Hemat Rp {discountAmount.toLocaleString('id-ID')} 🎉
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background:
                  paymentMethod === 'whatsapp'
                    ? '#10B981'
                    : isFree
                    ? '#10B981'
                    : `linear-gradient(135deg, ${resolvedTheme.primaryColor}, ${resolvedTheme.accentColor || resolvedTheme.primaryColor})`,
                color:
                  paymentMethod === 'whatsapp' || isFree
                    ? '#FFFFFF'
                    : resolvedTheme.buttonTextColor || '#FFFFFF',
                boxShadow:
                  paymentMethod === 'whatsapp' || isFree
                    ? '0 12px 28px -6px rgba(16, 185, 129, 0.45)'
                    : `0 12px 28px -6px ${resolvedTheme.primaryColor}55`,
              }}
              className={`w-full font-black py-4 px-6 ${resolvedTheme.buttonRadius} text-sm sm:text-base active:scale-95 hover:brightness-110 transition duration-200 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:opacity-50`}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Pesanan...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    {paymentMethod === 'whatsapp'
                      ? 'LANJUTKAN ORDER VIA WHATSAPP'
                      : isFree
                      ? '🎉 KLAIM AKSES TES SEKARANG (GRATIS)'
                      : 'BAYAR SEKARANG (OTOMATIS)'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
                </>
              )}
            </button>

            <div
              style={{ color: resolvedTheme.mutedTextColor }}
              className="text-center text-[11px] flex items-center justify-center gap-1.5 pt-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                {page.formConfig?.guaranteeText ||
                  '100% Pembayaran Aman & Terverifikasi Otomatis'}
              </span>
            </div>
          </div>
        </form>
      </section>
    );
  };

  return (
    <div
      style={{
        backgroundColor: resolvedTheme.backgroundColor,
        color: resolvedTheme.textColor,
        fontFamily: resolvedTheme.fontFamily,
        ...getBackgroundPatternStyle(resolvedTheme),
      }}
      className="min-h-screen relative selection:bg-amber-500 selection:text-slate-950"
    >
      {/* 1. TOP URGENCY COUNTDOWN BAR */}
      {resolvedTheme.showUrgencyBar && (
        <div
          style={{
            background: `linear-gradient(90deg, ${resolvedTheme.urgencyBarBgFrom}, ${resolvedTheme.urgencyBarBgTo})`,
            color: resolvedTheme.urgencyBarTextColor,
          }}
          className="sticky top-0 z-40 text-xs sm:text-sm font-bold py-2.5 px-3 text-center shadow-lg flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4 animate-bounce shrink-0" />
          <span>{resolvedTheme.urgencyBarText}</span>
          <div className="bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-md font-mono text-xs flex items-center gap-1 border border-white/20 shrink-0">
            <Clock className="w-3 h-3" />
            <span>
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* OPTIONAL HEADER LOGO */}
      {resolvedTheme.headerLogoUrl && (
        <div className="pt-6 pb-1 flex justify-center px-4">
          <img
            src={resolvedTheme.headerLogoUrl}
            alt={page.title}
            className="h-12 object-contain"
          />
        </div>
      )}

      {/* RENDER ALL DYNAMIC SECTIONS */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-12">
        {page.sections
          .filter((s) => s.enabled)
          .map((section) => (
            <LandingPageSectionRenderer
              key={section.id}
              section={section}
              theme={page.themeConfig}
              onCtaClick={scrollToForm}
              renderOrderForm={renderOrderForm}
            />
          ))}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          borderColor: resolvedTheme.cardBorderColor,
          color: resolvedTheme.mutedTextColor,
        }}
        className="border-t py-8 px-4 text-center text-xs space-y-2"
      >
        <p>{resolvedTheme.footerText}</p>
        <p className="text-[11px] opacity-75 max-w-md mx-auto">
          Asesmen kepribadian dan potensi diri berbasis psikometri modern & AI.
        </p>
      </footer>

      {/* LIVE RECENT ORDERS LOOP TICKER (SOCIAL PROOF POPUP) */}
      {showOrderToast && currentLiveOrder && !dismissTicker && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 max-w-xs sm:max-w-sm bg-slate-900/95 border border-amber-400/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-left duration-300 text-left">
          <button
            onClick={() => setDismissTicker(true)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 p-0.5"
            title="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-2.5 pr-4">
            <div className="relative shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow">
                {currentLiveOrder.fullName.charAt(0)}
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>

            <div className="space-y-0.5 text-xs">
              <div className="font-extrabold text-white flex items-center gap-1">
                <span>{currentLiveOrder.fullName}</span>
                {currentLiveOrder.city && (
                  <span className="text-[10px] text-amber-300 font-normal">
                    ({currentLiveOrder.city})
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-300 leading-tight">
                Baru saja order{' '}
                <span className="text-amber-400 font-bold">
                  Paket {currentLiveOrder.packageName}
                </span>
              </p>

              <div className="flex items-center gap-2 pt-0.5 text-[9px] text-gray-400">
                <span>🕒 {currentLiveOrder.timeAgo}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM FLOATING CTA (MOBILE ONLY) */}
      {showStickyCta && stickyCtaSection && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-white/10 backdrop-blur-md flex items-center justify-between gap-3 z-40 animate-in slide-in-from-bottom duration-300">
          <div className="text-left pl-2">
            <div className="text-xs font-black text-white">
              {stickyCtaSection.data?.subtext || 'Diskon Terbatas Hari Ini!'}
            </div>
            <div className="text-[10px] text-amber-400 font-bold">
              {currentSelectedPackage.name} •{' '}
              {isFree ? 'GRATIS' : `Rp ${finalTotal.toLocaleString('id-ID')}`}
            </div>
          </div>
          <button
            onClick={scrollToForm}
            style={{
              backgroundColor: isFree ? '#10B981' : resolvedTheme.accentColor,
              color: isFree ? '#FFFFFF' : resolvedTheme.buttonTextColor,
            }}
            className={`font-black px-5 py-2.5 ${resolvedTheme.buttonRadius} text-xs sm:text-sm shrink-0 flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer uppercase tracking-wider`}
          >
            <Flame className="w-3.5 h-3.5" />
            {isFree
              ? 'Klaim Gratis 👉'
              : stickyCtaSection.data?.buttonText || 'Ambil Tes Sekarang 👉'}
          </button>
        </div>
      )}
    </div>
  );
}
