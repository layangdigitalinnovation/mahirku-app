import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { DollarSign, TrendingUp, Target, Gift } from "lucide-react";
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

  const  { data : packageCommission } = usePackages()


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ActiveSectionProvider>
        <section
          id="beranda"
          className="relative pt-40 pb-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden"
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
        <section id="cara-kerja" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-heading2 font-heading font-bold text-primary-900 mb-4">
                Cara Kerja Program Affiliator
              </h2>
              <p className="text-heading6 font-body text-gray-600 max-w-2xl mx-auto">
                Proses yang mudah dan straightforward untuk memulai earning Anda
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-heading4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-heading5 font-heading font-semibold mb-3 text-primary-900">
                    {step.title}
                  </h3>
                  <p className="font-body text-gray-600">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-primary-200 -translate-x-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section id="komisi" className="py-20 bg-white">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {packageCommission && packageCommission.length > 0 && packageCommission.map((pkg : PackagePayload, index : number) => (
  <Card
    key={index}
    className={`p-8 text-center relative overflow-hidden`}
  >
    <CardHeader>
      <h3 className="text-heading3 font-bold text-primary-900 mb-2">
        {pkg.name}
      </h3>
    </CardHeader>
    <CardContent>
      <div className="text-heading1 font-heading font-bold text-secondary-300 mb-4">
        {pkg.commissionRate}%
      </div>
    </CardContent>
  </Card>
))}
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
