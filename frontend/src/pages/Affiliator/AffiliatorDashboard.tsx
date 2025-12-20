/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TrendingUp, Users, Wallet, Crown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { useAffiliateStats, useReferralLink, useCheckMitraEligibility, useUpgradeToMitra } from "@/hooks/useAffiliator";

export const AffiliatorDashboard: React.FC = () => {
  const {
    data: referralData,
    isLoading: referralLoading,
    isError: referralError,
  } = useReferralLink();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useAffiliateStats();
  const { data: eligibilityData } = useCheckMitraEligibility();
  const { mutate: upgradeToMitra, isPending: isUpgrading } = useUpgradeToMitra();

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData?.referralLink as string);
      alert("Tautan referral berhasil disalin!");
    } catch (error) {
      console.error("Gagal menyalin tautan:", error);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NeuroScan - Temukan Gaya Kognitifmu",
          text: "Ikuti tes gaya kognitif ini dan temukan pola berpikirmu yang unik!",
          url: referralData?.referralLink,
        });
      } catch (error) {
        console.log("Gagal membagikan:", error);
      }
    } else {
      copyReferralLink();
    }
  };

  if (referralLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (referralError || statsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kesalahan Memuat Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Terjadi kesalahan saat memuat dashboard afiliator Anda. Silakan coba
            lagi nanti.
          </p>
          <Button onClick={() => window.location.reload()}>
            Muat Ulang Halaman
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Afiliator
          </h1>
          <p className="text-gray-600">
            Pantau referal dan penghasilan Anda
          </p>
        </div>

        {/* Info Upgrade Mitra (Hanya jika eligible) */}
        {eligibilityData?.eligible && (
          <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl border border-indigo-500/30">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Crown className="w-6 h-6 text-yellow-300" />
                  </div>
                  <span className="bg-yellow-400/20 text-yellow-200 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/30 uppercase tracking-wider shadow-sm">
                    Kesempatan Upgrade
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Selamat! Anda Berhak Menjadi Mitra
                </h3>
                <p className="text-indigo-100 leading-relaxed max-w-2xl text-lg">
                  Salah satu member Anda telah berhasil menjadi Affiliator. 
                  Ini membuka kesempatan bagi Anda untuk upgrade ke level <strong className="text-white">Mitra</strong>. 
                  Nikmati komisi override, kelola tim member, dan potensi penghasilan yang jauh lebih besar!
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => upgradeToMitra()} 
                  disabled={isUpgrading}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 font-bold px-8 py-6 text-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 border-0"
                >
                  {isUpgrading ? 'Memproses...' : 'Upgrade ke Mitra Sekarang'}
                </Button>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
          </div>
        )}

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-10 w-10 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tes Selesai
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.statistics?.totalTests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="h-10 w-10 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Penghasilan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {stats?.balance?.totalEarned?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="h-10 w-10 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Saldo Tersedia
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {stats?.balance?.availableBalance?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-10 w-10 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pembelian Token
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.statistics?.totalTokenPurchaseCommissions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Undangan Grup WhatsApp */}
        <Card className="mb-8 bg-white border border-green-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="h-10 w-10 mr-3"
              />
              <div>
                <h2 className="text-xl font-semibold text-green-800">
                  Bergabunglah dengan Grup WhatsApp Afiliator
                </h2>
                <p className="text-sm text-green-700">
                  Tetap terhubung dan dapatkan update terbaru, tips, serta dukungan.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href="https://chat.whatsapp.com/Eceagjt11Il9dFcDndtWiQ?mode=r_c"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
            >
              Gabung Grup WhatsApp
            </a>
          </CardContent>
        </Card>

        {/* Tautan Referral */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Tautan Referral Anda</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 break-all">
                {referralData?.referralLink}
              </p>
            </div>
            <div className="space-x-3">
              <Button onClick={copyReferralLink}>Salin Tautan</Button>
              <Button onClick={shareReferralLink} variant="outline">
                Bagikan Tautan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Riwayat Komisi */}
        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Riwayat Komisi Terbaru</h2>
          </CardHeader>
          <CardContent>
            {!stats?.recentCommissions ||
            stats.recentCommissions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada komisi
                </h3>
                <p className="text-gray-600 mb-4">
                  Bagikan tautan referral Anda untuk mulai menghasilkan
                </p>
                <Button onClick={shareReferralLink}>Bagikan Tautan Anda</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentCommissions.map((commission: any) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Wallet className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Rp {commission.amount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(commission.createdAt).toLocaleDateString()}{" "}
                          •
                          {commission.source === "test_completion"
                            ? "Penyelesaian Tes"
                            : "Pembelian Token"}
                          {commission.referredUser &&
                            ` • ${commission.referredUser.fullname}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 capitalize text-xs rounded-full ${
                          commission.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : commission.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {commission.status === "paid"
                          ? "dibayar"
                          : commission.status === "pending"
                          ? "menunggu"
                          : commission.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penarikan Terbaru */}
        {stats?.recentWithdraws && stats.recentWithdraws.length > 0 && (
          <Card className="bg-white mt-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Penarikan Terbaru</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentWithdraws.map((withdraw: any) => (
                  <div
                    key={withdraw.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Wallet className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Rp {withdraw.amount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(withdraw.createdAt).toLocaleDateString()}
                          {withdraw.bankName && ` • ${withdraw.bankName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 capitalize text-xs rounded-full ${
                          withdraw.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : withdraw.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : withdraw.status === "processed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {withdraw.status === "completed"
                          ? "selesai"
                          : withdraw.status === "pending"
                          ? "menunggu"
                          : withdraw.status === "processed"
                          ? "diproses"
                          : withdraw.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
