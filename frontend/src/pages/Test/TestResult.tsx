import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Brain, CheckCircle, Shield, TrendingUp, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMeQuery } from "@/hooks/useAuthQuery";
import { generateCertificatePDF } from "@/utils/certificateGenerator";

export const TestResult: React.FC = () => {
  const location = useLocation();
  const testResult = location.state?.testResult;
  const { data: userData, refetch: refetchUser } = useMeQuery();
  const user = userData?.user;
  const { logout } = useAuth();
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  useEffect(() => {
    if (user?.parent) {
      setOpenUpgradeDialog(true);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!testResult) {
      window.location.href = "/customer/dashboard/test";
    }
  }, [testResult]);

  if (!testResult) {
    return <div>Memuat...</div>;
  }

  const handleDownloadCertificate = async () => {
    setIsGenerating(true);
    try {
      const certificateId = `CST-${testResult.id}-${Date.now().toString(36).toUpperCase()}`;
      const data = {
        studentName: testResult.fullname || user?.fullname || 'Peserta',
        courseName: 'Cognitive Style Assessment',
        completionDate: new Date(testResult.createdAt || new Date()).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        certificateId,
        resultTitle: testResult.thinkingStyle?.type || 'Hasil Test',
      };
      
      await generateCertificatePDF(data, `Sertifikat_CognitiveStyle_${testResult.fullname || 'Peserta'}.pdf`);
    } catch (err) {
      console.error("Gagal mengunduh sertifikat:", err);
      alert("Terjadi kesalahan saat membuat sertifikat.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hasil Gaya Kognitif Anda
          </h1>
          <p className="text-gray-600">Temukan pola berpikir unik Anda</p>
        </div>

        {/* Info Upgrade Affiliator */}
        {user?.parent && (
          <Card className="mb-8 bg-linear-to-r from-yellow-50 to-orange-50 border-yellow-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="shrink-0 p-4 bg-yellow-100 rounded-full text-yellow-600 shadow-sm">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="grow space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Selamat! Akun Anda Telah Di-Upgrade
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Karena Anda telah menyelesaikan Tes Gaya Kognitif, status akun Anda kini menjadi <span className="font-bold text-yellow-700">Affiliator</span>. 
                    Anda sekarang memiliki akses ke Dashboard Affiliator untuk mulai menghasilkan pendapatan.
                  </p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <Button 
                    onClick={handleLogout}
                    className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-200/50 transition-all hover:scale-105"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout & Login Kembali
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Result Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Brain size={48} />
              </div>
              <h2 className="text-3xl font-bold">
                {testResult.thinkingStyle.type}
              </h2>
              <p className="text-gray-600 mt-2">
                {testResult.thinkingStyle.description}
              </p>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Ciri Utama:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-sm rounded-full">
                      {testResult.thinkingStyle.theory}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Detail Tes:</h3>
                  <div className="text-sm space-y-1">
                    {testResult.birthdate && (
                    <p>
                      <span className="font-medium">Tanggal Lahir:</span>{" "}
                      {testResult.birthdate}
                    </p>
                    )}
                    <p>
                      <span className="font-medium">Hasil Test:</span>{" "}
                      {testResult.thinkingStyle.type}
                    </p>
                    {testResult.fingerprintId && (
                      <p className="flex items-center">
                        <Shield size={16} className="mr-1 text-green-500" />
                        <span className="font-medium">
                          Terverifikasi Biometrik
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="space-y-3 flex flex-col">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/thinking-style/${testResult.thinkingStyleId}`}>
                  Lihat Penjelasan Hasil Test
                </Link>
              </Button>
              {/* tombol sertifikat */}
              <Button
                onClick={handleDownloadCertificate}
                variant="secondary"
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? "Membuat Sertifikat..." : "Download Sertifikat"}
              </Button>
            </CardFooter>
          </Card>

          {/* QR Code & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Apa Selanjutnya?</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {!user?.parent ? (
                    <>
                      <Link to="/customer/dashboard" className="block">
                        <Button variant="outline" className="w-full">
                          Lihat Dashboard
                        </Button>
                      </Link>
                      <Link to="/customer/dashboard/test" className="block">
                        <Button variant="ghost" className="w-full">
                          Ambil Tes Lain
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button 
                      onClick={handleLogout} 
                      variant="outline" 
                      className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout & Login ke Dashboard Affiliator
                    </Button>
                  )}
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">💡 Tips Pro:</p>
                  <p>
                    Memahami gaya kognitif Anda dapat membantu membuat keputusan
                    yang lebih baik, berkomunikasi lebih efektif, dan
                    mengoptimalkan pendekatan belajar Anda.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={openUpgradeDialog} onOpenChange={setOpenUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selamat! Akun Anda Telah Di-Upgrade</AlertDialogTitle>
            <AlertDialogDescription>
              Karena Anda telah menyelesaikan Tes Gaya Kognitif, status akun Anda kini menjadi <strong>Affiliator</strong>.
              <br /><br />
              Silakan <strong>Logout</strong> dan Login kembali untuk mengakses Dashboard Affiliator dan mulai menghasilkan pendapatan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nanti Saja</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-primary hover:bg-primary/90">
              Logout Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
