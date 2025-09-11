import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint,
  Brain,
  Coins,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { scanFingerprint } from "@/utils/fingerprint";
import { getReferralId } from "@/utils/referral";
import { useMeQuery } from "@/hooks/useAuthQuery";
import TokenPackages from "@/components/ui/TokenPackage";
import { usePackages } from "@/hooks/usePackage";
import { ThinkingStyleRequest } from "@/services/api";
import { TestForm } from "@/components/form/TestForm";
import { useSubmitTest } from "@/hooks/useThinkingStyleTest";

export const CognitiveTest: React.FC = () => {
  const [birthDate, setBirthDate] = useState("");
  const [fullname, setFullname] = useState("");
  const [step, setStep] = useState<
    "token-check" | "birthdate" | "fingerprint" | "processing"
  >("token-check");
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data } = useMeQuery();

  const token = data?.user?.tokens || 0;
  const { data: tokenPackages } = usePackages();
  const {
    mutateAsync: submitTest,
  } = useSubmitTest();

  const handleStartTest = () => {
    if (!user) {
      alert("Silakan login untuk mengikuti tes");
      return;
    }

    if (token <= 0) {
      alert("Token tidak mencukupi. Silakan beli token untuk mengikuti tes.");
      return;
    }

    setStep("birthdate");
  };

 const handleFingerprintScan = async () => {
  setStep("processing");

  try {

    const fingerprintId = await scanFingerprint();
    // Delay 2 menit untuk simulasi proses scan fingerprint
    await new Promise(resolve => setTimeout(resolve, 1000)); // 2 menit
    
    

    const referrerId = getReferralId();
    const referrerIdNumber = referrerId?.split('aff')[1]

    const testData: ThinkingStyleRequest = {
      fullname,
      birthdate: birthDate,
      fingerPrintId: fingerprintId as string, 
      referrerId : referrerIdNumber,
    };

    // ⬇️ Ambil langsung result dari API
    const result = await submitTest(testData);

    console.log(result.data)

    // ⬇️ Arahkan ke result page
    navigate("/customer/dashboard/test/result", {
      state: { testResult: result?.data },
    });
  } catch (error) {
    console.error("Error saving test result:", error);
    navigate("/test/result", {
      state: {
        testResult: { id: "temp", fullname, birthdate: birthDate, fingerprintId: null },
      },
    });
  }
};


  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">
              Memproses Hasil Tes Anda
            </h3>
            <p className="text-gray-600 mb-4">Sedang menganalisis gaya kognitif Anda...</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700">
                <strong>Catatan:</strong> Proses ini membutuhkan waktu sekitar 2 menit untuk memastikan akurasi hasil analisis fingerprint dan gaya berpikir Anda.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 -mt-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl relative mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Display Header */}
            <Card className="w-full left-0 z-[99] max-w-screen mx-auto block top-20 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Coins className="h-8 w-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Token Tes Anda
                      </h3>
                      <p className="text-sm text-gray-600">
                        Setiap tes membutuhkan 1 token
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-600">
                      {token}
                    </div>
                    <p className="text-sm text-gray-500">Tersedia</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {step === "token-check" && (
              <Card className="bg-white">
                <CardHeader className="text-center">
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Tes Gaya Kognitif
                  </h1>
                  <p className="text-gray-600">
                    Temukan pola berpikir unik Anda 
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Cara kerja:
                      </h3>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Satu token diperlukan untuk setiap tes</li>
                        <li>
                          2. Masukkan tanggal lahir Anda dalam format apa pun (DD-MM-YYYY,
                          MM/DD/YYYY, dll.)
                        </li>
                        <li>
                          3. Sistem kami memproses data anda
                        </li>
                        <li>4. Kami memetakan ini ke salah satu dari beberapa gaya kognitif</li>
                        <li>
                          5. Opsional: Verifikasi dengan pemindaian sidik jari biometrik
                        </li>
                      </ol>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-green-900">
                          Manfaat Tes:
                        </h3>
                      </div>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Analisis gaya kognitif yang dipersonalisasi</li>
                        <li>• Wawasan kepribadian yang detail</li>
                        <li>• Rekomendasi karier dan hubungan</li>
                        <li>• Verifikasi biometrik yang aman</li>
                        <li>• Sertifikat hasil yang dapat dibagikan</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleStartTest}
                      className="w-full"
                      size="lg"
                      disabled={!user || token <= 0}
                    >
                      {!user
                        ? "Silakan Login Terlebih Dahulu"
                        : token <= 0
                        ? "Token Tidak Mencukupi"
                        : "Mulai Tes (1 Token)"}
                    </Button>

                    {!user && (
                      <p className="text-center text-sm text-gray-500">
                        Silakan login ke akun Anda untuk mengikuti tes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "birthdate" && (
              <Card className="bg-white">
                <CardHeader className="text-center">
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Tes Gaya Kognitif
                  </h1>
                  <p className="text-gray-600">
                    Masukkan tanggal lahir Anda untuk memulai analisis
                  </p>
                </CardHeader>

                <CardContent>
                  <TestForm
                    onSubmit={(values) => {
                      setFullname(values.fullname);
                      setBirthDate(values.birthdate);
                      setStep("fingerprint");
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {step === "fingerprint" && (
              <Card className="bg-white">
                <CardHeader className="text-center">
                  <Fingerprint className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verifikasi Biometrik
                  </h2>
                  <p className="text-gray-600">
                    Amankan hasil tes Anda dengan autentikasi sidik jari
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-900">
                        Token Berhasil Digunakan
                      </span>
                    </div>
                    <p className="text-sm text-green-800">
                      Analisis tes Anda telah selesai. Sisa token: {token}
                    </p>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Apakah Anda ingin mengamankan hasil dengan verifikasi
                      biometrik?
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={handleFingerprintScan}
                        className="w-full"
                        size="lg"
                      >
                        Pindai
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    <p>
                      • Data sidik jari diproses dengan aman dan tidak disimpan sebagai
                      gambar
                    </p>
                    <p>
                      • Hanya pengenal unik yang disimpan untuk tujuan verifikasi
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Token Purchase Menu */}
          <div className="lg:col-span-1">
            <Card className="top-4 bg-white">
              <CardHeader className="text-center pb-4">
                <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-gray-900">
                  Beli Token
                </h2>
                <p className="text-sm text-gray-600">
                  Pilih paket yang sesuai dengan kebutuhan Anda
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <TokenPackages tokenPackages={tokenPackages} />

                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium text-blue-900 text-sm">
                      Mengapa beli token?
                    </h4>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Ambil beberapa tes kapan saja</li>
                    <li>• Tidak ada tanggal kedaluwarsa</li>
                    <li>• Nilai lebih baik dengan paket bundel</li>
                    <li>• Aktivasi instan</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
