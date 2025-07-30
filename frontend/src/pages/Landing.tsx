import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Shield, Zap, Eye, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getReferralId } from '../utils/referral';

export const Landing: React.FC = () => {
  useEffect(() => {
    getReferralId();
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Analisis Gaya Berpikir',
      description: 'Temukan pola berpikir unik Anda melalui tes berbasis biometrik & numerologi.'
    },
    {
      icon: Shield,
      title: 'Verifikasi Sidik Jari & Wajah',
      description: 'Sistem keamanan berbasis biometrik menggunakan fingerprint dan face recognition.'
    },
    {
      icon: Eye,
      title: 'Laporan Mendalam',
      description: 'Dapatkan laporan gaya berpikir dan saran pengembangan diri Anda.'
    },
    {
      icon: TrendingUp,
      title: 'Rekomendasi Karier',
      description: 'Rekomendasi bidang karier berdasarkan hasil tes dan kepribadian.'
    }
  ];

  const services = [
    {
      title: 'Tes Sidik Jari & Wajah',
      description: 'Menggunakan teknologi biometrik untuk hasil akurat.',
      icon: Brain,
    },
    {
      title: 'Laporan Gaya Berpikir',
      description: 'Laporan lengkap dalam bentuk digital & cetak.',
      icon: Eye,
    },
    {
      title: 'Konsultasi Hasil',
      description: 'Dibimbing oleh konsultan untuk memahami hasil tes.',
      icon: Shield,
    },
    {
      title: 'Rekomendasi Karier',
      description: 'Temukan bidang pekerjaan paling sesuai.',
      icon: TrendingUp,
    },
  ];

  const testPackages = [
    {
      name: 'Personal',
      price: 'Rp250.000',
      benefits: [
        'Tes berbasis sidik jari & face recognition',
        'Sertifikat hasil tes + Map',
        'Penjelasan hasil secara umum',
        'E-book penjelasan hasil tes',
        'Buku saku gaya berpikir',
      ],
      cta: '/register',
    },
    {
      name: 'Family',
      price: 'Rp399.000',
      benefits: [
        'Tes hingga 10+ orang anggota keluarga',
        'Sertifikat & Map untuk tiap peserta',
        'Konsultasi singkat bersama keluarga',
        'Akses grup Telegram keluarga',
        'Buku saku & e-book untuk masing-masing',
      ],
      cta: '/register',
    },
    {
      name: 'Enterprise',
      price: 'Rp1.499.000',
      benefits: [
        'Untuk 10+ peserta (tim / kantor)',
        'Laporan grup + individu',
        'Sesi penjelasan live (Zoom/Offline)',
        'Lisensi laporan untuk HR/Trainer',
        'Tempat tes sesuai permintaan',
      ],
      cta: '/contact',
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Brain className="h-20 w-20 text-blue-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Temukan
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
                Gaya Berpikir Anda
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Ungkap rahasia pola pikir Anda melalui tes numerologi dan sistem verifikasi biometrik kami yang canggih.
            </p>
            <div className="space-x-4">
              <Link to="/register">
                <Button size="lg" className="bg-slate-300 text-blue-600 hover:bg-blue-50">
                  <Zap className="mr-2" />
                  Mulai Tes Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Mahirku?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Platform asesmen kognitif paling mutakhir dengan teknologi terkini dan metode terpercaya.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:scale-105 transition-transform">
                <CardContent>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10.000+</div>
              <div className="text-gray-600">Tes Telah Dilakukan</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Institusi Terdaftar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Tingkat Akurasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mahirku menyediakan berbagai layanan untuk memahami gaya berpikir dan membantu Anda mencapai potensi maksimal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg hover:scale-105 transition-transform text-center">
                <CardContent>
                  <service.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Paket */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pilihan Paket Tes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pilih paket tes yang sesuai untuk Anda, keluarga, atau organisasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testPackages.map((pkg, index) => (
              <Card
                key={index}
                className="p-8 shadow-lg border border-blue-200 hover:border-blue-600 hover:shadow-2xl transition-all rounded-2xl flex flex-col text-left"
              >
                <CardContent className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-600 mb-1">{pkg.name}</h3>
                  <div className="text-3xl font-extrabold text-gray-900 mb-6">{pkg.price}</div>
                  <ul className="space-y-3 mb-8">
                    {pkg.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-1 mr-2" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={pkg.cta}>
                    <Button size="lg" className="bg-blue-600 text-white w-full hover:bg-blue-700">
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
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Menemukan Gaya Berpikir Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah bersama ribuan orang yang telah menemukan potensinya bersama Mahirku.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-orange-500 text-blue-600 hover:bg-blue-50">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo & Intro */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Mahirku</h3>
              <p className="text-gray-400 text-sm">
                Platform tes minat bakat dan gaya berpikir berbasis biometrik & numerologi untuk individu, keluarga, dan perusahaan.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Menu</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Beranda</Link></li>
                <li><Link to="/register" className="hover:text-white">Daftar</Link></li>
                <li><Link to="/contact" className="hover:text-white">Kontak</Link></li>
              </ul>
            </div>

            {/* Bantuan */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Bantuan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Kebijakan Privasi</Link></li>
                <li><Link to="/terms" className="hover:text-white">Syarat & Ketentuan</Link></li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Hubungi Kami</h4>
              <p className="text-sm text-gray-400">Alamat: Jl. Siliwangi No.54, Kota Tasikmalaya</p>
              <p className="text-sm text-gray-400">Email: layanggroup@gmail.com</p>
              <p className="text-sm text-gray-400">WhatsApp: +62 857-5995-7956</p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Mahirku. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};
