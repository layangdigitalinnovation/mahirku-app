import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, TrendingUp, Target, Gift, User, Users, Building2, Briefcase } from "lucide-react";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import dots from "@/assets/Dots.png";
import { ActiveSectionProvider } from "@/context/ActiveSectionContext";
import { usePackages } from "@/hooks/usePackage";
import { PackagePayload } from "@/services/api";

export const AffiliatorLanding: React.FC = () => {
  useSectionObserver([
    "beranda",
    "cara-kerja",
    "daftar",
    "keuntungan",
    "komisi",
  ]);

  const benefits = [
    {
      title: "Komisi Menarik",
      description:
        "Dapatkan komisi hingga 30% dari setiap penjualan yang berhasil",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Sistem Tracking",
      description:
        "Dashboard real-time untuk memantau performa dan earnings Anda",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Support Marketing",
      description: "Materi promosi dan panduan lengkap untuk membantu Anda",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Bonus Referral",
      description: "Bonus tambahan untuk setiap affiliator baru yang Anda ajak",
      icon: Gift,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Daftar Gratis",
      description:
        "Daftarkan diri Anda sebagai affiliator Mahirku tanpa biaya apapun",
    },
    {
      step: "02",
      title: "Dapatkan Link Unik",
      description: "Terima link referral khusus untuk tracking penjualan Anda",
    },
    {
      step: "03",
      title: "Promosikan Produk",
      description:
        "Bagikan link Anda melalui media sosial, website, atau jaringan pribadi",
    },
    {
      step: "04",
      title: "Terima Komisi",
      description:
        "Dapatkan komisi otomatis setiap ada pembelian melalui link Anda",
    },
  ];

  const { data: packageCommission } = usePackages();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ActiveSectionProvider>
        <section
          id="beranda"
          className="relative pt-40 pb-20 bg-linear-to-br from-primary-600 to-primary-800 text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-heading1 font-heading font-bold mb-6 leading-tight">
                Bergabung Jadi Partner <br />
                <span className="text-secondary-300">Affiliator Mahirku</span>
              </h1>
              <p className="text-heading5 font-body mb-8 max-w-3xl mx-auto opacity-90">
                Dapatkan penghasilan tambahan dengan mempromosikan layanan tes
                personality. Komisi menarik menanti Anda!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/affiliator/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary-800"
                  >
                    Daftar Sekarang Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-heading1 font-heading text-primary-700 font-bold mb-2">
                  500+
                </div>
                <div className="text-heading6 font-heading text-gray-600">
                  Affiliator Aktif
                </div>
              </div>
              <div>
                <div className="text-heading1 font-heading text-primary-700 font-bold mb-2">
                  30%
                </div>
                <div className="text-heading6 font-heading text-gray-600">
                  Komisi Maksimal
                </div>
              </div>
              <div>
                <div className="text-heading1 font-heading text-primary-700 font-bold mb-2">
                  2.5M+
                </div>
                <div className="text-heading6 font-heading text-gray-600">
                  Total Komisi Dibayar
                </div>
              </div>
              <div>
                <div className="text-heading1 font-heading text-primary-700 font-bold mb-2">
                  24/7
                </div>
                <div className="text-heading6 font-heading text-gray-600">
                  Support Tersedia
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="keuntungan" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-heading2 font-heading font-bold text-primary-900 mb-4">
                Keuntungan Menjadi Affiliator
              </h2>
              <p className="text-heading6 font-body text-gray-600 max-w-2xl mx-auto">
                Bergabunglah dengan program affiliator yang memberikan
                keuntungan maksimal untuk Anda
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all text-center group"
                >
                  <CardContent>
                    <div
                      className={`${benefit.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                    <h3 className="text-heading5 font-heading font-semibold mb-3 text-primary-900">
                      {benefit.title}
                    </h3>
                    <p className="font-body text-gray-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="cara-kerja" className="py-20 bg-linear-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-heading2 font-heading font-bold text-primary-900 mb-4">
                Cara Kerja Program Affiliator
              </h2>
              <p className="text-heading6 font-body text-gray-600 max-w-2xl mx-auto">
                Proses yang mudah dan straightforward untuk memulai earning Anda
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                // Gradient colors for each step
                const stepColors = [
                  {
                    gradient: 'from-blue-500 to-cyan-500',
                    bgGradient: 'from-blue-50 to-cyan-50',
                    shadow: 'hover:shadow-blue-200',
                  },
                  {
                    gradient: 'from-purple-500 to-pink-500',
                    bgGradient: 'from-purple-50 to-pink-50',
                    shadow: 'hover:shadow-purple-200',
                  },
                  {
                    gradient: 'from-emerald-500 to-teal-500',
                    bgGradient: 'from-emerald-50 to-teal-50',
                    shadow: 'hover:shadow-emerald-200',
                  },
                  {
                    gradient: 'from-amber-500 to-orange-500',
                    bgGradient: 'from-amber-50 to-orange-50',
                    shadow: 'hover:shadow-amber-200',
                  },
                ];
                const colors = stepColors[index];

                return (
                  <Card
                    key={index}
                    className={`group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${colors.shadow}`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-linear-to-br ${colors.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/30 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>

                    <CardContent className="relative z-10 p-8 text-center">
                      {/* Step Number Badge */}
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br ${colors.gradient} shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <span className="text-3xl font-heading font-extrabold text-white">
                          {step.step}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-heading font-bold mb-3 text-primary-900 group-hover:text-primary-700 transition-colors duration-300">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm font-body text-gray-600 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Progress Indicator - Small dot at bottom */}
                      <div className="mt-6 flex justify-center gap-1.5">
                        {steps.map((_, dotIndex) => (
                          <div
                            key={dotIndex}
                            className={`h-1.5 rounded-full transition-all duration-300 ${dotIndex === index
                                ? `w-8 bg-linear-to-r ${colors.gradient}`
                                : 'w-1.5 bg-gray-300'
                              }`}
                          ></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section id="komisi" className="py-20 bg-linear-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-heading2 font-heading font-bold text-primary-900 mb-4">
                Struktur Komisi Berjenjang
              </h2>
              <p className="text-heading6 font-body text-gray-600 max-w-2xl mx-auto">
                Semakin banyak penjualan, semakin besar komisi yang Anda
                dapatkan
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packageCommission &&
                packageCommission.length > 0 &&
                packageCommission.map((pkg: PackagePayload, index: number) => {
                  // Define icons and colors for each category
                  const categoryConfig: Record<string, { icon: any, gradient: string, iconBg: string, iconColor: string }> = {
                    'Personal': {
                      icon: User,
                      gradient: 'from-blue-500 via-blue-400 to-cyan-400',
                      iconBg: 'bg-blue-100',
                      iconColor: 'text-blue-600'
                    },
                    'Keluarga': {
                      icon: Users,
                      gradient: 'from-purple-500 via-purple-400 to-pink-400',
                      iconBg: 'bg-purple-100',
                      iconColor: 'text-purple-600'
                    },
                    'Lembaga / Komunitas': {
                      icon: Building2,
                      gradient: 'from-emerald-500 via-emerald-400 to-teal-400',
                      iconBg: 'bg-emerald-100',
                      iconColor: 'text-emerald-600'
                    },
                    'Bisnis': {
                      icon: Briefcase,
                      gradient: 'from-amber-500 via-orange-400 to-yellow-400',
                      iconBg: 'bg-amber-100',
                      iconColor: 'text-amber-600'
                    }
                  };

                  const config = categoryConfig[pkg.name] || {
                    icon: Target,
                    gradient: 'from-gray-500 via-gray-400 to-slate-400',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600'
                  };

                  const IconComponent = config.icon;

                  return (
                    <Card
                      key={index}
                      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                    >
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-linear-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

                      {/* Decorative Circle */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                      <CardHeader className="pb-4 pt-8 relative z-10">
                        {/* Icon */}
                        <div className={`${config.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
                        </div>

                        {/* Category Name */}
                        <h3 className="text-xs sm:text-sm font-heading font-bold text-primary-900 mb-1 whitespace-nowrap px-4 text-center">
                          {pkg.name}
                        </h3>
                      </CardHeader>

                      <CardContent className="pb-8 relative z-10 text-center">
                        {/* Commission Rate */}
                        <div className={`text-5xl font-heading font-extrabold bg-linear-to-br ${config.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                          {Math.round(pkg.commissionRate)}%
                        </div>

                        {/* Label */}
                        <div className="inline-block px-4 py-1.5 bg-linear-to-r from-primary-50 to-primary-100 rounded-full">
                          <span className="text-xs font-semibold text-primary-700">Komisi</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="daftar"
          className="py-20"
          style={{
            background: `url(${dots})`,
            backgroundSize: "cover",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-heading1 font-heading font-bold text-primary-900 mb-6">
              Mulai Perjalanan Affiliator Anda Hari Ini
            </h2>
            <p className="text-heading5 font-body text-primary-900 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ratusan affiliator sukses lainnya dan mulai
              raih penghasilan tambahan dari rumah
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/affiliator/register">
                <Button size="lg" variant="secondary">
                  Daftar Gratis Sekarang
                </Button>
              </Link>
              <Link to="/kontak">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-600 text-primary-600"
                >
                  Hubungi Tim Kami
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ActiveSectionProvider>
    </div>
  );
};
