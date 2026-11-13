import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Save,
  Palette,
  Sliders,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Copy,
  Plus,
  Trash2,
  Flame,
  ExternalLink,
  Lock,
  QrCode,
  MessageCircle,
  ShieldCheck,
  Check,
  BadgePercent,
  Tag,
  User,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getLandingPage, updateLandingPage } from '@/services/api/landingPage';
import {
  LandingPage,
  SectionBlock,
  SectionType,
  DbPackage,
  DbVoucher,
} from '@/types/landingPage';
import {
  SECTION_CATALOG,
  createDefaultSection,
  getDefaultSectionLabel,
  resolveTheme,
  getBackgroundPatternStyle,
  resolveCustomFormFields,
} from '@/utils/landingPageMedia';
import { SectionEditorForm } from '@/components/landing-page/SectionEditorForm';
import { ThemeColorEditor } from '@/components/landing-page/ThemeColorEditor';
import { LandingPageSectionRenderer } from '@/components/landing-page/LandingPageSectionRenderer';
import { DynamicFormFieldRenderer } from '@/components/landing-page/DynamicFormFieldRenderer';

export default function LandingPageBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<LandingPage | null>(null);
  const [dbPackages, setDbPackages] = useState<DbPackage[]>([]);
  const [dbVouchers, setDbVouchers] = useState<DbVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Builder States
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'pixels'>('sections');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Load Page Data
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getLandingPage(id);
        setPage(res.data);
        setDbPackages(res.availablePackages || []);
        setDbVouchers(res.availableVouchers || []);
        if (res.data?.sections?.length > 0) {
          setActiveSectionId(res.data.sections[0].id);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat data landing page.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memuat Web Builder...</p>
        </div>
      </div>
    );
  }

  // Handle Save
  const handleSave = async () => {
    if (!page) return;
    try {
      setSaving(true);
      // Normalize section orders before saving
      const normalizedSections = page.sections.map((s, idx) => ({
        ...s,
        order: idx + 1,
      }));
      const updated = await updateLandingPage(page.id, {
        title: page.title,
        slug: page.slug,
        description: page.description,
        category: page.category,
        themeConfig: page.themeConfig,
        pixelConfig: page.pixelConfig,
        sections: normalizedSections,
        formConfig: page.formConfig,
        isPublished: page.isPublished,
      });
      setPage(updated);
      toast.success('Semua perubahan berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Sections Management
  const updateSection = (sectionId: string, updater: (prev: SectionBlock) => SectionBlock) => {
    setPage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
      };
    });
  };

  const handleAddSection = (type: SectionType) => {
    const newSec = createDefaultSection(type, page.sections.length + 1);
    setPage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, newSec],
      };
    });
    setActiveSectionId(newSec.id);
    setIsAddSectionOpen(false);
    toast.success(`Bagian "${newSec.title}" ditambahkan!`);
  };

  const handleDuplicateSection = (index: number) => {
    const src = page.sections[index];
    const cloned: SectionBlock = {
      ...JSON.parse(JSON.stringify(src)),
      id: `${src.type || src.id}-${Date.now()}`,
      title: `${getDefaultSectionLabel(src)} (Salinan)`,
    };
    const nextSections = [...page.sections];
    nextSections.splice(index + 1, 0, cloned);
    setPage({ ...page, sections: nextSections });
    setActiveSectionId(cloned.id);
    toast.success('Bagian berhasil diduplikasi!');
  };

  const handleDeleteSection = (sectionId: string, label: string) => {
    if (page.sections.length <= 1) {
      toast.error('Minimal harus ada 1 bagian di landing page.');
      return;
    }
    if (!window.confirm(`Hapus bagian "${label}"?`)) return;

    const remaining = page.sections.filter((s) => s.id !== sectionId);
    setPage({ ...page, sections: remaining });
    if (activeSectionId === sectionId && remaining.length > 0) {
      setActiveSectionId(remaining[0].id);
    }
    toast.info(`Bagian "${label}" dihapus.`);
  };

  const toggleSectionEnabled = (sectionId: string) => {
    updateSection(sectionId, (s) => ({ ...s, enabled: !s.enabled }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setPage((prev) => {
      if (!prev) return prev;
      const newSections = [...prev.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;

      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      return { ...prev, sections: newSections };
    });
  };

  const activeSection = page.sections.find((s) => s.id === activeSectionId) || page.sections[0];
  const resolvedTheme = resolveTheme(page.themeConfig);
  const stickyCtaSection = page.sections.find(
    (s) => (s.type || s.id) === 'stickyMobileCta' && s.enabled
  );

  // Order Form Preview Renderer inside Live Preview
  const renderOrderFormPreview = (section: SectionBlock) => {
    const data = section.data || {};
    const isLight = resolvedTheme.isLightCard;
    const inputBg = isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)';
    const inputBorder = isLight
      ? resolvedTheme.cardBorderColor || '#E2E8F0'
      : 'rgba(255, 255, 255, 0.12)';

    const previewPackages =
      dbPackages.length > 0
        ? dbPackages
        : [
            { id: 1, name: 'Personal', defaultTokenAmount: 1, price: 250000 },
            { id: 2, name: 'Keluarga', defaultTokenAmount: 5, price: 750000 },
          ];

    const selectedPkg =
      previewPackages.find(
        (p) => (page.formConfig?.featuredPackageId || previewPackages[0]?.id || 1) === p.id
      ) || previewPackages[0];

    return (
      <section
        style={{
          backgroundColor: resolvedTheme.cardBackgroundColor,
          borderColor: isLight
            ? resolvedTheme.cardBorderColor || '#E2E8F0'
            : 'rgba(255, 255, 255, 0.12)',
          boxShadow: isLight
            ? '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0,0,0,0.03)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
        className={`p-4 sm:p-6 ${resolvedTheme.cardRadius} border transition-all duration-300 space-y-4`}
      >
        {/* Header Form */}
        <div className="text-center space-y-1">
          {data.badge && (
            <span
              style={{
                backgroundColor: `${resolvedTheme.primaryColor}14`,
                color: resolvedTheme.primaryColor,
                borderColor: `${resolvedTheme.primaryColor}28`,
              }}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 border"
            >
              <Sparkles className="w-3 h-3" />
              {data.badge}
            </span>
          )}
          <h2
            style={{ color: resolvedTheme.textColor }}
            className="text-base sm:text-lg font-black tracking-tight"
          >
            {data.title || 'Formulir Pemesanan & Checkout'}
          </h2>
          {data.subtitle && (
            <p style={{ color: resolvedTheme.mutedTextColor }} className="text-xs">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* STEP 1: PILIHAN PAKET */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                style={{ color: resolvedTheme.textColor }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <span
                  style={{
                    backgroundColor: resolvedTheme.primaryColor,
                    color: '#FFFFFF',
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm"
                >
                  1
                </span>
                <span>Pilihan Paket Token:</span>
              </span>
              <span
                style={{
                  backgroundColor: `${resolvedTheme.primaryColor}12`,
                  color: resolvedTheme.primaryColor,
                  borderColor: `${resolvedTheme.primaryColor}25`,
                }}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
              >
                ✓ Otomatis DB
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {previewPackages.map((pkg) => {
                const isFeatured =
                  (page.formConfig?.featuredPackageId || previewPackages[0]?.id || 1) === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    style={{
                      borderColor: isFeatured
                        ? resolvedTheme.primaryColor
                        : isLight
                        ? resolvedTheme.cardBorderColor || '#E2E8F0'
                        : 'rgba(255,255,255,0.1)',
                      backgroundColor: isFeatured
                        ? isLight
                          ? `${resolvedTheme.primaryColor}0C`
                          : `${resolvedTheme.primaryColor}22`
                        : isLight
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.03)',
                      boxShadow: isFeatured
                        ? isLight
                          ? `0 6px 16px -3px ${resolvedTheme.primaryColor}20`
                          : 'none'
                        : 'none',
                    }}
                    className="p-3 rounded-xl border flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          style={{
                            color: isFeatured
                              ? isLight
                                ? resolvedTheme.primaryColor
                                : '#FFFFFF'
                              : resolvedTheme.textColor,
                          }}
                          className="text-xs font-bold"
                        >
                          {pkg.name}
                        </span>
                        <span
                          style={{
                            backgroundColor: isFeatured
                              ? resolvedTheme.primaryColor
                              : isLight
                              ? `${resolvedTheme.primaryColor}14`
                              : 'rgba(255,255,255,0.08)',
                            color: isFeatured ? '#FFFFFF' : resolvedTheme.primaryColor,
                            borderColor: `${resolvedTheme.primaryColor}28`,
                          }}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                        >
                          {pkg.defaultTokenAmount || 1} Token
                        </span>
                        {isFeatured && (
                          <span
                            style={{
                              background: `linear-gradient(135deg, ${resolvedTheme.primaryColor}, #F43F5E)`,
                            }}
                            className="text-[9px] text-white font-bold px-1.5 py-0.5 rounded shadow-xs"
                          >
                            Paling Laris 🔥
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: isFeatured
                            ? isLight
                              ? resolvedTheme.primaryColor
                              : '#FBBF24'
                            : resolvedTheme.textColor,
                        }}
                        className="text-xs font-extrabold mt-0.5"
                      >
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div
                      style={{
                        borderColor: isFeatured
                          ? resolvedTheme.primaryColor
                          : isLight
                          ? '#CBD5E1'
                          : 'rgba(255,255,255,0.25)',
                        backgroundColor: isFeatured ? resolvedTheme.primaryColor : 'transparent',
                      }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                    >
                      {isFeatured && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DATA DIRI */}
          <div className="space-y-2 text-left">
            <span
              style={{ color: resolvedTheme.textColor }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span
                style={{
                  backgroundColor: resolvedTheme.primaryColor,
                  color: '#FFFFFF',
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm"
              >
                2
              </span>
              <span>Lengkapi Data Diri:</span>
            </span>

            {/* Nama Lengkap */}
            <div
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
              }}
              className="w-full border rounded-xl flex items-center gap-2 px-3 py-2 text-xs"
            >
              <User
                style={{ color: resolvedTheme.mutedTextColor }}
                className="w-3.5 h-3.5 shrink-0"
              />
              <span style={{ color: resolvedTheme.mutedTextColor }} className="truncate">
                {page.formConfig?.coreFields?.fullName?.placeholder || 'Nama Lengkap Anda'}
              </span>
            </div>

            {/* WhatsApp */}
            <div
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
              }}
              className="w-full border rounded-xl flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Phone
                style={{ color: resolvedTheme.mutedTextColor }}
                className="w-3.5 h-3.5 shrink-0"
              />
              <span style={{ color: resolvedTheme.mutedTextColor }} className="truncate font-mono">
                {page.formConfig?.coreFields?.whatsapp?.placeholder ||
                  'Nomor WhatsApp (08123456789)'}
              </span>
            </div>

            {/* Email */}
            <div
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
              }}
              className="w-full border rounded-xl flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Mail
                style={{ color: resolvedTheme.mutedTextColor }}
                className="w-3.5 h-3.5 shrink-0"
              />
              <span style={{ color: resolvedTheme.mutedTextColor }} className="truncate">
                {page.formConfig?.coreFields?.email?.placeholder || 'Alamat Email Aktif'}
              </span>
            </div>

            {/* Custom Form Fields Preview */}
            {resolveCustomFormFields(page.formConfig)
              .filter((field) => field.enabled !== false)
              .map((field) => (
                <DynamicFormFieldRenderer
                  key={field.id}
                  field={field}
                  value={field.type === 'checkbox' ? [] : ''}
                  theme={page.themeConfig}
                  disabled
                  compact
                />
              ))}
          </div>

          {/* STEP 3: VOUCHER PREVIEW */}
          <div className="space-y-1.5">
            <span
              style={{ color: resolvedTheme.textColor }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span
                style={{
                  backgroundColor: resolvedTheme.primaryColor,
                  color: '#FFFFFF',
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm"
              >
                3
              </span>
              <span>Kupon / Voucher Promo:</span>
            </span>

            {page.formConfig?.defaultVoucherCode ? (
              <div
                style={{
                  borderColor: '#10B981',
                  backgroundColor: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
                }}
                className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-bold text-emerald-700">
                    {page.formConfig.defaultVoucherCode}
                  </span>
                  <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">
                    Diterapkan ✓
                  </span>
                </div>
                <span className="text-emerald-600 font-bold text-[10px]">
                  Diskon Otomatis Aktif
                </span>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                }}
                className="p-2 rounded-xl border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Tag
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="w-3.5 h-3.5"
                  />
                  <span
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="text-[11px]"
                  >
                    Kupon diskon akan otomatis terbaca dari DB
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: `${resolvedTheme.primaryColor}14`,
                    color: resolvedTheme.primaryColor,
                  }}
                  className="text-[9px] font-bold px-2 py-0.5 rounded"
                >
                  Terapkan
                </span>
              </div>
            )}
          </div>

          {/* STEP 4: METODE PEMBAYARAN */}
          <div className="space-y-1.5">
            <span
              style={{ color: resolvedTheme.textColor }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span
                style={{
                  backgroundColor: resolvedTheme.primaryColor,
                  color: '#FFFFFF',
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm"
              >
                4
              </span>
              <span>Metode Pembayaran:</span>
            </span>

            {Boolean(page.formConfig?.enableWhatsappCheckout && page.formConfig?.whatsappAdminNumber?.trim()) ? (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  style={{
                    borderColor: resolvedTheme.primaryColor,
                    backgroundColor: isLight
                      ? `${resolvedTheme.primaryColor}0C`
                      : `${resolvedTheme.primaryColor}22`,
                  }}
                  className="p-2.5 rounded-xl border-2 space-y-1"
                >
                  <QrCode
                    style={{ color: resolvedTheme.primaryColor }}
                    className="w-4 h-4 mx-auto"
                  />
                  <div
                    style={{
                      color: isLight ? resolvedTheme.primaryColor : '#FFFFFF',
                    }}
                    className="text-[11px] font-bold"
                  >
                    Payment Gateway
                  </div>
                  <div
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="text-[9px]"
                  >
                    QRIS • Virtual Account
                  </div>
                </div>

                <div
                  style={{
                    borderColor: isLight
                      ? resolvedTheme.cardBorderColor || '#E2E8F0'
                      : 'rgba(255,255,255,0.1)',
                    backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
                  }}
                  className="p-2.5 rounded-xl border space-y-1"
                >
                  <MessageCircle
                    style={{ color: '#10B981' }}
                    className="w-4 h-4 mx-auto"
                  />
                  <div
                    style={{ color: resolvedTheme.textColor }}
                    className="text-[11px] font-bold"
                  >
                    Order WhatsApp
                  </div>
                  <div
                    style={{ color: resolvedTheme.mutedTextColor }}
                    className="text-[9px]"
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
                }}
                className="p-3 rounded-xl border-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: resolvedTheme.primaryColor,
                      color: '#FFFFFF',
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div
                      style={{
                        color: isLight ? resolvedTheme.primaryColor : '#FFFFFF',
                      }}
                      className="text-xs font-bold"
                    >
                      Payment Gateway Otomatis
                    </div>
                    <div
                      style={{ color: resolvedTheme.mutedTextColor }}
                      className="text-[10px]"
                    >
                      QRIS • Virtual Account • E-Wallet
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: `${resolvedTheme.primaryColor}15`,
                    color: resolvedTheme.primaryColor,
                  }}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                >
                  Otomatis
                </span>
              </div>
            )}
          </div>

          {/* RINGKASAN PEMBAYARAN */}
          <div
            style={{
              backgroundColor: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.25)',
              borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
            }}
            className="p-3 rounded-xl border space-y-1.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <span style={{ color: resolvedTheme.mutedTextColor }}>
                Paket ({selectedPkg.name}):
              </span>
              <span
                style={{ color: resolvedTheme.textColor }}
                className="font-semibold"
              >
                Rp {selectedPkg.price.toLocaleString('id-ID')}
              </span>
            </div>
            <div
              style={{
                borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
              }}
              className="pt-1.5 border-t border-dashed flex items-center justify-between"
            >
              <span
                style={{ color: resolvedTheme.textColor }}
                className="font-bold"
              >
                Total Tagihan:
              </span>
              <span
                style={{
                  color: isLight ? resolvedTheme.primaryColor : '#FBBF24',
                }}
                className="text-base font-black"
              >
                Rp {selectedPkg.price.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* CTA SUBMIT */}
          <button
            type="button"
            style={{
              background: `linear-gradient(135deg, ${resolvedTheme.primaryColor}, ${resolvedTheme.accentColor || resolvedTheme.primaryColor})`,
              color: resolvedTheme.buttonTextColor || '#FFFFFF',
              boxShadow: `0 10px 24px -4px ${resolvedTheme.primaryColor}55`,
            }}
            className={`w-full font-black py-3 px-4 ${resolvedTheme.buttonRadius} text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{page.formConfig?.ctaButtonText || 'AMBIL TES SEKARANG'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>

          <div
            style={{ color: resolvedTheme.mutedTextColor }}
            className="text-[10px] text-center flex items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {page.formConfig?.guaranteeText || 'Transaksi Aman & Terverifikasi Otomatis'}
            </span>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/dashboard/landing-pages')}
            className="rounded-lg text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="font-bold text-gray-900 text-sm sm:text-base border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none bg-transparent px-1 py-0.5 rounded transition max-w-[200px] sm:max-w-xs"
              placeholder="Judul Landing Page..."
            />
            <span className="text-[11px] font-mono text-gray-400 hidden md:inline">
              /lp/{page.slug}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              previewDevice === 'mobile'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setPreviewDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              previewDevice === 'tablet'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              previewDevice === 'desktop'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                page.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {page.isPublished ? 'Live' : 'Draft'}
            </span>
            <Switch
              checked={page.isPublished}
              onCheckedChange={(val) => setPage({ ...page, isPublished: val })}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/lp/${page.slug}`, '_blank')}
            className="rounded-xl text-xs flex items-center gap-1.5 text-gray-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lihat Live</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </Button>
        </div>
      </header>

      {/* Main Dual-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-full md:w-[430px] lg:w-[470px] bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)] z-20 shadow-sm">
          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'sections'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent hover:text-gray-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Bagian ({page.sections.length})
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'theme'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent hover:text-gray-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              Tema & Warna
            </button>
            <button
              onClick={() => setActiveTab('pixels')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'pixels'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent hover:text-gray-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Pixel & Slug
            </button>
          </div>

          {/* Sub-tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: DYNAMIC SECTIONS MANAGER */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Daftar Bagian Halaman:
                    </Label>
                    <Button
                      size="sm"
                      onClick={() => setIsAddSectionOpen(true)}
                      className="h-7 px-2.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Bagian
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {page.sections.map((section, idx) => {
                      const label = getDefaultSectionLabel(section);
                      const isSelected = activeSection?.id === section.id;
                      return (
                        <div
                          key={section.id}
                          onClick={() => setActiveSectionId(section.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-gray-800 truncate">
                              {label}
                            </span>
                          </div>

                          <div
                            className="flex items-center gap-0.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => moveSection(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                              title="Naikkan"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveSection(idx, 'down')}
                              disabled={idx === page.sections.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                              title="Turunkan"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateSection(idx)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                              title="Duplikasi Bagian"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id, label)}
                              className="p-1 text-gray-400 hover:text-rose-600"
                              title="Hapus Bagian"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <Switch
                              checked={section.enabled}
                              onCheckedChange={() => toggleSectionEnabled(section.id)}
                              className="scale-75 ml-0.5"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Section Complete Editor */}
                {activeSection && (
                  <SectionEditorForm
                    section={activeSection}
                    page={page}
                    dbPackages={dbPackages}
                    dbVouchers={dbVouchers}
                    onUpdateSection={updateSection}
                    onUpdatePage={(updater) => setPage((prev) => (prev ? updater(prev) : prev))}
                  />
                )}
              </div>
            )}

            {/* TAB 2: FULL THEME & COLORS CUSTOMIZATION */}
            {activeTab === 'theme' && (
              <ThemeColorEditor
                themeConfig={page.themeConfig}
                onChange={(nextTheme) => setPage({ ...page, themeConfig: nextTheme })}
              />
            )}

            {/* TAB 3: PIXELS & URL SLUG SETTINGS */}
            {activeTab === 'pixels' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <Label className="text-xs font-bold text-gray-700">URL Slug Halaman</Label>
                  <div className="flex items-center">
                    <span className="bg-gray-200 border border-r-0 border-gray-300 px-2.5 py-1.5 rounded-l-lg text-gray-600 font-mono text-xs">
                      /lp/
                    </span>
                    <Input
                      value={page.slug}
                      onChange={(e) =>
                        setPage({
                          ...page,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      className="rounded-l-none font-mono text-xs h-8 bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-indigo-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Tracking Otomatis Iklan Berbayar
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    Masukkan Pixel ID Anda. Sistem otomatis memicu event: <code>PageView</code>,{' '}
                    <code>ViewContent</code>, <code>InitiateCheckout</code>, dan <code>Lead</code>.
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">
                    Meta / Facebook Pixel ID
                  </Label>
                  <Input
                    placeholder="Contoh: 184920491823901"
                    value={page.pixelConfig?.facebookPixelId || ''}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        pixelConfig: { ...page.pixelConfig, facebookPixelId: e.target.value },
                      })
                    }
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">TikTok Pixel ID</Label>
                  <Input
                    placeholder="Contoh: C9KDF93HDKS83"
                    value={page.pixelConfig?.tiktokPixelId || ''}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        pixelConfig: { ...page.pixelConfig, tiktokPixelId: e.target.value },
                      })
                    }
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Google Tag / GTM ID</Label>
                  <Input
                    placeholder="Contoh: G-XXXXXXXXXX"
                    value={page.pixelConfig?.googleTagId || ''}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        pixelConfig: { ...page.pixelConfig, googleTagId: e.target.value },
                      })
                    }
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Live Preview Canvas */}
        <main className="flex-1 bg-slate-900/10 overflow-y-auto flex items-start justify-center p-2 sm:p-6">
          <div
            className={`transition-all duration-300 bg-white shadow-2xl overflow-hidden ${
              previewDevice === 'mobile'
                ? 'w-[375px] my-4 rounded-[42px] border-[10px] border-slate-900 relative ring-1 ring-black/10 min-h-[780px]'
                : previewDevice === 'tablet'
                ? 'w-[768px] my-4 rounded-3xl border-8 border-slate-800 min-h-[800px]'
                : 'w-full max-w-5xl my-4 rounded-xl border border-gray-200 min-h-[800px]'
            }`}
          >
            {previewDevice === 'mobile' && (
              <div className="h-6 bg-slate-900 w-full flex items-center justify-center sticky top-0 z-50">
                <div className="w-28 h-3.5 bg-black rounded-b-xl" />
              </div>
            )}

            {/* LIVE PREVIEW RENDERER */}
            <div
              style={{
                backgroundColor: resolvedTheme.backgroundColor,
                color: resolvedTheme.textColor,
                fontFamily: resolvedTheme.fontFamily,
                ...getBackgroundPatternStyle(resolvedTheme),
              }}
              className="min-h-full pb-20 pointer-events-auto"
            >
              {/* Urgency Bar */}
              {resolvedTheme.showUrgencyBar && (
                <div
                  style={{
                    background: `linear-gradient(90deg, ${resolvedTheme.urgencyBarBgFrom}, ${resolvedTheme.urgencyBarBgTo})`,
                    color: resolvedTheme.urgencyBarTextColor,
                  }}
                  className="text-[11px] font-bold py-2 px-3 text-center flex items-center justify-center gap-2"
                >
                  <Flame className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span>{resolvedTheme.urgencyBarText}</span>
                  <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono">
                    {String(resolvedTheme.urgencyMinutes).padStart(2, '0')}:00
                  </span>
                </div>
              )}

              {/* Optional Header Logo */}
              {resolvedTheme.headerLogoUrl && (
                <div className="pt-4 pb-1 flex justify-center">
                  <img
                    src={resolvedTheme.headerLogoUrl}
                    alt="Logo"
                    className="h-10 object-contain"
                  />
                </div>
              )}

              {/* All Active Sections */}
              <div className="max-w-2xl mx-auto px-4 py-5 space-y-8">
                {page.sections
                  .filter((s) => s.enabled)
                  .map((section) => (
                    <div
                      key={section.id}
                      onClick={() => {
                        setActiveTab('sections');
                        setActiveSectionId(section.id);
                      }}
                      className={`transition rounded-2xl ${
                        activeSection?.id === section.id
                          ? 'ring-2 ring-indigo-500/60 ring-offset-2 ring-offset-transparent'
                          : ''
                      }`}
                    >
                      <LandingPageSectionRenderer
                        section={section}
                        theme={page.themeConfig}
                        isPreview={previewDevice === 'mobile'}
                        renderOrderForm={renderOrderFormPreview}
                      />
                    </div>
                  ))}
              </div>

              {/* Footer */}
              <footer
                style={{
                  borderColor: resolvedTheme.cardBorderColor,
                  color: resolvedTheme.mutedTextColor,
                }}
                className="border-t py-6 px-4 text-center text-[11px]"
              >
                {resolvedTheme.footerText}
              </footer>

              {/* Sticky Mobile Bottom CTA Preview */}
              {previewDevice === 'mobile' && stickyCtaSection && (
                <div className="sticky bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-white/10 backdrop-blur flex items-center justify-between gap-3 z-40">
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-white">
                      {stickyCtaSection.data?.subtext || 'Diskon Terbatas Hari Ini!'}
                    </div>
                    <div className="text-[9px] text-amber-400">Token Asesmen Instan</div>
                  </div>
                  <button
                    type="button"
                    style={{
                      backgroundColor: resolvedTheme.accentColor,
                      color: resolvedTheme.buttonTextColor,
                    }}
                    className={`font-bold px-4 py-2 ${resolvedTheme.buttonRadius} text-xs shrink-0 flex items-center gap-1 shadow-md`}
                  >
                    {stickyCtaSection.data?.buttonText || 'Daftar Sekarang 👉'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah Bagian Dinamis */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Plus className="w-5 h-5 text-indigo-600" />
              Tambah Bagian Halaman Baru
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {SECTION_CATALOG.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleAddSection(item.type)}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition flex items-start gap-3 group"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                    {item.label}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
