import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Eye, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useMeQuery } from "@/hooks/useAuthQuery";
import { DashboardQuickActions } from "@/components/ui/DashboardQuickAction";
import { useGetAllTest } from "@/hooks/useThinkingStyleTest";
import ErrorFetch from "@/components/ui/Error";
import { ThinkingStyleResult } from "@/services/api";

export const UserDashboard: React.FC = () => {
  const { data } = useMeQuery();
  const { user } = data || {};
  const [searchQuery, setSearchQuery] = useState("");

  const { data: numerologyResults, isLoading, isError } = useGetAllTest();

  // Additional safety check untuk memastikan data valid
  const isDataReady = !isLoading && numerologyResults !== undefined && user !== undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p>Memuat...</p>
      </div>
    );
  }

  if (isError) {
    return <ErrorFetch />;
  }

  // Safety check - prevent rendering if data is not ready
  if (!isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p>Menyiapkan data dashboard...</p>
      </div>
    );
  }

  const userResults = numerologyResults?.filter((result: ThinkingStyleResult) => result.userId === user?.id) ?? [];

  const filteredResults =
    userResults.filter((result: ThinkingStyleResult) => {
      const searchQueryLower = searchQuery.toLowerCase().trim();
      const fullnameLower = result.fullname.toLowerCase();
      const birthdateFormatted = result.birthdate
        ? new Date(result.birthdate).toLocaleDateString("id-ID")
        : "";

      return (
        fullnameLower.includes(searchQueryLower) ||
        birthdateFormatted.includes(searchQueryLower)
      );
    });

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Info Mitra Card */}
        {user?.parent && user?.parent?.roleId === 4 && (
          <div className="mb-8 relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <UserCheck className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase">
                      Mitra Pendamping
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {user.parent.fullname}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.parent.email}
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto pl-20 sm:pl-0">
                <a
                  href={`mailto:${user.parent.email}`}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm hover:shadow group"
                >
                  <span>Hubungi Mitra</span>
                  <svg className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Info Upgrade Affiliator (Hanya untuk user yang punya Mitra Pendamping) */}
        {user?.parent && user?.roleId === 4 && (
          <div className="mb-8 relative overflow-hidden bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-sm border border-yellow-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wide">
                    Peluang Upgrade
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Dapatkan Akses Affiliator Secara Otomatis!
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Selesaikan <span className="font-semibold text-gray-900">Tes Gaya Kognitif</span> sekarang juga.
                  Setelah tes selesai, akun Anda akan otomatis di-upgrade menjadi <span className="font-semibold text-blue-600">Affiliator</span>.
                  Anda akan mendapatkan akses ke Dashboard Affiliator dan mulai bisa menghasilkan pendapatan tambahan.
                </p>
              </div>
              <div className="shrink-0">
                <Link to="/customer/dashboard/test">
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-200/50 transition-all hover:scale-105">
                    Mulai Tes Sekarang
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative background */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          </div>
        )}

        <DashboardQuickActions
          results={userResults as ThinkingStyleResult[]}
          user={user}
        />
        <Card className="bg-white">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                Riwayat Test
              </h2>
              <input
                type="text"
                placeholder="Cari nama atau tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">Belum ada hasil analisis</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredResults.map((result: ThinkingStyleResult) => {
                  const birthDate = result.birthdate ? new Date(result.birthdate) : null;
                  const isBirthDateValid = birthDate && !isNaN(birthDate.getTime());

                  const createdAt = new Date(result.createdAt);
                  const isCreatedAtValid = !isNaN(createdAt.getTime());

                  return (
                    <div
                      key={result.id}
                      className="p-6 rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-gray-900">
                            {result.fullname || 'Pengguna'}
                          </h3>
                          {isBirthDateValid && birthDate && (
                            <p className="text-sm text-gray-600">
                              Lahir: {birthDate.toLocaleDateString("id-ID")}
                            </p>
                          )}
                          {isCreatedAtValid && (
                            <p className="text-sm text-gray-600">
                              Analisis: {createdAt.toLocaleDateString("id-ID")}
                            </p>
                          )}

                          <div className="mt-3">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {result.thinkingStyle.type}
                            </span>
                            <p className="mt-2 text-gray-700 text-sm">
                              {result.thinkingStyle.description}
                            </p>
                            <p className="mt-1 text-gray-500 text-xs italic">
                              Teori: {result.thinkingStyle.theory}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={result.testType === 'DISC' ? '/customer/dashboard/disc-result' : String(result.testType) === 'Graphology' ? '/customer/dashboard/graphology-result' : '/customer/dashboard/test/result'}
                          state={
                            result.testType === 'DISC' ? { result: result } : 
                            result.testType === 'THINKING_STYLE' || String(result.testType) === 'CST' ? { testResult: result, fromFingerprint: true } : 
                            undefined
                          }
                          className="mt-4 md:mt-0"
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
