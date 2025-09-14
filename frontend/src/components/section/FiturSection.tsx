import { useState } from "react"
import brain from "@/assets/brain 1.png"
import fingerScan from "@/assets/fingerprint 1.png"
import report from "@/assets/image 1.png"
import carreer from "@/assets/image 2.png"
import featureImage from "@/assets/Smart_People_1-removebg-preview 1.png"


import { PlusCircleIcon, MinusCircleIcon } from "lucide-react"

const features = [
  {
    id: 1,
    title: "Analisis Gaya Berpikir",
    description:
      "Temukan pola berpikir unik dan karakteristik pribadi Anda melalui tes komprehensif yang menggabungkan teknologi biometrik modern dan analisis numerologi mendalam. Hasil tes akan memberikan wawasan berharga tentang cara Anda memproses informasi dan membuat keputusan. Dengan pemahaman mendalam tentang gaya berpikir Anda, Anda dapat mengoptimalkan potensi diri dan meningkatkan efektivitas dalam pembelajaran dan pengambilan keputusan sehari-hari.",
    icon: brain,
  },
  {
    id: 2,
    title: "Verifikasi Sidik Jari",
    description:
      "Sistem keamanan berbasis biometrik menggunakan fingerprint yang memastikan keakuratan dan keamanan data Anda. Teknologi pemindaian sidik jari canggih kami menggunakan algoritma enkripsi terkini untuk melindungi informasi pribadi Anda. Proses verifikasi yang cepat dan aman ini memungkinkan Anda untuk mengakses hasil tes dan laporan dengan mudah sambil menjaga privasi data sensitif.",
    icon: fingerScan,

  },
  {
    id: 3,
    title: "Laporan Mendalam",
    description:
      "Dapatkan laporan gaya berpikir dan saran pengembangan diri Anda yang komprehensif dan terperinci. Laporan ini mencakup analisis mendalam tentang kekuatan dan area pengembangan Anda, disertai dengan rekomendasi praktis untuk peningkatan diri. Setiap laporan disesuaikan secara personal dan mencakup strategi konkret untuk mengoptimalkan potensi Anda dalam berbagai aspek kehidupan.",
    icon: report,

  },
  {
    id: 4,
    title: "Rekomendasi Karier",
    description:
      "Rekomendasi bidang karier yang dipersonalisasi berdasarkan hasil tes dan analisis kepribadian Anda. Kami menggunakan algoritma canggih yang mencocokkan profil Anda dengan ribuan jalur karier potensial, memberikan wawasan tentang industri dan posisi yang paling sesuai dengan gaya berpikir dan kepribadian Anda. Termasuk juga panduan langkah-langkah konkret untuk mencapai tujuan karier Anda.",
    icon: carreer,

  }
]

export default function FiturSection() {
  const [openId, setOpenId] = useState<number | null>(1)

  const toggleFeature = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className="py-20 bg-white">

      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-heading1 font-heading font-bold text-primary-900 mb-4">
            Mengapa Memilih{" "}
            <span className="text-secondary-300">Mahirku</span>?
          </h2>
          <p className="text-heading6 text-neutral-900 font-body max-w-2xl mx-auto">
            Platform asesmen kognitif paling mutakhir dengan teknologi terkini
            dan metode terpercaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Kiri: Collapsible Feature List */}
          <div className="space-y-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="border-b border-b-neutral-200 pb-4"
              >
                <button
                  onClick={() => toggleFeature(feature.id)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-4 text-left">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                    />
                    <h3 className="text-heading4 font-heading font-bold text-primary-900">
                      {feature.title}
                    </h3>
                  </div>
                  {openId === feature.id ? (
                    <MinusCircleIcon size={20} className="text-primary-900" />
                  ) : (
                    <PlusCircleIcon size={20} className="text-primary-900" />
                  )}
                </button>

                {/* Deskripsi collapsible */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openId === feature.id ? "max-h-40 mt-3" : "max-h-0"
                  }`}
                >
                  <p className="text-body1 my-4 font-body text-neutral-900 max-w-xl">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Kanan: Image Ilustrasi */}
          <div className="flex justify-end">
            <img
              src={featureImage}

              alt="Ilustrasi Fitur"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
