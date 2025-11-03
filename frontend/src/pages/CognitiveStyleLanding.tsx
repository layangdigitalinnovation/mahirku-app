import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Brain, Target, Users, TrendingUp, CheckCircle, Star } from "lucide-react";
import heroImg from "@/assets/Online Learning 5.png";
import dots from "@/assets/Dots.png";

export const CognitiveStyleLanding: React.FC = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Analisis Mendalam",
      description: "Pelajari bagaimana otak Anda memproses informasi dan membuat keputusan"
    },
    {
      icon: Target,
      title: "Rekomendasi Karier",
      description: "Temukan bidang pekerjaan yang paling sesuai dengan gaya kognitif Anda"
    },
    {
      icon: Users,
      title: "Hubungan Sosial",
      description: "Pahami cara Anda berinteraksi dengan orang lain dan bangun hubungan yang lebih baik"
    },
    {
      icon: TrendingUp,
      title: "Pengembangan Diri",
      description: "Dapatkan wawasan untuk mengembangkan potensi dan meningkatkan performa"
    }
  ];

  const testimonials = [
    {
      name: "Ahmad S.",
      role: "Software Engineer",
      content: "Tes ini membantu saya memahami mengapa saya lebih suka bekerja secara sistematis. Sekarang saya tahu cara memaksimalkan kekuatan saya.",
      rating: 5
    },
    {
      name: "Sari P.",
      role: "Manager Marketing",
      content: "Laporan yang detail dan akurat. Saya jadi lebih paham bagaimana cara berpikir saya berbeda dari tim lainnya.",
      rating: 5
    },
    {
      name: "Budi R.",
      role: "Entrepreneur",
      content: "Hasil tes ini membuka mata saya tentang leadership style yang paling cocok untuk saya. Sangat recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="pt-30 pb-20 bg-center relative rounded-b-sm border-b border-b-neutral-200"
        style={{
          backgroundImage: `url(${dots})`,
        }}
      >
        <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="bg-white pt-20 pb-20 px-8 space-y-6 rounded-2xs border border-neutral-200 flex-1">
            <h1 className="text-heading1 max-w-xl text-primary-900 font-bold font-heading">
              Tes Gaya Kognitif
            </h1>
            <p className="text-body1 text-neutral-900 max-w-2xl font-body">
              Temukan pola berpikir unik Anda dan bagaimana hal itu memengaruhi keputusan, karier, dan hubungan sosial Anda.
              Analisis mendalam berdasarkan data ilmiah untuk pemahaman diri yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/test">Mulai Tes Sekarang</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/#paket">Lihat Paket</Link>
              </Button>
            </div>
          </div>
          <div className="bg-white pt-20 pb-20 px-8 border border-neutral-200 rounded-2xs flex-1 flex justify-center">
            <img src={heroImg} alt="Cognitive Style Test" className="max-w-full h-auto" />
          </div>
        </div>
      </section>

      {/* What is Cognitive Style Test */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-800 mb-4">
              Apa itu Tes Gaya Kognitif?
            </h2>
            <p className="md:text-heading6 text-body1 font-body text-gray-600 max-w-4xl mx-auto">
              Tes Gaya Kognitif adalah alat diagnostik yang mengukur bagaimana individu memproses,
              menyimpan, dan menerapkan informasi. Berdasarkan teori psikologi kognitif modern,
              tes ini mengidentifikasi pola berpikir dominan Anda untuk membantu pengembangan diri
              dan pemilihan karier yang tepat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-heading4 font-heading font-bold text-primary-900">
                Berdasarkan Penelitian Ilmiah
              </h3>
              <p className="text-body1 font-body text-gray-700">
                Metode kami dikembangkan berdasarkan penelitian terbaru dalam bidang neuroscience
                dan psikologi kognitif. Kami menggabungkan data dari berbagai sumber ilmiah
                untuk memberikan analisis yang akurat dan dapat diandalkan.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-body1 font-body text-gray-700">
                    Validasi melalui studi longitudinal dengan akurasi 95%
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-body1 font-body text-gray-700">
                    Menggunakan model AI terdepan untuk analisis pola
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-body1 font-body text-gray-700">
                    Hasil dapat dibagikan dan diverifikasi secara digital
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="text-center space-y-4">
                <Brain className="h-16 w-16 text-blue-600 mx-auto" />
                <h4 className="text-heading4 font-heading font-bold text-primary-900">
                  Bagaimana Cara Kerja?
                </h4>
                <ol className="text-left space-y-3 text-body1 font-body text-gray-700">
                  <li className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span>Masukkan data dasar (tanggal lahir)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span>Sistem menganalisis pola kognitif Anda</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span>Dapatkan laporan lengkap dan rekomendasi</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-secondary-50/10">
        <div className="max-w-7xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-800 mb-4">
              Manfaat Tes Gaya Kognitif
            </h2>
            <p className="md:text-heading6 text-body1 font-body text-gray-600 max-w-2xl mx-auto">
              Dengan memahami gaya kognitif Anda, Anda dapat mengoptimalkan potensi dan mencapai kesuksesan di berbagai aspek kehidupan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg hover:scale-105 transition-transform text-center bg-white">
                <CardContent>
                  <benefit.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-heading5 font-heading font-semibold mb-3 text-primary-900">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-body1 text-gray-700">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-heading3 md:text-heading2 font-heading text-primary-700 font-bold">
                10.000+
              </div>
              <div className="text-heading6 font-heading">
                Orang Telah Mengikuti Tes
              </div>
            </div>
            <div>
              <div className="text-heading3 md:text-heading2 font-heading text-primary-700 font-bold">
                95%
              </div>
              <div className="text-heading6 font-heading">Tingkat Akurasi</div>
            </div>
            <div>
              <div className="text-heading3 md:text-heading2 font-heading text-primary-700 font-bold">
                4.8/5
              </div>
              <div className="text-heading6 font-heading">Rating Kepuasan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary-50/10">
        <div className="max-w-7xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-800 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="md:text-heading6 text-body1 font-body text-gray-600 max-w-2xl mx-auto">
              Pengalaman pengguna yang telah mengikuti Tes Gaya Kognitif Mahirku
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white">
                <CardContent>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-body1 font-body text-gray-700 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-primary-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20"
        style={{
          background: `url(${dots})`,
          backgroundSize: "cover",
        }}
      >
        <div className="container max-w-screen-xl mx-auto px-10 sm:px-10 lg:px-8 flex flex-col md:flex-row justify-between gap-10">
          <div className="flex-1">
            <h2 className="text-heading3 md:text-heading2 lg:text-heading1 font-heading font-bold text-primary-900 max-w-3xl mb-6">
              Siap Temukan Gaya Kognitif Anda?
            </h2>
            <p className="text-heading6 font-body text-primary-900 max-w-xl mb-8">
              Bergabunglah dengan ribuan orang yang telah memahami diri mereka lebih dalam.
              Mulai perjalanan pengembangan diri Anda sekarang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Mulai Tes</Link>
              </Button>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-neutral-200">
            <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-heading4 font-heading font-bold text-primary-900 mb-2 text-center">
              Tes Cepat & Akurat
            </h3>
            <p className="text-body1 font-body text-gray-700 text-center">
              Hanya perlu beberapa menit untuk mendapatkan wawasan mendalam tentang pola berpikir Anda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
