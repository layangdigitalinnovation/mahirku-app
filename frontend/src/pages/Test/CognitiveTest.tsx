import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  Brain,
  FileQuestion,
  CheckCircle,
  ShoppingCart,
  ChevronRight,
  PenTool
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeQuery } from "@/hooks/useAuthQuery";
import TokenPackages from "@/components/ui/TokenPackage";
import { usePackages } from "@/hooks/usePackage";

export const CognitiveTest: React.FC = () => {
  const { data } = useMeQuery();
  const navigate = useNavigate();
  const token = data?.user?.tokens || 0;
  const { data: tokenPackages } = usePackages();

  if (!tokenPackages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">

            {/* Cognitive Style Test Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-blue-100 cursor-pointer group" onClick={() => navigate('/customer/dashboard/cognitive-data-entry')}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <Brain className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  {data?.user?.parentId && (
                     <span className="bg-linear-to-r from-yellow-500 to-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
                       Unlock Affiliator
                     </span>
                  )}
                </div>
                <CardTitle className="text-xl text-blue-900">Tes Gaya Kognitif</CardTitle>
                <CardDescription>
                  Temukan potensi dan gaya berpikir unik Anda melalui kuesioner asesmen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Asesmen Personal & Anak Usia Dini
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
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                    <FileQuestion className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  {data?.user?.parentId && (
                     <span className="bg-linear-to-r from-yellow-500 to-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
                       Unlock Affiliator
                     </span>
                  )}
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

            {/* Graphology Test Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-purple-100 cursor-pointer group" onClick={() => navigate('/customer/dashboard/graphology-test')}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                    <PenTool className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  {data?.user?.parentId && (
                     <span className="bg-linear-to-r from-yellow-500 to-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
                       Unlock Affiliator
                     </span>
                  )}
                </div>
                <CardTitle className="text-xl text-purple-900">Tes Graphology</CardTitle>
                <CardDescription>
                  Ungkap karakter tersembunyi dari tulisan tangan Anda melalui analisis cerdas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Upload Tulisan Tangan
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
    </div>
  );
};
