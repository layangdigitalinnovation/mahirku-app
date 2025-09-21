import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import fingerPrint from "@/assets/fingerprint 1.png";
import report from "@/assets/image 3.png";
import consult from "@/assets/image 4.png";
import carrerRecom from "@/assets/image 5.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getReferralId } from "@/utils/referral";

import { HeroSection } from "@/components/section/HeroSection";
import FiturSection from "@/components/section/FiturSection";
import dots from "@/assets/Dots.png";
import cta from "@/assets/Problem_Solving_3-removebg-preview 1.png";
// import { CheckIcon } from "lucide-react";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { usePackages } from "@/hooks/usePackage";
import { PackagePayload } from "@/services/api";
import formatCurrency from "@/utils/formatCurrency";

export const Landing: React.FC = () => {
  useEffect(() => {
    getReferralId();
  }, []);

  useSectionObserver(["beranda", "layanan", "paket", "kontak"]);

  const services = [
    {
      title: "Tes Sidik Jari",
      description: "Menggunakan teknologi biometrik untuk hasil akurat.",
      icon: fingerPrint,
    },
    {
      title: "Laporan Gaya Berpikir",
      description: "Laporan lengkap dalam bentuk digital & cetak.",
      icon: report,
    },
    {
      title: "Konsultasi Hasil",
      description: "Dibimbing oleh konsultan untuk memahami hasil tes.",
      icon: consult,
    },
    {
      title: "Rekomendasi Karier",
      description: "Temukan bidang pekerjaan paling sesuai.",
      icon: carrerRecom,
    },
  ];

  const { data: testPackages, isLoading } = usePackages();

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Fitur Utama */}
      <FiturSection />

      {/* Statistik */}
      <section className="py-20 bg-secondary-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-heading3 md:text-heading2 font-heading text-primary-700 font-bold">
                10.000+
              </div>
              <div className="text-heading6 font-heading">
                Tes Telah Dilakukan
              </div>
            </div>
            <div>
              <div className="text-heading3 md:text-heading2 font-heading text-primary-700 font-bold">
                200+
              </div>
              <div className="text-heading6 font-heading">
                Institusi Terdaftar
              </div>
            </div>
            <div>
              <div className="text-heading3 md:text-heading2 font-heading text-primary-700 font-bold">
                98%
              </div>
              <div className="text-heading6 font-heading">Tingkat Akurasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami */}
      <section id="layanan" key="layanan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-800 mb-4">
              Layanan Kami
            </h2>
            <p className="md:text-heading6 text-body1 font-body text-gray-600 max-w-2xl mx-auto">
              Mahirku menyediakan berbagai layanan untuk memahami gaya berpikir
              dan membantu Anda mencapai potensi maksimal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg hover:scale-105 transition-transform text-center"
              >
                <CardContent>
                  <img src={service.icon} className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-heading5 font-heading font-semibold mb-3 text-primary-900">
                    {service.title}
                  </h3>
                  <p className="font-body text-body1">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Paket */}
      <section id="paket" key="paket" className="py-20">
        <div className="max-w-7xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-900 mb-4">
              Pilihan Paket Tes
            </h2>
            <p className="md:text-heading6 text-body1 font-body text-gray-600 max-w-2xl mx-auto">
              Pilih paket tes yang sesuai untuk Anda, keluarga, atau organisasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {!isLoading &&
              testPackages?.length > 0 &&
              testPackages.map((pkg: PackagePayload, index: number) => (
                <Card
                  key={index}
                  className="p-6 shadow-lg hover:shadow-2xl transition-all rounded-2xl flex flex-col text-left"
                >
                  <CardHeader>
                    <h3 className="text-heading3 font-bold text-primary-900 mb-1">
                      {pkg.name}
                    </h3>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="text-heading3 md:text-heading2 font-heading font-bold text-secondary-300 mb-6">
                      {formatCurrency(pkg.price)}
                    </div>
                    <ul className="space-y-3 bg-white border border-neutral-200 p-6 rounded-xs">
                      {pkg.description}
                    </ul>
                    <Link to={"/register"}>
                      <Button variant="secondary" className="w-full mt-8">
                        Pilih Paket
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="kontak"
        key="kontak"
        className="py-20"
        style={{
          background: `url(${dots})`,
          backgroundSize: "cover",
        }}
      >
        <div className="contianer max-w-screen-xl mx-auto px-10 sm:px-10 lg:px-8 flex flex-col md:flex-row justify-between gap-10">
          <div>
            <img
              src={cta}
              alt="Call To Action"
              className="bg-cover aspect-square"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-900 max-w-3xl mb-6">
              Siap Menemukan Gaya Berpikir Anda?
            </h2>
            <p className="text-heading6 font-body text-primary-900 max-w-xl mb-8">
              Bergabunglah bersama ribuan orang yang telah menemukan potensinya
              bersama Mahirku.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
