import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  AlertCircle,
  Brain,
  FileQuestion,
  Smartphone,
  CheckCircle,
  ShoppingCart,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeQuery } from "@/hooks/useAuthQuery";
import TokenPackages from "@/components/ui/TokenPackage";
import { usePackages } from "@/hooks/usePackage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const CognitiveTest: React.FC = () => {
  const { data } = useMeQuery();
  const navigate = useNavigate();
  const token = data?.user?.tokens || 0;
  const { data: tokenPackages } = usePackages();
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  if (!tokenPackages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Token Balance Header */}
        <Card className="bg-white border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-20 pointer-events-none" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-50 rounded-2xl">
                  <Coins className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Token Tes Anda
                  </h3>
                  <p className="text-sm text-gray-500">
                    Gunakan untuk mengakses tes premium
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-yellow-600 font-mono tracking-tight">
                  {token}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Token Tersedia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Selection Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilih Tes</h2>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Cognitive Style Test Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-blue-100 cursor-pointer group" onClick={() => setIsMobileModalOpen(true)}>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                  <Brain className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-xl text-blue-900">Tes Gaya Kognitif</CardTitle>
                <CardDescription>
                  Analisis mendalam tentang cara Anda memproses informasi dan belajar menggunakan data biometrik.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Analisis Biometrik Sidik Jari
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Laporan Komprehensif
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full group-hover:translate-x-1 transition-transform" variant="outline">
                  Mulai Tes <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>

            {/* DISC Test Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-indigo-100 cursor-pointer group" onClick={() => navigate('/customer/dashboard/disc-test')}>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                  <FileQuestion className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Tes Kepribadian DISC</CardTitle>
                <CardDescription>
                  Pahami tipe kepribadian Dominance, Influence, Steadiness, dan Compliance Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Kuesioner Psikologi
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Hasil Instan
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full group-hover:translate-x-1 transition-transform" variant="outline">
                  Mulai Tes <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Token Purchase Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Isi Ulang Token</h2>
          </div>

          <TokenPackages tokenPackages={tokenPackages} />
        </div>

      </div>

      {/* Mobile App Redirect Modal */}
      <Dialog open={isMobileModalOpen} onOpenChange={setIsMobileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Smartphone className="w-6 h-6 text-blue-600" />
              Download Aplikasi Mahirku
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Tes Gaya Kognitif menggunakan pemindaian sidik jari biometrik yang hanya tersedia di aplikasi mobile kami.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                Silakan unduh aplikasi Mahirku di Google Play Store untuk melanjutkan tes ini. Token Anda akan tersinkronisasi otomatis.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.mahirku', '_blank')}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.523 15.3414C17.5158 15.3585 17.5026 15.3717 17.4855 15.379L5.78369 22.0305C5.46271 22.2131 5.04858 22.0988 4.86621 21.7778C4.81445 21.6865 4.78711 21.583 4.78711 21.478V2.51953C4.78711 2.15088 5.08545 1.85254 5.45410 1.85254C5.56006 1.85254 5.66357 1.88037 5.75586 1.93262L17.4849 8.60156C17.5019 8.60889 17.5151 8.62207 17.5224 8.63867L12.5273 11.9902L17.523 15.3414ZM22.4229 12.8091L18.6758 14.9385L13.626 11.9902L18.6748 9.04102L22.4229 11.1714C22.7539 11.3594 22.8682 11.7788 22.6807 12.1104C22.6221 12.2148 22.5352 12.3013 22.4229 12.499V12.8091Z" /></svg>
                Buka di Play Store
              </Button>
              <Button variant="ghost" onClick={() => setIsMobileModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
