import React from "react";
import { Users, Wallet, TrendingUp, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMitraStats } from "@/hooks/useMitra";
import { useReferralLink } from "@/hooks/useAffiliator";
import { Button } from "@/components/ui/button";
import formatCurrency from "@/utils/formatCurrency";

export const MitraDashboard: React.FC = () => {
  const { data: stats, isLoading, isError } = useMitraStats();
  const {
    data: referralData,
    isLoading: referralLoading,
  } = useReferralLink();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gagal Memuat Dashboard
          </h2>
          <p className="text-gray-600">Silakan coba lagi nanti.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Mitra
        </h1>
        <p className="text-gray-600">
          Monitor performa group dan komisi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-10 w-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Affiliator</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalAffiliators || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wallet className="h-10 w-10 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalCommission || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tautan Referral */}
      {!referralLoading && referralData?.referralLink && (
        <Card className="mb-8 bg-white border border-purple-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <Share2 className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Tautan Referral Anda
                </h2>
                <p className="text-sm text-gray-600">
                  Bagikan tautan ini untuk mengajak teman dan keluarga
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-linear-to-r from-purple-50 to-indigo-50 p-4 rounded-lg mb-4 border border-purple-100">
              <p className="text-sm text-gray-700 break-all font-mono">
                {referralData.referralLink}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={copyReferralLink} className="flex-1 sm:flex-none">
                Salin Tautan
              </Button>
              <Button onClick={shareReferralLink} variant="outline" className="flex-1 sm:flex-none">
                Bagikan Tautan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Aktivitas Komisi Terbaru</h2>
        {stats?.recentCommissions && stats.recentCommissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dari Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentCommissions.map((commission: any) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.source === 'token_purchase' ? 'Pembelian Token' : 'Tes Kognitif'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commission.referredUser?.fullname || commission.referredUser?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(commission.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Belum ada aktivitas komisi.</p>
        )}
      </div>
    </div>
  );
};
