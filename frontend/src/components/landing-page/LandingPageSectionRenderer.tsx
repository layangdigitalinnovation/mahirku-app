import React from 'react';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  Star,
  ArrowRight,
} from 'lucide-react';
import { SectionBlock, LandingPageThemeConfig } from '@/types/landingPage';
import { resolveTheme } from '@/utils/landingPageMedia';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';

interface LandingPageSectionRendererProps {
  section: SectionBlock;
  theme?: LandingPageThemeConfig;
  isPreview?: boolean;
  onCtaClick?: () => void;
  renderOrderForm?: (section: SectionBlock) => React.ReactNode;
}

export const LandingPageSectionRenderer: React.FC<LandingPageSectionRendererProps> = ({
  section,
  theme: rawTheme,
  isPreview = false,
  onCtaClick,
  renderOrderForm,
}) => {
  const theme = resolveTheme(rawTheme);
  const type = section.type || section.id;
  const data = section.data || {};

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.cardBackgroundColor,
    borderColor: theme.cardBorderColor,
  };

  // 1. HERO SECTION
  if (type === 'hero') {
    return (
      <section className="text-center space-y-5 pt-2">
        {data.badgeText && (
          <div
            style={{
              borderColor: `${theme.primaryColor}40`,
              backgroundColor: `${theme.primaryColor}18`,
              color: theme.accentColor,
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            {data.badgeText}
          </div>
        )}

        <h1
          style={{ color: theme.textColor }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight"
        >
          {data.headline}
        </h1>

        {data.subheadline && (
          <p
            style={{ color: theme.mutedTextColor }}
            className="text-xs sm:text-base leading-relaxed max-w-xl mx-auto"
          >
            {data.subheadline}
          </p>
        )}

        {/* Hero Video (jika diisi) */}
        {data.heroVideoUrl && (
          <div className="max-w-lg mx-auto pt-1">
            <VideoEmbedPlayer
              videoUrl={data.heroVideoUrl}
              aspectRatio={data.heroVideoAspect || 'auto'}
              cardRadius={theme.cardRadius}
            />
          </div>
        )}

        {/* Hero Image (jika diisi dan video tidak menutupinya) */}
        {data.heroImage && (
          <div
            style={{ borderColor: theme.cardBorderColor }}
            className={`relative overflow-hidden border shadow-2xl mx-auto max-w-lg group ${theme.cardRadius}`}
          >
            <img
              src={data.heroImage}
              alt={data.headline || 'Hero Mahirku'}
              className={`w-full object-cover ${isPreview ? 'h-48' : 'h-56 sm:h-72'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold">
              <span className="bg-slate-900/90 text-amber-400 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {data.floatingBadges?.[0]?.text || 'Akurasi AI 96.4%'}
              </span>
              <span className="bg-slate-900/90 text-white backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-md">
                <FileText className="w-4 h-4 text-blue-400" />
                {data.floatingBadges?.[1]?.text || 'Laporan 25+ Hal PDF'}
              </span>
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={onCtaClick}
            style={{
              backgroundColor: theme.accentColor,
              color: theme.buttonTextColor,
            }}
            className={`w-full font-black py-4 px-6 ${theme.buttonRadius} text-xs sm:text-base shadow-xl active:scale-95 hover:brightness-110 transition duration-200 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer`}
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>{data.ctaText || 'AMBIL TES KARAKTER SEKARANG'}</span>
          </button>

          {data.statsText && (
            <div
              style={{ color: theme.mutedTextColor }}
              className="flex items-center justify-center gap-2 text-xs"
            >
              <div className="flex" style={{ color: theme.accentColor }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>{data.statsText}</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 2. VIDEO SECTION (YouTube, TikTok, IG Reels, Facebook, Vimeo, MP4)
  if (type === 'video') {
    return (
      <section
        style={cardStyle}
        className={`p-5 sm:p-6 ${theme.cardRadius} border space-y-4`}
      >
        <div className="text-center space-y-1.5">
          {data.badge && (
            <span
              style={{ color: theme.accentColor }}
              className="text-xs font-bold uppercase tracking-wider block"
            >
              {data.badge}
            </span>
          )}
          {data.title && (
            <h2 style={{ color: theme.textColor }} className="text-xl sm:text-2xl font-black">
              {data.title}
            </h2>
          )}
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-lg mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <VideoEmbedPlayer
          videoUrl={data.videoUrl}
          aspectRatio={data.aspectRatio || 'auto'}
          cardRadius={theme.cardRadius}
          autoplayMuted={Boolean(data.autoplayMuted)}
        />

        {data.caption && (
          <p style={{ color: theme.mutedTextColor }} className="text-center text-xs italic">
            {data.caption}
          </p>
        )}

        {data.showCta && data.ctaText && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onCtaClick}
              style={{
                backgroundColor: theme.accentColor,
                color: theme.buttonTextColor,
              }}
              className={`w-full font-extrabold py-3.5 px-5 ${theme.buttonRadius} text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer`}
            >
              <span>{data.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    );
  }

  // 3. MEDIA & RICH CONTENT SECTION (Upload Image + Narasi + Bullet Points + CTA)
  if (type === 'mediaContent' || type === 'custom') {
    const layout = data.layout || 'image-top';
    const isSideBySide = !isPreview && (layout === 'image-left' || layout === 'image-right');

    return (
      <section
        style={cardStyle}
        className={`p-5 sm:p-6 ${theme.cardRadius} border space-y-4`}
      >
        <div
          className={
            isSideBySide
              ? `grid grid-cols-1 sm:grid-cols-2 gap-5 items-center`
              : 'space-y-4'
          }
        >
          {data.imageUrl && (layout === 'image-top' || layout === 'image-left') && (
            <div
              style={{ borderColor: theme.cardBorderColor }}
              className={`overflow-hidden border shadow-lg ${theme.cardRadius}`}
            >
              <img
                src={data.imageUrl}
                alt={data.title || 'Konten Gambar'}
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            {data.badge && (
              <span
                style={{
                  backgroundColor: `${theme.primaryColor}20`,
                  color: theme.primaryColor,
                }}
                className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              >
                {data.badge}
              </span>
            )}

            {data.title && (
              <h2 style={{ color: theme.textColor }} className="text-xl sm:text-2xl font-black leading-snug">
                {data.title}
              </h2>
            )}

            {data.content && (
              <p
                style={{ color: theme.mutedTextColor }}
                className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
              >
                {data.content}
              </p>
            )}

            {Array.isArray(data.bullets) && data.bullets.length > 0 && (
              <ul className="space-y-2 pt-1">
                {data.bullets.map((b: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: theme.primaryColor }}
                    />
                    <span style={{ color: theme.textColor }}>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {data.showCta && data.ctaText && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onCtaClick}
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.buttonTextColor,
                  }}
                  className={`w-full font-extrabold py-3 px-5 ${theme.buttonRadius} text-xs sm:text-sm shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 uppercase cursor-pointer`}
                >
                  <span>{data.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {data.imageUrl && (layout === 'image-bottom' || layout === 'image-right') && (
            <div
              style={{ borderColor: theme.cardBorderColor }}
              className={`overflow-hidden border shadow-lg ${theme.cardRadius}`}
            >
              <img
                src={data.imageUrl}
                alt={data.title || 'Konten Gambar'}
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // 4. GALLERY SECTION (Multiple Images)
  if (type === 'gallery') {
    const cols = data.columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';
    return (
      <section className="space-y-4">
        <div className="text-center space-y-1">
          {data.badge && (
            <span style={{ color: theme.primaryColor }} className="text-xs font-bold uppercase tracking-wider">
              {data.badge}
            </span>
          )}
          {data.title && (
            <h2 style={{ color: theme.textColor }} className="text-xl sm:text-2xl font-black">
              {data.title}
            </h2>
          )}
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-lg mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className={`grid ${isPreview && data.columns !== 1 ? 'grid-cols-2' : cols} gap-3`}>
          {data.items?.map((item: any, idx: number) => (
            <div
              key={idx}
              style={cardStyle}
              className={`overflow-hidden border ${theme.cardRadius} flex flex-col`}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.caption || `Galeri ${idx + 1}`}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-black/20 flex items-center justify-center text-xs text-gray-500">
                  Belum ada gambar
                </div>
              )}
              {item.caption && (
                <div
                  style={{ color: theme.textColor }}
                  className="p-2.5 text-xs font-semibold text-center"
                >
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 5. PAIN POINTS
  if (type === 'painPoints') {
    return (
      <section style={cardStyle} className={`p-5 sm:p-6 ${theme.cardRadius} border space-y-5`}>
        <div className="text-center space-y-1">
          <span
            style={{ color: theme.secondaryColor }}
            className="text-xs font-bold uppercase tracking-wider"
          >
            {data.badge || '⚠️ KENAPA BANYAK ORANG MENTOK?'}
          </span>
          <h2 style={{ color: theme.textColor }} className="text-xl sm:text-2xl font-extrabold">
            {data.title}
          </h2>
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-lg mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className={`grid ${isPreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
          {data.items?.map((item: any, i: number) => (
            <div
              key={i}
              style={{
                borderColor: theme.cardBorderColor,
                backgroundColor: theme.isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.35)',
              }}
              className={`p-4 ${theme.cardRadius} border flex items-start gap-3`}
            >
              <div
                style={{
                  backgroundColor: `${theme.secondaryColor}22`,
                  color: theme.secondaryColor,
                }}
                className="p-2 rounded-xl shrink-0"
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 style={{ color: theme.textColor }} className="text-xs sm:text-sm font-bold">
                  {item.title}
                </h4>
                <p style={{ color: theme.mutedTextColor }} className="text-xs mt-1 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 6. CHARACTER ARCHETYPES / CARDS
  if (type === 'characterArchetypes') {
    return (
      <section className="space-y-5">
        <div className="text-center space-y-1.5">
          <span
            style={{ color: theme.primaryColor }}
            className="text-xs font-bold uppercase tracking-wider"
          >
            {data.badge || '🔮 8 BLUEPRINT KARAKTER'}
          </span>
          <h2 style={{ color: theme.textColor }} className="text-xl sm:text-3xl font-black">
            {data.title}
          </h2>
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-lg mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className={`grid ${isPreview ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 gap-3.5'}`}>
          {data.items?.map((item: any, i: number) => {
            const badgeColor = item.color || theme.primaryColor;
            return (
              <div
                key={i}
                style={cardStyle}
                className={`p-3.5 sm:p-4 ${theme.cardRadius} border space-y-2 relative overflow-hidden`}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-24 object-cover rounded-xl mb-1"
                  />
                )}
                <div className="flex items-center justify-between gap-1">
                  <span
                    style={{
                      backgroundColor: `${badgeColor}25`,
                      color: badgeColor,
                      borderColor: `${badgeColor}45`,
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border truncate"
                  >
                    {item.badge}
                  </span>
                  <span style={{ color: theme.mutedTextColor }} className="text-[10px] font-mono">
                    #0{i + 1}
                  </span>
                </div>

                <h4 style={{ color: theme.textColor }} className="text-xs sm:text-sm font-extrabold">
                  {item.name}
                </h4>
                <p style={{ color: theme.mutedTextColor }} className="text-[11px] sm:text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onCtaClick}
            style={{ color: theme.accentColor }}
            className="text-xs sm:text-sm font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Cek selengkapnya di formulir di bawah 👉
          </button>
        </div>
      </section>
    );
  }

  // 7. BENEFITS
  if (type === 'benefits') {
    return (
      <section style={cardStyle} className={`p-5 sm:p-6 ${theme.cardRadius} border space-y-5`}>
        <div className="text-center space-y-1">
          <span
            style={{ color: theme.primaryColor }}
            className="text-xs font-bold uppercase tracking-wider"
          >
            {data.badge || '📊 LAPORAN KOMPREHENSIF'}
          </span>
          <h2 style={{ color: theme.textColor }} className="text-xl sm:text-2xl font-black">
            {data.title}
          </h2>
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-lg mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {data.imageUrl && (
          <div className={`overflow-hidden border ${theme.cardRadius}`} style={{ borderColor: theme.cardBorderColor }}>
            <img src={data.imageUrl} alt={data.title} className="w-full max-h-60 object-cover" />
          </div>
        )}

        <div className={`grid ${isPreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
          {data.items?.map((item: any, i: number) => (
            <div
              key={i}
              style={{
                borderColor: theme.cardBorderColor,
                backgroundColor: theme.isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.35)',
              }}
              className={`p-3.5 ${theme.cardRadius} border flex items-start gap-3`}
            >
              <div
                style={{
                  backgroundColor: `${theme.primaryColor}20`,
                  color: theme.primaryColor,
                }}
                className="p-2 rounded-xl shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 style={{ color: theme.textColor }} className="text-xs sm:text-sm font-bold">
                  {item.title}
                </h4>
                <p style={{ color: theme.mutedTextColor }} className="text-xs mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 8. CTA BANNER
  if (type === 'ctaBanner') {
    return (
      <section
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor}28, ${theme.accentColor}22)`,
          borderColor: `${theme.accentColor}50`,
        }}
        className={`p-6 ${theme.cardRadius} border-2 text-center space-y-4`}
      >
        {data.badge && (
          <span
            style={{
              backgroundColor: `${theme.accentColor}25`,
              color: theme.accentColor,
            }}
            className="inline-block text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
          >
            {data.badge}
          </span>
        )}
        <h2 style={{ color: theme.textColor }} className="text-xl sm:text-2xl font-black">
          {data.title}
        </h2>
        {data.subtitle && (
          <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-md mx-auto">
            {data.subtitle}
          </p>
        )}
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt={data.title}
            className={`w-full max-h-52 object-cover mx-auto ${theme.cardRadius}`}
          />
        )}
        <button
          type="button"
          onClick={onCtaClick}
          style={{
            backgroundColor: theme.accentColor,
            color: theme.buttonTextColor,
          }}
          className={`w-full font-black py-3.5 px-6 ${theme.buttonRadius} text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer`}
        >
          <Flame className="w-4 h-4" />
          <span>{data.ctaText || 'AMBIL PENAWARAN SEKARANG'}</span>
        </button>
      </section>
    );
  }

  // 9. TESTIMONIALS
  if (type === 'testimonials') {
    return (
      <section className="space-y-5">
        <div className="text-center space-y-1">
          <span style={{ color: theme.accentColor }} className="text-xs font-bold uppercase tracking-wider">
            {data.badge || '💬 BUKTI NYATA'}
          </span>
          <h2 style={{ color: theme.textColor }} className="text-xl sm:text-3xl font-black">
            {data.title}
          </h2>
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm max-w-lg mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {data.items?.map((item: any, i: number) => (
            <div key={i} style={cardStyle} className={`p-4 sm:p-5 ${theme.cardRadius} border space-y-3`}>
              <div className="flex items-center gap-3">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{ borderColor: theme.accentColor }}
                    className="w-11 h-11 rounded-full object-cover border-2"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                  >
                    {(item.name || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <h4 style={{ color: theme.textColor }} className="text-sm font-bold">
                    {item.name}
                  </h4>
                  <p style={{ color: theme.mutedTextColor }} className="text-xs">
                    {item.role}
                  </p>
                </div>
                <div className="ml-auto flex" style={{ color: theme.accentColor }}>
                  {[...Array(Number(item.rating) || 5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <p style={{ color: theme.textColor }} className="text-xs sm:text-sm italic leading-relaxed opacity-90">
                "{item.comment}"
              </p>

              {item.proofImageUrl && (
                <div className="pt-1">
                  <img
                    src={item.proofImageUrl}
                    alt={`Bukti ${item.name}`}
                    className="w-full max-h-56 object-contain rounded-xl border border-white/10 bg-black/20"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 10. FAQ
  if (type === 'faq') {
    return (
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <span style={{ color: theme.primaryColor }} className="text-xs font-bold uppercase tracking-wider">
            {data.badge || '❓ TANYA JAWAB'}
          </span>
          <h2 style={{ color: theme.textColor }} className="text-xl sm:text-3xl font-black">
            {data.title}
          </h2>
          {data.subtitle && (
            <p style={{ color: theme.mutedTextColor }} className="text-xs sm:text-sm">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          {data.items?.map((faq: any, i: number) => (
            <details
              key={i}
              style={cardStyle}
              className={`group p-4 ${theme.cardRadius} border transition`}
            >
              <summary
                style={{ color: theme.textColor }}
                className="font-bold text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between gap-2"
              >
                <span>{faq.question}</span>
                <ChevronDown className="w-4 h-4 shrink-0 opacity-60 group-open:rotate-180 transition" />
              </summary>
              <p
                style={{ color: theme.mutedTextColor, borderColor: theme.cardBorderColor }}
                className="text-xs mt-2.5 leading-relaxed pt-2 border-t"
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    );
  }

  // 11. ORDER FORM (Delegate to custom interactive renderer if provided)
  if (type === 'orderForm') {
    if (renderOrderForm) return <>{renderOrderForm(section)}</>;
    return (
      <section
        style={{
          backgroundColor: theme.cardBackgroundColor,
          borderColor: theme.cardBorderColor,
        }}
        className={`p-6 ${theme.cardRadius} border text-center space-y-3`}
      >
        <span
          style={{
            backgroundColor: `${theme.primaryColor}15`,
            color: theme.primaryColor,
          }}
          className="text-xs font-bold px-3 py-1 rounded-full uppercase"
        >
          {data.badge || '📝 FORMULIR'}
        </span>
        <h3 style={{ color: theme.textColor }} className="text-xl font-bold">
          {data.title || 'Formulir Pemesanan'}
        </h3>
        <p style={{ color: theme.mutedTextColor }} className="text-xs max-w-md mx-auto">
          {data.subtitle || 'Formulir pemesanan akan ditampilkan di sini.'}
        </p>
      </section>
    );
  }

  return null;
};

