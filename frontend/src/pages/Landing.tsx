import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import fingerPrint from "@/assets/fingerprint 1.png";
import report from "@/assets/image 3.png"
import consult from "@/assets/image 4.png"
import carrerRecom from "@/assets/image 5.png"
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getReferralId } from "@/utils/referral";

import { HeroSection } from "@/components/section/HeroSection";
import FiturSection from "@/components/section/FiturSection";
import dots from "@/assets/Dots.png"
import cta from "@/assets/Problem_Solving_3-removebg-preview 1.png"
import { CheckIcon } from "lucide-react";
import { useSectionObserver } from "@/hooks/useSectionObserver";

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

  const testPackages = [
    {
      name: "Pribadi",
      price: "Rp250.000",
      benefits: [
        "Tes berbasis sidik jari",
        "Sertifikat hasil tes + Map",
        "Penjelasan hasil secara umum",
        "E-book penjelasan hasil tes",
        "Buku saku gaya berpikir",
      ],
      cta: "/register",
    },
    {
      name: "Grup",
      price: "Rp 499.000",
      benefits: [
        "Tes hingga 3 orang member",
        "Sertifikat & Map untuk tiap peserta",
        "Konsultasi singkat bersama keluarga",
        "Akses grup Telegram keluarga",
        "Buku saku & e-book untuk masing-masing",
      ],
      cta: "/register",
    },
    {
      name: "Perusahaan",
      price: "Rp 1.499.000",
      benefits: [
        "Untuk 10+ peserta (tim / kantor)",
        "Laporan grup + individu",
        "Sesi penjelasan live (Zoom/Offline)",
        "Lisensi laporan untuk HR/Trainer",
        "Tempat tes sesuai permintaan",
      ],
      cta: "/contact",
    },
  ];

  return (
    <div className="min-h-screen">
<HeroSection />

      {/* Fitur Utama */}
<FiturSection/>

      {/* Statistik */}
      <section  className="py-20 bg-secondary-50/10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-heading1 font-heading text-primary-700 font-bold">
                10.000+
              </div>
              <div className="text-heading6 font-heading">Tes Telah Dilakukan</div>
            </div>
            <div>
              <div className="text-heading1 font-heading text-primary-700 font-bold">200+</div>
              <div className="text-heading6 font-heading">Institusi Terdaftar</div>
            </div>
            <div>
              <div className="text-heading1 font-heading text-primary-700 font-bold">98%</div>
              <div className="text-heading6 font-heading">Tingkat Akurasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami */}
      <section id="layanan" key="layanan" className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading1 font-heading font-bold text-primary-800 mb-4">
              Layanan Kami
            </h2>
            <p className="text-heading6 font-body text-gray-600 max-w-2xl mx-auto">
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
                  <p className="font-body ">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Paket */}
      <section id="paket" key="paket" className="py-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading2 font-heading font-bold text-primary-900 mb-4">
              Pilihan Paket Tes
            </h2>
            <p className="text-heading6 font-body text-gray-600 max-w-2xl mx-auto">

              Pilih paket tes yang sesuai untuk Anda, keluarga, atau organisasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testPackages.map((pkg, index) => (
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
                  <div className="text-heading1 font-heading font-bold text-secondary-300 mb-6">
                    {pkg.price}
                  </div>
                  <ul className="space-y-3 bg-white border border-neutral-200 p-6 rounded-xs">
                    {pkg.benefits.map((benefit, i) => (
                      <li key={i} className="text-body2 font-body flex items-center gap-4">
                        <CheckIcon className="w-4 text-primary-300 mr-2" />
                        <span className="w-full">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={pkg.cta}>
                    <Button
                      variant="secondary"
                      className="w-full mt-8"
                    >
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
      <section id="kontak" key="kontak" className="py-20"

        style={{ 
          background: `url(${dots})`,
          backgroundSize: "cover",

         }}
      >
        <div className="contianer max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between gap-10">
          <div>
            <img src={cta} alt="Call To Action" className="bg-cover aspect-square" />
          </div>
          <div className="flex-1">
     <h2 className="text-heading1 font-heading font-bold text-primary-900 max-w-3xl mb-6">
            Siap Menemukan Gaya Berpikir Anda?
          </h2>
          <p className="text-heading6 font-body text-primary-900 max-w-xl mb-8">
            Bergabunglah bersama ribuan orang yang telah menemukan potensinya
            bersama Mahirku.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              variant="secondary"
            >
              Mulai Sekarang
            </Button>
          </Link>
          </div>
     
        </div>
      </section>
    </div>
  );
};
