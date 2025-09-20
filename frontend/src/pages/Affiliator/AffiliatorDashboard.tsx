/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TrendingUp, Users, Wallet } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { useAffiliateStats, useReferralLink } from "@/hooks/useAffiliator";

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

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData?.referralLink as string);
      alert("Referral link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NeuroScan - Discover Your Cognitive Style",
          text: "Take this amazing cognitive style test and discover your unique thinking patterns!",
          url: referralData?.referralLink,
        });
      } catch (error) {
        console.log("Error sharing:", error);
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
            Affiliator Dashboard
          </h1>
          <p className="text-gray-600">Track your referrals and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-10 w-10 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tests Completed
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
                    Total Earnings
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
                    Available Balance
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
                    Token Purchases
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.statistics?.totalTokenPurchaseCommissions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Group Invitation */}
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
                  Join Our Affiliator WhatsApp Group
                </h2>
                <p className="text-sm text-green-700">
                  Stay connected and get the latest updates, tips, and support.
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
              Join WhatsApp Group
            </a>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Referral Link</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 break-all">
                {referralData?.referralLink}
              </p>
            </div>
            <div className="space-x-3">
              <Button onClick={copyReferralLink}>Copy Link</Button>
              <Button onClick={shareReferralLink} variant="outline">
                Share Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Commission History</h2>
          </CardHeader>
          <CardContent>
            {!stats?.recentCommissions ||
            stats.recentCommissions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No commissions yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Share your referral link to start earning
                </p>
                <Button onClick={shareReferralLink}>Share Your Link</Button>
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
                            ? "Test Completion"
                            : "Token Purchase"}
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
                        {commission.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Withdrawals */}
        {stats?.recentWithdraws && stats.recentWithdraws.length > 0 && (
          <Card className="bg-white mt-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Withdrawals</h2>
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
                        {withdraw.status}
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
