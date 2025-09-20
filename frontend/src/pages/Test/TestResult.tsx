import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Brain, CheckCircle, Shield } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { useDownloadPDFTest } from "@/hooks/useThinkingStyleTest";

export const TestResult: React.FC = () => {
  const location = useLocation();
  const testResult = location.state?.testResult;
  // Hook download PDF
  const { refetch, isFetching } = useDownloadPDFTest(testResult?.id);
  console.log(testResult);

  useEffect(() => {
    if (!testResult) {
      // Redirect if no test result
      window.location.href = "/test";
    }
  }, [testResult]);

  if (!testResult) {
    return <div>Memuat...</div>;
  }

  // Kalau pdfBlob ada, trigger download

  const handleDownloadCertificate = async () => {
    try {
      const { data: blob } = await refetch(); // manual trigger dari hook
      if (!blob) return;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hasil_Tes_${testResult.fullname}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mengunduh sertifikat:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hasil Gaya Kognitif Anda
          </h1>
          <p className="text-gray-600">Temukan pola berpikir unik Anda</p>
        </div>

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
                    <p>
                      <span className="font-medium">Tanggal Lahir:</span>{" "}
                      {testResult.birthdate}
                    </p>
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
                disabled={isFetching}
              >
                {isFetching ? "Mengunduh..." : "Download Sertifikat"}
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
    </div>
  );
};
